using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Serilog;
using VoidBitzChat.Api.Data;
using VoidBitzChat.Api.Services;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/voidbitzchat-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Use Serilog for logging
builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "VoidBitz Chat API", Version = "v1" });
    
    // Include XML comments if the file exists
    var xmlFile = "VoidBitzChat.Api.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, true);
    }
});

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=VoidBitzChatDb;Trusted_Connection=true;MultipleActiveResultSets=true";

builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    }));

// Register application services
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IChatService, ChatService>();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000") // Next.js default ports
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ChatDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VoidBitz Chat API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger at root
    });
}

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    try
    {
        context.Database.EnsureCreated();
        
        // Seed default model deployments if none exist
        if (!context.ModelDeployments.Any())
        {
            var azureOpenAIEndpoint = builder.Configuration["AzureOpenAI:Endpoint"];
            var azureOpenAIKey = builder.Configuration["AzureOpenAI:ApiKey"];
            
            if (!string.IsNullOrEmpty(azureOpenAIEndpoint) && !string.IsNullOrEmpty(azureOpenAIKey))
            {
                var defaultDeployments = new[]
                {                    new VoidBitzChat.Api.Models.ModelDeployment
                    {
                        Name = "gpt-4o",
                        DeploymentName = "gpt-4o", // Hardcoded - no need for config fallback
                        Endpoint = azureOpenAIEndpoint,
                        ApiKey = azureOpenAIKey,
                        ModelType = "gpt-4o",
                        Description = "gpt-4o model for advanced responses",
                        IsActive = true,
                        IsDefault = true
                    },
                    new VoidBitzChat.Api.Models.ModelDeployment
                    {
                        Name = "gpt-35-turbo",
                        DeploymentName = "gpt-35-turbo",
                        Endpoint = azureOpenAIEndpoint,
                        ApiKey = azureOpenAIKey,
                        ModelType = "gpt-35-turbo",
                        Description = "gpt-35-turbo model for cost-effective responses",
                        IsActive = true,
                        IsDefault = false
                    },
                    new VoidBitzChat.Api.Models.ModelDeployment
                    {
                        Name = "phi-3",
                        DeploymentName = "phi-3",
                        Endpoint = azureOpenAIEndpoint,
                        ApiKey = azureOpenAIKey,
                        ModelType = "phi-3",
                        Description = "phi-3 model",
                        IsActive = true,
                        IsDefault = false
                    }
                };
                
                context.ModelDeployments.AddRange(defaultDeployments);
                context.SaveChanges();
                Log.Information("Seeded {Count} default model deployments", defaultDeployments.Length);
            }
            else
            {
                Log.Warning("Azure OpenAI configuration not found, skipping model deployment seeding");
            }
        }
        
        Log.Information("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error initializing database");
        throw;
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseRouting();
app.MapControllers();
app.MapHealthChecks("/health");

// Add a simple endpoint to test the API
app.MapGet("/api/status", () => new { 
    Status = "Healthy", 
    Timestamp = DateTime.UtcNow,
    Version = "1.0.0"
})
.WithName("GetStatus")
.WithOpenApi();

Log.Information("VoidBitz Chat API starting up...");

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
