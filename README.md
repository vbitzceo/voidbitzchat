# VoidBitz Chat Application

A ChatGPT-like interface built with Next.js frontend and C# Web API backend, using Azure OpenAI and Semantic Kernel.

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
- Chat session management (create, view, switch between sessions)
- Complete chat history persistence
- Context isolation between sessions
- Semantic Kernel integration for advanced AI capabilities
- Comprehensive logging and monitoring

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

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).
