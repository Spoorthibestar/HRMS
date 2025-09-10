import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

function FacultyResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const eid = location.state?.eid;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('❌ New passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/faculty-update-password', {
        eid,
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        setMessage('✅ Password updated successfully');
        setTimeout(() => navigate(-1), 1500); // Go back after 1.5 seconds on success
      } else {
        setMessage(`❌ ${response.data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Server error. Try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2>Change Password</h2>
      <form onSubmit={handlePasswordChange} className="password-form">
        <div className="form-group">
          <label>Current Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="submit-btn">Update Password</button>
          <button 
            type="button" 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </form>
      {message && <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</p>}
    </div>
  );
}

export default FacultyResetPassword;