// src/components/ViewFacultySalary.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewFacultySalary.css";

const ViewFacultySalary = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { eid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalaryData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/faculty/salary/${eid}`);
        setSalaryData(response.data);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching salary data:", err);
        setError("Failed to fetch salary data. Please try again later.");
        setSalaryData(null);
      } finally {
        setLoading(false);
      }
    };

    if (eid) {
      fetchSalaryData();
    }
  }, [eid]);

  const handleBack = () => {
    navigate("/faculty-dashboard"); // Navigate back to the faculty dashboard
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="salary-details-container">
      <h2>Salary Details for {salaryData?.FIRSTNAME} {salaryData?.LASTNAME}</h2>
      {error ? (
        <div className="error-message-box">
          <p>{error}</p>
        </div>
      ) : (
        <div className="salary-card">
          <div className="salary-item">
            <strong>Basic Salary:</strong> <span>₹{salaryData.BASIC}</span>
          </div>
          <div className="salary-item">
            <strong>HRA:</strong> <span>₹{salaryData.HRA}</span>
          </div>
          <div className="salary-item">
            <strong>Allowance:</strong> <span>₹{salaryData.ALLOWANCE}</span>
          </div>
          <div className="salary-item total-salary">
            <strong>Total Salary:</strong> <span>₹{salaryData.SALARY}</span>
          </div>
        </div>
      )}
      <button className="back-btn" onClick={handleBack}>
        Back
      </button>
    </div>
  );
};

export default ViewFacultySalary;