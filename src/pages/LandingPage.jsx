import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './LandingPage.module.css';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';

function LandingPage({ onCreateAllocation }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for Auth0 errors in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setAuthError(errorDescription || 'Authentication failed. Please try again.');

      // Clear error from URL so user can try again
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Clear error when user tries to login/signup again
  const handleClearError = () => {
    setAuthError(null);
  };
  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
    
<section className={styles.hero}>
  <div className={styles.heroContent}>
    <div className={styles.heroText}>
      <div className={styles.badge}>
        <span className={styles.badgeIcon}>✨</span>
        <span className={styles.badgeText}>Built by Healthcare Staff</span>
      </div>
      <h1 className={styles.heroTitle}>
        Safe Staffing, <span className={styles.titleHighlight}>Solved in Minutes</span>
      </h1>
      <p className={styles.heroSubtitle}>
        Transform allocation chaos into fair, compliant schedules instantly.
        Built by healthcare staff who understand the challenges you face every shift.
      </p>

      {/* Auth Error Message */}
      {authError && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
            ⚠️ {authError}
          </p>
        </div>
      )}

      <div className={styles.ctaGroup}>
        {isLoading ? (
          <button className={styles.ctaButton} disabled>
            <span>Loading...</span>
          </button>
        ) : isAuthenticated ? (
          <button
            className={styles.ctaButton}
            onClick={onCreateAllocation}
          >
            <span>Go to App</span>
            <span className={styles.buttonArrow}>→</span>
          </button>
        ) : (
          <div className={styles.authButtonGroup} onClick={handleClearError}>
            <SignupButton className={styles.ctaButton}>
              <span>Get Started Free</span>
              <span className={styles.buttonArrow}>→</span>
            </SignupButton>
            <LoginButton className={styles.secondaryButton}>
              Log In
            </LoginButton>
          </div>
        )}
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50</div>
            <div className={styles.statLabel}>Minutes Saved</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Compliant</div>
          </div>
        </div>
      </div>
      <p className={styles.heroMeta}>
        <span className={styles.metaIcon}>🔒</span> Your data never leaves your device
        <span className={styles.metaSeparator}>•</span>
        <span className={styles.metaIcon}>💾</span> Privacy-first design
        <span className={styles.metaSeparator}>•</span>
        <span className={styles.metaIcon}>✓</span> Free tier available
      </p>
    </div>
    <div className={styles.heroVisual}>
      <div className={styles.floatingElement1}></div>
      <div className={styles.floatingElement2}></div>
      <div className={styles.mockupCard}>
        <div className={styles.mockupHeader}>
          <div className={styles.mockupDot}></div>
          <div className={styles.mockupDot}></div>
          <div className={styles.mockupDot}></div>
        </div>
        <div className={styles.mockupContent}>
          <div className={styles.mockupRow}>
            <div className={styles.mockupLabel}>Staff: Dean</div>
          </div>
          <div className={styles.mockupRow}>
            <div className={styles.mockupLabel}>Obs: General</div>
          </div>
          <div className={styles.mockupRow}>
            <div className={styles.mockupLabel}>Staff: Alex</div>
          </div>
          <div className={styles.mockupRow}>
            <div className={styles.mockupLabel}>Break: 12:00</div>
          </div>
        </div>
        <div className={styles.mockupFooter}>
          <div className={styles.mockupButton}>Generate</div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Key Benefits Section */}
      <section className={styles.benefits}>
        <h2 className={styles.sectionTitle}>Why use this System?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🛡️</div>
            <h3 className={styles.benefitTitle}>Reduces Clinical Risk</h3>
            <p className={styles.benefitText}>
              Prevents skill-mix errors and maintains CQC compliance. 
              Automatically flags unsafe staffing combinations before they happen.
            </p>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>💰</div>
            <h3 className={styles.benefitTitle}>Saves Money</h3>
            <p className={styles.benefitText}>
              Optimal staff distribution reduces unnecessary additional shifts. Prevents policy breaches 
              that would require extra staff, saving thousands monthly.
            </p>
          </div>

            <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>✨</div>
            <h3 className={styles.benefitTitle}>Improves Staff Morale</h3>
            <p className={styles.benefitText}>
              Fair, transparent distribution removes bias and favouritism. Staff trust the system, 
              reducing difficult conversations and complaints.
            </p>
          </div>
          
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>⚡</div>
            <h3 className={styles.benefitTitle}>Saves Time</h3>
            <p className={styles.benefitText}>
              Reduces allocation building from 45-60 minutes to under 10 minutes. More time for patient 
              care, more time for nurses to be nurses.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Features That Protect Your Team</h2>
        <div className={styles.featuresList}>
          <div className={styles.featureItem}>
            <div className={styles.featureNumber}>01</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Skill-Mix Protection</h3>
              <p className={styles.featureText}>
                Ensures at least one experienced staff member on all observations. Prevents unsafe 
                pairings of inexperienced staff on high-risk patients.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureNumber}>02</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Instant Regeneration</h3>
              <p className={styles.featureText}>
                Staff sickness or last-minute changes? Recalculate a safe, fair allocation instantly. 
                No more panic, no more manual reshuffling.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureNumber}>03</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Secure by Design</h3>
              <p className={styles.featureText}>
                All patient data stays local on your device. No hospital information stored on servers. 
                Data belongs to your ward, not the cloud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCta}>
        <h2 className={styles.ctaTitle}>Ready to Transform Your Staffing?</h2>
        <p className={styles.ctaText}>
          Start creating fair, safe, compliant allocations in minutes.
        </p>
        <button 
          className={styles.ctaButton}
          onClick={onCreateAllocation}
        >
          Create Your First Allocation
        </button>
      </section>
    </div>
  );
}

export default LandingPage;