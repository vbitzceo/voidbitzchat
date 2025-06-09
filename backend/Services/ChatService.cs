using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Azure.AI.OpenAI;
using VoidBitzChat.Api.Models;
using VoidBitzChat.Api.Models.DTOs;

namespace VoidBitzChat.Api.Services;

/// <summary>
/// Service for handling chat operations with Semantic Kernel and Azure OpenAI
/// </summary>
public interface IChatService
{
    Task<ChatMessageResponse> SendMessageAsync(Guid sessionId, string userMessage, string? userId = null);
    Task<List<ChatSessionResponse>> GetUserSessionsAsync(string? userId = null);
    Task<ChatSessionDetailResponse?> GetSessionAsync(Guid sessionId, string? userId = null);
    Task<ChatSessionResponse> CreateSessionAsync(string title, Guid? modelDeploymentId, string? userId = null);
    Task<bool> DeleteSessionAsync(Guid sessionId, string? userId = null);
    Task<ChatSessionResponse?> UpdateSessionAsync(Guid sessionId, string title, string? userId = null);
    Task<List<ModelDeploymentResponse>> GetActiveModelDeploymentsAsync();
}

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        IChatRepository chatRepository,
        ILogger<ChatService> logger)
    {
        _chatRepository = chatRepository;
        _logger = logger;
    }    public async Task<ChatMessageResponse> SendMessageAsync(Guid sessionId, string userMessage, string? userId = null)
    {
        try
        {
            _logger.LogInformation("Processing chat message for session {SessionId}", sessionId);

            // Get session with message history and model deployment
            var session = await _chatRepository.GetSessionWithMessagesAsync(sessionId, userId);
            if (session == null)
            {
                throw new ArgumentException($"Session {sessionId} not found or access denied");
            }

            // Get model deployment or use default
            var modelDeployment = session.ModelDeployment;
            if (modelDeployment == null)
            {
                modelDeployment = await _chatRepository.GetDefaultModelDeploymentAsync();
                if (modelDeployment == null)
                {
                    throw new InvalidOperationException("No model deployment available for this session");
                }
            }

            // Save user message
            var userChatMessage = new ChatMessage
            {
                SessionId = sessionId,
                Content = userMessage,
                Role = "user",
                UserId = userId,
                TokenCount = EstimateTokenCount(userMessage)
            };

            await _chatRepository.AddMessageAsync(userChatMessage);

            // Create a kernel with the specific model deployment
            var kernelBuilder = Kernel.CreateBuilder();
            kernelBuilder.AddAzureOpenAIChatCompletion(
                deploymentName: modelDeployment.DeploymentName,
                endpoint: modelDeployment.Endpoint,
                apiKey: modelDeployment.ApiKey);

            var kernel = kernelBuilder.Build();
            var chatCompletion = kernel.GetRequiredService<IChatCompletionService>();

            // Build chat history for context
            var chatHistory = new ChatHistory();
            
            // Add system message for context
            chatHistory.AddSystemMessage("You are a helpful AI assistant. Provide accurate, helpful, and engaging responses.");

            // Add conversation history (limit to last 20 messages for context management)
            var recentMessages = session.Messages
                .OrderBy(m => m.Timestamp)
                .TakeLast(19) // 19 + new user message = 20 total
                .ToList();

            foreach (var msg in recentMessages)
            {
                if (msg.Role == "user")
                    chatHistory.AddUserMessage(msg.Content);
                else if (msg.Role == "assistant")
                    chatHistory.AddAssistantMessage(msg.Content);
            }

            // Add the new user message
            chatHistory.AddUserMessage(userMessage);

            // Get AI response using the specific model deployment
            var response = await chatCompletion.GetChatMessageContentAsync(
                chatHistory,
                executionSettings: new OpenAIPromptExecutionSettings
                {
                    MaxTokens = 1000,
                    Temperature = 0.7,
                    TopP = 0.9
                });

            var assistantMessage = response.Content ?? "I apologize, but I couldn't generate a response.";

            // Save assistant message
            var assistantChatMessage = new ChatMessage
            {
                SessionId = sessionId,
                Content = assistantMessage,
                Role = "assistant",
                UserId = userId,
                TokenCount = EstimateTokenCount(assistantMessage)
            };

            await _chatRepository.AddMessageAsync(assistantChatMessage);

            // Update session timestamp
            await _chatRepository.UpdateSessionTimestampAsync(sessionId);

            _logger.LogInformation("Successfully processed chat message for session {SessionId} using model {ModelName}", 
                sessionId, modelDeployment.Name);

            return new ChatMessageResponse
            {
                Id = assistantChatMessage.Id,
                SessionId = sessionId,
                Content = assistantMessage,
                Role = "assistant",
                Timestamp = assistantChatMessage.Timestamp,
                TokenCount = assistantChatMessage.TokenCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message for session {SessionId}", sessionId);
            throw;
        }
    }    public async Task<List<ChatSessionResponse>> GetUserSessionsAsync(string? userId = null)
    {
        var sessions = await _chatRepository.GetUserSessionsAsync(userId);
        
        return sessions.Select(s => new ChatSessionResponse
        {
            Id = s.Id,
            Title = s.Title,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
            MessageCount = s.Messages.Count,
            LastMessage = s.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault()?.Content,
            ModelDeploymentId = s.ModelDeploymentId,
            ModelDeploymentName = s.ModelDeployment?.Name
        }).ToList();
    }

    public async Task<ChatSessionDetailResponse?> GetSessionAsync(Guid sessionId, string? userId = null)
    {
        var session = await _chatRepository.GetSessionWithMessagesAsync(sessionId, userId);
        if (session == null) return null;        return new ChatSessionDetailResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = session.Messages.Count,
            LastMessage = session.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault()?.Content,
            ModelDeploymentId = session.ModelDeploymentId,
            ModelDeploymentName = session.ModelDeployment?.Name,
            Messages = session.Messages
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessageResponse
                {
                    Id = m.Id,
                    SessionId = m.SessionId,
                    Content = m.Content,
                    Role = m.Role,
                    Timestamp = m.Timestamp,
                    TokenCount = m.TokenCount
                }).ToList()
        };
    }    public async Task<ChatSessionResponse> CreateSessionAsync(string title, Guid? modelDeploymentId, string? userId = null)
    {
        // If no model deployment specified, use the default
        if (modelDeploymentId == null)
        {
            var defaultDeployment = await _chatRepository.GetDefaultModelDeploymentAsync();
            modelDeploymentId = defaultDeployment?.Id;
        }
        
        var session = new ChatSession
        {
            Title = string.IsNullOrWhiteSpace(title) ? "New Chat" : title,
            UserId = userId,
            ModelDeploymentId = modelDeploymentId
        };

        await _chatRepository.CreateSessionAsync(session);

        // Load the model deployment for response
        var modelDeployment = modelDeploymentId.HasValue 
            ? await _chatRepository.GetModelDeploymentAsync(modelDeploymentId.Value) 
            : null;

        return new ChatSessionResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = 0,
            ModelDeploymentId = session.ModelDeploymentId,
            ModelDeploymentName = modelDeployment?.Name
        };
    }

    public async Task<bool> DeleteSessionAsync(Guid sessionId, string? userId = null)
    {
        return await _chatRepository.DeleteSessionAsync(sessionId, userId);
    }

    public async Task<ChatSessionResponse?> UpdateSessionAsync(Guid sessionId, string title, string? userId = null)
    {
        var updated = await _chatRepository.UpdateSessionAsync(sessionId, title, userId);
        if (!updated)
        {
            return null;
        }

        // Return the updated session
        var session = await _chatRepository.GetSessionWithMessagesAsync(sessionId, userId);
        if (session == null)
        {
            return null;
        }        return new ChatSessionResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = session.Messages.Count,
            LastMessage = session.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault()?.Content,
            ModelDeploymentId = session.ModelDeploymentId,
            ModelDeploymentName = session.ModelDeployment?.Name
        };
    }

    public async Task<List<ModelDeploymentResponse>> GetActiveModelDeploymentsAsync()
    {
        var deployments = await _chatRepository.GetActiveModelDeploymentsAsync();
        
        return deployments.Select(d => new ModelDeploymentResponse
        {
            Id = d.Id,
            Name = d.Name,
            ModelType = d.ModelType,
            Description = d.Description,
            IsActive = d.IsActive,
            IsDefault = d.IsDefault
        }).ToList();
    }

    private static int EstimateTokenCount(string text)
    {
        // Simple token estimation: roughly 1 token per 4 characters
        // This is a rough estimate; for production, use actual tokenization
        return (int)Math.Ceiling(text.Length / 4.0);
    }
}
