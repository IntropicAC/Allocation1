// ColorToggleButton.jsx
import React, { useState } from 'react';
import styles from './ColorToggleButton.module.css';

function ColorToggleButton({ colorCodingEnabled, setColorCodingEnabled, observations, observationColors }) {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className={styles.buttonContainer}>
      <button 
        onClick={() => {
          setColorCodingEnabled(!colorCodingEnabled);
          setShowLegend(!colorCodingEnabled);
        }}
        className={`${styles.toggleButton} ${colorCodingEnabled ? styles.active : ''}`}
        title={colorCodingEnabled ? "Disable color coding" : "Enable color coding"}
      >
        <svg 
          className={styles.icon}
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path
            d="M8 2C8 2 5 5 5 7C5 8.66 6.34 10 8 10C9.66 10 11 8.66 11 7C11 5 8 2 8 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 11C2 11 3 10 4.5 10C6 10 7 11 8.5 11C10 11 11 10 12.5 10C14 10 15 11 15 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M2 14C2 14 3 13 4.5 13C6 13 7 14 8.5 14C10 14 11 13 12.5 13C14 13 15 14 15 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>Color Coding</span>
        <div className={styles.switchTrack}>
          <div className={styles.switchThumb} />
        </div>
      </button>
      
    </div>
  );
}

export default ColorToggleButton;