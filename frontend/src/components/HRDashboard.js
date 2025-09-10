import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HRDashboard.css';

const HRDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h2>Welcome to HR Dashboard</h2>
      <div className="dashboard-buttons">
        <button onClick={() => navigate('/add-employee')}>Add Employee</button>
        <button onClick={() => navigate('/view-employees')}>View Employees</button>
        <button onClick={() => navigate('/add-department')}>Add Department</button>
        <button onClick={() => navigate('/view-departments')}>View Departments</button>
        <button onClick={() => navigate('/add-salary')}>Add Salary</button>
        <button onClick={() => navigate('/view-salary')}>View Salary </button>
        <button onClick={() => navigate('/assign-leave')}>Assign Leave</button>
        <button onClick={() => navigate('/hr/view-leave')}>View Leave</button>  
      </div>
    </div>
  );
};

export default HRDashboard;
