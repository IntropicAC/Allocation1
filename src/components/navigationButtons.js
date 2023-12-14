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

		

      let maxStaffRequirement = Math.max(...observations.map(obs => obs.staff));
  
      // Separate observations into those with max staff and those with less
      let maxStaffObservations = observations.filter(obs => obs.staff === maxStaffRequirement);
      let otherObservations = observations.filter(obs => obs.staff < maxStaffRequirement);
  
      let interleavedObservations = [];
  
      // Check if there's only one maxStaffObservation
      if (maxStaffObservations.length === 1) {
          // Include the maxStaffObservation with other observations
          otherObservations.unshift(...maxStaffObservations);
          otherObservations.forEach(obs => {
              for (let i = 0; i < obs.staff; i++) {
                  interleavedObservations.push({ name: obs.name, staff: 1 });
              }
          });
      } else {
          // Initialize counters for each max staff observation
          let counters = maxStaffObservations.map(() => 0);
  
          // Interleave only observations with the maximum staff requirement
          for (let i = 0; i < maxStaffRequirement; i++) {
              maxStaffObservations.forEach((obs, index) => {
                  if (counters[index] < obs.staff) {
                      interleavedObservations.push(obs);
                      counters[index]++;
                  }
              });
          }
  
          // Expand and append the other observations
          otherObservations.forEach(obs => {
              for (let i = 0; i < obs.staff; i++) {
                  interleavedObservations.push({ name: obs.name, staff: 1 });
              }
          });
      }
  
      return interleavedObservations;
  }
  
  
  function assignDifferentObservationFirst(observations, hour, firstObservationEachHour) {
      let maxStaffRequirement = Math.max(...observations.map(obs => obs.staff));
      let highestStaffObservations = observations.filter(obs => obs.staff === maxStaffRequirement);
  
      let interleavedLists = [];
      highestStaffObservations.forEach((firstObservation, index) => {
          let tempObservations = [...highestStaffObservations];
  
          // Identify and remove the matching observation
          const matchingIndex = tempObservations.findIndex(obs => obs.name === firstObservationEachHour[hour]);
          if (matchingIndex !== -1) {
              let [matchingObservation] = tempObservations.splice(matchingIndex, 1); // Remove the matching observation
  
              // Add the matching observation to the end
              tempObservations.push(matchingObservation);
          }
  
          // Interleave the rest of the observations
          let interleavedObservations = [];
          for (let i = 0; i < maxStaffRequirement; i++) {
              tempObservations.forEach(observation => {
                  if (observation.staff > i) {
                      interleavedObservations.push(observation);
                  }
              });
          }
  
          let remainingObservations = observations.filter(obs => obs.staff < maxStaffRequirement);
          interleavedObservations = interleavedObservations.concat(remainingObservations);
  
          interleavedLists.push(interleavedObservations);
      });
  
      return interleavedLists;
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
  
    let interleavedObservations = createInterleavedObservationsList(otherObservations);
  
    interleavedObservations.sort((a, b) => b.staff - a.staff);
  
    if (genObservation) {
      interleavedObservations.push(genObservation);
    }
  
    return interleavedObservations;
  }
  
  function calculateStaffScore(staffMember, hour, maxObs, observation) {
    let score = 0;
     let lastLoggedObservation = "";
    if (staffMember.security === false) {
  
      //score += maxObs - staffMember.numObservations ;


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
        score -= 30;
      }
      if (
        hour >= 12 &&
        staffMember.observations[hour - 1] !== "-" &&
        staffMember.observations[hour - 2] !== "-" &&
        staffMember.observations[hour - 3] !== "-" &&
        staffMember.observations[hour - 4] !== "-"
      ) {
        score -= 50;
      }
      if (
        hour >= 12 &&
        staffMember.observations[hour - 1] !== "-" &&
        staffMember.observations[hour - 2] !== "-" &&
        staffMember.observations[hour - 3] !== "-" &&
        staffMember.observations[hour - 4] !== "-" &&
        staffMember.observations[hour - 5] !== "-"
      ) {
        score -= 20;
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
      if (staffMember.break === 19) {
  // Check if 'Generals' has not been received in any previous hours
  let hasReceivedNoGenerals = Object.values(staffMember.observations).every(obs => obs !== 'Generals');

  if (hasReceivedNoGenerals && observation.name === "Generals") {
      // Increase the score if the current observation is 'Generals'
      score += 10; // Adjust this value as needed
  }
}


      if (observation.name !== "Generals") {
  let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;

  // Generate a random number between 0 and 1
  let randomNumber = Math.random();

  // Apply the condition with a 70% probability
  if (randomNumber < 0.9 && hasReceivedObservationRecently) {
      score -= 10; // Subtract from the score
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
      score += 30;

      if(staffMember.observations[hour - 1] !== '-'){
        score -=50;
      }
      if(staffMember.observations[hour - 2] !== '-'){
        score -=40;
      }
    }
    
  
        //console.log(`Hour: ${hour}, Observation: ${observation.name}, Staff Member: ${staffMember.name}, Score: ${score}`);
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
    let hadObservationLastHour = staffMember.observations[hour-1] === observation.name;
    let hasObservationAlready = staffMember.observations[hour] !== "-";
  
    let maxObsSecurity = staffMember.security === true && staffMember.numObservations >= 4;
  
    let isOnBreak = staffMember.break === hour;
    let isSecurityHour = (hour === 12 || hour === 17 || hour === 19) && staffMember.security === true;
  
    return !hasObservationAlready && !hadObservationLastHour && !isOnBreak && !isSecurityHour && !maxObsSecurity;
  }
  
  
  function assignObservation(staffMember, hour, observation) {
    staffMember.observations[hour] = observation.name;
    staffMember.numObservations++;
  
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
  
  function assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObservations, firstObservationEachHour) {
  
  let assigned = false;
  
      for (let i = 0; i < staffWithScores.length; i++) {
          let staffMember = staff.find(member => member.name === staffWithScores[i].name);
          // Check if the staff member already has an observation for this hour
          if (!checkAssignmentConditions(staffMember, hour, observation, maxObservations)) {
              continue; // Skip to the next staff member if conditions are not met
          }
  
          assignObservation(staffMember, hour, observation);
  
          if (firstObservationEachHour[hour] === undefined) {
              firstObservationEachHour[hour] = observation.name;
          }
          //console.log(`Hour ${hour}: '${observation.name}' assigned to ${staffMember.name}`);
          assigned = true;
          break; // Break after assigning to one staff member
      }
      if (!assigned) {
          console.log(`Hour ${hour}: Unable to assign '${observation.name}' to any staff member`);
      }
  }
  
  
  
  function allocateObservations(observations, staff) {
    const maxObs = calculateMaxObservations(observations, staff);
    console.log(maxObs);
  
    initializeStaffMembers(staff);
  
    
    const interleavedObservations = separateAndInterleaveObservations(observations);
  
    let firstObservationEachHour = {};
    for (let hour = 9; hour <= 19; hour++) {
        
      // Backup the current state before iteration
     /*const backupState = staff.map(staffMember => ({
        name: staffMember.name,
        observations: {...staffMember.observations},
        numObservations: staffMember.numObservations,
        lastObservation: staffMember.lastObservation,
        obsCount: staffMember.obsCounts,
        lastReceived: staffMember.lastReceived
      }));*/
  
      // Iteration for the hour
      
      interleavedObservations.forEach(observation => {
  
        const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs);
        assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs, firstObservationEachHour);
      });
  
      // Check for three consecutive observations
  
      /*let resetNeeded = staff.some(staffMember => 
        hour >= 11 &&
        staffMember.observations[hour] !== '-' &&
        staffMember.observations[hour - 1] !== '-' &&
        staffMember.observations[hour - 2] !== '-'
      );
  
      // Reset state if needed and re-iterate
     if (resetNeeded) {
        // Reset to backup state
        /*backupState.forEach(backup => {
          let staffMember = staff.find(member => member.name === backup.name);
          staffMember.observations = backup.observations;
          staffMember.numObservations = backup.numObservations;
          staffMember.lastObservation = backup.lastObservation;
          staffMember.obsCounts = backup.obsCounts;
          staffMember.lastReceived = backup.lastReceived;
        });
        staff.forEach(staffMember=> {
        staffMember.observations[hour] = '-'
        })
  
  
           const interleavedLists = assignDifferentObservationFirst(observations, hour, firstObservationEachHour);
  
  
        interleavedLists.forEach(observation => {
              const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs);
        assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs, firstObservationEachHour);
          });
        
      }*/
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
