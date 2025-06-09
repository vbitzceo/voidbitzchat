using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
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
    Task<ChatSessionResponse> CreateSessionAsync(string title, string? userId = null);
    Task<bool> DeleteSessionAsync(Guid sessionId, string? userId = null);
    Task<ChatSessionResponse?> UpdateSessionAsync(Guid sessionId, string title, string? userId = null);
}

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly Kernel _kernel;
    private readonly ILogger<ChatService> _logger;
    private readonly IChatCompletionService _chatCompletion;

    public ChatService(
        IChatRepository chatRepository,
        Kernel kernel,
        ILogger<ChatService> logger)
    {
        _chatRepository = chatRepository;
        _kernel = kernel;
        _logger = logger;
        _chatCompletion = kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<ChatMessageResponse> SendMessageAsync(Guid sessionId, string userMessage, string? userId = null)
    {
        try
        {
            _logger.LogInformation("Processing chat message for session {SessionId}", sessionId);

            // Get session with message history
            var session = await _chatRepository.GetSessionWithMessagesAsync(sessionId, userId);
            if (session == null)
            {
                throw new ArgumentException($"Session {sessionId} not found or access denied");
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

            // Get AI response using Semantic Kernel
            var response = await _chatCompletion.GetChatMessageContentAsync(
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

            _logger.LogInformation("Successfully processed chat message for session {SessionId}", sessionId);

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
    }

    public async Task<List<ChatSessionResponse>> GetUserSessionsAsync(string? userId = null)
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
                .FirstOrDefault()?.Content
        }).ToList();
    }

    public async Task<ChatSessionDetailResponse?> GetSessionAsync(Guid sessionId, string? userId = null)
    {
        var session = await _chatRepository.GetSessionWithMessagesAsync(sessionId, userId);
        if (session == null) return null;

        return new ChatSessionDetailResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = session.Messages.Count,
            LastMessage = session.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault()?.Content,
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
    }

    public async Task<ChatSessionResponse> CreateSessionAsync(string title, string? userId = null)
    {
        var session = new ChatSession
        {
            Title = string.IsNullOrWhiteSpace(title) ? "New Chat" : title,
            UserId = userId
        };

        await _chatRepository.CreateSessionAsync(session);

        return new ChatSessionResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = 0
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
        }

        return new ChatSessionResponse
        {
            Id = session.Id,
            Title = session.Title,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            MessageCount = session.Messages.Count,
            LastMessage = session.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault()?.Content
        };
    }

    private static int EstimateTokenCount(string text)
    {
        // Simple token estimation: roughly 1 token per 4 characters
        // This is a rough estimate; for production, use actual tokenization
        return (int)Math.Ceiling(text.Length / 4.0);
    }
}
