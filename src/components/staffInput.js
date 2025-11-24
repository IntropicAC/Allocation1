import React, { useState, useRef, useEffect } from "react";
import styles from "./staffInput.module.css";



function StaffInput({ staff, setStaff, observations, setObservations, setHasUnfinishedForm }) {
  const [newStaff, setNewStaff] = useState({
  name: "",
  break: "Break",
  role: "HCA",
  skillLevel: 3,
  security: false,
  nurse: false,
  securityObs: null,
  nurseObs: null,
  numObservations: 0,
});

  useEffect(() => {
  if (newStaff.name.trim()) {
    setHasUnfinishedForm(true);
  } else {
    setHasUnfinishedForm(false);
  }
}, [newStaff.name]);

const handleInputChange = (e) => {
  const { name, value } = e.target;
  let updatedValue = value;
  
  if (name === "break") {
    updatedValue = value === "Break" ? "Break" : parseInt(value.split(":")[0]);
  }

  // Map role to skill level
  if (name === "role") {
    const roleToSkillLevel = {
      "Nurse": 1,
      "SHCA": 2,
      "HCA": 3,
      "Bank/Agency": 4,
      "New Starter": 5,
      "Security": 3,
      "Onward": 3,
      "Response": 3
    };
    
    setNewStaff((prevState) => ({
      ...prevState,
      [name]: updatedValue,
      skillLevel: roleToSkillLevel[updatedValue] || 3
    }));
    return;
  }

  setNewStaff((prevState) => ({
    ...prevState,
    [name]: updatedValue,
  }));
};

  function capitalizeWords(name) {
    return name.replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  const nameInputRef = useRef(null);

  const addStaffMember = (e) => {
    e.preventDefault();
    
    console.log('➕ ========== ADD STAFF MEMBER START ==========');
    console.log('  - newStaff name:', newStaff.name);

    // Validate name is not empty
    if (!newStaff.name.trim()) {
      alert("Please enter a staff member name.");
      return;
    }

    // Check max staff limit
    if (staff.length >= 20) {
      alert("The maximum number of 20 staff members has been reached.");
      return;
    }

    // Check for duplicate names
    const doesNameExist = staff.some(
      (staffMember) => staffMember.name.toLowerCase() === newStaff.name.trim().toLowerCase()
    );

    if (doesNameExist) {
      alert("A staff member with this name already exists!");
      return;
    }

    // Find the current max ID and add 1
    const maxId = staff.reduce((max, item) => Math.max(max, item.id), -1);
    const newId = maxId + 1;

    // Initialize observations object for hours 7-19
    const observationsObj = {};
    for (let hour = 7; hour <= 19; hour++) {
      observationsObj[hour] = "-";
    }

    const staffWithIdAndObservations = {
      ...newStaff,
      name: newStaff.name.trim(),
      id: newId,
      numObservations: 0,
      security: ["Security", "Onward", "Response"].includes(newStaff.role),
      nurse: newStaff.role === "Nurse",
      securityObs: ["Security", "Onward", "Response"].includes(newStaff.role) ? 0 : null,
      nurseObs: newStaff.role === "Nurse" ? 0 : null,
      observations: observationsObj,
      lastObservation: "-",
      obsCounts: {},
      lastReceived: {},
      initialized: true,
      skillLevel: newStaff.skillLevel,
    };

    console.log(`  ✅ Adding ${newStaff.name} with ID ${newId}`);
    
    // Update staff array
    setStaff(prevStaff => [...prevStaff, staffWithIdAndObservations]);

    // SET hasUnfinishedForm to false BEFORE resetting the form
    setHasUnfinishedForm(false);

    // Reset form AFTER setting hasUnfinishedForm to false
    setNewStaff({
      name: "",
      break: "Break",
      role: "HCA",
      skillLevel: 3,
      security: false,
      nurse: false,
      securityObs: null,
      nurseObs: null,
      numObservations: 0,
    });

    console.log('  ========== ADD STAFF MEMBER END ==========');
  };

  const removeStaffMember = (staffIdToRemove) => {
    setStaff(currentStaff => {
      const staffMemberBeingRemoved = currentStaff.find(s => s.id === staffIdToRemove);
      const hour8Observation = staffMemberBeingRemoved?.observations[8];

      // Update observations if hour 8 has an actual observation assignment
      if (hour8Observation && hour8Observation !== "-") {
        setObservations(currentObservations => 
          currentObservations.map(observation => {
            if (observation.name === hour8Observation) {
              return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
            }
            return observation;
          })
        );
      }

      return currentStaff.filter(s => s.id !== staffIdToRemove);
    });
  };

const handleRoleChange = (e, staffId) => {
  const newRole = e.target.value;
  
  const roleToSkillLevel = {
    "Nurse": 1,
    "SHCA": 2,
    "HCA": 3,
    "Bank/Agency": 4,
    "New Starter": 5,
    "Security": 3,
    "Onward": 3,
    "Response": 3
  };
  
  setStaff(currentStaff => 
    currentStaff.map((staffMember) => {
      if (staffMember.id === staffId) {
        let updates = {
          ...staffMember,
          role: newRole,
          skillLevel: roleToSkillLevel[newRole] || 3,
          security: false,
          nurse: false,
          securityObs: null,
          nurseObs: null,
        };
        
        if (["Security", "Onward", "Response"].includes(newRole)) {
          updates.security = true;
          updates.securityObs = 0;
        } else if (newRole === "Nurse") {
          updates.nurse = true;
          updates.nurseObs = 0;
        }
        
        return updates;
      }
      return staffMember;
    })
  );
};

  const handleMaxObsChange = (e, staffId) => {
  const value = e.target.value;
  let maxObs;
  if (value === 'max') {
    maxObs = 999;
  } else if (value === 'min') {
    maxObs = -1;  // Use -1 to indicate "minimum" priority
  } else {
    maxObs = Number(value);
  }
  
  setStaff(currentStaff => 
    currentStaff.map((staffMember) => {
      if (staffMember.id === staffId) {
        if (staffMember.security) {
          return { ...staffMember, securityObs: maxObs };
        } else if (staffMember.nurse) {
          return { ...staffMember, nurseObs: maxObs };
        }
      }
      return staffMember;
    })
  );
};

  const handleBreakChange = (e, staffId) => {
    const value = e.target.value;
    const updatedBreakTime = value === "Break" ? "Break" : parseInt(value.split(":")[0]);
    
    setStaff(currentStaff => 
      currentStaff.map(staffMember => {
        if (staffMember.id === staffId) {
          const hour8Observation = staffMember.observations[8];
          
          // If changing to "Break" and hour 8 has an observation, check if we need to unassign
          if (updatedBreakTime === "Break" && hour8Observation && hour8Observation !== "-") {
            const restrictedObservation = observations.find(obs => obs.name === hour8Observation);
            
            if (restrictedObservation) {
              // Update the observation StaffNeeded
              setObservations(currentObservations => 
                currentObservations.map(observation => {
                  if (observation.name === hour8Observation) {
                    return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
                  }
                  return observation;
                })
              );

              // Clear the hour 8 observation
              return { 
                ...staffMember, 
                break: updatedBreakTime, 
                observations: { ...staffMember.observations, 8: "-" }
              };
            }
          }

          // Just update the break time
          return { ...staffMember, break: updatedBreakTime };
        }
        return staffMember;
      })
    );
  };

  const assignHour8Observation = (staffId, observationName) => {
    console.log('🔄 Assigning observation:', observationName, 'to staff:', staffId);
    
    setStaff(prevStaff => {
      return prevStaff.map(member => {
        if (member.id !== staffId) return member;
        
        const previousHour8Observation = member.observations[8];
        console.log('  Previous hour 8 obs:', previousHour8Observation);

        // Handle clearing observation (setting to "-")
        if (observationName === "-") {
          console.log('  Clearing observation');
          // If there was a previous observation, return it to the pool
          if (previousHour8Observation && previousHour8Observation !== "-") {
            setObservations(currentObservations => 
              currentObservations.map(obs => {
                if (obs.name === previousHour8Observation) {
                  return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
                }
                return obs;
              })
            );
          }
          
          return {
            ...member,
            observations: {
              ...member.observations,
              8: "-"
            }
          };
        }

        // Assigning a new observation
        const targetObservation = observations.find(obs => obs.name === observationName);
        
        if (!targetObservation) {
          console.error("Observation not found:", observationName);
          return member;
        }

        // Check if we're actually changing the observation
        if (previousHour8Observation === observationName) {
          console.log('  Same observation, no change needed');
          return member;
        }

        // Check if the target observation has availability
        if (targetObservation.StaffNeeded <= 0) {
          console.error("No staffing needs available for this observation.");
          alert(`No available slots for ${observationName}`);
          return member;
        }

        console.log('  Assigning new observation');
        
        // Update observations state
        setObservations(currentObservations => 
          currentObservations.map(obs => {
            // Decrement the new observation
            if (obs.name === observationName) {
              return { ...obs, StaffNeeded: obs.StaffNeeded - 1 };
            }
            // Increment the previous observation if it wasn't "-"
            if (previousHour8Observation !== "-" && obs.name === previousHour8Observation) {
              return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
            }
            return obs;
          })
        );

        return {
          ...member,
          observations: {
            ...member.observations,
            8: observationName
          }
        };
      });
    });
  };

  // Generate break time options
  const breakTimeOptions = [
    <option key="break" value="Break" className={styles.breakOption}>
      Break
    </option>
  ];
  for (let i = 8; i <= 19; i++) {
    breakTimeOptions.push(
      <option key={i} value={`${i}:00`} className={styles.breakOption}>
        {i}:00
      </option>
    );
  }

  const rainbowNames = ["Alex1","Charlotte2","Adna3","Aliah4"];

  const sortedStaff = [...staff].sort((a, b) => {
    const getPriority = (staffMember) => {
      if (staffMember.nurse === true) return 1;
      if (staffMember.security === true) return 2;
      return 3;
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return 0;
  });

  const getObsLimitDisplayValue = (staffMember) => {
  if (!staffMember.security && !staffMember.nurse) return 0;
  
  const value = staffMember.security ? staffMember.securityObs : staffMember.nurseObs;
  
  if (value === null || value === undefined) return 0;
  if (value === 999) return 'max';
  if (value === -1) return 'min';
  return value;
};

  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addStaffMember}>
        <header>
          <h1 className={styles.h1}>Staff members</h1>
        </header>
        
        <label className={styles.staffText}>
          Name
          <input
            maxLength={12}
            type="text"
            className={styles.inputText}
            name="name"
            value={newStaff.name}
            onChange={handleInputChange}
            placeholder="First name"
            required
            ref={nameInputRef}
          />
        </label>
        
        <label className={styles.staffText}>
          Break
          <select
            className={styles.select}
            name="break"
            value={newStaff.break === "Break" ? "Break" : `${newStaff.break}:00`}
            onChange={handleInputChange}
          >
            {breakTimeOptions}
          </select>
        </label>
        
        <label className={styles.staffText}>
          Role
          <select
            className={styles.select}
            name="role"
            value={newStaff.role}
            onChange={handleInputChange}
          >
            <option value="Nurse">Nurse (1)</option>
            <option value="SHCA">SHCA (2)</option>
            <option value="HCA">HCA (3)</option>
            <option value="Bank/Agency">Bank/Agency (4)</option>
            <option value="New Starter">New Starter (5)</option>
            <option value="Security">Security (3)</option>
            <option value="Onward">Onward (3)</option>
            <option value="Response">Response (3)</option>
          </select>
        </label>
        
        <button className={styles.button} type="submit">
          Add Staff Member
        </button>
      </form>

      <form className={styles.staffContainer}>
        {sortedStaff.map((staffMember, index) => (
          <section key={staffMember.id} className={styles.staffMember}>
            <h2 className={styles.indexAndName}>
              <span className={styles.indexNumber}>{index + 1}</span>
              <span className={rainbowNames.includes(staffMember.name) ? `${styles.staffName} rainbow-text` : styles.staffName}>
                {capitalizeWords(staffMember.name)}
              </span>
            </h2>

            <label className={styles.break}>
              <span className={styles.breakLabel}>Break:</span>
              <select
                className={`${styles.inputText} ${styles.select}`}
                value={staffMember.break === "Break" ? "Break" : `${staffMember.break}:00`}
                onChange={(e) => handleBreakChange(e, staffMember.id)}
              >
                {breakTimeOptions}
              </select>
            </label>
            
            <div className={styles.roleContainer}>
              <span className={styles.roleContainerLabel}>Role:</span>
              <label className={styles.roleLabel}>
                <select
                className={styles.select}
                value={staffMember.role || "HCA"}
                onChange={(e) => handleRoleChange(e, staffMember.id)}
              >
                <option value="Nurse">Nurse (1)</option>
                <option value="SHCA">SHCA (2)</option>
                <option value="HCA">HCA (3)</option>
                <option value="Bank/Agency">Bank/Agency (4)</option>
                <option value="New Starter">New Starter (5)</option>
                <option value="Security">Security (3)</option>
                <option value="Onward">Onward (3)</option>
                <option value="Response">Response (3)</option>
              </select>
              </label>
              
              {(staffMember.security || staffMember.nurse) && (
                <select
                  title={`Max observations for ${staffMember.security ? 'Security' : 'Nurse'}`}
                  className={styles.maxObsNumber}
                  value={getObsLimitDisplayValue(staffMember)}
                  onChange={(e) => handleMaxObsChange(e, staffMember.id)}
                >
                  <option value={0}>Obs Limit</option>
                  <option value="min">Minimum</option>
                  <option value={0}>0</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                  <option value="max">Max</option>
                </select>
              )}
            </div>

            <label className={styles.intialObservation}>
              <span className={styles.initialObsLabel}>Initial Obs:</span>
              <select
                value={staffMember.observations[8] || "-"}
                onChange={(e) => assignHour8Observation(staffMember.id, e.target.value)}
                className={styles.select}
              >
                <option value="-">No Observation</option>
                {observations.map((observation) => (
                  <option key={observation.id} value={observation.name}>
                    {observation.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className={styles.xButton}
              onClick={(e) => {
                e.preventDefault();
                removeStaffMember(staffMember.id);
              }}
            >
              X
            </button>
          </section>
        ))}
      </form>
    </section>
  );
}

export default StaffInput;