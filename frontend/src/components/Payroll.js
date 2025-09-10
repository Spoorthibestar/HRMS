// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './Payroll.css';

// function Payroll() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Get employee details from navigation state or localStorage
//   const { facultyEID: stateEid, firstname: stateFirstname } = location.state || {};
//   const eid = stateEid || localStorage.getItem("eid");
//   const firstname = stateFirstname || localStorage.getItem("firstname");

//   const [salaryData, setSalaryData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [pdfLoading, setPdfLoading] = useState(false);

//   // Month and year options
//   const months = [
//     { value: 1, name: 'January' },
//     { value: 2, name: 'February' },
//     { value: 3, name: 'March' },
//     { value: 4, name: 'April' },
//     { value: 5, name: 'May' },
//     { value: 6, name: 'June' },
//     { value: 7, name: 'July' },
//     { value: 8, name: 'August' },
//     { value: 9, name: 'September' },
//     { value: 10, name: 'October' },
//     { value: 11, name: 'November' },
//     { value: 12, name: 'December' }
//   ];

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

//   // Fetch payroll data for selected month/year
//   const fetchPayrollData = async (year, month) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const formattedMonth = String(month).padStart(2, '0');
//       const response = await axios.get(
//         `http://localhost:5000/api/payroll/${eid}/${year}/${formattedMonth}`
//       );

//       if (response.data.error) {
//         setError(response.data.error);
//         setSalaryData(null);
//       } else {
//         setSalaryData({
//           BASIC: parseFloat(response.data.BASIC || 0).toFixed(2),
//           HRA: parseFloat(response.data.HRA || 0).toFixed(2),
//           ALLOWANCE: parseFloat(response.data.ALLOWANCE || 0).toFixed(2),
//           SALARY: parseFloat(response.data.SALARY || 0).toFixed(2),
//           PF: parseFloat(response.data.PF || 0).toFixed(2),
//           TDS: parseFloat(response.data.TDS || 0).toFixed(2),
//           NET_SALARY: parseFloat(response.data.NET_SALARY || 0).toFixed(2)
//         });
//       }
//     } catch (err) {
//       console.error('Error fetching payroll:', err);
//       setError(err.response?.data?.error || 
//         "Failed to fetch payroll data. Please ensure:\n1. Employee has salary records\n2. Backend is running\n3. Network connection is stable");
//       setSalaryData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Download payslip as PDF
//   const handleDownload = async () => {
//     if (!salaryData) return;
    
//     try {
//       setPdfLoading(true);
//       const formattedMonth = String(selectedMonth).padStart(2, '0');
      
//       // Create download link
//       const downloadUrl = `http://localhost:5000/api/payroll/download/${eid}/${selectedYear}/${formattedMonth}`;
      
//       // Create temporary anchor tag
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.target = '_blank';
//       link.rel = 'noopener noreferrer';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//     } catch (err) {
//       alert('Failed to download payslip. Please try again.');
//     } finally {
//       setPdfLoading(false);
//     }
//   };

//   // Handle month/year selection change
//   const handleMonthChange = (e) => {
//     const month = parseInt(e.target.value);
//     setSelectedMonth(month);
//   };

//   const handleYearChange = (e) => {
//     const year = parseInt(e.target.value);
//     setSelectedYear(year);
//   };

//   // Fetch data when component mounts or selection changes
//   useEffect(() => {
//     if (!eid) {
//       setError("No employee ID provided. Please login again.");
//       setLoading(false);
//       return;
//     }
    
//     fetchPayrollData(selectedYear, selectedMonth);
//   }, [eid, selectedYear, selectedMonth]);

//   return (
//     <div className="payroll-container">
//       <div className="payroll-header">
//         <h2>Payroll Details</h2>
//         <p className="employee-info">
//           {firstname ? `Employee: ${firstname}` : ''} {eid ? `(ID: ${eid})` : ''}
//         </p>
//       </div>

//       <div className="period-selector">
//         <div className="select-group">
//           <label htmlFor="month">Month:</label>
//           <select
//             id="month"
//             value={selectedMonth}
//             onChange={handleMonthChange}
//             disabled={loading}
//           >
//             {months.map(month => (
//               <option key={month.value} value={month.value}>
//                 {month.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="select-group">
//           <label htmlFor="year">Year:</label>
//           <select
//             id="year"
//             value={selectedYear}
//             onChange={handleYearChange}
//             disabled={loading}
//           >
//             {years.map(year => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           className="download-btn"
//           onClick={handleDownload}
//           disabled={!salaryData || loading || pdfLoading}
//         >
//           {pdfLoading ? 'Generating PDF...' : 'Download Payslip'}
//         </button>
//       </div>

//       {error && (
//         <div className="error-message">
//           <pre>{error}</pre>
//           <div className="debug-info">
//             <p>Debug Information:</p>
//             <ul>
//               <li>Employee ID: {eid || 'Not found'}</li>
//               <li>Selected Period: {months.find(m => m.value === selectedMonth)?.name} {selectedYear}</li>
//               <li>Backend Status: <a href="http://localhost:5000/api/payroll/health" target="_blank" rel="noopener noreferrer">Check</a></li>
//             </ul>
//           </div>
//           <button 
//             className="retry-btn"
//             onClick={() => fetchPayrollData(selectedYear, selectedMonth)}
//           >
//             Retry
//           </button>
//           {error.includes('No payroll data') && (
//             <button
//               className="update-salary-btn"
//               onClick={() => navigate('/update-salary', { state: { eid } })}
//             >
//               Create Salary Record
//             </button>
//           )}
//         </div>
//       )}

//       {loading ? (
//         <div className="loading-indicator">
//           <div className="spinner"></div>
//           <p>Loading payroll data...</p>
//         </div>
//       ) : salaryData ? (
//         <div className="salary-details">
//           <table className="salary-table">
//             <thead>
//               <tr>
//                 <th colSpan="2">
//                   Salary for {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="earnings-header">
//                 <td colSpan="2">Earnings</td>
//               </tr>
//               <tr>
//                 <td>Basic Salary:</td>
//                 <td>₹{salaryData.BASIC}</td>
//               </tr>
//               <tr>
//                 <td>HRA:</td>
//                 <td>₹{salaryData.HRA}</td>
//               </tr>
//               <tr>
//                 <td>Allowance:</td>
//                 <td>₹{salaryData.ALLOWANCE}</td>
//               </tr>
//               <tr className="gross-salary">
//                 <td>Gross Salary:</td>
//                 <td>₹{salaryData.SALARY}</td>
//               </tr>

//               <tr className="deductions-header">
//                 <td colSpan="2">Deductions</td>
//               </tr>
//               <tr>
//                 <td>PF (12%):</td>
//                 <td>- ₹{salaryData.PF}</td>
//               </tr>
//               <tr>
//                 <td>TDS (Tax):</td>
//                 <td>- ₹{salaryData.TDS}</td>
//               </tr>

//               <tr className="net-salary">
//                 <td>Net Salary:</td>
//                 <td>₹{salaryData.NET_SALARY}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ) : null}

//       <div className="action-buttons">
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           Back to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Payroll;
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payroll.css';

function Payroll() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get employee details from navigation state or localStorage
  const { facultyEID: stateEid, firstname: stateFirstname } = location.state || {};
  const eid = stateEid || localStorage.getItem("eid");
  const firstname = stateFirstname || localStorage.getItem("firstname");

  const [salaryData, setSalaryData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pdfLoading, setPdfLoading] = useState(false);

  // Month and year options
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch payroll data for selected month/year
  const fetchPayrollData = useCallback(async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedMonth = String(month).padStart(2, '0');
      const response = await axios.get(
        `http://localhost:5000/api/payroll/${eid}/${year}/${formattedMonth}`
      );

      if (response.data.error) {
        setError(response.data.error);
        setSalaryData(null);
      } else {
        setSalaryData({
          BASIC: parseFloat(response.data.BASIC || 0).toFixed(2),
          HRA: parseFloat(response.data.HRA || 0).toFixed(2),
          ALLOWANCE: parseFloat(response.data.ALLOWANCE || 0).toFixed(2),
          SALARY: parseFloat(response.data.SALARY || 0).toFixed(2),
          PF: parseFloat(response.data.PF || 0).toFixed(2),
          TDS: parseFloat(response.data.TDS || 0).toFixed(2),
          NET_SALARY: parseFloat(response.data.NET_SALARY || 0).toFixed(2)
        });
      }
    } catch (err) {
      console.error('Error fetching payroll:', err);
      setError(err.response?.data?.error || 
        "Failed to fetch payroll data. Please ensure:\n1. Employee has salary records\n2. Backend is running\n3. Network connection is stable");
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  }, [eid]);

  // Download payslip as PDF
  const handleDownload = async () => {
    if (!salaryData) return;
    
    try {
      setPdfLoading(true);
      const formattedMonth = String(selectedMonth).padStart(2, '0');
      
      // Create download link
      const downloadUrl = `http://localhost:5000/api/payroll/download/${eid}/${selectedYear}/${formattedMonth}`;
      
      // Create temporary anchor tag
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      alert('Failed to download payslip. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle month/year selection change
  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
  };

  // Fetch data when component mounts or selection changes
  useEffect(() => {
    if (!eid) {
      setError("No employee ID provided. Please login again.");
      setLoading(false);
      return;
    }
    
    fetchPayrollData(selectedYear, selectedMonth);
  }, [eid, selectedYear, selectedMonth, fetchPayrollData]);

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <h2>Payroll Details</h2>
        <p className="employee-info">
          {firstname ? `Employee: ${firstname}` : ''} {eid ? `(ID: ${eid})` : ''}
        </p>
      </div>

      <div className="period-selector">
        <div className="select-group">
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={loading}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            disabled={loading}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={!salaryData || loading || pdfLoading}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Payslip'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <pre>{error}</pre>
          <div className="debug-info">
            <p>Debug Information:</p>
            <ul>
              <li>Employee ID: {eid || 'Not found'}</li>
              <li>Selected Period: {months.find(m => m.value === selectedMonth)?.name} {selectedYear}</li>
              <li>Backend Status: <a href="http://localhost:5000/api/payroll/health" target="_blank" rel="noopener noreferrer">Check</a></li>
            </ul>
          </div>
          <button 
            className="retry-btn"
            onClick={() => fetchPayrollData(selectedYear, selectedMonth)}
          >
            Retry
          </button>
          {error.includes('No payroll data') && (
            <button
              className="update-salary-btn"
              onClick={() => navigate('/update-salary', { state: { eid } })}
            >
              Create Salary Record
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading payroll data...</p>
        </div>
      ) : salaryData ? (
        <div className="salary-details">
          <table className="salary-table">
            <thead>
              <tr>
                <th colSpan="2">
                  Salary for {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="earnings-header">
                <td colSpan="2">Earnings</td>
              </tr>
              <tr>
                <td>Basic Salary:</td>
                <td>₹{salaryData.BASIC}</td>
              </tr>
              <tr>
                <td>HRA:</td>
                <td>₹{salaryData.HRA}</td>
              </tr>
              <tr>
                <td>Allowance:</td>
                <td>₹{salaryData.ALLOWANCE}</td>
              </tr>
              <tr className="gross-salary">
                <td>Gross Salary:</td>
                <td>₹{salaryData.SALARY}</td>
              </tr>

              <tr className="deductions-header">
                <td colSpan="2">Deductions</td>
              </tr>
              <tr>
                <td>PF (12%):</td>
                <td>- ₹{salaryData.PF}</td>
              </tr>
              <tr>
                <td>TDS (Tax):</td>
                <td>- ₹{salaryData.TDS}</td>
              </tr>

              <tr className="net-salary">
                <td>Net Salary:</td>
                <td>₹{salaryData.NET_SALARY}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="action-buttons">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Payroll;
