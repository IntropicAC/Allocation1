import React, { useState, useEffect, useRef } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import styles from './mainPage.module.css';

// Import your existing components
import WelcomePage from '../components/WelcomePage';
import PatientInput from '../components/patientInput';
import StaffInput from '../components/staffInput';
import AllocationCreation from '../components/allocationCreation';
import NavigationButtons from '../components/navigationButtons';
import TutorialModal from '../components/helperComponents/tutorialModal';


// Import new page components
import LandingPage from './LandingPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';

function MainPage(props) {
  // Destructure props passed from App.js
  const {
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
    resetHistory,
    startNewAllocation
  } = props;

  // Navigation state - determines which page to show
  const [activePage, setActivePage] = useState('landing'); // 'landing', 'about', 'contact', 'app'
  
  // App workflow state
  const [currentPage, setCurrentPage] = useState("welcome");
  const [selectedStartHour, setSelectedStartHour] = useState(null);
  const [hasCachedData, setHasCachedData] = useState(false);

  const tableRef = useRef(null);

const setTableRef = (ref) => {
  tableRef.current = ref;
};
  
  useEffect(() => {
  // Check if there's cached data on component mount and when data changes
  const checkCachedData = () => {
    try {
      const savedObservations = localStorage.getItem('observations');
      const savedStaff = localStorage.getItem('staff');
      
      const hasObs = savedObservations && JSON.parse(savedObservations).length > 0;
      const hasStaff = savedStaff && JSON.parse(savedStaff).length > 0;
      
      console.log('📦 Checking cached data:', { hasObs, hasStaff });
      setHasCachedData(hasObs || hasStaff);
    } catch (error) {
      console.error('Error checking cached data:', error);
      setHasCachedData(false);
    }
  };

  checkCachedData();
}, [observations, staff]);
  // Allocation settings
  const [isTransposed, setIsTransposed] = useState(false);
  const [timeRange, setTimeRange] = useState('day');
  const [colorCodingEnabled, setColorCodingEnabled] = useState(false);
  const [dragDropEnabled, setDragDropEnabled] = useState(false);
  const [cellColors, setCellColors] = useState({});
  const [textColors, setTextColors] = useState({});
  const [cellDecorations, setCellDecorations] = useState({});
  const [hasUnfinishedForm, setHasUnfinishedForm] = useState(false);
  
  // Tutorial state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeTutorialPages, setActiveTutorialPages] = useState(null);
  const [activeTutorialKey, setActiveTutorialKey] = useState(null);

  // Navigation handlers
  const handleNavigation = (page) => {
    setActivePage(page);
    
    // If navigating to app, reset to welcome page
    if (page === 'app') {
      setCurrentPage('welcome');
    }
  };

  // Handler for "Create Allocation" button
  const handleCreateAllocation = () => {
    setActivePage('app');
    setCurrentPage('welcome');
  };

 const handleNewAllocation = () => {
  clearAllData();
  setCurrentPage("patient");
};


  const handleContinue = () => {
  // Smart navigation based on what data exists
  const hasObservations = observations && observations.length > 0;
  const hasStaff = staff && staff.length > 0;
  const hasEnoughStaff = staff && staff.length >= 2;

  console.log('📍 Continue - hasObs:', hasObservations, 'hasStaff:', hasStaff, 'hasEnoughStaff:', hasEnoughStaff);

  if (!hasObservations) {
    // No observations -> go to patient page
    setCurrentPage("patient");
  } else if (!hasStaff) {
    // Has observations but no staff -> go to staff page
    setCurrentPage("staff");
  } else if (hasEnoughStaff) {
    // Has observations and 2+ staff -> go to allocation page
    setCurrentPage("allocation");
  } else {
    // Has observations and 1 staff -> stay on staff page to add more
    setCurrentPage("staff");
  }
};

  const handleNext = () => {
    if (currentPage === "patient") setCurrentPage("staff");
    else if (currentPage === "staff") setCurrentPage("allocation");
  };

  const handleBack = () => {
    if (currentPage === "staff") setCurrentPage("patient");
    else if (currentPage === "allocation") setCurrentPage("staff");
    else if (currentPage === "patient") setCurrentPage("welcome");
  };

  const copyTable = async () => {
  const table = tableRef.current;
  if (table) {
    const clonedTable = table.cloneNode(true);
    clonedTable.style.borderCollapse = "collapse";
    clonedTable.style.minHeight = "100%";
    clonedTable.style.minHeight = "100vh";
    clonedTable.style.fontFamily = "Calibri, sans-serif";
    clonedTable.style.width = "100%";
    clonedTable.style.tableLayout = "fixed";
    
    const cells = clonedTable.querySelectorAll("td, th");
    cells.forEach((cell) => {
      cell.style.padding = "0";
      cell.style.margin = "0";
      cell.style.border = "1px solid black";
      cell.style.textAlign = "center";
      cell.style.verticalAlign = "middle";
      cell.style.whiteSpace = "nowrap";
      cell.style.width = "auto";
      cell.style.overflow = "hidden";
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

  // Render marketing pages (full-width, no container)
  const renderMarketingPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onCreateAllocation={handleCreateAllocation} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return null;
    }
  };

  // Render app pages (contained in mainContent box)
 const renderAppPage = () => {
  return (
    <>
      {currentPage === "welcome" && (
        <WelcomePage
          onNewAllocation={handleNewAllocation}
          onContinue={handleContinue}
          hasCachedData={hasCachedData}
        />
      )}
      
      {currentPage === "patient" && (
        <>
          <PatientInput
            observations={observations}
            setObservations={setObservations}
            setStaff={setStaff}
          />
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
        </>
      )}
      
      {currentPage === "staff" && (
  <>
    <StaffInput
      staff={staff}
      setStaff={setStaff}
      observations={observations}
      setObservations={setObservations}
      setHasUnfinishedForm={setHasUnfinishedForm} 
    />
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
      hasUnfinishedForm={hasUnfinishedForm}
          />
        </>
      )}
      
      {currentPage === "allocation" && (
        <>
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
            hasUnfinishedForm={hasUnfinishedForm}
          />
        </>
      )}
      
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        pages={activeTutorialPages || []}
        localStorageKey={activeTutorialKey || 'tutorialDismissed:default'}
      />
    </>
  );
};

  return (
    <div className={styles.hero}>
      <nav className={styles.navBar}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navButton} ${activePage === 'landing' ? styles.activeNav : ''}`}
              type="button"
              onClick={() => handleNavigation('landing')}
            >
              Home
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navButton} ${activePage === 'app' ? styles.activeNav : ''}`}
              type="button"
              onClick={() => handleNavigation('app')}
            >
              Create Allocation
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navButton} ${activePage === 'about' ? styles.activeNav : ''}`}
              type="button"
              onClick={() => handleNavigation('about')}
            >
              About
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navButton} ${activePage === 'contact' ? styles.activeNav : ''}`}
              type="button"
              onClick={() => handleNavigation('contact')}
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>

      {/* Render marketing pages WITHOUT container */}
      {activePage !== 'app' && (
        <main className={styles.fullWidthContent}>
          {renderMarketingPage()}
        </main>
      )}

      {/* Render app pages WITH container */}
      {activePage === 'app' && (
        <main id="content-area" className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            {renderAppPage()}
          </div>
        </main>
      )}

      <footer className={styles.footer}>
        <p className={styles.footerText}>&copy; Alex 2025</p>
      </footer>

      
    </div>
  );
}

export default MainPage;
