import React, {useRef, useEffect, useState} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';
import AmPmToggle from './helperComponents/AmPmToggle';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function AllocationCreation({ staff, setStaff, setTableRef, observations }) {

  staff.sort((a, b) => {
    if (a.security === true && b.security !== true) {
      return -1; // Place a before b
    } else if (b.security === true && a.security !== true) {
      return 1; // Place b before a
    }
    return a.name.localeCompare(b.name); // Alphabetical order for others
  });

  useEffect(()=> {
    console.log(staff)
  }, [staff])
  
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
    const toggleEdit = () => {
      // Check if the current hour matches the staff member's break hour
      if (hour === staffMember.break) {
        // If it's the staff member's break hour, do not toggle the edit mode
        return;
      }
      setIsEditing(!isEditing);
    };
  
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
        <td
      ref={ref}
      className={`${cellStyle} ${styles.editableCell}`}
      onDoubleClick={() => toggleEdit()}
      style={{padding: 0, maxWidth: '3rem'}}
      
    >
      <input
        maxLength={3}
        type="text"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={styles.editableInput}
        autoFocus
        style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
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
    let updatedStaff = [...staff];

    // Find indexes
    let sourceStaffIndex = updatedStaff.findIndex(staff => staff.name === sourceStaffName);
    let targetStaffIndex = updatedStaff.findIndex(staff => staff.name === targetStaffName);

    if (sourceStaffIndex === -1 || targetStaffIndex === -1) {
        console.error('Source or target staff not found');
        return;
    }

    // Access the staff objects directly
    let sourceStaff = updatedStaff[sourceStaffIndex];
    let targetStaff = updatedStaff[targetStaffIndex];

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



    setStaff(updatedStaff);
};

const updateObservation = (staffName, hour, newObservation) => {
  setStaff(prevStaff =>
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
    <div ref={drag} className={styles.obsCells} style={{ cursor: 'grab', borderRadius: 10, opacity: isDragging ? 0.3 : 1 }}>
      {observation.name}
    </div>
  );
};

const DraggableXCell = ({ value }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'specialObservation',
    item: { observationName: value },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={styles.obsCells} style={{ cursor: 'grab', borderRadius: 10, opacity: isDragging ? 0.3 : 1 }}>
      {value}
    </div>
  );
};



  return (
    <>
      <div className={styles.draggableObsContainer}>
      <div>
        <DraggableXCell value="X" />
      </div>
      {observations.map((observation, index) => (
        <div key={index}>
          <DraggableObservationCell observation={observation} />
        </div>
      ))}
    </div>
  


    <div className={styles.tableContainer}>
    <table ref={localTableRef} className={styles.allocationTable}>
      <thead>
        <tr>
          <th>Time</th>
          {staff.map(staffMember => {
            let totalObservations = Object.values(staffMember.observations).filter(val => val !== '-' && val !== '' && val !== 'X').length;
            // Capitalize the first letter of each staff member's name
            let capitalizedStaffName = capitalizeFirstLetter(staffMember.name);
            return <th key={staffMember.name}>{capitalizedStaffName} - {totalObservations}</th>;
          })}
        </tr>
      </thead>
      <tbody>
      {Array.from({ length: 12 }, (_, i) => 8 + i).map(hour => (
  <tr key={hour}>
    <td className={styles.hourCell}>{hour}</td>
    {staff.map(staffMember => {
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

