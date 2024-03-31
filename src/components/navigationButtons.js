import React, { useState, useEffect } from "react";
import styles from "./navigationButtons.module.css";
//import { allocateObservations } from "./allocationCode";
//import { createTable } from "./allocationCode";

function NavigationButtons({
  onBack,
  onNext,
  currentPage,
  staff,
  observations,
  copyTable,
  unassignedObs,
  setUnassignedObs,
  setStaff
}) {
    


  function evaluateCriteriaForReiteration(staff, hour, observations) {
    // Correctly find the highest staff number using spread syntax with Math.max()
    const highestStaffNumber = Math.max(...observations.map(obs => obs.staff));
  
    // Count how many observations have this highest staff number
    const countOfHighestStaffObservations = observations.filter(obs => obs.staff === highestStaffNumber).length;
  
    // Only proceed with further checks if there are two or more observations with the highest staff number
    if (countOfHighestStaffObservations >= 2) {
      return staff.some(staffMember => {
        // First set: Check if the observations for the previous 3 hours are not "-"
        const notEmpty = hour >= 10 &&
                         staffMember.observations[hour] !== "-" &&
                         staffMember.observations[hour - 1] !== "-" &&
                         staffMember.observations[hour - 2] !== "-" && 
                         staffMember.observations[hour - 3] !== "-";
  
        // Second set: Check if the observations for the current hour and the previous 3 hours are not "-" AND not "Generals"
        const notEmptyOrGenerals = hour >= 10 &&
                                   staffMember.observations[hour] !== "-" && staffMember.observations[hour] !== "Generals" &&
                                   staffMember.observations[hour - 1] !== "-" && staffMember.observations[hour - 1] !== "Generals" &&
                                   staffMember.observations[hour - 2] !== "-" && staffMember.observations[hour - 2] !== "Generals";
  
        // Return true if either set of conditions is met
        return notEmpty || notEmptyOrGenerals;
      });
    } else {
      // If the condition for highest staff number is not met, no need to check further
      return false;
    }
  }
  
  function clearAndPrepareHourForReiteration(staff, hour, interleavedObservations) {
      staff.forEach(staffMember => {
          // Clear the observation for the current hour
          if (staffMember.observations && staffMember.observations[hour]) {
              staffMember.observations[hour] = "-";
          }
      });
      
  
    
  }
  
  function calculateAvailabilityForEachObservation(observations, staff, hour) {
      let availabilityCounts = {};
   
     
      observations.forEach(observation => {
          availabilityCounts[observation.name] = staff.filter(staffMember => 
              calculateMaxObservations(observations, staff)
          ).length;
      });
    
      return availabilityCounts;
      
  }
  
  
  function newOrderIfSwapRequired(observations, availabilityCounts, firstObservationEachHour, hour, staff) {
      console.log("New Order first value passed:" + firstObservationEachHour[hour]);
      console.log(observations);
  
      // Check if the first observation matches the one specified for the hour
      if (observations[0].name === firstObservationEachHour[hour]) {
          const firstObservationIndex = observations.findIndex(obs => obs.name === firstObservationEachHour[hour]);
  
          // Ensure there's another observation to swap with
          if (firstObservationIndex > -1 && observations.length > 1) {
              const swapIndex = 1; // Since we're only swapping with the first item, if it matches the condition
              // Swap the first observation with the next one in the array
              [observations[firstObservationIndex], observations[swapIndex]] = [observations[swapIndex], observations[firstObservationIndex]];
          }
      }
  
      // Group observations by their staff requirement
      const observationsByStaff = observations.reduce((acc, obs) => {
          const staffCount = obs.staff;
          if (!acc[staffCount]) {
              acc[staffCount] = [];
          }
          acc[staffCount].push(obs);
          return acc;
      }, {});
  
      let interleavedObservations = [];
  
      Object.keys(observationsByStaff).forEach(staffRequirement => {
          let groupedObservations = observationsByStaff[staffRequirement];
  
          // Interleave observations within this group
          let counters = groupedObservations.map(() => 0);
          const maxGroupStaffRequirement = Math.max(...groupedObservations.map(obs => obs.staff));
  
          for (let i = 0; i < maxGroupStaffRequirement; i++) {
              groupedObservations.forEach((obs, index) => {
                  if (counters[index] < obs.staff) {
                      interleavedObservations.push(obs);
                      counters[index]++;
                  }
              });
          }
      });
  
      console.log(interleavedObservations);
      return interleavedObservations;
  }
  
  
  function createInterleavedObservationsList(observations, availabilityCounts,firstObservationEachHour, hour, staff, shouldSwap) {
      
  
  
      console.log("Should swap:" + shouldSwap)
    // Group observations by their staff requirement
    const observationsByStaff = observations.reduce((acc, obs) => {
      const staffCount = obs.staff;
      if (!acc[staffCount]) {
        acc[staffCount] = [];
      }
      acc[staffCount].push(obs);
      return acc;
    }, {});
  
    let interleavedObservations = [];
  
    Object.keys(observationsByStaff).forEach(staffRequirement => {
      let groupedObservations = observationsByStaff[staffRequirement];
  
      // Check if all availability counts are the same within this group
      const availabilityValues = groupedObservations.map(obs => availabilityCounts[obs.name]);
      const allAvailabilityCountsSame = availabilityValues.every(val => val === availabilityValues[0]);
  
      // Sort observations in this group based on their availability counts only if they differ
      if (!allAvailabilityCountsSame) {
        groupedObservations.sort((a, b) => availabilityCounts[a.name] - availabilityCounts[b.name]);
      }
  
      // Interleave observations within this group
      let counters = groupedObservations.map(() => 0);
      const maxGroupStaffRequirement = Math.max(...groupedObservations.map(obs => obs.staff));
  
      for (let i = 0; i < maxGroupStaffRequirement; i++) {
        groupedObservations.forEach((obs, index) => {
          if (counters[index] < obs.staff) {
            interleavedObservations.push(obs);
            counters[index]++;
          }
        });
      }
    });
  
  
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
    
   function separateAndInterleaveObservations(observations, availabilityRecord,firstObservationEachHour, hour, staff, shouldSwap, stillShouldSwap) {
  
      const genObservation = observations.find(obs => obs.name === 'Generals');
      const otherObservations = observations.filter(obs => obs.name !== 'Generals');
    
      shuffleArray(otherObservations);
    let interleavedObservations;
    if(shouldSwap){
      
    interleavedObservations = newOrderIfSwapRequired(otherObservations, availabilityRecord, firstObservationEachHour, hour, staff)
    } else if (stillShouldSwap){
  
      interleavedObservations = otherObservations;
  
    } else {
  
    interleavedObservations = createInterleavedObservationsList(otherObservations, availabilityRecord, firstObservationEachHour, hour, staff);
  }
    
      interleavedObservations.sort((a, b) => b.staff - a.staff);
    
      if (genObservation) {
        interleavedObservations.push(genObservation);
      }
    
      return interleavedObservations;
    }
  
  function calculateStaffScore(staffMember, hour, maxObs, observation, lastObservationAssigned) {
      let score = 0;
       let lastLoggedObservation = "";
      if (staffMember.security === false) {
    
        score += maxObs - staffMember.numObservations ;
  
   let noOneHadFreeHour = staff.every(member =>
          member.observations[hour - 1] !== '-')
        if (
          staffMember.observations[hour - 1] === "Generals" &&
          staffMember.observations[hour - 2] === "-" && 
          noOneHadFreeHour
        ) {
          score += 2000;
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
          score -= 50;
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
          hour >= 13 &&
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
          score += 22;
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
  
        /*if (staffMember.break === 19) {
    // Check if 'Generals' has not been received in any previous hours
    let hasReceivedNoGenerals = Object.values(staffMember.observations).every(obs => obs !== 'Generals');
  
    if (hasReceivedNoGenerals && observation.name === "Generals") {
        // Increase the score if the current observation is 'Generals'
        score += 10; // Adjust this value as needed
    }
  }*/
      if(observation.name === 'Generals'){
        if(staffMember.break === hour + 1){
          score += 15;
        }
      } 
      if(staffMember.break === hour + 2 && observation.name !== 'Generals' ){
        score += 5;
      }
  
  
        if (observation.name !== "Generals") {
    let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;
  
    // Generate a random number between 0 and 1
    let randomNumber = Math.random();
  
    // Apply the condition with a 70% probability
    if (hasReceivedObservationRecently) {
        score -= 30; // Subtract from the score
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
        if (observation.name !== staffMember.observations[hour - 2]){
        score += 5
        }
  
        let noOneElseCanReceive = staff.every(member =>
          member.observations[hour - 1] !== '-' || // did not have a free hour previously
          member.observations[hour] !== '-' || // already has an observation this hour
          (member.observations[hour - 1] === '-' && observation.name === member.observations[hour - 1]) // had a free hour but cannot receive the same observation
        );
  
        if (noOneElseCanReceive && staffMember.observations[hour - 2] === '-' && staffMember.observations[hour - 1] === 'Generals' && observation.name !== 'Generals') {
          score += 1000; 
  
        }
  
        if (
          hour >= 11 && 
          staffMember.observations[hour - 1] !== "-" &&
          staffMember.observations[hour - 2] !== "-" &&
          staffMember.observations[hour - 1] !== "Generals" &&
          staffMember.observations[hour - 2] !== "Generals"
        ) {
          score -= 30;
        }
    
         /*if (staffMember.observations[hour - 1] === lastObservationAssigned) {
          // Assign a high priority score adjustment
          score += 5; 
          console.log('-------Applied--------')
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
    if(maxObs =8){
        if(staffMember.observations[hour - 1] !== '-'){
          score -=200;
        }
        if(staffMember.observations[hour - 2] !== '-'){
          score -=35;
        }
        
        if(staffMember.observations[hour - 1] === '-'){
          score +=35;
        }
  
        if (observation.name !== "Generals") {
    let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;
  
    // Apply the condition with a 70% probability
    if (hasReceivedObservationRecently) {
        score -= 30; // Subtract from the score
            }
        }
      
  }
  
  
  
  if(maxObs <=7){
      
        if(staffMember.observations[hour - 1] !== '-'){
          score -=200;
        }
        if(staffMember.observations[hour - 2] !== '-'){
          score -=35;
        }
        
        if(staffMember.observations[hour - 1] === '-'){
          score +=35;
        }
  
        if (observation.name !== "Generals") {
    let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;
  
    // Apply the condition with a 70% probability
    if (hasReceivedObservationRecently) {
        score -= 30; // Subtract from the score
            }
        }
      
     if (staffMember.numObservations >= 4){
       score -=2000
     }
  }
  }
  
  
  
  
  
  
  if(maxObs = 8){
       if (staffMember.nurse === true) {
        
          if(maxObs < 8){
            score-=10000;
          }
        if(hour <= 12){
          score -= 40
        }
        if(staffMember.observations[hour - 1] !== '-'){
          score -=200;
        }
        if(staffMember.observations[hour - 2] !== '-'){
          score -=35;
        }
        
        if(staffMember.observations[hour - 1] === '-' && observation.name === 'Generals' && hour >= 12){
          score +=1000;
        }
  
        if (observation.name !== "Generals") {
          let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;
  
          // Apply the condition with a 70% probability
          if (hasReceivedObservationRecently) {
              score -= 30; // Subtract from the score
          }
        }
      }
    }
    console.log(`Hour: ${hour}, Observation: ${observation.name}, Staff Member: ${staffMember.name}, Score: ${score}`);
      return score;
    }
    
    
  function randomSortEqualScores(a, b) {
      return Math.random() - 0.5;
    }
  
  function calculateAvailabilityForEachObservation(observations, staff, hour) {
      let availabilityCounts = {};
  
      observations.forEach(observation => {
          availabilityCounts[observation.name] = staff.filter(staffMember => 
              checkAssignmentConditions(staffMember, hour, observation, calculateMaxObservations(observations, staff))
          ).length;
      });
  
      return availabilityCounts;
  }
    
  function sortStaffByScore(staff, hour, maxObs, observation, maxObservations, lastObservationAssigned) {
      // First, filter out staff members who do not meet the assignment conditions
      let eligibleStaff = staff.filter(staffMember => 
        checkAssignmentConditions(staffMember, hour, observation, maxObservations)
      );
    
      // Then, calculate scores for the eligible staff and sort them
      let staffWithScores = eligibleStaff.map(staffMember => {
        const score = calculateStaffScore(staffMember, hour, maxObs, observation, lastObservationAssigned);
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
      let maxObsSecurity = staffMember.security === true && staffMember.numObservations >= 5;
      let NurseMax = staffMember.nurse === true && staffMember.numObservations >= 4;
      let isOnBreak = staffMember.break === hour;
      let isSecurityHour = (hour === 12 || hour === 17 || hour === 19) && staffMember.security === true ;
      let isNurse = (hour === 8 || hour === 19) && staffMember.nurse === true && maxObs <= 9;
      let canNotRecieve = staffMember.observations[hour] === "X";
    //let reduceSecurityObs = staffMember.security === true && maxObs <= 8;
  
      return !hasObservationAlready && !hadObservationLastHour && !isOnBreak && !isSecurityHour && !maxObsSecurity && !NurseMax && !isNurse && !canNotRecieve}
    
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
            console.error(`Hour ${hour}: Unable to assign '${observation.name}' to any staff member`);
        }
    }
    
  function allocateObservations(observations, staff) {
      const maxObs = calculateMaxObservations(observations, staff);
      console.log(maxObs);
    
      let firstObservationEachHour = {}; // Object to store the first observation for each hour
      for (let hour = 9; hour <= 19; hour++) {
          const availabilityRecord = calculateAvailabilityForEachObservation(observations, staff, hour);
          let observationsToProcess = separateAndInterleaveObservations(observations, availabilityRecord, firstObservationEachHour, hour, staff);
  
          // Initial assignment of observations to staff
          observationsToProcess.forEach((observation, index) => {
              const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs);
              assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs, firstObservationEachHour);
              if (index === 0) { // Check if this is the first observation being assigned
                  // Save the name of the first observation assigned for this hour
                  firstObservationEachHour[hour] = observation.name;
              }
          });
          const shouldSwap = evaluateCriteriaForReiteration(staff, hour, observations);
          console.log(availabilityRecord);
  
          // Criteria evaluation and potential reiteration logic remains unchanged
          if (shouldSwap) {
              console.error('Criteria met, clearing and reiterating for hour:', hour);
              clearAndPrepareHourForReiteration(staff, hour, observationsToProcess);
              observationsToProcess = separateAndInterleaveObservations(observations, availabilityRecord, firstObservationEachHour, hour, staff, shouldSwap);
              observationsToProcess.forEach(observation => {
                  const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs);
                  assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs, firstObservationEachHour);
              });
          }
          //console.log(observationsToProcess)
  console.log("First observation assigned each hour:", firstObservationEachHour[hour]);
          let stillShouldSwap = evaluateCriteriaForReiteration(staff, hour, observations);
            
            if(stillShouldSwap){
              
            }
      }
      
      
  
      return staff;
  }


  const handleAllocate = () => {
    let allocationCopy = allocateObservations([...observations], [...staff] );

    setStaff(allocationCopy);
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
      initializeStaffMembers(staff);
      const updatedStaff = addObsAndReset(staff); // Get the updated staff array
      setStaff(updatedStaff);
      setTimeout(() => {
        onNext();
      }, 100);
    } else {
      onNext();
    }
  };

  const handlePrint = () => {
    window.print();
  };
  

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    copyTable();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 3 seconds
  };

  const handleAutoGenerate = () => {
    handleAllocate();
  };

  function addObsAndReset(Staff, resetObservations = false) {
    return Staff.map(staffMember => {
      // If we're not resetting observations and the staff member already has observations, return them unmodified
      if (!resetObservations && staffMember.observations) {
        return staffMember;
      }
  
      // Initialize or reset an observations object with numeric hours as keys (treated as strings) and "-" as values
      let observations = {};
      for (let hour = 9; hour <= 19; hour++) {
        observations[hour] = "-";
      }
  
      // Return a new staff member object with the added or reset observations
      return {
        ...staffMember,
        observations
      };
    });
  }
  
  const [isSpinning, setIsSpinning] = useState(false);

  const handleReset = () => {
  setIsSpinning(true); // Start spinning
  const resetStaff = addObsAndReset(staff, true); // Your reset logic
  setStaff(resetStaff); // Assuming this updates your component's state
  setTimeout(() => setIsSpinning(false), 1000);
};

return (
  <div className={styles.navigationContainer}>
    {/* Always show the Back button on the left for "staff" or "allocation" pages */}
    {(currentPage === "staff" || currentPage === "allocation") && (
      <button onClick={onBack} className={styles.backButton}>
        Back
      </button>
    )}

    {/* Right-aligned buttons for the "allocation" page */}
    {currentPage === "allocation" && (
      <div className={styles.rightButtonsContainer}>
        <button onClick={handlePrint} className={styles.backButton}>Print Table</button>
        <button onClick={handleCopyClick} className={styles.animatedCopyButton} title="Copy table to clipboard">
          <span className={isCopied ? styles.buttonTextCopied : styles.buttonText}>
            {isCopied ? "Copied!" : "Copy Table"}
          </span>
          {isCopied && <span className={styles.checkmark}>✓</span>}
        </button>
        <button onClick={handleAutoGenerate} className={styles.backButton} title="Auto-assign Observations">
          AutoAssign
        </button>
        <button onClick={handleReset} className={styles.backButton} title="Reset">
          <i className={`fa-solid fa-arrows-rotate ${isSpinning ? 'fa-spin' : ''}`}></i>
        </button>

      </div>
    )}

    {/* Spacer for non-"staff" and non-"allocation" pages */}
    {currentPage !== "staff" && currentPage !== "allocation" && (
      <div className={styles.spacer}></div>
    )}

    {/* Dynamic Display for "staff" Page */}
    {currentPage === "staff" && (
      <div className={styles.observationsInfo}>
        {observations.map((observation, index) => (
          <div key={index} className={styles.observationDetail}>
            <span>{observation.name}: </span>
            <span>{observation.StaffNeeded}</span>
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
