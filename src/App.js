//App.js
import React, { useState } from 'react';
import MainPage from './components/mainPage';

function App() {

const [observations, setObservations] = useState([]);
const [staff, setStaff] = useState([]);

  return (
    <>
      <MainPage observations={observations} setObservations={setObservations} staff={staff} setStaff={setStaff}/>
    </>
  );
}

export default App;
