// view-salary.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ViewSalary.css';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

// Function to calculate salary components
const calculateSalary = (basic, hra, allowance) => {
    const b = parseFloat(basic) || 0;
    const h = parseFloat(hra) || 0;
    const a = parseFloat(allowance) || 0;

    const totalSalary = b + h + a;
    const pf = b * 0.12;

    const annualSalary = totalSalary * 12;
    let tds = 0;
    if (annualSalary > 1500000) {
        tds = ((annualSalary - 1500000) * 0.30) / 12;
    } else if (annualSalary > 1200000) {
        tds = ((annualSalary - 1200000) * 0.20) / 12;
    } else if (annualSalary > 1000000) {
        tds = ((annualSalary - 1000000) * 0.15) / 12;
    } else if (annualSalary > 700000) {
        tds = ((annualSalary - 700000) * 0.10) / 12;
    } else if (annualSalary > 300000) {
        tds = ((annualSalary - 300000) * 0.05) / 12;
    } else {
        tds = 0;
    }

    const netSalary = totalSalary - pf - tds;

    return {
        totalSalary,
        pf,
        tds,
        netSalary
    };
};

const EditSalaryModal = ({ salary, onClose, onSave }) => {
    const [editForm, setEditForm] = useState({
        basic: '',
        hra: '',
        allowance: ''
    });

    useEffect(() => {
        if (salary) {
            setEditForm({
                basic: salary.BASIC.toString(),
                hra: salary.HRA.toString(),
                allowance: salary.ALLOWANCE.toString()
            });
        }
    }, [salary]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            BASIC: parseFloat(editForm.basic),
            HRA: parseFloat(editForm.hra),
            ALLOWANCE: parseFloat(editForm.allowance)
        };
        onSave(updatedData);
    };

    const liveCalculated = calculateSalary(
        editForm.basic,
        editForm.hra,
        editForm.allowance
    );

    return (
        <div className="edit-modal modal-overlay">
            <div className="edit-modal-content modal-content">
                <div className="edit-modal-header modal-header">
                    <h2>Edit Salary Details</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>EID:</label>
                        <input type="text" value={salary.EID} disabled />
                    </div>
                    <div className="form-group">
                        <label>Employee Name:</label>
                        <input type="text" value={`${salary.FIRSTNAME} ${salary.LASTNAME}`} disabled />
                    </div>
                    <div className="form-group">
                        <label>Basic Salary:</label>
                        <input
                            type="number"
                            name="basic"
                            value={editForm.basic}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>HRA:</label>
                        <input
                            type="number"
                            name="hra"
                            value={editForm.hra}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Allowance:</label>
                        <input
                            type="number"
                            name="allowance"
                            value={editForm.allowance}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Total Salary (Live):</label>
                        <input type="text" value={`₹${liveCalculated.totalSalary.toFixed(2)}`} disabled />
                    </div>
                    <div className="form-group">
                        <label>PF (Live):</label>
                        <input type="text" value={`₹${liveCalculated.pf.toFixed(2)}`} disabled />
                    </div>
                    <div className="form-group">
                        <label>TDS (Live):</label>
                        <input type="text" value={`₹${liveCalculated.tds.toFixed(2)}`} disabled />
                    </div>
                    <div className="form-group">
                        <label>Net Salary (Live):</label>
                        <input type="text" value={`₹${liveCalculated.netSalary.toFixed(2)}`} disabled />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn action-btn">Save Changes</button>
                        <button type="button" className="cancel-btn action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ onClose, onConfirm, employeeName }) => {
    return (
        <div className="delete-modal modal-overlay">
            <div className="delete-modal-content modal-content">
                <div className="delete-modal-header modal-header">
                    <h2>Confirm Deletion</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <p>Are you sure you want to delete the salary record for <b>{employeeName}</b>?</p>
                <div className="form-actions">
                    <button onClick={onConfirm} className="delete-btn action-btn">Delete</button>
                    <button onClick={onClose} className="cancel-btn action-btn">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ViewSalary = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSalary, setCurrentSalary] = useState(null);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteEid, setDeleteEid] = useState(null);
    const [deleteName, setDeleteName] = useState('');

    const fetchSalaries = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/view-salary');
            const formattedSalaries = response.data.map(salary => ({
                ...salary,
                BASIC: parseFloat(salary.BASIC) || 0,
                HRA: parseFloat(salary.HRA) || 0,
                ALLOWANCE: parseFloat(salary.ALLOWANCE) || 0,
                SALARY: parseFloat(salary.SALARY) || 0,
                PF: parseFloat(salary.PF) || 0,
                TDS: parseFloat(salary.TDS) || 0,
                NET_SALARY: parseFloat(salary.NET_SALARY) || 0,
            }));
            setSalaries(formattedSalaries);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch salary data:", err);
            setError("Failed to load salary data. Please ensure your backend is running.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalaries();
    }, [fetchSalaries]);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        let sortedSalaries = [];

        if (!query) {
            sortedSalaries = [...salaries].sort((a, b) => a.EID - b.EID);
        } else {
            const filtered = salaries.filter((salary) => {
                const eidMatch = salary.EID.toString().toLowerCase().includes(query);
                const nameMatch = `${salary.FIRSTNAME} ${salary.LASTNAME}`.toLowerCase().includes(query);
                return eidMatch || nameMatch;
            });
            sortedSalaries = filtered.sort((a, b) => a.EID - b.EID);
        }
        setFilteredSalaries(sortedSalaries);
    }, [searchQuery, salaries]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const openEditModal = (salary) => {
        setCurrentSalary(salary);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setCurrentSalary(null);
    };

    // 🔹 Unified handleUpdate
    const handleUpdate = async (updatedData) => {
        try {
            const { totalSalary, pf, tds, netSalary } = calculateSalary(
                updatedData.BASIC,
                updatedData.HRA,
                updatedData.ALLOWANCE
            );

            const payload = {
                ...updatedData,
                SALARY: totalSalary,
                PF: pf,
                TDS: tds,
                NET_SALARY: netSalary
            };

            const response = await axios.put(
                `http://localhost:5000/update-salary/${currentSalary.EID}`,
                payload
            );

            if (response.data.success) {
                setMessage('Salary updated successfully!');
                setIsSuccess(true);
                closeEditModal();
                fetchSalaries(); // Refresh data
            }
        } catch (err) {
            console.error("Error updating salary:", err);
            setMessage(err.response?.data?.message || 'Failed to update salary.');
            setIsSuccess(false);
            fetchSalaries();
        }
    };

    const handleDeleteClick = (eid, name) => {
        setDeleteEid(eid);
        setDeleteName(name);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/delete-salary/${deleteEid}`);
            if (response.data.success) {
                setMessage('Salary record deleted successfully!');
                setIsSuccess(true);
                fetchSalaries();
            }
        } catch (err) {
            console.error("Error deleting salary:", err);
            setMessage(err.response?.data?.message || 'Failed to delete salary.');
            setIsSuccess(false);
            fetchSalaries();
        } finally {
            setShowDeleteConfirm(false);
            setDeleteEid(null);
            setDeleteName('');
        }
    };

    if (loading) {
        return <div className="loading-message message">Loading salary data...</div>;
    }

    if (error) {
        return <div className="error-message message">{error}</div>;
    }

    return (
        <div className="view-salary-container">
            <h2 className="header">Salary Records</h2>

            {/* 🔹 New Controls Block */}
            <div className="controls">
                <div className="search-container">
                    <i className="search-icon">🔍</i>
                    <input
                        type="text"
                        placeholder="Search salary records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {searchQuery && (
                    <button className="back-btn" onClick={handleClearSearch}>Back</button>
                )}
            </div>

            {message && <div className={`message ${isSuccess ? 'success-message' : 'error-message'}`}>{message}</div>}
            {filteredSalaries.length === 0 ? (
                <p className="no-data-message">No salary data found.</p>
            ) : (
                <div className="table-container">
                    <table className="salary-table">
                        <thead>
                            <tr>
                                <th>EID</th>
                                <th>Employee Name</th>
                                <th>Basic</th>
                                <th>HRA</th>
                                <th>Allowance</th>
                                <th>Total Salary</th>
                                <th>PF</th>
                                <th>TDS</th>
                                <th>Net Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSalaries.map((salary) => (
                                <tr key={salary.EID}>
                                    <td>{salary.EID}</td>
                                    <td>{`${salary.FIRSTNAME} ${salary.LASTNAME}`}</td>
                                    <td>₹{salary.BASIC.toFixed(2)}</td>
                                    <td>₹{salary.HRA.toFixed(2)}</td>
                                    <td>₹{salary.ALLOWANCE.toFixed(2)}</td>
                                    <td>₹{salary.SALARY.toFixed(2)}</td>
                                    <td>₹{salary.PF.toFixed(2)}</td>
                                    <td>₹{salary.TDS.toFixed(2)}</td>
                                    <td>₹{salary.NET_SALARY.toFixed(2)}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="edit-btn action-btn" onClick={() => openEditModal(salary)}>
                                                <FaEdit />
                                            </button>
                                            <button className="delete-btn action-btn" onClick={() => handleDeleteClick(salary.EID, `${salary.FIRSTNAME} ${salary.LASTNAME}`)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && currentSalary && (
                <EditSalaryModal
                    salary={currentSalary}
                    onClose={closeEditModal}
                    onSave={handleUpdate}
                />
            )}
            {showDeleteConfirm && (
                <DeleteConfirmationModal
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                    employeeName={deleteName}
                />
            )}
        </div>
    );
};

export default ViewSalary;
