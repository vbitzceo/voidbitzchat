# VoidBitz Chat - Development Setup

## ⚠️ Critical Security Issues

### No User Authentication/Isolation

**STATUS**: 🔴 **CRITICAL VULNERABILITY**

The application currently has a major security flaw where all users share the same data:

#### Problem Details
- No user authentication system implemented
- `GetUserId()` method returns `null` for all requests
- All chat sessions are visible to all users
- Any user can modify or delete any chat session

#### Impact
- **Data Privacy**: Users can see private conversations from other users
- **Data Integrity**: Users can accidentally or maliciously modify others' data
- **Compliance**: Violates basic data protection principles

#### Code Location
```csharp
// File: backend/Controllers/ChatController.cs
private string? GetUserId()
{
    // TODO: Implement proper user identification
    return null; // ⚠️ Security vulnerability
}
```

#### Required Actions
1. **Immediate**: Add clear warnings in documentation ✅
2. **Before Production**: Implement user isolation (see solutions below)
3. **Testing**: Use separate browser profiles to simulate different users

#### Implementation Solutions

| Solution | Complexity | Use Case | Security Level |
|----------|------------|----------|----------------|
| Session-based | Low | Development/Testing | Basic |
| Cookie-based | Medium | MVP/Demo | Good |
| JWT Auth | High | Production | Excellent |

## Project Structure

The project has a simplified, flat structure for easy navigation:

```
voidbitzchat/
├── backend/              # .NET API project (flattened from VoidBitzChat.Api)
│   ├── Controllers/      # API endpoints
│   ├── Data/            # Entity Framework DbContext
│   ├── Models/          # Entity models and DTOs
│   ├── Services/        # Business logic and repositories
│   ├── Migrations/      # Database migrations
│   ├── Program.cs       # Application startup
│   └── *.csproj         # Project file
├── frontend/            # Next.js application
└── .vscode/            # VS Code tasks and launch configurations
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB or full instance)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for Azure deployment)

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd voidbitzchat
```

### 2. Backend Setup
```bash
cd backend

# Restore packages
dotnet restore

# Update database (creates LocalDB if needed)
dotnet ef database update

# Run the API
dotnet run
```
The API will be available at `https://localhost:7061` and `http://localhost:5027`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend will be available at `http://localhost:3000`

## VS Code Development

### Using Tasks (Recommended)
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Tasks: Run Task`
3. Select `Start Full Stack` to run both backend and frontend

### Individual Tasks Available:
- **Backend: Build** - Build the .NET API
- **Backend: Run** - Run the API in development mode
- **Frontend: Dev** - Run Next.js development server
- **Frontend: Build** - Build frontend for production
- **Database: Create Migration** - Create new EF migration
- **Database: Update Database** - Apply migrations to database

### Debugging
- Use `Launch Backend API` configuration to debug the .NET API
- Frontend debugging works through browser dev tools

## Database

### Local Development
The application uses SQL Server LocalDB by default. The connection string in `appsettings.Development.json` will automatically create the database.

### Creating Migrations
```bash
cd backend
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

### Reset Database
```bash
cd backend
dotnet ef database drop
dotnet ef database update
```

## Configuration

### Backend Configuration
Edit `backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=VoidBitzChatDb;Trusted_Connection=true;MultipleActiveResultSets=true;"
  },
  "AzureOpenAI": {
    "Endpoint": "https://your-openai-instance.openai.azure.com/",
    "DeploymentName": "gpt-35-turbo",
    "ApiKey": "your-api-key-here"
  }
}
```

### Frontend Configuration
The frontend automatically connects to the backend API running on `https://localhost:7267`.

To change the API URL, edit `frontend/lib/api.ts` and modify the `BASE_URL` constant.

## Azure OpenAI Setup

1. Create an Azure OpenAI resource in the Azure portal
2. Deploy a model (e.g., gpt-35-turbo or gpt-4)
3. Update the configuration in `appsettings.Development.json`

For production, use Azure Managed Identity instead of API keys.

## Application Features

### ✅ Chat Naming System
- **Status**: Complete and tested
- **Security**: ⚠️ **Affected by user isolation issue**
- **Features**:
  - Custom titles for new chats
  - Rename existing chats
  - Title validation and persistence

### ❌ User Authentication
- **Status**: Not implemented
- **Priority**: **CRITICAL** for production
- **Requirements**:
  - User identification system
  - Session management
  - Data isolation

### Chat Session Management
The application supports comprehensive chat session management:

- **Custom Chat Titles**: Users can create chats with meaningful, descriptive names
- **Rename Functionality**: Existing chats can be renamed using the edit icon in the sidebar
- **Session Persistence**: All chat titles and conversation history are stored in the database
- **⚠️ User Context Isolation**: **CURRENTLY BROKEN** - All users see all sessions
- **User Context Isolation**: Each session maintains its own conversation context

### User Interface
- **New Chat Modal**: Prompts users to enter a custom title when creating new chats
- **Rename Modal**: Allows editing of existing chat titles with validation
- **Visual Feedback**: Hover states and loading indicators for better UX
- **Responsive Design**: Works across desktop and mobile devices

### API Endpoints for Chat Management
- `POST /api/chat/sessions` - Create with custom title
- `PUT /api/chat/sessions/{id}` - Update session title
- `GET /api/chat/sessions` - List user sessions with titles
- `DELETE /api/chat/sessions/{id}` - Remove sessions

## Testing Considerations

### Current Testing Limitations
- All HTTP tests share the same user context
- Cannot test multi-user scenarios
- Data persistence affects all users

### Recommended Testing Approach
1. **Development**: Use browser incognito/private windows
2. **API Testing**: Test with different session cookies
3. **Production**: Implement proper user isolation first

## Development Workflow

### Before Starting Development
1. ⚠️ **Understand the security limitations**
2. Use separate browser profiles for multi-user testing
3. Clear database regularly during development

### Before Production Deployment
1. **MUST**: Implement user authentication
2. **MUST**: Add proper error handling
3. **MUST**: Add input validation
4. **MUST**: Add rate limiting
5. **MUST**: Add HTTPS enforcement

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000, 5267, or 7267 are in use, modify:
   - Frontend: `frontend/package.json` scripts
   - Backend: `backend/Properties/launchSettings.json`

2. **Database connection issues**:
   - Ensure SQL Server LocalDB is installed
   - Run `sqllocaldb info` to check LocalDB instances
   - Try `sqllocaldb start mssqllocaldb`

3. **CORS issues**:
   - Backend is configured to allow `http://localhost:3000`
   - If using different ports, update CORS policy in `Program.cs`

4. **SSL certificate issues**:
   - Run `dotnet dev-certs https --trust` to trust development certificates

### Logs
- Backend logs: Console output and Serilog
- Frontend logs: Browser console and Next.js terminal output

## Testing

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd frontend
npm test
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
dotnet publish -c Release
```

## Deployment

See `azure.yaml` for Azure Static Web Apps deployment configuration.

### Prerequisites for Azure Deployment
- Azure CLI logged in
- Azure OpenAI resource configured
- SQL Database created in Azure

```bash
azd init
azd provision
azd deploy
```
