//UndoRedoManager.js

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing undo/redo history with localStorage persistence
 * @param {Array} initialState - Initial state of the staff array
 * @param {string} storageKey - Key for localStorage (e.g., 'allocationHistory')
 * @param {number} maxHistory - Maximum number of history states to keep (default: 50)
 */
export function useUndoRedo(initialState, storageKey = 'undoRedoHistory', maxHistory = 50) {
  // Load history from localStorage on init
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          history: parsed.history || [JSON.parse(JSON.stringify(initialState))],
          currentIndex: parsed.currentIndex || 0
        };
      }
    } catch (error) {
      console.error('Error loading undo/redo history:', error);
    }
    return {
      history: [JSON.parse(JSON.stringify(initialState))],
      currentIndex: 0
    };
  };

  const initialData = loadHistory();
  const [history, setHistory] = useState(initialData.history);
  const [currentIndex, setCurrentIndex] = useState(initialData.currentIndex);
  const isUndoRedoAction = useRef(false);

  // Save to localStorage whenever history or index changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        history,
        currentIndex
      }));
    } catch (error) {
      console.error('Error saving undo/redo history:', error);
    }
  }, [history, currentIndex, storageKey]);

  // Get current state
  const currentState = history[currentIndex];

  // Check if undo is available
  const canUndo = currentIndex > 0;

  // Check if redo is available
  const canRedo = currentIndex < history.length - 1;

  // Save a new state to history
  const saveState = useCallback((newState) => {
    // Don't save if this is triggered by undo/redo
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    // Deep clone to prevent reference issues
    const clonedState = JSON.parse(JSON.stringify(newState));

    setHistory(prevHistory => {
      // Remove any future states if we're not at the end
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push(clonedState);
      
      // Keep only maxHistory states
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      
      return newHistory;
    });

    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      return newIndex >= maxHistory ? maxHistory - 1 : newIndex;
    });
  }, [currentIndex, maxHistory]);

  // Undo action
  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [canUndo]);

  // Redo action
  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [canRedo]);

  // Reset history
  const resetHistory = useCallback((newInitialState) => {
    const clonedState = JSON.parse(JSON.stringify(newInitialState));
    setHistory([clonedState]);
    setCurrentIndex(0);
    isUndoRedoAction.current = false;
  }, []);

  // Clear history from localStorage
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      resetHistory(initialState);
    } catch (error) {
      console.error('Error clearing undo/redo history:', error);
    }
  }, [storageKey, initialState, resetHistory]);

  return {
    currentState,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    clearHistory,
    historyLength: history.length,
    currentIndex
  };
}

/**
 * Hook for keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 */
export function useUndoRedoShortcuts(undo, redo, canUndo, canRedo) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      
      // Check for Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}