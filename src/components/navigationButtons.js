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
  selectedStartHour,
  hasCachedData,
  isAllocationReady,
  setIsAllocationReady,
  resetHistory
}) {
  
const [isLoadingSolver, setIsLoadingSolver] = useState(false);
  function calculateAvailabilityForEachObservation(observations, staff, hour) {
    let availabilityCounts = {};

    observations.forEach((observation) => {
      availabilityCounts[observation.name] = staff.filter((staffMember) =>
        calculateMaxObservations(observations, staff)
      ).length;
    });

    return availabilityCounts;
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
    
      interleavedObservations = createInterleavedObservationsList(
        otherObservations,
        availabilityRecord,
        firstObservationEachHour,
        hour,
        staff);
      

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

  function calculateEffectiveMaxObservations(observations, staff, startHour = 9, endHour = 19) {
  // Total observation slots needed
  const totalObsPerHour = observations.reduce((sum, obs) => sum + obs.staff, 0);
  const totalHours = endHour - startHour + 1;
  const totalObsSlots = totalObsPerHour * totalHours;
  
  // Calculate available capacity for each staff member
  let totalAvailableSlots = 0;
  let hourlyFeasibility = {}; // Track feasibility for each hour
  let infeasibleHours = []; // Track which hours are problematic
  
  // First pass: Calculate hour-by-hour availability
  for (let hour = startHour; hour <= endHour; hour++) {
    let availableStaffThisHour = 0;
    
    staff.forEach(staffMember => {
      // Check if staff member is available this hour
      let isAvailable = true;
      
      // Skip if this hour is their break
      if (staffMember.break === hour) {
        isAvailable = false;
      }
      
      
      // Skip hour 8 if they have a user-assigned observation
      if (hour === 8 && staffMember.observations[8] && staffMember.observations[8] !== "-") {
        isAvailable = false;
      }
      
      // Check for security/nurse restricted hours (only if maxObs would be <= 9)
      const roughMaxObs = Math.ceil(totalObsSlots / staff.length);
      
      if (roughMaxObs <= 9) {
        if (staffMember.security === true && [8, 12, 17, 19].includes(hour)) {
          isAvailable = false;
        }
        if (staffMember.nurse === true && [8, 9, 19].includes(hour)) {
          isAvailable = false;
        }
      }
      
      if (isAvailable) {
        availableStaffThisHour++;
      }
    });
    
    hourlyFeasibility[hour] = {
      available: availableStaffThisHour,
      required: totalObsPerHour,
      isFeasible: availableStaffThisHour >= totalObsPerHour
    };
    
    if (!hourlyFeasibility[hour].isFeasible) {
      infeasibleHours.push(hour);
    }
  }
  
  // Second pass: Calculate total capacity respecting individual limits
  staff.forEach(staffMember => {
    let availableHours = 0;
    
    // Determine this staff member's observation limit
    let obsLimit;
    if (staffMember.security === true) {
      obsLimit = staffMember.securityObs ?? totalHours;
    } else if (staffMember.nurse === true) {
      obsLimit = staffMember.nurseObs ?? totalHours;
    } else {
      // Regular staff can work all available hours
      obsLimit = totalHours;
    }
    
    // Count actually available hours for this staff member
    for (let hour = startHour; hour <= endHour; hour++) {
      // Skip if this hour is their break
      if (staffMember.break === hour) continue;
      
      // Skip hour 8 if they have a user-assigned observation
      if (hour === 8 && staffMember.observations[8] && staffMember.observations[8] !== "-") {
        continue;
      }
      
      // Check for security/nurse restricted hours (only if maxObs would be <= 9)
      const roughMaxObs = Math.ceil(totalObsSlots / staff.length);
      
      if (roughMaxObs <= 9) {
        if (staffMember.security === true && [8, 12, 17, 19].includes(hour)) {
          continue;
        }
        if (staffMember.nurse === true && [8, 9, 19].includes(hour)) {
          continue;
        }
      }
      
      availableHours++;
    }
    
    // This staff member can contribute the minimum of their limit or available hours
    totalAvailableSlots += Math.min(obsLimit, availableHours);
  });
  
  // Calculate the actual pressure on the system
  const systemPressure = totalObsSlots / totalAvailableSlots;
  const effectiveMaxObs = Math.ceil(totalObsSlots / staff.length);
  const isHourlyFeasible = infeasibleHours.length === 0;
  
  return {
    effectiveMaxObs,           // Average observations per staff member
    totalObsSlots,             // Total slots that need filling
    totalAvailableSlots,       // Total capacity across all staff
    systemPressure,            // Ratio of demand to capacity (>1 means infeasible)
    isFeasible: systemPressure <= 1.0 && isHourlyFeasible,
    hourlyFeasibility,         // Detailed breakdown per hour
    infeasibleHours            // List of problematic hours
  };
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
    
    const workloadGap = maxObs - staffMember.numObservations;
    addPoints(workloadGap * 10, "strong workload balance incentive");
    
    // FIXED: Consecutive busy hour penalties - only count actual observations as "busy"
    if (hour >= 11 && isActualObservation(prev1) && isActualObservation(prev2)) {
      addPoints(-20, "penalty for 2 consecutive hours with observations");
    }
    
    if (hour >= 12 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3)) {
      addPoints(-30, "penalty for 3 consecutive hours with observations");
    }
    
    if (hour >= 13 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3) && isActualObservation(prev4)) {
      addPoints(-50, "penalty for 4 consecutive hours with observations");
    }
    
    if (hour >= 14 && isActualObservation(prev1) && isActualObservation(prev2) && isActualObservation(prev3) && isActualObservation(prev4) && isActualObservation(prev5)) {
      addPoints(-50, "penalty for 5 consecutive hours with observations");
    }
    
   

// CUMULATIVE SCORING - Check each past hour individually
let repetitionPenalty = 0;
let varietyBonus = 0;

const prevHours = [prev1, prev2, prev3, prev4, prev5, prev6, prev7, prev8, prev9];
const penaltyValues = [30, 25, 20, 15, 14, 13, 12, 11, 10]; // Decreasing weight for older hours
const bonusValues = [30, 25, 20, 15, 14, 13, 12, 11, 10];

for (let i = 0; i < prevHours.length; i++) {
  if (hour >= (9 + i) && isActualObservation(prevHours[i])) {
    if (prevHours[i] === obsName) {
      // Had THIS observation - penalty compounds
      repetitionPenalty -= penaltyValues[i];
    } else {
      // Had DIFFERENT observation - bonus compounds
      varietyBonus += bonusValues[i];
    }
  }
}

// Apply cumulative totals
if (repetitionPenalty < 0) {
  addPoints(repetitionPenalty, `cumulative penalty: had '${obsName}' ${Math.abs(repetitionPenalty)} penalty points from recent history`);
}

if (varietyBonus > 0) {
  addPoints(varietyBonus, `cumulative variety bonus: ${varietyBonus} points for having different observations recently`);
}
   
  }

  // Security staff logic - optimized
  if (isSecurity) {
    const allowedObs = staffMember.securityObs || 0;
    
    if (allowedObs > 0) {
      const idealGap = 9 / allowedObs;
      const lastHour = getLastObservationHour(staffMember, hour, observations);
      
      if (lastHour !== -1) {
        const hoursSinceLast = hour - lastHour;
        const points = hoursSinceLast < idealGap ? -100 : 40;
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
      const idealGap = 9 / allowedObs;
      const lastHour = getLastObservationHour(staffMember, hour, observations);
    
      if (lastHour !== -1) {
        const hoursSinceLast = hour - lastHour;
        const points = hoursSinceLast < idealGap ? -100 : 40;
        const reason = hoursSinceLast < idealGap ? 
          ("penalty for assigning nurse too soon (ideal gap not met)", lastHour, idealGap) :
          ("bonus for meeting or exceeding the ideal gap before next nurse assignment", lastHour, idealGap);
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
    if (hour >= 10 && obs[hour-2] === obsName) {
      addPoints(-30, "penalty for repeating same observation 2 hours ago for nurse");
    }
    if (hour >= 11 && obs[hour-3] === obsName) {
      addPoints(-30, "penalty for repeating same observation 3 hours ago for nurse");
    }
    if (hour >= 12 && obs[hour-4] === obsName) {
      addPoints(-30, "penalty for repeating same observation 4 hours ago for nurse");
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

  function checkAssignmentConditions(staffMember, hour, observation, maxObs, staff = null) {
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
  
  // Check if assigning this nurse would leave no nurses free
  let wouldLeaveNoNurseFree = false;
  if (staffMember.nurse === true && staff) {
    const allNurses = staff.filter(s => s.nurse === true);
    const totalNurses = allNurses.length;
    
    console.log(`\n=== NURSE CHECK: Hour ${hour}, Checking ${staffMember.name} ===`);
    console.log(`Total nurses in system: ${totalNurses}`);
    console.log(`All nurses:`, allNurses.map(n => n.name));
    
    // Only enforce if there are 2+ nurses
    if (totalNurses >= 2) {
      // Count how many OTHER nurses are already busy at this hour
      const otherBusyNurses = allNurses.filter(s => 
        s.name !== staffMember.name && s.observations[hour] !== "-"
      );
      
      console.log(`Other busy nurses at hour ${hour}:`, otherBusyNurses.map(n => ({
        name: n.name,
        observation: n.observations[hour]
      })));
      console.log(`Other busy nurse count: ${otherBusyNurses.length}`);
      
      // If assigning this nurse would make all nurses busy, prevent it
      // (otherBusyNurses + 1 would equal totalNurses)
      wouldLeaveNoNurseFree = (otherBusyNurses.length + 1) >= totalNurses;
      
      console.log(`Would assigning ${staffMember.name} leave no nurses free? ${wouldLeaveNoNurseFree}`);
      console.log(`Calculation: (${otherBusyNurses.length} + 1) >= ${totalNurses} = ${wouldLeaveNoNurseFree}`);
    } else {
      console.log(`Only ${totalNurses} nurse(s), no restriction applied`);
    }
    console.log(`=== END NURSE CHECK ===\n`);
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
    !isNurse &&                // Not nurse restricted hour
    !wouldLeaveNoNurseFree     // Would not leave all nurses busy
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
            numObservations: 0,
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
            numObservations: 0,
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
  // Get list of current observation names
  const currentObservationNames = new Set(observations.map(obs => obs.name));
  
  // Get deletedObs array (all observations share the same deletedObs)
  const deletedObservations = observations[0]?.deletedObs || [];
  
  // ✅ FIX: Only actually delete observations that are NOT current
  const observationsToClean = new Set();
  
  // Add ONLY deleted observations that are NOT current
  deletedObservations.forEach(name => {
    if (!currentObservationNames.has(name)) {
      observationsToClean.add(name);
    }
  });
  
  // Add shortened form for "Generals" if it was deleted (and not current)
  if (deletedObservations.includes("Generals") && !currentObservationNames.has("Generals")) {
    observationsToClean.add("Gen");
  }
  
  staff.forEach((staffMember) => {
    // Reset tracking variables
    staffMember.lastObservation = staffMember.observations[8];
    staffMember.obsCounts = {};
    staffMember.lastReceived = {};
    
    // Handle hours before startHour - only clear DELETED (non-current) observations
    for (let hour = 7; hour < startHour; hour++) {
      const currentValue = staffMember.observations[hour];
      // Only clear if it's a DELETED observation that's not current
      if (observationsToClean.has(currentValue)) {
        staffMember.observations[hour] = "-";
      }
      // Otherwise leave it unchanged (includes current observations)
    }
    
    // Reset observations in the scheduling window (startHour to 19)
    for (let hour = startHour; hour <= 19; hour++) {
      const currentValue = staffMember.observations[hour];

      // CRITICAL: Preserve user-assigned hour 8 if startHour <= 8
      if (hour === 8 && startHour <= 8) {
        const hour8Value = staffMember.observations[8];
        // Only preserve if it's a CURRENT observation (not deleted)
        if (hour8Value && hour8Value !== "-" && currentObservationNames.has(hour8Value)) {
          // Keep the user's hour 8 assignment
          continue;
        }
      }
      
      // Check if this value should be cleared
      // Clear if: (1) it's a current observation OR (2) it's a deleted non-current observation
      if (currentObservationNames.has(currentValue) || observationsToClean.has(currentValue)) {
        // Clear this observation
       staffMember.observations[hour] = "-";
      }
      // Otherwise, keep the value (user-entered custom values, Break, X, etc.)
      else {
        // Preserve the existing value
        staffMember.observations[hour] = currentValue || "-";
      }
    }
    
    // Recalculate numObservations based on actual assignments
    staffMember.numObservations = 0;
    for (let hour = 7; hour <= 19; hour++) {
      const obs = staffMember.observations[hour];
      // Count only valid observation assignments that are still in the current list
      if (obs && currentObservationNames.has(obs)) {
        staffMember.numObservations++;
      }
    }
  });
}


// Run ONCE before the simulation. Mutates `staff` and `observations` in place.
function applyDeletedObsOnce(staff, observations, startHour = 7) {
  // Collect deleted labels
  const toDelete = new Set(
    observations.flatMap(o => Array.isArray(o.deletedObs) ? o.deletedObs : [])
  );

  if (toDelete.size === 0) return false; // nothing to do

  // ✅ FIX: Get current observation names - don't delete these!
  const currentNames = new Set(observations.map(o => o.name));
  
  // ✅ FIX: Only delete observations that are NOT currently active
  const toActuallyDelete = new Set([...toDelete].filter(name => !currentNames.has(name)));

  if (toActuallyDelete.size === 0) {
    // All "deleted" observations are actually current, so just clear the deletedObs array
    observations.forEach(o => {
      if (Array.isArray(o.deletedObs) && o.deletedObs.length) o.deletedObs = [];
    });
    return false;
  }

  // For counting valid obs later
  const validNames = new Set(observations.map(o => o.name));

  // 1) Remove any timetable values that match deletedObs (but not current observations)
  staff.forEach(member => {
    const obsMap = member.observations || {};
    for (let h = startHour; h <= 19; h++) {
      const val = obsMap[h];
      if (h === 8 && val && val !== "-" && validNames.has(val)) {
          continue;
        }
      if (toActuallyDelete.has(val)) {
        obsMap[h] = "-";
      }
    }
    // Recount actual assignments (only current/valid obs names)
    member.numObservations = Object.keys(obsMap).reduce(
      (acc, h) => acc + (validNames.has(obsMap[h]) ? 1 : 0),
      0
    );
  });

  // 2) Clear deletedObs so future iterations ignore them
  observations.forEach(o => {
    if (Array.isArray(o.deletedObs) && o.deletedObs.length) o.deletedObs = [];
  });

  return true;
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


const handleAllocate = async () => {
  console.log('🚀🚀🚀 ═══════════════════════════════════════');
  console.log('🚀 HANDLE ALLOCATE CALLED');
  console.log('🚀🚀🚀 ═══════════════════════════════════════');
  console.log('Time:', new Date().toLocaleTimeString());

  setIsLoadingSolver(true);
  
  const start = selectedStartHour || 9;
  
  // ═══════════════════════════════════════
  // 🔍 STEP 1: LOG OBSERVATIONS STATE
  // ═══════════════════════════════════════
  console.log('\n📋 ═══════════════════════════════════════');
  console.log('📋 OBSERVATIONS STATE');
  console.log('📋 ═══════════════════════════════════════');
  console.log('Total observations:', observations.length);
  observations.forEach((obs, idx) => {
    console.log(`\n  ${idx + 1}. Observation: "${obs.name}"`);
    console.log(`     - ID: ${obs.id}`);
    console.log(`     - Type: ${obs.observationType}`);
    console.log(`     - Staff needed: ${obs.staff}`);
    console.log(`     - StaffNeeded: ${obs.StaffNeeded}`);
    console.log(`     - deletedObs:`, obs.deletedObs || []);
  });
  
  // Create a set of current observation names
  const currentObservationNames = new Set(observations.map(obs => obs.name));
  console.log('\n📋 Current observation names (Set):', [...currentObservationNames]);
  
  // Get all deletedObs
  const allDeletedObs = observations.flatMap(o => o.deletedObs || []);
  console.log('📋 All deleted observations:', allDeletedObs);
  
  // ═══════════════════════════════════════
  // 🔍 STEP 2: LOG STAFF STATE BEFORE PROCESSING
  // ═══════════════════════════════════════
  console.log('\n👥 ═══════════════════════════════════════');
  console.log('👥 STAFF STATE BEFORE PROCESSING');
  console.log('👥 ═══════════════════════════════════════');
  console.log('Total staff:', staff.length);
  
  staff.forEach((member, idx) => {
    console.log(`\n  ${idx + 1}. Staff: ${member.name}`);
    console.log(`     - ID: ${member.id}`);
    console.log(`     - Break: ${member.break}`);
    console.log(`     - Role: ${member.role}`);
    console.log(`     - ObservationId: ${member.observationId}`);
    console.log(`     - NumObservations: ${member.numObservations}`);
    console.log(`     - Initialized: ${member.initialized}`);
    
    // Check what observation values are in their schedule
    if (member.observations) {
      const allObsValues = new Set();
      const obsEntries = [];
      
      for (let hour = 7; hour <= 19; hour++) {
        const val = member.observations[hour];
        if (val && val !== '-') {
          allObsValues.add(val);
          obsEntries.push(`${hour}:${val}`);
        }
      }
      
      console.log(`     - Unique observation values:`, [...allObsValues]);
      console.log(`     - All assignments:`, obsEntries.join(', '));
      
      // Check for obsolete observations
      const obsoleteObs = [...allObsValues].filter(val => 
        val !== 'X' && 
        val !== 'Break' && 
        val !== 'break' && 
        !currentObservationNames.has(val)
      );
      
      if (obsoleteObs.length > 0) {
        console.log(`     ⚠️ OBSOLETE observations found:`, obsoleteObs);
      }
    }
  });
  
  // ═══════════════════════════════════════
  // 🔍 STEP 3: ANALYZE WHAT SHOULD BE CLEANED
  // ═══════════════════════════════════════
  console.log('\n🧹 ═══════════════════════════════════════');
  console.log('🧹 CLEANUP ANALYSIS');
  console.log('🧹 ═══════════════════════════════════════');
  
  // Collect all observation values currently in staff
  const allStaffObsValues = new Set();
  staff.forEach(member => {
    if (member.observations) {
      Object.values(member.observations).forEach(val => {
        if (val && val !== '-' && val !== 'X' && val !== 'Break' && val !== 'break') {
          allStaffObsValues.add(val);
        }
      });
    }
  });
  
  console.log('All observation values in staff schedules:', [...allStaffObsValues]);
  console.log('Current valid observations:', [...currentObservationNames]);
  
  // Find what's in staff but NOT in current observations
  const shouldBeDeleted = [...allStaffObsValues].filter(val => !currentObservationNames.has(val));
  console.log('❌ Values that should be deleted:', shouldBeDeleted);
  
  // Find what's marked as deleted in deletedObs
  const markedAsDeleted = allDeletedObs.filter(val => !currentObservationNames.has(val));
  console.log('🗑️ Values marked in deletedObs:', markedAsDeleted);
  
  // Check if they match
  if (shouldBeDeleted.length > 0 && markedAsDeleted.length === 0) {
    console.warn('⚠️ WARNING: Found obsolete observations but deletedObs is empty!');
  }

  console.log('\n📊 Calculating metrics...');
  const metricsStartTime = Date.now();
  const metrics = calculateEffectiveMaxObservations(observations, staff, start, 19);
  const metricsDuration = Date.now() - metricsStartTime;
  
  console.log('═══════════════════════════════════════');
  console.log('📈 METRICS CALCULATION COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`⏱️ Calculation time: ${metricsDuration}ms`);
  console.log(`Effective Max Observations: ${metrics.effectiveMaxObs}`);
  console.log(`Total Slots Needed: ${metrics.totalObsSlots}`);
  console.log(`Total Available Capacity: ${metrics.totalAvailableSlots}`);
  console.log(`System Pressure: ${metrics.systemPressure.toFixed(2)}`);
  console.log(`Feasible: ${metrics.isFeasible ? 'YES ✓' : 'NO ✗'}`);
  
  // Log hourly breakdown
  console.log('\n--- Hourly Feasibility ---');
  Object.keys(metrics.hourlyFeasibility).forEach(hour => {
    const hourData = metrics.hourlyFeasibility[hour];
    const status = hourData.isFeasible ? '✓' : '✗';
    console.log(`Hour ${hour}: ${hourData.available} available / ${hourData.required} required ${status}`);
  });
  console.log('═══════════════════════════════════════');

  // Show detailed alert if infeasible
  if (!metrics.isFeasible) {
    console.log('⚠️ SCHEDULE IS NOT FEASIBLE!');
    let alertMessage = 'Warning: This schedule is NOT feasible!\n\n';
    
    if (metrics.infeasibleHours.length > 0) {
      alertMessage += 'Problematic hours:\n';
      metrics.infeasibleHours.forEach(hour => {
        const hourData = metrics.hourlyFeasibility[hour];
        alertMessage += `  Hour ${hour}: Need ${hourData.required} staff, only ${hourData.available} available\n`;
      });
      alertMessage += '\nSuggestions:\n';
      alertMessage += '- Adjust break times to avoid overlaps\n';
      alertMessage += '- Add more staff members\n';
      alertMessage += '- Reduce observation requirements\n';
    } else {
      alertMessage += `Overall capacity issue:\n`;
      alertMessage += `Total slots needed: ${metrics.totalObsSlots}\n`;
      alertMessage += `Total available capacity: ${metrics.totalAvailableSlots}\n`;
      alertMessage += `The system is ${((metrics.systemPressure - 1) * 100).toFixed(1)}% over capacity.\n`;
    }
    
    alert(alertMessage);
  }

  // ═══════════════════════════════════════
  // 🔍 STEP 4: BEFORE applyDeletedObsOnce
  // ═══════════════════════════════════════
  console.log('\n🧹 ═══════════════════════════════════════');
  console.log('🧹 BEFORE applyDeletedObsOnce');
  console.log('🧹 ═══════════════════════════════════════');
  
  const beforeApply = JSON.parse(JSON.stringify(staff.map(s => ({
    name: s.name,
    observations: s.observations,
    numObservations: s.numObservations
  }))));
  
  console.log('Snapshot taken for comparison');
  
  // ═══════════════════════════════════════
  // 🔍 STEP 5: RUN applyDeletedObsOnce
  // ═══════════════════════════════════════
  console.log('\n🧹 Calling applyDeletedObsOnce...');
  const didClean = applyDeletedObsOnce(staff, observations, 8);
  console.log('🧹 applyDeletedObsOnce returned:', didClean);
  
  // ═══════════════════════════════════════
  // 🔍 STEP 6: AFTER applyDeletedObsOnce
  // ═══════════════════════════════════════
  console.log('\n🧹 ═══════════════════════════════════════');
  console.log('🧹 AFTER applyDeletedObsOnce');
  console.log('🧹 ═══════════════════════════════════════');
  
  const afterApply = JSON.parse(JSON.stringify(staff.map(s => ({
    name: s.name,
    observations: s.observations,
    numObservations: s.numObservations
  }))));
  
  // Compare before and after
  staff.forEach((member, idx) => {
    const before = beforeApply[idx];
    const after = afterApply[idx];
    
    const changedHours = [];
    for (let hour = 7; hour <= 19; hour++) {
      const beforeVal = before.observations?.[hour];
      const afterVal = after.observations?.[hour];
      if (beforeVal !== afterVal) {
        changedHours.push(`${hour}: "${beforeVal}" → "${afterVal}"`);
      }
    }
    
    if (changedHours.length > 0) {
      console.log(`\n  ${member.name}:`);
      console.log(`    Changes: ${changedHours.join(', ')}`);
      console.log(`    numObservations: ${before.numObservations} → ${after.numObservations}`);
    }
  });
  
  if (!didClean) {
    console.log('  ℹ️ No changes made by applyDeletedObsOnce');
  }

  // Decision time
  const shouldUseSolver = metrics.systemPressure > 0.65 || metrics.effectiveMaxObs >= 8;
  console.log(`\n🤔 Decision: ${shouldUseSolver ? 'USE SOLVER' : 'USE LOCAL ALGORITHM'}`);
  console.log(`   Reason: pressure=${metrics.systemPressure.toFixed(2)} (threshold: 0.65), maxObs=${metrics.effectiveMaxObs} (threshold: 8)`);

  if (shouldUseSolver) {
    console.log('\n═══════════════════════════════════════');
    console.log('⚡ USING RAILWAY SOLVER');
    console.log('═══════════════════════════════════════');
    
    // ═══════════════════════════════════════
    // 🔍 STEP 7: BEFORE resetStaff
    // ═══════════════════════════════════════
    console.log('\n🔄 ═══════════════════════════════════════');
    console.log('🔄 BEFORE resetStaff');
    console.log('🔄 ═══════════════════════════════════════');
    
    const beforeReset = JSON.parse(JSON.stringify(staff.map(s => ({
      name: s.name,
      observations: s.observations,
      numObservations: s.numObservations
    }))));
    
    console.log('\n🔄 Calling resetStaff...');
    resetStaff(staff, observations, start);
    console.log('✅ resetStaff complete');
    
    // ═══════════════════════════════════════
    // 🔍 STEP 8: AFTER resetStaff
    // ═══════════════════════════════════════
    console.log('\n🔄 ═══════════════════════════════════════');
    console.log('🔄 AFTER resetStaff');
    console.log('🔄 ═══════════════════════════════════════');
    
    const afterReset = JSON.parse(JSON.stringify(staff.map(s => ({
      name: s.name,
      observations: s.observations,
      numObservations: s.numObservations
    }))));
    
    // Compare before and after resetStaff
    staff.forEach((member, idx) => {
      const before = beforeReset[idx];
      const after = afterReset[idx];
      
      const changedHours = [];
      for (let hour = 7; hour <= 19; hour++) {
        const beforeVal = before.observations?.[hour];
        const afterVal = after.observations?.[hour];
        if (beforeVal !== afterVal) {
          changedHours.push(`${hour}: "${beforeVal}" → "${afterVal}"`);
        }
      }
      
      if (changedHours.length > 0) {
        console.log(`\n  ${member.name}:`);
        console.log(`    Changes: ${changedHours.join(', ')}`);
        console.log(`    numObservations: ${before.numObservations} → ${after.numObservations}`);
      }
    });
    
    console.log('\n🔍 STAFF STATE AFTER resetStaff:');
    staff.forEach((member, idx) => {
      console.log(`  ${member.name}: numObservations = ${member.numObservations}`);
      const filledHours = Object.entries(member.observations || {}).filter(([h, v]) => v !== '-' && v);
      if (filledHours.length > 0) {
        console.log(`    Filled: ${filledHours.map(([h, v]) => `${h}:${v}`).join(', ')}`);
      }
    });
    
    try {
      // Map your data format to Railway's expected format
      console.log('📦 Preparing request data...');
      const railwayObservations = observations.map(obs => ({
        id: obs.id,
        name: obs.name,
        observationType: obs.observationType,
        StaffNeeded: obs.staff
      }));
      
      const requestData = {
        staff: staff,
        observations: railwayObservations,
        startHour: start
      };
      
      // Log request size
      const requestSize = JSON.stringify(requestData).length;
      console.log(`📦 Request size: ${(requestSize / 1024).toFixed(2)} KB`);
      
      console.log('📤 SENDING TO RAILWAY API');
      console.log('───────────────────────────────────────');
      console.log('📋 STAFF ARRAY:');
      console.log(JSON.stringify(staff, null, 2));
      console.log('───────────────────────────────────────');
      console.log('📋 OBSERVATIONS ARRAY:');
      console.log(JSON.stringify(railwayObservations, null, 2));
      console.log('───────────────────────────────────────');
      
      const endpoint = '/api/solve';  // Always use Vercel proxy
      
      console.log(`🎯 Endpoint: ${endpoint}`);
      
      const requestStartTime = Date.now();
      console.log(`⏰ Request start time: ${new Date(requestStartTime).toLocaleTimeString()}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const requestDuration = Date.now() - requestStartTime;
      console.log(`\n📥 Response received in ${requestDuration}ms`);
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);

      const resultText = await response.text();
      console.log(`📊 Response body length: ${resultText.length} characters`);
      
      let result;
      try {
        result = JSON.parse(resultText);
        console.log('✅ Successfully parsed JSON response');
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        console.log('Full response text:', resultText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      console.log('───────────────────────────────────────');
      console.log('📦 PARSED RESPONSE:');
      console.log(JSON.stringify(result, null, 2));
      console.log('───────────────────────────────────────');
      
      if (result.success) {
        console.log('✅ Railway solver succeeded!');
        console.log(`  - Status: ${result.stats.status}`);
        console.log(`  - Solve time: ${result.stats.solveTime}s`);
        console.log(`  - Consecutive penalty: ${result.stats.consecutivePenalty}`);
        console.log(`  - Workload diff: ${result.stats.workloadDiff}`);
        
        console.log('\n🔄 Updating staff with solver results...');
        const updatedStaff = staff.map((member, idx) => {
          const schedule = result.schedules[member.id];
          
          if (!schedule) {
            console.warn(`⚠️ No schedule for ${member.name} (ID: ${member.id})`);
            return member;
          }
          
          console.log(`  ✓ ${idx + 1}. ${member.name}:`);
          const assignments = Object.entries(schedule).filter(([h, v]) => v !== '-' && v !== 'break');
          console.log(`     Assigned hours: ${assignments.map(([h, v]) => `${h}:${v}`).join(', ')}`);
          
          // CRITICAL: Preserve user-assigned hour 8
            const mergedObservations = { ...member.observations };
            Object.entries(schedule).forEach(([hour, value]) => {
              const h = parseInt(hour);
              // Don't overwrite hour 8 if user has set it and we're starting at 8 or earlier
              if (h === 8 && start <= 8 && member.observations[8] && member.observations[8] !== "-") {
                // Keep the user's assignment
                console.log(`     ⚠️ Preserving user-assigned hour 8: ${member.observations[8]}`);
                return;
              }
              mergedObservations[h] = value;
            });
          
          return {
            ...member,
            observations: mergedObservations,
            initialized: true
          };
        });
        
        console.log('\n💾 Calling setStaff with updated data...');
        setStaff(updatedStaff);
        console.log('✅ Schedule updated from Railway solver');
        console.log('═══════════════════════════════════════');
        
      } else {
        console.error('❌ Solver failed:', result.error);
        console.log('───────────────────────────────────────');
        console.log('🔄 Falling back to local algorithm...');
        
        alert(`Railway solver failed: ${result.error}\n\nUsing local algorithm instead.`);
        
        console.log('🏃 Running runSimulation...');
        const simStartTime = Date.now();
        const allocationCopy = runSimulation(observations, staff, start);
        const simDuration = Date.now() - simStartTime;
        console.log(`✅ runSimulation completed in ${simDuration}ms`);
        
        setStaff(allocationCopy);
        console.log('✅ Local algorithm completed');
        console.log('═══════════════════════════════════════');
      }
      
    } catch (error) {
      console.error('❌ API CALL FAILED');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.log('───────────────────────────────────────');
      console.log('🔄 Falling back to local algorithm...');
      
      alert(`Network error: ${error.message}\n\nUsing local algorithm instead.`);
      
      console.log('🏃 Running runSimulation...');
      const simStartTime = Date.now();
      const allocationCopy = runSimulation(observations, staff, start);
      const simDuration = Date.now() - simStartTime;
      console.log(`✅ runSimulation completed in ${simDuration}ms`);
      
      setStaff(allocationCopy);
      console.log('✅ Local algorithm completed');
      console.log('═══════════════════════════════════════');
    }
    
  } else {
    console.log('\n═══════════════════════════════════════');
    console.log('🏃 USING LOCAL GREEDY ALGORITHM (low pressure)');
    console.log('═══════════════════════════════════════');
    
    console.log('🏃 Running runSimulation...');
    const simStartTime = Date.now();
    const allocationCopy = runSimulation(observations, staff, start);
    const simDuration = Date.now() - simStartTime;
    console.log(`✅ runSimulation completed in ${simDuration}ms`);
    
    setStaff(allocationCopy);
    console.log('✅ Local algorithm completed');
    console.log('═══════════════════════════════════════');
  }
  
  setIsLoadingSolver(false);
  console.log('\n🏁 HANDLE ALLOCATE COMPLETE');
  console.log('🏁 Time:', new Date().toLocaleTimeString());
  console.log('🏁🏁🏁 ═══════════════════════════════════════\n\n');
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
    console.log("=== NAVIGATING TO ALLOCATION ===");
    console.log("Staff:", staff.map(s => ({ name: s.name, initialized: s.initialized })));
    
    // Check if any staff need initialization (shouldn't happen with new approach)
    const needsInitialization = staff.some(member => !member.initialized);
    if (needsInitialization) {
      console.warn("⚠️ Some staff not initialized - this shouldn't happen!");
      setStaff([...staff]);
    }
    
    // ✨ Initialize undo/redo tracking ONLY THE FIRST TIME
    if (!isAllocationReady && staff.length > 0) {
      console.log('🟢 Starting undo/redo tracking for AllocationCreation (first time only)');
      resetHistory(staff); // Only called ONCE
      setIsAllocationReady(true);
    } else if (isAllocationReady) {
      console.log('ℹ️ Undo/redo already active, not resetting');
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
  // Preserve hour 8 if it has a user assignment
        if (hour === 8 && staffMember.observations[8] && staffMember.observations[8] !== "-") {
          observations[hour] = staffMember.observations[8];
        } else {
          observations[hour] = "-";
        }
      }
      
      return {
        ...staffMember,
        observations,
        obsCounts: {},
        lastReceived: {},
        numObservations: (observations[8] && observations[8] !== "-") ? 1 : 0,
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
  <>
    {/* Loading Overlay */}
    {isLoadingSolver && (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>
            Optimizing Schedule...
          </div>
          <div className={styles.loadingSubtext}>
            {selectedStartHour ? 
              `Using advanced solver (${selectedStartHour}:00 - 19:00)` : 
              'Using advanced solver'}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill}></div>
          </div>
        </div>
      </div>
    )}
    
    {/* Navigation container */}
    <div className={styles.navigationContainer}>
      {(currentPage === "staff" || currentPage === "allocation" || (currentPage === "patient" && hasCachedData)) && (
        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
      )}

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
            className={`${styles.backButton} ${isLoadingSolver ? styles.disabledButton : ''}`}
            title="Auto-assign Observations"
            disabled={isLoadingSolver}
          >
            {isLoadingSolver ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{marginRight: '8px'}}></i>
                Solving...
              </>
            ) : (
              selectedStartHour ? `Auto-Assign ${selectedStartHour} - 19` : 'Auto-Assign'
            )}
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

      {currentPage !== "staff" && currentPage !== "allocation" && (
        <div className={styles.spacer}></div>
      )}

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
  </>
);
}

export default NavigationButtons;
