import React, {useRef, useEffect, useState, useMemo, useCallback} from 'react';
import styles from './allocationCreation.module.css';
import { useDrag, useDrop } from 'react-dnd';
import DragDropToggle from './helperComponents/DragAndDropToggle';
import ColorToggleButton from './helperComponents/ColorToggleButton';
import UndoRedoButtons from './helperComponents/UndoRedoButtons';
import SettingsButton from './helperComponents/SettingsButton';
import FormattingButtons from './helperComponents/FormattingButtons';

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
  getObservationColor,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelected,
  selectedCells, 
  setSelectedCells,
  customCellColor,
  customTextColor,
  customDecoration,
  
}) => {
  const isEditing = editingCell === `${staffMember.name}-${hour}`;
  const cellRef = useRef(null);
  const combinedRef = useRef(null);
  const [localEditValue, setLocalEditValue] = useState('');
  
  // Drag functionality - always set up but conditionally enabled
  const [{ isDragging }, dragRef] = useDrag({
    type: 'observation',
    item: { sourceStaffName: staffMember.name, sourceHour: hour },
    canDrag: dragDropEnabled && !isEditing,
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  }, [staffMember.name, hour, isEditing, dragDropEnabled]);

  const [{ isOver }, dropRef] = useDrop({
    accept: ['observation', 'externalObservation', 'specialObservation'],
    canDrop: (item, monitor) => {
      if (!dragDropEnabled) return false;
      
      const itemType = monitor.getItemType();
      
      if (itemType === 'observation' && item.sourceStaffName) {
        const sourceStaffMember = staff.find(s => s.name === item.sourceStaffName);
        const isSourceBreak = sourceStaffMember?.break === item.sourceHour;
        
        if (isSourceBreak) {
          return item.sourceStaffName === staffMember.name;
        }
      }
      
      return true;
    },
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
  }, [dragDropEnabled, editingCell, staffMember.name, hour, moveObservation, updateObservation, staff]);

  useEffect(() => {
    if (dragDropEnabled) {
      dragRef(dropRef(combinedRef));
    }
  }, [dragDropEnabled, dragRef, dropRef]);
  
  const isBreak = staffMember.break === hour;
  const colorToUse = isBreak ? 'transparent' : getObservationColor(originalObservation);

const handleMouseDown = (e) => {
  // Allow selection for break cells, but not drag/drop
  if (dragDropEnabled) return;
  
  if (e.button === 0) {
    const cellId = `${staffMember.name}-${hour}`;
    
    // Handle Ctrl+Click for individual cell selection (including break cells)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      // If we're editing, finish editing first
      if (editingCell) {
        const [currentStaffName, currentHour] = editingCell.split('-');
        const currentStaffMember = staff.find(s => s.name === currentStaffName);
        const originalValue = currentStaffMember?.observations[parseInt(currentHour)] || '-';
        const normalizedEdit = editValue === '' ? '-' : editValue;

        if (originalValue !== normalizedEdit) {
          updateObservation(currentStaffName, parseInt(currentHour), normalizedEdit);
        }
        
        setEditingCell(null);
        setEditValue('');
      }
      
      // Toggle this cell in the selection
      setSelectedCells(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(cellId)) {
          newSelected.delete(cellId);
        } else {
          newSelected.add(cellId);
        }
        return newSelected;
      });
      
      return;
    }
    
    // Don't allow editing break cells
    if (isBreak) return;
    
    let hasLeftCell = false;
    
    // If we're editing, only start multi-cell selection if mouse leaves this cell
    if (isEditing) {
      const handleMove = (moveEvent) => {
        const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const currentCell = target?.closest('td');
        const currentCellId = currentCell?.getAttribute('data-cell-id');
        
        // Only start multi-cell selection if we've actually left the starting cell
        if (currentCellId && currentCellId !== cellId) {
          hasLeftCell = true;
          finishEditing();
          onSelectionStart(staffMember.name, hour);
          document.removeEventListener('mousemove', handleMove);
        }
      };
      
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return;
    }
    
    // If not editing, only start selection if mouse leaves the cell
    if (editingCell !== cellId) {
      const handleMove = (moveEvent) => {
        const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const currentCell = target?.closest('td');
        const currentCellId = currentCell?.getAttribute('data-cell-id');
        
        // Only start selection if we've actually left the starting cell
        if (currentCellId && currentCellId !== cellId) {
          hasLeftCell = true;
          
          // Finish any active editing before starting selection
          if (editingCell) {
            const [currentStaffName, currentHour] = editingCell.split('-');
            const currentStaffMember = staff.find(s => s.name === currentStaffName);
            const originalValue = currentStaffMember?.observations[parseInt(currentHour)] || '-';
            const normalizedEdit = editValue === '' ? '-' : editValue;

            if (originalValue !== normalizedEdit) {
              updateObservation(currentStaffName, parseInt(currentHour), normalizedEdit);
            }
            
            setEditingCell(null);
            setEditValue('');
          }
          
          onSelectionStart(staffMember.name, hour);
          document.removeEventListener('mousemove', handleMove);
        }
      };
      
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    }
  }
};

  const handleMouseEnter = () => {
    if (dragDropEnabled || isEditing) return;
    // Allow selection to pass through break cells
    onSelectionMove(staffMember.name, hour);
  };

  const handleMouseUp = () => {
    if (dragDropEnabled || isEditing) return;
    onSelectionEnd();
  };
const handleCellClick = (e) => {
  if (dragDropEnabled) return;

  e.stopPropagation();

  const cellId = `${staffMember.name}-${hour}`;

  // Check if click came from formatting toolbar or color picker
  const isFromFormattingArea = e.target.closest('[data-formatting-toolbar]') || 
                               e.target.closest('[data-color-picker]');
  
  // If click is from formatting area, don't do anything
  if (isFromFormattingArea) {
    return; // EXIT EARLY - don't clear selection or change editing state
  }

  // If Ctrl/Cmd is held, don't clear selection or enter edit mode (handled by mouseDown)
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  // For break cells, just select them (don't enter edit mode)
  if (isBreak) {
    setSelectedCells(new Set([cellId]));
    // Clear any editing state
    if (editingCell) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      const currentStaffMember = staff.find(s => s.name === currentStaffName);
      const originalValue = currentStaffMember?.observations[parseInt(currentHour)] || '-';
      const normalizedEdit = editValue === '' ? '-' : editValue;

      if (originalValue !== normalizedEdit) {
        updateObservation(currentStaffName, parseInt(currentHour), normalizedEdit);
      }
      
      setEditingCell(null);
      setEditValue('');
    }
    return;
  }

  // Only clear selection if we're clicking to edit (not from formatting buttons)
  if (selectedCells && selectedCells.size > 0) {
    setSelectedCells(new Set());
  }

  // If we're already editing this cell, do nothing
  if (editingCell === cellId) return;

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
    
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
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

  useEffect(() => {
  if (isEditing && cellRef.current) {
    // Store current cursor position BEFORE updating content
    const sel = window.getSelection();
    let cursorPosition = 0;
    
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(cellRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorPosition = preCaretRange.toString().length;
    }
    
    // Only update textContent if it's different (prevents cursor jump on initial edit)
    const currentText = cellRef.current.textContent || '';
    if (currentText !== localEditValue) {
      cellRef.current.textContent = localEditValue;
    }
    
    // Restore cursor position
    cellRef.current.focus();
    const range = document.createRange();
    const newSel = window.getSelection();
    
    if (cellRef.current.childNodes.length > 0) {
      const textNode = cellRef.current.firstChild;
      const position = Math.min(cursorPosition, textNode.length);
      range.setStart(textNode, position);
      range.setEnd(textNode, position);
    } else {
      range.selectNodeContents(cellRef.current);
      range.collapse(false);
    }
    
    newSel.removeAllRanges();
    newSel.addRange(range);
  }
}, [isEditing, localEditValue]);

  useEffect(() => {
    if (!isEditing) {
      setLocalEditValue('');
    }
  }, [isEditing, localEditValue]);

  // Render break cell with formatting support
  if (isBreak) {
    return (
      
    <td 
      ref={combinedRef}
      data-cell-id={`${staffMember.name}-${hour}`}
      onClick={handleCellClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      style={{ 
        backgroundColor: customCellColor !== null ? customCellColor : 'transparent',
        backgroundImage: isSelected 
          ? 'linear-gradient(rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.25))' 
          : 'none',
        color: customTextColor !== null ? customTextColor : 'inherit',
        textDecoration: customDecoration?.underline ? 'underline' : 'none',
        fontWeight: customDecoration?.bold === false ? 'normal' : 'bold',  
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.15s, color 0.15s, background-image 0.15s',
      }}
    >
      Break
    </td>
    );
  }

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

  // Regular editable cells
  return (
    <td 
      ref={isEditing ? cellRef : combinedRef}
      data-cell-id={`${staffMember.name}-${hour}`}
      onClick={handleCellClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onBeforeInput={isEditing ? handleBeforeInput : undefined}
      onInput={isEditing ? handleInput : undefined}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      onBlur={isEditing ? handleBlur : undefined}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      style={{ 
        backgroundColor: customCellColor !== null ? customCellColor : colorToUse,
        backgroundImage: isSelected 
          ? 'linear-gradient(rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.25))' 
          : 'none',
        color: customTextColor !== null ? customTextColor : 'inherit',
        textDecoration: (customDecoration?.underline && observation !== '-') ? 'underline' : 'none',
        fontWeight: customDecoration?.bold ? 'bold' : 'normal',  // 👈 ADD THIS
        cursor: 'text',
        outline: "none",
        outlineOffset: '-2px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        userSelect: isEditing ? 'text' : 'none',
        verticalAlign: 'middle',  
        display: 'table-cell',
        transition: 'background-color 0.15s, color 0.15s, background-image 0.15s',
      }}
    >
      {!isEditing && observation}
    </td>
  );
};

// DragDropHeaderCell component for staff name headers
const DragDropHeaderCell = ({
  staffMember,
  index,
  totalObservations,
  onUpdateName,
  onSwapStaff,
  dragDropEnabled,
  staff,
  styles,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localEditValue, setLocalEditValue] = useState('');
  const headerRef = useRef(null);
  const combinedRef = useRef(null);

  const capitalizedStaffName = capitalizeFirstLetter(staffMember.name);
  const roleTag = staffMember.nurse ? ' (Nurse)' : staffMember.security ? ' (Sec)' : '';
  const displayText = `${capitalizedStaffName}${roleTag} - ${totalObservations}`;

  // Drag functionality
  const [{ isDragging }, dragRef] = useDrag({
    type: 'staffHeader',
    item: { staffId: staffMember.id, staffName: staffMember.name },
    canDrag: dragDropEnabled && !isEditing,
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  }, [staffMember.id, staffMember.name, isEditing, dragDropEnabled]);

  const [{ isOver }, dropRef] = useDrop({
    accept: 'staffHeader',
    canDrop: () => dragDropEnabled,
    drop: (item) => {
      if (item.staffId !== staffMember.id) {
        onSwapStaff(item.staffId, staffMember.id);
      }
    },
    collect: monitor => ({ isOver: !!monitor.isOver() && dragDropEnabled }),
  }, [dragDropEnabled, staffMember.id, onSwapStaff]);

  // Combine refs
  useEffect(() => {
    if (dragDropEnabled) {
      dragRef(dropRef(combinedRef));
    }
  }, [dragDropEnabled, dragRef, dropRef]);

  const handleClick = (e) => {
    if (dragDropEnabled) return;
    e.stopPropagation();
    setIsEditing(true);
    setLocalEditValue(staffMember.name);
  };

  const handleBeforeInput = (e) => {
    const currentText = e.target.textContent || '';
    if (currentText.length >= 10 && e.inputType === 'insertText') {
      e.preventDefault();
      return false;
    }
  };

  const handleInput = (e) => {
    const text = (e.target.textContent || '').slice(0, 10);
    setLocalEditValue(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEditing();
      return;
    }
    
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalEditValue('');
      return;
    }
    
    // Allow all navigation and deletion keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Check length for other keys
    const currentLength = headerRef.current ? headerRef.current.textContent.length : 0;
    if (currentLength >= 10 && e.key.length === 1) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    finishEditing();
  };

  const finishEditing = () => {
    if (!isEditing) return;
    
    const trimmedValue = localEditValue.trim();
    if (trimmedValue && trimmedValue !== staffMember.name) {
      onUpdateName(staffMember.id, trimmedValue);
    }
    
    setIsEditing(false);
    setLocalEditValue('');
  };

  // Set initial content and cursor position when entering edit mode
  useEffect(() => {
    if (isEditing && headerRef.current) {
      // Set the initial text content
      headerRef.current.textContent = localEditValue;
      
      // Focus and place cursor at end
      headerRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (headerRef.current.childNodes.length > 0) {
        const textNode = headerRef.current.firstChild;
        const position = textNode ? textNode.length : 0;
        range.setStart(textNode || headerRef.current, position);
        range.setEnd(textNode || headerRef.current, position);
      } else {
        range.selectNodeContents(headerRef.current);
        range.collapse(false);
      }
      
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing, localEditValue]);

  // Sync local state when isEditing changes
  useEffect(() => {
    if (!isEditing) {
      setLocalEditValue('');
    }
  }, [isEditing]);

  if (dragDropEnabled) {
    const cellStyle = isDragging ? styles.draggingCell : isOver ? styles.hoveringCell : '';
    return (
      <th
        ref={combinedRef}
        className={cellStyle}
        style={{
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {displayText}
      </th>
    );
  }

  // Editable mode (similar to DragDropCell)
  return (
    <th
      ref={isEditing ? headerRef : combinedRef}
      onClick={handleClick}
      onBeforeInput={isEditing ? handleBeforeInput : undefined}
      onInput={isEditing ? handleInput : undefined}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      onBlur={isEditing ? handleBlur : undefined}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      style={{
        cursor: isEditing ? 'text' : 'pointer',
        outline: 'none',
        outlineOffset: '-2px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        userSelect: isEditing ? 'text' : 'none',
        verticalAlign: 'middle',
        display: 'table-cell',
      }}
    >
      {!isEditing && displayText}
    </th>
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
  historyLength,
  isTransposed,          
  setIsTransposed,
  timeRange,
  setTimeRange,
  colorCodingEnabled,
  setColorCodingEnabled,
  dragDropEnabled,
  setDragDropEnabled,
  cellColors,
  setCellColors,
  textColors,
  setTextColors,
  cellDecorations,
  setCellDecorations,
}) {
  
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');


  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

  
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  

  const localTableRef = useRef(null);

  const updateObservation = useCallback((staffName, hour, newObservation) => {
    setStaff(prevStaff => {
      const updatedStaff = prevStaff.map(staffMember => {
        if (staffMember.name === staffName) {
          if (staffMember.break === hour) {
            return staffMember;
          }
          
          if (hour === 8) {
            const oldObservation = staffMember.observations[8];
            
            if (oldObservation && oldObservation !== "-") {
              setObservations(currentObservations => 
                currentObservations.map(obs => {
                  if (obs.name === oldObservation && obs.StaffNeeded < obs.staff) {
                    return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
                  }
                  return obs;
                })
              );
            }
            
            if (newObservation && newObservation !== "-") {
              setObservations(currentObservations => 
                currentObservations.map(obs => {
                  if (obs.name === newObservation && obs.StaffNeeded > 0) {
                    return { ...obs, StaffNeeded: obs.StaffNeeded - 1 };
                  }
                  return obs;
                })
              );
            }
          }
          
          return {
            ...staffMember,
            observations: { ...staffMember.observations, [hour]: newObservation }
          };
        }
        return staffMember;
      });
      
      return updatedStaff;
    });
  }, [setObservations, setStaff]);

  // NEW: Selection helper functions
  const getCellKey = (staffName, hour) => `${staffName}-${hour}`;

 const handleSelectionStart = useCallback((staffName, hour) => {
  // Finish any active editing before starting selection
  if (editingCell) {
    const [currentStaffName, currentHour] = editingCell.split('-');
    const currentStaffMember = staff.find(s => s.name === currentStaffName);
    if (currentStaffMember) {
      const originalValue = currentStaffMember.observations[parseInt(currentHour)] || '-';
      const normalizedEdit = editValue === '' ? '-' : editValue;

      if (originalValue !== normalizedEdit) {
        updateObservation(currentStaffName, parseInt(currentHour), normalizedEdit);
      }
    }
    
    setEditingCell(null);
    setEditValue('');
  }
  
  setIsSelecting(true);
  setSelectionStart({ staffName, hour });
  setSelectedCells(new Set([getCellKey(staffName, hour)]));
}, [editingCell, editValue, staff, updateObservation]);

 const handleSelectionMove = useCallback((staffName, hour) => {
  if (!isSelecting || !selectionStart) return;

  // Use the SAME sorting logic as sortedStaff
  const sortedStaffList = [...staff]
    .filter(s => s && s.observations && typeof s.observations === 'object')
    .sort((a, b) => {
      const getPriority = (staffMember) => {
        if (staffMember.nurse === true) return 1;
        if (staffMember.security === true) return 2;
        return 3;
      };
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      return priorityA - priorityB;
      // ✅ Removed name comparison to match sortedStaff
    });

  const hours = Array.from({ length: 12 }, (_, i) => 8 + i);

  const startStaffIndex = sortedStaffList.findIndex(s => s.name === selectionStart.staffName);
  const endStaffIndex = sortedStaffList.findIndex(s => s.name === staffName);
  const startHourIndex = hours.indexOf(selectionStart.hour);
  const endHourIndex = hours.indexOf(hour);

  if (startStaffIndex === -1 || endStaffIndex === -1 || startHourIndex === -1 || endHourIndex === -1) return;

  const minStaffIndex = Math.min(startStaffIndex, endStaffIndex);
  const maxStaffIndex = Math.max(startStaffIndex, endStaffIndex);
  const minHourIndex = Math.min(startHourIndex, endHourIndex);
  const maxHourIndex = Math.max(startHourIndex, endHourIndex);

  const newSelected = new Set();
  for (let si = minStaffIndex; si <= maxStaffIndex; si++) {
    for (let hi = minHourIndex; hi <= maxHourIndex; hi++) {
      newSelected.add(getCellKey(sortedStaffList[si].name, hours[hi]));
    }
  }
  setSelectedCells(newSelected);
}, [isSelecting, selectionStart, staff]);
  const handleSelectionEnd = useCallback(() => {
    setIsSelecting(false);
  }, []);

  const isCellSelected = useCallback((staffName, hour) => {
    return selectedCells.has(getCellKey(staffName, hour));
  }, [selectedCells]);

  const getCellBackgroundColor = useCallback((staffName, hour) => {
  const cellKey = getCellKey(staffName, hour);
  const color = cellColors[cellKey] || null;
  
  // Only log for cells that SHOULD have colors
  if (cellColors[cellKey] !== undefined) {
    console.log('🎨 getCellBackgroundColor:', {
      cellKey,
      foundColor: color,
      allColors: cellColors
    });
  }
  
  return color;
}, [cellColors]);

// NEW: Get text color
const getTextColor = useCallback((staffName, hour) => {
  const cellKey = getCellKey(staffName, hour);
  return textColors[cellKey] || null;
}, [textColors]);

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

  useEffect(() => {
    if (dragDropEnabled && editingCell) {
      const [currentStaffName, currentHour] = editingCell.split('-');
      updateObservation(currentStaffName, parseInt(currentHour), editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [dragDropEnabled, editingCell, editValue, updateObservation]);

  // NEW: Clear selection when drag/drop is enabled
  useEffect(() => {
    if (dragDropEnabled) {
      setSelectedCells(new Set());
      setIsSelecting(false);
    }
  }, [dragDropEnabled]);


useEffect(() => {
  const handleKeyPress = (e) => {
    // Only handle if we have multiple selected cells and not currently editing
    if (selectedCells.size === 0 || editingCell || dragDropEnabled) {
      return;
    }

    // Ignore special keys
    const ignoredKeys = ['Backspace', 'Delete', 'Enter', 'Escape', 'Tab', 
                        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                        'Home', 'End', 'PageUp', 'PageDown', 'Shift', 'Control', 
                        'Alt', 'Meta', 'CapsLock'];
    
    if (ignoredKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    e.preventDefault();

    // If it's a printable character, add it to all selected cells (except break cells)
    if (e.key.length === 1) {
      setStaff(prevStaff => {
        return prevStaff.map(staffMember => {
          const updates = {};
          let hasUpdates = false;
          
          selectedCells.forEach(cellKey => {
            const [staffName, hourStr] = cellKey.split('-');
            const hour = parseInt(hourStr);
            
            // Skip break cells
            if (staffName === staffMember.name && staffMember.break !== hour) {
              const oldValue = staffMember.observations[hour] || '-';
              const currentText = oldValue === '-' ? '' : oldValue;
              
              // Only add character if under 14 char limit
              if (currentText.length < 14) {
                const newValue = currentText + e.key;
                
                if (oldValue !== newValue) {
                  updates[hour] = newValue;
                  hasUpdates = true;
                  
                  // Handle hour 8 StaffNeeded updates
                  if (hour === 8) {
                    if (oldValue && oldValue !== "-") {
                      setObservations(currentObservations => 
                        currentObservations.map(obs => {
                          if (obs.name === oldValue && obs.StaffNeeded < obs.staff) {
                            return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
                          }
                          return obs;
                        })
                      );
                    }
                    
                    if (newValue && newValue !== "-") {
                      setObservations(currentObservations => 
                        currentObservations.map(obs => {
                          if (obs.name === newValue && obs.StaffNeeded > 0) {
                            return { ...obs, StaffNeeded: obs.StaffNeeded - 1 };
                          }
                          return obs;
                        })
                      );
                    }
                  }
                }
              }
            }
          });
          
          if (hasUpdates) {
            return {
              ...staffMember,
              observations: { ...staffMember.observations, ...updates }
            };
          }
          
          return staffMember;
        });
      });
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [selectedCells, editingCell, dragDropEnabled, setStaff, setObservations]);



useEffect(() => {
  const handleKeyDown = (e) => {
    // Only handle if we have selected cells and not currently editing
    if (selectedCells.size === 0 || editingCell || dragDropEnabled) {
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      
      // Backspace: Remove one character at a time from all selected cells (except breaks)
      setStaff(prevStaff => {
        return prevStaff.map(staffMember => {
          const updates = {};
          let hasUpdates = false;
          
          selectedCells.forEach(cellKey => {
            const [staffName, hourStr] = cellKey.split('-');
            const hour = parseInt(hourStr);
            
            // Skip break cells
            if (staffName === staffMember.name && staffMember.break !== hour) {
              const oldValue = staffMember.observations[hour] || '-';
              
              if (oldValue !== '-' && oldValue !== '') {
                const newValue = oldValue.slice(0, -1) || '-';
                updates[hour] = newValue;
                hasUpdates = true;
                
                // Handle hour 8 StaffNeeded updates
                if (hour === 8) {
                  if (oldValue && oldValue !== "-") {
                    setObservations(currentObservations => 
                      currentObservations.map(obs => {
                        if (obs.name === oldValue && obs.StaffNeeded < obs.staff) {
                          return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
                        }
                        return obs;
                      })
                    );
                  }
                  
                  if (newValue && newValue !== "-") {
                    setObservations(currentObservations => 
                      currentObservations.map(obs => {
                        if (obs.name === newValue && obs.StaffNeeded > 0) {
                          return { ...obs, StaffNeeded: obs.StaffNeeded - 1 };
                        }
                        return obs;
                      })
                    );
                  }
                }
              }
            }
          });
          
          if (hasUpdates) {
            return {
              ...staffMember,
              observations: { ...staffMember.observations, ...updates }
            };
          }
          
          return staffMember;
        });
      });
    } else if (e.key === 'Delete') {
      e.preventDefault();
      
      // Delete: Clear entire content of all selected cells (except breaks)
      setStaff(prevStaff => {
        const updatedStaff = prevStaff.map(staffMember => {
          const updates = {};
          let hasUpdates = false;
          
          selectedCells.forEach(cellKey => {
            const [staffName, hourStr] = cellKey.split('-');
            const hour = parseInt(hourStr);
            
            // Skip break cells
            if (staffName === staffMember.name && 
                staffMember.break !== hour && 
                staffMember.observations[hour] !== '-') {
              updates[hour] = '-';
              hasUpdates = true;
              
              // Handle hour 8 StaffNeeded updates
              if (hour === 8) {
                const oldObservation = staffMember.observations[8];
                if (oldObservation && oldObservation !== "-") {
                  setObservations(currentObservations => 
                    currentObservations.map(obs => {
                      if (obs.name === oldObservation && obs.StaffNeeded < obs.staff) {
                        return { ...obs, StaffNeeded: obs.StaffNeeded + 1 };
                      }
                      return obs;
                    })
                  );
                }
              }
            }
          });
          
          if (hasUpdates) {
            return {
              ...staffMember,
              observations: { ...staffMember.observations, ...updates }
            };
          }
          
          return staffMember;
        });
        
        return updatedStaff;
      });
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedCells, editingCell, dragDropEnabled, setStaff, setObservations]);

useEffect(() => {
  const handleClickOutside = (e) => {
    // Check if click is inside table
    if (localTableRef.current && localTableRef.current.contains(e.target)) {
      return;
    }
    
    // Check if click is on formatting toolbar or color pickers
    const isFormattingArea = e.target.closest('[data-formatting-toolbar]');
    const isColorPicker = e.target.closest('[data-color-picker]');
    
    // Only clear selection if clicking outside table and formatting UI
    if (!isFormattingArea && !isColorPicker) {
      setSelectedCells(new Set());
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  // NEW: Handle right-click context menu
useEffect(() => {
  const handleContextMenu = (e) => {
    // Only show context menu if we're in the table and have selected cells
    if (localTableRef.current && localTableRef.current.contains(e.target) && 
        selectedCells.size > 0 && !dragDropEnabled && !editingCell) {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  return () => document.removeEventListener('contextmenu', handleContextMenu);
}, [selectedCells, dragDropEnabled, editingCell]);

// NEW: Close context menu on click
useEffect(() => {
  const handleClick = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0 });
    }
  };

  if (contextMenu.visible) {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }
}, [contextMenu.visible]);

  // NEW: Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting]);

  useEffect(() => {
    if (localTableRef.current) {
      const container = localTableRef.current.parentElement;
      const table = localTableRef.current;
      const scaleX = container.clientWidth / table.scrollWidth;
      const scaleY = container.clientHeight / table.scrollHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
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

  const handleCellColorChange = useCallback((color) => {
  console.log('=== handleCellColorChange START ===');
  console.log('Color selected:', color);
  console.log('Selected cells:', Array.from(selectedCells));
  console.log('Current cellColors state BEFORE:', cellColors);
  
  const newColors = { ...cellColors };
  selectedCells.forEach(cellKey => {
    console.log('Processing cellKey:', cellKey);
    if (color === 'clear') {
      delete newColors[cellKey];
      console.log('Deleted color for:', cellKey);
    } else {
      newColors[cellKey] = color;
      console.log('Set color for:', cellKey, 'to:', color);
    }
  });
  
  console.log('New cellColors state AFTER:', newColors);
  setCellColors(newColors);
  console.log('setCellColors called');
  setContextMenu({ visible: false, x: 0, y: 0 });
  console.log('=== handleCellColorChange END ===');
}, [selectedCells, cellColors]);

// 2. Add useEffect to watch cellColors state changes:
useEffect(() => {
  console.log('📊 cellColors state changed:', cellColors);
}, [cellColors]);

// NEW: Handle text color
const handleTextColorChange = useCallback((color) => {
  const newColors = { ...textColors };
  selectedCells.forEach(cellKey => {
    if (color === 'clear') {
      delete newColors[cellKey];
    } else {
      newColors[cellKey] = color;
    }
  });
  setTextColors(newColors);
  setContextMenu({ visible: false, x: 0, y: 0 });
}, [selectedCells, textColors]);


// Update these handler functions:
const handleFormatTextColor = useCallback((color) => {
  // Apply to selected cells OR currently editing cell
  if (selectedCells.size > 0) {
    handleTextColorChange(color);
  } else if (editingCell) {
    const newColors = { ...textColors };
    if (color === 'clear') {
      delete newColors[editingCell];
    } else {
      newColors[editingCell] = color;
    }
    setTextColors(newColors);
  }
}, [selectedCells, editingCell, handleTextColorChange, textColors]);

// Add this after handleFormatUnderline
const handleFormatBold = useCallback(() => {
  if (selectedCells.size > 0) {
    const newDecorations = { ...cellDecorations };
    selectedCells.forEach(cellKey => {
      if (!newDecorations[cellKey]) {
        newDecorations[cellKey] = {};
      }
      // Toggle bold
      newDecorations[cellKey].bold = !newDecorations[cellKey].bold;
    });
    setCellDecorations(newDecorations);
  } else if (editingCell) {
    const newDecorations = { ...cellDecorations };
    if (!newDecorations[editingCell]) {
      newDecorations[editingCell] = {};
    }
    // Toggle bold
    newDecorations[editingCell].bold = !newDecorations[editingCell].bold;
    setCellDecorations(newDecorations);
  }
}, [selectedCells, editingCell, cellDecorations, setCellDecorations]);

const handleFormatUnderline = useCallback(() => {
  if (selectedCells.size > 0) {
    const newDecorations = { ...cellDecorations };
    selectedCells.forEach(cellKey => {
      if (!newDecorations[cellKey]) {
        newDecorations[cellKey] = {};
      }
      // Toggle underline
      newDecorations[cellKey].underline = !newDecorations[cellKey].underline;
    });
    setCellDecorations(newDecorations);
  } else if (editingCell) {
    const newDecorations = { ...cellDecorations };
    if (!newDecorations[editingCell]) {
      newDecorations[editingCell] = {};
    }
    // Toggle underline
    newDecorations[editingCell].underline = !newDecorations[editingCell].underline;
    setCellDecorations(newDecorations);
  }
}, [selectedCells, editingCell, cellDecorations]);

const getCellDecoration = useCallback((staffName, hour) => {
  const cellKey = getCellKey(staffName, hour);
  return cellDecorations[cellKey] || {};
}, [cellDecorations]);

const handleFormatFill = useCallback((color) => {
  // Apply to selected cells OR currently editing cell
  if (selectedCells.size > 0) {
    handleCellColorChange(color);
  } else if (editingCell) {
    const newColors = { ...cellColors };
    if (color === 'clear') {
      delete newColors[editingCell];
    } else {
      newColors[editingCell] = color;
    }
    setCellColors(newColors);
  }
}, [selectedCells, editingCell, handleCellColorChange, cellColors]);


  // NEW: Context Menu Component
// Replace your entire ContextMenu component with this fixed version:
const ContextMenu = () => {
  if (!contextMenu.visible) return null;

  const colorOptions = [
    { label: 'Red Fill', color: '#ffcccc', type: 'cell', emoji: '🔴' },
    { label: 'Green Fill', color: '#ccffcc', type: 'cell', emoji: '🟢' },
    { label: 'Blue Fill', color: '#cce5ff', type: 'cell', emoji: '🔵' },
    { label: 'Yellow Fill', color: '#fff4cc', type: 'cell', emoji: '🟡' },
    { label: 'Purple Fill', color: '#e5ccff', type: 'cell', emoji: '🟣' },
    { label: 'Orange Fill', color: '#ffe5cc', type: 'cell', emoji: '🟠' },
    { section: 'Text Colors' },
    { label: 'Red Text', color: '#cc0000', type: 'text', emoji: '🔴' },
    { label: 'Green Text', color: '#006600', type: 'text', emoji: '🟢' },
    { label: 'Blue Text', color: '#0066cc', type: 'text', emoji: '🔵' },
    { label: 'Orange Text', color: '#ff6600', type: 'text', emoji: '🟡' },
    { label: 'Purple Text', color: '#9933cc', type: 'text', emoji: '🟣' },
    { separator: true },
    { label: 'Clear Cell Color', color: 'clear', type: 'cell', emoji: '⚪' },
    { label: 'Clear Text Color', color: 'clear', type: 'text', emoji: '⚪' },
  ];

  return (
    <div
      data-context-menu="true"
      className={styles.contextMenu}
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className={styles.contextMenuHeader}>
        {selectedCells.size} cell{selectedCells.size !== 1 ? 's' : ''} selected
      </div>
      {colorOptions.map((item, idx) => {
        if (item.section) {
          return (
            <div key={idx} className={styles.contextMenuSection}>
              {item.section}
            </div>
          );
        }
        
        if (item.separator) {
          return <hr key={idx} className={styles.contextMenuSeparator} />;
        }
        
        return (
          <div
            key={idx}
            className={styles.contextMenuItem}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Context menu item clicked:', item);
              
              if (item.type === 'cell') {
                console.log('Calling handleCellColorChange with:', item.color);
                handleCellColorChange(item.color);
              } else {
                console.log('Calling handleTextColorChange with:', item.color);
                handleTextColorChange(item.color);
              }
            }}
          >
            {item.color !== 'clear' && item.type === 'cell' && (
              <span 
                className={styles.colorPreview}
                style={{ backgroundColor: item.color }}
              />
            )}
            {item.color !== 'clear' && item.type === 'text' && (
              <span 
                className={styles.colorPreview}
                style={{ 
                  backgroundColor: 'white',
                  border: `2px solid ${item.color}`,
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: item.color,
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>A</span>
              </span>
            )}
            {item.emoji} {item.label}
          </div>
        );
      })}
    </div>
  );
};

  const handleTimeRangeToggle = () => {
    setTimeRange(prev => prev === 'day' ? 'night' : 'day');
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

      const tempObservation = sourceStaff.observations[sourceHour] || '-';
      sourceStaff.observations[sourceHour] = targetStaff.observations[targetHour] || '-';
      targetStaff.observations[targetHour] = tempObservation;

      return updatedStaff;
    });
  };

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
      return priorityA - priorityB;
      // Removed the name comparison - staff will maintain their original order within each priority group
    });
}, [staff]);

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

  const handleUpdateStaffName = (staffId, newName) => {
    setStaff(currentStaff => {
      return currentStaff.map(member => {
        if (member.id === staffId) {
          return { ...member, name: newName };
        }
        return member;
      });
    });
  };

  const handleSwapStaff = (staffId1, staffId2) => {
    setStaff(currentStaff => {
      const staff1Index = currentStaff.findIndex(s => s.id === staffId1);
      const staff2Index = currentStaff.findIndex(s => s.id === staffId2);
      
      if (staff1Index === -1 || staff2Index === -1) return currentStaff;
      
      const newStaff = [...currentStaff];
      
      const tempName = newStaff[staff1Index].name;
      newStaff[staff1Index] = { ...newStaff[staff1Index], name: newStaff[staff2Index].name };
      newStaff[staff2Index] = { ...newStaff[staff2Index], name: tempName };
      
      return newStaff;
    });
  };

  const renderTable = () => {
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
    
    const getDisplayHour = (hour) => {
      if (timeRange === 'day') {
        return hour;
      } else {
        const nightHour = (hour + 12) % 24;
        return nightHour;
      }
    };
    
    const timeLabel = 'Time';
    
    if (!isTransposed) {
      return (
        <>
          <thead>
            <tr>
              <th 
                onClick={handleTimeRangeToggle}
                style={{ 
                  cursor: 'pointer',
                }}
                title="Click to toggle between Day (8-19) and Night (20-7) display"
              >
                {timeLabel}
              </th>
              {sortedStaff.map((staffMember, index) => {
                const totalObservations = countValidObservations(staffMember.observations, observations);
                return (
                  <DragDropHeaderCell
                    key={staffMember.id}
                    staffMember={staffMember}
                    index={index}
                    totalObservations={totalObservations}
                    onUpdateName={handleUpdateStaffName}
                    onSwapStaff={handleSwapStaff}
                    dragDropEnabled={dragDropEnabled}
                    staff={staff}
                    styles={styles}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td 
                  className={`${styles.hourCell} ${
                    selectedStartHour === hour ? styles.selectedHour 
                    : selectedStartHour && hour >= selectedStartHour ? styles.affectedHour : ''
                  }`}
                  onClick={() => setSelectedStartHour(selectedStartHour === hour ? null : hour)}
                  style={{ cursor: 'pointer' }}
                >
                  {getDisplayHour(hour)}:00
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
                      onSelectionStart={handleSelectionStart}
                      onSelectionMove={handleSelectionMove}
                      onSelectionEnd={handleSelectionEnd}
                      isSelected={isCellSelected(staffMember.name, hour)}
                      selectedCells={selectedCells} 
                      setSelectedCells={setSelectedCells}
                      customCellColor={getCellBackgroundColor(staffMember.name, hour)}  
                      customTextColor={getTextColor(staffMember.name, hour)}
                      customDecoration={getCellDecoration(staffMember.name, hour)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </>
      );
    } else {
      return (
        <>
          <thead>
            <tr>
              <th
                onClick={handleTimeRangeToggle}
                style={{ 
                  cursor: 'pointer',
                }}
                title="Click to toggle between Day (8-19) and Night (20-7) display"
              >
                {timeLabel}
              </th>
              {hours.map(hour => (
                <th 
                  key={hour}
                  className={`${
                    selectedStartHour === hour ? styles.selectedHour 
                    : selectedStartHour && hour >= selectedStartHour ? styles.affectedHour : ''
                  }`}
                  onClick={() => setSelectedStartHour(selectedStartHour === hour ? null : hour)}
                  style={{ cursor: 'pointer' }}
                >
                  {getDisplayHour(hour)}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStaff.map((staffMember, index) => {
              const totalObservations = countValidObservations(staffMember.observations, observations);
              
              return (
                <tr key={staffMember.id}>
                  <DragDropHeaderCell
                    staffMember={staffMember}
                    index={index}
                    totalObservations={totalObservations}
                    onUpdateName={handleUpdateStaffName}
                    onSwapStaff={handleSwapStaff}
                    dragDropEnabled={dragDropEnabled}
                    staff={staff}
                    styles={styles}
                  />
                  {hours.map(hour => {
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
                        onSelectionStart={handleSelectionStart}
                        onSelectionMove={handleSelectionMove}
                        onSelectionEnd={handleSelectionEnd}
                        isSelected={isCellSelected(staffMember.name, hour)}
                        selectedCells={selectedCells}  
                        setSelectedCells={setSelectedCells}  
                        customCellColor={getCellBackgroundColor(staffMember.name, hour)}
                        customTextColor={getTextColor(staffMember.name, hour)} 
                        customDecoration={getCellDecoration(staffMember.name, hour)}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </>
      );
    }
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
    <FormattingButtons
      onTextColorChange={handleFormatTextColor}
      onUnderlineToggle={handleFormatUnderline}
      onBoldToggle={handleFormatBold}  // 👈 ADD THIS
      onFillColorChange={handleFormatFill}
      hasSelection={selectedCells.size > 0 || editingCell !== null}
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

        <SettingsButton 
          isTransposed={isTransposed}
          setIsTransposed={setIsTransposed}
        />
      </div>
    
      <div className={styles.tableContainer}>
        <table ref={localTableRef} className={styles.allocationTable}>
          {renderTable()}
        </table>
      </div>
      <ContextMenu />
    </>
  );
}

export default AllocationCreation;