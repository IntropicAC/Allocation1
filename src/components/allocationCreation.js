import React, {useRef, useEffect, useState} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function AllocationCreation({ setAllocatedStaff, allocatedStaff, setTableRef }) {

  allocatedStaff.sort((a, b) => {
    if (a.security === true && b.security !== true) {
      return -1; // Place a before b
    } else if (b.security === true && a.security !== true) {
      return 1; // Place b before a
    }
    return a.name.localeCompare(b.name); // Alphabetical order for others
  });


  const localTableRef = useRef(null);

  useEffect(() => {
    console.log(allocatedStaff);
  }, [allocatedStaff]);



  const DragDropCell = ({ staffMember, hour, observation, moveObservation }) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: 'observation',
      item: { sourceStaffName: staffMember.name, sourceHour: hour }, // Specify source info
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }));
  
    const [, dropRef] = useDrop({
      accept: 'observation',
      drop: (item) => {
        // Correctly call moveObservation with source and target info
        moveObservation(item.sourceStaffName, item.sourceHour, staffMember.name, hour);
      },
    });
  
    // Combine refs for drag and drop in one cell
    const ref = useRef(null);
    dragRef(dropRef(ref));
  
    return (
      <td ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {observation}
      </td>
    );
  };
  

  const moveObservation = (sourceStaffName, sourceHour, targetStaffName, targetHour) => {
    let updatedAllocatedStaff = [...allocatedStaff];

    // Find indexes
    let sourceStaffIndex = updatedAllocatedStaff.findIndex(staff => staff.name === sourceStaffName);
    let targetStaffIndex = updatedAllocatedStaff.findIndex(staff => staff.name === targetStaffName);

    if (sourceStaffIndex === -1 || targetStaffIndex === -1) {
        console.error('Source or target staff not found');
        return;
    }

    // Access the staff objects directly
    let sourceStaff = updatedAllocatedStaff[sourceStaffIndex];
    let targetStaff = updatedAllocatedStaff[targetStaffIndex];

    // Swap observations
    let tempObservation = sourceStaff.observations[sourceHour] || '-';
    sourceStaff.observations[sourceHour] = targetStaff.observations[targetHour] || '-';
    targetStaff.observations[targetHour] = tempObservation;
  
// Condition to update break
if(sourceStaff.break === sourceHour && sourceStaff.name !== targetStaff.name){
  return
}
if (sourceStaff.break === sourceHour) {
    sourceStaff.break = targetHour;
    console.log(`Updated ${sourceStaff.name} to ${sourceStaff.break}`);
}



    setAllocatedStaff(updatedAllocatedStaff);
};

  return (
    <>
    <div className={styles.tableContainer}>
    <table ref={localTableRef} className={styles.allocationTable}>
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
        let observation = staffMember.observations[hour] === 'Generals' ? 'Gen' : staffMember.observations[hour] || '-';
        // Use DragDropCell for each observation
        return (
          <DragDropCell
            key={staffMember.name + hour}
            staffMember={staffMember}
            hour={hour}
            observation={staffMember.break === hour ? <strong>Break</strong> : observation}
            moveObservation={moveObservation}
          />
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

