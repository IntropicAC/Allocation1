import React from 'react';
import styles from './ColorToggleButton.module.css';

function ColorToggleButton({ colorCodingEnabled, setColorCodingEnabled, observations, observationColors }) {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.colorToggleWrapper}>
        <button 
          onClick={() => setColorCodingEnabled(!colorCodingEnabled)}
          className={`${styles.toggleButton} ${colorCodingEnabled ? styles.active : ''}`}
        >
          <span className={styles.icon}>🎨</span>
          {colorCodingEnabled ? 'ON' : 'OFF'}
        </button>
        
        {colorCodingEnabled}
      </div>
    </div>
  );
}

export default ColorToggleButton;