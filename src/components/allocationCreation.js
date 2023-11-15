import React from 'react';
import styles from './allocationCreation.module.css';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function AllocationCreation({ allocatedStaff }) {
  allocatedStaff.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
    <div className={styles.tableContainer}>
    <table className={styles.allocationTable}>
      <thead>
        <tr>
          <th>Time</th>
          {allocatedStaff.map(staffMember => {
            let totalObservations = Object.values(staffMember.observations).filter(val => val !== '-').length;
            // Capitalize the first letter of each staff member's name
            let capitalizedStaffName = capitalizeFirstLetter(staffMember.name);
            return <th key={staffMember.name}>{capitalizedStaffName} - {totalObservations}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 12 }, (_, i) => 8 + i).map(hour => (
          <tr key={hour}>
            <td>{hour}</td>
            {allocatedStaff.map(staffMember => {
              // Check if the observation for the current hour is 'Generals', and replace it with 'Gen'
              let observation = staffMember.observations[hour];
              if (observation === 'Generals') {
                observation = 'Gen';
              }

              return (
                <td key={staffMember.name + hour}>
                  {staffMember.break === hour ? <strong>Break</strong> : observation || '-'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  );
}

export default AllocationCreation;

