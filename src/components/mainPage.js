// MainPage.jsx
import React from 'react';
import styles from './mainPage.module.css'; // Make sure the path is correct
import AllocationInput from './allocationInput'; // Adjust the path if necessary
import PatientInput from './patientInput';

function MainPage() {
  return (
    <div>
      {/* Navigation */}
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          {/* Add more navigation links as necessary */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main id="content-area">
        <table id="observations-table">
          <thead>
            <tr id="header-row">
              {/* Table headers should be placed here */}
            </tr>
          </thead>
          <tbody>
            {/* Table content should be placed here */}
          </tbody>
        </table>
        {/*<button className="modern-button" id="modernButton">
          <span>Create Allocation</span>
        </button>*/}
        {/*<AllocationInput/>*/}
        <PatientInput/>
      </main>
    
      {/* Footer */}
      <footer>
        <p>&copy; 2023 Alex</p>
      </footer>
    </div>
  );
}

export default MainPage;
