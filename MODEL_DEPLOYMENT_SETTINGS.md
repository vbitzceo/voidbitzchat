# Model Deployment Settings Feature

## Overview

The VoidBitz Chat application now includes a comprehensive settings page for managing AI model deployments. This feature allows administrators to dynamically configure and manage multiple AI model endpoints without requiring code changes or application restarts.

## Features

### ✅ Model Deployment Management
- **Create New Deployments**: Add new AI model configurations
- **Edit Existing Deployments**: Update model settings and configurations
- **Delete Deployments**: Remove unused model configurations (with protection for referenced deployments)
- **Test Connections**: Verify connectivity to AI model endpoints
- **Default Model Selection**: Set a default model for new chat sessions
- **Active/Inactive Status**: Enable or disable specific deployments

### ✅ Referential Integrity Protection
- Model deployments that are referenced by existing chat sessions cannot be deleted
- Visual indicators show which deployments are currently in use
- Prevents data inconsistency and broken chat sessions

### ✅ Settings Page UI
- Clean, modern interface built with Tailwind CSS
- Responsive design for desktop and mobile
- Visual status indicators (Active, Default, In Use)
- Intuitive form validation and error handling

## Architecture

### Backend Components

#### ModelDeploymentController (`/api/modeldeployment`)
- **GET /api/modeldeployment** - List all model deployments with usage status
- **GET /api/modeldeployment/{id}** - Get specific deployment details
- **POST /api/modeldeployment** - Create new deployment
- **PUT /api/modeldeployment/{id}** - Update existing deployment
- **DELETE /api/modeldeployment/{id}** - Delete deployment (if not referenced)
- **POST /api/modeldeployment/{id}/test** - Test connection to deployment

#### Data Transfer Objects (DTOs)
- `ModelDeploymentDto` - For listing deployments with usage status
- `CreateModelDeploymentDto` - For creating new deployments
- `UpdateModelDeploymentDto` - For updating existing deployments
- `TestConnectionResult` - For connection test results

### Frontend Components

#### Settings Page (`/app/settings/page.tsx`)
- Main settings interface
- Model deployment list and management
- Integration with dialog components

#### Dialog Components
- `ModelDeploymentDialog` - Create/edit deployment form
- `DeleteConfirmDialog` - Confirmation for deletion
- `TestConnectionDialog` - Connection testing interface

#### Navigation
- Settings link added to sidebar footer
- "Back to Chat" navigation in settings page

## Database Changes

The existing `ModelDeployment` table is used without requiring migrations. The feature leverages the existing schema:

```sql
ModelDeployments
├── Id (Guid, Primary Key)
├── Name (string, Required)
├── DeploymentName (string, Required)
├── Endpoint (string, Required)
├── ApiKey (string, Required, Hidden in UI)
├── ModelType (string, Required)
├── Description (string, Optional)
├── IsActive (boolean)
├── IsDefault (boolean)
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Frontend API base URL (defaults to `http://localhost:5027/api`)

### Model Types Supported
Most Azure hosted chat completion models

## Usage

### Accessing Settings
1. Navigate to the chat application
2. Click the Settings icon in the sidebar footer
3. Or visit `/settings` directly

### Managing Model Deployments

#### Adding a New Deployment
1. Click "Add Deployment" button
2. Fill in required fields:
   - Name: Display name for the deployment
   - Deployment Name: Azure OpenAI deployment name
   - Endpoint: Azure OpenAI endpoint URL
   - API Key: Authentication key
   - Model Type: Select from supported models
   - Description: Optional description
3. Set Active/Default status as needed
4. Click "Create"

#### Editing a Deployment
1. Click the edit (pencil) icon next to any deployment
2. Modify the desired fields
3. Click "Update"

#### Testing a Connection
1. Click the test (test tube) icon next to any deployment
2. View the connection test results
3. Check response time and success status

#### Deleting a Deployment
1. Click the delete (trash) icon next to any deployment
2. Confirm deletion in the dialog
3. Note: Deployments in use by existing chats cannot be deleted

### Default Model Behavior
- Only one deployment can be marked as default
- Setting a new default automatically unsets the previous default
- New chat sessions will use the default model if available

## Security Considerations

### API Key Protection
- API keys are not displayed in the UI for security
- When editing deployments, API key field shows placeholder text
- Leave API key field blank when editing to keep existing key

### User Access Control
- **Current Status**: No authentication implemented
- **Recommendation**: Implement admin-only access to settings page
- **Future Enhancement**: Role-based access control for deployment management

## Migration from Seeded Data

The application has been updated to remove automatic seeding of model deployments from `Program.cs`. Existing deployments will continue to work, but new installations will require manual configuration through the settings page.

### For Existing Installations
- Existing model deployments remain unchanged
- Settings page will show all current deployments
- Can now manage deployments through the UI

### For New Installations
1. Start the application
2. Navigate to Settings
3. Add your first model deployment manually
4. Set it as default for new chats

## API Documentation

Full API documentation is available at the Swagger endpoint when running in development mode:
- **Swagger UI**: `http://localhost:5027`
- **OpenAPI Spec**: `http://localhost:5027/swagger/v1/swagger.json`

## Error Handling

### Frontend Error Handling
- Form validation for required fields
- Network error handling with user-friendly messages
- Loading states for all async operations

### Backend Error Handling
- Referential integrity checks before deletion
- Proper HTTP status codes for all operations
- Detailed error messages for debugging

## Future Enhancements

### Planned Features
- [ ] Batch import/export of model configurations
- [ ] Model deployment health monitoring
- [ ] Usage analytics per deployment
- [ ] Advanced connection testing (latency, throughput)
- [ ] Model capability detection and validation

### Security Enhancements
- [ ] Admin authentication for settings access
- [ ] Encrypted storage of API keys
- [ ] Audit logging for configuration changes
- [ ] API rate limiting for management endpoints

## Troubleshooting

### Common Issues

#### "Cannot delete deployment" Error
- **Cause**: Deployment is referenced by existing chat sessions
- **Solution**: Check which chats are using the deployment, or set them to use a different deployment first

#### Connection Test Failures
- **Possible Causes**:
  - Invalid API key
  - Incorrect endpoint URL
  - Network connectivity issues
  - Azure OpenAI service unavailable
- **Solutions**:
  - Verify API key is correct and active
  - Check endpoint URL format
  - Test network connectivity
  - Check Azure OpenAI service status

#### Settings Page Not Loading
- **Check**: Backend API is running on port 5027
- **Check**: Frontend environment variable `NEXT_PUBLIC_API_URL` is correct
- **Check**: CORS configuration allows frontend domain

### Development Setup
1. Ensure backend is running: `dotnet run` in `/backend`
2. Ensure frontend is running: `npm run dev` in `/frontend`
3. Database should be initialized automatically
4. Access settings at `http://localhost:3000/settings` (or assigned port)

## Contributing

When adding new model types or deployment features:

1. Update the `ModelType` options in `ModelDeploymentDialog.tsx`
2. Add any new validation rules in the controller
3. Update this documentation
4. Test thoroughly with both active and inactive deployments

---

**Note**: This feature replaces the previous hardcoded model seeding approach, providing full runtime configurability for AI model deployments.
