import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './AccountSettings.module.css';

const AccountSettings = () => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // 'success', 'error'
  const [deleteStatus, setDeleteStatus] = useState(null); // 'deleting', 'success', 'error'
  const [deleteError, setDeleteError] = useState('');
  const [passwordResetStatus, setPasswordResetStatus] = useState(null); // 'success', 'error'

  // Export all user data (GDPR right to data portability)
  const handleExportData = () => {
    try {
      // Collect all localStorage data
      const localData = {
        observations: JSON.parse(localStorage.getItem('observations') || '[]'),
        staff: JSON.parse(localStorage.getItem('staff') || '[]'),
        allocationHistory: JSON.parse(localStorage.getItem('allocationHistory') || '[]'),
        allocationId: localStorage.getItem('allocationId'),
        settings: {
          cookieConsent: JSON.parse(localStorage.getItem('cookieConsent') || 'null'),
        }
      };

      // Create comprehensive export
      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          exportVersion: '1.0',
          dataController: 'AllocateIt',
        },
        userProfile: {
          email: user.email,
          name: user.name || 'Not provided',
          userId: user.sub,
          emailVerified: user.email_verified,
          lastUpdated: user.updated_at,
        },
        applicationData: localData,
        gdprNotice: 'This export contains all personal data we hold about you. Your allocation data is stored locally on your device and included here. We do not store this data on our servers.'
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)],
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allocateit-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus(null), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus(null), 5000);
    }
  };

  // Delete account directly via backend API
  const handleDeleteAccount = async () => {
    setDeleteStatus('deleting');
    setDeleteError('');

    try {
      const token = await getAccessTokenSilently();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      console.log('Sending delete request to backend...');

      const response = await fetch(`${backendUrl}/api/account/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.sub,
          email: user.email,
        }),
      });

      if (response.ok) {
        setDeleteStatus('success');
        console.log('Account deleted successfully');

        // Clear all local data
        localStorage.clear();

        // Show success message
        alert('Your account has been deleted successfully. You will now be logged out.');

        // Wait a moment then log out
        setTimeout(() => {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteStatus('error');
      setDeleteError(error.message || 'Unable to delete account. Please try again or contact support at allocateit@outlook.com');
    }
  };

  // Send password reset email via Auth0
  const handleChangePassword = async () => {
    setPasswordResetStatus(null);
    try {
      const domain = process.env.REACT_APP_AUTH0_DOMAIN;
      const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

      // Call Auth0's change password endpoint
      const response = await fetch(
        `https://${domain}/dbconnections/change_password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            email: user.email,
            connection: 'Username-Password-Authentication',
          }),
        }
      );

      if (response.ok) {
        setPasswordResetStatus('success');
        setTimeout(() => setPasswordResetStatus(null), 10000);
      } else {
        throw new Error('Failed to send password reset email');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setPasswordResetStatus('error');
      setTimeout(() => setPasswordResetStatus(null), 10000);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsContainer}>
        <h1>Account Settings</h1>

        {/* Profile Section */}
        <section className={styles.section}>
          <h2>Profile Information</h2>
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user?.email}</span>
              {user?.email_verified && (
                <span className={styles.verified}>✓ Verified</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user?.name || 'Not provided'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>User ID:</span>
              <span className={styles.value}>{user?.sub}</span>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className={styles.section}>
          <h2>Security</h2>
          <div className={styles.actionCard}>
            <div className={styles.cardContent}>
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure.</p>
            </div>
            <button onClick={handleChangePassword} className={styles.secondaryButton}>
              Change Password
            </button>
          </div>

          {passwordResetStatus === 'success' && (
            <div className={styles.successMessage}>
              ✓ Password reset email sent! Check your inbox at <strong>{user?.email}</strong> and follow the link to reset your password.
            </div>
          )}
          {passwordResetStatus === 'error' && (
            <div className={styles.errorMessage}>
              ✗ Unable to send password reset email. Please try again or contact allocateit@outlook.com
            </div>
          )}
        </section>

        {/* Privacy & Data Section */}
        <section className={styles.section}>
          <h2>Privacy & Data</h2>

          <div className={styles.actionCard}>
            <div className={styles.cardContent}>
              <h3>Export Your Data</h3>
              <p>
                Download a copy of all your data in JSON format. This includes your profile
                information and all allocation data stored on your device.
              </p>
              <p className={styles.gdprNote}>
                <strong>GDPR Right:</strong> Data Portability
              </p>
            </div>
            <button onClick={handleExportData} className={styles.primaryButton}>
              Export Data
            </button>
          </div>

          {exportStatus === 'success' && (
            <div className={styles.successMessage}>
              ✓ Data exported successfully! Check your downloads folder.
            </div>
          )}
          {exportStatus === 'error' && (
            <div className={styles.errorMessage}>
              ✗ Export failed. Please try again or contact support.
            </div>
          )}

          <div className={styles.infoBox}>
            <h4>Your Data Privacy</h4>
            <p>
              <strong>Stored on our servers:</strong> Only your email and account details (managed by Auth0)
            </p>
            <p>
              <strong>Stored on your device:</strong> All allocation data, staff lists, and observations
            </p>
            <p>
              We designed AllocateIt with privacy-first principles. Your sensitive work data
              never leaves your device.
            </p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className={styles.section}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>

          <div className={`${styles.actionCard} ${styles.dangerCard}`}>
            <div className={styles.cardContent}>
              <h3>Delete Account</h3>
              <p>
                Permanently delete your AllocateIt account. This action cannot be undone.
              </p>
              <p className={styles.gdprNote}>
                <strong>GDPR Right:</strong> Right to Erasure (Right to be Forgotten)
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={styles.dangerButton}
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* Links to Legal Pages */}
        <section className={styles.legalLinks}>
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <span>•</span>
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <span>•</span>
          <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowDeleteConfirm(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>⚠️ Delete Account?</h2>
            </div>
            <div className={styles.modalBody}>
              <p><strong>This action cannot be undone.</strong></p>
              <p>Deleting your account will:</p>
              <ul>
                <li>Permanently delete your login credentials</li>
                <li>Remove all account data from our servers</li>
                <li>Prevent you from accessing AllocateIt</li>
              </ul>
              <p>Your local allocation data will remain on your device until you clear it manually.</p>
              <div className={styles.modalNote}>
                <p><strong>How It Works:</strong></p>
                <p>
                  Clicking "Delete My Account" will open an email to allocateit@outlook.com.
                  We'll process your request within 24-48 hours and confirm via email.
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className={styles.dangerButton}
                disabled={deleteStatus === 'deleting'}
              >
                {deleteStatus === 'deleting' ? 'Processing...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
