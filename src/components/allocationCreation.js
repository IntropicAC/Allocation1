import React, {useRef, useEffect, useState, useMemo} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';
import DragDropToggle from './helperComponents/DragAndDropToggle';
import ColorToggleButton from './helperComponents/ColorToggleButton';
import UndoRedoButtons from './helperComponents/UndoRedoButtons';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Single DragDropCell component OUTSIDE of AllocationCreation

const DragDropCell = ({ 
  staffMember, 
  hour, 
  observation, 
  originalObservation, 
  moveObservation,
  updateObservation,
  editingCell,
  setEditingCell,
  editValue,
  setEditValue,
  dragDropEnabled,
  staff,
  styles,
  getObservationColor
}) => {
  const isEditing = editingCell === `${staffMember.name}-${hour}`;
  const cellRef = useRef(null);
  const combinedRef = useRef(null);
  const [localEditValue, setLocalEditValue] = useState('');
  
  // Drag functionality - always set up but conditionally enabled
  const [{ isDragging }, dragRef] = useDrag({
    type: 'observation',
    item: { sourceStaffName: staffMember.name, sourceHour: hour },
    canDrag: dragDropEnabled && !isEditing && staffMember.break !== hour,
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  }, [staffMember.name, hour, isEditing, dragDropEnabled, staffMember.break]);

  const [{ isOver }, dropRef] = useDrop({
    accept: ['observation', 'externalObservation', 'specialObservation'],
    canDrop: () => dragDropEnabled && staffMember.break !== hour,
    drop: (item, monitor) => {
      if (editingCell) {
        setEditingCell(null);
        setEditValue('');
      }
      
      const itemType = monitor.getItemType();
      if (itemType === 'externalObservation' || itemType === 'specialObservation') {
        updateObservation(staffMember.name, hour, item.observationName);
      } else if (itemType === 'observation') {
        moveObservation(item.sourceStaffName, item.sourceHour, staffMember.name, hour);
      }
    },
    collect: monitor => ({ isOver: !!monitor.isOver() && dragDropEnabled }),
  }, [dragDropEnabled, editingCell, staffMember.name, hour, moveObservation, updateObservation, staffMember.break]);

  // Combine refs
  useEffect(() => {
    if (dragDropEnabled) {
      dragRef(dropRef(combinedRef));
    }
  }, [dragDropEnabled, dragRef, dropRef]);
  
  const isBreak = staffMember.break === hour;
  const colorToUse = isBreak ? 'transparent' : getObservationColor(originalObservation);

  const handleCellClick = (e) => {
    if (isBreak || dragDropEnabled) return;
    
    e.stopPropagation();
    
    const cellId = `${staffMember.name}-${hour}`;
    
    // Save any other cell that was being edited
    if (editingCell && editingCell !== cellId) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      const currentStaffMember = staff.find(s => s.name === currentStaffName);
      const originalValue = currentStaffMember?.observations[parseInt(currentHour)] || '-';
      const normalizedEdit = editValue === '' ? '-' : editValue;
      
      if (originalValue !== normalizedEdit) {
        updateObservation(currentStaffName, parseInt(currentHour), normalizedEdit);
      }
    }
    
    // Start editing this cell
    const actualObservation = staffMember.observations[hour] || '-';
    const initialValue = actualObservation === "-" ? "" : actualObservation;
    setEditingCell(cellId);
    setEditValue(initialValue);
    setLocalEditValue(initialValue);
  };

  const handleBeforeInput = (e) => {
    // Prevent input if at max length
    const currentText = e.target.textContent || '';
    if (currentText.length >= 14 && e.inputType === 'insertText') {
      e.preventDefault();
      return false;
    }
  };

  const handleInput = (e) => {
    const text = (e.target.textContent || '').slice(0, 14);
    setLocalEditValue(text);
    setEditValue(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEditing();
      return;
    }
    
    // Allow all navigation and deletion keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Check length for other keys
    const currentLength = cellRef.current ? cellRef.current.textContent.length : 0;
    if (currentLength >= 14 && e.key.length === 1) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    finishEditing();
  };

  const finishEditing = () => {
    if (!isEditing) return;
    
    const originalValue = staffMember.observations[hour] || '-';
    const finalValue = localEditValue || editValue || '';
    const normalizedEdit = finalValue === '' ? '-' : finalValue;
    
    if (originalValue !== normalizedEdit) {
      updateObservation(staffMember.name, hour, normalizedEdit);
    }
    
    setEditingCell(null);
    setEditValue('');
    setLocalEditValue('');
  };

  // Set initial content and cursor position when entering edit mode
  useEffect(() => {
    if (isEditing && cellRef.current) {
      // Set the initial text content
      cellRef.current.textContent = localEditValue;
      
      // Focus and place cursor at end
      cellRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (cellRef.current.childNodes.length > 0) {
        const textNode = cellRef.current.firstChild;
        const position = textNode ? textNode.length : 0;
        range.setStart(textNode || cellRef.current, position);
        range.setEnd(textNode || cellRef.current, position);
      } else {
        range.selectNodeContents(cellRef.current);
        range.collapse(false);
      }
      
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing]); // Only run when isEditing changes

  // Sync local state when editingCell changes
  useEffect(() => {
    if (!isEditing) {
      setLocalEditValue('');
    }
  }, [isEditing]);

  // Break cells
  if (isBreak) {
    return (
      <td ref={combinedRef} style={{ backgroundColor: 'transparent', cursor: 'default' }}>
        <strong className={styles.break}>Break</strong>
      </td>
    );
  }

  // Draggable mode
  if (dragDropEnabled) {
    const cellStyle = isDragging ? styles.draggingCell : isOver ? styles.hoveringCell : '';
    return (
      <td 
        ref={combinedRef}
        className={cellStyle}
        style={{ 
          backgroundColor: colorToUse,
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1
        }}
      >
        {observation}
      </td>
    );
  }

  // Editable mode
  return (
    <td 
      ref={isEditing ? cellRef : combinedRef}
      onClick={handleCellClick}
      onBeforeInput={isEditing ? handleBeforeInput : undefined}
      onInput={isEditing ? handleInput : undefined}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      onBlur={isEditing ? handleBlur : undefined}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      style={{ 
        backgroundColor: colorToUse,
        cursor: isEditing ? 'text' : 'pointer',
        outline: "none",
        outlineOffset: '-2px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        userSelect: isEditing ? 'text' : 'none'
      }}
    >
      {!isEditing && observation}
    </td>
  );
};

function AllocationCreation({ 
  staff, 
  setStaff, 
  setTableRef, 
  observations, 
  setObservations, 
  selectedStartHour, 
  setSelectedStartHour,
  undo,
  redo,
  canUndo,
  canRedo,
  currentIndex,
  historyLength
}) {
  
  const [colorCodingEnabled, setColorCodingEnabled] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [dragDropEnabled, setDragDropEnabled] = useState(true);
  
  const localTableRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setDragDropEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // When drag/drop is turned ON, exit any editing mode (existing)
  useEffect(() => {
    if (dragDropEnabled && editingCell) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      updateObservation(currentStaffName, parseInt(currentHour), editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [dragDropEnabled]);

  // When drag/drop is turned ON, exit any editing mode
  useEffect(() => {
    if (dragDropEnabled && editingCell) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      updateObservation(currentStaffName, parseInt(currentHour), editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [dragDropEnabled]);

  useEffect(() => {
  if (localTableRef.current) {
    const container = localTableRef.current.parentElement;
    const table = localTableRef.current;
    const scaleX = container.clientWidth / table.scrollWidth;
    const scaleY = container.clientHeight / table.scrollHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Use zoom instead of transform scale
    table.style.zoom = scale;
  }
}, [staff, observations]);

  useEffect(() => {
    setTableRef(localTableRef.current);
  }, [setTableRef]);

  

  const observationColors = {
    0: '#FFE5E5', 1: '#E5F3FF', 2: '#FFF4E5', 3: '#E5FFE5', 4: '#F5E5FF',
    5: '#FFE5F5', 6: '#E5FFFF', 7: '#FFF5E5', 8: '#FFE5EB', 9: '#E5F5E5',
  };

  const getObservationColor = (observationName) => {
    if (!colorCodingEnabled || !observationName || observationName === '-') {
      return 'transparent';
    }
    const firstWord = observationName.split(/[\s-]/)[0];
    const index = observations.findIndex(obs => obs.name === firstWord);
    if (index === -1) return 'transparent';
    return observationColors[index % 10];
  };

  const countValidObservations = (staffObservations, observations) => {
    if (!staffObservations || typeof staffObservations !== 'object') {
      return 0;
    }
    const validNames = new Set(observations.map(obs => obs.name));
    return Object.values(staffObservations).filter(obs => validNames.has(obs) && obs !== '-').length;
  };

  function updateStaffNeeded(observationName, increment) {
    setObservations(prevObservations => {
      return prevObservations.map(obs => {
        if (obs.name === observationName) {
          let updatedStaffNeeded = increment ? obs.StaffNeeded + 1 : obs.StaffNeeded - 1;
          updatedStaffNeeded = Math.min(Math.max(updatedStaffNeeded, 0), obs.staff);
          return { ...obs, StaffNeeded: updatedStaffNeeded };
        }
        return obs;
      });
    });
  }

  const moveObservation = (sourceStaffName, sourceHour, targetStaffName, targetHour) => {
    setStaff(currentStaff => {
      const updatedStaff = currentStaff.map(member => ({
        ...member,
        observations: { ...member.observations }
      }));
      
      const sourceStaffIndex = updatedStaff.findIndex(s => s.name === sourceStaffName);
      const targetStaffIndex = updatedStaff.findIndex(s => s.name === targetStaffName);

      if (sourceStaffIndex === -1 || targetStaffIndex === -1) {
        return currentStaff;
      }

      const sourceStaff = updatedStaff[sourceStaffIndex];
      const targetStaff = updatedStaff[targetStaffIndex];

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

      if (sourceStaff.name !== targetStaff.name && targetStaff.break === targetHour) {
        return currentStaff;
      } else if (sourceStaff.break === sourceHour && sourceStaff.name !== targetStaff.name) {
        return currentStaff;
      }

      if (sourceStaff.break === sourceHour) {
        sourceStaff.break = targetHour;
      } else if (targetStaff.break === targetHour) {
        targetStaff.break = sourceHour;
      }

      const sourceIsHourEight = sourceHour === 8;
      const targetIsHourEight = targetHour === 8;

      if (sourceIsHourEight || targetIsHourEight) {
        let tempObservationId = sourceStaff.observations[sourceHour];
        if (sourceIsHourEight && targetIsHourEight) {
          sourceStaff.observationId = targetStaff.observations[targetHour];
          targetStaff.observationId = tempObservationId;
        } else if (sourceIsHourEight) {
          sourceStaff.observationId = targetStaff.observations[targetHour];
        } else if (targetIsHourEight) {
          targetStaff.observationId = tempObservationId;
        }
      }

      const tempObservation = sourceStaff.observations[sourceHour] || '-';
      sourceStaff.observations[sourceHour] = targetStaff.observations[targetHour] || '-';
      targetStaff.observations[targetHour] = tempObservation;

      return updatedStaff;
    });
  };

  const updateObservation = (staffName, hour, newObservation) => {
    setStaff(prevStaff => {
      const updatedStaff = prevStaff.map(staffMember => {
        if (staffMember.name === staffName) {
          if (staffMember.break === hour) {
            return staffMember;
          }
          if (hour === 8) {
            return {
              ...staffMember,
              observations: { ...staffMember.observations, [hour]: newObservation },
              observationId: newObservation
            };
          } else {
            return {
              ...staffMember,
              observations: { ...staffMember.observations, [hour]: newObservation }
            };
          }
        }
        return staffMember;
      });
      
      return updatedStaff;
    });
  };

  // Memoize sorted staff
  const sortedStaff = useMemo(() => {
    return [...staff]
      .filter(s => s && s.observations && typeof s.observations === 'object')
      .sort((a, b) => {
        const getPriority = (staffMember) => {
          if (staffMember.nurse === true) return 1;
          if (staffMember.security === true) return 2;
          return 3;
        };
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
      });
  }, [staff]);

  // DraggableObservationCell component
  const DraggableObservationCell = ({ observation }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'externalObservation',
      item: { observationName: observation.name },
      canDrag: () => dragDropEnabled,
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    }), [dragDropEnabled]);

    return (
      <div 
        ref={drag} 
        className={styles.obsCells} 
        style={{ 
          cursor: dragDropEnabled ? 'grab' : 'not-allowed',
          borderRadius: 10, 
          opacity: isDragging ? 0.3 : dragDropEnabled ? 1 : 0.6
        }}
      >
        {observation.name}
      </div>
    );
  };

  // DraggableXCell component
  const DraggableXCell = ({ value }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'specialObservation',
      item: { observationName: value },
      canDrag: () => dragDropEnabled,
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    }), [dragDropEnabled]);

    return (
      <div 
        ref={drag} 
        className={styles.obsCells} 
        style={{ 
          cursor: dragDropEnabled ? 'grab' : 'not-allowed',
          borderRadius: 10, 
          opacity: isDragging ? 0.3 : dragDropEnabled ? 1 : 0.6
        }}
      >
        {value}
      </div>
    );
  };

  return (
    <>
      <div className={styles.draggableObsContainer}>
        <div className={styles.undoRedoWrapper}>
          <UndoRedoButtons
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            currentIndex={currentIndex}
            historyLength={historyLength}
          />
        </div>

        <div className={styles.centeredItems}>
          <div>
            <DragDropToggle 
              dragDropEnabled={dragDropEnabled}
              setDragDropEnabled={setDragDropEnabled}
              
            />
          </div>

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
      </div>
    
      <div className={styles.tableContainer}>
        <table ref={localTableRef} className={styles.allocationTable}>
          <thead>
            <tr>
              <th>Time</th>
              {sortedStaff.map(staffMember => {
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
                    selectedStartHour === hour ? styles.selectedHour 
                    : selectedStartHour && hour >= selectedStartHour ? styles.affectedHour : ''
                  }`}
                  onClick={() => setSelectedStartHour(selectedStartHour === hour ? null : hour)}
                  style={{ cursor: 'pointer' }}
                >
                  {hour}:00
                </td>
                {sortedStaff.map(staffMember => {
                  let observation = staffMember.observations[hour] === 'Generals' ? 'Gen' : staffMember.observations[hour] || '-';
                  let originalObservation = staffMember.observations[hour] || '-';
                  return (
                    <DragDropCell
                      key={`${staffMember.id}-${hour}`}
                      staffMember={staffMember}
                      hour={hour}
                      observation={staffMember.break === hour ? <strong className={styles.break}>Break</strong> : observation}
                      originalObservation={originalObservation} 
                      moveObservation={moveObservation}
                      updateObservation={updateObservation}
                      editingCell={editingCell}
                      setEditingCell={setEditingCell}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      dragDropEnabled={dragDropEnabled}
                      staff={staff}
                      styles={styles}
                      getObservationColor={getObservationColor}
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