import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const SignupButton = ({ children, className, style }) => {
  const { loginWithRedirect } = useAuth0();

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  return (
    <button onClick={handleSignup} className={className} style={style}>
      {children || 'Sign Up'}
    </button>
  );
};

export default SignupButton;
