import React, {useRef, useEffect, useState} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';

import AmPmToggle from './helperComponents/AmPmToggle';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function AllocationCreation({ staff, setStaff, setTableRef, observations, setObservations }) {

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
    canDrag: monitor => {
      // Prevent dragging if the cell is in editing mode
      return !isEditing;
    },
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
    console.log("Editing Mode before toggle:", isEditing);
    setIsEditing(!isEditing);
    // When enabling editing, check if the current observation is "-"
    if (!isEditing && observation === "-") {
      setEditValue("");  // Set the editing value to be empty
    } else {
      setEditValue(observation);  // Otherwise, use the current observation value
    }

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
  const handleCellMouseDown = (e) => {
    if (isEditing) {
      // If in editing mode, simply return to allow normal input interactions
      return;
    }
  
    // If not in editing mode, handle the drag normally
    const timeout = setTimeout(() => {
      if (dragSource.current) {
        dragSource.current.startDrag();
      }
    }, 300); // Delay to distinguish between click and drag
  
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
    if (clickAndHoldTimeout && !isEditing) {
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
        style={{ padding: 0, margin: 0, overflow: 'hidden' }}
        onMouseDown={handleCellMouseDown}
        onMouseUp={handleCellMouseUp}
      >
        <input
          maxLength={12}
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
          style={{ width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
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

    // Check if the hours involved affect hour 8
    const sourceIsHourEight = sourceHour === 8;
    const targetIsHourEight = targetHour === 8;

    if (sourceHour === 8 || targetHour === 8) {
      if (sourceHour === 8 && targetHour === 8) {
          updateStaffNeeded(sourceStaff.observations[sourceHour], true);
          updateStaffNeeded(targetStaff.observations[targetHour], false);
      } else if (sourceHour === 8) {
          updateStaffNeeded(sourceStaff.observations[sourceHour], true);
      } else if (targetHour === 8) {
          updateStaffNeeded(targetStaff.observations[targetHour], false);
      }
  }

    // Check for any condition that would prevent the action
    if (sourceStaff.name !== targetStaff.name && targetStaff.break === targetHour) {
        return; // Exit without modifying state
    } else if (sourceStaff.break === sourceHour && sourceStaff.name !== targetStaff.name) {
        return; // Exit without modifying state
    }
    

    // Additional conditions that modify state should only be applied if all checks have passed
    if (sourceStaff.break === sourceHour) {
      sourceStaff.break = targetHour;
    } else if (targetStaff.break === targetHour) {
        targetStaff.break = sourceHour;
    }

    // Update observationId based on hour 8 conditions
    if (sourceIsHourEight || targetIsHourEight) {
      let tempObservationId = sourceStaff.observations[sourceHour];
      if (sourceIsHourEight && targetIsHourEight) {
          // Both are hour 8, just swap their observationIds
          sourceStaff.observationId = targetStaff.observations[targetHour]
          targetStaff.observationId = tempObservationId;
      } else if (sourceIsHourEight) {
          // Only source is hour 8, update sourceStaff's observationId to target's hour observation
          sourceStaff.observationId = targetStaff.observations[targetHour];
      } else if (targetIsHourEight) {
          // Only target is hour 8, update targetStaff's observationId to source's hour observation
          targetStaff.observationId = tempObservationId; // Should be the saved temp observation value, not sourceStaff's
      }
  }
    if (sourceHour || targetHour !== 8){
    // At this point, all checks have passed, so proceed with the swap
    const tempObservation = sourceStaff.observations[sourceHour] || '-';
    sourceStaff.observations[sourceHour] = targetStaff.observations[targetHour] || '-';
    targetStaff.observations[targetHour] = tempObservation;
}
    

    setStaff(updatedStaff); // Update the React state only after all conditions have been checked and passed
};


function updateStaffNeeded(observationName, increment) {
  setObservations(prevObservations => {
    return prevObservations.map(obs => {
      if (obs.name === observationName) {
        let updatedStaffNeeded = increment ? obs.StaffNeeded + 1 : obs.StaffNeeded - 1;
        // Ensure we do not exceed the total staff available nor go below zero
        updatedStaffNeeded = Math.min(Math.max(updatedStaffNeeded, 0), obs.staff);
        return { ...obs, StaffNeeded: updatedStaffNeeded };
      }
      return obs;
    });
  });
}


const updateObservation = (staffName, hour, newObservation) => {
  setStaff(prevStaff =>
    prevStaff.map(staffMember => {
      if (staffMember.name === staffName) {
        // Check if the hour equals the staff member's break hour
        if (staffMember.break === hour) {
          return staffMember; 
        }

        // Check if the observation is being dropped into hour 8
        if (hour === 8) {
          return {
            ...staffMember,
            observations: {
              ...staffMember.observations,
              [hour]: newObservation, // Update the observation at the specific hour
            },
            observationId: newObservation // Update observationId when hour is 8
          };
        } else {
          return {
            ...staffMember,
            observations: {
              ...staffMember.observations,
              [hour]: newObservation, // Only update the observation at the specific hour
            }
          };
        }
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

const countValidObservations = (staffObservations, observations) => {
  // Create a set of valid observation names
  const validNames = new Set(observations.map(obs => obs.name));
  
  // Count observations that are in the valid names set
  return Object.values(staffObservations).filter(obs => validNames.has(obs) && obs !== '-').length;
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
          const totalObservations = countValidObservations(staffMember.observations, observations);
          const capitalizedStaffName = capitalizeFirstLetter(staffMember.name);
          return <th key={staffMember.id}>{capitalizedStaffName} - {totalObservations}</th>;
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

