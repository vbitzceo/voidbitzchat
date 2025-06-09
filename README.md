# VoidBitz Chat Application

A ChatGPT-like interface built with Next.js frontend and C# Web API backend, using Azure OpenAI and Semantic Kernel.

## ⚠️ **IMPORTANT SECURITY NOTICE**

**This application currently has NO USER AUTHENTICATION or USER ISOLATION implemented.**

- All users can see ALL chat sessions from ALL users
- Chat data is shared globally across all application users
- This is suitable for development/testing only - NOT for production use

See the [Security Considerations](#security-considerations) section below for details on implementing proper user isolation.

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: ASP.NET Core Web API with Semantic Kernel
- **Database**: SQL Server for chat history and sessions
- **AI Service**: Azure OpenAI with GPT models
- **Authentication**: Azure AD (optional)

## Project Structure

```
voidbitzchat/
├── backend/              # ASP.NET Core Web API
│   ├── Controllers/      # API controllers
│   ├── Data/            # Entity Framework DbContext
│   ├── Models/          # Data models and DTOs
│   ├── Services/        # Business logic services
│   ├── Migrations/      # EF Core migrations
│   └── Program.cs       # Application entry point
├── frontend/            # Next.js React application
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   ├── lib/            # Utility functions and API client
│   └── types/          # TypeScript type definitions
└── .vscode/            # VS Code configuration
```

## Features

- Real-time chat interface similar to ChatGPT
- **Custom Chat Naming**: Create chats with meaningful, custom titles
- **Chat Management**: Rename existing chats, create, view, switch between sessions
- Complete chat history persistence with user-defined organization
- Context isolation between sessions
- Semantic Kernel integration for advanced AI capabilities
- Comprehensive logging and monitoring
- **⚠️ NO USER AUTHENTICATION** - All data is currently shared between all users

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- Azure subscription with OpenAI service
- SQL Server (local or Azure)

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- Azure subscription with OpenAI service
- SQL Server (local or Azure)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voidbitzchat
   ```

2. **Backend Setup**
   ```bash
   cd backend
   dotnet restore
   dotnet ef database update
   dotnet run
   ```
   Backend will be available at `https://localhost:7061` and `http://localhost:5027`

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

4. **Configure Azure OpenAI**
   - Update `backend/appsettings.Development.json` with your Azure OpenAI credentials
   - Set `AzureOpenAI:Endpoint`, `AzureOpenAI:DeploymentName`, and `AzureOpenAI:ApiKey`

### VS Code Development

Use the **"Start Full Stack"** task from VS Code's Command Palette (`Ctrl+Shift+P` → `Tasks: Run Task`) to run both frontend and backend simultaneously.

## Using the Chat Application

### Creating Named Chats
1. Click the **"New Chat"** button in the sidebar
2. Enter a meaningful title for your conversation (e.g., "Planning Weekend Trip", "Code Review Discussion")
3. Click **"Create Chat"** to start your conversation

### Renaming Existing Chats
1. Hover over any chat session in the sidebar
2. Click the **pencil icon** that appears
3. Enter a new title and click **"Save"**

### Chat Organization
- All chats are automatically saved with your custom titles
- Chat sessions are ordered by most recent activity
- Each chat maintains its own conversation context and history

## Security Considerations

### Current State: No User Isolation ⚠️

The application currently lacks proper user authentication and isolation:

1. **Shared Data**: All users see the same chat sessions
2. **No Authentication**: No login system implemented
3. **Global Access**: Any user can view, modify, or delete any chat session

### Required for Production

Before deploying to production, you MUST implement one of these user isolation strategies:

1. **Session-based Identification** (Simple)
   - Use browser sessions to identify users
   - Suitable for anonymous usage

2. **Cookie-based User IDs** (Recommended for MVP)
   - Generate persistent user IDs stored in secure cookies
   - No login required, but provides user isolation

3. **Full Authentication** (Production Ready)
   - Implement JWT-based authentication
   - User registration and login system
   - Role-based access control

### Implementation Notes

The backend is already prepared for user isolation:
- `ChatSession.UserId` field exists in the database
- Repository methods accept `userId` parameters
- Controller has `GetUserId()` method (currently returns `null`)

To implement user isolation, you only need to modify the `GetUserId()` method in `ChatController.cs`.

## Development Status

This is a development/demo application. See [`DEVELOPMENT.md`](DEVELOPMENT.md) for implementation details and security considerations.

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).
