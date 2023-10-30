import React, { useState, useRef } from "react";
import styles from "./patientInput.module.css";

function PatientInput() {

  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState({
    name: "",
    staffRequired: "1",  // It's set to string "1" to match the value of the select options
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    let observationType = "";
    if (value === "1:1") {
      observationType = "1:1";
    } else if (value === "Generals") {
      observationType = "Generals";
    }
  
    setNewObservation((prevState) => ({
      ...prevState,
      [name]: value,
      observationType: observationType,
    }));
  };
  

  const nextIdRef = React.useRef(0);
  function generateId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }

  const patientNameInputRef = useRef(null);

  const addObservation = (e) => {
    e.preventDefault();
    
    let observationToAdd = { ...newObservation };
  
    if (observationToAdd.staffRequired === "1:1" || observationToAdd.staffRequired === "Generals") {
      observationToAdd.staffRequired = "1";
    }
  
    const doesObservationExist = observations.some(observation => observation.name.toLowerCase() === observationToAdd.name.toLowerCase());
  
    const observationWithId = { ...observationToAdd, id: generateId() };
    setObservations([...observations, observationWithId]);
    setNewObservation(prevState => ({ ...prevState, name: "" }));
  };
  

  const removeObservation = (observationIdToRemove) => {
    setObservations((observations) => observations.filter((observation) => observation.id !== observationIdToRemove));
  };

  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addObservation}>
        <header>
          <h1 className={styles.h1}>Patient Observations</h1>
        </header>
  
        {newObservation.staffRequired !== "Generals" && (
          <label className={styles.patientText}>
            Observation name:
            <input
              maxLength={3}
              type="text"
              className={styles.inputText}
              name="name"
              value={newObservation.name}
              onChange={handleInputChange}
              placeholder="Max 3 characters"
              required
              ref={patientNameInputRef}
            />
          </label>
        )}
  
        <label className={styles.patientText}>
          Observation type:
          <select
            className={styles.selectNumber}
            name="staffRequired"
            value={newObservation.staffRequired}
            onChange={handleInputChange}
            required
            >
            <option value="1:1">1:1</option>
            <option value="2">2:1</option>
            <option value="3">3:1</option>
            <option value="Generals">Generals</option>
            <option value="other">Other</option>
            </select>

          {newObservation.staffRequired === "other" && (
            <input
              type="number"
              className={styles.inputNumber}
              name="staffRequired"
              min="1"
              placeholder="Enter number"
              onChange={handleInputChange}
              required
            />
          )}
        </label>
  
        <button className={styles.button} type="submit">
          Add Observation
        </button>
      </form>
  
      <form className={styles.patientContainer}>
  {observations.map((observation, index) => (
    <section key={index} className={styles.patientMember}>
      <span>{`${index + 1}:`}</span>
      
      {observation.observationType === "Generals" ? (
      <h2>Generals</h2>
    ) : (
      <h2>Patient: {observation.name}</h2>
    )}

      <label className={styles.patientText}>
        Staff Required:
        <span>{observation.staffRequired}</span>
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
