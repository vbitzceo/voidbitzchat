using Microsoft.EntityFrameworkCore;
using VoidBitzChat.Api.Data;
using VoidBitzChat.Api.Models;

namespace VoidBitzChat.Api.Services;

/// <summary>
/// Repository interface for chat data operations
/// </summary>
public interface IChatRepository
{
    Task<ChatSession?> GetSessionWithMessagesAsync(Guid sessionId, string? userId = null);
    Task<List<ChatSession>> GetUserSessionsAsync(string? userId = null);
    Task<ChatSession> CreateSessionAsync(ChatSession session);
    Task<ChatMessage> AddMessageAsync(ChatMessage message);
    Task UpdateSessionTimestampAsync(Guid sessionId);
    Task<bool> DeleteSessionAsync(Guid sessionId, string? userId = null);
    Task<bool> UpdateSessionAsync(Guid sessionId, string title, string? userId = null);
    Task<List<ModelDeployment>> GetActiveModelDeploymentsAsync();
    Task<ModelDeployment?> GetModelDeploymentAsync(Guid deploymentId);
    Task<ModelDeployment?> GetDefaultModelDeploymentAsync();
}

/// <summary>
/// Repository implementation for chat data operations using Entity Framework
/// </summary>
public class ChatRepository : IChatRepository
{
    private readonly ChatDbContext _context;
    private readonly ILogger<ChatRepository> _logger;

    public ChatRepository(ChatDbContext context, ILogger<ChatRepository> logger)
    {
        _context = context;
        _logger = logger;
    }    public async Task<ChatSession?> GetSessionWithMessagesAsync(Guid sessionId, string? userId = null)
    {
        try
        {
            var query = _context.ChatSessions
                .Include(s => s.Messages)
                .Include(s => s.ModelDeployment)
                .Where(s => s.Id == sessionId);

            // If userId is provided, filter by user
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(s => s.UserId == userId);
            }

            return await query.FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving session {SessionId} for user {UserId}", sessionId, userId);
            throw;
        }
    }    public async Task<List<ChatSession>> GetUserSessionsAsync(string? userId = null)
    {
        try
        {
            var query = _context.ChatSessions
                .Include(s => s.Messages)
                .Include(s => s.ModelDeployment)
                .AsQueryable();

            // If userId is provided, filter by user
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(s => s.UserId == userId);
            }

            return await query
                .OrderByDescending(s => s.UpdatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sessions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<ChatSession> CreateSessionAsync(ChatSession session)
    {
        try
        {
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Created new chat session {SessionId}", session.Id);
            return session;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chat session");
            throw;
        }
    }

    public async Task<ChatMessage> AddMessageAsync(ChatMessage message)
    {
        try
        {
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();
            
            _logger.LogDebug("Added message {MessageId} to session {SessionId}", message.Id, message.SessionId);
            return message;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding message to session {SessionId}", message.SessionId);
            throw;
        }
    }

    public async Task UpdateSessionTimestampAsync(Guid sessionId)
    {
        try
        {
            var session = await _context.ChatSessions.FindAsync(sessionId);
            if (session != null)
            {
                session.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating timestamp for session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<bool> DeleteSessionAsync(Guid sessionId, string? userId = null)
    {
        try
        {
            var query = _context.ChatSessions.Where(s => s.Id == sessionId);

            // If userId is provided, ensure user owns the session
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(s => s.UserId == userId);
            }

            var session = await query.FirstOrDefaultAsync();
            if (session == null)
            {
                return false;
            }

            _context.ChatSessions.Remove(session);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Deleted chat session {SessionId}", sessionId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<bool> UpdateSessionAsync(Guid sessionId, string title, string? userId = null)
    {
        try
        {
            var query = _context.ChatSessions.Where(s => s.Id == sessionId);

            // If userId is provided, ensure user owns the session
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(s => s.UserId == userId);
            }

            var session = await query.FirstOrDefaultAsync();
            if (session == null)
            {
                return false;
            }

            session.Title = string.IsNullOrWhiteSpace(title) ? "Untitled Chat" : title;
            session.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
              _logger.LogInformation("Updated chat session {SessionId} title to '{Title}'", sessionId, title);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<List<ModelDeployment>> GetActiveModelDeploymentsAsync()
    {
        try
        {
            return await _context.ModelDeployments
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active model deployments");
            throw;
        }
    }

    public async Task<ModelDeployment?> GetModelDeploymentAsync(Guid deploymentId)
    {
        try
        {
            return await _context.ModelDeployments
                .Where(d => d.Id == deploymentId && d.IsActive)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving model deployment {DeploymentId}", deploymentId);
            throw;
        }
    }

    public async Task<ModelDeployment?> GetDefaultModelDeploymentAsync()
    {
        try
        {
            return await _context.ModelDeployments
                .Where(d => d.IsDefault && d.IsActive)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving default model deployment");
            throw;
        }
    }
}
