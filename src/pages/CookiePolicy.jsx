import React from 'react';
import styles from './LegalPages.module.css';

const CookiePolicy = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalContent}>
        <h1>Cookie Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website.
            They help websites remember your preferences and provide essential functionality.
          </p>
        </section>

        <section>
          <h2>How We Use Cookies</h2>
          <p>
            AllocateIt uses a minimal number of cookies, all of which are essential for the service to function.
            We prioritize your privacy and only use what's necessary.
          </p>
        </section>

        <section>
          <h2>Cookies We Use</h2>

          <div className={styles.cookieTable}>
            <h3>Strictly Necessary Cookies</h3>
            <p className={styles.cookieDescription}>
              These cookies are essential for authentication and security. They cannot be disabled as the
              service would not function without them. Under UK GDPR, consent is not required for strictly
              necessary cookies.
            </p>

            <div className={styles.cookieItem}>
              <h4>Auth0 Authentication Cookies</h4>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Purpose:</strong></td>
                    <td>Manages your login session and keeps you authenticated</td>
                  </tr>
                  <tr>
                    <td><strong>Provider:</strong></td>
                    <td>Auth0 (our authentication service)</td>
                  </tr>
                  <tr>
                    <td><strong>Cookie Names:</strong></td>
                    <td>auth0, auth0_compat, auth0.is.authenticated</td>
                  </tr>
                  <tr>
                    <td><strong>Duration:</strong></td>
                    <td>Session (deleted when you close your browser) or up to 7 days if "Remember Me" is selected</td>
                  </tr>
                  <tr>
                    <td><strong>Type:</strong></td>
                    <td>First-party (set by Auth0 on our behalf)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.cookieItem}>
              <h4>Cookie Consent</h4>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Purpose:</strong></td>
                    <td>Remembers that you've seen and acknowledged our cookie notice</td>
                  </tr>
                  <tr>
                    <td><strong>Cookie Name:</strong></td>
                    <td>cookieConsent</td>
                  </tr>
                  <tr>
                    <td><strong>Duration:</strong></td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><strong>Type:</strong></td>
                    <td>First-party</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2>Local Storage</h2>
          <p>
            In addition to cookies, AllocateIt uses your browser's Local Storage to save your allocation data.
            This is NOT a cookie, but similar technology.
          </p>

          <div className={styles.highlight}>
            <h3>What We Store Locally:</h3>
            <ul>
              <li><strong>Your allocations:</strong> Staff lists, observations, and schedules you create</li>
              <li><strong>Your preferences:</strong> Settings like time format, color schemes, etc.</li>
              <li><strong>Undo/redo history:</strong> For the undo/redo functionality</li>
            </ul>
            <p>
              <strong>This data never leaves your device.</strong> It's stored entirely in your browser and is not
              transmitted to our servers. You have full control and can clear it anytime.
            </p>
          </div>
        </section>

        <section>
          <h2>Cookies We Do NOT Use</h2>
          <p>We do not currently use:</p>
          <ul>
            <li><strong>Analytics cookies</strong> (e.g., Google Analytics) - We don't track your usage</li>
            <li><strong>Marketing cookies</strong> - We don't show you advertisements</li>
            <li><strong>Social media cookies</strong> - No Facebook/Twitter tracking pixels</li>
            <li><strong>Third-party advertising cookies</strong> - No ads on our platform</li>
          </ul>
          <p>
            If we add any analytics in the future (to improve the service), we will update this policy
            and ask for your consent first.
          </p>
        </section>

        <section>
          <h2>Managing Cookies</h2>

          <h3>Browser Settings</h3>
          <p>
            You can control cookies through your browser settings. However, disabling cookies will prevent
            you from logging in to AllocateIt.
          </p>

          <div className={styles.browserLinks}>
            <p><strong>How to manage cookies in different browsers:</strong></p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            </ul>
          </div>

          <h3>Clearing Local Storage</h3>
          <p>
            To clear your allocation data stored locally:
          </p>
          <ol>
            <li>Use the "Clear All Data" option in the application settings, or</li>
            <li>Clear your browser's local storage via browser settings (Developer Tools → Application → Local Storage)</li>
          </ol>
          <p>
            <strong>Warning:</strong> Clearing local storage will delete all your saved allocations.
            Use the "Export Data" feature first if you want to keep a backup.
          </p>
        </section>

        <section>
          <h2>Third-Party Cookies</h2>
          <p>
            The only third-party cookies used are from Auth0 for authentication purposes. Auth0 is GDPR-compliant
            and does not use cookies for tracking or advertising.
          </p>
          <p>
            Auth0's cookie policy: <a href="https://auth0.com/docs/secure/tokens/cookies" target="_blank" rel="noopener noreferrer">https://auth0.com/docs/secure/tokens/cookies</a>
          </p>
        </section>

        <section>
          <h2>Changes to This Cookie Policy</h2>
          <p>
            If we make changes to how we use cookies (e.g., adding analytics), we will:
          </p>
          <ul>
            <li>Update this Cookie Policy</li>
            <li>Notify you via email or a prominent notice in the application</li>
            <li>Ask for your consent if required by law</li>
          </ul>
        </section>

        <section>
          <h2>Legal Compliance</h2>
          <p>
            This Cookie Policy complies with:
          </p>
          <ul>
            <li>UK GDPR (General Data Protection Regulation)</li>
            <li>PECR (Privacy and Electronic Communications Regulations) 2003</li>
            <li>The Data Protection Act 2018</li>
          </ul>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies:
          </p>
          <p>
            <strong>Email:</strong> allocateit@outlook.com
          </p>
        </section>

        <section>
          <h2>More Information</h2>
          <p>
            For more information about cookies and how they work:
          </p>
          <ul>
            <li><a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer">ICO - Cookies</a></li>
            <li><a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
