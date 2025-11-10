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

      // Anonymize observations within staff member
      const anonymizedObservations = {};
      Object.entries(member.observations).forEach(([hour, obsName]) => {
        if (obsName === '-' || obsName === 'X' || obsName === 'Break' || obsName === 'break') {
          anonymizedObservations[hour] = obsName;
        } else {
          const obsId = this.getOrCreateObservationId(obsName);
          anonymizedObservations[hour] = obsId;
        }
      });

      return {
        ...member,
        name: anonymousId, // Replace with ID
        observations: anonymizedObservations,
        // Preserve all other properties (break, role, security, nurse, etc.)
      };
    });
  }

  anonymizeObservations(observationsArray) {
    return observationsArray.map((obs) => {
      const anonymousId = this.getOrCreateObservationId(obs.name);

      return {
        ...obs,
        name: anonymousId,
        observationType: `type_${obs.id}`,
      };
    });
  }

  getOrCreateObservationId(originalName) {
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