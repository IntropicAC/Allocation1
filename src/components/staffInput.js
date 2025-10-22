import React, { useState, useRef, useEffect} from "react";
import styles from "./staffInput.module.css";

function StaffInput({ staff, setStaff, observations, setObservations }) {
  const [newStaff, setNewStaff] = useState({
    name: "",
    break: 8, // default break time
    role: "HCA", // New field for role (HCA, Security, Nurse)
    security: false,
    nurse: false,
    securityObs: null,
    nurseObs: null,
    numObservations: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
   
    // If the input is for 'break', convert the value to a number
    const updatedValue = name === "break" ? parseInt(value.split(":")[0]) : value;
 
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

    if (staff.length >= 20) {
      alert("The maximum number of 20 staff members has been reached. No more staff members can be added.");
      return;
    }
    
    const doesNameExist = staff.some(
      (staffMember) =>
        staffMember.name.toLowerCase() === newStaff.name.toLowerCase()
    );

    if (doesNameExist) {
      alert("A staff member with this name already exists!");
      return;
    }

    // Find the current max ID in the staff list and add 1
    const maxId = staff.reduce((max, item) => Math.max(max, item.id), -1);
    const newId = maxId + 1;

    const staffWithIdAndObservations = {
      ...newStaff,
      id: newId,
      numObservations: 0,
      observationId: "-",
      // Set security and nurse based on role
      security: newStaff.role === "Security",
      nurse: newStaff.role === "Nurse",
      securityObs: newStaff.role === "Security" ? 0 : null,
      nurseObs: newStaff.role === "Nurse" ? 4 : null, // Default 4 for nurse
    };

    setStaff([...staff, staffWithIdAndObservations]);
    setNewStaff({
      name: "",
      break: 8,
      role: "HCA",
      security: false,
      nurse: false,
      securityObs: null,
      nurseObs: null,
      numObservations: 0,
    });
  };

  const removeStaffMember = (staffIdToRemove) => {
    // First, find the observationId of the staff member who is being removed.
    const staffMemberBeingRemoved = staff.find(staff => staff.id === staffIdToRemove);
    const observationIdOfRemovedStaff = staffMemberBeingRemoved ? staffMemberBeingRemoved.observationId : null;

    // Now, filter out the staff member from the staff array.
    setStaff(currentStaff => currentStaff.filter(staff => staff.id !== staffIdToRemove));

    // If the staff member was assigned to an observation, update that observation's StaffNeeded.
    if (observationIdOfRemovedStaff) {
        setObservations(currentObservations => currentObservations.map(observation => {
            // Check if this is the observation from which the staff is being removed.
            if (observation.name === observationIdOfRemovedStaff) {
                // Increment StaffNeeded for this observation.
                return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
            }
            // For all other observations, return them unchanged.
            return observation;
        }));
    }
  };

  const handleRoleChange = (e, staffId) => {
    const newRole = e.target.value;
    const updatedStaff = staff.map((staffMember) => {
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
          updates.securityObs = staffMember.securityObs || 0; // Keep existing value or default to 0
        } else if (newRole === "Nurse") {
          updates.nurse = true;
          updates.nurseObs = staffMember.nurseObs || 4; // Keep existing value or default to 4
        }
        
        return updates;
      }
      return staffMember;
    });
    setStaff(updatedStaff);
  };

  const handleMaxObsChange = (e, staffId) => {
    const maxObs = Number(e.target.value);
    const updatedStaff = staff.map((staffMember) => {
      if (staffMember.id === staffId) {
        if (staffMember.security) {
          return { ...staffMember, securityObs: maxObs };
        } else if (staffMember.nurse) {
          return { ...staffMember, nurseObs: maxObs };
        }
      }
      return staffMember;
    });
    setStaff(updatedStaff);
  };

  const handleBreakChange = (e, staffId) => {
    const updatedBreakTime = parseInt(e.target.value.split(":")[0]);
    const updatedStaff = staff.map(staffMember => {
        if (staffMember.id === staffId) {
            const currentObservationId = staffMember.observationId;
            const restrictedObservation = observations.some(obs => obs.name === currentObservationId);

            // If changing to a break at 8 and the observation is restricted, unassign it
            if (updatedBreakTime === 8 && restrictedObservation) {
                // Update the observation StaffNeeded as the staff member is unassigned from it
                setObservations(currentObservations => currentObservations.map(observation => {
                    if (observation.name === currentObservationId) {
                        return { ...observation, StaffNeeded: observation.StaffNeeded + 1 };
                    }
                    return observation;
                }));

                staffMember.observationId = "-";
            }

            return { ...staffMember, break: updatedBreakTime };
        }
        return staffMember;
    });
    setStaff(updatedStaff);
  };

  const assignObservation = (observationName, staffId) => {
    const newStaffList = [...staff]; 
    const staffIndex = newStaffList.findIndex(s => s.id === staffId);

    if (staffIndex === -1) {
      console.error("Staff member not found.");
      return;
    }

    // Retrieve the previous observationId for comparison and possible reassignment
    let previousObservationId = newStaffList[staffIndex].observationId;

    // Special handling for "Initial Observation" which unassigns any current observation
    if (observationName === "Initial Observation") {
      if (previousObservationId !== "-") {
        // Increase the staff needed count for the previous observation only if it's not the default
        const prevObservation = observations.find(obs => obs.name === previousObservationId);
        if (prevObservation && prevObservation.StaffNeeded < prevObservation.staff) {
          prevObservation.StaffNeeded += 1;
        }
      }
      newStaffList[staffIndex].observationId = "-";
      
      // ADD THIS: Update observations[8] to match
      if (newStaffList[staffIndex].observations) {
        newStaffList[staffIndex].observations[8] = "-";
      }
      
      setStaff(newStaffList);
      setObservations([...observations]); // Trigger state update
      return;
    }

    // Find the observation object for the new assignment
    const targetObservation = observations.find(obs => obs.name === observationName);
    if (!targetObservation) {
      console.error("Observation not found.");
      return;
    }

    const shouldAdjustBreak = newStaffList[staffIndex].break === 8;
    if (shouldAdjustBreak) {
      newStaffList[staffIndex].break = 9; // Adjust break to 9
    }

    // Handle reassignment if the new observation is different from the current one
    if (previousObservationId !== observationName) {
      if (targetObservation.StaffNeeded > 0) {
        targetObservation.StaffNeeded -= 1;
        newStaffList[staffIndex].observationId = observationName;
        
        // ADD THIS: Update observations[8] to match the new observationId
        if (newStaffList[staffIndex].observations) {
          newStaffList[staffIndex].observations[8] = observationName;
        }
      } else {
        console.error("No staffing needs available for this observation.");
        return;
      }

      if (previousObservationId !== "-") {
        // Increase the staff needed count for the previous observation, but do not exceed the total staff available
        const prevObservation = observations.find(obs => obs.name === previousObservationId);
        if (prevObservation && prevObservation.StaffNeeded < prevObservation.staff) {
          prevObservation.StaffNeeded += 1;
        }
      }
    }

    // Update the staff array and the observations array in the state
    setStaff(newStaffList);
    setObservations([...observations]);
  };

  // Generate break time options from 8:00 to 19:00
  const breakTimeOptions = [];
  for (let i = 8; i <= 19; i++) {
    breakTimeOptions.push(
      <option key={i} value={`${i}:00`} className={styles.breakOption}>
        Break {i}:00
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

    // If same priority, sort alphabetically by name
    return a.name.localeCompare(b.name);
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
            value={`${newStaff.break}:00`}
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

            <label className={styles.BreakText}>
              <select
                className={`${styles.inputText} ${styles.break}`}
                value={`${staffMember.break}:00`}
                onChange={(e) => handleBreakChange(e, staffMember.id)}
              >
                {breakTimeOptions}
              </select>
            </label>
            
            <div className={styles.roleContainer}>
              <label className={styles.roleLabel}>
                Role
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