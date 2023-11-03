import React, { useState, useRef, useEffect } from "react";
import styles from "./allocationInput.module.css";

function AllocationInput({staff, setStaff, observations}) {
  
  const [newStaff, setNewStaff] = useState({
    name: "",
    break: "8:00", // default break time
    security: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  useEffect(() => {
    console.log('observations Array:', observations);
  }, [observations]);
  
  useEffect(() => {
    console.log('staff Array:', staff);
  }, [staff]);
  
  const nextIdRef = React.useRef(0);
  function generateId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }
  

  const nameInputRef = useRef(null);
  const addStaffMember = (e) => {
    e.preventDefault();
    const doesNameExist = staff.some(staffMember => staffMember.name.toLowerCase() === newStaff.name.toLowerCase());

    if (doesNameExist) {
        
        alert('A staff member with this name already exists!');
        return; 
    }

    const staffWithId = { ...newStaff, id: generateId() }; // use generateId to assign a unique id
    setStaff([...staff, staffWithId]);
    setNewStaff({ id: null, name: "", break: "8:00", security: false }); // reset fields
    
  };

  const removeStaffMember = (staffIdToRemove) => {
    setStaff((staff) => staff.filter((staff) => staff.id !== staffIdToRemove));
  };

  const handleSecurityChange = (e, index) => {
    const updatedStaff = staff.map((staffMember, i) => {
      if (i === index) {
        return { ...staffMember, security: e.target.checked };
      }
      return { ...staffMember, security: false }; // set all other members' security to false
    });
    setStaff(updatedStaff);
  };

  const handleBreakChange = (e, index) => {
    const updatedStaff = staff.map((staffMember, i) => {
      if (i === index) {
        return { ...staffMember, break: e.target.value };
      }
      return staffMember;
    });

    setStaff(updatedStaff);
  };

  const assignObservation = (observationName, staffId) => {
    // Find the index of the staff member with the given staffId
    const staffIndex = staff.findIndex(s => s.id === staffId);
    if (staffIndex !== -1) {
      // Create a new staff array with the updated observationName for the selected staff member
      const newStaff = [...staff];
      newStaff[staffIndex] = {
        ...newStaff[staffIndex],
        observationId: observationName, // Update the observationName instead of observationId
      };
  
      // Update the staff state
      setStaff(newStaff);
    }
  };
  // Generate break time options from 8:00 to 19:00
  const breakTimeOptions = [];
  for (let i = 8; i <= 19; i++) {
    breakTimeOptions.push(
      <option key={i} value={`${i}:00`}>
        {i}:00
      </option>
    );
  }

    return (
      <section className={styles.container}>
        <header>
          <h1 className={styles.h1}>Staff members</h1>
        </header>
        <form className={styles.form} onSubmit={addStaffMember}>
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
              value={newStaff.break}
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
          {staff.map((staffMember, index) => (
            <section key={staffMember.id} className={styles.staffMember}>
              <span>{`${index + 1}:`}</span>
              <h2>{staffMember.name}</h2>
  
              <label className={styles.staffText}>
                Break Time:
                <select className={styles.break}
                  value={staffMember.break}
                  onChange={(e) => handleBreakChange(e, index)}
                >
                  {breakTimeOptions}
                </select>
              </label>
  
              <label className={styles.staffText}>
                <input
                  type="checkbox"
                  checked={staffMember.security}
                  onChange={(e) => handleSecurityChange(e, index)}
                />
                Security
              </label>
              
             {/* Dropdown to assign an observation to a staff member */}
      <label className={styles.staffText}>
        Initial Observation:
        <select
          value={staffMember.observationId || ""}
          onChange={(e) => assignObservation(e.target.options[e.target.selectedIndex].text, staffMember.id)}
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

export default AllocationInput;
