import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * ConsentTracker - Tracks user consent on first login
 *
 * This component runs silently in the background and records when a user
 * accepts our Terms and Privacy Policy. For the pilot, this happens
 * implicitly when they create an account.
 *
 * Future enhancement: Add explicit consent checkboxes in Auth0 Universal Login
 */
const ConsentTracker = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const recordConsent = async () => {
      if (!isAuthenticated || !user) return;

      // Check if consent has already been recorded
      const consentRecorded = localStorage.getItem(`consent_recorded_${user.sub}`);
      if (consentRecorded) return;

      try {
        // For pilot: Record implicit consent
        // In production, this would be explicit from sign-up checkboxes
        const consentData = {
          userId: user.sub,
          email: user.email,
          consents: {
            terms: {
              accepted: true,
              timestamp: new Date().toISOString(),
              version: '1.0',
              method: 'implicit' // Changed to 'explicit' when checkboxes added
            },
            privacy: {
              accepted: true,
              timestamp: new Date().toISOString(),
              version: '1.0',
              method: 'implicit'
            },
            cookies: {
              accepted: true,
              timestamp: new Date().toISOString(),
              version: '1.0'
            }
          },
          userAgent: navigator.userAgent,
          ipAddress: 'client-side' // Backend would record actual IP
        };

        // Store locally for audit purposes
        localStorage.setItem(`consent_recorded_${user.sub}`, JSON.stringify(consentData));

        // TODO: When backend is ready, send to server for permanent storage
        // await fetch('/api/consents', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${await getAccessTokenSilently()}`
        //   },
        //   body: JSON.stringify(consentData)
        // });

        console.log('✓ User consent recorded:', consentData);
      } catch (error) {
        console.error('Error recording consent:', error);
      }
    };

    recordConsent();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // This component doesn't render anything
  return null;
};

export default ConsentTracker;
