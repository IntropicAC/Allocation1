import React from 'react';
import styles from './LegalPages.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalContent}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2>What We Are</h2>
          <p>
            AllocateIt is a pilot tool for mental health hospital staff allocation, created by a healthcare professional.
            This application is currently in testing phase with select mental health hospital wards.
          </p>
          <p><strong>Contact:</strong> allocateit@outlook.com</p>
        </section>

        <section>
          <h2>What Data We Collect</h2>
          <p>We collect minimal personal information:</p>
          <ul>
            <li><strong>Email address:</strong> Required for account login and authentication</li>
            <li><strong>Name:</strong> Optional, if you provide it during registration</li>
            <li><strong>Authentication data:</strong> Managed securely by Auth0 (our authentication provider)</li>
          </ul>

          <p><strong>We do NOT collect or store:</strong></p>
          <ul>
            <li>Patient names or identifiable information</li>
            <li>Staff personal details from your allocations</li>
            <li>Observation data on our servers</li>
            <li>Any clinical or medical information</li>
          </ul>
        </section>

        <section>
          <h2>Where Your Data Is Stored</h2>
          <div className={styles.highlight}>
            <p><strong>Your Privacy Advantage:</strong> AllocateIt uses a privacy-first, local-storage architecture.</p>
          </div>

          <ul>
            <li><strong>Your account (email/password):</strong> Stored securely by Auth0, our GDPR-compliant authentication provider</li>
            <li><strong>Your allocations, staff lists, and observations:</strong> Stored ONLY on your device in your browser's local storage</li>
            <li><strong>We never see your allocation data</strong> - it stays entirely on your computer/device</li>
          </ul>

          <p>
            This means your sensitive work data never leaves your device. We have designed the system this way
            specifically to protect patient and staff privacy.
          </p>
        </section>

        <section>
          <h2>How We Use Your Data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul>
            <li><strong>Authentication:</strong> Your email allows you to log in securely</li>
            <li><strong>Communication:</strong> To send important updates about the pilot program (e.g., bug fixes, new features)</li>
            <li><strong>Support:</strong> To respond to your questions or technical issues</li>
          </ul>
          <p>We do not use your data for marketing, advertising, or any other purpose.</p>
        </section>

        <section>
          <h2>Legal Basis for Processing (GDPR)</h2>
          <p>Under UK GDPR, we process your personal data based on:</p>
          <ul>
            <li><strong>Consent:</strong> You agree to create an account and participate in the pilot</li>
            <li><strong>Legitimate Interest:</strong> Testing and improving the tool for mental health hospital staff benefit</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights Under UK GDPR</h2>
          <p>You have the following rights regarding your personal data:</p>

          <div className={styles.rightsList}>
            <div className={styles.right}>
              <h3>Right to Access</h3>
              <p>You can request a copy of all data we hold about you.</p>
            </div>

            <div className={styles.right}>
              <h3>Right to Rectification</h3>
              <p>You can update your account information at any time in Account Settings.</p>
            </div>

            <div className={styles.right}>
              <h3>Right to Erasure (Right to be Forgotten)</h3>
              <p>You can request deletion of your account and all associated data at any time.</p>
            </div>

            <div className={styles.right}>
              <h3>Right to Data Portability</h3>
              <p>You can export all your data in a machine-readable format (JSON) from Account Settings.</p>
            </div>

            <div className={styles.right}>
              <h3>Right to Withdraw Consent</h3>
              <p>You can stop using the service and delete your account at any time.</p>
            </div>
          </div>

          <p>
            <strong>To exercise any of these rights:</strong> Email allocateit@outlook.com or use the tools
            available in your Account Settings page.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use strictly necessary cookies for authentication purposes only. These cookies are essential
            for the service to function and cannot be disabled. See our <a href="/cookie-policy">Cookie Policy</a> for details.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>We use the following third-party service:</p>
          <ul>
            <li>
              <strong>Auth0:</strong> For secure authentication and user management. Auth0 is GDPR-compliant
              and ISO 27001 certified. Their privacy policy: <a href="https://auth0.com/privacy" target="_blank" rel="noopener noreferrer">https://auth0.com/privacy</a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Retention</h2>
          <ul>
            <li><strong>Account data:</strong> Retained until you request account deletion</li>
            <li><strong>Local allocation data:</strong> Under your control - stored on your device until you clear it</li>
            <li><strong>After deletion:</strong> Your account data is permanently removed within 7 days</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>We take security seriously:</p>
          <ul>
            <li>All data transmission uses HTTPS encryption</li>
            <li>Auth0 handles password security with industry-standard encryption</li>
            <li>Your allocation data stays on your device (most secure option)</li>
            <li>We follow security best practices for web applications</li>
          </ul>
        </section>

        <section>
          <h2>International Data Transfers</h2>
          <p>
            Your account data is processed within the UK and EU. Auth0 uses Standard Contractual Clauses (SCCs)
            approved by the European Commission to ensure GDPR compliance for any international transfers.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            As this is a pilot program, this privacy policy may be updated. If we make material changes,
            we will notify you via email. Continued use of the service after changes constitutes acceptance
            of the updated policy.
          </p>
        </section>

        <section>
          <h2>Pilot Program Notice</h2>
          <div className={styles.highlight}>
            <p>
              <strong>Important:</strong> This is beta software in pilot testing. While we strive for reliability,
              the service may have bugs or interruptions. Clinical decisions remain your professional responsibility.
            </p>
          </div>
        </section>

        <section>
          <h2>Complaints</h2>
          <p>
            If you have concerns about how we handle your data, you have the right to lodge a complaint with
            the UK Information Commissioner's Office (ICO):
          </p>
          <p>
            <strong>ICO:</strong> <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">https://ico.org.uk/make-a-complaint/</a><br />
            <strong>Phone:</strong> 0303 123 1113
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            For any questions about this privacy policy or your data:
          </p>
          <p>
            <strong>Email:</strong> allocateit@outlook.com<br />
            <strong>Response time:</strong> We aim to respond within 7 days (30 days maximum as required by GDPR)
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
