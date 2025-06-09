# VoidBitz Chat API

ASP.NET Core Web API backend for the VoidBitz Chat application.

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
- `GET /api/chat/sessions` - Get all user sessions
- `POST /api/chat/sessions` - Create a new session with custom title
- `GET /api/chat/sessions/{id}` - Get session with messages
- `PUT /api/chat/sessions/{id}` - Update session title
- `DELETE /api/chat/sessions/{id}` - Delete a session

### Messages
- `POST /api/chat/sessions/{id}/messages` - Send message and get AI response

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
