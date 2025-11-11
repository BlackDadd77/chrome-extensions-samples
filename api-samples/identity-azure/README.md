# Azure DevOps Identity API Sample

A sample Chrome extension that demonstrates how to use the [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/api/identity) to authenticate with Azure DevOps using OAuth 2.0.

## Overview

This extension demonstrates OAuth authentication with Azure DevOps (formerly Visual Studio Team Services) using the `launchWebAuthFlow` method of the Chrome Identity API. After the user authenticates and authorizes the application, the extension can access the user's Azure DevOps profile information.

This sample uses the `launchWebAuthFlow` method, which enables authorization with providers other than Google. For authorization using a Google Account, check out the [Identity API sample](../identity).

![screenshot](assets/screenshot.png)

## Features

- OAuth 2.0 authentication with Azure DevOps
- Retrieve user profile information
- Token management (acquire and revoke)

## Setup Instructions

To use this sample, you need to register an application with Azure DevOps:

### 1. Register Your Application

1. Go to [Azure DevOps App Registration](https://app.vsaex.visualstudio.com/app/register)
2. Fill in the following information:

   - **Application name**: Choose a name for your application
   - **Application website**: Your website or extension URL
   - **Authorization callback URL**: Use the Chrome extension redirect URL format
     - Load the extension first to get your extension ID
     - Then set the callback URL to: `https://<your-extension-id>.chromiumapp.org/`
   - **Authorized scopes**: Select the scopes you need (e.g., `vso.profile`, `vso.project`)

3. After registration, you'll receive an **App ID** and **Client Secret**

### 2. Configure the Extension

1. Open `manifest.json` and replace `YOUR_AZURE_APP_ID` with your actual App ID:

   ```json
   "oauth2": {
     "client_id": "your-actual-app-id-here",
     "scopes": [
       "vso.profile",
       "vso.project"
     ]
   }
   ```

2. Open `identity-azure.js` and update the `azureConfig` object with your App ID:
   ```javascript
   const azureConfig = {
     clientId: 'your-actual-app-id-here'
     // ... rest of config
   };
   ```

### 3. Load the Extension

1. Clone this repository
2. Navigate to `chrome://extensions/` in Chrome
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the `api-samples/identity-azure` directory
5. Note your extension ID from the extensions page
6. Update the Authorization callback URL in Azure DevOps with your actual extension ID

### 4. Use the Extension

1. Click the extension icon to open the popup
2. Click "Sign in to Azure DevOps"
3. Authenticate with your Azure DevOps account
4. Once authenticated, click "Get user profile" to retrieve your profile information
5. Click "Revoke token" to sign out

## Important Security Note

This sample demonstrates the OAuth flow for educational purposes. In a production application:

- **Never store client secrets in extension code** - They should be kept on a secure backend server
- The authorization code should be sent to your backend server
- Your backend should exchange the code for an access token using the client secret
- The backend should then provide the token to the extension in a secure manner

## APIs Used

- [chrome.identity](https://developer.chrome.com/docs/extensions/reference/api/identity) - For OAuth authentication
- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/) - For accessing user profile

## References

- [Chrome Extensions Identity API](https://developer.chrome.com/docs/extensions/reference/api/identity)
- [Azure DevOps OAuth Documentation](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth)
- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/)

## License

This sample is part of the [chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) repository and is licensed under the [Apache License, Version 2.0](https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/LICENSE).
