import React from 'react';
import styles from './LandingPage.module.css';

function LandingPage({ onCreateAllocation }) {
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
      <div className={styles.ctaGroup}>
        <button 
          className={styles.ctaButton}
          onClick={onCreateAllocation}
        >
          <span>Create Allocation</span>
          <span className={styles.buttonArrow}>→</span>
        </button>
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
        <span className={styles.metaIcon}>🔒</span> No login required
        <span className={styles.metaSeparator}>•</span>
        <span className={styles.metaIcon}>💾</span> All data stays local
        <span className={styles.metaSeparator}>•</span>
        <span className={styles.metaIcon}>✓</span> Free to use
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