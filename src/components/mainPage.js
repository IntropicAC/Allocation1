// MainPage.jsx
import React, { useState, useRef, useEffect } from "react";
import styles from "./mainPage.module.css";
import StaffInput from "./staffInput";
import PatientInput from "./patientInput";
import NavigationButtons from "./navigationButtons";
import AllocationCreation from "./allocationCreation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactToPrint from "react-to-print";

function MainPage({ observations, setObservations, staff, setStaff }) {
  const [currentPage, setCurrentPage] = useState("patient");
  const [selectedStartHour, setSelectedStartHour] = useState(null);

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

      // Ensure borders are collapsed into a single border
      clonedTable.style.borderCollapse = "collapse"; // Add this line
      clonedTable.style.minHeight = "100%";
      clonedTable.style.minHeight = "100vh";
      clonedTable.style.fontFamily = "Calibri, sans-serif";
      const cells = clonedTable.querySelectorAll("td, th");
      cells.forEach((cell) => {
        // Reset padding and margin, set borders, and center align the text
        cell.style.padding = "0";
        cell.style.margin = "0";
        cell.style.border = "1px solid black"; // Set cell borders
        cell.style.textAlign = "center"; // Center align horizontally
        cell.style.verticalAlign = "middle"; // Center align vertically
        cell.style.whiteSpace = "nowrap"; // Prevent text wrapping
      });

      // Optional: If you also want to ensure the table itself has a border
      clonedTable.style.border = "1px solid black";

      // Serialize the cloned table to an HTML string
      const serializer = new XMLSerializer();
      let tableHtml = serializer.serializeToString(clonedTable);

      try {
        // Use the Clipboard API to copy the modified table HTML
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

  /*const printTable = () => {
    if (tableRef.current) {
      const printWindow = window.open('', '_blank', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print Table</title>');
      printWindow.document.write('<style>');
      // Ensure the table uses all available space and respects page margins
      printWindow.document.write(`
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
        table {
          width: 100%; 
          border-collapse: collapse;
          table-layout: fixed; /* Ensures columns have equal width */ /*
          margin: 20mm; /* Adjust the margin as needed */ /*
        }/*
        th, td {
          border: 1px solid black; 
          padding: 8px; 
          text-align: left; 
          word-wrap: break-word; /* Ensures text wraps within the cell */ /*
          vertical-align: top; /* Aligns content to the top */ /*
        }/*
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(tableRef.current.outerHTML); // Insert the table HTML
      printWindow.document.write('</body></html>');
      printWindow.document.close(); // Close the document to finish writing
      printWindow.focus(); // Focus on the new window—important for some browsers
      printWindow.print(); // Trigger the browser's print dialog
      printWindow.onafterprint = printWindow.close; // Close the window after printing
    }
  };
  
  */

  return (
    <div className="hero">
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
              setObservations={setObservations}
            />
          )}
          {currentPage === "allocation" && (
            <DndProvider backend={HTML5Backend}>
              <AllocationCreation
                setTableRef={setTableRef}
                observations={observations}
                setObservations={setObservations}
                staff={staff}
                setStaff={setStaff}
                selectedStartHour={selectedStartHour}
                setSelectedStartHour={setSelectedStartHour}
              />
            </DndProvider>
          )}
        </div>

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
        />
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; Alex 2025</p>
      </footer>
    </div>
  );
}

export default MainPage;
