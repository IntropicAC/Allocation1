import React, { useState, useRef, useEffect} from "react";
import styles from "./staffInput.module.css";


function StaffInput({ staff, setStaff, observations, setUnassignedObs, unassignedObs }) {
  const [newStaff, setNewStaff] = useState({
    name: "",
    break: 8, // default break time
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
      break: 8,
      security: false,
      numObservations: 0,
    });
  };


  const removeStaffMember = (staffIdToRemove) => {
    setStaff((staff) => staff.filter((staff) => staff.id !== staffIdToRemove));
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
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    const newStaffList = [...staff];
    const previousObservationName = newStaffList[staffIndex].observationId;

    newStaffList[staffIndex] = {
      ...newStaffList[staffIndex],
      observationId: observationName === "Select Observation" ? "-" : observationName,
    };
    setStaff(newStaffList);

    // Update unassignedObs based on the observation assignment
    const updatedUnassignedObs = unassignedObs.map(obs => {
      if (obs.name === observationName) {
        return { ...obs, staffNeeded: Math.max(0, obs.staffNeeded - 1) };
      } else if (obs.name === previousObservationName) {
        return { ...obs, staffNeeded: obs.staffNeeded + 1 };
      }
      return obs;
    });
    setUnassignedObs(updatedUnassignedObs);
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


  const rainbowNames = ["Alex1","Charlotte2","Adna3","Aliah4"]


  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addStaffMember}>
        <header>
          <h1 className={styles.h1}>Staff members</h1>
        </header>
        <label className={styles.staffText}>
          Name:
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
          Break Time:
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
            <h2>
        <span className={styles.indexNumber}>{index + 1}:</span>
        {/* Check if the name is in the rainbowNames array */}
        <span className={rainbowNames.includes(staffMember.name) ? `${styles.staffName} rainbow-text` : styles.staffName}>
          {capitalizeWords(staffMember.name)}
        </span>
      </h2>


          <label className={styles.BreakText}>
            <span className={styles.labelText}>Break Time:</span>
            <select
              className={`${styles.inputText} ${styles.break}`}
              value={`${staffMember.break}:00`}
              onChange={(e) => handleBreakChange(e, staffMember.id)}
            >
              {breakTimeOptions}
            </select>
          </label>



            <label className={styles.staffText}>
            Security:
              <input
                type="checkbox"
                checked={staffMember.security}
                onChange={(e) => handleSecurityChange(e, staffMember.id)}
              />
            </label>


            {/* Dropdown to assign an observation to a staff member */}
            <label className={styles.staffText}>
              Initial Observation:
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
                <option value="">Select Observation</option>
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


