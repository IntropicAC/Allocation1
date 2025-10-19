//navigationButtons.js

import React, { useState, useEffect } from "react";
import styles from "./navigationButtons.module.css";
import { useReactToPrint } from "react-to-print";
//import { allocateObservations } from "./allocationCode";
//import { createTable } from "./allocationCode";

function NavigationButtons({
  onBack,
  onNext,
  currentPage,
  staff,
  observations,
  copyTable,
  setStaff,
  tableRef,
  selectedStartHour
}) {
  function evaluateCriteriaForReiteration(staff, hour, observations) {
    // Correctly find the highest staff number using spread syntax with Math.max()
    const highestStaffNumber = Math.max(
      ...observations.map((obs) => obs.staff)
    );

    // Count how many observations have this highest staff number
    const countOfHighestStaffObservations = observations.filter(
      (obs) => obs.staff === highestStaffNumber
    ).length;

    // Only proceed with further checks if there are two or more observations with the highest staff number
    if (countOfHighestStaffObservations >= 2) {
      return staff.some((staffMember) => {
        // First set: Check if the observations for the previous 3 hours are not "-"
        const notEmpty =
          hour >= 10 &&
          staffMember.observations[hour] !== "-" &&
          staffMember.observations[hour - 1] !== "-" &&
          staffMember.observations[hour - 2] !== "-" &&
          staffMember.observations[hour - 3] !== "-";

        // Second set: Check if the observations for the current hour and the previous 3 hours are not "-" AND not "Generals"
        const notEmptyOrGenerals =
          hour >= 10 &&
          staffMember.observations[hour] !== "-" &&
          staffMember.observations[hour] !== "Generals" &&
          staffMember.observations[hour - 1] !== "-" &&
          staffMember.observations[hour - 1] !== "Generals" &&
          staffMember.observations[hour - 2] !== "-" &&
          staffMember.observations[hour - 2] !== "Generals";

        // Return true if either set of conditions is met
        return notEmpty || notEmptyOrGenerals;
      });
    } else {
      // If the condition for highest staff number is not met, no need to check further
      return false;
    }
  }

  function clearAndPrepareHourForReiteration(
    staff,
    hour,
    interleavedObservations
  ) {
    staff.forEach((staffMember) => {
      // Clear the observation for the current hour
      if (staffMember.observations && staffMember.observations[hour]) {
        staffMember.observations[hour] = "-";
      }
    });
  }
  function setSecurityEligibleHours(staff, startHour = 9, endHour = 20) {
    // endHour is inclusive, so totalHours = endHour - startHour + 1
    const totalHours = endHour - startHour + 1;
  
    staff.forEach((member) => {
      if (member.security === true) {
        // If not provided, set to some default or zero
        const allowedObs = member.maxObservations || 0;
  
        // Early exit if no observations allowed
        if (allowedObs === 0) {
          member.eligibleHours = [];
          return;
        }
  
        // Step to “spread” the hours across the time window
        const step = totalHours / allowedObs;
  
        // Build an array of hours spaced out
        let hours = [];
        for (let i = 0; i < allowedObs; i++) {
          let hourVal = Math.round(startHour + i * step);
          // clamp to the range if needed
          if (hourVal > endHour) {
            hourVal = endHour;
          }
          hours.push(hourVal);
        }
  
        // Remove duplicates (if rounding collisions) and sort
        const uniqueHours = [...new Set(hours)].sort((a, b) => a - b);
        member.eligibleHours = uniqueHours;
      } else {
        // Non-security staff do not need eligibleHours
        member.eligibleHours = null;
      }
    });
  }
  function getSecurityDistributionPenalty(staffMember, hour) {
    // If not security, or if staffMember.eligibleHours is empty (or null),
    // there's no restriction => return 0
    if (!staffMember.security || !staffMember.eligibleHours) {
      return 0;
    }
  
    // For a security staff, only return 0 if the hour is in eligibleHours
    return staffMember.eligibleHours.includes(hour) ? 0 : -1000;
  }
    

  function calculateAvailabilityForEachObservation(observations, staff, hour) {
    let availabilityCounts = {};

    observations.forEach((observation) => {
      availabilityCounts[observation.name] = staff.filter((staffMember) =>
        calculateMaxObservations(observations, staff)
      ).length;
    });

    return availabilityCounts;
  }

  function newOrderIfSwapRequired(
    observations,
    availabilityCounts,
    firstObservationEachHour,
    hour,
    staff
  ) {
    /*console.log(
      "New Order first value passed:" + firstObservationEachHour[hour]
    );
    console.log(observations);*/

    // Check if the first observation matches the one specified for the hour
    if (observations[0].name === firstObservationEachHour[hour]) {
      const firstObservationIndex = observations.findIndex(
        (obs) => obs.name === firstObservationEachHour[hour]
      );

      // Ensure there's another observation to swap with
      if (firstObservationIndex > -1 && observations.length > 1) {
        const swapIndex = 1; // Since we're only swapping with the first item, if it matches the condition
        // Swap the first observation with the next one in the array
        [observations[firstObservationIndex], observations[swapIndex]] = [
          observations[swapIndex],
          observations[firstObservationIndex],
        ];
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

    Object.keys(observationsByStaff).forEach((staffRequirement) => {
      let groupedObservations = observationsByStaff[staffRequirement];

      // Interleave observations within this group
      let counters = groupedObservations.map(() => 0);
      const maxGroupStaffRequirement = Math.max(
        ...groupedObservations.map((obs) => obs.staff)
      );

      for (let i = 0; i < maxGroupStaffRequirement; i++) {
        groupedObservations.forEach((obs, index) => {
          if (counters[index] < obs.staff) {
            interleavedObservations.push(obs);
            counters[index]++;
          }
        });
      }
    });

    //console.log(interleavedObservations);
    return interleavedObservations;
  }

  
function separateAndInterleaveObservations(
    observations,
    availabilityRecord,
    firstObservationEachHour,
    hour,
    staff,
    shouldSwap,
    stillShouldSwap
  ) {
    const genObservation = observations.find((obs) => obs.name === "Generals");
    const otherObservations = observations.filter(
      (obs) => obs.name !== "Generals"
    );

    shuffleArray(otherObservations);
    let interleavedObservations;
    if (shouldSwap) {
      interleavedObservations = newOrderIfSwapRequired(
        otherObservations,
        availabilityRecord,
        firstObservationEachHour,
        hour,
        staff
      );
    } else if (stillShouldSwap) {
      interleavedObservations = otherObservations;
    } else {
      interleavedObservations = createInterleavedObservationsList(
        otherObservations,
        availabilityRecord,
        firstObservationEachHour,
        hour,
        staff
      );
    }

    interleavedObservations.sort((a, b) => b.staff - a.staff);

    if (genObservation) {
      interleavedObservations.push(genObservation);
    }

    return interleavedObservations;
  }

function createInterleavedObservationsList(
    observations,
    availabilityCounts,
    firstObservationEachHour,
    hour,
    staff,
    shouldSwap
  ) {
    //console.log("Should swap:" + shouldSwap);
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

    Object.keys(observationsByStaff).forEach((staffRequirement) => {
      let groupedObservations = observationsByStaff[staffRequirement];

      // Check if all availability counts are the same within this group
      const availabilityValues = groupedObservations.map(
        (obs) => availabilityCounts[obs.name]
      );
      const allAvailabilityCountsSame = availabilityValues.every(
        (val) => val === availabilityValues[0]
      );

      // Sort observations in this group based on their availability counts only if they differ
      if (!allAvailabilityCountsSame) {
        groupedObservations.sort(
          (a, b) => availabilityCounts[a.name] - availabilityCounts[b.name]
        );
      }

      // Interleave observations within this group
      let counters = groupedObservations.map(() => 0);
      const maxGroupStaffRequirement = Math.max(
        ...groupedObservations.map((obs) => obs.staff)
      );

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
    const totalObs =
      observations.reduce((sum, observation) => sum + observation.staff, 0) *
      12;
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
  staff.forEach((staffMember) => {
    console.log(`Checking ${staffMember.name}: initialized = ${staffMember.initialized}`);
    
    if (!staffMember.initialized) {
      console.log(`Initializing ${staffMember.name}`);
      staffMember.observations = {};
      staffMember.lastObservation = staffMember.observationId;
      staffMember.obsCounts = {};
      staffMember.lastReceived = {};
      for (let hour = 7; hour <= 19; hour++) {
        staffMember.observations[hour] =
          hour === 8 &&
          staffMember.observationId &&
          staffMember.observationId !== "-"
            ? staffMember.observationId
            : "-";
        if (hour === 7) staffMember.observations[hour] = "-";
      }
      staffMember.numObservations =
        staffMember.observationId && staffMember.observationId !== "-"
          ? 1
          : 0;

      staffMember.initialized = true;
      console.log(`${staffMember.name} after init:`, staffMember.observations);
    }
    if (staffMember.initialized) {
      console.log(`Setting hour 8 for ${staffMember.name}`);
      staffMember.observations[8] = staffMember.observationId
        ? staffMember.observationId
        : "-";
    }
  });
}

  function getLastObservationHour(staffMember, hour, observations) {
  const observationNames = observations.map(o => o.name);
  
  for (let h = hour - 1; h >= 7; h--) {
    const obs = staffMember.observations[h];
    if (obs && observationNames.includes(obs)) { // Only count actual observations
      return h;
    }
  }
  return -1;
}

  function getMajorityObservation(staffList, hour) {
    const frequency = {};
    let maxCount = 0;
    let majorityObs = null;
  
    for (let member of staffList) {
      const prevObs = member.observations[hour];
      if (!prevObs || prevObs === "-") continue; 
      // skip if no valid observation or free hour
  
      frequency[prevObs] = (frequency[prevObs] || 0) + 1;
      if (frequency[prevObs] > maxCount) {
        maxCount = frequency[prevObs];
        majorityObs = prevObs;
      }
    }
    return majorityObs; // could be null if no valid previous observations
  }
  
  
  


function calculateStaffScore(
  staffMember,
  hour,
  maxObs,
  observation,
  logs,
  majorityObsPrevHour,
  observations
  
) {
  let score = 0;
  const reasons = [];
  
  // Cache frequently accessed values
  const obs = staffMember.observations;
  const obsName = observation.name;
  const isSecurity = staffMember.security === true;
  const isNurse = staffMember.nurse === true;
  
  // Get list of actual observation names for comparison
  const observationNames = observations.map(o => o.name);
  
  // Helper function to check if a value is an actual observation (not a constraint)
  function isActualObservation(value) {
    return value && observationNames.includes(value);
  }
  
  // Helper function - kept as is since it's already efficient
  function addPoints(points, reason) {
    score += points;
    reasons.push(`${points >= 0 ? '+' : ''}${points}: ${reason}`);
  }

  const prev1 = obs[hour - 1];
    const prev2 = obs[hour - 2];
    const prev3 = obs[hour - 3];
    const prev4 = obs[hour - 4];
    const prev5 = obs[hour - 5];
    const prev6 = obs[hour - 6];
    const prev7 = obs[hour - 7];
    const prev8 = obs[hour - 8];
    const prev9 = obs[hour - 9];

  if (!isSecurity) {
    // Baseline score
    addPoints(maxObs - staffMember.numObservations + 1, "non-security baseline (maxObs - numObservations)");
    
    // Break bonus check

    if (maxObs >= 8 && staffMember.break === hour + 1) {
      const hadGeneralsInPast2Hours = (hour >= 9 && prev1 === "Generals") || (hour >= 10 && prev2 === "Generals");
      const hadObservationsInPast2Hours = (hour >= 9 && isActualObservation(prev1)) || (hour >= 10 && isActualObservation(prev2));
      
      if (hadGeneralsInPast2Hours && !hadObservationsInPast2Hours) {
        addPoints(5, "bonus for break in next hour when maxObs >= 8, had Generals in past 2 hours, no observations in past 2 hours");
      }
    }
    
    // FIXED: Consecutive busy hour penalties - only count actual observations as "busy"
    if (hour >= 11 && isActualObservation(prev1) && isActualObservation(prev2)) {
      addPoints(-50, "penalty for 2 consecutive hours with observations");
    }
    
    if (hour >= 12 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3)) {
      addPoints(-50, "penalty for 3 consecutive hours with observations");
    }
    
    if (hour >= 13 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3) && isActualObservation(prev4)) {
      addPoints(-50, "penalty for 4 consecutive hours with observations");
    }
    
    if (hour >= 14 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3) && isActualObservation(prev4) && isActualObservation(prev5)) {
      addPoints(-50, "penalty for 5 consecutive hours with observations");
    }
    
    // Special penalty for consecutive non-free/non-Generals (only actual observations)
    if (hour >= 10 && isActualObservation(prev1) && prev1 !== "Generals" && 
        isActualObservation(prev2) && prev2 !== "Generals") {
      addPoints(-15, "penalty for 2 consecutive hours with non-Generals observations");
    }

    // FIXED: Free hour bonuses - ALL hours must be free
    if (prev1 === "-") {
      addPoints(22, "bonus for free hour in the previous hour");
    }
    
    if (hour >= 10 && prev1 === "-" && prev2 === "-") {
      addPoints(15, "bonus for 2 consecutive free hours");
    }
    
    if (hour >= 11 && prev1 === "-" && prev2 === "-" && prev3 === "-") {
      addPoints(5, "bonus for 3 consecutive free hours");
    }
    
    if (hour >= 12 && prev1 === "-" && prev2 === "-" && prev3 === "-" && prev4 === "-") {
      addPoints(15, "bonus for 4 consecutive free hours");
    }
    
    if (hour >= 13 && prev1 === "-" && prev2 === "-" && prev3 === "-" && prev4 === "-" && prev5 === "-") {
      addPoints(20, "bonus for 5 consecutive free hours");
    }
    
    if (hour >= 14 && prev1 === "-" && prev2 === "-" && prev3 === "-" && prev4 === "-" && prev5 === "-" && prev6 === "-") {
      addPoints(20, "bonus for 6 consecutive free hours");
    }

    // Even distribution checks - only apply penalties for repeating, no bonuses
    
    if (hour >= 10 && prev2 === obsName) {
      addPoints(-20, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 === obsName) {
      addPoints(-20, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 === obsName) {
      addPoints(-20, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 === obsName) {
      addPoints(-20, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 === obsName) {
      addPoints(-20, "penalty for repeating same observation 6 hours ago");
    }
    
    if (hour >= 15 && prev7 === obsName) {
      addPoints(-20, "penalty for repeating same observation 7 hours ago");
    }
    
    if (hour >= 16 && prev8 === obsName) {
      addPoints(-20, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 === obsName) {
      addPoints(-20, "penalty for repeating same observation 9 hours ago");
    }

    // even distribution positives

    if (hour >= 10 && prev2 !== obsName) {
      addPoints(20, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 !== obsName) {
      addPoints(20, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 !== obsName) {
      addPoints(20, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 !== obsName) {
      addPoints(20, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 !== obsName) {
      addPoints(20, "penalty for repeating same observation 6 hours ago");
    }

    if (hour >= 15 && prev7 !== obsName) {
      addPoints(20, "penalty for repeating same observation 7 hours ago");
    }
    if (hour >= 16 && prev8 !== obsName) {
      addPoints(20, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 !== obsName) {
      addPoints(20, "penalty for repeating same observation 9 hours ago");
    }
    


    // Special case penalties - only consider actual observations as "busy"
    if (maxObs <= 8 && hour >= 10 && isActualObservation(prev1) && isActualObservation(prev2) && 
        prev1 !== "Generals" && prev2 !== "Generals") {
      addPoints(-20, "large penalty for 2 consecutive observation hours when maxObs <= 8");
    }

    if (maxObs >= 9 && hour === 9 && prev1 === "Generals") {
      addPoints(20, "small bonus for Generals in previous hour when maxObs >= 9");
    }
  }

  // Security staff logic - optimized
  if (isSecurity) {
    const allowedObs = staffMember.securityObs || 0;
    
    if (allowedObs > 0) {
      const idealGap = 8 / allowedObs;
      const lastHour = getLastObservationHour(staffMember, hour, observations);
      
      if (lastHour !== -1) {
        const hoursSinceLast = hour - lastHour;
        const points = hoursSinceLast < idealGap ? -100 : 100;
        const reason = hoursSinceLast < idealGap ? 
          "penalty for assigning security too soon (ideal gap not met)" :
          "bonus for meeting or exceeding the ideal gap before next security assignment";
        addPoints(points, reason);
      }
    }

    if(obsName !== "Generals"){
      addPoints(-30, "penalty to boot chance nurse/security recieves Generals")
    }

    // Individual hour checks for security
    if (hour >= 9 && obs[hour-1] === obsName) {
      addPoints(-30, "penalty for repeating same observation in previous hour for security");
    }
    if (hour >= 10 && obs[hour-2] === obsName) {
      addPoints(-30, "penalty for repeating same observation 2 hours ago for security");
    }
    if (hour >= 11 && obs[hour-3] === obsName) {
      addPoints(-30, "penalty for repeating same observation 3 hours ago for security");
    }
    if (hour >= 12 && obs[hour-4] === obsName) {
      addPoints(-30, "penalty for repeating same observation 4 hours ago for security");
    }

    // FIXED: Consecutive free hours for security - ALL must be free
    if (hour >= 10 && obs[hour-1] === "-" && obs[hour-2] === "-") {
      addPoints(30, "security bonus for 2 consecutive free hours");
    }
    
    if (hour >= 11 && obs[hour-1] === "-" && obs[hour-2] === "-" && obs[hour-3] === "-") {
      addPoints(30, "security bonus for 3 consecutive free hours");
    }
    
    if (hour >= 12 && obs[hour-1] === "-" && obs[hour-2] === "-" && obs[hour-3] === "-" && obs[hour-4] === "-") {
      addPoints(20, "security bonus for 4 consecutive free hours");
    }

    // Generals check for security - optimized
    if (hour >= 12 && obsName !== "Generals") {
      let generalsFound = false;
      for (let k = 1; k <= 7 && hour - k >= 7; k++) {
        if (obs[hour - k] === "Generals") {
          generalsFound = true;
          break;
        }
      }
      if (!generalsFound) {
        addPoints(-20, "penalty for security if Generals not seen in last 7 hours but we aren't assigning Generals now");
      }
    }

    // Even distribution checks - only apply penalties for repeating, no bonuses
    
    if (hour >= 10 && prev2 === obsName) {
      addPoints(-60, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 === obsName) {
      addPoints(-60, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 === obsName) {
      addPoints(-60, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 === obsName) {
      addPoints(-60, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 === obsName) {
      addPoints(-60, "penalty for repeating same observation 6 hours ago");
    }
    
    if (hour >= 15 && prev7 === obsName) {
      addPoints(-60, "penalty for repeating same observation 7 hours ago");
    }
    
    if (hour >= 16 && prev8 === obsName) {
      addPoints(-60, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 === obsName) {
      addPoints(-60, "penalty for repeating same observation 9 hours ago");
    }

    // even distribution positives

    if (hour >= 10 && prev2 !== obsName) {
      addPoints(20, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 !== obsName) {
      addPoints(20, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 !== obsName) {
      addPoints(20, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 !== obsName) {
      addPoints(20, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 !== obsName) {
      addPoints(20, "penalty for repeating same observation 6 hours ago");
    }

    if (hour >= 15 && prev7 !== obsName) {
      addPoints(20, "penalty for repeating same observation 7 hours ago");
    }
    if (hour >= 16 && prev8 !== obsName) {
      addPoints(20, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 !== obsName) {
      addPoints(20, "penalty for repeating same observation 9 hours ago");
    }
  }

  if (isNurse) {
    const allowedObs = staffMember.nurseObs || 0;
    
    if (allowedObs > 0) {
      const idealGap = 8 / allowedObs;
      const lastHour = getLastObservationHour(staffMember, hour, observations);
    
      if (lastHour !== -1) {
        const hoursSinceLast = hour - lastHour;
        const points = hoursSinceLast < idealGap ? -100 : 100;
        const reason = hoursSinceLast < idealGap ? 
          "penalty for assigning nurse too soon (ideal gap not met)" :
          "bonus for meeting or exceeding the ideal gap before next nurse assignment";
        addPoints(points, reason);
      }
    }

    if(obsName !== "Generals"){
      addPoints(-30, "penalty to boot chance nurse/security recieves Generals")
    }

    // Even distribution checks - only apply penalties for repeating, no bonuses
    
    if (hour >= 10 && prev2 === obsName) {
      addPoints(-60, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 === obsName) {
      addPoints(-60, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 === obsName) {
      addPoints(-60, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 === obsName) {
      addPoints(-60, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 === obsName) {
      addPoints(-60, "penalty for repeating same observation 6 hours ago");
    }
    
    if (hour >= 15 && prev7 === obsName) {
      addPoints(-60, "penalty for repeating same observation 7 hours ago");
    }
    
    if (hour >= 16 && prev8 === obsName) {
      addPoints(-60, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 === obsName) {
      addPoints(-60, "penalty for repeating same observation 9 hours ago");
    }

    // even distribution positives

    if (hour >= 10 && prev2 !== obsName) {
      addPoints(20, "penalty for repeating same observation 2 hours ago");
    }
    
    if (hour >= 11 && prev3 !== obsName) {
      addPoints(20, "penalty for repeating same observation 3 hours ago");
    }
    
    if (hour >= 12 && prev4 !== obsName) {
      addPoints(20, "penalty for repeating same observation 4 hours ago");
    }
    
    if (hour >= 13 && prev5 !== obsName) {
      addPoints(20, "penalty for repeating same observation 5 hours ago");
    }

    if (hour >= 14 && prev6 !== obsName) {
      addPoints(20, "penalty for repeating same observation 6 hours ago");
    }

    if (hour >= 15 && prev7 !== obsName) {
      addPoints(20, "penalty for repeating same observation 7 hours ago");
    }
    if (hour >= 16 && prev8 !== obsName) {
      addPoints(20, "penalty for repeating same observation 8 hours ago");
    }

    if (hour >= 17 && prev9 !== obsName) {
      addPoints(20, "penalty for repeating same observation 9 hours ago");
    }

    // Individual hour checks for nurse (same as security logic)
    if (hour >= 9 && obs[hour-1] === obsName) {
      addPoints(-30, "penalty for repeating same observation in previous hour for nurse");
    }
    if (hour >= 10 && obs[hour-2] === obsName) {
      addPoints(-30, "penalty for repeating same observation 2 hours ago for nurse");
    }
    if (hour >= 11 && obs[hour-3] === obsName) {
      addPoints(-30, "penalty for repeating same observation 3 hours ago for nurse");
    }
    if (hour >= 12 && obs[hour-4] === obsName) {
      addPoints(-30, "penalty for repeating same observation 4 hours ago for nurse");
    }

    // FIXED: Consecutive free hours for nurse - ALL must be free
    if (hour >= 10 && obs[hour-1] === "-" && obs[hour-2] === "-") {
      addPoints(30, "nurse bonus for 2 consecutive free hours");
    }
    
    if (hour >= 11 && obs[hour-1] === "-" && obs[hour-2] === "-" && obs[hour-3] === "-") {
      addPoints(30, "nurse bonus for 3 consecutive free hours");
    }
    
    if (hour >= 12 && obs[hour-1] === "-" && obs[hour-2] === "-" && obs[hour-3] === "-" && obs[hour-4] === "-") {
      addPoints(20, "nurse bonus for 4 consecutive free hours");
    }

    // Generals check for nurse
    if (hour >= 12 && obsName !== "Generals") {
      let generalsFound = false;
      for (let k = 1; k <= 7 && hour - k >= 7; k++) {
        if (obs[hour - k] === "Generals") {
          generalsFound = true;
          break;
        }
      }
      if (!generalsFound) {
        addPoints(-20, "penalty for nurse if Generals not seen in last 7 hours but we aren't assigning Generals now");
      }
    }
  }

  // Logging - only in debug mode to improve performance
  if (logs) {
    logs.push(
      `Hour: ${hour}, Observation: ${obsName}, Staff Member: ${staffMember.name}, Final Score: ${score}, Reasons: ${reasons.join(" | ")}`
    );
  }

  return score;
}
  

  function randomSortEqualScores(a, b) {
    return Math.random() - 0.5;
  }

  function calculateAvailabilityForEachObservation(observations, staff, hour) {
    let availabilityCounts = {};

    observations.forEach((observation) => {
      availabilityCounts[observation.name] = staff.filter((staffMember) =>
        checkAssignmentConditions(
          staffMember,
          hour,
          observation,
          calculateMaxObservations(observations, staff)
        )
      ).length;
    });

    return availabilityCounts;
  }

  function sortStaffByScore(
    staff,
    hour,
    maxObs,
    observation,
    maxObservations,
    logs,
    majorityObsPrevHour,
    observations
  ) {
    // First, filter out staff members who do not meet the assignment conditions
    let eligibleStaff = staff.filter((staffMember) =>
      checkAssignmentConditions(staffMember, hour, observation, maxObservations)
    );

    // Then, calculate scores for the eligible staff and sort them
    let staffWithScores = eligibleStaff.map((staffMember) => {
      const score = calculateStaffScore(
        staffMember,
        hour,
        maxObs,
        observation,
        logs,
        majorityObsPrevHour,
        observations
      );
      return {
        ...staffMember,
        score,
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
  // Primary check: staff member must be free (showing "-") for this hour
  let isAvailable = staffMember.observations[hour] === "-";
  
  // If not available, return false immediately
  if (!isAvailable) {
    return false;
  }
  
  let hadObservationLastHour = staffMember.observations[hour - 1] === observation.name;
  
  // Handle security staff limits
  let maxObsSecurity = false;
  if (staffMember.security === true) {
    const securityLimit = staffMember.securityObs;
    if (securityLimit !== null && securityLimit !== undefined) {
      maxObsSecurity = staffMember.numObservations >= securityLimit;
    } else {
      maxObsSecurity = staffMember.numObservations >= 20; // default fallback
    }
  }
  
  // Handle nurse staff limits  
  let NurseMax = false;
  if (staffMember.nurse === true) {
    const nurseLimit = staffMember.nurseObs;
    if (nurseLimit !== null && nurseLimit !== undefined) {
      NurseMax = staffMember.numObservations >= nurseLimit;
    } else {
      NurseMax = staffMember.numObservations >= 20; // default fallback
    }
  }
  
  let isOnBreak = staffMember.break === hour;
  let isSecurityHour = staffMember.security === true && (hour === 8 || hour === 12 || hour === 17 || hour === 19) && maxObs <= 9;
  let isNurse = staffMember.nurse === true && (hour === 8 || hour === 9 || hour === 19) && maxObs <= 9;

  return (
    !hadObservationLastHour &&  // Didn't have same observation last hour
    !isOnBreak &&              // Not on break
    !isSecurityHour &&         // Not security restricted hour
    !maxObsSecurity &&         // Hasn't exceeded security observation limit
    !NurseMax &&               // Hasn't exceeded nurse observation limit
    !isNurse                   // Not nurse restricted hour
  );
}

  function assignObservation(staffMember, hour, observation) {
    staffMember.observations[hour] = observation.name;
    staffMember.numObservations++;

    if (!staffMember.obsCounts[observation.name]) {
      staffMember.obsCounts[observation.name] = 1;
    } else {
      staffMember.obsCounts[observation.name]++;
    }
  }

  function assignObservationsToStaff(
    staff,
    staffWithScores,
    hour,
    observation,
    maxObservations,
    firstObservationEachHour,
    logs,
    unassignedCountRef
  ) {
    let assigned = false;

    for (let i = 0; i < staffWithScores.length; i++) {
      let staffMember = staff.find(
        (member) => member.name === staffWithScores[i].name
      );
      // Check if the staff member already has an observation for this hour
      if (
        !checkAssignmentConditions(
          staffMember,
          hour,
          observation,
          maxObservations
        )
      ) {
        continue; // Skip to the next staff member if conditions are not met
      }

      assignObservation(staffMember, hour, observation);

      if (firstObservationEachHour[hour] === undefined) {
        firstObservationEachHour[hour] = observation.name;
      }
      logs.push(`Hour ${hour}: '${observation.name}' assigned to ${staffMember.name}`);
      assigned = true;
      break; // Break after assigning to one staff member
    }
    if (!assigned) {
      /*console.error(
        `Hour ${hour}: Unable to assign '${observation.name}' to any staff member`
      );*/
      logs.push(`Hour ${hour}: Unable to assign '${observation.name}' to any staff member`);
      unassignedCountRef.value++;

    }
  }


  function countConsecutiveObservations(staff) {
    let totalScore = 0;  // This will store the weighted penalty score
    let totalConsecutiveCount = 0;  // This will store the count of consecutive observations

    staff.forEach(staffMember => {
        let currentConsecutiveLength = 0;
        let consecutiveStartIndex = -1;
        
        // Get all hours that have observations (not "-" and not undefined/null)
        const hours = Object.keys(staffMember.observations)
            .map(h => parseInt(h))
            .filter(h => staffMember.observations[h] && staffMember.observations[h] !== "-")
            .sort((a, b) => a - b);

        for (let i = 0; i < hours.length; i++) {
            const currentHour = hours[i];
            const nextHour = hours[i + 1];
            
            if (nextHour && nextHour === currentHour + 1) {
                // Consecutive hours found
                if (currentConsecutiveLength === 0) {
                    currentConsecutiveLength = 2; // Start counting from 2 consecutive
                    consecutiveStartIndex = i; // Track where sequence starts
                } else {
                    currentConsecutiveLength++;
                }
            } else {
                // End of consecutive sequence
                if (currentConsecutiveLength > 0) {
                    totalConsecutiveCount += currentConsecutiveLength;
                    
                    // Check if this consecutive sequence includes any generals
                    let hasGeneral = false;
                    for (let j = consecutiveStartIndex; j < consecutiveStartIndex + currentConsecutiveLength; j++) {
                        const hour = hours[j];
                        const observation = staffMember.observations[hour];
                        if (observation && observation.toLowerCase().includes('general')) {
                            hasGeneral = true;
                            break;
                        }
                    }
                    
                    // Apply custom penalty hierarchy
                    let penalty = calculatePenalty(currentConsecutiveLength, hasGeneral);
                    totalScore += penalty;
                    
                    currentConsecutiveLength = 0;
                    consecutiveStartIndex = -1;
                }
            }
        }
        
        // Handle last sequence if it was consecutive
        if (currentConsecutiveLength > 0) {
            totalConsecutiveCount += currentConsecutiveLength;
            
            // Check if this consecutive sequence includes any generals
            let hasGeneral = false;
            for (let j = consecutiveStartIndex; j < consecutiveStartIndex + currentConsecutiveLength; j++) {
                const hour = hours[j];
                const observation = staffMember.observations[hour];
                if (observation && observation.toLowerCase().includes('general')) {
                    hasGeneral = true;
                    break;
                }
            }
            
            // Apply custom penalty hierarchy
            let penalty = calculatePenalty(currentConsecutiveLength, hasGeneral);
            totalScore += penalty;
        }
    });

    return { score: totalScore, count: totalConsecutiveCount };
}

// Custom penalty function implementing the specific hierarchy
function calculatePenalty(consecutiveLength, hasGeneral) {
    /*
    Penalty Hierarchy (lower is better):
    1. 2 consecutive (any type): 4.0
    2. 3 consecutive with generals: 7.0  
    3. 3 consecutive regular: 9.0
    4. 4 consecutive with generals: 13.0
    5. 4 consecutive regular: 16.0
    6. 5+ consecutive with generals: 20.0+
    7. 5+ consecutive regular: 25.0+
    */
    
    if (consecutiveLength === 2) {
        return 4.0; // Always 4.0 regardless of generals
    } else if (consecutiveLength === 3) {
        return hasGeneral ? 3.0 : 11;
    } else if (consecutiveLength === 4) {
        return hasGeneral ? 20.0 : 28.0;
    } else if (consecutiveLength >= 5) {
        // For 5+, use exponential growth but maintain the hierarchy
        const basePenalty = Math.pow(consecutiveLength, 2);
        return hasGeneral ? basePenalty * 0.8 : basePenalty;
    }
    
    return 0; // Should not reach here
}

function runSimulation(observations, staff, startHour = 9) {
    let bestScore = Number.MAX_SAFE_INTEGER;
    let bestStaffAllocation = null;
    let bestLogs = [];
    let bestUnassignedCount = Number.MAX_SAFE_INTEGER;
    let bestConsecutiveCount = Number.MAX_SAFE_INTEGER;
    
    // Create a base template that preserves original observations
    const staffTemplate = staff.map(member => {
        // Deep copy the original observations to preserve breaks, security hours, etc.
        const originalObservations = member.observations ? { ...member.observations } : {};
        
        return {
            ...member,
            originalObservations, // Store the original state
            observations: { ...originalObservations }, // Create a copy for this template
            obsCounts: {},
            lastReceived: {},
            numObservations: member.observationId && member.observationId !== "-" ? 1 : 0,
            initialized: true
        };
    });
    
    console.time("optimized code");
    
    for (let i = 0; i < 900; i++) {
        let iterationLogs = [];
        let unassignedCountRef = { value: 0 };
        
        // Create staff clone that preserves original observations
        let staffClone = staffTemplate.map(member => ({
            ...member,
            observations: { ...member.originalObservations }, // Restore original state each iteration
            obsCounts: {},
            lastReceived: {},
            numObservations: member.observationId && member.observationId !== "-" ? 1 : 0
        }));
        
        allocateObservations(observations, staffClone, iterationLogs, unassignedCountRef, startHour);
        
        let consecutiveResult = countConsecutiveObservations(staffClone);
        let unassignedCount = unassignedCountRef.value;
        
        // Calculate composite score: prioritize unassigned count, then consecutive penalty
        let compositeScore = (unassignedCount * 1000) + consecutiveResult.score;
        
        console.log(
            `Iteration ${i + 1}: Unassigned = ${unassignedCount}, ` +
            `Consecutive Count = ${consecutiveResult.count}, ` +
            `Consecutive Penalty Score = ${consecutiveResult.score.toFixed(1)}, ` +
            `Composite Score = ${compositeScore.toFixed(1)}`
        );
        
        // Primary criterion: minimize unassigned observations
        // Secondary criterion: minimize consecutive observation penalty
        if (unassignedCount < bestUnassignedCount ||
            (unassignedCount === bestUnassignedCount && consecutiveResult.score < bestScore)) {
            bestUnassignedCount = unassignedCount;
            bestScore = consecutiveResult.score;
            bestConsecutiveCount = consecutiveResult.count;
            bestStaffAllocation = staffClone;
            bestLogs = iterationLogs;
        }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("BEST ITERATION RESULTS:");
    console.log("=".repeat(50));
    console.log(`Unassigned Observations: ${bestUnassignedCount}`);
    console.log(`Total Consecutive Observations: ${bestConsecutiveCount}`);
    console.log(`Consecutive Penalty Score: ${bestScore.toFixed(1)}`);
    console.log("=".repeat(50));
    
    console.log("\nLogs for the best iteration:");
    bestLogs.forEach((log) => console.log(log));
    
    console.timeEnd("optimized code");
    return bestStaffAllocation;
}




function resetStaff(staff, observations, startHour = 9) {
  // Get list of actual observation names that should be cleared
  const observationNames = observations.map(obs => obs.name);
  
  staff.forEach((staffMember) => {
    // Reset tracking variables
    staffMember.lastObservation = staffMember.observationId;
    staffMember.obsCounts = {};
    staffMember.lastReceived = {};
    
    // Reset observations while preserving only user-set constraints
    for (let hour = startHour; hour <= 19; hour++) {
      const currentObs = staffMember.observations[hour];
      
      // If current value is an observation name, clear it
      if (currentObs && observationNames.includes(currentObs)) {
        // Clear system-assigned observations
        staffMember.observations[hour] =
          hour === 8 &&
          staffMember.observationId &&
          staffMember.observationId !== "-"
            ? staffMember.observationId
            : "-";
      } else {
        // Keep everything else (constraints like "Break", "X", etc.)
        // Only set default if undefined
        if (!staffMember.observations[hour]) {
          staffMember.observations[hour] =
            hour === 8 &&
            staffMember.observationId &&
            staffMember.observationId !== "-"
              ? staffMember.observationId
              : "-";
        }
      }
      
      // Always set hour 7 to free
      if (hour === 7) {
        staffMember.observations[hour] = "-";
      }
    }
    
    // Recalculate numObservations based on actual assignments (not constraints)
    staffMember.numObservations = 0;
    for (let hour = 7; hour <= 19; hour++) {
      const obs = staffMember.observations[hour];
      // Count only actual observation assignments
      if (obs && observationNames.includes(obs)) {
        staffMember.numObservations++;
      }
    }
  });
}

  function allocateObservations(observations, staff, logs, unassignedCountRef, startHour) {
    const maxObs = calculateMaxObservations(observations, staff);
    logs.push("MAX OBS --------", maxObs)
    resetStaff(staff, observations, startHour);

    let firstObservationEachHour = {}; 
    for (let hour = startHour; hour <= 19; hour++) {
      const majorityObsPrevHour = getMajorityObservation(staff, hour - 1);
      const availabilityRecord = calculateAvailabilityForEachObservation(
        observations,
        staff,
        hour
      );
      let observationsToProcess = separateAndInterleaveObservations(
        observations,
        availabilityRecord,
        firstObservationEachHour,
        hour,
        staff
      );

      // Initial assignment of observations to staff
      observationsToProcess.forEach((observation, index) => {
        const staffWithScores = sortStaffByScore(
          staff,
          hour,
          maxObs,
          observation,
          maxObs,
          logs,
          majorityObsPrevHour,
          observations
        );
        assignObservationsToStaff(
          staff,
          staffWithScores,
          hour,
          observation,
          maxObs,
          firstObservationEachHour,
          logs,
          unassignedCountRef
        );
        if (index === 0) {
          // Check if this is the first observation being assigned
          // Save the name of the first observation assigned for this hour
          firstObservationEachHour[hour] = observation.name;
        }
      });

    }

    return staff;
  }






  

  function createLookAheadPlan(observations, staff, startHour = 8, endHour = 19) {
  const totalHours = endHour - startHour + 1;
  const observationSlotsPerHour = observations.reduce((sum, obs) => sum + obs.staff, 0);
  const totalSlots = observationSlotsPerHour * totalHours;
  const slotsPerStaff = Math.ceil(totalSlots / staff.length);
  
  // Determine system pressure
  const systemPressure = totalSlots / (staff.length * totalHours);
  
  const plan = {
    slotsPerStaff,
    systemPressure,
    idealGap: Math.max(1, Math.floor(totalHours / slotsPerStaff)),
    maxConsecutive: systemPressure > 0.7 ? 3 : 2,
    staffPlans: {}
  };
  
  // Create individual staff plans
  staff.forEach((member, index) => {
    const offset = (totalHours / staff.length) * index;
    plan.staffPlans[member.name] = {
      targetObservations: slotsPerStaff,
      idealHours: [],
      currentCount: 0
    };
    
    // Distribute ideal hours evenly
    for (let i = 0; i < slotsPerStaff; i++) {
      const idealHour = Math.round(startHour + offset + (i * plan.idealGap)) % totalHours + startHour;
      if (idealHour <= endHour) {
        plan.staffPlans[member.name].idealHours.push(idealHour);
      }
    }
  });
  
  return plan;
}

  const handleAllocate = () => {
  let allocationCopy = runSimulation(observations, staff, selectedStartHour || 9);
  setStaff(allocationCopy);
};

  const handleNext = () => {
  if (currentPage === "patient" && observations.length < 1) {
    alert("At least 1 observation is required");
    return;
  }

  if (currentPage === "staff" && staff.length < 2) {
    alert("At least 2 staff members are required");
    return;
  }

  if (currentPage === "staff") {
    console.log("=== BEFORE INITIALIZATION ===");
    console.log("Staff initialized flags:", staff.map(s => ({ name: s.name, initialized: s.initialized })));
    console.log("Staff observations:", staff.map(s => ({ name: s.name, observations: s.observations })));
    
    const needsInitialization = staff.some(member => !member.initialized);
    console.log("Needs initialization?", needsInitialization);
    
    if (needsInitialization) {
      initializeStaffMembers(staff);
      console.log("=== AFTER INITIALIZATION ===");
      console.log("Staff observations:", staff.map(s => ({ name: s.name, observations: s.observations })));
      setStaff([...staff]);
    }
    
    setTimeout(() => {
      onNext();
    }, 100);
  } else {
    onNext();
  }
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
  return Staff.map((staffMember) => {
    // If forcing reset, skip all checks and reset everything
    if (resetObservations) {
      let observations = {};
      for (let hour = 7; hour <= 19; hour++) {
        observations[hour] = 
          hour === 8 && staffMember.observationId && staffMember.observationId !== "-"
            ? staffMember.observationId
            : "-";
      }
      
      return {
        ...staffMember,
        observations,
        obsCounts: {},
        lastReceived: {},
        numObservations: staffMember.observationId && staffMember.observationId !== "-" ? 1 : 0,
        initialized: true, // Keep initialized as true even after reset
      };
    }
    
    // If already initialized and we're not forcing a reset, return as-is
    if (staffMember.initialized) {
      return staffMember;
    }
    
    // If we're not resetting and already has observations, return unchanged
    if (staffMember.observations) {
      return staffMember;
    }

    // Initial setup for new staff members
    let observations = {};
    for (let hour = 9; hour <= 19; hour++) {
      observations[hour] = "-";
    }

    return {
      ...staffMember,
      observations,
    };
  });
}

  const [isSpinning, setIsSpinning] = useState(false);

  const handleReset = () => {
  setIsSpinning(true);
  const resetStaff = addObsAndReset(staff, true); // Force reset with true flag
  setStaff(resetStaff);
  setTimeout(() => setIsSpinning(false), 1000);
};

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

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
          <button onClick={handlePrint} className={styles.backButton}>
            Print Table
          </button>
          <button
            onClick={handleCopyClick}
            className={styles.animatedCopyButton}
            title="Copy table to clipboard"
          >
            <span
              className={isCopied ? styles.buttonTextCopied : styles.buttonText}
            >
              {isCopied ? "Copied!" : "Copy Table"}
            </span>
            {isCopied && <span className={styles.checkmark}>✓</span>}
          </button>
          <button
  onClick={handleAutoGenerate}
  className={styles.backButton}
  title="Auto-assign Observations"
>
  {selectedStartHour ? `Auto-Assign ${selectedStartHour} - 19` : 'Auto-Assign'}
</button>
          <button
            onClick={handleReset}
            className={styles.backButton}
            title="Reset"
          >
            <i
              className={`fa-solid fa-arrows-rotate ${
                isSpinning ? "fa-spin" : ""
              }`}
            ></i>
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
