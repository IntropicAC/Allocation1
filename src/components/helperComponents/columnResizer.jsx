import React, { useRef, useEffect } from 'react';

const ColumnResizer = ({ 
  columnIndex, 
  onResize, 
  minWidth = 60,
  maxWidth = 400 
}) => {
  const resizerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      startXRef.current = e.clientX;
      
      // Get the current width of the column
      const th = resizer.parentElement;
      startWidthRef.current = th.offsetWidth;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Add visual feedback
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(
        minWidth, 
        Math.min(maxWidth, startWidthRef.current + diff)
      );
      
      onResize(columnIndex, newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Remove visual feedback
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    resizer.addEventListener('mousedown', handleMouseDown);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [columnIndex, onResize, minWidth, maxWidth]);

  return (
    <div
      ref={resizerRef}
      style={{
        position: 'absolute',
        top: 0,
        right: -3,
        width: '6px',
        height: '100%',
        cursor: 'col-resize',
        zIndex: 1000,
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    />
  );
};

export default ColumnResizer;