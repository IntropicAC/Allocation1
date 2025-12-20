import React from 'react';
import styles from './ColorPicker.module.css';

// Single shared color palette - organized in COLUMNS (top to bottom)
export const colorPalette = [
  // Column 1 - Red shades (dark to lightest, top to bottom)
  { name: 'Red', color: '#CC0000' },
  { name: 'Light Red', color: '#FF4444' },
  { name: 'Lighter Red', color: '#FF7777' },
  { name: 'Pale Red', color: '#FFAAAA' },
  { name: 'Very Pale Red', color: '#FFDDDD' },

  // Column 2 - Orange shades
  { name: 'Orange', color: '#FF6600' },
  { name: 'Light Orange', color: '#FF8833' },
  { name: 'Lighter Orange', color: '#FFAA66' },
  { name: 'Pale Orange', color: '#FFCC99' },
  { name: 'Very Pale Orange', color: '#FFE5CC' },

  // Column 3 - Yellow shades
  { name: 'Yellow', color: '#FFCC00' },
  { name: 'Light Yellow', color: '#FFDD33' },
  { name: 'Lighter Yellow', color: '#FFEE66' },
  { name: 'Pale Yellow', color: '#FFFF99' },
  { name: 'Very Pale Yellow', color: '#FFFFCC' },

  // Column 4 - Green shades
  { name: 'Green', color: '#006600' },
  { name: 'Light Green', color: '#009900' },
  { name: 'Lighter Green', color: '#33CC33' },
  { name: 'Pale Green', color: '#66FF66' },
  { name: 'Very Pale Green', color: '#CCFFCC' },

  // Column 5 - Teal shades
  { name: 'Teal', color: '#008B8B' },
  { name: 'Light Teal', color: '#20B2AA' },
  { name: 'Lighter Teal', color: '#48D1CC' },
  { name: 'Pale Teal', color: '#7FFFD4' },
  { name: 'Very Pale Teal', color: '#CCFFFF' },

  // Column 6 - Blue shades
  { name: 'Blue', color: '#0066CC' },
  { name: 'Light Blue', color: '#3399FF' },
  { name: 'Lighter Blue', color: '#66B3FF' },
  { name: 'Pale Blue', color: '#99CCFF' },
  { name: 'Very Pale Blue', color: '#CCE5FF' },

  // Column 7 - Purple shades
  { name: 'Purple', color: '#9933CC' },
  { name: 'Light Purple', color: '#B366FF' },
  { name: 'Lighter Purple', color: '#CC99FF' },
  { name: 'Pale Purple', color: '#E6CCFF' },
  { name: 'Very Pale Purple', color: '#F5E6FF' },

  // Column 8 - Pink shades
  { name: 'Pink', color: '#FF0080' },
  { name: 'Light Pink', color: '#FF3399' },
  { name: 'Lighter Pink', color: '#FF66B3' },
  { name: 'Pale Pink', color: '#FF99CC' },
  { name: 'Very Pale Pink', color: '#FFCCEE' },

  // Column 9 - Gray shades
  { name: 'Dark Gray', color: '#333333' },
  { name: 'Gray', color: '#666666' },
  { name: 'Light Gray', color: '#999999' },
  { name: 'Pale Gray', color: '#CCCCCC' },
  { name: 'Very Pale Gray', color: '#EEEEEE' },

  // Column 10 - Brown shades
  { name: 'Brown', color: '#996633' },
  { name: 'Light Brown', color: '#CC9966' },
  { name: 'Lighter Brown', color: '#DDBB99' },
  { name: 'Pale Brown', color: '#F0D9B5' },
  { name: 'Very Pale Brown', color: '#F5E6D3' },
];

const ColorPicker = ({ onSelect, onClear }) => (
  <div className={styles.colorPicker} data-color-picker="true">
    <div className={styles.colorGrid}>
      {colorPalette.map((item, idx) => (
        <div
          key={idx}
          className={styles.colorOption}
          style={{ backgroundColor: item.color }}
          onMouseDown={(e) => {
            e.preventDefault();
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
          e.preventDefault();
          onClear();
        }}
      >
        Clear
      </button>
    </div>
  </div>
);

export default ColorPicker;
