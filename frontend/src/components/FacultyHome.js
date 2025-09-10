import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FacultyHome.css';

function FacultyHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state && location.state.facultyData) {
      // If coming from login, get from state
      setFaculty(location.state.facultyData);
      setLoading(false);
      setError('');
    } else {
      // If direct access or refresh, fetch by EID from URL
      const eidFromUrl = location.pathname.split('/').pop();
      if (eidFromUrl && !isNaN(eidFromUrl)) {
        const fetchFacultyData = async () => {
          try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/faculty/${eidFromUrl}`);
            setFaculty(response.data);
            setError('');
          } catch (err) {
            console.error("Failed to fetch faculty data:", err);
            setError('Failed to load faculty data. Please log in again.');
            setFaculty(null);
          } finally {
            setLoading(false);
          }
        };
        fetchFacultyData();
      } else {
        setLoading(false);
        setError('Faculty ID not found. Please log in again.');
      }
    }
  }, [location.state, location.pathname]);

  if (loading) {
    return (
      <div className="faculty-home-container">
        <div>Loading faculty details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-home-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="faculty-home-container">
        <div>No faculty data found.</div>
      </div>
    );
  }

  const handleChangePassword = () => {
    navigate('/faculty-reset-password', {
      state: { eid: faculty.EID },
    });
  };

  const handleApplyLeave = () => {
    navigate('/apply-leave', {
      state: {
        facultyData: faculty,
        facultyEID: faculty.EID,
      },
    });
  };

  const handleViewLeave = () => {
    navigate('/faculty/view-leave', {
      state: { facultyEID: faculty.EID },
    });
  };

  const handleViewSalary = () => {
    navigate(`/faculty-salary/${faculty.EID}`, {
      state: { eid: faculty.EID, firstname: faculty.FIRSTNAME }
    });
  };

  const handlePayroll = () => {
    navigate('/payroll', {
      state: { facultyEID: faculty.EID, firstname: faculty.FIRSTNAME }
    });
  };

  return (
    <div className="faculty-home-container">
      <h2>Welcome, {faculty.FIRSTNAME}</h2>
      <div className="button-group">
        <button
          onClick={() =>
            navigate(`/faculty-dashboard/${faculty.EID}`, {
              state: { facultyData: faculty },
            })
          }
        >
          View Details
        </button>
        <button onClick={handleApplyLeave}>Apply for Leave</button>
        <button onClick={handleViewSalary}>View Salary</button>
        <button onClick={handleChangePassword}>Change Password</button>
        <button onClick={handleViewLeave}>View My Leaves</button>
        {/* New Payroll Button */}
        <button onClick={handlePayroll}>Payroll</button>
      </div>
    </div>
  );
}

export default FacultyHome;
