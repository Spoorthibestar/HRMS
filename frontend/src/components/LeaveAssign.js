import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./LeaveAssign.css";

export default function AssignLeave() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [leaveData, setLeaveData] = useState({});
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaveData = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/get-leave-data?year=${fiscalYear}`
      );
      setLeaveData(res.data);
    } catch (err) {
      console.error("Error fetching leave data:", err);
    }
  }, [fiscalYear]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-employees");
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } catch (err) {
        console.error(err);
        alert("Error fetching employees");
      }
    };

    fetchEmployees();
    fetchLeaveData();
  }, [fiscalYear, fetchLeaveData]);

  useEffect(() => {
    const filtered = employees.filter((emp) =>
      `${emp.FIRSTNAME} ${emp.LASTNAME}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleChange = (EID, type, value) => {
    setLeaveData((prev) => ({
      ...prev,
      [EID]: { ...prev[EID], [type]: value },
    }));
  };

  const handleAssign = async (EID) => {
    try {
      await axios.post("http://localhost:5000/assign-leave", {
        EID,
        fiscal_year: fiscalYear,
        leaveData: leaveData[EID],
      });
      alert("Leave assigned successfully");
      setEditingId(null);
      fetchLeaveData();
    } catch (err) {
      console.error(err);
      alert("Error assigning leave");
    }
  };

  const leaveTypes = [
    "LEAVE_EL",
    "LEAVE_CL",
    "LEAVE_VL",
    "LEAVE_SCL",
    "LEAVE_RH",
    "LEAVE_OOD",
    "LEAVE_OTHER",
    "LEAVE_COMPOFF",
  ];

  return (
    <div className="leave-assign-container">
      <h2>Assign Leave</h2>

      <div className="controls-container">
        {/* 🔍 Search box above Fiscal Year */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* 📅 Fiscal year */}
        <div className="fiscal-year">
          <label>Fiscal Year: </label>
          <input
            type="number"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
          />
        </div>
      </div>

      <table className="leave-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Designation</th>
            {leaveTypes.map((type) => (
              <th key={type}>{type.replace("LEAVE_", "")}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <tr key={emp.EID}>
                <td>{emp.EID}</td>
                <td>{emp.FIRSTNAME}</td>
                <td>{emp.MIDDLENAME || "-"}</td>
                <td>{emp.LASTNAME}</td>
                <td>{emp.DESIGNATION}</td>

                {leaveTypes.map((type) => (
                  <td key={type}>
                    {editingId === emp.EID ? (
                      <input
                        type="number"
                        min="0"
                        value={leaveData[emp.EID]?.[type] || ""}
                        onChange={(e) =>
                          handleChange(emp.EID, type, e.target.value)
                        }
                      />
                    ) : leaveData[emp.EID]?.[type] ? (
                      leaveData[emp.EID][type]
                    ) : (
                      <span className="empty-cell">-</span>
                    )}
                  </td>
                ))}

                <td>
                  {editingId === emp.EID ? (
                    <>
                      <button
                        className="save-btn"
                        onClick={() => handleAssign(emp.EID)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => setEditingId(emp.EID)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={leaveTypes.length + 6} className="no-results">
                No employees found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
