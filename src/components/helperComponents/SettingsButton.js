// SettingsButton.js
import React, { useState } from 'react';
import styles from './SettingsButton.module.css';

function SettingsButton({ 
  isTransposed, 
  setIsTransposed,
  onClose 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleTransposeToggle = () => {
    setIsTransposed(!isTransposed);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        <button 
          onClick={handleToggle}
          className={styles.settingsButton}
          title="Settings"
        >
          <span className={styles.icon}>⚙</span>
        </button>
      </div>

      {/* Settings Modal */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Settings</h2>
              <button 
                onClick={handleClose}
                className={styles.closeButton}
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Transpose Table Setting */}
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <h3 className={styles.settingTitle}>Transpose Table</h3>
                  <p className={styles.settingDescription}>
                    Swap rows and columns - show staff names in the left column and time across the top row
                  </p>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={isTransposed}
                    onChange={handleTransposeToggle}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {/* Add more settings here in the future */}
              
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={handleClose}
                className={styles.doneButton}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SettingsButton;