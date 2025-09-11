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
      // Check if the staff member has already been initialized
      if (!staffMember.initialized) {
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

        // Mark this staff member as initialized
        staffMember.initialized = true;
      }
      if (staffMember.initialized) {
        staffMember.observations[8] = staffMember.observationId
          ? staffMember.observationId
          : "-";
      }
    });
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
  function getLastObservationHour(staffMember, hour) {
    // scan backwards from currentHour-1 down to 7
    for (let h = hour - 1; h >= 7; h--) {
      if (staffMember.observations[h] && staffMember.observations[h] !== '-') {
        return h;
      }
    }
    return -1; // not found
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
  lookAheadPlan = null // NEW PARAMETER
) {
  let score = 0;
  const reasons = [];

  function addPoints(points, reason) {
    score += points;
    reasons.push(`${points >= 0 ? '+' : ''}${points}: ${reason}`);
  }

  // NEW: Look-ahead planning scores
  if (lookAheadPlan) {
    const plan = lookAheadPlan.staffPlans[staffMember.name];
    const progress = staffMember.numObservations;
    const hoursPassed = hour - 8;
    const hoursRemaining = 19 - hour + 1;
    
    // Expected progress at this point in the day
    const expectedProgress = Math.floor((hoursPassed / 12) * plan.targetObservations);
    
    // 1. Check if we're on track
    if (progress < expectedProgress - 1) {
      addPoints(2000, "Behind schedule - needs to catch up");
    } else if (progress > expectedProgress + 1) {
      addPoints(-2000, "Ahead of schedule - should slow down");
    }
    
    // 2. Check if this is an ideal hour for them
    if (plan.idealHours.includes(hour)) {
      addPoints(1000, "This is an ideal hour in their plan");
    }
    
    // 3. Check remaining capacity
    const remainingNeeded = plan.targetObservations - progress;
    if (remainingNeeded > hoursRemaining * 0.9) {
      addPoints(3000, "Must assign now - running out of hours");
    }
    
    // 4. Check consecutive observations
    let consecutive = 0;
    for (let h = hour - 1; h >= Math.max(8, hour - 3); h--) {
      if (staffMember.observations[h] && staffMember.observations[h] !== '-') {
        consecutive++;
      } else {
        break;
      }
    }
    
    if (consecutive >= lookAheadPlan.maxConsecutive) {
      addPoints(-5000, `Would exceed max consecutive limit (${lookAheadPlan.maxConsecutive})`);
    } else if (consecutive > 0 && lookAheadPlan.systemPressure < 0.7) {
      addPoints(-1000 * consecutive, `Consecutive penalty in low-pressure system`);
    }
    
    // 5. Gap optimization
    let gapSinceLastObs = 0;
    for (let h = hour - 1; h >= 8; h--) {
      if (staffMember.observations[h] && staffMember.observations[h] !== '-') {
        gapSinceLastObs = hour - h - 1;
        break;
      }
    }
    
    if (gapSinceLastObs === lookAheadPlan.idealGap) {
      addPoints(1500, "Perfect gap spacing");
    } else if (gapSinceLastObs < lookAheadPlan.idealGap && gapSinceLastObs > 0) {
      addPoints(-500, "Gap too small");
    }
  }

  // KEEP ALL YOUR EXISTING SCORING LOGIC BELOW
  if (staffMember.security === false) {
    addPoints(maxObs - staffMember.numObservations, "non-security baseline (maxObs - numObservations)")

    let noOneHadFreeHour = staff.every(
      (member) => member.observations[hour - 1] !== "-"
    );

    if (
      staffMember.observations[hour - 1] === "Generals" &&
      staffMember.observations[hour - 2] === "-" &&
      noOneHadFreeHour
    ) {
      addPoints(2000, "staffMember had Generals after a free hour while no one else had a free hour");
    }

    // Negatives for back-to-back non-free hours
    if (
      hour >= 10 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 1] !== "Generals" &&
      staffMember.observations[hour - 2] !== "-" &&
      staffMember.observations[hour - 2] !== "Generals"
    ) {
      addPoints(-15, "penalty for 2 consecutive hours without free or Generals");
    }
    if (
      hour >= 11 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 2] !== "-" 
    ) {
      addPoints(-50, "penalty for 3 consecutive hours busy");
    }
    if (
      hour >= 11 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 2] !== "-" &&
      staffMember.observations[hour - 3] !== "-"
    ) {
      addPoints(-50, "penalty for 3 consecutive hours busy");
    }
    if (
      hour >= 12 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 2] !== "-" &&
      staffMember.observations[hour - 3] !== "-" &&
      staffMember.observations[hour - 4] !== "-"
    ) {
      addPoints(-50, "penalty for 4 consecutive hours busy");
    }
    if (
      hour >= 13 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 2] !== "-" &&
      staffMember.observations[hour - 3] !== "-" &&
      staffMember.observations[hour - 4] !== "-" &&
      staffMember.observations[hour - 5] !== "-"
    ) {
      addPoints(-50, "penalty for 5 consecutive hours busy");
    }

    // Free hour additions
    if (staffMember.observations[hour - 1] === "-") {
      addPoints(22, "bonus for free hour in the previous hour");
    }
    if (
      hour >= 10 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-"
    ) {
      addPoints(15, "bonus for 2 consecutive free hours");
    }
    if (
      hour >= 11 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 3] === "-"
    ) {
      addPoints(5, "bonus for 3 consecutive free hours");
    }
    if (
      hour >= 12 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 3] === "-" &&
      staffMember.observations[hour - 4] === "-"
    ) {
      addPoints(15, "bonus for 4 consecutive free hours");
    }
    if (
      hour >= 13 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 3] === "-" &&
      staffMember.observations[hour - 4] === "-"  &&
      staffMember.observations[hour - 5] === "-"
    ) {
      addPoints(20, "bonus for 5 consecutive free hours");
    }

    // Distributing observations evenly (+)
    if (
      staffMember.observations[hour - 1] !== observation.name ||
      staffMember.observations[hour - 2] !== observation.name ||
      staffMember.observations[hour - 3] !== observation.name ||
      staffMember.observations[hour - 4] !== observation.name ||
      staffMember.observations[hour - 5] !== observation.name
    ) {
      addPoints(10, "even distribution bonus (5-hour check)");
    }
    if (
      staffMember.observations[hour - 1] !== observation.name ||
      staffMember.observations[hour - 2] !== observation.name ||
      staffMember.observations[hour - 3] !== observation.name ||
      staffMember.observations[hour - 4] !== observation.name
    ) {
      addPoints(10, "even distribution bonus (4-hour check)");
    }
    if (
      staffMember.observations[hour - 1] !== observation.name ||
      staffMember.observations[hour - 2] !== observation.name ||
      staffMember.observations[hour - 3] !== observation.name
    ) {
      addPoints(15, "even distribution bonus (3-hour check)");
    }
    if (
      staffMember.observations[hour - 1] !== observation.name ||
      staffMember.observations[hour - 2] !== observation.name
    ) {
      addPoints(30, "even distribution bonus (2-hour check)");
    }
    if (
      staffMember.observations[hour - 1] !== observation.name
    ) {
      addPoints(20, "even distribution bonus (1-hour check)");
    }

    // Distributing observations evenly (-)
    if (
      staffMember.observations[hour - 1] === observation.name ||
      staffMember.observations[hour - 2] === observation.name ||
      staffMember.observations[hour - 3] === observation.name ||
      staffMember.observations[hour - 4] === observation.name ||
      staffMember.observations[hour - 5] === observation.name
    ) {
      addPoints(-10, "penalty for repeating same observation in last 5 hours");
    }
    if (
      staffMember.observations[hour - 1] === observation.name ||
      staffMember.observations[hour - 2] === observation.name ||
      staffMember.observations[hour - 3] === observation.name ||
      staffMember.observations[hour - 4] === observation.name
    ) {
      addPoints(-10, "penalty for repeating same observation in last 4 hours");
    }
    if (
      staffMember.observations[hour - 1] === observation.name ||
      staffMember.observations[hour - 2] === observation.name ||
      staffMember.observations[hour - 3] === observation.name
    ) {
      addPoints(-15, "penalty for repeating same observation in last 3 hours");
    }
    if (
      staffMember.observations[hour - 1] === observation.name ||
      staffMember.observations[hour - 2] === observation.name
    ) {
      addPoints(-20, "penalty for repeating same observation in last 2 hours");
    }

    // Has "Generals" in the last 4 hours
    let hasRecentGenerals = Object.keys(staffMember.observations)
      .some(h => h >= hour - 4 && h < hour && staffMember.observations[h] === "Generals");
    let generalsPenalty = hasRecentGenerals && observation.name === "Generals" ? -10 : 0;
    if (generalsPenalty !== 0) {
      addPoints(generalsPenalty, "penalty for having Generals again within 4 hours");
    }

    // Example condition
    let noOneElseCanReceive = staff.every(
      (member) =>
        member.observations[hour - 1] !== "-" || // did not have a free hour previously
        member.observations[hour] !== "-" || // already has an observation this hour
        (member.observations[hour - 1] === "-" &&
          observation.name === member.observations[hour - 1]) // had a free hour but can't receive same observation
    );

    if (
      noOneElseCanReceive &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 1] === "Generals" &&
      observation.name !== "Generals"
    ) {
      addPoints(1000, "bonus for forced assignment scenario (noOneElseCanReceive)");
    }

    if (
      maxObs <= 8 &&
      hour >= 10 &&
      staffMember.observations[hour - 1] !== "-" &&
      staffMember.observations[hour - 2] !== "-" &&
      staffMember.observations[hour - 1] !== "Generals" &&
      staffMember.observations[hour - 2] !== "Generals"
    ) {
      addPoints(-200, "large penalty for 2 consecutive busy hours when maxObs <= 8");
    }

    if(maxObs >=9 &&
      hour === 9 &&
      staffMember.observations[hour - 1] === "Generals"
    ){
      addPoints(20, "small bonus for Generals in previous hour when maxObs <= 8");
    }

    if(maxObs >=8){
      if (observation.name === "Generals" && hour > 9) {
        const prevObs = staffMember.observations[hour - 1];
    
        // If the staff had the same observation as the majority last hour => bonus
        if (prevObs && prevObs === majorityObsPrevHour) {
          addPoints(3333, "bonus for matching the majority observation last hour");
        } 
        // If staff had a minority observation last hour => penalty
        else {
          addPoints(-3333, "penalty for minority observation last hour");
        }
      }
    }
  }

  // Security staff
  if (staffMember.security === true) {
    const allowedObs = staffMember.securityObs || 0;
    const idealGap = 12 / allowedObs;

    const lastHour = getLastObservationHour(staffMember, hour);
    if (lastHour !== -1 && allowedObs !== 0) {
      const hoursSinceLast = hour - lastHour;

      // If hoursSinceLast is below idealGap => penalty
      if (hoursSinceLast < idealGap) {
        addPoints(-40000, "penalty for assigning security too soon (ideal gap not met)");
      } 
      // If they met or exceeded the ideal gap => bonus
      else {
        addPoints(40000, "bonus for meeting or exceeding the ideal gap before next security assignment");
      }
    }

    score += 200
    if(maxObs >=8){
      addPoints(40, "baseline bonus for security if maxObs >= 8");
    }
    if(maxObs >=9){
      addPoints(40, "additional bonus for security if maxObs >= 9");
    }

    // Penalty for repeating same observation in last few hours
    if (
      staffMember.observations[hour - 1] === observation.name ||
      staffMember.observations[hour - 2] === observation.name ||
      staffMember.observations[hour - 3] === observation.name ||
      staffMember.observations[hour - 4] === observation.name 
    ) {
      addPoints(-30, "penalty for repeating same observation in last 4 hours for security");
    }

    // Bonus for consecutive free hours
    if (
      hour >= 10 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" 
    ) {
      addPoints(30, "security bonus for 2 consecutive free hours");
    }
    if (
      hour >= 10 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 3] === "-"
    ) {
      addPoints(30, "security bonus for 3 consecutive free hours");
    }
    if (
      hour >= 10 &&
      staffMember.observations[hour - 1] === "-" &&
      staffMember.observations[hour - 2] === "-" &&
      staffMember.observations[hour - 3] === "-" &&
      staffMember.observations[hour - 4] === "-"
    ) {
      addPoints(20, "security bonus for 4 consecutive free hours");
    }

    // If Generals not in last 5 hours and current obs not Generals => small penalty
    let generalsPresent = false;
    for (let k = 1; k <= 7; k++) {
      if (hour >= 12 && staffMember.observations[hour - k] === "Generals") {
        generalsPresent = true;
        break; 
      }
    }
    if (!generalsPresent && observation.name !== "Generals") {
      addPoints(-20, "penalty for security if Generals not seen in last 5 hours but we aren't assigning Generals now");
    }
  }
  
  // Nurse condition
  if (staffMember.nurse === true) {
    if (
      staffMember.observations[hour - 1] === "-" &&
      observation.name === "Generals" &&
      hour >= 12
    ) {
      addPoints(1000, "nurse bonus for Generals in the next hour after a free hour (past hour >=12)");
    }

    if (observation.name !== "Generals") {
      let hasReceivedObservationRecently =
        staffMember.observations[hour - 2] === observation.name;
      if (hasReceivedObservationRecently) {
        addPoints(-30, "nurse penalty for receiving the same observation recently (1 hour gap)");
      }
    }
  }

  // Finally, log the hour, observation, staffMember, final score, and the reasons:
  logs.push(
    `Hour: ${hour}, Observation: ${observation.name}, ` +
    `Staff Member: ${staffMember.name}, Final Score: ${score}, Reasons: ${reasons.join(" | ")}`
  );

  return score;
}


  function checkAssignmentConditions(staffMember, hour, observation, maxObs) {
    let hadObservationLastHour =
      staffMember.observations[hour - 1] === observation.name;
    let hasObservationAlready = staffMember.observations[hour] !== "-";
    let maxObsSecurity =
      staffMember.security === true && staffMember.numObservations >= 5;
    let NurseMax =
      staffMember.nurse === true && staffMember.numObservations >= 4;
    let isOnBreak = staffMember.break === hour;
    let isSecurityHour =
      (hour === 12 || hour === 17 || hour === 19) &&
      staffMember.security === true;
    let securityObsMax = staffMember.security === true && staffMember.numObservations >= staffMember.securityObs;
    let isNurse =
      (hour === 8 || hour === 19) && staffMember.nurse === true && maxObs <= 9;
    let canNotRecieve = staffMember.observations[hour] === "X";
    //let reduceSecurityObs = staffMember.security === true && maxObs <= 8;

    return (
      !hasObservationAlready &&
      !hadObservationLastHour &&
      !isOnBreak &&
      !isSecurityHour &&
      !maxObsSecurity &&
      !securityObsMax &&
      !NurseMax &&
      !isNurse &&
      !canNotRecieve
    );
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
    let totalConsecutive = 0;  // This will store the sum of all valid sequences

    staff.forEach(staffMember => {
        let currentConsecutive = 0;

        for (let hour = 8; hour <= 19; hour++) {
            if (staffMember.observations[hour] && staffMember.observations[hour - 1] && staffMember.observations[hour - 2] &&
                staffMember.observations[hour] !== "-" && 
                staffMember.observations[hour - 1] !== "-" && 
                staffMember.observations[hour - 2] !== "-") {
                currentConsecutive++;
            } else {
                totalConsecutive += currentConsecutive;
                currentConsecutive = 0;
            }
        }
        // Add the last sequence if it didn't end with a break
        totalConsecutive += currentConsecutive;
    });

    //console.log(`Total Consecutive Observations Across All Staff: ${totalConsecutive}`);
    return totalConsecutive;
}

function runSimulation(observations, staff) {
  let minConsecutiveObservations = Number.MAX_SAFE_INTEGER;
  let bestStaffAllocation = null;
  let bestLogs = [];
  let bestUnassignedCount = Number.MAX_SAFE_INTEGER;
  
  // Create a base template once
  const staffTemplate = staff.map(member => ({
    ...member,
    observations: {},
    obsCounts: {},
    lastReceived: {},
    numObservations: member.observationId && member.observationId !== "-" ? 1 : 0,
    initialized: false
  }));
  
  console.time("optimized code");
  
  for (let i = 0; i < 500; i++) {
    let iterationLogs = [];
    let unassignedCountRef = { value: 0 };
    
    // Use template and reset instead of JSON parse/stringify
    let staffClone = staffTemplate.map(member => ({
      ...member,
      observations: { ...member.observations },
      obsCounts: {},
      lastReceived: {},
      numObservations: member.observationId && member.observationId !== "-" ? 1 : 0
    }));
    
    allocateObservations(observations, staffClone, iterationLogs, unassignedCountRef);
    
    let currentTotal = countConsecutiveObservations(staffClone);
    let unassignedCount = unassignedCountRef.value;
    
    // Add the console log for each iteration
    console.log(
      `Iteration ${i + 1}: Unassigned = ${unassignedCount}, ` +
      `Total Consecutive Observations = ${currentTotal}`
    );
    
    if (unassignedCount < bestUnassignedCount ||
        (unassignedCount === bestUnassignedCount && currentTotal < minConsecutiveObservations)) {
      bestUnassignedCount = unassignedCount;
      minConsecutiveObservations = currentTotal;
      bestStaffAllocation = staffClone; // No need to clone again
      bestLogs = iterationLogs;
    }
  }
  
  // Log the best iteration results
  console.log("Logs for the best iteration:");
  bestLogs.forEach((log) => console.log(log));
  
  console.log(
    `Best iteration had Unassigned = ${bestUnassignedCount}, ` +
    `Consecutive Observations = ${minConsecutiveObservations}`
  );
  
  console.timeEnd("optimized code");
  return bestStaffAllocation;
}



  function resetStaff(staff) {
    staff.forEach((staffMember) => {
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
        staffMember.observationId && staffMember.observationId !== "-" ? 1 : 0;
    });
  }

  function allocateObservations(observations, staff, logs, unassignedCountRef) {
  const maxObs = calculateMaxObservations(observations, staff);
  logs.push("MAX OBS --------", maxObs);
  
  // CREATE THE LOOK-AHEAD PLAN
  const lookAheadPlan = createLookAheadPlan(observations, staff);
  logs.push("LOOK-AHEAD PLAN --------", JSON.stringify(lookAheadPlan, null, 2));
  
  resetStaff(staff);

  let firstObservationEachHour = {};
  
  for (let hour = 9; hour <= 19; hour++) {
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
      staff,
      false, // shouldSwap
      false  // stillShouldSwap
    );

    observationsToProcess.forEach((observation, index) => {
      const staffWithScores = sortStaffByScore(
        staff,
        hour,
        maxObs,
        observation,
        maxObs,
        logs,
        majorityObsPrevHour,
        lookAheadPlan // PASS THE PLAN
      );
      
      assignObservationsToStaff(
        staff,
        staffWithScores,
        hour,
        observation,
        maxObs,
        firstObservationEachHour,
        logs,
        unassignedCountRef,
        lookAheadPlan // PASS THE PLAN
      );
      
      if (index === 0) {
        firstObservationEachHour[hour] = observation.name;
      }
    });
  }

  return staff;
}




function sortStaffByScore(
  staff,
  hour,
  maxObs,
  observation,
  maxObservations,
  logs,
  majorityObsPrevHour,
  lookAheadPlan
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
      lookAheadPlan
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

function assignObservationsToStaff(
  staff,
  staffWithScores,
  hour,
  observation,
  maxObservations,
  firstObservationEachHour,
  logs,
  unassignedCountRef,
  lookAheadPlan // ADD THIS PARAMETER
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
    
    // ADD THIS: Update the look-ahead plan tracking
    if (lookAheadPlan && lookAheadPlan.staffPlans[staffMember.name]) {
      lookAheadPlan.staffPlans[staffMember.name].currentCount++;
    }

    if (firstObservationEachHour[hour] === undefined) {
      firstObservationEachHour[hour] = observation.name;
    }
    logs.push(`Hour ${hour}: '${observation.name}' assigned to ${staffMember.name}`);
    assigned = true;
    break; // Break after assigning to one staff member
  }
  if (!assigned) {
    logs.push(`Hour ${hour}: Unable to assign '${observation.name}' to any staff member`);
    unassignedCountRef.value++;
  }
}

function randomSortEqualScores(a, b) {
  return Math.random() - 0.5;
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
    let allocationCopy = runSimulation(observations, staff);

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
        observations,
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
            AutoAssign
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
