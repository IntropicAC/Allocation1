import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './AccountButton.module.css';

const AccountButton = ({ className }) => {
  const { user, getAccessTokenSilently, logout } = useAuth0();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleChangePassword = () => {
    // Trigger Auth0 password reset flow
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

    // Construct the password reset URL
    const resetUrl = `https://${domain}/dbconnections/change_password`;

    // Open Auth0 Universal Login change password page
    window.location.href = `https://${domain}/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `scope=openid%20profile%20email&` +
      `screen_hint=reset-password`;

    setIsDropdownOpen(false);
  };

  const handleViewProfile = () => {
    // For now, just show user info in console
    // In production, you might want to show a modal with editable profile info
    console.log('User Profile:', user);
    alert(`Profile Information:\n\nEmail: ${user?.email}\nName: ${user?.name || 'Not set'}\nEmail Verified: ${user?.email_verified ? 'Yes' : 'No'}`);
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ DELETE ACCOUNT\n\n' +
      'Are you sure you want to permanently delete your account?\n\n' +
      'This action CANNOT be undone:\n' +
      '• Your account will be permanently deleted\n' +
      '• You will be immediately logged out\n' +
      '• You can create a new account with the same email afterward\n' +
      '• Local data (observations/staff) will remain on this device\n\n' +
      'Do you want to proceed?'
    );

    if (!confirmed) {
      setIsDropdownOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      // Get the user's access token
      const token = await getAccessTokenSilently();

      // Call the delete account API
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show message and log out
        alert('✅ Account deleted successfully.\n\nYou will now be logged out.');

        // Log out and redirect to home
        logout({
          logoutParams: {
            returnTo: window.location.origin
          }
        });
      } else {
        // Error from API
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(
        '❌ Account Deletion Failed\n\n' +
        error.message + '\n\n' +
        'If this problem persists, please contact support at support@allocateit.co.uk'
      );
      setIsDeleting(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className={styles.accountButtonContainer} ref={dropdownRef}>
      <button
        className={className || styles.accountButton}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="Account settings"
      >
        ⚙️ Account
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>

          <button
            className={styles.dropdownItem}
            onClick={handleViewProfile}
          >
            <span className={styles.dropdownIcon}>👤</span>
            View Profile
          </button>

          <button
            className={styles.dropdownItem}
            onClick={handleChangePassword}
          >
            <span className={styles.dropdownIcon}>🔑</span>
            Change Password
          </button>

          <div className={styles.dropdownDivider}></div>

          <button
            className={`${styles.dropdownItem} ${styles.dangerItem}`}
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            <span className={styles.dropdownIcon}>🗑️</span>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountButton;
