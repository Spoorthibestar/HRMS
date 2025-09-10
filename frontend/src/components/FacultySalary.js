import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FacultySalary.css';

function FacultySalary() {
  const location = useLocation();
  const navigate = useNavigate();
  // Destructure the firstname from location.state for a friendly display.
  // The eid is used for the API call.
  const { eid, firstname } = location.state || {};
  const [salaryData, setSalaryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure an employee ID is available before making the API call.
    if (!eid) {
      setError("No faculty ID provided.");
      return;
    }

    // Fetch the salary data from the backend. The backend has been updated
    // to include PF, TDS, and NET_SALARY.
    axios.get(`http://localhost:5000/api/faculty/salary/${eid}`)
      .then(res => {
        // Check if the response contains data.
        if (res.data) {
          setSalaryData(res.data);
        } else {
          setError("No salary data found.");
        }
      })
      .catch(err => {
        console.error("Error fetching salary data:", err);
        // Display a user-friendly error message if the fetch fails.
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Failed to fetch salary data.");
        }
      });
  }, [eid]); // Re-run the effect if the employee ID changes.

  return (
    <div className="salary-container">
      <div className="salary-card">
        <h2>Salary Details for {firstname || "Faculty"}</h2>

        {/* Display an error message if one exists */}
        {error && <p className="error-message">{error}</p>}

        {/* Render the salary table only if data is available and there are no errors */}
        {salaryData && !error && (
          <table className="salary-table">
            <tbody>
              <tr><td><strong>Basic</strong></td><td>₹{salaryData.BASIC}</td></tr>
              <tr><td><strong>HRA</strong></td><td>₹{salaryData.HRA}</td></tr>
              <tr><td><strong>Allowance</strong></td><td>₹{salaryData.ALLOWANCE}</td></tr>
              <tr className="subtotal-row"><td><strong>Gross Salary</strong></td><td>₹{salaryData.SALARY}</td></tr>
              <tr><td colSpan="2"><hr /></td></tr>
              {/* Added new rows for PF, TDS, and Net Salary */}
              <tr><td><strong>PF (12%)</strong></td><td>- ₹{salaryData.PF}</td></tr>
              <tr><td><strong>TDS</strong></td><td>- ₹{salaryData.TDS}</td></tr>
              <tr><td colSpan="2"><hr /></td></tr>
              <tr className="total-row"><td><strong>Net Salary</strong></td><td>₹{salaryData.NET_SALARY}</td></tr>
            </tbody>
          </table>
        )}

        {/* Show a loading message while data is being fetched */}
        {!salaryData && !error && <p>Loading salary details...</p>}

        {/* Back button to navigate to the previous page */}
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}

export default FacultySalary;
