# VoidBitz Chat Application

A ChatGPT-like interface built with Next.js frontend and C# Web API backend, using Azure OpenAI and Semantic Kernel.

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: ASP.NET Core Web API with Semantic Kernel
- **Database**: SQL Server for chat history and sessions
- **AI Service**: Azure OpenAI with GPT models
- **Authentication**: Azure AD (optional)

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

### Setup

1. Clone the repository
2. Configure backend settings in `appsettings.json`
3. Run database migrations
4. Install frontend dependencies
5. Start both services

See individual README files in backend and frontend folders for detailed setup instructions.
