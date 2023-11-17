import React, {useState,useEffect} from "react";
import styles from "./navigationButtons.module.css";
//import { allocateObservations } from "./allocationCode";
//import { createTable } from "./allocationCode";

function NavigationButtons({
  onBack,
  onNext,
  currentPage,
  setAllocatedStaff,
  staff,
  observations,
  copyTable
}) {

  const [observationsWithStaffNeeded, setObservationsWithStaffNeeded] = useState([]);

  const handleAllocate = () => {
      let allocationCopy = allocateObservations(
        [...staff],
        [...observations]
      );

      setAllocatedStaff(allocationCopy)
  };

  function allocateObservations() {

    const totalObs = observations.reduce((sum, observation) => sum + observation.staff, 0) * 12;
    const numStaffMembers = staff.length;
    const maxObs = Math.ceil(totalObs / numStaffMembers);
    console.log(maxObs);
  
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    staff.forEach(staffMember => {
      staffMember.observations = {};
      staffMember.lastObservation = staffMember.observationId;
      staffMember.obsCounts = {};
      staffMember.lastReceived = {};

      for (let hour = 8; hour <= 19; hour++) {
        if (hour === 8) {
          staffMember.observations[hour] = staffMember.observationId && staffMember.observationId !== '-' ? staffMember.observationId : '-';
        } else {
          staffMember.observations[hour] = '-';
        }
      }
    
      if (staffMember.observationId && staffMember.observationId !== '-') {
        staffMember.obsCounts[staffMember.observationId] = 1;
        staffMember.numObservations = 1;
      } else {
        staffMember.numObservations = 0;
      }
    });
    
    const observationAverages = {};
  
    for (let hour = 9; hour <= 19; hour++) {
      staff.forEach(staffMember => {
        staffMember.lastObservation = staffMember.observations[hour - 1];
      });
  
      shuffleArray(staff);
  
      // Check if 'Generals' exists in the observations
      const genObservation = observations.find(obs => obs.name === 'Generals');

      let shuffledObservations;

      if (genObservation) {
        // 'Generals' exists, separate it from other observations
        const otherObservations = observations.filter(obs => obs.name !== 'Generals');

        // Shuffle the other observations only
        shuffleArray(otherObservations);

        // Sort other observations by staff value
        otherObservations.sort((a, b) => b.staff - a.staff);

        // Append 'Gen' at the end of the array
        shuffledObservations = [...otherObservations, genObservation];
      } else {
        // 'Generals' does not exist, just shuffle and sort the original observations
        shuffleArray(observations);
        observations.sort((a, b) => b.staff - a.staff);
        shuffledObservations = observations;
      }

      shuffledObservations.forEach(observation => {
  
        //observations.forEach(observation => {
        let assigned = 0;
        let loopCounter = 0;
  
        while (assigned < observation.staff) {
          loopCounter++;
          if (loopCounter > 1000) {
            console.error('Stuck in loop');
            console.log(`Unable to assign observation: ${observation.name} at hour: ${hour}`);
            break;
          }
  
  
                    /* ---------------  sORTING  ------------------------- */

        let lastLoggedObservation = "";
        // Calculate scores for each staff member
        let staffWithScores = staff.map((staffMember) => {
          let score = 0;

          if (staffMember.security === false) {
            score += maxObs - staffMember.numObservations + 2;

            if (hour === 9 && staffMember.observationId === "Generals") {
              score += 2;
            }

            if (
              staffMember.observations[hour - 1] === "Generals" &&
              staffMember.observations[hour - 2] === "-"
            ) {
              score += 3000;
            }

            if (
              hour >= 10 &&
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 2] !== "-"
            ) {
              score -= 2;
            }
            if (
              hour >= 11 &&
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 2] !== "-" &&
              staffMember.observations[hour - 3] !== "-"
            ) {
              score -= 3;
            }
            if (
              hour >= 12 &&
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 2] !== "-" &&
              staffMember.observations[hour - 3] !== "-" &&
              staffMember.observations[hour - 4] !== "-"
            ) {
              score -= 5;
            }
            if (
              hour >= 12 &&
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 2] !== "-" &&
              staffMember.observations[hour - 3] !== "-" &&
              staffMember.observations[hour - 4] !== "-" &&
              staffMember.observations[hour - 5] !== "-"
            ) {
              score -= 8;
            }

            //----------- Free hour additions ---------
            if (observation.name !== "Generals") {
              if (staffMember.observations[hour - 1] === "-") {
                score += 4;
              }
            }
            if (
              hour >= 10 &&
              staffMember.observations[hour - 1] === "-" &&
              staffMember.observations[hour - 2] === "-"
            ) {
              score += 5;
            }
            if (
              hour >= 11 &&
              staffMember.observations[hour - 1] === "-" &&
              staffMember.observations[hour - 2] === "-" &&
              staffMember.observations[hour - 3] === "-"
            ) {
              score += 5;
            }
            if (
              hour >= 12 &&
              staffMember.observations[hour - 1] === "-" &&
              staffMember.observations[hour - 2] === "-" &&
              staffMember.observations[hour - 3] === "-" &&
              staffMember.observations[hour - 4] === "-"
            ) {
              score += 5;
            }

            for (let k = 1; k <= 4; k++) {
              // Look back 4 hours

              if (hour - k < 8) {
                break;
              }

              if (staffMember.observations[hour - k] === "Generals") {
                // If 'gen' was observed in the last 4 hours
                if (observation.name !== "Generals") {
                  score += 1; // Increase the score
                }
                break;
              }
            }
            if (staffMember.observations[hour - 1] !== "-") {
              score -= 11;
            }

            if (
              observation.name === "Generals" &&
              staffMember.observations[hour - 1] !== "-"
            ) {
              score += 13;
            }

            if (observation.name !== "Generals") {
              let hasReceivedObservationRecently =
                staffMember.observations[hour - 2] === observation.name;
              let hadGenTwoHoursAgo =
                staffMember.observations[hour - 2] === "Generals";

              if (!hasReceivedObservationRecently && !hadGenTwoHoursAgo) {
                score += 10; // Add to the score to prioritize this staff member
              }
            }

            if (observation.name !== "Generals") {
              let hasReceivedObservationRecently =
                staffMember.observations[hour - 2] === observation.name;

              if (hasReceivedObservationRecently) {
                score -= 10; // Subtract from the score to reduce the likelihood of assigning the same observation
              }
            }

            if (
              hour + 1 === staffMember.break &&
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 1] !== "Generals" &&
              staffMember.observations[hour - 2] === "-"
            ) {
              if (observation.name === "Generals") {
                score += 20; // Increase the score significantly to prioritize this staff member for 'Gen'
              }
            }
          }

          if (staffMember.security === true) {
            if(hour === 10 || hour === 11 || hour === 13 || hour === 16) {
              score -= 15;
            }

            
          }
  
            /*if (hour >= 8 && hour <= 19) {
              // Check if the current observation is different from the last one we logged
              if (observation.name !== lastLoggedObservation) {
                console.log(`Assigning Observation: ${observation.name}`);
                console.log('--------------------------------------------------');
                lastLoggedObservation = observation.name; // Update the last logged observation
              }
              console.log(`Hour: ${hour}, Staff: ${staffMember.name}, Score: ${score}`);
            }*/
  
            return {
              ...staffMember,
              score
            };
          });
  
          staffWithScores.sort((a, b) => b.score - a.score);
  
  
  
  
          /* ------------------  IF'S ---------------------- */
  
          for (let i = 0; i < staffWithScores.length; i++) {
            let hasObservationAlready = staffWithScores[i].observations[hour] !== '-';
            let hasSameLastObservation = staffWithScores[i].lastObservation === observation.name;
            let isOnBreak = staffWithScores[i].break === hour;
            let isSecurityHour = (hour === 12 || hour === 17 || hour === 19) && staffWithScores[i].security !== false;
            let reachedMaxObservations = staffWithScores[i].numObservations >= maxObs + 1;
            let reachedSecurityLimit = staffWithScores[i].security !== false && staffWithScores[i].numObservations >= staffWithScores[i].security;
  
            if (!hasObservationAlready && !hasSameLastObservation && !isOnBreak && !isSecurityHour && !reachedSecurityLimit /*&& !reachedMaxObservations*/ ) {
              let staffMember = staff.find(member => member.name === staffWithScores[i].name);
              staffMember.observations[hour] = observation.name;
              staffMember.numObservations++;
              staffMember.lastObservation = observation.name;
  
              if (staffMember.security !== false) {
                staffMember.lastSecurityObservationHour = hour;
              }
              if (!staffMember.obsCounts[observation.name]) {
                staffMember.obsCounts[observation.name] = 1;
              } else {
                staffMember.obsCounts[observation.name]++;
              }
  
              assigned++;
              //console.log(`Assigned to ${staffMember.name} at hour ${hour} with score ${staffMember.score}`);
              break;
            }
          }
        }
      });
  
      observations.forEach(observation => {
        let totalForObservation = staff.reduce((acc, staffMember) => {
          return acc + (staffMember.obsCounts[observation.name] || 0);
        }, 0);
        observationAverages[observation.name] = totalForObservation / numStaffMembers;
      });
    }
    return staff;
  }


  const handleNext = () => {

    if (currentPage === "patient" && observations.length < 1) {
      alert("At least 1 observation is required");
      return; // Prevents moving to the next page
    }

    if (currentPage === "staff" && staff.length < 2) {
      alert("At least 1 staff member is required");
      return; // Prevents moving to the next page
    }

    if (currentPage === "staff") {
      handleAllocate();
      setTimeout(() => {
        onNext();
      }, 100); 
    } else {
      onNext();
    }
  };

  const updateStaffNeeded = () => {
    return observations.map(observation => {
      const assignedStaffCount = staff.filter(staffMember => staffMember.observationId === observation.id).length;
      return {
        ...observation,
        staffNeeded: Math.max(0, observation.staff - assignedStaffCount),
      };
    });
  };
  

useEffect(() => {
  const updatedObservations = updateStaffNeeded();
  setObservationsWithStaffNeeded(updatedObservations);
}, [staff]); // Dependency array includes staff, so this effect runs whenever staff changes

    const [isCopied, setIsCopied] = useState(false);

    const handleCopyClick = () => {
      copyTable();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 3 seconds
    };


  return (

    <div className={styles.navigationContainer}>
      {/* Existing Back Button */}
      {(currentPage === "staff" || currentPage === "allocation") && (
        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
      )}

      {currentPage === "allocation" && (
        <button onClick={handleCopyClick} className={styles.animatedCopyButton}>
          <span className={isCopied ? styles.buttonTextCopied : styles.buttonText}>
            {isCopied ? 'Copied!' : 'Copy Table'}
          </span>
          {isCopied && <span className={styles.checkmark}>✓</span>}
        </button>
      )}

      {/* Spacer for patient page */}
      {currentPage !== "staff" && currentPage !== "allocation" && <div className={styles.spacer}></div>}

      {/* Dynamic Display for Staff Page */}
      {currentPage === "staff" && (
        <div className={styles.observationsInfo}>
           {observationsWithStaffNeeded.map((observation, index) => (
        <div key={index} className={styles.observationDetail}>
          <span>{observation.name}:</span>
          <span> {observation.staffNeeded}</span>
        </div>
     ))}
        </div>
      )}

      {/* Existing Next/Create Allocation Button */}
      {(currentPage === "patient" || currentPage === "staff") && (
        <button 
          className={currentPage === "patient" ? styles.nextButton : styles.createAllocation} 
          onClick={handleNext}
        >
          {currentPage === "patient" ? "Next" : "Create Allocation"}
        </button>
      )}
    </div>
  );
}

export default NavigationButtons;
