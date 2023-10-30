import React from 'react';
import styles from './navigationButtons.module.css';

function NavigationButtons({ onBack, onNext, currentPage }) {
  return (
    <div className={styles.navigationContainer}>
      {currentPage === 'allocation' ? (
        <button onClick={onBack} className={styles.backButton}>Back</button>
      ) : (
        <div className={styles.spacer}></div>
      )}

      <button className={styles.nextButton} onClick={onNext}>Next</button>
    </div>
  );
}

export default NavigationButtons;
