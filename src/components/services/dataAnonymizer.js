// services/dataAnonymizer.js

class DataAnonymizer {
  constructor() {
    this.staffNameMap = new Map();
    this.observationNameMap = new Map();
    this.reverseStaffMap = new Map();
    this.reverseObservationMap = new Map();
  }

  anonymizeStaff(staffArray) {
  return staffArray.map((member) => {
    const anonymousId = `staff_${member.id}`;
    this.staffNameMap.set(member.name, anonymousId);
    this.reverseStaffMap.set(anonymousId, member.name);

    const anonymizedObservations = {};
    Object.entries(member.observations).forEach(([hour, obsName]) => {
      if (obsName === '-' || obsName === 'X' || obsName === 'Break' || obsName === 'break') {
        anonymizedObservations[hour] = obsName;
      } 
      // ✅ FIX: Normalize "Gen", "Gens", "generals" to "Generals"
      else if (obsName.toLowerCase() === 'generals' || 
               obsName.toLowerCase() === 'gen' || 
               obsName.toLowerCase() === 'gens') {
        anonymizedObservations[hour] = 'Generals';  // Always use exact case
      } 
      else {
        const obsId = this.getOrCreateObservationId(obsName);
        anonymizedObservations[hour] = obsId;
      }
    });

    return {
      ...member,
      name: anonymousId,
      observations: anonymizedObservations,
    };
  });
}

  anonymizeObservations(observationsArray) {
    return observationsArray.map((obs) => {
      // Keep Generals unchanged
      if (obs.name.toLowerCase() === 'generals') {
        return {
          ...obs,
          observationType: `type_${obs.id}`,
        };
      }

      const anonymousId = this.getOrCreateObservationId(obs.name);

      return {
        ...obs,
        name: anonymousId,
        observationType: `type_${obs.id}`,
      };
    });
  }

  getOrCreateObservationId(originalName) {
    // Don't anonymize Generals
    if (originalName.toLowerCase() === 'generals') {
      return originalName;
    }

    if (!this.observationNameMap.has(originalName)) {
      const anonymousId = `obs_${this.observationNameMap.size + 1}`;
      this.observationNameMap.set(originalName, anonymousId);
      this.reverseObservationMap.set(anonymousId, originalName);
    }
    return this.observationNameMap.get(originalName);
  }

  deAnonymizeStaff(anonymizedStaffArray) {
    return anonymizedStaffArray.map((member) => {
      const originalName = this.reverseStaffMap.get(member.name) || member.name;

      const deAnonymizedObservations = {};
      Object.entries(member.observations).forEach(([hour, obsId]) => {
        if (obsId === '-' || obsId === 'X' || obsId === 'Break' || obsId === 'break') {
          deAnonymizedObservations[hour] = obsId;
        } else if (obsId.toLowerCase() === 'generals') {
          // Generals is already the original name
          deAnonymizedObservations[hour] = obsId;
        } else {
          deAnonymizedObservations[hour] = 
            this.reverseObservationMap.get(obsId) || obsId;
        }
      });

      return {
        ...member,
        name: originalName,
        observations: deAnonymizedObservations,
      };
    });
  }

  deAnonymizeObservations(anonymizedObservationsArray) {
    return anonymizedObservationsArray.map((obs) => {
      // Generals is already the original name
      if (obs.name.toLowerCase() === 'generals') {
        return {
          ...obs,
          observationType: obs.observationType.replace('type_', ''),
        };
      }

      const originalName = this.reverseObservationMap.get(obs.name) || obs.name;

      return {
        ...obs,
        name: originalName,
        observationType: obs.observationType.replace('type_', ''),
      };
    });
  }

  reset() {
    this.staffNameMap.clear();
    this.observationNameMap.clear();
    this.reverseStaffMap.clear();
    this.reverseObservationMap.clear();
  }
}

export default DataAnonymizer;