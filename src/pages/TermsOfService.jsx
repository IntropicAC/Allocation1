import React from 'react';
import styles from './LegalPages.module.css';

const TermsOfService = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalContent}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using AllocateIt, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section>
          <h2>This Is a Pilot Program</h2>
          <div className={styles.highlight}>
            <p>
              <strong>Important:</strong> AllocateIt is BETA software currently being tested with select mental health hospital wards.
            </p>
          </div>

          <p>By participating in this pilot, you acknowledge and agree that:</p>
          <ul>
            <li>This is not a finished product and may contain bugs or errors</li>
            <li>Features may change, be added, or removed without notice</li>
            <li>The service may experience interruptions or downtime</li>
            <li>This tool is an aid, not a replacement for professional judgment</li>
            <li>Clinical and staffing decisions remain your professional responsibility</li>
          </ul>
        </section>

        <section>
          <h2>Eligibility</h2>
          <p>
            This service is intended for healthcare professionals involved in staff allocation and scheduling.
            You must be at least 18 years old and authorized to use this tool within your mental health hospital organization.
          </p>
        </section>

        <section>
          <h2>Account Registration</h2>
          <p>To use AllocateIt, you must:</p>
          <ul>
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>Not share your login details with others</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
          </ul>
          <p>
            You are responsible for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2>Acceptable Use</h2>
          <p>You agree to use AllocateIt only for its intended purpose: creating staff allocations and schedules.</p>

          <p><strong>You must NOT:</strong></p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Input real patient-identifiable information beyond what's necessary (use ward/bed numbers, not full patient details)</li>
            <li>Attempt to access, modify, or damage the service's systems or infrastructure</li>
            <li>Reverse engineer, decompile, or disassemble the software</li>
            <li>Use automated systems or bots to access the service</li>
            <li>Share or redistribute the service without permission</li>
          </ul>
        </section>

        <section>
          <h2>Data and Privacy</h2>
          <p>
            <strong>Your Data Stays Local:</strong> All allocation data (staff lists, observations, schedules)
            is stored on your device in your browser's local storage. We do not have access to this data.
          </p>
          <p>
            Your account information (email) is handled in accordance with our <a href="/privacy-policy">Privacy Policy</a>.
          </p>
          <p>
            <strong>Your Responsibility:</strong> You are responsible for:
          </p>
          <ul>
            <li>Ensuring your use complies with your organization's data protection policies</li>
            <li>Not inputting sensitive patient data unnecessarily</li>
            <li>Backing up any important allocation data (use the Export feature)</li>
            <li>Clearing browser data appropriately if using a shared computer</li>
          </ul>
        </section>

        <section>
          <h2>Data Ownership</h2>
          <p>
            You retain all rights to the allocation data you create. We do not claim any ownership or rights
            to your staff schedules, allocation configurations, or related content.
          </p>
        </section>

        <section>
          <h2>Service Availability</h2>
          <p>
            As a pilot program, we strive for reliable service but cannot guarantee:
          </p>
          <ul>
            <li>Uninterrupted or error-free operation</li>
            <li>That the service will meet your specific requirements</li>
            <li>That bugs or errors will be corrected within any specific timeframe</li>
            <li>That the service will continue indefinitely</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue the service at any time, with or without notice.
          </p>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            AllocateIt, including its code, design, and functionality, is protected by copyright and other
            intellectual property laws. You may not copy, modify, or redistribute the service without permission.
          </p>
        </section>

        <section>
          <h2>Disclaimer of Warranties</h2>
          <div className={styles.highlight}>
            <p>
              <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong>
            </p>
          </div>
          <p>
            We make no warranties, expressed or implied, regarding:
          </p>
          <ul>
            <li>The accuracy, reliability, or completeness of the service</li>
            <li>That the service will be free from errors or bugs</li>
            <li>That the service will meet your specific needs</li>
            <li>The suitability of allocations generated by the tool</li>
          </ul>
          <p>
            <strong>Professional Responsibility:</strong> You are solely responsible for verifying that any
            staff allocation complies with your organization's policies, clinical safety requirements, and
            professional standards. This tool is an aid, not a substitute for professional judgment.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul>
            <li>Loss of data</li>
            <li>Service interruptions</li>
            <li>Errors in allocations</li>
            <li>Professional or clinical consequences</li>
          </ul>
          <p>
            This is free pilot software provided for testing purposes. Use it at your own discretion.
          </p>
        </section>

        <section>
          <h2>Pilot Feedback</h2>
          <p>
            By participating in this pilot, you agree to:
          </p>
          <ul>
            <li>Provide feedback on bugs, issues, and potential improvements</li>
            <li>Report any problems to allocateit@outlook.com</li>
            <li>Participate in optional surveys or interviews about your experience</li>
          </ul>
          <p>
            Your feedback helps improve the tool for all mental health hospital staff.
          </p>
        </section>

        <section>
          <h2>Account Termination</h2>
          <p>
            <strong>You may:</strong> Stop using the service at any time and delete your account via Account Settings
            or by emailing allocateit@outlook.com.
          </p>
          <p>
            <strong>We may:</strong> Suspend or terminate accounts that violate these terms or if the pilot program ends.
            We will provide reasonable notice before terminating the pilot.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            As this is a pilot, these terms may be updated. We will notify you of significant changes via email.
            Continued use after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of England and Wales. Any disputes shall be subject to the
            exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2>Severability</h2>
          <p>
            If any provision of these terms is found to be unenforceable, the remaining provisions will continue
            in full force and effect.
          </p>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            For questions about these Terms of Service:
          </p>
          <p>
            <strong>Email:</strong> allocateit@outlook.com
          </p>
        </section>

        <section>
          <h2>Acknowledgment</h2>
          <p>
            By using AllocateIt, you acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service and our Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
