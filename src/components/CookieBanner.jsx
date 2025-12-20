import React, { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Store consent with timestamp
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0' // Track policy version for compliance
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={handleAccept} />
      <div className={styles.cookieBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerIcon}>🍪</div>
          <div className={styles.bannerText}>
            <h3>We Use Cookies</h3>
            <p>
              We use strictly necessary cookies to keep you logged in securely.
              Your allocation data stays on your device and is never sent to our servers.
              <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">Learn more</a>
            </p>
          </div>
          <button onClick={handleAccept} className={styles.acceptButton}>
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
