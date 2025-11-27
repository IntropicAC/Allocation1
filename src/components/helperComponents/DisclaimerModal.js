import React from 'react';
import styles from './DisclaimerModal.module.css';

function DisclaimerModal({ isOpen, onAccept, onAcceptAndDontShow }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.iconContainer}>
            <i className="fa-solid fa-shield-halved" style={{fontSize: '3rem', color: '#f59e0b'}}></i>
          </div>
          <h2 className={styles.modalTitle}>Clinical Responsibility Notice</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>
            <strong>Important:</strong> This is a <strong>scheduling tool only</strong>, not a substitute 
            for clinical judgment.
          </p>
          
          <div className={styles.reminderBox}>
            <p>The Nurse in Charge must:</p>
            <ul className={styles.reminderList}>
              <li>Verify all allocations are safe and appropriate for patient care</li>
              <li>Ensure adequate skill mix before implementation</li>
              <li>Make final staffing decisions based on clinical assessment</li>
            </ul>
          </div>

          <p className={styles.disclaimer}>
            All allocations must be reviewed and approved by qualified staff before use.
          </p>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.dontShowButton}
            onClick={onAcceptAndDontShow}
          >
            Don't Show Again (This Allocation)
          </button>
          <button 
            className={styles.acceptButton}
            onClick={onAccept}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;