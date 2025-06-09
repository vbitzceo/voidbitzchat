using System.ComponentModel.DataAnnotations;

namespace VoidBitzChat.Api.Models;

/// <summary>
/// Represents an AI model deployment configuration
/// </summary>
public class ModelDeployment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string DeploymentName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string Endpoint { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string ApiKey { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string ModelType { get; set; } = "gpt-4"; // e.g., "gpt-4", "gpt-3.5-turbo", etc.
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool IsDefault { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
}
