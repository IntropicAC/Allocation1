import React from "react";
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
}) {

  const handleAllocate = () => {
      let allocationCopy = allocateObservations(
        [...staff],
        [...observations]
      );

      setAllocatedStaff(allocationCopy)
  };

  function allocateObservations() {

    /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!! REMINDER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    ------------------ The code only works if the array has a GENERALS if theres an error this could be why---------*/ 


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
  
      // Separate 'Gen' from other observations
      const genObservation = observations.find(obs => obs.name === 'Generals');
      const otherObservations = observations.filter(obs => obs.name !== 'Generals');
      
      
      //Shuffle the other observations only
      shuffleArray(otherObservations);
      
      otherObservations.sort((a, b) => b.staff - a.staff);
      // Append 'Gen' at the end of the array
      const shuffledObservations = [...otherObservations, genObservation];
  
      // Use the shuffledObservations array here instead of the original observations array
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

          if (staffMember.security !== false) {
            if (
              staffMember.observations[hour - 1] !== "-" &&
              staffMember.observations[hour - 2] !== "-" &&
              staffMember.observations[hour - 3] !== "-"
            ) {
              score -= 2000000;
            }

            score += maxObs - staffMember.numObservations - 2;
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
    if (currentPage === "staff") {
      handleAllocate();
      setTimeout(() => {
        onNext();
      }, 100); 
    } else {
      onNext();
    }
  };

  return (
    <div className={styles.navigationContainer}>
      {/* Show back button for staff and allocation pages */}
      {(currentPage === "staff" || currentPage === "allocation") && (
        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
      )}
      {/* If not on staff or allocation page, add a spacer */}
      {!(currentPage === "staff" || currentPage === "allocation") && <div className={styles.spacer}></div>}

      {/* Show next button for patient and staff pages */}
      {(currentPage === "patient" || currentPage === "staff") && (
        <button className={styles.nextButton} onClick={handleNext}>
          Next
        </button>
      )}
    </div>
  );
}

export default NavigationButtons;
