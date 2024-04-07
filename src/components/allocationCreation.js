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
  // Existing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(observation);

  // State variable to track click-and-hold timeout
  const [clickAndHoldTimeout, setClickAndHoldTimeout] = useState(null);

  // Existing drag setup
  const [{ isDragging }, dragRef, dragSource] = useDrag(() => ({
    type: 'observation',
    item: { sourceStaffName: staffMember.name, sourceHour: hour },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  }));

  // Existing drop setup
  const [{ isOver }, dropRef] = useDrop({
    accept: ['observation', 'externalObservation', 'specialObservation'],
    drop: (item, monitor) => {
      if (monitor.getItemType() === 'externalObservation' || monitor.getItemType() === 'specialObservation') {
        updateObservation(staffMember.name, hour, item.observationName);
      } else if (monitor.getItemType() === 'observation') {
        moveObservation(item.sourceStaffName, item.sourceHour, staffMember.name, hour);
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });

  // Combine refs for drag and drop in one cell
  const ref = useRef(null);
  dragRef(dropRef(ref));

  // Function to toggle edit mode
  const toggleEdit = () => {
    if (hour === staffMember.break) {
      return;
    }
    setIsEditing(!isEditing);
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  // Function to handle when editing is finished
  const handleInputBlur = () => {
    updateObservation(staffMember.name, hour, editValue);
    setIsEditing(false);
  };

  // Function to handle mouse down event
  const handleCellMouseDown = () => {
    // Start a timer for click-and-hold
    const timeout = setTimeout(() => {
      // After 300ms, consider it a click-and-hold and initiate dragging
      if (dragSource.current) {
        dragSource.current.startDrag();
      }
    }, 300);
  
    // Save the timer reference to clear it on mouse up
    setClickAndHoldTimeout(timeout);
  };
  useEffect(() => {
    return () => {
      // Clean up the dragSource reference when the component is unmounted
      dragSource.current = null;
    };
  }, []);
  // Function to handle mouse up event
  const handleCellMouseUp = () => {
    // Clear the click-and-hold timer
    clearTimeout(clickAndHoldTimeout);

    // If the timer hasn't expired yet, consider it a regular click
    if (clickAndHoldTimeout) {
      toggleEdit();
    }

    // Reset the timer reference
    setClickAndHoldTimeout(null);
  };

  // Apply styles based on dragging and hovering states
  const cellStyle = isDragging ? styles.draggingCell : isOver ? styles.hoveringCell : '';

  // Editing state
  if (isEditing) {
    return (
      <td
        ref={ref}
        className={`${cellStyle} ${styles.editableCell}`}
        style={{ padding: 0, maxWidth: '3rem' }}
        onMouseDown={handleCellMouseDown}
        onMouseUp={handleCellMouseUp}
      >
        <input
          maxLength={3}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInputBlur();
            }
          }}
          className={styles.editableInput}
          autoFocus
          style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
        />
      </td>
    );
  }

  // Non-editing state
  return (
    <td
      ref={ref}
      className={cellStyle}
      onMouseDown={handleCellMouseDown}
      onMouseUp={handleCellMouseUp}
    >
      {observation}
    </td>
  );
};

  const moveObservation = (sourceStaffName, sourceHour, targetStaffName, targetHour) => {
    const updatedStaff = [...staff];
    const sourceStaffIndex = updatedStaff.findIndex(staff => staff.name === sourceStaffName);
    const targetStaffIndex = updatedStaff.findIndex(staff => staff.name === targetStaffName);

    if (sourceStaffIndex === -1 || targetStaffIndex === -1) {
        console.error('Source or target staff not found');
        return; // Immediate exit if staff members are not found
    }

    const sourceStaff = updatedStaff[sourceStaffIndex];
    const targetStaff = updatedStaff[targetStaffIndex];

    // Check for any condition that would prevent the action
    if (sourceStaff.name !== targetStaff.name && targetStaff.break === targetHour) {
        return; // Exit without modifying state
    } else if (sourceStaff.break === sourceHour && sourceStaff.name !== targetStaff.name) {
        return; // Exit without modifying state
    }

    // At this point, all checks have passed, so proceed with the swap
    const tempObservation = sourceStaff.observations[sourceHour] || '-';
    sourceStaff.observations[sourceHour] = targetStaff.observations[targetHour] || '-';
    targetStaff.observations[targetHour] = tempObservation;

    // Additional conditions that modify state should only be applied if all checks have passed
    if (sourceStaff.break === sourceHour) {
        sourceStaff.break = targetHour;
    } else if (targetStaff.break === targetHour) {
        targetStaff.break = sourceHour;
    }

    setStaff(updatedStaff); // Update the React state only after all conditions have been checked and passed
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
          observation={staffMember.break === hour ? <strong className={styles.break}>Break</strong> : observation}
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

