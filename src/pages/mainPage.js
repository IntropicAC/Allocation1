import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useAuth0 } from '@auth0/auth0-react';
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
import LogoutButton from '../components/LogoutButton';
import LoginButton from '../components/LoginButton';
import VerifyEmailNotice from '../components/VerifyEmailNotice';

// Import GDPR compliance components
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import CookiePolicy from './CookiePolicy';
import AccountSettings from './AccountSettings';
import CookieBanner from '../components/CookieBanner';
import ConsentTracker from '../components/ConsentTracker';
import Footer from '../components/Footer';

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
    startNewAllocation,
    allocationId,
    observationColorPreferences,
    setObservationColorPreferences
  } = props;

  // Auth0 hook
  const { isAuthenticated, isLoading, user, getIdTokenClaims } = useAuth0();

  // State to track email verification
  const [emailVerified, setEmailVerified] = useState(null);

  // Check email verification status from ID token claims
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (isAuthenticated && user) {
        try {
          // Get ID token claims which contain email_verified
          const claims = await getIdTokenClaims();
          const isVerified = claims?.email_verified ?? false;

          console.log('Auth0 User Object:', user);
          console.log('ID Token Claims:', claims);
          console.log('Email Verified:', isVerified);

          setEmailVerified(isVerified);
        } catch (error) {
          console.error('Error getting ID token claims:', error);
          // Fallback to user object
          setEmailVerified(user.email_verified ?? false);
        }
      }
    };

    checkEmailVerification();
  }, [isAuthenticated, user, getIdTokenClaims]);

  // Navigation state - determines which page to show
  const [activePage, setActivePage] = useState('landing'); // 'landing', 'about', 'contact', 'app', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'account-settings'
  
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

  // Allocation settings - with localStorage persistence
  const [isTransposed, setIsTransposed] = useState(false);
  const [timeRange, setTimeRange] = useState('day');
  const [colorCodingEnabled, setColorCodingEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('colorCodingEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [dragDropEnabled, setDragDropEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('dragDropEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // Derive cellColors from staff array
  const cellColors = useMemo(() => {
    const colors = {};
    staff.forEach(member => {
      if (member.cellFormatting) {
        Object.entries(member.cellFormatting).forEach(([hour, format]) => {
          if (format.bgColor) {
            colors[`${member.name}-${hour}`] = format.bgColor;
          }
        });
      }
    });
    return colors;
  }, [staff]);

  // Derive textColors from staff array
  const textColors = useMemo(() => {
    const colors = {};
    staff.forEach(member => {
      if (member.cellFormatting) {
        Object.entries(member.cellFormatting).forEach(([hour, format]) => {
          if (format.textColor) {
            colors[`${member.name}-${hour}`] = format.textColor;
          }
        });
      }
    });
    return colors;
  }, [staff]);

  // Derive cellDecorations from staff array
  const cellDecorations = useMemo(() => {
    const decorations = {};
    staff.forEach(member => {
      if (member.cellFormatting) {
        Object.entries(member.cellFormatting).forEach(([hour, format]) => {
          if (format.bold || format.underline) {
            decorations[`${member.name}-${hour}`] = {
              bold: format.bold || false,
              underline: format.underline || false
            };
          }
        });
      }
    });
    return decorations;
  }, [staff]);
  const [hasUnfinishedForm, setHasUnfinishedForm] = useState(false);

  // Tutorial state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeTutorialPages, setActiveTutorialPages] = useState(null);
  const [activeTutorialKey, setActiveTutorialKey] = useState(null);

  // Save color coding setting to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('colorCodingEnabled', JSON.stringify(colorCodingEnabled));
    } catch (error) {
      console.error('Error saving colorCodingEnabled:', error);
    }
  }, [colorCodingEnabled]);

  // Save drag-drop setting to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dragDropEnabled', JSON.stringify(dragDropEnabled));
    } catch (error) {
      console.error('Error saving dragDropEnabled:', error);
    }
  }, [dragDropEnabled]);

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
      // ✅ Remove lock icons from copied table
      const lockIcon = cell.querySelector('span[title="User-assigned (locked)"]');
      if (lockIcon) {
        lockIcon.remove();
      }
      
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
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'cookie-policy':
        return <CookiePolicy />;
      case 'account-settings':
        return <AccountSettings />;
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
            staff={staff}
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
              textColors={textColors}
              cellDecorations={cellDecorations}
              observationColorPreferences={observationColorPreferences}
              setObservationColorPreferences={setObservationColorPreferences}
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
            allocationId={allocationId}
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
          {isAuthenticated && (
            <li className={styles.navItem}>
              <button
                className={`${styles.navButton} ${activePage === 'account-settings' ? styles.activeNav : ''}`}
                type="button"
                onClick={() => handleNavigation('account-settings')}
              >
                Account
              </button>
            </li>
          )}
          {(isAuthenticated || !isLoading) && (
            <li className={styles.navItem} style={{ marginLeft: 'auto', marginRight: 0 }}>
              {isAuthenticated ? (
                <LogoutButton className={`${styles.navButton} ${styles.logoutButton}`}>
                  Log Out
                </LogoutButton>
              ) : (
                <LoginButton className={`${styles.navButton} ${styles.logoutButton}`}>
                  Log In
                </LoginButton>
              )}
            </li>
          )}
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
            {isLoading || (isAuthenticated && emailVerified === null) ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <p>Loading...</p>
              </div>
            ) : !isAuthenticated ? (
              <div className={styles.authRequired}>
                <div className={styles.authCard}>
                  <div className={styles.authIcon}>
                    <i className="fas fa-lock"></i>
                  </div>
                  <h2 className={styles.authTitle}>Authentication Required</h2>
                  <p className={styles.authText}>
                    Please log in to access the allocation tool.
                  </p>
                  <LoginButton className={styles.authButton}>
                    <i className="fas fa-sign-in-alt"></i>
                    Go to Login
                  </LoginButton>
                </div>
              </div>
            ) : isAuthenticated && emailVerified === false ? (
              <VerifyEmailNotice />
            ) : (
              renderAppPage()
            )}
          </div>
        </main>
      )}

      {/* Replace old footer with new GDPR-compliant footer */}
      <Footer onNavigate={handleNavigation} />

      {/* GDPR Compliance Components */}
      <CookieBanner />
      <ConsentTracker />
    </div>
  );
}

export default MainPage;
