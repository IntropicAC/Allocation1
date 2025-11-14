import React, { useState, useRef } from "react";
import styles from "./mainPage.module.css";
import StaffInput from "./staffInput";
import PatientInput from "./patientInput";
import NavigationButtons from "./navigationButtons";
import AllocationCreation from "./allocationCreation";
import WelcomePage from "./WelcomePage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TutorialModal from "./helperComponents/tutorialModal";
import assignGenerals from "../videos/Assigning_generals_cropped.mp4";
import creating_staff from "../videos/creating_staff_cropped.mp4";
import ObsLimitHour8 from "../videos/creating_staff_obsLimit_and_hour_8.mp4"


// Patient page tutorial
const patientTutorial = [
  {
    title: "Step 1: Add Patients",
    gifSrc: assignGenerals,
    alt: "Adding patients",
    description: (
      <ul>
        <strong>In this section you will add observations to be completed:</strong>
        <li>Enter each patient’s name (max 3 characters).</li>
        <li>Select the "observation type" for the correct number of staff required.</li>
        <li>For intermittent checks (4x Hourly or “Generals”), choose it in the drop-down.</li>
        <li>Edit or remove before continuing.</li>
      </ul>
    ),
  },
];

// Staff page tutorial
const staffTutorial = [
  {
    title: "Step 2: Add Staff",
    gifSrc: creating_staff,
    alt: "Adding staff",
    description: (
      <ul>
        <strong>In this section you will add staff members:</strong>
        <li>Enter the staff members name.</li>
        <li>Select there break time (if left as "Break", no break will be assigned).</li>
        <li>Select the role. Healthcare Assistant, nurse or security</li>
        <li>Click “Add staff member” (add up to 20 staff members).</li>
      </ul>
    ),
  },
  {
    title: "Staff roles",
    gifSrc: ObsLimitHour8,
    alt: "Staff roles",
    description: (
      <ul>
        <strong>Assigning roles and first hour of observations:</strong>
        <li>Initial observaton refers to the first hour of the shift in which staff are assigned (8:00 (day)or 20:00 o'clock(night)).</li>
        <li>Roles such as nurse and security will have a pop up, this allows you to select how many observation in total they recieve.</li>
        <li>Break, role and intial Observation can all be changed even once a staff member has been added.</li>
        <br></br>
        <li>Helpful tip! adding all the staff then assinging break, roles and Initial observations is faster.</li>
      </ul>
    ),
  }
];

// Allocation page tutorial
const allocationTutorial = [
  {
    title: "Step 3: Build Allocation",
    gifSrc: "/gifs/transpose-time.gif",
    alt: "Adding staff to cells",
    description: (
      <ul>
        <strong>Adding jobs and observations:</strong>
        <li>Adding </li>
        <li>Roles such as nurse and security will have a pop up, this allows you to select how many observation in total they recieve.</li>
        <li>Break, role and intial Observation can all be changed even once a staff member has been added.</li>
        <br></br>
        <li>Helpful tip! adding all the staff then assinging break, roles and Initial observations is faster.</li>
      </ul>
    )
  },
  {
    title: "Pro tip: Settings",
    gifSrc: "/gifs/transpose-time.gif",
    alt: "Transpose and time range",
    description:
      "Open ⚙ Settings to transpose the table or switch day/night time ranges.",
  },
];

const tutorialsEnabled = false; // 👈 Set to true when ready


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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeTutorialPages, setActiveTutorialPages] = useState(null);
  const [activeTutorialKey, setActiveTutorialKey] = useState(null);
  const [colorCodingEnabled, setColorCodingEnabled] = useState(false);
  const [dragDropEnabled, setDragDropEnabled] = useState(false);

  const [cellColors, setCellColors] = useState({});
  const [textColors, setTextColors] = useState({});
  const [cellDecorations, setCellDecorations] = useState({});

  const T_KEYS = {
  patient: 'tutorialDismissed:patient:v1',
  staff: 'tutorialDismissed:staff:v1',
  allocation: 'tutorialDismissed:allocation:v1',
};

// session flags so each section shows once per “new allocation”
const S_FLAGS = {
  patient: 'tutorialPending:patient',
  staff: 'tutorialPending:staff',
  allocation: 'tutorialPending:allocation',
};

  React.useEffect(() => {
  if (!tutorialsEnabled) return; // 👈 Skip everything if disabled

  let lsKey = null;
  let pages = null;
  let sFlag = null;

  if (currentPage === "patient") {
    lsKey = T_KEYS.patient;
    pages = patientTutorial;
    sFlag = S_FLAGS.patient;
  } else if (currentPage === "staff") {
    lsKey = T_KEYS.staff;
    pages = staffTutorial;
    sFlag = S_FLAGS.staff;
  } else if (currentPage === "allocation") {
    lsKey = T_KEYS.allocation;
    pages = allocationTutorial;
    sFlag = S_FLAGS.allocation;
  }

  if (!lsKey || !pages) return;

  const dismissed = localStorage.getItem(lsKey) === "1";
  const pending = sessionStorage.getItem(sFlag) === "1";

  if (!dismissed && pending) {
    setActiveTutorialPages(pages);
    setActiveTutorialKey(lsKey);
    setIsTutorialOpen(true);
    sessionStorage.removeItem(sFlag);
  }
}, [currentPage]);



  const handleNewAllocation = () => {
  if (window.confirm('This will delete your previous allocation. Are you sure?')) {
    clearAllData();
    // 👇 Clear formatting states
    setCellColors({});
    setTextColors({});
    setCellDecorations({});
    
    sessionStorage.setItem(S_FLAGS.patient, '1');
    sessionStorage.setItem(S_FLAGS.staff, '1');
    sessionStorage.setItem(S_FLAGS.allocation, '1');

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
                colorCodingEnabled={colorCodingEnabled}
                setColorCodingEnabled={setColorCodingEnabled}
                dragDropEnabled={dragDropEnabled}
                setDragDropEnabled={setDragDropEnabled}
                cellColors={cellColors}
                setCellColors={setCellColors}
                textColors={textColors}
                setTextColors={setTextColors}
                cellDecorations={cellDecorations}
                setCellDecorations={setCellDecorations}
              />
            </DndProvider>
          )}
          <TutorialModal
            isOpen={isTutorialOpen}
            onClose={() => setIsTutorialOpen(false)}
            pages={activeTutorialPages || []}
            localStorageKey={activeTutorialKey || 'tutorialDismissed:default'}
          />


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
