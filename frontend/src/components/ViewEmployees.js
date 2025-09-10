import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewEmployees.css";
import { FaEdit, FaTrash, FaCog, FaTimes, FaSearch } from "react-icons/fa";

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState({
    EID: true,
    INITIAL: true,
    FIRSTNAME: true,
    MIDDLENAME: true,
    LASTNAME: true,
    DESIGNATION: true,
    DOB: true,
    DATE_OF_JOIN: true,
    FTYPE: false,
    NATIONALITY: true,
    PHONE: true,
    EMAIL: true,
    CASTE: false,
    DOORNO: false,
    CITY: true,
    STATE: true,
    PINCODE: true,
    GENDER: true,
    PROFEXP_DESIGNATION: false,
    PPROFEXP_FROM: false,
    PPROFEXP_TO: false,
    DID: true,
    INSTITUTION: false,
    PERCENTAGE: false,
    SPECIALIZATION: false,
    YOG: false,
    BIOMETRIC_CARD_NO: false,
    AADHAR: false,
    BANK_ACC: false,
    PAN: false,
    FNAME: false,
    F_DOB: false,
    MNAME: false,
    M_DOB: false
  });
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const columnAliases = {
    EID: "Employee ID",
    INITIAL: "Initial",
    FIRSTNAME: "First Name",
    MIDDLENAME: "Middle Name",
    LASTNAME: "Last Name",
    DESIGNATION: "Designation",
    DOB: "Date of Birth",
    DATE_OF_JOIN: "Date of Joining",
    FTYPE: "Employee Type",
    NATIONALITY: "Nationality",
    PHONE: "Phone",
    EMAIL: "Email",
    CASTE: "Caste",
    DOORNO: "Door No",
    CITY: "City",
    STATE: "State",
    PINCODE: "Pincode",
    GENDER: "Gender",
    PROFEXP_DESIGNATION: "Prof. Exp. Designation",
    PPROFEXP_FROM: "Prof. Exp. From",
    PPROFEXP_TO: "Prof. Exp. To",
    DID: "Department ID",
    INSTITUTION: "Institution",
    PERCENTAGE: "Percentage",
    SPECIALIZATION: "Specialization",
    YOG: "Year of Graduation",
    BIOMETRIC_CARD_NO: "Biometric Card No",
    AADHAR: "Aadhar Number",
    BANK_ACC: "Bank Account",
    PAN: "PAN Number",
    FNAME: "Father's Name",
    F_DOB: "Father's DOB",
    MNAME: "Mother's Name",
    M_DOB: "Mother's DOB"
  };

  // Format date for display (YYYY-MM-DD to DD-MM-YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    if (dateString.includes('T')) {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  return dateString; 
  };

  // Format date for database (DD-MM-YYYY to YYYY-MM-DD)
  const formatDateForDB = (dateString) => {
    if (!dateString) return "";
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // If in DD-MM-YYYY format, convert to YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  if (dateString instanceof Date || typeof dateString === 'string') {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  console.warn("Unexpected date format:", dateString);
  return dateString; // fallback
};

  // Fetch all employees with all fields
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/employees/full");
      const formattedData = response.data.map((emp) => ({
  ...emp,
    EID: emp.EID.toString(),
    DOB: formatDateForDisplay(emp.DOB),
    DATE_OF_JOIN: formatDateForDisplay(emp.DATE_OF_JOIN),
    PPROFEXP_FROM: formatDateForDisplay(emp.PPROFEXP_FROM),
    PPROFEXP_TO: formatDateForDisplay(emp.PPROFEXP_TO),
    F_DOB:formatDateForDisplay(emp.F_DOB),
    M_DOB:formatDateForDisplay(emp.M_DOB)
}));

      setEmployees(formattedData);
      setFilteredEmployees(formattedData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employee details");
    }
  };

  // Handle search
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter((employee) => {
      return Object.values(employee).some((value) => {
        const stringValue = value?.toString().toLowerCase() || "";
        return stringValue.includes(query);
      });
    });
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleDelete = async (eid) => {
    try {
      await axios.delete(`http://localhost:5000/employee/${eid}`);
      setEmployees(employees.filter((employee) => employee.EID !== eid));
      setFilteredEmployees(filteredEmployees.filter((employee) => employee.EID !== eid));
      alert("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const handleModifyClick = (employee) => {
    setEditRow(employee);
    setEditData({
        ...employee,
        DOB: employee.DOB.includes('-') ? 
         employee.DOB.split('-').reverse().join('-') : 
         employee.DOB,
      DATE_OF_JOIN: employee.DATE_OF_JOIN.includes('-') ? 
                 employee.DATE_OF_JOIN.split('-').reverse().join('-') : 
                 employee.DATE_OF_JOIN,
    PPROFEXP_FROM: employee.PPROFEXP_FROM.includes('-') ? 
                  employee.PPROFEXP_FROM.split('-').reverse().join('-') : 
                  employee.PPROFEXP_FROM,
    PPROFEXP_TO: employee.PPROFEXP_TO.includes('-') ? 
                employee.PPROFEXP_TO.split('-').reverse().join('-') : 
                employee.PPROFEXP_TO,
    F_DOB: employee.F_DOB.includes('-') ? 
          employee.F_DOB.split('-').reverse().join('-') : 
          employee.F_DOB,
    M_DOB: employee.M_DOB.includes('-') ? 
          employee.M_DOB.split('-').reverse().join('-') : 
          employee.M_DOB
});

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Validate dates
      if (editData.PPROFEXP_FROM && editData.PPROFEXP_TO && 
          new Date(editData.PPROFEXP_FROM) > new Date(editData.PPROFEXP_TO)) {
        alert("Professional experience 'From' date must be before 'To' date");
        return;
      }

      // Format dates for the database
      const formattedData = {
        ...editData,
        DOB: formatDateForDB(editData.DOB),
        DATE_OF_JOIN: formatDateForDB(editData.DATE_OF_JOIN),
        PPROFEXP_FROM: formatDateForDB(editData.PPROFEXP_FROM),
        PPROFEXP_TO: formatDateForDB(editData.PPROFEXP_TO),
        F_DOB: formatDateForDB(editData.F_DOB),
        M_DOB: formatDateForDB(editData.M_DOB)
      };

      await axios.put(`http://localhost:5000/employee/${editData.EID}`, formattedData);
      
      // Update local state
      const updatedEmployees = employees.map(emp => 
        emp.EID === editData.EID ? formattedData : emp
      );
      
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      setEditRow(null);
      alert("Employee details updated successfully");
    } catch (error) {
      console.error("Error saving employee details:", error);
      alert(error.response?.data?.error || "Failed to save changes");
    }
  };

  const toggleColumn = (column) => {
    setColumns({ ...columns, [column]: !columns[column] });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="view-employees-container">
      <h1>Employee Management</h1>
      
      {/* Search and Column Controls */}
      <div className="controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="column-toggle"
          onClick={() => setShowColumnSelector(!showColumnSelector)}
        >
          <FaCog /> Columns
        </button>
      </div>

      {/* Column Selector */}
      {showColumnSelector && (
        <div className="column-selector">
          <div className="column-selector-header">
            <h3>Select Columns to Display</h3>
            <button 
              className="close-button" 
              onClick={() => setShowColumnSelector(false)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="column-options">
            {Object.keys(columns).map((col) => (
              <label key={col}>
                <input
                  type="checkbox"
                  checked={columns[col]}
                  onChange={() => toggleColumn(col)}
                />
                {columnAliases[col]}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {Object.keys(columns).map((col) => 
                columns[col] && <th key={col}>{columnAliases[col]}</th>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.EID}>
                {Object.keys(columns).map((col) => 
                  columns[col] && (
                    <td key={col}>
                      {employee[col] === null || employee[col] === undefined || employee[col] === ''
  ? "N/A"
  : (col.includes("DOB") || col.includes("DATE") || col.includes("FROM") || col.includes("TO")
      ? formatDateForDisplay(employee[col])
      : employee[col])}

                    </td>
                  )
                )}
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleModifyClick(employee)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(employee.EID)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editRow && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>Edit Employee Details</h2>
            <div className="edit-form">
              {Object.keys(editData).map((key) => (
                <div className="form-group" key={key}>
                  <label>{columnAliases[key] || key}:</label>
                  <input
                    type={key.includes('DOB') || key.includes('DATE') || key.includes('FROM') || key.includes('TO') 
                      ? "date" 
                      : "text"}
                    name={key}
                    value={editData[key] || ""}
                    onChange={handleInputChange}
                    placeholder={columnAliases[key] || key}
                  />
                </div>
              ))}
              <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={() => setEditRow(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEmployees;