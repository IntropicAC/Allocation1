import React, { useState } from 'react';
import styles from './allocationInput.module.css';


function AllocationInput() {
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '',
    break: '8:00', // default break time
    security: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const addStaffMember = (e) => {
    e.preventDefault();
    setStaff([...staff, newStaff]);
    setNewStaff({name: '', break: '8:00', security: false}); // reset fields
  }

  const handleSecurityChange = (e, index) => {
    const updatedStaff = staff.map((staffMember, i) => {
      if (i === index) {
        return { ...staffMember, security: e.target.checked };
      }
      return staffMember;
    });
  
    setStaff(updatedStaff);
  };

  // Generate break time options from 8:00 to 19:00
  const breakTimeOptions = [];
  for (let i = 8; i <= 19; i++) {
    breakTimeOptions.push(
      <option key={i} value={`${i}:00`}>{i}:00</option>
    );
  }

  return (
    <section className={styles.container}>
      <header>
        <h1>Staff Allocation</h1>
      </header>

      <form className={styles.form} onSubmit={addStaffMember}>
        <label>
          Name:
          <input
            type="text"
            className={styles.inputText}
            name="name"
            value={newStaff.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
        </label>
        <label>
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
        <button className={styles.button} type="submit">Add Staff Member</button>
      </form>

      <article className={styles.staffContainer}>
        {staff.map((staffMember, index) => (
          <section key={index} className={styles.staffMember}>
            <header>
              <h2>{staffMember.name}</h2>
            </header>
            <p>Break: {staffMember.break}</p>
            <fieldset>
              <legend>Security</legend>
              <label>
                <input 
                  type="checkbox" 
                  checked={staffMember.security} 
                  onChange={(e) => handleSecurityChange(e, index)} 
                />
                Security
              </label>
            </fieldset>
          </section>
        ))}
      </article>
    </section>
  );
}

export default AllocationInput;

