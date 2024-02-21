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
  const [unassignedObs, setUnassignedObs] = useState([]);

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
    // Clone the table to avoid altering the original
    const clonedTable = table.cloneNode(true);

    // Apply border and alignment styles to the cloned table, rows, and cells
    clonedTable.style.borderCollapse = 'collapse'; // Ensures borders are collapsed into a single border
    const cells = clonedTable.querySelectorAll('td, th');
    cells.forEach(cell => {
      // Reset padding and margin, set borders, and center align the text
      cell.style.padding = '1.25';
      cell.style.margin = '0';
      cell.style.border = '1px solid black'; // Set cell borders
      cell.style.textAlign = 'center'; // Center align horizontally
      cell.style.verticalAlign = 'middle'; // Center align vertically
    });

    // Optional: If you also want to ensure the table itself has a border
    clonedTable.style.border = '1px solid black';

    // Serialize the cloned table to an HTML string
    const serializer = new XMLSerializer();
    let tableHtml = serializer.serializeToString(clonedTable);

    try {
      // Use the Clipboard API to copy the modified table HTML
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([tableHtml], { type: 'text/html' })
        })
      ]);
      console.log('Table copied successfully!');
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
              unassignedObs={unassignedObs}
              setUnassignedObs={setUnassignedObs}
            />
          )}
          {currentPage === "staff" && (
            <StaffInput
              staff={staff}
              setStaff={setStaff}
              observations={observations}
              unassignedObs={unassignedObs}
              setUnassignedObs={setUnassignedObs}
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
          unassignedObs={unassignedObs}
          setUnassignedObs={setUnassignedObs}
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
