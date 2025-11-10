import React, { useState, useRef } from "react";
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
  const [isTransposed, setIsTransposed] = useState(false);
  const [timeRange, setTimeRange] = useState('day'); // 'day' = 8-19, 'night' = 20-7

  const handleNewAllocation = () => {
    if (window.confirm('This will delete your previous allocation. Are you sure?')) {
      clearAllData();
      setCurrentPage("patient");
    }
  };

const handleContinue = () => {
  const hasCompleteData = observations.length > 0 && staff.length > 1;
  
  if (hasCompleteData) {
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

  const copyTable = async () => {
    const table = tableRef.current;
    if (table) {
      const clonedTable = table.cloneNode(true);
      clonedTable.style.borderCollapse = "collapse";
      clonedTable.style.minHeight = "100%";
      clonedTable.style.minHeight = "100vh";
      clonedTable.style.fontFamily = "Calibri, sans-serif";
      clonedTable.style.width = "100%"; // Make table full width
      clonedTable.style.tableLayout = "fixed"; // Force equal column widths
      
      const cells = clonedTable.querySelectorAll("td, th");
      cells.forEach((cell) => {
        cell.style.padding = "0";
        cell.style.margin = "0";
        cell.style.border = "1px solid black";
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";
        cell.style.whiteSpace = "nowrap";
        cell.style.width = "auto"; // Let table-layout: fixed handle width
        cell.style.overflow = "hidden"; // Prevent content overflow
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
    <div className={styles.hero}>
      <nav className={styles.navBar}>
        <ul className={styles.navList}>
          <li className={styles.navItem}><button className={styles.navButton} type="button">Home</button></li>
          <li className={styles.navItem}><button className={styles.navButton} type="button">About</button></li>
          <li className={styles.navItem}><button className={styles.navButton} type="button">Contact</button></li>
        </ul>
      </nav>

      <main id="content-area" className={styles.mainContent}>
        <div className={styles.contentWrapper}>
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
                isTransposed={isTransposed}          
                setIsTransposed={setIsTransposed}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
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

      <footer className={styles.footer}>
        <p className={styles.footerText}>&copy; Alex 2025</p>
      </footer>
    </div>
  );
}

export default MainPage;
