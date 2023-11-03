import React, { useState, useRef,} from "react";
import styles from "./patientInput.module.css";

function PatientInput({ observations, setObservations }) {

  const [otherStaffRequired, setOtherStaffRequired] = useState("");
  const [newObservation, setNewObservation] = useState({
    name: "",
    observationType: "1:1",
    staffRequired: "1",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedObservation = {
      ...newObservation,
      [name]: value
    };

    if (name === "observationType") {
      if (value === "Generals") {
        updatedObservation = {
          ...updatedObservation,
          name: "Generals",
          staffRequired: "1"
        };
      } else if (["2:1", "3:1"].includes(value)) {
        updatedObservation.staffRequired = value.split(":")[0];
        // Reset the name only if the previous value was "Generals"
        if (newObservation.observationType === "Generals") {
          updatedObservation.name = "";
        }
      } else if (value === "other") {
        setOtherStaffRequired("4");  // Set the default value here
      } else { 
        // Reset the name only if the previous value was "Generals"
        if (newObservation.observationType === "Generals") {
          updatedObservation.name = "";
        }
      }
    }

    setNewObservation(updatedObservation);
};


const addObservation = (e) => {
  e.preventDefault(); // Add this line to prevent the default form submission behavior

  let observationToAdd = { ...newObservation };

  if (newObservation.observationType === "other") {
    observationToAdd.staffRequired = otherStaffRequired;
  }

  setObservations((prevObservations) => {
    const maxId = prevObservations.reduce((max, item) => Math.max(max, item.id), -1);
    const newId = maxId + 1;
    return [...prevObservations, { ...observationToAdd, id: newId }];
  });

  // Reset the newObservation state to its initial values
  setNewObservation({
    name: "",
    observationType: "1:1",
    staffRequired: "1",
  });
  // If 'other' was selected, reset otherStaffRequired as well
  if (newObservation.observationType === "other") {
    setOtherStaffRequired("");
  }
};


  const removeObservation = (observationId) => {
    setObservations((prevObservations) => prevObservations.filter(obs => obs.id !== observationId));
  };
  

  return (
    <section className={styles.container}>
      <form className={styles.form} onSubmit={addObservation}>
        <header>
          <h1 className={styles.h1}>Patient Observations</h1>
        </header>

        {newObservation.observationType !== "Generals" && (
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
            />
          </label>
        )}

        <label className={styles.patientText}>
          Observation type:
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
              value={otherStaffRequired}
              onChange={(e) => setOtherStaffRequired(e.target.value)}
              required
              className={styles.selectNumber}
            >
              <option value="4:1">4:1</option>
              <option value="5:1">5:1</option>
              <option value="6:1">6:1</option>
              <option value="7:1">7:1</option>
              <option value="8:1">8:1</option>
              <option value="9:1">9:1</option>
              <option value="10:1">10:1</option>
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
            <span>{`${index + 1}:`}</span>
            <h2>
              {observation.name === "Generals" ? "Generals" : `Patient: ${observation.name}`}
            </h2>

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
