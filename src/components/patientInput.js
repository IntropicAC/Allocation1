import React, { useState, useEffect} from "react";
import styles from "./patientInput.module.css";

function PatientInput({ observations, setObservations, setStaff, setUnassignedObs, unassignedObs,  }) {
  const [otherStaff, setOtherStaff] = useState(""); 
  const [newObservation, setNewObservation] = useState({
    name: "",
    observationType: "1:1",
    staff: 1, // Renamed from staffRequired
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedObservation = {
      ...newObservation,
      [name]: value,
    };

    if (name === "observationType") {
      if (value === "Generals") {
        updatedObservation = {
          ...updatedObservation,
          name: "Generals",
          staff: 1, 
        };
      } else if (["2:1", "3:1"].includes(value)) {
        updatedObservation.staff = Number(value.split(":")[0]); // Renamed from staffRequired
        if (newObservation.observationType === "Generals") {
          updatedObservation.name = "";
        }
      } else if (value === "other") {
        setOtherStaff("4"); // Set the default value here, renamed from otherStaffRequired
      } else {
        if (newObservation.observationType === "Generals") {
          updatedObservation.name = "";
        }
      }
    }

    setNewObservation(updatedObservation);
  };

  const updateObservationsWithStaffNeeded = (observations, newId) => {
    return observations.map(observation => ({
      ...observation,
      StaffNeeded: observation.id >= newId ? observation.staff : observation.StaffNeeded,
    }));
  };
  
  const addObservation = (e) => {
  e.preventDefault();
  
  if (observations.length >= 10) {
    alert("The maximum number of 10 patients has been reached, please remove a patient to add another.");
    return;
  }

  if (["gen", "gens"].includes(newObservation.name.toLowerCase())) {
    alert(`${newObservation.name} is a reserved name. If you are trying to add Generals, select it within observation type.`);
    return;
  }

  let observationToAdd = { ...newObservation, StaffNeeded: newObservation.staff };

  if (newObservation.observationType === "other" && otherStaff) {
    observationToAdd.staff = Number(otherStaff.split(":")[0]);
  }

  setObservations(prevObservations => {
    const maxId = prevObservations.reduce((max, item) => Math.max(max, item.id), -1);
    const newId = maxId + 1;
    
    // ✅ FIX: Preserve deletedObs even when observations array is empty
    // Check if we have a stored deletedObs in localStorage or use existing
    const currentDeletedObs = prevObservations.length > 0 
      ? (prevObservations[0]?.deletedObs || []) 
      : (JSON.parse(localStorage.getItem('pendingDeletedObs') || '[]'));
    
    console.log('📝 Adding observation, preserving deletedObs:', currentDeletedObs);
    
    // Clear the temporary storage
    localStorage.removeItem('pendingDeletedObs');
    
    const newObservations = updateObservationsWithStaffNeeded(
      [...prevObservations, { ...observationToAdd, id: newId, deletedObs: currentDeletedObs }], 
      newId
    );
    
    return newObservations.map(obs => ({
      ...obs,
      deletedObs: currentDeletedObs
    }));
  });

  setNewObservation({
    name: "",
    observationType: "1:1",
    staff: 1, 
  });
  setOtherStaff("");
};

const removeObservation = (observationIdToRemove) => {
  const observationToRemove = observations.find(obs => obs.id === observationIdToRemove);

  if (observationToRemove) {
    setObservations(prevObservations => {
      const updatedObservations = prevObservations.filter(obs => obs.id !== observationIdToRemove);
      
      const currentDeletedObs = updatedObservations[0]?.deletedObs || [];
      const newDeletedObs = [...currentDeletedObs, observationToRemove.name];
      
      console.log('🗑️ Removing observation, updated deletedObs:', newDeletedObs);
      
      // ✅ If no observations left, store deletedObs temporarily
      if (updatedObservations.length === 0) {
        console.log('⚠️ No observations left, storing deletedObs in localStorage');
        localStorage.setItem('pendingDeletedObs', JSON.stringify(newDeletedObs));
        return [];
      }
      
      return updatedObservations.map(obs => ({
        ...obs,
        deletedObs: newDeletedObs
      }));
    });

    setStaff(currentStaff =>
      currentStaff.map(staffMember => {
        if (staffMember.observationId === observationToRemove.name) {
          return { ...staffMember, observationId: '-' };
        }
        return staffMember;
      })
    );
  }
};
useEffect(()=>{
  console.log("Patient:", observations)
},[observations])

  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addObservation}>
        <header>
          <h1 className={styles.h1}>Patient Observations</h1>
        </header>

    
        <label className={styles.patientText}>
          Observation name
          <input
            maxLength={3}
            type="text"
            className={styles.inputText}
            name="name"
            value={newObservation.observationType === "Generals" ? "Generals" : newObservation.name}
            onChange={handleInputChange}
            placeholder="Max 3 characters"
            required
            disabled={newObservation.observationType === "Generals"}
          />
        </label>

        <label className={styles.patientText}>
          Observation type
          <select
            name="observationType"
            value={newObservation.observationType}
            onChange={handleInputChange}
            required
            className={styles.observationType}
          >
            <option value="1:1">1:1</option>
            <option value="2:1">2:1</option>
            <option value="3:1">3:1</option>
            <option value="Generals">Generals</option>
            <option value="other">Other</option>
          </select>
          {newObservation.observationType === "other" && (
            <select
              name="staffRequired"
              value={otherStaff}
              onChange={(e) => setOtherStaff(e.target.value)}
              required
              className={styles.selectNumber}
            >
              <option value="4:1">4:1</option>
              <option value="5:1">5:1</option>
              <option value="6:1">6:1</option>
            </select>
          )}
        </label>

        <button className={styles.button} type="submit">
          Add Observation
        </button>
      </form>

      <form className={styles.patientContainer}>
        {observations.map((observation, index) => (
          <section key={index} className={styles.patientMember}>
            <span className={styles.indexNumber}>{`${index + 1}`}</span>
            <h2>
              {observation.name === "Generals"
                ? "Generals"
                : `${observation.name}`}
            </h2>

            <label className={styles.patientText}>
              Staff Required
              <span className={styles.obAmount}>{observation.staff}</span>
            </label>

            <button
              className={styles.xButton}
              onClick={(e) => {
                e.preventDefault();
                removeObservation(observation.id);
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

export default PatientInput;
