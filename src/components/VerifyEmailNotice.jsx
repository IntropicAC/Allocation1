import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './VerifyEmailNotice.module.css';

const VerifyEmailNotice = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [resendStatus, setResendStatus] = useState(null); // 'sending', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleResendVerification = async () => {
    setResendStatus('sending');
    setErrorMessage('');

    try {
      // Get the access token
      const token = await getAccessTokenSilently();

      // Call Auth0 Management API to resend verification email
      const response = await fetch(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/jobs/verification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.sub,
          }),
        }
      );

      if (response.ok) {
        setResendStatus('success');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus('error');
      setErrorMessage(error.message || 'Unable to resend verification email. Please try again later.');
    }
  };

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        <div className={styles.verifyIcon}>
          <i className="fas fa-envelope-open-text"></i>
        </div>
        <h2 className={styles.verifyTitle}>Verify Your Email</h2>
        <p className={styles.verifyText}>
          We've sent a verification email to <strong>{user?.email}</strong>.
        </p>
        <p className={styles.verifyText}>
          Please check your inbox and click the verification link to access the allocation tool.
        </p>

        <div className={styles.verifyActions}>
          {resendStatus === 'success' ? (
            <div className={styles.successMessage}>
              <i className="fas fa-check-circle"></i>
              Verification email sent! Check your inbox.
            </div>
          ) : resendStatus === 'error' ? (
            <div className={styles.errorMessage}>
              <i className="fas fa-exclamation-circle"></i>
              {errorMessage}
            </div>
          ) : (
            <button
              className={styles.resendButton}
              onClick={handleResendVerification}
              disabled={resendStatus === 'sending'}
            >
              {resendStatus === 'sending' ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Resend Verification Email
                </>
              )}
            </button>
          )}
        </div>

        <div className={styles.verifyHint}>
          <p className={styles.hintText}>
            <i className="fas fa-info-circle"></i>
            After verifying, please refresh this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;
