import React from 'react';
import MainPage from './components/mainPage';
import LoginForm from './components/loginForm';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [observations, setObservations, clearObservations] = useLocalStorage('observations', [], '1.0');
  const [staff, setStaff, clearStaff] = useLocalStorage('staff', [], '1.0');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Function to clear all cached data
  const clearAllData = () => {
    clearObservations();
    clearStaff();
  };

  return (
    <>{/*
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (*/}
        <MainPage 
          observations={observations} 
          setObservations={setObservations} 
          staff={staff} 
          setStaff={setStaff}
          clearAllData={clearAllData}
        />
      {/*)}*/}
    </>
  );
}

export default App;