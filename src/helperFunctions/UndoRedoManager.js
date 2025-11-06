// UndoRedoManager.js

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing undo/redo history with localStorage persistence
 */
export function useUndoRedo(initialState, storageKey = 'undoRedoHistory', maxHistory = 50) {
  // Initialize ref to false explicitly
  const isInternalUpdate = useRef(false);
  
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
  
  console.log('🏁 UndoRedoManager initialized');
  console.log('  - Initial isInternalUpdate:', isInternalUpdate.current);
  console.log('  - Initial currentIndex:', initialData.currentIndex);
  console.log('  - Initial history length:', initialData.history.length);

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

  // Get current state - this is THE source of truth
  const currentState = history[currentIndex];

  // Reset the internal update flag after currentIndex changes
  useEffect(() => {
    if (isInternalUpdate.current) {
      console.log('🔄 Resetting isInternalUpdate flag after currentIndex change');
      // Use a small delay to ensure the state has propagated
      const timeoutId = setTimeout(() => {
        isInternalUpdate.current = false;
        console.log('  ✅ Flag reset complete');
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex]);

  // Add logging for currentState changes
  useEffect(() => {
    console.log('🟣 CURRENT STATE CHANGED in UndoRedoManager');
    console.log('  - currentIndex:', currentIndex);
    console.log('  - history length:', history.length);
    console.log('  - currentState staff count:', currentState?.length || 0);
    console.log('  - currentState staff names:', currentState?.map(s => s.name).join(', ') || 'none');
    console.log('  - isInternalUpdate.current:', isInternalUpdate.current);
  }, [currentState, currentIndex, history.length]);

  // Rest of your code...


  // Check if undo is available
  const canUndo = currentIndex > 0;

  // Check if redo is available
  const canRedo = currentIndex < history.length - 1;

  // Save a new state to history
  // In UndoRedoManager.js, update the saveState function:

  // Save a new state to history
const saveState = useCallback((newStateOrUpdater) => {
  console.log('🔵 saveState called');
  console.log('  - isInternalUpdate:', isInternalUpdate.current);
  console.log('  - currentIndex:', currentIndex);
  console.log('  - history length:', history.length);
  console.log('  - typeof newStateOrUpdater:', typeof newStateOrUpdater);
  
  // Don't save if this is triggered internally
  if (isInternalUpdate.current) {
    console.log('  ⏭️ Skipping save (internal update)');
    isInternalUpdate.current = false;
    return;
  }

  // Handle both direct values and updater functions
  console.log('  - About to call updater with history[currentIndex]');
  console.log('  - history[currentIndex] staff count:', history[currentIndex]?.length || 0);
  
  const newState = typeof newStateOrUpdater === 'function'
    ? newStateOrUpdater(history[currentIndex])
    : newStateOrUpdater;

  console.log('  - Updater function returned');
  console.log('  - Current state staff count:', history[currentIndex]?.length || 0);
  console.log('  - New state staff count:', newState?.length || 0);

  // Deep clone to prevent reference issues
  const clonedState = JSON.parse(JSON.stringify(newState));
  
  // Check if state actually changed
  const currentStateString = JSON.stringify(history[currentIndex]);
  const clonedStateString = JSON.stringify(clonedState);
  const hasChanged = clonedStateString !== currentStateString;
  
  console.log('  - hasChanged:', hasChanged);
  console.log('  - currentStateString length:', currentStateString.length);
  console.log('  - clonedStateString length:', clonedStateString.length);
  
  if (!hasChanged) {
    console.log('  ⏭️ No changes detected, skipping save');
    return;
  }

  console.log('  ✅ Saving new state to history');

  setHistory(prevHistory => {
    console.log('    - prevHistory length:', prevHistory.length);
    // Remove any future states if we're not at the end
    const newHistory = prevHistory.slice(0, currentIndex + 1);
    console.log('    - After slice, newHistory length:', newHistory.length);
    
    // Add new state
    newHistory.push(clonedState);
    console.log('    - After push, newHistory length:', newHistory.length);
    
    // Keep only maxHistory states
    if (newHistory.length > maxHistory) {
      const trimmed = newHistory.slice(newHistory.length - maxHistory);
      console.log('    - Trimmed to:', trimmed.length);
      return trimmed;
    }
    
    return newHistory;
  });
  
  setCurrentIndex(prev => {
    const newIndex = Math.min(prev + 1, maxHistory - 1);
    console.log(`  📍 History updated: index ${prev} → ${newIndex}`);
    return newIndex;
  });
}, [currentIndex, history, maxHistory]);

  // Undo action
// Undo action
const undo = useCallback(() => {
  console.log('⬅️ Undo called');
  console.log('  - canUndo:', canUndo);
  console.log('  - currentIndex:', currentIndex);
  if (canUndo) {
    console.log('  - Setting isInternalUpdate to true');
    isInternalUpdate.current = true;  // ✅ Set flag first
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex - 1;
      console.log(`  📍 Index: ${prevIndex} → ${newIndex}`);
      console.log(`  📍 New state will have ${history[newIndex]?.length || 0} staff members`);
      return newIndex;
    });
  }
}, [canUndo, currentIndex, history]);

// Redo action
const redo = useCallback(() => {
  console.log('➡️ Redo called');
  console.log('  - canRedo:', canRedo);
  console.log('  - currentIndex:', currentIndex);
  if (canRedo) {
    console.log('  - Setting isInternalUpdate to true');
    isInternalUpdate.current = true;  // ✅ Set flag first
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      console.log(`  📍 Index: ${prevIndex} → ${newIndex}`);
      console.log(`  📍 New state will have ${history[newIndex]?.length || 0} staff members`);
      return newIndex;
    });
  }
}, [canRedo, currentIndex, history]);

  // Reset history with a new initial state
  const resetHistory = useCallback((newInitialState = initialState) => {
    console.log('🔄 Reset history called');
    const clonedState = JSON.parse(JSON.stringify(newInitialState));
    setHistory([clonedState]);
    setCurrentIndex(0);
    isInternalUpdate.current = true;
  }, [initialState]);

  // Clear history from localStorage
  const clearHistory = useCallback(() => {
    try {
      console.log('🗑️ Clear history called');
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
      // Skip if an input or textarea is focused
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

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