namespace VoidBitzChat.Api.Models.DTOs;

/// <summary>
/// Request DTO for sending a chat message
/// </summary>
public class ChatMessageRequest
{
    public Guid SessionId { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for chat messages
/// </summary>
public class ChatMessageResponse
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int TokenCount { get; set; }
}

/// <summary>
/// Request DTO for creating a new chat session
/// </summary>
public class CreateSessionRequest
{
    public string Title { get; set; } = string.Empty;
    public Guid? ModelDeploymentId { get; set; }
}

/// <summary>
/// Request DTO for updating a chat session
/// </summary>
public class UpdateSessionRequest
{
    public string Title { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for chat sessions
/// </summary>
public class ChatSessionResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int MessageCount { get; set; }
    public string? LastMessage { get; set; }
    public Guid? ModelDeploymentId { get; set; }
    public string? ModelDeploymentName { get; set; }
}

/// <summary>
/// Detailed session response including messages
/// </summary>
public class ChatSessionDetailResponse : ChatSessionResponse
{
    public List<ChatMessageResponse> Messages { get; set; } = new();
}

/// <summary>
/// Response DTO for model deployments
/// </summary>
public class ModelDeploymentResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
}
