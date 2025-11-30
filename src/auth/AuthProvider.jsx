import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProviderWrapper = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    // After login, return to the page they were trying to access
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  if (!domain || !clientId || !audience) {
    console.error('Auth0 configuration missing! Check your .env file.');
    console.error('Domain:', domain);
    console.error('Client ID:', clientId ? 'Set' : 'Missing');
    console.error('Audience:', audience);
    return <div>Authentication configuration error. Please contact support.</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email',
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProviderWrapper;
