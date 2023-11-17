// MainPage.jsx
import React, { useState, useRef} from "react";
import styles from "./mainPage.module.css";
import StaffInput from "./staffInput";
import PatientInput from "./patientInput";
import NavigationButtons from "./navigationButtons";
import AllocationCreation from "./allocationCreation";

function MainPage({ observations, setObservations, staff, setStaff }) {
  const [allocatedStaff, setAllocatedStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState("patient");

  const handleNext = () => {
    if (currentPage === "patient") {
      setCurrentPage("staff");
    } else if (currentPage === "staff") {
      // When on the 'staff' page, move to 'allocation'
      setCurrentPage("allocation");
    }
  };

  // Update the handleBack function
  const handleBack = () => {
    if (currentPage === "staff") {
      setCurrentPage("patient");
    } else if (currentPage === "allocation") {
      // When on the 'allocation' page, go back to 'staff'
      setCurrentPage("staff");
    }
  };

  const tableRef = useRef(null);

  const setTableRef = (ref) => {
    tableRef.current = ref;
  };

  const copyTable = async () => {
    const table = tableRef.current;
    if (table) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
  
      try {
        // Use the Clipboard API to copy the selected range
        document.execCommand('copy');
        selection.removeAllRanges();
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <body>
      {/* Navigation */}
      <nav>
        <ul>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
          {/* Add more navigation links as necessary */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main id="content-area">
        <div className="content-wrapper">
          {/*<button className="modern-button" id="modernButton">
          <span>Create Allocation</span>
        </button>*/}
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
            />
          )}
          {currentPage === "allocation" && (
            <AllocationCreation allocatedStaff={allocatedStaff} setTableRef={setTableRef}/>
          )}
        </div>
        <NavigationButtons
          copyTable={copyTable}
          currentPage={currentPage}
          onNext={handleNext}
          onBack={handleBack}
          allocatedStaff={allocatedStaff}
          setAllocatedStaff={setAllocatedStaff}
          staff={staff}
          observations={observations}
        />
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; Alex 2023</p>
      </footer>
    </body>
  );
}

export default MainPage;
