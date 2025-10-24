import React from 'react';
import styles from './WelcomePage.module.css';

function WelcomePage({ onNewAllocation, onContinue, hasCachedData }) {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeCard}>
        <h1 className={styles.title}>Patient Observation Allocation</h1>
        <p className={styles.subtitle}>Create or continue your allocation schedule</p>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.primaryButton} 
            onClick={onNewAllocation}
          >
            <div className={styles.buttonContent}>
              <i className="fa-solid fa-plus"></i>
              <span>Create New Allocation</span>
            </div>
            <p className={styles.buttonDescription}>Start fresh with new patients and staff</p>
          </button>
          
          {hasCachedData && (
            <button 
              className={styles.secondaryButton} 
              onClick={onContinue}
            >
              <div className={styles.buttonContent}>
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Continue Previous Allocation</span>
              </div>
              <p className={styles.buttonDescription}>Resume your last saved allocation</p>
            </button>
          )}
        </div>
        
        {!hasCachedData && (
          <p className={styles.noCacheMessage}>
            No previous allocation found. Start by creating a new one.
          </p>
        )}
      </div>
    </div>
  );
}

export default WelcomePage;