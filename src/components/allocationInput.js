import React, { useState } from 'react';

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

  const handleSecurityChange = (index) => {
    const updatedStaff = staff.map((staffMember, i) => ({
      ...staffMember,
      security: i === index,
    }));
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
    <div>
      <form onSubmit={addStaffMember}>
        <input
          type="text"
          name="name"
          value={newStaff.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
        />
        <select
          name="break"
          value={newStaff.break}
          onChange={handleInputChange}
        >
          {breakTimeOptions}
        </select>
        {/* Other input fields if any */}
        <button type="submit">Add Staff Member</button>
      </form>

      <ul>
        {staff.map((member, index) => (
          <li key={index}>
            <input
              type="radio"
              name="security"
              checked={member.security}
              onChange={() => handleSecurityChange(index)}
            />
            {member.name} - Break: {member.break}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllocationInput;

