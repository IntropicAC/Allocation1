import React, { useCallback, useState, useEffect } from 'react';
import MainPage from './components/mainPage';
import LoginForm from './components/loginForm';
import useLocalStorage from './hooks/useLocalStorage';
import { useUndoRedo, useUndoRedoShortcuts } from './helperFunctions/UndoRedoManager';

function App() {
  const [observations, setObservations, clearObservations] = useLocalStorage('observations', [], '1.0');
  const [staffData, setStaffData, clearStaff] = useLocalStorage('staff', [], '1.0');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  // ✨ Track if AllocationCreation has been initialized - check localStorage on mount
  const [isAllocationReady, setIsAllocationReady] = useState(() => {
    // Check if there's existing valid history
    const storedHistory = localStorage.getItem('allocationHistory');
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (parsed.history && parsed.history.length > 1) {
          // If history exists with more than just the initial state, tracking was active
          console.log('✅ Found existing undo/redo history - enabling tracking');
          return true;
        }
      } catch (error) {
        console.error('Error checking history:', error);
      }
    }
    return false;
  });

  // 🔥 Clear stale undo/redo history on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('allocationHistory');
    
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        
        // Check if history exists but is empty or invalid
        if (!parsed.history || parsed.history.length === 0) {
          console.log('🗑️ Clearing empty undo/redo history');
          localStorage.removeItem('allocationHistory');
          setIsAllocationReady(false);
          return;
        }
        
        // Check if the history staff count matches current staff count
        const historyStaffCount = parsed.history[parsed.currentIndex]?.length || 0;
        const currentStaffCount = staffData.length;
        
        if (historyStaffCount !== currentStaffCount) {
          console.log(`🗑️ Clearing stale undo/redo history (history has ${historyStaffCount} staff, current has ${currentStaffCount})`);
          localStorage.removeItem('allocationHistory');
          setIsAllocationReady(false);
          return;
        }
        
        // Check if history staff have valid observations
        const historyStaff = parsed.history[parsed.currentIndex] || [];
        const hasInvalidStaff = historyStaff.some(s => !s || !s.observations || typeof s.observations !== 'object');
        
        if (hasInvalidStaff) {
          console.log('🗑️ Clearing invalid undo/redo history (missing observations)');
          localStorage.removeItem('allocationHistory');
          setIsAllocationReady(false);
          return;
        }
        
        console.log('✅ Undo/redo history is valid and tracking is active');
        
      } catch (error) {
        console.log('🗑️ Clearing corrupted undo/redo history');
        localStorage.removeItem('allocationHistory');
        setIsAllocationReady(false);
      }
    }
  }, []); // Only run once on mount

  // ✨ Undo/Redo management
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
  } = useUndoRedo(staffData, 'allocationHistory', 50);

  // ✨ Enable keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useUndoRedoShortcuts(undo, redo, canUndo, canRedo);

  // ✨ Wrapper that ALWAYS saves to localStorage, but only saves to history if ready
  const setStaff = useCallback((newStaffOrUpdater) => {
    let newStaff;
    if (typeof newStaffOrUpdater === 'function') {
      // If it's an updater function, call it with the current staff state
      newStaff = newStaffOrUpdater(isAllocationReady ? staff : staffData);
    } else {
      newStaff = newStaffOrUpdater;
    }
    
    console.log('setStaff called, isAllocationReady:', isAllocationReady);
    
    // ALWAYS save to localStorage (this makes StaffInput work)
    setStaffData(newStaff);
    
    // Only save to history if AllocationCreation has been initialized
    if (isAllocationReady) {
      console.log('Saving to history');
      saveStaffToHistory(newStaff);
    } else {
      console.log('NOT saving to history (tracking not active)');
    }
  }, [staff, staffData, saveStaffToHistory, setStaffData, isAllocationReady]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Function to clear all cached data
  const clearAllData = () => {
    console.log('🗑️ Clearing all data...');
    clearObservations();
    clearStaff();
    clearHistory();
    setIsAllocationReady(false);
    console.log('✅ All data cleared');
  };

  return (
    <>{/*
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (*/}
        <MainPage 
          observations={observations} 
          setObservations={setObservations} 
          staff={isAllocationReady ? staff : staffData} // Use staffData before tracking starts
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
        />
      {/*)}*/}
    </>
  );
}

export default App;