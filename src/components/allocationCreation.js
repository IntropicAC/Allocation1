import React, {useRef, useEffect, useState} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function AllocationCreation({ setAllocatedStaff, allocatedStaff, setTableRef, observations }) {

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
    setTableRef(localTableRef.current);
  }, []);

  const DragDropCell = ({ staffMember, hour, observation, moveObservation, updateObservation }) => {
    // Existing drag and drop setup...
  
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(observation);
    

    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: 'observation',
      item: { sourceStaffName: staffMember.name, sourceHour: hour },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }));
  
    const [{ isOver }, dropRef] = useDrop({
      accept: ['observation', 'externalObservation', 'specialObservation'], // Accept both types
      drop: (item, monitor) => {
        // Check the type of drag item and handle accordingly
        if (monitor.getItemType() === 'externalObservation' || monitor.getItemType() === 'specialObservation') {
          // For external observation, update the observation directly
          updateObservation(staffMember.name, hour, item.observationName);
        } else if (monitor.getItemType() === 'observation') {
          // For internal moves, use the existing logic
          moveObservation(item.sourceStaffName, item.sourceHour, staffMember.name, hour);
        }
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    });
  
    // Function to toggle edit mode
    const toggleEdit = () => setIsEditing(!isEditing);
  
    // Function to handle change in the input field
    const handleInputChange = (e) => {
      setEditValue(e.target.value);
    };
  
    // Function to handle when editing is finished
    const handleInputBlur = () => {
      updateObservation(staffMember.name, hour, editValue); // Update the observation
      setIsEditing(false); // Exit editing mode
    };
  
    // Combine refs for drag and drop in one cell, ensuring it doesn't interfere with editing
    const ref = useRef(null);
    dragRef(dropRef(ref));
  
    // Apply styles based on dragging and hovering states
    const cellStyle = isDragging ? styles.draggingCell : isOver ? styles.hoveringCell : '';
  
    // Return editable input or static text based on editing state
    if (isEditing) {
      return (
        <td ref={ref} className={`${cellStyle} ${styles.editableCell}`} onDoubleClick={() => toggleEdit()}>
          <input
            maxLength={3}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={styles.editableInput}
            autoFocus
          />
        </td>
      );
    }
  
    return (
      <td ref={ref} className={cellStyle} onDoubleClick={() => toggleEdit()}>
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
  
}



    setAllocatedStaff(updatedAllocatedStaff);
};

const updateObservation = (staffName, hour, newObservation) => {
  setAllocatedStaff(prevStaff =>
    prevStaff.map(staffMember => {
      if (staffMember.name === staffName) {
        return {
          ...staffMember,
          observations: {
            ...staffMember.observations,
            [hour]: newObservation, // Update with the new observation
          },
        };
      }
      return staffMember;
    })
  );
};

const DraggableObservationCell = ({ observation }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'externalObservation', // A distinct type for external drags
    item: { observationName: observation.name },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {observation.name}
    </div>
  );
};

const DraggableXCell = ({ value }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'specialObservation', // A distinct type for special drags like "X"
    item: { observationName: value }, // Pass "X" or any special value
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}>
      {value}
    </div>
  );
};



  return (
    <>
    <div className={styles.draggableObsContainer}>
    <div className={styles.obsCells}>
        <DraggableXCell value="X" />
      </div>
      {observations.map((observation, index) => (
        <div key={index} className={styles.obsCells}> {/* Use a div or span here for individual cells */}
          <DraggableObservationCell observation={observation} />
        </div>
      ))}
    </div>

    <div className={styles.tableContainer}>
    <table ref={localTableRef} className={styles.allocationTable}>
      <thead>
        <tr>
          <th>Time</th>
          {allocatedStaff.map(staffMember => {
            let totalObservations = Object.values(staffMember.observations).filter(val => val !== '-' && val !== '').length;
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
            updateObservation={updateObservation} // Pass this function to update observations
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

