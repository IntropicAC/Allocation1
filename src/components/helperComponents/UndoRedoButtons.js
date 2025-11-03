import React from 'react';
import styles from './UndoRedoButtons.module.css';

function UndoRedoButtons({ canUndo, canRedo, onUndo, onRedo, currentIndex, historyLength }) {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.undoRedoWrapper}>
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={`${styles.undoButton} ${!canUndo ? styles.disabled : ''}`}
          title="Undo (Ctrl+Z)"
        >
          <span className={styles.icon}>↶</span>
        </button>
        
        <div className={styles.historyIndicator}>
          {currentIndex} / {historyLength - 1}
        </div>
        
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className={`${styles.redoButton} ${!canRedo ? styles.disabled : ''}`}
          title="Redo (Ctrl+Y)"
        >
          <span className={styles.icon}>↷</span>
        </button>
      </div>
    </div>
  );
}

export default UndoRedoButtons;