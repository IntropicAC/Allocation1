import React from 'react';
import styles from './allocationCreation.module.css';

function AllocationCreation({ allocatedStaff }) {
  allocatedStaff.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <table className={styles.allocationTable}>
      <thead>
        <tr>
          <th>Time</th>
          {allocatedStaff.map(staffMember => {
            let totalObservations = Object.values(staffMember.observations).filter(val => val !== '-').length;
            return <th key={staffMember.name}>{staffMember.name} - {totalObservations}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 12 }, (_, i) => 8 + i).map(hour => (
          <tr key={hour}>
            <td>{hour}</td>
            {allocatedStaff.map(staffMember => (
              <td key={staffMember.name + hour}>
                {staffMember.break === hour ? <strong>Break</strong> : staffMember.observations[hour] || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AllocationCreation;

