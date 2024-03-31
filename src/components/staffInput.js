import React, { useState, useRef, useEffect} from "react";
import styles from "./staffInput.module.css";


function StaffInput({ staff, setStaff, observations, setObservations }) {
  const [newStaff, setNewStaff] = useState({
    name: "",
    break: 9, // default break time
    security: false,
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
      return; // Exit the function early
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
      id: newId, // Using the new ID
      numObservations: 0,
    };


    setStaff([...staff, staffWithIdAndObservations]);
    setNewStaff({
      name: "",
      break: 9,
      security: false,
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



  const handleSecurityChange = (e, staffId) => {
    const updatedStaff = staff.map(staffMember => {
        // Set 'security' to true only for the selected staff member, and false for others
        return {
            ...staffMember,
            security: staffMember.id === staffId ? e.target.checked : false
        };
    });
    setStaff(updatedStaff);
};



const handleBreakChange = (e, staffId) => {
  const updatedBreakTime = parseInt(e.target.value.split(":")[0]);
  const updatedStaff = staff.map(staffMember => {
    if (staffMember.id === staffId) {
      return { ...staffMember, break: updatedBreakTime };
    }
    return staffMember;
  });
  setStaff(updatedStaff);
};



const assignObservation = (observationName, staffId) => {
  const newStaffList = [...staff];
  const staffIndex = newStaffList.findIndex(s => s.id === staffId);

  // Initialize previousObservationId outside of the if-else blocks
  let previousObservationId = "";

  if (staffIndex !== -1) {
    // Define previousObservationId here to ensure it's accessible throughout
    previousObservationId = newStaffList[staffIndex].observationId === "-" ? "Initial Observation" : newStaffList[staffIndex].observationId;

    if (observationName === "Initial Observation") {
      newStaffList[staffIndex].observationId = "-";
    } else {
      const targetObservation = observations.find(obs => obs.name === observationName);

      if (targetObservation && targetObservation.StaffNeeded < 1) {
        const otherStaffIndex = newStaffList.findIndex((s, index) => s.observationId === observationName && index !== staffIndex);
        
        if (otherStaffIndex !== -1) {
          newStaffList[otherStaffIndex].observationId = "-";
          // Adjust the targetObservation directly since it's a reference
          // Note: This would not directly affect the 'observations' array until it's set again
          targetObservation.StaffNeeded += 1;
        } else {
          console.warn("No other staff to unassign for observation:", observationName);
          return; // Exit if no adjustments can be made
        }
      }
      
      // This assignment is now safe because previousObservationId is defined in the broader scope
      newStaffList[staffIndex].observationId = observationName;
    }

    // The rest of your logic remains the same

    const updatedObservations = observations.map(obs => {
        if (obs.name === observationName && observationName !== "Initial Observation") {
          return { ...obs, StaffNeeded: Math.max(0, obs.StaffNeeded - 1) };
        } else if (obs.name === previousObservationId && previousObservationId !== "Initial Observation") {
          return { ...obs, StaffNeeded: Math.min(obs.staff, obs.StaffNeeded + 1) };
        }
        return obs;
    });
    
    setObservations(updatedObservations);
    setStaff(newStaffList);
  }
};








  // Generate break time options from 8:00 to 19:00
  const breakTimeOptions = [];
  for (let i = 8; i <= 19; i++) {
    breakTimeOptions.push(
      <option key={i} value={`${i}:00`} className={styles.breakOption}>
        {i}:00
      </option>
    );
  }
useEffect(()=>{
  console.log(staff)
},[staff])

  const rainbowNames = ["Alex1","Charlotte2","Adna3","Aliah4"]


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
          Break Time
          <select
            className={styles.select}
            name="break"
            value={`${newStaff.break}:00`}
            onChange={handleInputChange}
          >
            {breakTimeOptions}
          </select>
        </label>
        {/* Other input fields if any */}
        <button className={styles.button} type="submit">
          Add Staff Member
        </button>
      </form>

      <form className={styles.staffContainer}>
        {[...staff].sort((a, b) => a.name.localeCompare(b.name))
                 .map((staffMember, index) => (
          <section key={staffMember.id} className={styles.staffMember}>
            <h2 className={styles.indexAndName}>
        <span className={styles.indexNumber}>{index + 1}</span>
        {/* Check if the name is in the rainbowNames array */}
        <span className={rainbowNames.includes(staffMember.name) ? `${styles.staffName} rainbow-text` : styles.staffName}>
          {capitalizeWords(staffMember.name)}
        </span>
      </h2>


          <label className={styles.BreakText}>
            <span className={styles.labelText}>Break</span>
            <select
              className={`${styles.inputText} ${styles.break}`}
              value={`${staffMember.break}:00`}
              onChange={(e) => handleBreakChange(e, staffMember.id)}
            >
              {breakTimeOptions}
            </select>
          </label>



            <label className={styles.security}>
            Security
              <input
                type="checkbox"
                checked={staffMember.security}
                onChange={(e) => handleSecurityChange(e, staffMember.id)}
              />
            </label>


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


