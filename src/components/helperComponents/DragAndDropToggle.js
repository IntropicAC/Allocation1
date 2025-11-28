import React from 'react';
import styles from './DragAndDropToggle.module.css';

function DragDropToggle({ dragDropEnabled, setDragDropEnabled }) {
  return (
    <div className={styles.buttonContainer}>
      <button 
        onClick={() => setDragDropEnabled(!dragDropEnabled)}
        className={`${styles.toggleButton} ${dragDropEnabled ? styles.active : ''}`}
        title={dragDropEnabled ? "Disable drag & drop" : "Enable drag & drop"}
      >
        <svg 
          className={styles.icon}
          viewBox="0 0 16 16" 
          fill="none"
        >
          {dragDropEnabled ? (
            <path
              d="M12 7V5C12 2.79 10.21 1 8 1C5.79 1 4 2.79 4 5V6M8 10V12M3 7H13C13.55 7 14 7.45 14 8V14C14 14.55 13.55 15 13 15H3C2.45 15 2 14.55 2 14V8C2 7.45 2.45 7 3 7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M12 7V5C12 2.79 10.21 1 8 1C5.79 1 4 2.79 4 5V7M8 10V12M3 7H13C13.55 7 14 7.45 14 8V14C14 14.55 13.55 15 13 15H3C2.45 15 2 14.55 2 14V8C2 7.45 2.45 7 3 7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
        <span>Drag & Drop</span>
        <div className={styles.switchTrack}>
          <div className={styles.switchThumb} />
        </div>
      </button>
    </div>
  );
}

export default DragDropToggle;