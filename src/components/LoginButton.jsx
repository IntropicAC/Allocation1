import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = ({ children, className, style }) => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  return (
    <button onClick={handleLogin} className={className} style={style}>
      {children || 'Log In'}
    </button>
  );
};

export default LoginButton;
