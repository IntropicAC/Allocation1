import React, { useState, useRef } from "react";
import styles from "./patientInput.module.css";

function PatientInput({ observations, setObservations }) {
  const [otherStaff, setOtherStaff] = useState(""); // Renamed from otherStaffRequired
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
          staff: 1, // Renamed from staffRequired
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

  const addObservation = (e) => {
    e.preventDefault();

    let observationToAdd = { ...newObservation };

    if (newObservation.observationType === "other" && otherStaff) {
      observationToAdd.staff = Number(otherStaff.split(":")[0]);
    }

    setObservations((prevObservations) => {
      const maxId = prevObservations.reduce(
        (max, item) => Math.max(max, item.id),
        -1
      );
      const newId = maxId + 1;
      return [...prevObservations, { ...observationToAdd, id: newId }];
    });

    setNewObservation({
      name: "",
      observationType: "1:1",
      staff: 1, // Renamed from staffRequired
    });
    setOtherStaff(""); // Reset the otherStaff as well, renamed from otherStaffRequired
  };

  const removeObservation = (observationId) => {
    setObservations((prevObservations) =>
      prevObservations.filter((obs) => obs.id !== observationId)
    );
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
            <span>{`${index + 1}:`}</span>
            <h2>
              {observation.name === "Generals"
                ? "Generals"
                : `Patient: ${observation.name}`}
            </h2>

            <label className={styles.patientText}>
              Staff Required:
              <span>{observation.staff}</span>
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
