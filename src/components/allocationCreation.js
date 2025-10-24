//allocationCreation.js
import React, {useRef, useEffect, useState} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';

import ColorToggleButton from './helperComponents/ColorToggleButton';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function AllocationCreation({ staff, setStaff, setTableRef, observations, setObservations, selectedStartHour, setSelectedStartHour }) {

  const [colorCodingEnabled, setColorCodingEnabled] = useState(false);

  // Light, visually appealing color palette for observations
  const observationColors = {
    0: '#FFE5E5', // Soft pink
    1: '#E5F3FF', // Soft blue
    2: '#FFF4E5', // Soft peach
    3: '#E5FFE5', // Soft green
    4: '#F5E5FF', // Soft lavender
    5: '#FFE5F5', // Soft rose
    6: '#E5FFFF', // Soft cyan
    7: '#FFF5E5', // Soft cream
    8: '#FFE5EB', // Soft coral
    9: '#E5F5E5', // Soft mint
  };

  const getObservationColor = (observationName) => {
  if (!colorCodingEnabled || !observationName || observationName === '-') {
    return 'transparent';
  }
  
  // Extract the first word from the cell value (before any space or hyphen)
  const firstWord = observationName.split(/[\s-]/)[0];
  
  // Check if the first word matches any observation name exactly
  const index = observations.findIndex(obs => obs.name === firstWord);
  if (index === -1) return 'transparent';
  
  return observationColors[index % 10];
};

  staff.sort((a, b) => {
  // Define priority order: Nurse (1), Security (2), HCA (3)
  const getPriority = (staffMember) => {
    if (staffMember.nurse === true) return 1;
    if (staffMember.security === true) return 2;
    return 3; // HCA or other roles
  };

  const priorityA = getPriority(a);
  const priorityB = getPriority(b);

  // If priorities are different, sort by priority
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  // If same priority, sort alphabetically by name
  return a.name.localeCompare(b.name);
});

  useEffect(()=> {
    console.log(staff)
  }, [staff])
  
  const localTableRef = useRef(null);

  useEffect(() => {
    setTableRef(localTableRef.current);
  }, []);

  const [editingCell, setEditingCell] = useState(null); // Track which cell is being edited
  const [editValue, setEditValue] = useState('');


 const DragDropCell = ({ staffMember, hour, observation, originalObservation, moveObservation, updateObservation }) => {
  const isEditing = editingCell === `${staffMember.name}-${hour}`;
  const [isDragStarted, setIsDragStarted] = useState(false);

  const [{ isDragging }, dragRef, dragSource] = useDrag(() => ({
    type: 'observation',
    item: () => {
      setIsDragStarted(true);
      return { sourceStaffName: staffMember.name, sourceHour: hour };
    },
    canDrag: () => {
      return !isEditing;
    },
    collect: monitor => ({ 
      isDragging: monitor.isDragging() 
    }),
    end: () => {
      setIsDragStarted(false);
    }
  }), [staffMember.name, hour, isEditing]);

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

  const ref = useRef(null);
  dragRef(dropRef(ref));

  const handleCellClick = (e) => {
    if (isEditing || hour === staffMember.break) {
      return;
    }
    
    e.stopPropagation();
    
    // If another cell is being edited, save it first
    if (editingCell && editingCell !== `${staffMember.name}-${hour}`) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      updateObservation(currentStaffName, parseInt(currentHour), editValue);
    }
    
    // Get the actual text value for editing
    const actualObservation = staffMember.observations[hour] || '-';
    
    // Start editing this cell
    setEditingCell(`${staffMember.name}-${hour}`);
    setEditValue(actualObservation === "-" ? "" : actualObservation);
  };

  const finishEditing = () => {
    updateObservation(staffMember.name, hour, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  useEffect(() => {
    return () => {
      dragSource.current = null;
    };
  }, []);

  const cellStyle = isDragging ? styles.draggingCell : isOver ? styles.hoveringCell : '';

  if (isEditing) {
    return (
      <td ref={ref} style={{ padding: 0, margin: 0, overflow: 'hidden' }}>
        <input
          maxLength={12}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={finishEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              finishEditing();
            }
          }}
          className={styles.editableInput}
          autoFocus
          style={{ width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
        />
      </td>
    );
  }

  // For breaks, don't apply color
  const isBreak = staffMember.break === hour;
  const colorToUse = isBreak ? 'transparent' : getObservationColor(originalObservation);

  return (
    <td ref={ref} className={cellStyle} onClick={handleCellClick} style={{ backgroundColor: colorToUse }}>
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
        <ColorToggleButton 
        colorCodingEnabled={colorCodingEnabled}
        setColorCodingEnabled={setColorCodingEnabled}
        observations={observations}
        observationColors={observationColors}
      />
      </div>
      
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
          const roleTag = staffMember.nurse ? ' (Nurse)' : staffMember.security ? ' (Sec)' : '';
          return <th key={staffMember.id}>{capitalizedStaffName}{roleTag} - {totalObservations}</th>;
        })}
        </tr>
      </thead>
      <tbody>
      {Array.from({ length: 12 }, (_, i) => 8 + i).map(hour => (
  <tr key={hour}>
    <td 
  className={`${styles.hourCell} ${
    selectedStartHour === hour 
      ? styles.selectedHour 
      : selectedStartHour && hour >= selectedStartHour 
        ? styles.affectedHour 
        : ''
  }`}
  onClick={() => setSelectedStartHour(selectedStartHour === hour ? null : hour)}
  style={{ cursor: 'pointer' }}
>
  {hour}
</td>
    {staff.map(staffMember => {
      let observation = staffMember.observations[hour] === 'Generals' ? 'Gen' : staffMember.observations[hour] || '-';
      let originalObservation = staffMember.observations[hour] || '-'; // Keep the original for color coding
      return (
        <DragDropCell
  key={staffMember.name + hour}
  staffMember={staffMember}
  hour={hour}
  observation={staffMember.break === hour ? <strong className={styles.break}>Break</strong> : observation}
  originalObservation={originalObservation} 
  moveObservation={moveObservation}
  updateObservation={updateObservation}
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