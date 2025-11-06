import React, { useState, useRef, useEffect} from "react";
import styles from "./staffInput.module.css";

function StaffInput({ staff, setStaff, observations, setObservations }) {
  const [newStaff, setNewStaff] = useState({
    name: "",
    break: "Break", // default - no break assigned
    role: "HCA", // New field for role (HCA, Security, Nurse)
    security: false,
    nurse: false,
    securityObs: null,
    nurseObs: null,
    numObservations: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the input is for 'break', handle "Break" or convert time to number
    let updatedValue = value;
    if (name === "break") {
      updatedValue = value === "Break" ? "Break" : parseInt(value.split(":")[0]);
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
  console.log('  - BEFORE UPDATE - checking current staff via functional update...');

  // Use functional update to get current staff
  setStaff(currentStaff => {
    console.log('  - INSIDE setStaff callback');
    console.log('  - currentStaff length:', currentStaff.length);
    console.log('  - currentStaff names:', currentStaff.map(s => s.name).join(', ') || 'none');
    
    if (currentStaff.length >= 20) {
      alert("The maximum number of 20 staff members has been reached. No more staff members can be added.");
      console.log('  ❌ Max staff reached, returning unchanged');
      return currentStaff; // Return unchanged
    }
    
    const doesNameExist = currentStaff.some(
      (staffMember) =>
        staffMember.name.toLowerCase() === newStaff.name.toLowerCase()
    );

    if (doesNameExist) {
      alert("A staff member with this name already exists!");
      console.log('  ❌ Name exists, returning unchanged');
      return currentStaff; // Return unchanged
    }

    // Find the current max ID in the staff list and add 1
    const maxId = currentStaff.reduce((max, item) => Math.max(max, item.id), -1);
    const newId = maxId + 1;

    // Initialize observations object for hours 7-19
    const observations = {};
    const observationId = "-"; // Default observationId
    
    for (let hour = 7; hour <= 19; hour++) {
      // Hour 8 gets the observationId if set, otherwise "-"
      observations[hour] =
        hour === 8 && observationId && observationId !== "-"
          ? observationId
          : "-";
      // Hour 7 is always "-"
      if (hour === 7) {
        observations[hour] = "-";
      }
    }

    const staffWithIdAndObservations = {
      ...newStaff,
      id: newId,
      numObservations: 0,
      observationId: observationId,
      // Set security and nurse based on role
      security: newStaff.role === "Security",
      nurse: newStaff.role === "Nurse",
      securityObs: newStaff.role === "Security" ? 0 : null,
      nurseObs: newStaff.role === "Nurse" ? 0 : null,
      // Add initialization fields immediately (hours 7-19)
      observations: observations,
      lastObservation: observationId,
      obsCounts: {},
      lastReceived: {},
      initialized: true,
    };

    console.log(`  ✅ Adding ${newStaff.name} with ID ${newId}`);
    const newStaffList = [...currentStaff, staffWithIdAndObservations];
    console.log('  - NEW staff list length:', newStaffList.length);
    console.log('  - NEW staff names:', newStaffList.map(s => s.name).join(', '));
    console.log('  ========== ADD STAFF MEMBER END (returning new list) ==========');
    
    return newStaffList;
  });

  console.log('  - After setStaff call, resetting form...');
  // Reset form after successful addition
  setNewStaff({
    name: "",
    break: "Break",
    role: "HCA",
    security: false,
    nurse: false,
    securityObs: null,
    nurseObs: null,
    numObservations: 0,
  });
};

  const removeStaffMember = (staffIdToRemove) => {
    // Use functional updates to ensure we're working with current state
    setStaff(currentStaff => {
      // Find the staff member being removed
      const staffMemberBeingRemoved = currentStaff.find(s => s.id === staffIdToRemove);
      const observationIdOfRemovedStaff = staffMemberBeingRemoved ? staffMemberBeingRemoved.observationId : null;

      // Update observations if needed
      if (observationIdOfRemovedStaff && observationIdOfRemovedStaff !== "-") {
        setObservations(currentObservations => 
          currentObservations.map(observation => {
            if (observation.name === observationIdOfRemovedStaff) {
              return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
            }
            return observation;
          })
        );
      }

      // Filter out the staff member
      return currentStaff.filter(s => s.id !== staffIdToRemove);
    });
  };

  const handleRoleChange = (e, staffId) => {
    const newRole = e.target.value;
    setStaff(currentStaff => 
      currentStaff.map((staffMember) => {
        if (staffMember.id === staffId) {
          // Reset all role-specific fields
          let updates = {
            ...staffMember,
            role: newRole,
            security: false,
            nurse: false,
            securityObs: null,
            nurseObs: null,
          };
          
          // Set specific fields based on new role
          if (newRole === "Security") {
            updates.security = true;
            updates.securityObs = staffMember.securityObs || 0;
          } else if (newRole === "Nurse") {
            updates.nurse = true;
            updates.nurseObs = staffMember.nurseObs || 4;
          }
          
          return updates;
        }
        return staffMember;
      })
    );
  };

  const handleMaxObsChange = (e, staffId) => {
    const maxObs = Number(e.target.value);
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
          const currentObservationId = staffMember.observationId;
          const restrictedObservation = observations.some(obs => obs.name === currentObservationId);

          // If changing to "Break" (no break) and the observation is restricted, unassign it
          if (updatedBreakTime === "Break" && restrictedObservation) {
            // Update the observation StaffNeeded
            setObservations(currentObservations => 
              currentObservations.map(observation => {
                if (observation.name === currentObservationId) {
                  return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
                }
                return observation;
              })
            );

            return { ...staffMember, break: updatedBreakTime, observationId: "-" };
          }

          return { ...staffMember, break: updatedBreakTime };
        }
        return staffMember;
      })
    );
  };

  const assignObservation = (observationName, staffId) => {
    setStaff(prevStaff => {
      const newStaffList = prevStaff.map(member => {
        if (member.id !== staffId) return member;
        
        let previousObservationId = member.observationId;

        // Handle "Initial Observation" unassignment
        if (observationName === "Initial Observation") {
          if (previousObservationId !== "-") {
            const prevObservation = observations.find(obs => obs.name === previousObservationId);
            if (prevObservation && prevObservation.StaffNeeded < prevObservation.staff) {
              prevObservation.StaffNeeded += 1;
            }
          }
          
          return {
            ...member,
            observationId: "-",
            observations: {
              ...member.observations,
              8: "-"
            }
          };
        }

        // Find the target observation
        const targetObservation = observations.find(obs => obs.name === observationName);
        if (!targetObservation) {
          console.error("Observation not found.");
          return member;
        }

        // Auto-adjust break if needed
        let updatedMember = { ...member };
        if (member.break === "Break") {
          updatedMember.break = 9;
        }

        // Handle reassignment
        if (previousObservationId !== observationName) {
          if (targetObservation.StaffNeeded > 0) {
            targetObservation.StaffNeeded -= 1;
            updatedMember.observationId = observationName;
            updatedMember.observations = {
              ...member.observations,
              8: observationName
            };
          } else {
            console.error("No staffing needs available for this observation.");
            return member;
          }

          if (previousObservationId !== "-") {
            const prevObservation = observations.find(obs => obs.name === previousObservationId);
            if (prevObservation && prevObservation.StaffNeeded < prevObservation.staff) {
              prevObservation.StaffNeeded += 1;
            }
          }
        }

        return updatedMember;
      });

      setObservations([...observations]); // Trigger observation update
      return newStaffList;
    });
  };

  // Generate break time options: "Break" (no break) followed by 8:00 to 19:00
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

  useEffect(()=>{
    console.log("Staff",staff)
    console.log("Observation:", observations)
  },[staff])

  const rainbowNames = ["Alex1","Charlotte2","Adna3","Aliah4"]

  const sortedStaff = [...staff].sort((a, b) => {
    const getPriority = (staffMember) => {
      if (staffMember.nurse === true) return 1;
      if (staffMember.security === true) return 2;
      return 3; // HCA or other roles
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    // If priorities are different, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return 0;
  });

  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addStaffMember}>
        <header>
          <h1 className={styles.h1}>Staff members</h1>
        </header>
        <label className={styles.staffText}>
          Name
          <input
            maxLength={10}
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
          Role:
          <select
            className={styles.select}
            name="role"
            value={newStaff.role}
            onChange={handleInputChange}
          >
            <option value="HCA">HCA</option>
            <option value="Security">Security</option>
            <option value="Nurse">Nurse</option>
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
              <select
                className={`${styles.inputText} ${styles.select}`}
                value={staffMember.break === "Break" ? "Break" : `${staffMember.break}:00`}
                onChange={(e) => handleBreakChange(e, staffMember.id)}
              >
                {breakTimeOptions}
              </select>
            </label>
            
            <div className={styles.roleContainer}>
              <label className={styles.roleLabel}>
                <select
                  className={styles.select}
                  value={staffMember.role || "HCA"}
                  onChange={(e) => handleRoleChange(e, staffMember.id)}
                >
                  <option value="HCA">HCA</option>
                  <option value="Security">Security</option>
                  <option value="Nurse">Nurse</option>
                </select>
              </label>
              
              {/* Show max observations selector for Security or Nurse */}
              {(staffMember.security || staffMember.nurse) && (
                <select
                  title={`Max observations for ${staffMember.security ? 'Security' : 'Nurse'}`}
                  className={styles.maxObsNumber}
                  value={staffMember.security ? (staffMember.securityObs || 0) : (staffMember.nurseObs || 0)}
                  onChange={(e) => handleMaxObsChange(e, staffMember.id)}
                >
                  {[...Array(13).keys()].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dropdown to assign an observation to a staff member */}
            <label className={styles.intialObservation}>
              <select
                value={staffMember.observationId || ""}
                onChange={(e) =>
                  assignObservation(
                    e.target.options[e.target.selectedIndex].text,
                    staffMember.id
                  )
                }
                className={styles.select}
              >
                <option value="-">Initial Observation</option>
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