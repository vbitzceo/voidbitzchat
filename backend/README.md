# VoidBitz Chat API

ASP.NET Core Web API backend for the VoidBitz Chat application.

## ⚠️ **CRITICAL SECURITY WARNING**

**This API currently has NO USER AUTHENTICATION implemented.**

- All endpoints return data for ALL users
- Any client can access any chat session
- The `GetUserId()` method in `ChatController` returns `null`
- This creates a **MAJOR SECURITY VULNERABILITY**

**DO NOT deploy to production without implementing proper user authentication.**

## Features

- **Chat Management**: Create, retrieve, update, and delete chat sessions with custom titles
- **Session Naming**: Full CRUD operations for session titles and organization
- **Message Processing**: Send messages and receive AI-powered responses
- **Persistence**: Entity Framework Core with SQL Server for chat history
- **AI Integration**: Azure OpenAI integration via Semantic Kernel
- **Logging**: Serilog for structured logging
- **API Documentation**: Swagger/OpenAPI documentation

## API Endpoints

### Chat Sessions

| Method | Endpoint | Description | ⚠️ Security Issue |
|--------|----------|-------------|-------------------|
| GET | `/api/chat/sessions` | Get all chat sessions | **Returns ALL users' sessions** |
| POST | `/api/chat/sessions` | Create new session | **No user ownership** |
| GET | `/api/chat/sessions/{id}` | Get specific session | **Any user can access any session** |
| PUT | `/api/chat/sessions/{id}` | Update session title | **Any user can modify any session** |
| DELETE | `/api/chat/sessions/{id}` | Delete session | **Any user can delete any session** |

### Chat Messages

| Method | Endpoint | Description | ⚠️ Security Issue |
|--------|----------|-------------|-------------------|
| POST | `/api/chat/sessions/{id}/messages` | Send message | **No user validation** |

## Quick Start

```bash
# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7061`
- HTTP: `http://localhost:5027`
- Swagger UI: `https://localhost:7061/swagger`

## Configuration

Update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=VoidBitzChatDb;Trusted_Connection=true;MultipleActiveResultSets=true;"
  },
  "AzureOpenAI": {
    "Endpoint": "https://your-instance.openai.azure.com/",
    "DeploymentName": "gpt-4o",
    "ApiKey": "your-api-key"
  }
}
```

## Project Structure

- **Controllers/**: API endpoints and request handling
- **Data/**: Entity Framework DbContext and database configuration
- **Models/**: Entity models and Data Transfer Objects (DTOs)
- **Services/**: Business logic, repository pattern, and AI integration
- **Migrations/**: Entity Framework database migrations

## Testing

Use the included `VoidBitzChat.Api.http` file with VS Code REST Client extension to test the API endpoints.

### Example API Usage

1. **Create a named chat session:**
   ```http
   POST /api/chat/sessions
   Content-Type: application/json
   
   {
     "title": "Planning Weekend Trip"
   }
   ```

2. **Rename an existing chat:**
   ```http
   PUT /api/chat/sessions/{sessionId}
   Content-Type: application/json
   
   {
     "title": "Updated Chat Title"
   }
   ```

3. **Send a message:**
   ```http
   POST /api/chat/sessions/{sessionId}/messages
   Content-Type: application/json
   
   {
     "sessionId": "{sessionId}",
     "message": "Hello! How are you today?"
   }
   ```

## Security Implementation Required

### Current Issue

The `GetUserId()` method in `ChatController.cs` currently returns `null`:

```csharp
private string? GetUserId()
{
    // TODO: Implement proper user identification
    return null; // ⚠️ THIS IS THE PROBLEM
}
```

### Quick Fix Options

1. **Session-based (Development)**:
```csharp
private string GetUserId() => HttpContext.Session.Id;
```

2. **Cookie-based (Recommended)**:
```csharp
private string GetUserId()
{
    const string USER_ID_COOKIE = "voidbitz_user_id";
    if (Request.Cookies.TryGetValue(USER_ID_COOKIE, out var userId))
        return userId;
    
    var newUserId = Guid.NewGuid().ToString();
    Response.Cookies.Append(USER_ID_COOKIE, newUserId, new CookieOptions
    {
        Expires = DateTimeOffset.UtcNow.AddYears(1),
        HttpOnly = true,
        Secure = true
    });
    return newUserId;
}
```

3. **JWT Authentication (Production)**:
```csharp
private string? GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

## Database Schema

The database is already prepared for user isolation:
- `ChatSessions` table has `UserId` column
- All repository methods support user filtering
- Only the controller's `GetUserId()` method needs implementation
