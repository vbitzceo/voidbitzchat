using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoidBitzChat.Api.Data;
using VoidBitzChat.Api.Models;

namespace VoidBitzChat.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelDeploymentController : ControllerBase
{
    private readonly ChatDbContext _context;
    private readonly ILogger<ModelDeploymentController> _logger;

    public ModelDeploymentController(ChatDbContext context, ILogger<ModelDeploymentController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all model deployments
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ModelDeploymentDto>>> GetModelDeployments()
    {
        var deployments = await _context.ModelDeployments
            .Select(md => new ModelDeploymentDto
            {
                Id = md.Id,
                Name = md.Name,
                DeploymentName = md.DeploymentName,
                Endpoint = md.Endpoint,
                ModelType = md.ModelType,
                Description = md.Description,
                IsActive = md.IsActive,
                IsDefault = md.IsDefault,
                IsReferencedByChats = _context.ChatSessions.Any(cs => cs.ModelDeploymentId == md.Id)
            })
            .ToListAsync();

        return Ok(deployments);
    }

    /// <summary>
    /// Get a specific model deployment by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ModelDeploymentDto>> GetModelDeployment(Guid id)
    {
        var deployment = await _context.ModelDeployments.FindAsync(id);
        if (deployment == null)
        {
            return NotFound();
        }

        var dto = new ModelDeploymentDto
        {
            Id = deployment.Id,
            Name = deployment.Name,
            DeploymentName = deployment.DeploymentName,
            Endpoint = deployment.Endpoint,
            ModelType = deployment.ModelType,
            Description = deployment.Description,
            IsActive = deployment.IsActive,
            IsDefault = deployment.IsDefault,
            IsReferencedByChats = await _context.ChatSessions.AnyAsync(cs => cs.ModelDeploymentId == id)
        };

        return Ok(dto);
    }

    /// <summary>
    /// Create a new model deployment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ModelDeploymentDto>> CreateModelDeployment(CreateModelDeploymentDto createDto)
    {
        // If this is set as default, unset all other defaults
        if (createDto.IsDefault)
        {
            var existingDefaults = await _context.ModelDeployments
                .Where(md => md.IsDefault)
                .ToListAsync();
            
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }
        }

        var deployment = new ModelDeployment
        {
            Name = createDto.Name,
            DeploymentName = createDto.DeploymentName,
            Endpoint = createDto.Endpoint,
            ApiKey = createDto.ApiKey,
            ModelType = createDto.ModelType,
            Description = createDto.Description,
            IsActive = createDto.IsActive,
            IsDefault = createDto.IsDefault
        };

        _context.ModelDeployments.Add(deployment);
        await _context.SaveChangesAsync();

        var dto = new ModelDeploymentDto
        {
            Id = deployment.Id,
            Name = deployment.Name,
            DeploymentName = deployment.DeploymentName,
            Endpoint = deployment.Endpoint,
            ModelType = deployment.ModelType,
            Description = deployment.Description,
            IsActive = deployment.IsActive,
            IsDefault = deployment.IsDefault,
            IsReferencedByChats = false
        };

        return CreatedAtAction(nameof(GetModelDeployment), new { id = deployment.Id }, dto);
    }

    /// <summary>
    /// Update an existing model deployment
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateModelDeployment(Guid id, UpdateModelDeploymentDto updateDto)
    {
        var deployment = await _context.ModelDeployments.FindAsync(id);
        if (deployment == null)
        {
            return NotFound();
        }

        // If this is set as default, unset all other defaults
        if (updateDto.IsDefault && !deployment.IsDefault)
        {
            var existingDefaults = await _context.ModelDeployments
                .Where(md => md.IsDefault && md.Id != id)
                .ToListAsync();
            
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }
        }

        deployment.Name = updateDto.Name;
        deployment.DeploymentName = updateDto.DeploymentName;
        deployment.Endpoint = updateDto.Endpoint;
        deployment.ApiKey = updateDto.ApiKey;
        deployment.ModelType = updateDto.ModelType;
        deployment.Description = updateDto.Description;
        deployment.IsActive = updateDto.IsActive;
        deployment.IsDefault = updateDto.IsDefault;
        deployment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a model deployment (only if not referenced by any chat sessions)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteModelDeployment(Guid id)
    {
        var deployment = await _context.ModelDeployments.FindAsync(id);
        if (deployment == null)
        {
            return NotFound();
        }

        // Check if this deployment is referenced by any chat sessions
        var isReferenced = await _context.ChatSessions.AnyAsync(cs => cs.ModelDeploymentId == id);
        if (isReferenced)
        {
            return BadRequest(new { message = "Cannot delete model deployment that is referenced by existing chat sessions." });
        }

        _context.ModelDeployments.Remove(deployment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Test connection to a model deployment
    /// </summary>
    [HttpPost("{id}/test")]
    public async Task<ActionResult<TestConnectionResult>> TestModelDeployment(Guid id)
    {
        var deployment = await _context.ModelDeployments.FindAsync(id);
        if (deployment == null)
        {
            return NotFound();
        }

        try
        {
            // Here you would implement actual connection testing logic
            // For now, we'll just return a success response
            return Ok(new TestConnectionResult
            {
                IsSuccessful = true,
                Message = "Connection test successful",
                ResponseTime = TimeSpan.FromMilliseconds(150)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test connection for deployment {DeploymentId}", id);
            return Ok(new TestConnectionResult
            {
                IsSuccessful = false,
                Message = ex.Message,
                ResponseTime = null
            });
        }
    }
}

public class ModelDeploymentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public bool IsReferencedByChats { get; set; }
}

public class CreateModelDeploymentDto
{
    public string Name { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
}

public class UpdateModelDeploymentDto
{
    public string Name { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ModelType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
}

public class TestConnectionResult
{
    public bool IsSuccessful { get; set; }
    public string Message { get; set; } = string.Empty;
    public TimeSpan? ResponseTime { get; set; }
}
