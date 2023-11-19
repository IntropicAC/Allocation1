import React, { useState } from 'react';
import MainPage from './components/mainPage';
import LoginForm from './components/loginForm';

function App() {
  const [observations, setObservations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MainPage 
          observations={observations} 
          setObservations={setObservations} 
          staff={staff} 
          setStaff={setStaff}
        />
      )}
    </>
  );
}

export default App;
