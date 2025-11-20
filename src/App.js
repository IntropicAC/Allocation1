import React, { useCallback, useState, useEffect } from 'react';
import MainPage from './pages/mainPage';
import useLocalStorage from './hooks/useLocalStorage';
import { useUndoRedo, useUndoRedoShortcuts } from './helperFunctions/UndoRedoManager';

function App() {
  const [observations, setObservations, clearObservations] = useLocalStorage('observations', [], '1.0');
  // Track if AllocationCreation has been initialized
  const [isAllocationReady, setIsAllocationReady] = useState(false);

  // Load initial staff from localStorage
  const loadInitialStaff = () => {
    try {
      const stored = localStorage.getItem('staff');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
    return [];
  };

  // Undo/Redo management
  const {
    currentState: staff,
    saveState: saveStaffToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    clearHistory,
    currentIndex,
    historyLength
  } = useUndoRedo(loadInitialStaff(), 'allocationHistory', 50);

  // Enable keyboard shortcuts
  useUndoRedoShortcuts(undo, redo, canUndo, canRedo);

  // Save staff to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('staff', JSON.stringify(staff));
    } catch (error) {
      console.error('Error saving staff to localStorage:', error);
    }
  }, [staff]);

 // Smart setStaff wrapper that always uses current state
// Smart setStaff wrapper that always uses current state
const setStaff = useCallback((newStaffOrUpdater) => {
  console.log('🟢 setStaff called in App.js');
  console.log('  - typeof argument:', typeof newStaffOrUpdater);
  console.log('  - current staff count:', staff?.length || 0);
  
  saveStaffToHistory(newStaffOrUpdater);
}, [saveStaffToHistory, staff]);

// Add this useEffect right after your setStaff definition
useEffect(() => {
  console.log('🔴 STAFF STATE CHANGED in App.js');
  console.log('  - Current staff count:', staff?.length || 0);
  console.log('  - Staff names:', staff?.map(s => s.name).join(', ') || 'none');
  console.log('  - Full staff state:', JSON.stringify(staff, null, 2));
  console.log('  - currentIndex:', currentIndex);
  console.log('  - historyLength:', historyLength);
}, [staff, currentIndex, historyLength]);

  // Function to clear all cached data
 const clearAllData = () => {
  console.log('🗑️ Clearing all data...');
  clearObservations();
  localStorage.removeItem('staff');
  clearHistory();
  setIsAllocationReady(false);
  
  // Reset to empty array when clearing
  resetHistory([]);
  console.log('✅ All data cleared');
};

  // Reset history when starting a new allocation
  const startNewAllocation = useCallback(() => {
    console.log('🆕 Starting new allocation');
    setIsAllocationReady(false);
    // Clear history and start fresh with empty staff
    resetHistory([]);
  }, [resetHistory]);

  return (
    <>
      {/*{!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (*/}
        <MainPage 
          observations={observations} 
          setObservations={setObservations} 
          staff={staff}
          setStaff={setStaff}
          clearAllData={clearAllData}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          currentIndex={currentIndex}
          historyLength={historyLength}
          isAllocationReady={isAllocationReady}
          setIsAllocationReady={setIsAllocationReady}
          resetHistory={resetHistory}
          startNewAllocation={startNewAllocation}
        />
    </>
  );
}

export default App;
