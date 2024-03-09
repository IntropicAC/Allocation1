import React, { useState } from 'react';
import './AmPmToggle.css'; // Assuming you'll create a CSS file for styling

const AmPmToggle = () => {
  const [isAm, setIsAm] = useState(true);

  const toggleAmPm = () => {
    setIsAm(!isAm);
  };

  return (
    <div className="toggle-container">
      <span className="toggle-label left">AM</span>
      <label className="toggle-switch">
        <input type="checkbox" checked={!isAm} onChange={toggleAmPm} />
        <span className="switch-slider"></span>
      </label>
      <span className="toggle-label right">PM</span>
    </div>
  );
};

export default AmPmToggle;
