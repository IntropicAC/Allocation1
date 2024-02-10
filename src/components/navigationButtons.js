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
  unassignedObs,
  setUnassignedObs

}) {
    

  function findLastNonGeneralsObservation(interleavedObservations) {
    // Iterate from the end of the array to find the last observation other than 'Generals'
    for (let i = interleavedObservations.length - 1; i >= 0; i--) {
        if (interleavedObservations[i].name !== 'Generals') {
            return interleavedObservations[i].name; // Return the name of the last non-'Generals' observation
        }
    }
    return null; // Return null if all observations are 'Generals' or the list is empty
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

function createInterleavedObservationsList(observations, availabilityCounts) {
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

  // Optionally, you can sort the final interleaved list by staff size or another criterion if needed
  // This is just an example and may not be necessary depending on your requirements
  // interleavedObservations.sort((a, b) => b.staff - a.staff);

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
  
  
 function separateAndInterleaveObservations(observations, availabilityRecord) {

    const genObservation = observations.find(obs => obs.name === 'Generals');
    const otherObservations = observations.filter(obs => obs.name !== 'Generals');
  
    shuffleArray(otherObservations);
  
    let interleavedObservations = createInterleavedObservationsList(otherObservations, availabilityRecord);
  
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
  
      //score += maxObs - staffMember.numObservations ;

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


	if(maxObs =8){
    if (staffMember.security === true) {
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
}

if(maxObs <=7){
    if (staffMember.security === true) {
      score -= 10;
      if(staffMember.observations[hour - 1] !== '-'){
        score -=200;
      }
      if(staffMember.observations[hour - 2] !== '-'){
        score -=35;
      }
      
      if(staffMember.observations[hour - 1] === '-'){
        score +=10;
      }

			if (observation.name !== "Generals") {
  let hasReceivedObservationRecently = staffMember.observations[hour - 2] === observation.name;

  // Apply the condition with a 70% probability
  if (hasReceivedObservationRecently) {
      score -= 30; // Subtract from the score
 				 }
			}
    }
   if (staffMember.numObservations >= 4){
   	score -=2000
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
  //let reduceSecurityObs = staffMember.security === true && maxObs <= 8;

    return !hasObservationAlready && !hadObservationLastHour && !isOnBreak && !isSecurityHour && !maxObsSecurity && !NurseMax && !isNurse}
  
  
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
  
    console.log(`Assigned to ${staffMember.name} at hour ${hour} with score ${staffMember.score}`);
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
  
    initializeStaffMembers(staff);
  
    
    
  
    let firstObservationEachHour = {};
    for (let hour = 9; hour <= 19; hour++) {
      const availabilityRecord = (calculateAvailabilityForEachObservation(observations, staff, hour));
      
			
const interleavedObservations = separateAndInterleaveObservations(observations, availabilityRecord);
      
			const lastObservationAssigned = findLastNonGeneralsObservation(interleavedObservations);
			console.log(lastObservationAssigned)
      interleavedObservations.forEach(observation => {
  
        const staffWithScores = sortStaffByScore(staff, hour, maxObs, observation, maxObs, lastObservationAssigned);
        assignObservationsToStaff(staff, staffWithScores, hour, observation, maxObs, firstObservationEachHour);
      });
      
      
    }
		
    return staff;
    
  }

  


  const handleAllocate = () => {
    let allocationCopy = allocateObservations([...observations], [...staff] );

    setAllocatedStaff(allocationCopy);
    console.log(allocationCopy)
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
        (staffMember) => staffMember.observationId === observation.name
      ).length;
      return {
        ...observation,
        staffNeeded: Math.max(0, observation.staff - assignedStaffCount),
      };
    });
  };
  
  useEffect(() => {
    const updatedObservations = updateStaffNeeded();
    setUnassignedObs(updatedObservations);
  }, [staff, observations]); // Dependencies include both staff and observations
  

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
          {unassignedObs.map((observation, index) => (
            <div key={index} className={styles.observationDetail}>
              <span>{observation.name}:</span>
              <span> {observation.staff}</span>
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
