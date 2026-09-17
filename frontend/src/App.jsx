<<<<<<< HEAD
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
=======
import React, { useState } from 'react';

>>>>>>> b2c7100106763dd66bc53fb3828381fc704d2f99
function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Flask API base URL
  const API_BASE = 'http://127.0.0.1:5000/api';

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegistering ? `${API_BASE}/register` : `${API_BASE}/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          alert('Registration successful! Please log in.');
          setIsRegistering(false);
        } else {
          setCurrentUser(username);
          fetchUsers(username);
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to the backend server.');
      console.error(err);
    }
  };

  const fetchUsers = async (user) => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'X-Username': user }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setUsers([]);
  };

  // If user is logged in, show the protected dashboard
  if (currentUser) {
    return (
      <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
        <h2>Welcome, {currentUser}! 🎉</h2>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
        >
          Logout
        </button>
        <h3>Protected Users List:</h3>
        <ul style={{ background: '#f8f9fa', padding: '20px', borderRadius: '5px', listStyleType: 'none' }}>
          {users.map((u, index) => (
            <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #dee2e6' }}>
              👤 {typeof u === 'string' ? u : u.username}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Otherwise, show the Login / Register form
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', fontFamily: 'Arial, sans-serif', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isRegistering ? 'Register' : 'Login'}</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label><br />
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginTop: '5px' }}
          />
        </div>
        
        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {isRegistering ? 'Already have an account?' : "Need an account?"}{' '}
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
          style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
        >
          {isRegistering ? 'Login here' : 'Register here'}
        </button>
      </p>
    </div>
  );
}

App export default App; // Wait, keep standard export format below:
export default App;
