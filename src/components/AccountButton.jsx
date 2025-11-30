import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './AccountButton.module.css';

const AccountButton = ({ className }) => {
  const { user } = useAuth0();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleDeleteAccount = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.\n\n' +
      'All your data stored locally (observations and staff) will remain on your device, ' +
      'but you will lose access to your account and will need to create a new one to use the allocation tool.\n\n' +
      'To proceed with account deletion, please contact support at support@allocateit.co.uk'
    );

    if (confirmed) {
      // In pilot phase, redirect to contact support
      // In production, you would implement Auth0 Management API deletion
      alert('Please email support@allocateit.co.uk to request account deletion. Include your email address: ' + user?.email);
    }

    setIsDropdownOpen(false);
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
          >
            <span className={styles.dropdownIcon}>🗑️</span>
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountButton;
