import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewDepartments.css';

const ViewDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/view-departments', {
        params: {
          q: searchTerm.trim()
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearch = () => {
    fetchDepartments();
  };

  const handleDelete = async (did) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`http://localhost:5000/department/${did}`);
        fetchDepartments();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleEdit = (did, currentName) => {
    setEditId(did);
    setEditedName(currentName);
    setShowEditForm(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/department/${editId}`, { name: editedName });
      setEditId(null);
      setEditedName('');
      setShowEditForm(false);
      fetchDepartments();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditedName('');
    setShowEditForm(false);
  };

  return (
    <div className="view-departments-container">
      <h2>Department List</h2>

      {/* Unified search box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by DID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Edit popup */}
      {showEditForm && (
        <div className="edit-form-overlay">
          <div className="edit-form">
            <h3>Edit Department</h3>
            <label>Department ID:</label>
            <input type="text" value={editId} readOnly />
            <label>Department Name:</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <div className="edit-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Department Table */}
      <table>
        <thead>
          <tr>
            <th>Department ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.DID}>
              <td>{dept.DID}</td>
              <td>{dept.NAME}</td>
              <td>
                <button onClick={() => handleEdit(dept.DID, dept.NAME)}>Edit</button>
                <button onClick={() => handleDelete(dept.DID)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewDepartments;
