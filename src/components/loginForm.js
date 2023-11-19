import React, { useState } from 'react';
import styles from './loginForm.module.css';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Alex' && password === 'Allocation') {
      onLoginSuccess();
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <label className={styles.loginLabel}>
        Username:
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className={styles.loginInput} 
        />
      </label>
      <label className={styles.loginLabel}>
        Password:
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className={styles.loginInput}
        />
      </label>
      <button type="submit" className={styles.loginButton}>Log In</button>
    </form>
  );
}

export default LoginForm;
