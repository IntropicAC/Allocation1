import React, { useState, useEffect } from "react";
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
  copyTable,
}) {
  const [observationsWithStaffNeeded, setObservationsWithStaffNeeded] =
    useState([]);


    function createInterleavedObservationsList(observations) {
      // Find the maximum staff requirement
      let maxStaffRequirement = Math.max(...observations.map(obs => obs.staff));
  
      // Filter observations that have the maximum staff requirement
      let highestStaffObservations = observations.filter(obs => obs.staff === maxStaffRequirement);
  
      // Interleave only these observations
      let interleavedObservations = [];
      for (let i = 0; i < maxStaffRequirement; i++) {
          highestStaffObservations.forEach(observation => {
              if (observation.staff > i) {
                  interleavedObservations.push(observation);
              }
          });
      }
  
      // Append remaining observations (with lower staff requirements)
      let remainingObservations = observations.filter(obs => obs.staff < maxStaffRequirement);
      interleavedObservations = interleavedObservations.concat(remainingObservations);
  
      return interleavedObservations;
  }
  
  function calculateMaxObservations(observations, staff) {
    const totalObs = observations.reduce((sum, observation) => sum + observation.staff, 0) * 12;
    const numStaffMembers = staff.length;
    return Math.ceil(totalObs / numStaffMembers);
  }
  
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  function initializeStaffMembers(staff) {
    staff.forEach(staffMember => {
      staffMember.observations = {};
      staffMember.lastObservation = staffMember.observationId;
      staffMember.obsCounts = {};
      staffMember.lastReceived = {};
      for (let hour = 7; hour <= 19; hour++) {
        staffMember.observations[hour] = (hour === 8 && staffMember.observationId && staffMember.observationId !== '-') ? staffMember.observationId : '-';
        if (hour === 7) staffMember.observations[hour] = '-';
      }
      staffMember.numObservations = staffMember.observationId && staffMember.observationId !== '-' ? 1 : 0;
    });
  }
  
  function separateAndInterleaveObservations(observations) {
    const genObservation = observations.find(obs => obs.name === 'Generals');
    const otherObservations = observations.filter(obs => obs.name !== 'Generals');
  
    shuffleArray(otherObservations);
    const interleavedObservations = createInterleavedObservationsList(otherObservations);
  
    if (genObservation) {
      interleavedObservations.push(genObservation);
    }
  
    return interleavedObservations;
  }
  
  
  function calculateStaffScore(staffMember, hour, maxObs, observation) {
    let score = 0;
     let lastLoggedObservation = "";
    if (staffMember.security === false) {
              score += maxObs - staffMember.numObservations;
  
  
              if (
                staffMember.observations[hour - 1] === "Generals" &&
                staffMember.observations[hour - 2] === "-"
              ) {
                score += 5;
              }
  
              if (staffMember.observations[hour - 1] !== "-") {
                score -= 15;
              }
              if (
                hour >= 10 &&
                staffMember.observations[hour - 1] !== "-" &&
                staffMember.observations[hour - 2] !== "-"
              ) {
                score -= 15;
              }
              if (
                hour >= 11 &&
                staffMember.observations[hour - 1] !== "-" &&
                staffMember.observations[hour - 2] !== "-" &&
                staffMember.observations[hour - 3] !== "-"
              ) {
                score -= 20;
              }
              if (
                hour >= 12 &&
                staffMember.observations[hour - 1] !== "-" &&
                staffMember.observations[hour - 2] !== "-" &&
                staffMember.observations[hour - 3] !== "-" &&
                staffMember.observations[hour - 4] !== "-"
              ) {
                score -= 20;
              }
              if (
                hour >= 12 &&
                staffMember.observations[hour - 1] !== "-" &&
                staffMember.observations[hour - 2] !== "-" &&
                staffMember.observations[hour - 3] !== "-" &&
                staffMember.observations[hour - 4] !== "-" &&
                staffMember.observations[hour - 5] !== "-"
              ) {
                score -= 15;
              }
  
              //----------- Free hour additions ---------
  
              if (staffMember.observations[hour - 1] === "-") {
                score += 15;
              }
  
              if (
                hour >= 10 &&
                staffMember.observations[hour - 1] === "-" &&
                staffMember.observations[hour - 2] === "-"
              ) {
                score += 15;
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
                  if (observation.name === "Generals") {
                    score -= 10; // Increase the score
                  }
                  break;
                }
              }
  
  
              if (observation.name !== "Generals") {
                let hasReceivedObservationRecently =
                  staffMember.observations[hour - 2] === observation.name;
  
                if (hasReceivedObservationRecently) {
                  score -= 20; // Subtract from the score to reduce the likelihood of assigning the same observation
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
  
  // HAVING THIS ON 0 CREATED BEST RESULT WHEN BW X2 GG X2 HH X1 GEN X1
              if ( 
                staffMember.observations[hour - 1] !== observation.name &&
                staffMember.observations[hour - 2] !== observation.name 
              ) {
                score += 15;
              }
  
              if (observation.name === staffMember.observations[hour - 1]) {
                score -= 1000;
              }
  
  
              let noOneElseCanReceive = staff.every(member =>
                member.observations[hour - 1] !== '-' || // did not have a free hour previously
                member.observations[hour] !== '-' || // already has an observation this hour
                (member.observations[hour - 1] === '-' && observation.name === member.observations[hour - 1]) // had a free hour but cannot receive the same observation
              );
  
              if (noOneElseCanReceive && staffMember.observations[hour - 2] === '-' && staffMember.observations[hour - 1] === 'Generals' && observation.name !== 'Generals') {
                score += 1000; // Increase the score by Y amount, where Y is a significant value
  
              }
              if (staffMember.break === 19 && staffMember.numObservations <= maxObs && staffMember.observations[hour - 1] === '-') {
                score += 10;
              }
  
              if (
                staffMember.observations[hour - 1] !== '-' &&
                staffMember.observations[hour - 2] !== '-' &&
                staffMember.observations[hour - 3] !== '-' &&
                observation.name !== 'Generals'
              ) {
                score -= 15;
              }
  
  
              
             /* if (
                staffMember.observations[hour - 1] !== observation.name &&
                staffMember.observations[hour - 2] !== '-'
              ) {
                score -= 15;
              }
  
              /*if(
        staffMember.observations[hour-1] !== observation.name
        
        
        )
            if( staffMember.observations[hour - 1] !== '-' &&
                staffMember.observations[hour - 2] !== '-' &&){
            
            }*/
  
  
  
            }
  
            if (staffMember.security === true) {
              if (hour === 10 || hour === 11 || hour === 13 || hour === 16) {
                score -= 25;
              }
              if (hour === 9 || hour === 13 ||hour === 14 || hour === 15 ||hour === 18)
              score =+ 20;
            }
  
        console.log(`Hour: ${hour}, Observation: ${observation.name}, Staff Member: ${staffMember.name}, Score: ${score}`);
    return score;
  }
  
  
  function randomSortEqualScores(a, b) {
    return Math.random() - 0.5;
  }
  
  
  function sortStaffByScore(staff, hour, maxObs, observation, maxObservations) {
    // First, filter out staff members who do not meet the assignment conditions
    let eligibleStaff = staff.filter(staffMember => 
      checkAssignmentConditions(staffMember, hour, observation, maxObservations)
    );
  
    // Then, calculate scores for the eligible staff and sort them
    let staffWithScores = eligibleStaff.map(staffMember => {
      const score = calculateStaffScore(staffMember, hour, maxObs, observation);
      return {
        ...staffMember,
        score
      };
    });
  
    staffWithScores.sort((a, b) => {
      if (b.score === a.score) {
        return randomSortEqualScores(a, b);
      }
      return b.score - a.score;
    });
  
    return staffWithScores;
  }
  
  
  
  function checkAssignmentConditions(staffMember, hour, observation, maxObs) {
    let hadObservationLastHour = staffMember.lastObservation === observation.name;
    let hasObservationAlready = staffMember.observations[hour] !== "-";
  
    let maxObsSecurity = staffMember.security === true && staffMember.numObservations >= 4;
  
    let isOnBreak = staffMember.break === hour;
    let isSecurityHour = (hour === 12 || hour === 17 || hour === 19) && staffMember.security === true;
  
    return !hasObservationAlready && !hadObservationLastHour && !isOnBreak && !isSecurityHour && !maxObsSecurity;
  }
  
  
  function assignObservation(staffMember, hour, observation) {
    staffMember.observations[hour] = observation.name;
    staffMember.numObservations++;
    staffMember.lastObservation = observation.name;
  
    if (staffMember.security === true) {
      staffMember.lastSecurityObservationHour = hour;
    }
  
    if (!staffMember.obsCounts[observation.name]) {
      staffMember.obsCounts[observation.name] = 1;
    } else {
      staffMember.obsCounts[observation.name]++;
    }
  
    // console.log(`Assigned to ${staffMember.name} at hour ${hour} with score ${staffMember.score}`);
  }
  
  function assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObservations) {
    for (let i = 0; i < staffWithScores.length; i++) {
      let staffMember = staff.find(member => member.name === staffWithScores[i].name);
      if (checkAssignmentConditions(staffMember, hour, observation, maxObservations)) {
        assignObservation(staffMember, hour, observation);
        console.log(`Assigning ${observation.name} to ${staffMember.name} at hour ${hour}`);
        break;
      }
    }
  }
  
  
  
  function allocateObservations(observations, staff) {
    const maxObs = calculateMaxObservations(observations, staff);
    console.log(maxObs);
  
    initializeStaffMembers(staff);
  
   const interleavedObservations = separateAndInterleaveObservations(observations);
  for (let hour = 9; hour <= 19; hour++) {
     
    interleavedObservations.forEach(observation => {
    
      const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs);
  
      assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs);
    
  });
  }
    return staff;
  }
  




  const handleAllocate = () => {
    let allocationCopy = allocateObservations([...observations], [...staff] );

    setAllocatedStaff(allocationCopy);
  };

  

  const handleNext = () => {
    if (currentPage === "patient" && observations.length < 1) {
      alert("At least 1 observation is required");
      return; // Prevents moving to the next page
    }

    if (currentPage === "staff" && staff.length < 2) {
      alert("At least 2 staff members are required");
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
    return observations.map((observation) => {
      const assignedStaffCount = staff.filter(
        (staffMember) => staffMember.observationId === observation.id
      ).length;
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
          <span
            className={isCopied ? styles.buttonTextCopied : styles.buttonText}
          >
            {isCopied ? "Copied!" : "Copy Table"}
          </span>
          {isCopied && <span className={styles.checkmark}>✓</span>}
        </button>
      )}

      {/* Spacer for patient page */}
      {currentPage !== "staff" && currentPage !== "allocation" && (
        <div className={styles.spacer}></div>
      )}

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
          className={
            currentPage === "patient"
              ? styles.nextButton
              : styles.createAllocation
          }
          onClick={handleNext}
        >
          {currentPage === "patient" ? "Next" : "Create Allocation"}
        </button>
      )}
    </div>
  );
}

export default NavigationButtons;
