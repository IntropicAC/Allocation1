import React, { useEffect, useState } from 'react';
import styles from './allocationCreation.module.css';




function AllocationCreation({ staff, observations, allocatedStaff, setAllocatedStaff }) {

  return (
    <div>
      <table className={styles.allocationTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Break Time</th>
            <th>Number of Observations</th>
            <th>Observation ID</th>
          </tr>
        </thead>
        <tbody>
          {allocatedStaff.map((staffMember) => (
            <tr key={staffMember.name}>
              <td>{staffMember.name}</td>
              <td>{staffMember.break}</td>
              <td>{staffMember.numObservations}</td>
              <td>{staffMember.observationId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllocationCreation;
