// MainPage.jsx
import React, {useState} from 'react';
import styles from './mainPage.module.css'; // Make sure the path is correct
import AllocationInput from './staffInput'; // Adjust the path if necessary
import PatientInput from './patientInput';
import NavigationButtons from './navigationButtons';

function MainPage() {
  const [observations, setObservations] = useState([]);
  const [currentPage, setCurrentPage] = useState('patient'); // 'patient' or 'allocation'
  const [staff, setStaff] = useState([]);

  const handleNext = () => {
    if (currentPage === 'patient') {
      setCurrentPage('allocation');
    }
  };

  const handleBack = () => {
    if (currentPage === 'allocation') {
      setCurrentPage('patient');
    }
  };

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
        <div className="content-wrapper">
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
        {currentPage === 'patient' && <PatientInput observations={observations} setObservations={setObservations} />}
          {currentPage === 'allocation' && <AllocationInput staff={staff} setStaff={setStaff} observations={observations}/>}

        </div>
        <NavigationButtons currentPage={currentPage} onNext={handleNext} onBack={handleBack} />

      </main>
    
      {/* Footer */}
      <footer>
        <p>&copy; 2023 Alex</p>
      </footer>
    </div>
  );
}

export default MainPage;
