import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddDepartment.css';

const AddDepartment = () => {
  const [did, setDid] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewDID = async () => {
      try {
        const response = await axios.get('http://localhost:5000/generate-did');
        setDid(response.data.did);
      } catch (error) {
        console.error('Failed to fetch DID:', error);
        setMessage('⚠️ Failed to fetch new Department ID');
      }
    };

    fetchNewDID();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/add-department', {
        did,
        name: departmentName,
      });

      if (response.data.success) {
        setShowPopup(true);
      } else {
        setMessage('❌ Failed to add department');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error while adding department');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate(-1);
  };

  return (
    <div className="add-department-container">
      <h2>Add Department</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Department ID:</label>
          <input type="text" value={did} readOnly />
        </div>
        <div className="form-group">
          <label>Department Name:</label>
          <input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Department</button>
      </form>
      <p>{message}</p>

      {/* ✅ Show popup only if showPopup is true */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <p>✅ Department added successfully!</p>
            <button className="popup-close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDepartment;
