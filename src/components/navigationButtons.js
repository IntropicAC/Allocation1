import React from 'react';
import styles from './navigationButtons.module.css';
import { allocateObservations } from './allocationCode'; 

function NavigationButtons({ onBack, onNext, currentPage, setAllocatedStaff, staff, observations}) {


  const handleAllocate = () => {
    if (staff && observations) { // Ensure neither staff nor observations is undefined
      const newStaffAllocations = allocateObservations([...staff], [...observations]);
      setAllocatedStaff(newStaffAllocations); // Update state with the new allocations
    }
  };




  return (
    <div className={styles.navigationContainer}>
      {/* Show back button for staff and allocation pages, otherwise show a spacer */}
      {(currentPage === 'staff' || currentPage === 'allocation') && (
        <button onClick={onBack} className={styles.backButton}>Back</button>
      )}

      {/* Show allocate button on staff page */}
      {currentPage === 'staff' && (
        <button onClick={handleAllocate} className={styles.allocateButton}>
          Allocate Observations
        </button>
      )}

      {/* Spacer to push the next button to the right when on the patient page */}
      {currentPage === 'patient' && <div className={styles.spacer}></div>}

      {/* Show next button for patient and staff pages, otherwise show a spacer */}
      {(currentPage === 'patient' || currentPage === 'staff') && (
        <button className={styles.nextButton} onClick={onNext}>Next</button>
      )}

      {/* Ensure right alignment by adding a spacer if there's no back button */}
      {currentPage !== 'staff' && currentPage !== 'allocation' && (
        <div className={styles.spacer}></div>
      )}
    </div>
  );
}

export default NavigationButtons;

