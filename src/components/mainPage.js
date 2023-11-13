// MainPage.jsx
import React, { useState, useEffect } from "react";
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

  return (
    <div>
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
          <table id="observations-table">
            <thead>
              <tr id="header-row">
                {/* Table headers should be placed here */}
              </tr>
            </thead>
            <tbody>{/* Table content should be placed here */}</tbody>
          </table>
          {/*<button className="modern-button" id="modernButton">
          <span>Create Allocation</span>
        </button>*/}
          {currentPage === "patient" && (
            <PatientInput
              observations={observations}
              setObservations={setObservations}
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
            <AllocationCreation staff={staff} observations={observations} />
          )}
        </div>
        <NavigationButtons
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
        <p>&copy; 2023 Alex</p>
      </footer>
    </div>
  );
}

export default MainPage;
