using Microsoft.AspNetCore.Mvc;
using VoidBitzChat.Api.Models.DTOs;
using VoidBitzChat.Api.Services;

namespace VoidBitzChat.Api.Controllers;

/// <summary>
/// Controller for chat operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    /// <summary>
    /// Get all chat sessions for the current user
    /// </summary>
    [HttpGet("sessions")]
    public async Task<ActionResult<List<ChatSessionResponse>>> GetSessions()
    {
        try
        {
            var userId = GetCurrentUserId();
            var sessions = await _chatService.GetUserSessionsAsync(userId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat sessions");
            return StatusCode(500, "An error occurred while retrieving chat sessions");
        }
    }

    /// <summary>
    /// Get a specific chat session with all messages
    /// </summary>
    [HttpGet("sessions/{sessionId:guid}")]
    public async Task<ActionResult<ChatSessionDetailResponse>> GetSession(Guid sessionId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var session = await _chatService.GetSessionAsync(sessionId, userId);
            
            if (session == null)
            {
                return NotFound($"Session {sessionId} not found");
            }

            return Ok(session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat session {SessionId}", sessionId);
            return StatusCode(500, "An error occurred while retrieving the chat session");
        }
    }

    /// <summary>
    /// Create a new chat session
    /// </summary>
    [HttpPost("sessions")]
    public async Task<ActionResult<ChatSessionResponse>> CreateSession([FromBody] CreateSessionRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Session title is required");
            }

            var userId = GetCurrentUserId();
            var session = await _chatService.CreateSessionAsync(request.Title, userId);
            
            return CreatedAtAction(
                nameof(GetSession),
                new { sessionId = session.Id },
                session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chat session");
            return StatusCode(500, "An error occurred while creating the chat session");
        }
    }

    /// <summary>
    /// Send a message to a chat session and get AI response
    /// </summary>
    [HttpPost("sessions/{sessionId:guid}/messages")]
    public async Task<ActionResult<ChatMessageResponse>> SendMessage(
        Guid sessionId, 
        [FromBody] ChatMessageRequest request)
    {
        try
        {
            if (request.SessionId != sessionId)
            {
                return BadRequest("Session ID mismatch");
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message content is required");
            }

            var userId = GetCurrentUserId();
            var response = await _chatService.SendMessageAsync(sessionId, request.Message, userId);
            
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for session {SessionId}", sessionId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to session {SessionId}", sessionId);
            return StatusCode(500, "An error occurred while processing your message");
        }
    }

    /// <summary>
    /// Delete a chat session
    /// </summary>
    [HttpDelete("sessions/{sessionId:guid}")]
    public async Task<ActionResult> DeleteSession(Guid sessionId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var deleted = await _chatService.DeleteSessionAsync(sessionId, userId);
            
            if (!deleted)
            {
                return NotFound($"Session {sessionId} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting chat session {SessionId}", sessionId);
            return StatusCode(500, "An error occurred while deleting the chat session");
        }
    }

    /// <summary>
    /// Get current user ID (placeholder for authentication)
    /// In a real application, this would extract the user ID from JWT token or other auth mechanism
    /// </summary>
    private string? GetCurrentUserId()
    {
        // For demo purposes, return a default user ID
        // In production, extract from JWT token or authentication context
        return "demo-user";
        
        // Example for JWT token:
        // return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
