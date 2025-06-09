# VoidBitz Chat - Development Setup

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
