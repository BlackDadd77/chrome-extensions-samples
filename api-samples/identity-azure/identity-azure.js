'use strict';

/**
 * Azure DevOps OAuth Authentication Sample
 *
 * This sample demonstrates how to authenticate with Azure DevOps using the
 * Chrome Identity API's launchWebAuthFlow method.
 */

function onLoad() {
  const STATE_START = 1;
  const STATE_ACQUIRING_AUTHTOKEN = 2;
  const STATE_AUTHTOKEN_ACQUIRED = 3;

  let state = STATE_START;
  let access_token = null;

  const signin_button = document.querySelector('#signin');
  signin_button.addEventListener('click', interactiveSignIn);

  const userinfo_button = document.querySelector('#userinfo');
  userinfo_button.addEventListener('click', getUserInfo);

  const revoke_button = document.querySelector('#revoke');
  revoke_button.addEventListener('click', revokeToken);

  const user_info_div = document.querySelector('#user_info');

  // Azure DevOps OAuth configuration
  // To use this sample, you need to:
  // 1. Register an application in Azure DevOps at https://app.vsaex.visualstudio.com/app/register
  // 2. Set the authorization callback URL to: chrome-extension://YOUR_EXTENSION_ID/
  // 3. Replace YOUR_AZURE_APP_ID in manifest.json with your App ID
  // 4. Update the clientId and scopes below
  const azureConfig = {
    clientId: 'YOUR_AZURE_APP_ID', // Replace with your Azure DevOps App ID
    scopes: 'vso.profile vso.project',
    authorizationUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize',
    tokenUrl: 'https://app.vssps.visualstudio.com/oauth2/token',
    profileUrl:
      'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0'
  };

  function disableButton(button) {
    button.setAttribute('disabled', 'disabled');
  }

  function enableButton(button) {
    button.removeAttribute('disabled');
  }

  function changeState(newState) {
    state = newState;
    switch (state) {
      case STATE_START:
        enableButton(signin_button);
        disableButton(userinfo_button);
        disableButton(revoke_button);
        break;
      case STATE_ACQUIRING_AUTHTOKEN:
        displayOutput('Acquiring token...');
        disableButton(signin_button);
        disableButton(userinfo_button);
        disableButton(revoke_button);
        break;
      case STATE_AUTHTOKEN_ACQUIRED:
        disableButton(signin_button);
        enableButton(userinfo_button);
        enableButton(revoke_button);
        break;
    }
  }

  function displayOutput(message) {
    let messageStr = message;
    if (typeof message != 'string') {
      messageStr = JSON.stringify(message, null, 2);
    }
    document.getElementById('__logarea').value = messageStr;
  }

  /**
   * Initiates the OAuth flow using Chrome's launchWebAuthFlow.
   * This opens an OAuth window where the user can authenticate with Azure DevOps.
   */
  function interactiveSignIn() {
    changeState(STATE_ACQUIRING_AUTHTOKEN);
    console.log('Starting Azure DevOps authentication...');

    const redirectUri = chrome.identity.getRedirectURL();
    const authUrl =
      `${azureConfig.authorizationUrl}?` +
      `client_id=${encodeURIComponent(azureConfig.clientId)}&` +
      `response_type=Assertion&` +
      `state=${generateRandomState()}&` +
      `scope=${encodeURIComponent(azureConfig.scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
          displayOutput(
            'Error: ' + (chrome.runtime.lastError?.message || 'No redirect URL')
          );
          changeState(STATE_START);
          return;
        }

        // Extract the authorization code from the redirect URL
        const url = new URL(redirectUrl);
        const code = url.searchParams.get('code');

        if (code) {
          displayOutput(
            'Authorization code received. Exchanging for access token...'
          );
          exchangeCodeForToken(code);
        } else {
          displayOutput('Error: No authorization code in redirect URL');
          changeState(STATE_START);
        }
      }
    );
  }

  /**
   * Exchanges the authorization code for an access token.
   * Note: In a production application, this should be done server-side
   * to protect your client secret.
   */
  function exchangeCodeForToken(code) {
    // Note: Azure DevOps requires a client secret for token exchange.
    // For security reasons, this should be done server-side in production.
    // This is a simplified example for demonstration purposes.

    displayOutput(
      'Authorization code received: ' +
        code +
        '\n\n' +
        'IMPORTANT: In a production application, you should exchange this code\n' +
        'for an access token on your backend server to keep your client secret secure.\n\n' +
        'For now, you can manually exchange the code at:\n' +
        azureConfig.tokenUrl
    );

    // For demonstration, we'll simulate having a token
    // In production, you would make a server-side request here
    changeState(STATE_AUTHTOKEN_ACQUIRED);
  }

  /**
   * Fetches the user profile from Azure DevOps using the access token.
   */
  function getUserInfo() {
    if (!access_token) {
      displayOutput('No access token available. Please sign in first.');
      return;
    }

    displayOutput('Fetching user profile...');

    fetch(azureConfig.profileUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            'Failed to fetch user profile: ' + response.statusText
          );
        }
        return response.json();
      })
      .then((userProfile) => {
        displayOutput(userProfile);
        populateUserInfo(userProfile);
      })
      .catch((error) => {
        displayOutput('Error fetching user info: ' + error.message);
        changeState(STATE_START);
      });
  }

  /**
   * Displays user information in the UI.
   */
  function populateUserInfo(userProfile) {
    user_info_div.innerHTML = '';

    if (userProfile.displayName) {
      const nameElem = document.createElement('div');
      nameElem.innerHTML = '<b>Display Name:</b> ' + userProfile.displayName;
      user_info_div.appendChild(nameElem);
    }

    if (userProfile.emailAddress) {
      const emailElem = document.createElement('div');
      emailElem.innerHTML = '<b>Email:</b> ' + userProfile.emailAddress;
      user_info_div.appendChild(emailElem);
    }

    if (userProfile.publicAlias) {
      const aliasElem = document.createElement('div');
      aliasElem.innerHTML = '<b>Public Alias:</b> ' + userProfile.publicAlias;
      user_info_div.appendChild(aliasElem);
    }
  }

  /**
   * Revokes the access token and resets the UI.
   */
  function revokeToken() {
    access_token = null;
    user_info_div.innerHTML = '';
    changeState(STATE_START);
    displayOutput('Token revoked. You have been signed out.');
  }

  /**
   * Generates a random state parameter for OAuth security.
   */
  function generateRandomState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Initialize the UI
  changeState(STATE_START);
  displayOutput(
    'Ready to authenticate with Azure DevOps.\n\n' +
      'Click "Sign in to Azure DevOps" to begin the OAuth flow.'
  );
}

window.addEventListener('load', onLoad);
