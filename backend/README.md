# VoidBitz Chat API

ASP.NET Core Web API backend for the VoidBitz Chat application.

## Features

- **Chat Management**: Create, retrieve, and delete chat sessions
- **Message Processing**: Send messages and receive AI-powered responses
- **Persistence**: Entity Framework Core with SQL Server for chat history
- **AI Integration**: Azure OpenAI integration via Semantic Kernel
- **Logging**: Serilog for structured logging
- **API Documentation**: Swagger/OpenAPI documentation

## API Endpoints

### Chat Sessions
- `GET /api/chat/sessions` - Get all user sessions
- `POST /api/chat/sessions` - Create a new session
- `GET /api/chat/sessions/{id}` - Get session with messages
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
