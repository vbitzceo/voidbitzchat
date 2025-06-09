using System.ComponentModel.DataAnnotations;

namespace VoidBitzChat.Api.Models;

/// <summary>
/// Represents a chat session containing multiple messages
/// </summary>
public class ChatSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(50)]
    public string? UserId { get; set; }
    
    // Navigation property
    public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
