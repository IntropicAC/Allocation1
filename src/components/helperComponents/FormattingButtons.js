import React, { useState, useRef, useEffect } from 'react';
import styles from './FormattingButtons.module.css';

const FormattingButtons = ({ 
  onTextColorChange, 
  onUnderlineToggle, 
  onHighlightChange, 
  onFillColorChange,
  hasSelection 
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFillPicker, setShowFillPicker] = useState(false);
  
  const textColorRef = useRef(null);
  const highlightRef = useRef(null);
  const fillRef = useRef(null);

  // Single shared color palette with 10 colors x 5 shades each
 // Single shared color palette - organized in COLUMNS (top to bottom)
const colorPalette = [
  // Column 1 - Red shades (darkest to lightest, top to bottom)
  { name: 'Dark Red', color: '#8B0000' },
  { name: 'Red', color: '#CC0000' },
  { name: 'Light Red', color: '#FF4444' },
  { name: 'Lighter Red', color: '#FF7777' },
  { name: 'Pale Red', color: '#FFAAAA' },
  
  // Column 2 - Orange shades
  { name: 'Dark Orange', color: '#CC4400' },
  { name: 'Orange', color: '#FF6600' },
  { name: 'Light Orange', color: '#FF8833' },
  { name: 'Lighter Orange', color: '#FFAA66' },
  { name: 'Pale Orange', color: '#FFCC99' },
  
  // Column 3 - Yellow shades
  { name: 'Dark Yellow', color: '#CC9900' },
  { name: 'Yellow', color: '#FFCC00' },
  { name: 'Light Yellow', color: '#FFDD33' },
  { name: 'Lighter Yellow', color: '#FFEE66' },
  { name: 'Pale Yellow', color: '#FFFF99' },
  
  // Column 4 - Green shades
  { name: 'Dark Green', color: '#004400' },
  { name: 'Green', color: '#006600' },
  { name: 'Light Green', color: '#009900' },
  { name: 'Lighter Green', color: '#33CC33' },
  { name: 'Pale Green', color: '#66FF66' },
  
  // Column 5 - Teal shades
  { name: 'Dark Teal', color: '#006666' },
  { name: 'Teal', color: '#008B8B' },
  { name: 'Light Teal', color: '#20B2AA' },
  { name: 'Lighter Teal', color: '#48D1CC' },
  { name: 'Pale Teal', color: '#7FFFD4' },
  
  // Column 6 - Blue shades
  { name: 'Dark Blue', color: '#003399' },
  { name: 'Blue', color: '#0066CC' },
  { name: 'Light Blue', color: '#3399FF' },
  { name: 'Lighter Blue', color: '#66B3FF' },
  { name: 'Pale Blue', color: '#99CCFF' },
  
  // Column 7 - Purple shades
  { name: 'Dark Purple', color: '#660099' },
  { name: 'Purple', color: '#9933CC' },
  { name: 'Light Purple', color: '#B366FF' },
  { name: 'Lighter Purple', color: '#CC99FF' },
  { name: 'Pale Purple', color: '#E6CCFF' },
  
  // Column 8 - Pink shades
  { name: 'Dark Pink', color: '#CC0066' },
  { name: 'Pink', color: '#FF0080' },
  { name: 'Light Pink', color: '#FF3399' },
  { name: 'Lighter Pink', color: '#FF66B3' },
  { name: 'Pale Pink', color: '#FF99CC' },
  
  // Column 9 - Gray shades
  { name: 'Black', color: '#000000' },
  { name: 'Dark Gray', color: '#333333' },
  { name: 'Gray', color: '#666666' },
  { name: 'Light Gray', color: '#999999' },
  { name: 'Pale Gray', color: '#CCCCCC' },
  
  // Column 10 - Brown shades
  { name: 'Dark Brown', color: '#663300' },
  { name: 'Brown', color: '#996633' },
  { name: 'Light Brown', color: '#CC9966' },
  { name: 'Lighter Brown', color: '#DDBB99' },
  { name: 'Pale Brown', color: '#F0D9B5' },
];

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textColorRef.current && !textColorRef.current.contains(e.target)) {
        setShowTextColorPicker(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target)) {
        setShowHighlightPicker(false);
      }
      if (fillRef.current && !fillRef.current.contains(e.target)) {
        setShowFillPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ColorPicker = ({ onSelect, onClear }) => (
    <div className={styles.colorPicker} data-color-picker="true">
      <div className={styles.colorGrid}>
        {colorPalette.map((item, idx) => (
          <div
            key={idx}
            className={styles.colorOption}
            style={{ backgroundColor: item.color }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent blur
              onSelect(item.color);
            }}
            title={item.name}
          />
        ))}
      </div>
      <div className={styles.colorPickerFooter}>
        <button 
          className={styles.clearButton}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur
            onClear();
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.formattingToolbar} data-formatting-toolbar="true">
      {/* Text Color Button */}
      <div className={styles.buttonWrapper} ref={textColorRef}>
        <button
          className={styles.formatButton}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur
            setShowTextColorPicker(!showTextColorPicker);
          }}
          title="Text color"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2L3 14h2l1.2-3h3.6L11 14h2L8 2zm0 3.5L9.5 9h-3l1.5-3.5z"/>
            <rect x="3" y="14" width="10" height="2" fill="#cc0000"/>
          </svg>
        </button>
        {showTextColorPicker && (
          <ColorPicker 
            onSelect={(color) => {
              onTextColorChange(color);
              setShowTextColorPicker(false);
            }}
            onClear={() => {
              onTextColorChange('clear');
              setShowTextColorPicker(false);
            }}
          />
        )}
      </div>

      {/* Underline Button */}
      <button
        className={styles.formatButton}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent blur
          onUnderlineToggle();
        }}
        title="Underline"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2v6c0 2.2 1.8 4 4 4s4-1.8 4-4V2h-1.5v6c0 1.4-1.1 2.5-2.5 2.5S5.5 9.4 5.5 8V2H4z"/>
          <rect x="3" y="14" width="10" height="1"/>
        </svg>
      </button>

      {/* Fill Color Button */}
      <div className={styles.buttonWrapper} ref={fillRef}>
        <button
          className={styles.formatButton}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur
            setShowFillPicker(!showFillPicker);
          }}
          title="Cell fill color"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 6c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h12zM3 8v5h10V8H3z"/>
            <rect x="3" y="2" width="10" height="1.5"/>
            <rect x="2" y="13" width="12" height="1.5" fill="#cce5ff"/>
          </svg>
        </button>
        {showFillPicker && (
          <ColorPicker 
            onSelect={(color) => {
              onFillColorChange(color);
              setShowFillPicker(false);
            }}
            onClear={() => {
              onFillColorChange('clear');
              setShowFillPicker(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FormattingButtons;