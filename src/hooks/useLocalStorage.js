import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue, version = '1.0') {
  const versionKey = `${key}Version`;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const savedVersion = localStorage.getItem(versionKey);
      
      if (savedVersion !== version) {
        console.log(`${key} version mismatch. Clearing old data.`);
        localStorage.removeItem(key);
        localStorage.setItem(versionKey, version);
        return initialValue;
      }
      
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      localStorage.removeItem(key);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
      localStorage.setItem(versionKey, version);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [key, storedValue, version, versionKey]);

  // Return a clear function as well
  const clearStorage = () => {
    localStorage.removeItem(key);
    localStorage.removeItem(versionKey);
    setStoredValue(initialValue);
  };

  return [storedValue, setStoredValue, clearStorage];
}

export default useLocalStorage;