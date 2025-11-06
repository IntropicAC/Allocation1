import React from 'react';
import styles from './DragAndDropToggle.module.css';

function DragDropToggle({ dragDropEnabled, setDragDropEnabled }) {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.toggleWrapper}>
        <button 
          onClick={() => setDragDropEnabled(!dragDropEnabled)}
          className={`${styles.toggleButton} ${dragDropEnabled ? styles.active : ''}`}
          title={dragDropEnabled ? "Disable drag & drop" : "Enable drag & drop"}
        >
          <span className={styles.icon}>
            {dragDropEnabled ? '🔓' : '🔒'}
          </span>
          {dragDropEnabled ? 'Drag ON' : 'Drag OFF'}
        </button>
      </div>
    </div>
  );
}

export default DragDropToggle;