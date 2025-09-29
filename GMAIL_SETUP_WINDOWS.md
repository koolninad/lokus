# Gmail Integration Setup for Windows

## Prerequisites

1. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:8080/gmail-callback` to authorized redirect URIs

2. **Set Environment Variables on Windows**

### Method 1: Using System Properties (Permanent)
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Add:
   - Variable name: `GOOGLE_CLIENT_ID`
   - Variable value: Your client ID from Google Cloud Console
6. Click "New" again and add:
   - Variable name: `GOOGLE_CLIENT_SECRET`
   - Variable value: Your client secret from Google Cloud Console
7. Click "OK" to save
8. **Restart your terminal/IDE for changes to take effect**

### Method 2: Using Command Prompt (Temporary)
```cmd
set GOOGLE_CLIENT_ID=your_client_id_here
set GOOGLE_CLIENT_SECRET=your_client_secret_here
npm run tauri dev
```

### Method 3: Using PowerShell (Temporary)
```powershell
$env:GOOGLE_CLIENT_ID="your_client_id_here"
$env:GOOGLE_CLIENT_SECRET="your_client_secret_here"
npm run tauri dev
```

### Method 4: Using .env file (Development)
Create a `.env` file in the project root:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Windows-Specific Notes

1. **Windows Firewall**: The OAuth callback server runs on port 8080. If blocked:
   - Windows Defender Firewall may prompt to allow access
   - Or manually add an exception for port 8080-8083

2. **Token Storage**: On Windows, Gmail tokens are stored in:
   - `%USERPROFILE%\.lokus\gmail\gmail_token.json`
   - `%USERPROFILE%\.lokus\gmail\gmail_profile.json`

3. **Troubleshooting**:
   - If port 8080 is in use, the server will try 8081, 8082, 8083
   - Check Windows Event Viewer for detailed errors
   - Run as Administrator if permission issues occur

## Testing Gmail Integration

1. Set environment variables as shown above
2. Run the application: `npm run tauri dev`
3. Click on Gmail integration in the app
4. Authenticate with Google when browser opens
5. Return to the app after successful authentication

## Common Issues

- **"GOOGLE_CLIENT_ID environment variable not set"**: Environment variables not set or terminal needs restart
- **"Failed to bind to port"**: Another application is using port 8080-8083
- **"Connection failed"**: Check Windows Firewall or antivirus settings