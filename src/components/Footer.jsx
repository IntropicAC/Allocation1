import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './Footer.module.css';

const Footer = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth0();

  const handleLinkClick = (e, page) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} AllocateIt. All rights reserved.
          </p>
          <p className={styles.subtitle}>
            Built for mental health hospital staff allocation
          </p>
        </div>

        <div className={styles.footerLinks}>
          <a
            href="/privacy-policy"
            className={styles.footerLink}
            onClick={(e) => handleLinkClick(e, 'privacy-policy')}
          >
            Privacy Policy
          </a>
          <span className={styles.separator}>•</span>
          <a
            href="/terms-of-service"
            className={styles.footerLink}
            onClick={(e) => handleLinkClick(e, 'terms-of-service')}
          >
            Terms of Service
          </a>
          <span className={styles.separator}>•</span>
          <a
            href="/cookie-policy"
            className={styles.footerLink}
            onClick={(e) => handleLinkClick(e, 'cookie-policy')}
          >
            Cookie Policy
          </a>
          {isAuthenticated && (
            <>
              <span className={styles.separator}>•</span>
              <a
                href="/account-settings"
                className={styles.footerLink}
                onClick={(e) => handleLinkClick(e, 'account-settings')}
              >
                Account Settings
              </a>
            </>
          )}
        </div>

        <div className={styles.footerSection}>
          <p className={styles.contact}>
            Questions? Email <a href="mailto:allocateit@outlook.com">allocateit@outlook.com</a>
          </p>
          <p className={styles.pilot}>
            🧪 Pilot Version
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
