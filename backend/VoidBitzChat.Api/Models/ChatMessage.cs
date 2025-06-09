using System.ComponentModel.DataAnnotations;

namespace VoidBitzChat.Api.Models;

/// <summary>
/// Represents a single message in a chat conversation
/// </summary>
public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SessionId { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public int TokenCount { get; set; }
    
    [StringLength(50)]
    public string? UserId { get; set; }
    
    // Navigation property
    public virtual ChatSession Session { get; set; } = null!;
}
