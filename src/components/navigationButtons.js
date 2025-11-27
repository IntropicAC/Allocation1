//navigationButtons.js

import React, { useState, useEffect } from "react";
import styles from "./navigationButtons.module.css";
import { useReactToPrint } from "react-to-print";
import DataAnonymizer from './services/dataAnonymizer';


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
  resetHistory,
  hasUnfinishedForm
}) {
  
  useEffect(() => {
  console.log('\n🔔 ═══════════════════════════════════════');
  console.log('🔔 STATE CHANGE DETECTED');
  console.log('🔔 ═══════════════════════════════════════');
  console.log('Time:', new Date().toLocaleTimeString());
  console.log('Staff array length:', staff.length);
  console.log('Staff is array:', Array.isArray(staff));
  
  if (staff.length > 0) {
    console.log('\n📊 First staff member in state:');
    console.log('  Name:', staff[0].name);
    console.log('  ID:', staff[0].id);
    console.log('  Observations type:', typeof staff[0].observations);
    console.log('  Observations keys:', Object.keys(staff[0].observations || {}));
    console.log('  Full observations:', JSON.stringify(staff[0].observations, null, 2));
    
    // Check all staff for valid observations
    const staffWithInvalidObs = staff.filter(s => 
      !s.observations || 
      typeof s.observations !== 'object' || 
      Array.isArray(s.observations) ||
      Object.keys(s.observations).length === 0
    );
    
    if (staffWithInvalidObs.length > 0) {
      console.warn('⚠️ Found staff with invalid observations:');
      staffWithInvalidObs.forEach(s => {
        console.warn(`  - ${s.name}: observations =`, s.observations);
      });
    } else {
      console.log('✅ All staff have valid observations objects');
    }
  }
  
  console.log('═══════════════════════════════════════\n');
}, [staff]);

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

function validateScheduleFeasibility(observations, staff, startHour = 9, endHour = 19) {
  const errors = [];
  const warnings = [];
  
  // Get current observation names and requirements
  const currentObservationNames = new Set(observations.map(obs => obs.name));
  const obsRequirements = {};
  
  observations.forEach(obs => {
    obsRequirements[obs.name] = {
      staffNeeded: obs.staff || obs.StaffNeeded || 1,
      observationType: obs.observationType
    };
  });
  
  // 1. CHECK HOURLY CAPACITY, SKILL LEVELS, AND OVER-ASSIGNMENTS
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourData = analyzeHourCapacity(
      staff, 
      observations, 
      hour, 
      obsRequirements, 
      currentObservationNames
    );
    
    // Check if enough total staff
    if (!hourData.hasEnoughCapacity) {
      errors.push({
        type: 'INSUFFICIENT_CAPACITY',
        hour,
        required: hourData.totalRequired,
        available: hourData.availableStaff,
        breakdown: hourData.unavailableReasons
      });
    }
    
    // Check if enough skilled staff for unskilled staff
    if (!hourData.hasEnoughSkilledStaff) {
      errors.push({
        type: 'INSUFFICIENT_SKILLED_STAFF',
        hour,
        skilledNeeded: hourData.skilledNeeded,
        skilledAvailable: hourData.skilledAvailable,
        unskilledCount: hourData.unskilledCount
      });
    }
    
    // Check for over-assignments at this hour
    const overAssignments = checkOverAssignments(
      staff, 
      hour, 
      obsRequirements, 
      currentObservationNames
    );
    
    overAssignments.forEach(oa => {
      errors.push({
        type: 'OVER_ASSIGNED',
        hour,
        observation: oa.observation,
        required: oa.required,
        assigned: oa.assigned,
        staffList: oa.staffList
      });
    });
  }
  
  // 2. CHECK FOR CONSECUTIVE HOUR VIOLATIONS
  const consecutiveViolations = checkConsecutiveHourViolations(
    staff, 
    startHour, 
    endHour,
    currentObservationNames
  );
  
  consecutiveViolations.forEach(violation => {
    errors.push({
      type: 'CONSECUTIVE_HOURS',
      staffName: violation.staffName,
      observation: violation.observation,
      hours: violation.hours
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function analyzeHourCapacity(staff, observations, hour, obsRequirements, currentObservationNames) {
  let availableStaff = 0;
  let skilledAvailable = 0; // skill level 1-3
  let unskilledAvailable = 0; // skill level 4-5
  
  // Track user assignments for this hour (to subtract from requirements)
  const userAssignmentCounts = {};
  
  const unavailableReasons = {
    onBreak: [],
    userAssigned: [],
    restrictedRole: []
  };
  
  // First pass: Count user assignments and check availability
  staff.forEach(member => {
    const skillLevel = member.skillLevel || 3; // default to skilled
    const isSkilled = skillLevel >= 1 && skillLevel <= 3;
    const isUnskilled = skillLevel >= 4 && skillLevel <= 5;
    
    // ONLY check user assignments (solver assignments will be cleared)
    const isUserAssignment = member.userAssignments && member.userAssignments.has(hour);
    
    if (isUserAssignment) {
      const assignedObs = member.observations?.[hour];
      const hasValidObservation = assignedObs && 
                                   assignedObs !== '-' && 
                                   currentObservationNames.has(assignedObs);
      const hasCustomText = assignedObs && 
                            assignedObs !== '-' && 
                            !currentObservationNames.has(assignedObs);
      
      if (hasValidObservation) {
        // Count this user assignment toward the observation's requirement
        userAssignmentCounts[assignedObs] = (userAssignmentCounts[assignedObs] || 0) + 1;
        
        unavailableReasons.userAssigned.push({
          name: member.name,
          observation: assignedObs
        });
      } else if (hasCustomText) {
        // Staff has custom text (like "lunch", "meeting", etc.) - they're unavailable
        unavailableReasons.userAssigned.push({
          name: member.name,
          observation: assignedObs + ' (custom)'
        });
      }
    } else if (isStaffAvailableAtHour(member, hour, currentObservationNames)) {
      // This staff is available for solver to assign
      availableStaff++;
      
      if (isSkilled) {
        skilledAvailable++;
      } else if (isUnskilled) {
        unskilledAvailable++;
      }
    } else {
      // Track other reasons for unavailability
      if (member.break === hour) {
        unavailableReasons.onBreak.push(member.name);
      } else if ((member.security && [8, 12, 17, 19].includes(hour)) ||
                 (member.nurse && [8, 9, 19].includes(hour))) {
        unavailableReasons.restrictedRole.push({
          name: member.name,
          role: member.security ? 'Security' : 'Nurse'
        });
      }
    }
  });
  
  // Calculate REMAINING requirements after subtracting user assignments
  let totalRemainingRequired = 0;
  const remainingByObs = {};
  
  observations.forEach(obs => {
    const totalNeeded = obs.staff || obs.StaffNeeded || 1;
    const alreadyAssigned = userAssignmentCounts[obs.name] || 0;
    const remaining = Math.max(0, totalNeeded - alreadyAssigned);
    
    totalRemainingRequired += remaining;
    remainingByObs[obs.name] = {
      total: totalNeeded,
      assigned: alreadyAssigned,
      remaining: remaining
    };
  });
  
  // Check if there are any multi-staff observations that STILL need assignments
  const hasMultiStaffObs = observations.some(obs => {
    const totalNeeded = obs.staff || obs.StaffNeeded || 1;
    const alreadyAssigned = userAssignmentCounts[obs.name] || 0;
    const remaining = totalNeeded - alreadyAssigned;
    return totalNeeded >= 2 && remaining > 0; // Only counts if still needs assignments
  });
  
  // Calculate skilled staff needed
  const skilledNeeded = hasMultiStaffObs ? unskilledAvailable : 0;
  const hasEnoughSkilledStaff = !hasMultiStaffObs || skilledAvailable >= skilledNeeded;
  
  return {
    availableStaff,
    skilledAvailable,
    unskilledCount: unskilledAvailable,
    totalRequired: totalRemainingRequired, // Now shows REMAINING needed, not total
    skilledNeeded,
    hasEnoughCapacity: availableStaff >= totalRemainingRequired,
    hasEnoughSkilledStaff,
    unavailableReasons,
    userAssignmentCounts, // For debugging
    remainingByObs // Shows breakdown per observation
  };
}

function isStaffAvailableAtHour(member, hour, currentObservationNames) {
  // Check if on break
  if (member.break === hour) return false;
  
  // ONLY check user assignments (not solver assignments, which will be cleared)
  const isUserAssignment = member.userAssignments && member.userAssignments.has(hour);
  
  if (isUserAssignment) {
    // Staff is unavailable due to user assignment
    return false;
  }
  
  // Check role restrictions
  // Note: This is simplified - you may want to add the maxObs check
  // from calculateEffectiveMaxObservations
  if (member.security && [8, 12, 17, 19].includes(hour)) return false;
  if (member.nurse && [8, 9, 19].includes(hour)) return false;
  
  return true;
}

function checkOverAssignments(staff, hour, obsRequirements, currentObservationNames) {
  const overAssignments = [];
  const assignmentCounts = {};
  const staffByObs = {};
  
  // Count ONLY user assignments at this hour (ignore solver assignments)
  staff.forEach(member => {
    const isUserAssignment = member.userAssignments && member.userAssignments.has(hour);
    
    if (isUserAssignment) {
      const obs = member.observations?.[hour];
      if (obs && obs !== '-' && currentObservationNames.has(obs)) {
        assignmentCounts[obs] = (assignmentCounts[obs] || 0) + 1;
        if (!staffByObs[obs]) staffByObs[obs] = [];
        staffByObs[obs].push(member.name);
      }
    }
  });
  
  // Check against requirements
  Object.entries(assignmentCounts).forEach(([obsName, count]) => {
    const required = obsRequirements[obsName]?.staffNeeded || 1;
    if (count > required) {
      overAssignments.push({
        observation: obsName,
        required,
        assigned: count,
        staffList: staffByObs[obsName]
      });
    }
  });
  
  return overAssignments;
}

function checkConsecutiveHourViolations(staff, startHour, endHour, currentObservationNames) {
  const violations = [];
  
  staff.forEach(member => {
    // Check from (startHour - 1) to catch violations at the boundary
    // e.g., if startHour=9, check from hour 8 to catch hour 8→9 violations
    const checkFrom = Math.max(8, startHour - 1);
    
    for (let hour = checkFrom; hour < endHour; hour++) {
      // ✅ FIXED: Check if hour has a user assignment OR is hour 8 with a valid observation
      const isCurrentUserAssignment = 
        (member.userAssignments && member.userAssignments.has(hour)) ||
        (hour === 8 && member.observations?.[8] && 
         member.observations[8] !== '-' && 
         currentObservationNames.has(member.observations[8]));
      
      const isNextUserAssignment = 
        (member.userAssignments && member.userAssignments.has(hour + 1)) ||
        (hour + 1 === 8 && member.observations?.[8] && 
         member.observations[8] !== '-' && 
         currentObservationNames.has(member.observations[8]));
      
      // Only flag violation if BOTH hours are user assignments
      if (isCurrentUserAssignment && isNextUserAssignment) {
        const currentObs = member.observations?.[hour];
        const nextObs = member.observations?.[hour + 1];
        
        // Both hours must have valid observations AND be the same observation
        if (currentObs && currentObs !== '-' && 
            nextObs && nextObs !== '-' &&
            currentObservationNames.has(currentObs) &&
            currentObservationNames.has(nextObs) &&
            currentObs === nextObs) {
          violations.push({
            staffName: member.name,
            observation: currentObs,
            hours: [hour, hour + 1]
          });
        }
      }
    }
  });
  
  return violations;
}

function formatValidationErrors(validationResult) {
  if (validationResult.isValid) {
    return null;
  }
  
  let message = '⚠️ SCHEDULE VALIDATION ERRORS\n';
  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  // Group errors by type
  const errorsByType = {};
  validationResult.errors.forEach(error => {
    if (!errorsByType[error.type]) {
      errorsByType[error.type] = [];
    }
    errorsByType[error.type].push(error);
  });
  
  // Format insufficient capacity errors
  if (errorsByType.INSUFFICIENT_CAPACITY) {
    message += '❌ INSUFFICIENT STAFF CAPACITY\n\n';
    
    errorsByType.INSUFFICIENT_CAPACITY.forEach(error => {
      message += `  Hour ${error.hour}:00\n`;
      message += `    Required: ${error.required} staff\n`;
      message += `    Available: ${error.available} staff\n`;
      message += `    Shortage: ${error.required - error.available} staff\n\n`;
      
      if (error.breakdown.userAssigned.length > 0) {
        message += `    ✓ Already Assigned by User:\n`;
        error.breakdown.userAssigned.forEach(ua => {
          message += `       • ${ua.name} → ${ua.observation}\n`;
        });
        message += '\n';
      }
      if (error.breakdown.onBreak.length > 0) {
        message += `    📍 On Break: ${error.breakdown.onBreak.join(', ')}\n`;
      }
      if (error.breakdown.restrictedRole.length > 0) {
        message += `    📍 Role Restrictions:\n`;
        error.breakdown.restrictedRole.forEach(rr => {
          message += `       • ${rr.name} (${rr.role} not available)\n`;
        });
      }
      message += '\n';
    });
  }
  
  // Format skill level errors
  if (errorsByType.INSUFFICIENT_SKILLED_STAFF) {
    message += '❌ INSUFFICIENT SKILLED STAFF\n\n';
    message += '  Note: Unskilled staff (levels 4-5) can only work multi-staff\n';
    message += '  observations when paired with skilled staff (levels 1-3)\n\n';
    
    errorsByType.INSUFFICIENT_SKILLED_STAFF.forEach(error => {
      message += `  Hour ${error.hour}:00\n`;
      message += `    Skilled needed: ${error.skilledNeeded} (levels 1-3)\n`;
      message += `    Skilled available: ${error.skilledAvailable}\n`;
      message += `    Unskilled staff: ${error.unskilledCount} (levels 4-5)\n`;
      message += `    Problem: Not enough skilled staff to pair with unskilled\n\n`;
    });
  }
  
  // Format over-assignment errors
  if (errorsByType.OVER_ASSIGNED) {
    message += '❌ OVER-ASSIGNED OBSERVATIONS\n\n';
    
    errorsByType.OVER_ASSIGNED.forEach(error => {
      message += `  Hour ${error.hour}:00 - "${error.observation}"\n`;
      message += `    Required: ${error.required} staff\n`;
      message += `    Assigned: ${error.assigned} staff\n`;
      message += `    Over by: ${error.assigned - error.required}\n`;
      message += `    Staff: ${error.staffList.join(', ')}\n\n`;
    });
  }
  
  // Format consecutive hour violations
  if (errorsByType.CONSECUTIVE_HOURS) {
    message += '❌ CONSECUTIVE HOUR VIOLATIONS\n\n';
    message += '  Staff cannot work the same observation in consecutive hours\n\n';
    
    errorsByType.CONSECUTIVE_HOURS.forEach(error => {
      message += `  ${error.staffName}: "${error.observation}"\n`;
      message += `    Hours: ${error.hours.join(':00 and ')}:00\n\n`;
    });
  }
  
  // Add suggestions
  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  message += '💡 SUGGESTIONS TO FIX\n\n';
  
  if (errorsByType.INSUFFICIENT_CAPACITY) {
    message += '  • Adjust break times to reduce overlaps\n';
    message += '  • Remove or modify user-assigned observations\n';
    message += '  • Add more staff members\n';
  }
  
  if (errorsByType.INSUFFICIENT_SKILLED_STAFF) {
    message += '  • Add more skilled staff (skill levels 1-3)\n';
    message += '  • Adjust skill levels of existing staff\n';
    message += '  • Change break times for skilled staff\n';
  }
  
  if (errorsByType.OVER_ASSIGNED) {
    message += '  • Remove excess user assignments\n';
    message += '  • Check that observation requirements are correct\n';
  }
  
  if (errorsByType.CONSECUTIVE_HOURS) {
    message += '  • Manually reassign observations to different hours\n';
    message += '  • Remove one of the consecutive assignments\n';
  }
  
  return message;
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

  if (!isSecurity && !isNurse) {
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
const penaltyValues = [50, 45, 40, 35, 30, 25, 20, 15, 10]; // Decreasing weight for older hours
const bonusValues = [50, 45, 40, 35, 30, 25, 20, 15, 10];

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
  const currentObservationNames = new Set(observations.map(obs => obs.name));
  const deletedObservations = observations[0]?.deletedObs || [];
  
  const observationsToClean = new Set();
  deletedObservations.forEach(name => {
    if (!currentObservationNames.has(name)) {
      observationsToClean.add(name);
    }
  });
  
  if (deletedObservations.includes("Generals") && !currentObservationNames.has("Generals")) {
    observationsToClean.add("Gen");
  }
  
  staff.forEach((staffMember) => {
    staffMember.lastObservation = staffMember.observations[8];
    staffMember.obsCounts = {};
    staffMember.lastReceived = {};
    
    // Initialize tracking sets if they don't exist
    if (!staffMember.userAssignments) {
      staffMember.userAssignments = new Set();
    }
    if (!staffMember.solverAssignments) {
      staffMember.solverAssignments = new Set();
    }
    
    // Reset observations ONLY in the scheduling window (startHour to 19)
    for (let hour = startHour; hour <= 19; hour++) {
      const currentValue = staffMember.observations[hour];

      // Special handling for hour 8 if within scheduling window
      if (hour === 8 && startHour <= 8) {
        const hour8Value = staffMember.observations[8];
        if (hour8Value && hour8Value !== "-" && currentObservationNames.has(hour8Value)) {
          // Mark hour 8 as user assignment if it has a valid observation
          staffMember.userAssignments.add(8);
          continue;
        }
      }
      
      // ✅ PRIORITY 1: PRESERVE user assignments (ALWAYS keep these)
      if (staffMember.userAssignments.has(hour)) {
        // Check if it's still a valid observation
        if (currentValue && currentValue !== "-" && currentObservationNames.has(currentValue)) {
          continue; // Keep user assignment
        } else if (currentValue && currentValue !== "-") {
          // User typed something custom (not an observation name) - KEEP IT
          continue;
        } else {
          // User assignment is now empty, remove it from tracking
          staffMember.userAssignments.delete(hour);
          staffMember.observations[hour] = "-";
        }
      }
      // ✅ PRIORITY 2: CLEAR solver assignments (these should be reset)
      else if (staffMember.solverAssignments.has(hour)) {
        staffMember.observations[hour] = "-";
        staffMember.solverAssignments.delete(hour);
      }
      // ✅ PRIORITY 3: Handle deleted observations (clean these up)
      else if (observationsToClean.has(currentValue)) {
        staffMember.observations[hour] = "-";
      }
      // ✅ PRIORITY 4: Keep everything else (X, Break, custom text, etc.)
      else {
        // Don't touch it - could be custom text, "X", or anything user-entered
        staffMember.observations[hour] = currentValue || "-";
      }
    }
    
    // Recalculate numObservations
    staffMember.numObservations = 0;
    for (let hour = 7; hour <= 19; hour++) {
      const obs = staffMember.observations[hour];
      if (obs && currentObservationNames.has(obs)) {
        staffMember.numObservations++;
      }
    }
  });
}


function applyDeletedObsOnce(staff, observations, startHour = 7) {
  // Collect deleted labels
  const toDelete = new Set(
    observations.flatMap(o => Array.isArray(o.deletedObs) ? o.deletedObs : [])
  );

  if (toDelete.size === 0) return false; // nothing to do

  // ✅ Get current observation names - don't delete these!
  const currentNames = new Set(observations.map(o => o.name));
  
  // ✅ Only delete observations that are NOT currently active
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

  // ✅ Only remove deleted observations from the scheduling window (startHour to 19)
  // NEVER touch anything before startHour - those are preserved regardless
  staff.forEach(member => {
    const obsMap = member.observations || {};
    
    // Only process hours from startHour onwards
    for (let h = startHour; h <= 19; h++) {
      const val = obsMap[h];
      
      // ✅ Preserve user-assigned hour 8 if it's a VALID observation
      if (h === 8 && val && val !== "-" && validNames.has(val)) {
        continue;
      }
      
      // Remove if it's in the toActuallyDelete set
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

  // ✅ CHANGED: Instead of clearing deletedObs completely, only keep observations
  // that are still present SOMEWHERE in the table (any hour from 7-19)
  console.log('🔍 Checking which deleted observations are still in use...');
  
  const stillInUse = new Set();
  staff.forEach(member => {
    const obsMap = member.observations || {};
    // Check ALL hours (7-19), not just the scheduling window
    for (let h = 7; h <= 19; h++) {
      const val = obsMap[h];
      if (val && val !== "-" && toActuallyDelete.has(val)) {
        stillInUse.add(val);
        console.log(`  ✓ "${val}" still found at ${member.name} hour ${h}`);
      }
    }
  });
  
  console.log('🔍 Deleted observations still in use:', [...stillInUse]);
  
  // Only keep deleted observations that are still present in the table
  observations.forEach(o => {
    if (Array.isArray(o.deletedObs) && o.deletedObs.length) {
      const remainingDeleted = o.deletedObs.filter(name => stillInUse.has(name));
      o.deletedObs = remainingDeleted;
      console.log('📋 Updated deletedObs for observation:', o.name, '→', remainingDeleted);
    }
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

  const logAnonymizerDebug = (stage, data) => {
  console.log(`\n🔍 ═══════════════════════════════════════`);
  console.log(`🔍 ${stage}`);
  console.log(`🔍 ═══════════════════════════════════════`);
  
  if (data.staff) {
    console.log(`📊 Staff Array Length: ${data.staff.length}`);
    data.staff.forEach((s, idx) => {
      console.log(`\n  ${idx + 1}. Staff Member:`);
      console.log(`     - ID: ${s.id}`);
      console.log(`     - Name: "${s.name}"`);
      console.log(`     - Break: ${s.break}`);
      console.log(`     - Nurse: ${s.nurse || false}`);
      console.log(`     - Security: ${s.security || false}`);
      console.log(`     - Initialized: ${s.initialized}`);
      console.log(`     - ObservationId: ${s.observationId}`);
      console.log(`     - NumObservations: ${s.numObservations}`);
      
      if (s.observations) {
        const obsEntries = Object.entries(s.observations);
        console.log(`     - Observations Object Keys: [${Object.keys(s.observations).join(', ')}]`);
        console.log(`     - Observations:`);
        obsEntries.forEach(([hour, obs]) => {
          console.log(`       * Hour ${hour}: "${obs}"`);
        });
      } else {
        console.log(`     - Observations: MISSING/UNDEFINED`);
      }
    });
  }
  
  if (data.observations) {
    console.log(`\n📋 Observations Array Length: ${data.observations.length}`);
    data.observations.forEach((obs, idx) => {
      console.log(`\n  ${idx + 1}. Observation:`);
      console.log(`     - Name: "${obs.name}"`);
      console.log(`     - Staff: ${obs.staff}`);
      console.log(`     - StaffNeeded: ${obs.StaffNeeded}`);
      console.log(`     - Color: ${obs.color || 'N/A'}`);
    });
  }
  
  console.log(`\n🔍 ═══════════════════════════════════════\n`);
};


const handleAllocate = async () => {
  console.log('🚀🚀🚀 ═══════════════════════════════════════');
  console.log('🚀 HANDLE ALLOCATE CALLED');
  console.log('🚀🚀🚀 ═══════════════════════════════════════');
  console.log('Time:', new Date().toLocaleTimeString());

  setIsLoadingSolver(true);
  
  // ═══════════════════════════════════════
  // 🔍 DETERMINE START HOUR
  // ═══════════════════════════════════════
  console.log('\n⏰ ═══════════════════════════════════════');
  console.log('⏰ DETERMINING START HOUR');
  console.log('⏰ ═══════════════════════════════════════');
  
  let start;
  
  // PRIORITY 1: User-selected start hour
  if (selectedStartHour !== null && selectedStartHour !== undefined) {
    start = selectedStartHour;
    console.log(`  ✓ Using user-selected start hour: ${start}`);
  } else {
    // PRIORITY 2: Auto-detect based on hour 8 assignments
    const validObservationNames = new Set(observations.map(obs => obs.name));
    console.log('  Valid observation names:', [...validObservationNames]);
    
    // Check if ANY staff member has ANY valid observation assigned at hour 8
    const hasHour8Assignments = staff.some(member => {
      const hour8Value = member.observations?.[8];
      const hasValidObservation = hour8Value && 
                                   hour8Value !== '-' && 
                                   validObservationNames.has(hour8Value);
      if (hasValidObservation) {
        console.log(`  ✓ ${member.name} has valid hour 8 observation: "${hour8Value}"`);
      }
      return hasValidObservation;
    });
    
    // Auto-detect: if hour 8 has assignments, start at 9; otherwise start at 8
    start = hasHour8Assignments ? 9 : 8;
    console.log(`  ✓ Auto-detected start hour: ${start} (hour 8 ${hasHour8Assignments ? 'has' : 'has no'} assignments)`);
  }
  
  console.log(`\n📊 Final decision: Solver will start from hour ${start}`);
  console.log('⏰ ═══════════════════════════════════════');
  
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
    
    // Log user assignments
    const userHours = Array.from(member.userAssignments || []);
    if (userHours.length > 0) {
      console.log(`     - 🔒 User-locked hours: ${userHours.join(', ')}`);
      userHours.forEach(h => {
        console.log(`       Hour ${h}: "${member.observations[h]}"`);
      });
    }
    
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
    }
  });
  
  const validationResult = validateScheduleFeasibility(
    observations, 
    staff, 
    start, 
    19
  );
  
  if (!validationResult.isValid) {
    const errorMessage = formatValidationErrors(validationResult);
    console.error(errorMessage);
    alert(errorMessage);
    setIsLoadingSolver(false);
    return; // Stop - don't call solver
  }

  // ═══════════════════════════════════════
  // ✅ CREATE WORKING COPY - ALL OPERATIONS ON THIS
  // ═══════════════════════════════════════
  let workingStaffCopy = staff.map(member => ({
    ...member,
    observations: { ...member.observations },
    userAssignments: new Set(member.userAssignments || []),
    solverAssignments: new Set(member.solverAssignments || [])
  }));

  // ═══════════════════════════════════════
  // 🔍 STEP 3: HANDLE DELETED OBSERVATIONS
  // ═══════════════════════════════════════
  console.log('\n🧹 ═══════════════════════════════════════');
  console.log('🧹 HANDLING DELETED OBSERVATIONS');
  console.log('🧹 ═══════════════════════════════════════');
  
  console.log('🧹 Calling applyDeletedObsOnce...');
  const didClean = applyDeletedObsOnce(workingStaffCopy, observations, start);
  console.log('🧹 applyDeletedObsOnce returned:', didClean);
  // ❌ NO setStaff call here - just modify workingStaffCopy in place

  // ═══════════════════════════════════════
  // 🔍 STEP 4: RESET STAFF (CLEAR SOLVER ASSIGNMENTS)
  // ═══════════════════════════════════════
  console.log('\n🔄 ═══════════════════════════════════════');
  console.log('🔄 CALLING resetStaff');
  console.log('🔄 ═══════════════════════════════════════');
  
  // Log user assignments BEFORE reset
  console.log('\n🔒 User assignments BEFORE resetStaff:');
  workingStaffCopy.forEach(member => {
    const userHours = Array.from(member.userAssignments || []);
    if (userHours.length > 0) {
      console.log(`  ${member.name}: hours ${userHours.join(', ')}`);
      userHours.forEach(h => {
        console.log(`    Hour ${h}: "${member.observations[h]}"`);
      });
    }
  });
  
  console.log('\n🔄 Calling resetStaff...');
  resetStaff(workingStaffCopy, observations, start);
  console.log('✅ resetStaff complete');
  // ❌ NO setStaff call here - just modify workingStaffCopy in place
  
  // Log user assignments AFTER reset
  console.log('\n🔒 User assignments AFTER resetStaff:');
  workingStaffCopy.forEach(member => {
    const userHours = Array.from(member.userAssignments || []);
    if (userHours.length > 0) {
      console.log(`  ${member.name}: hours ${userHours.join(', ')}`);
      userHours.forEach(h => {
        console.log(`    Hour ${h}: "${member.observations[h]}"`);
      });
    }
  });

  // ═══════════════════════════════════════
  // CALL RAILWAY SOLVER
  // ═══════════════════════════════════════
  console.log('\n═══════════════════════════════════════');
  console.log('⚡ CALLING RAILWAY SOLVER');
  console.log('═══════════════════════════════════════');
  
  try {
    // Anonymize data
    const anonymizer = new DataAnonymizer();
    const anonymizedStaff = anonymizer.anonymizeStaff(workingStaffCopy);
    
    const railwayObservations = observations.map(obs => ({
      id: obs.id,
      name: obs.name,
      observationType: obs.observationType,
      staff: obs.staff,
      StaffNeeded: obs.staff
    }));
    
    const anonymizedObservations = anonymizer.anonymizeObservations(railwayObservations);
    
    const requestData = {
      staff: anonymizedStaff.map(member => ({
        ...member,
        lockedHours: Array.from(member.userAssignments || [])
      })),
      observations: anonymizedObservations,
      startHour: start
    };
    
    console.log('\n📊 Locked hours being sent to solver:');
    requestData.staff.forEach(member => {
      if (member.lockedHours && member.lockedHours.length > 0) {
        console.log(`  ${member.name}: ${member.lockedHours.join(', ')}`);
      }
    });
    
    // ═══════════════════════════════════════
    // 🆕 STEP 1: START THE JOB
    // ═══════════════════════════════════════
    console.log('\n📤 ═══════════════════════════════════════');
    console.log('📤 STARTING ASYNC SOLVE JOB');
    console.log('📤 ═══════════════════════════════════════');
    
    const endpoint = '/api/solve';
    console.log(`🎯 Endpoint: ${endpoint}`);
    console.log(`📦 Request size: ${(JSON.stringify(requestData).length / 1024).toFixed(2)} KB`);
    
    const startTime = Date.now();
    const startResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Failed to start job (${startResponse.status}): ${errorText}`);
    }
    
    const startData = await startResponse.json();
    const jobId = startData.job_id;
    
    console.log(`✅ Job started: ${jobId}`);
    console.log(`⏱️ Request took: ${Date.now() - startTime}ms`);
    
    // ═══════════════════════════════════════
    // 🆕 STEP 2: POLL FOR RESULTS
    // ═══════════════════════════════════════
    console.log('\n⏳ ═══════════════════════════════════════');
    console.log('⏳ POLLING FOR RESULTS');
    console.log('⏳ ═══════════════════════════════════════');

    const maxAttempts = 60;
    let result = null;
    let attempt = 0;

    while (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempt++;
      
      console.log(`⏳ Checking status... (${attempt}s elapsed)`);
      
      try {
        const pollUrl = `${endpoint}/${jobId}`;
        const statusResponse = await fetch(pollUrl);
        
        const responseText = await statusResponse.text();
        let statusData;
        try {
          statusData = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`❌ JSON parse failed:`, parseError);
          throw new Error(`Invalid JSON from server: ${responseText.substring(0, 100)}`);
        }
        
        if (statusResponse.status === 200) {
          result = statusData;
          console.log(`✅ Solve complete after ${attempt} seconds!`);
          break;
        } else if (statusResponse.status === 202) {
          const progress = statusData.progress || 'Solving...';
          console.log(`  ${progress} (${statusData.elapsed_seconds || attempt}s)`);
        } else if (statusResponse.status === 404) {
          console.error(`❌ 404 - Job not found`);
          throw new Error('Job not found - it may have expired');
        } else {
          console.error(`❌ Unexpected status: ${statusResponse.status}`);
          throw new Error(`Polling failed: ${statusData.error || 'Unknown error'}`);
        }
      } catch (pollError) {
        console.error(`❌ POLLING ERROR AT ATTEMPT ${attempt}`);
        console.error(`Error: ${pollError.message}`);
        throw pollError;
      }
    }

    if (!result) {
      throw new Error(`Solver timed out after ${maxAttempts} seconds`);
    }

    console.log('⏳ ═══════════════════════════════════════');
    
    // ═══════════════════════════════════════
    // STEP 3: PROCESS RESULT AND MERGE
    // ═══════════════════════════════════════
    if (result.success) {
      console.log('\n🔓 ═══════════════════════════════════════');
      console.log('🔓 DE-ANONYMIZATION AND MERGE');
      console.log('🔓 ═══════════════════════════════════════');
      console.log('✅ Railway solver succeeded!');
      
      console.log('\n🔄 Processing each staff member...');
      const finalStaff = workingStaffCopy.map((member) => {
        const staffKey = String(member.id);
        const anonymizedSchedule = result.schedules?.[staffKey];

        if (!anonymizedSchedule) {
          console.warn(`  ⚠️ No schedule found for ${member.name}`);
          return member;
        }
        
        // De-anonymize each observation value
        const deAnonymizedSchedule = {};
        Object.entries(anonymizedSchedule).forEach(([hour, value]) => {
          if (value === '-' || value === 'X' || value === 'Break' || value === 'break') {
            deAnonymizedSchedule[hour] = value;
          } else {
            const originalName = anonymizer.reverseObservationMap.get(value);
            deAnonymizedSchedule[hour] = originalName || value;
          }
        });
        
        // Preserve user assignments when merging
        const userAssignments = new Set(member.userAssignments || []);
        const solverAssignments = new Set();
        
        const mergedObservations = { ...member.observations };
        Object.entries(deAnonymizedSchedule).forEach(([hour, value]) => {
          const h = parseInt(hour);
          
          // ✅ CRITICAL: Skip if this is a user assignment
          if (userAssignments.has(h)) {
            console.log(`  🔒 Preserving user assignment for ${member.name} at hour ${h}: ${member.observations[h]}`);
            return;
          }
          
          // Apply solver result
          mergedObservations[h] = value;
          
          // Mark as solver assignment if not empty
          if (value && value !== "-") {
            solverAssignments.add(h);
          }
        });
        
        return {
          ...member,
          observations: mergedObservations,
          userAssignments: userAssignments,
          solverAssignments: solverAssignments,
          initialized: true
        };
      });
      
      // ✅ SINGLE setStaff CALL - ONLY HERE!
      console.log('\n💾 Calling setStaff with final merged data...');
      setStaff(finalStaff);
      console.log('✅ setStaff called successfully');
      console.log('✅ Schedule updated from Railway solver');
      
      if (result.warning) {
        alert(`Success with note: ${result.warning}`);
      }
      
    } else {
      console.error('❌ Solver failed:', result.error);
      alert(`Solver failed: ${result.error}\n\nPlease check your input data and try again.`);
    }
    
  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════');
    console.error('❌ ERROR IN ASYNC SOLVE');
    console.error('❌ ═══════════════════════════════════════');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    alert(`Error: ${error.message}\n\nCheck console for details.`);
  }
  
  setIsLoadingSolver(false);
  console.log('\n🏁 HANDLE ALLOCATE COMPLETE');
  console.log('🏁 Time:', new Date().toLocaleTimeString());
  console.log('🏁🏁🏁 ═══════════════════════════════════════\n\n');
};




const handleNext = () => {
    // Check for unfinished form FIRST
    if (hasUnfinishedForm && (currentPage === "patient" || currentPage === "staff")) {
      const confirmLeave = window.confirm(
        "You have an unfinished assignment. Do you wish to continue?"
      );
      if (!confirmLeave) {
        return; // Stay on the page
      }
    }

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
      
      const needsInitialization = staff.some(member => !member.initialized);
      if (needsInitialization) {
        console.warn("⚠️ Some staff not initialized - this shouldn't happen!");
        setStaff([...staff]);
      }
      
      if (!isAllocationReady && staff.length > 0) {
        console.log('🟢 Starting undo/redo tracking for AllocationCreation (first time only)');
        
        // ✅ FIX: Serialize Sets to arrays before resetting history
        const serializedStaff = staff.map(member => ({
          ...member,
          userAssignments: Array.from(member.userAssignments || []),
          solverAssignments: Array.from(member.solverAssignments || [])
        }));
        
        resetHistory(serializedStaff);
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
    copyTable(); // ✅ Use the prop directly
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
        initialized: true,
        userAssignments: new Set(), 
        solverAssignments: new Set(), 
      };
    }
    
    // If already initialized and we're not forcing a reset, return as-is
    if (staffMember.initialized) {
      // ADD THIS: Ensure tracking sets exist
      if (!staffMember.userAssignments) {
        staffMember.userAssignments = new Set();
      }
      if (!staffMember.solverAssignments) {
        staffMember.solverAssignments = new Set();
      }
      return staffMember;
    }
    
    // If we're not resetting and already has observations, return unchanged
    if (staffMember.observations) {
      // ADD THIS: Ensure tracking sets exist
      if (!staffMember.userAssignments) {
        staffMember.userAssignments = new Set();
      }
      if (!staffMember.solverAssignments) {
        staffMember.solverAssignments = new Set();
      }
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
      userAssignments: new Set(), // ADD THIS
      solverAssignments: new Set(), // ADD THIS
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
