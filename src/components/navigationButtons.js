import React from 'react';
import styles from './navigationButtons.module.css';

function NavigationButtons({ onBack, onNext, currentPage }) {
  return (
    <div className={styles.navigationContainer}>
      {/* Show back button for staff and allocation pages, otherwise show a spacer */}
      {(currentPage === 'staff' || currentPage === 'allocation') ? (
        <button onClick={onBack} className={styles.backButton}>Back</button>
      ) : (
        <div className={styles.spacer}></div>
      )}

      {/* Spacer to push the next button to the right when on the patient page */}
      {currentPage === 'patient' && (
        <div className={styles.spacer}></div>
      )}

      {/* Show next button for patient and staff pages, otherwise show a spacer */}
      {(currentPage === 'patient' || currentPage === 'staff') ? (
        <button className={styles.nextButton} onClick={onNext}>Next</button>
      ) : (
        <div className={styles.spacer}></div>
      )}
    </div>
  );
}

export default NavigationButtons;
