import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [role, setRole] = useState('HR');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    if (role === 'HR') {
      const response = await axios.post('http://localhost:5000/login', {
        userId,
        password
      });

      if (response.data.success) {
        setMessage('✅ HR login successful!');
        setTimeout(() => navigate('/hr-dashboard'), 1000);
      } else {
        setMessage('❌ Invalid HR credentials');
      }

    } else {
      const response = await axios.post('http://localhost:5000/faculty-login', {
        eid: userId,
        password
      });

      if (response.data.success) {
        setMessage('✅ Faculty login successful!');
        
        // 👇👇 Navigate to faculty-home and pass the data
        setTimeout(() => {
          navigate('/faculty-home', {
            state: { facultyData: response.data.faculty }
          });
        }, 1000);
      } else {
        setMessage('❌ Invalid Faculty credentials');
      }
    }

  } catch (err) {
    setMessage('⚠ Server error. Try again.');
  }
};

  return (
    <div className="login-container">
      <h2>HRMS Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="HR">HR</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>
        <div>
          <label>{role === 'HR' ? 'User ID:' : 'Faculty ID (EID):'}</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;