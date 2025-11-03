import React, { useState, useRef, useEffect } from "react";
import styles from "./mainPage.module.css";
import StaffInput from "./staffInput";
import PatientInput from "./patientInput";
import NavigationButtons from "./navigationButtons";
import AllocationCreation from "./allocationCreation";
import WelcomePage from "./WelcomePage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function MainPage({ 
  observations, 
  setObservations, 
  staff, 
  setStaff, 
  clearAllData,
  undo,
  redo,
  canUndo,
  canRedo,
  currentIndex,
  historyLength,
  isAllocationReady,
  setIsAllocationReady,
  resetHistory
}) {
  // Check if there's cached data
  const hasCachedData = observations.length > 0 || staff.length > 0;
  
  // Start at welcome page if there's cached data, otherwise go straight to patient input
  const [currentPage, setCurrentPage] = useState(hasCachedData ? "welcome" : "patient");
  const [selectedStartHour, setSelectedStartHour] = useState(null);

  // Initialize staff members when loading from cache
  useEffect(() => {
    if (hasCachedData && staff.length > 0) {
      const needsInitialization = staff.some(member => !member.observations || !member.initialized);
      
      if (needsInitialization) {
        console.log('Initializing staff members from cache...');
        const initializedStaff = staff.map(member => {
          // If already has observations object, keep it
          if (member.observations && typeof member.observations === 'object') {
            return {
              ...member,
              initialized: true
            };
          }
          
          // Otherwise, initialize observations
          const observations = {};
          for (let hour = 7; hour <= 19; hour++) {
            observations[hour] = 
              hour === 8 && member.observationId && member.observationId !== "-"
                ? member.observationId
                : "-";
          }
          
          return {
            ...member,
            observations,
            obsCounts: member.obsCounts || {},
            lastReceived: member.lastReceived || {},
            numObservations: member.observationId && member.observationId !== "-" ? 1 : 0,
            initialized: true
          };
        });
        
        setStaff(initializedStaff);
      }
    }
  }, [hasCachedData]);

  const handleNewAllocation = () => {
    if (window.confirm('This will delete your previous allocation. Are you sure?')) {
      clearAllData();
      setCurrentPage("patient");
    }
  };

const handleContinue = () => {
  const hasCompleteData = observations.length > 0 && staff.length > 1;

  if (hasCompleteData) {
    const needsInitialization = staff.some(m => !m.observations || !m.initialized);
    if (needsInitialization) {
      // (Optionally) use functional setState to avoid stale closures
      setStaff(prev => initializeStaffFromCache(prev));
    }
    setCurrentPage("allocation");
  } else if (observations.length > 0 && staff.length <= 1) {
    setCurrentPage("staff");
  } else {
    setCurrentPage("patient");
  }
};

  const handleNext = () => {
    if (currentPage === "patient") {
      setCurrentPage("staff");
    } else if (currentPage === "staff") {
      setCurrentPage("allocation");
    }
  };

  const handleBack = () => {
    if (currentPage === "allocation") {
      // Always go back to staff from allocation
      setCurrentPage("staff");
    } else if (currentPage === "staff") {
      // Always go back to patient from staff
      setCurrentPage("patient");
    } else if (currentPage === "patient") {
      // Only go back to welcome if there's cached data
      if (hasCachedData) {
        setCurrentPage("welcome");
      }
      // Otherwise, do nothing (can't go back from patient if no cache)
    }
  };

  const tableRef = useRef(null);

  const setTableRef = (ref) => {
    tableRef.current = ref;
  };

  function initializeStaffFromCache(staff) {
   return staff.map(member => {
     if (member.observations && typeof member.observations === 'object') {
       return { ...member, initialized: true };
     }
     const observations = {};
     for (let hour = 7; hour <= 19; hour++) {
       observations[hour] =
         hour === 8 && member.observationId && member.observationId !== "-"
           ? member.observationId
           : "-";
     }
     return {
       ...member,
       observations,
       obsCounts: member.obsCounts || {},
       lastReceived: member.lastReceived || {},
       numObservations: member.observationId && member.observationId !== "-" ? 1 : 0,
       initialized: true     };
   });
 }

  const copyTable = async () => {
    const table = tableRef.current;
    if (table) {
      const clonedTable = table.cloneNode(true);
      clonedTable.style.borderCollapse = "collapse";
      clonedTable.style.minHeight = "100%";
      clonedTable.style.minHeight = "100vh";
      clonedTable.style.fontFamily = "Calibri, sans-serif";
      
      const cells = clonedTable.querySelectorAll("td, th");
      cells.forEach((cell) => {
        cell.style.padding = "0";
        cell.style.margin = "0";
        cell.style.border = "1px solid black";
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";
        cell.style.whiteSpace = "nowrap";
      });

      clonedTable.style.border = "1px solid black";

      const serializer = new XMLSerializer();
      let tableHtml = serializer.serializeToString(clonedTable);

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([tableHtml], { type: "text/html" }),
          }),
        ]);
        console.log("Table copied successfully!");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  return (
    <div className="hero">
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      <main id="content-area">
        <div className="content-wrapper">
          {currentPage === "welcome" && (
            <WelcomePage
              onNewAllocation={handleNewAllocation}
              onContinue={handleContinue}
              hasCachedData={hasCachedData}
            />
          )}
          
          {currentPage === "patient" && (
            <PatientInput
              observations={observations}
              setObservations={setObservations}
              setStaff={setStaff}
            />
          )}
          
          {currentPage === "staff" && (
            <StaffInput
              staff={staff}
              setStaff={setStaff}
              observations={observations}
              setObservations={setObservations}
            />
          )}
          
          {currentPage === "allocation" && (
            <DndProvider backend={HTML5Backend}>
              <AllocationCreation
                staff={staff}
                setStaff={setStaff}
                observations={observations}
                setObservations={setObservations}
                selectedStartHour={selectedStartHour}
                setSelectedStartHour={setSelectedStartHour}
                setTableRef={setTableRef}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                currentIndex={currentIndex}
                historyLength={historyLength}
              />
            </DndProvider>
          )}
        </div>

        {currentPage !== "welcome" && (
          <NavigationButtons
            copyTable={copyTable}
            currentPage={currentPage}
            onNext={handleNext}
            onBack={handleBack}
            staff={staff}
            setStaff={setStaff}
            observations={observations}
            setTableRef={setTableRef}
            tableRef={tableRef}
            selectedStartHour={selectedStartHour}
            hasCachedData={hasCachedData}
            isAllocationReady={isAllocationReady}
            setIsAllocationReady={setIsAllocationReady}
            resetHistory={resetHistory}
          />
        )}
      </main>

      <footer>
        <p>&copy; Alex 2025</p>
      </footer>
    </div>
  );
}

export default MainPage;