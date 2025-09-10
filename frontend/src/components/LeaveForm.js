import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './LeaveForm.css';

function FacultyLeaveForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const faculty = location.state?.facultyData;
    const [form, setForm] = useState({
        LTYPE: "CL",
        from_date: "",
        to_date: "",
        no_of_days: "",
        reason: "",
        handover_to: ""
    });
    const [colleagues, setColleagues] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [leaveBalances, setLeaveBalances] = useState(null);
    const [currentYear] = useState(new Date().getFullYear());
    const [showBalanceModal, setShowBalanceModal] = useState(false);


    useEffect(() => {
        if (!faculty?.EID) {
            setError("Faculty information not loaded");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch leave balances
                const balanceRes = await axios.get("http://localhost:5000/get-leave-data", {
                    params: { year: currentYear }
                });
                
                if (balanceRes.data && balanceRes.data[faculty.EID]) {
                    setLeaveBalances(balanceRes.data[faculty.EID]);
                } else {
                    setError("No leave balances assigned for this year");
                }

                // Fetch colleagues
                const colleaguesRes = await axios.get(`http://localhost:5000/api/colleagues/${faculty.EID}`);
                setColleagues(colleaguesRes.data || []);
                
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Failed to load required data");
            }
        };

        fetchData();
    }, [faculty, currentYear]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const calculateDays = () => {
        if (form.from_date && form.to_date) {
            const start = new Date(form.from_date);
            const end = new Date(form.to_date);
            
            if (start > end) {
                setError("End date cannot be before start date");
                return;
            }
            
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            setForm(prev => ({ ...prev, no_of_days: diffDays }));
            
            // Check leave balance after calculating days
            checkLeaveBalance(diffDays);
        }
    };

    const checkLeaveBalance = (days) => {
        if (!leaveBalances) return;
        
        const leaveType = `LEAVE_${form.LTYPE}`;
        const availableDays = leaveBalances[leaveType] || 0;
        
        if (days > availableDays) {
            setError(`You only have ${availableDays} ${form.LTYPE} days remaining`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            // Basic validation
            if (!form.from_date || !form.to_date) {
                throw new Error("Please select both start and end dates");
            }
            
            if (new Date(form.from_date) > new Date(form.to_date)) {
                throw new Error("End date cannot be before start date");
            }

            // Check leave balance
            if (!leaveBalances) {
                throw new Error("Leave balances not loaded");
            }

            const leaveType = `LEAVE_${form.LTYPE}`;
            const availableDays = leaveBalances[leaveType] || 0;
            
            if (parseFloat(form.no_of_days) > availableDays) {
                throw new Error(`Insufficient ${form.LTYPE} balance (${availableDays} days remaining)`);
            }

            await axios.post("http://localhost:5000/apply-leave", {
                EID: faculty.EID,
                ...form
            });

            setSuccess(true);
            setForm({
                LTYPE: "CL",
                from_date: "",
                to_date: "",
                no_of_days: "",
                reason: "",
                handover_to: ""
            });
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || "Error applying leave";
            setError(errorMsg);
            console.error("Leave application error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getNextDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

    if (!faculty?.EID) {
        return (
            <div className="leave-form-container">
                <h2>Apply for Leave</h2>
                <div className="error-message">
                    Faculty information not available. Please log in again.
                    <button onClick={() => navigate('/')} style={{marginTop: '10px'}}>
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!leaveBalances) {
        return (
            <div className="leave-form-container">
                <h2>Apply for Leave</h2>
                <div className="loading-message">
                    Loading leave balances...
                </div>
            </div>
        );
    }

    return (
        <div className="leave-form-container">
            <h2>Apply for Leave</h2>
            
            {/* Check Balance Button */}
            <button 
                className="check-balance-btn"
                onClick={() => setShowBalanceModal(true)}
            >
                Check Leave Balance
            </button>

            {/* Leave Balance Modal */}
            {showBalanceModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Your Leave Balances ({currentYear})</h3>
                            <button 
                                className="close-modal"
                                onClick={() => setShowBalanceModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <table className="leave-balance-table">
                                <thead>
                                    <tr>
                                        <th>Leave Type</th>
                                        <th>Days Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Earned Leave (EL)</td>
                                        <td>{leaveBalances?.LEAVE_EL || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Casual Leave (CL)</td>
                                        <td>{leaveBalances?.LEAVE_CL || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Special Casual Leave (SCL)</td>
                                        <td>{leaveBalances?.LEAVE_SCL || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Restricted Holiday (RH)</td>
                                        <td>{leaveBalances?.LEAVE_RH || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Out of Duty (OOD)</td>
                                        <td>{leaveBalances?.LEAVE_OOD || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Vacation Leave (VL)</td>
                                        <td>{leaveBalances?.LEAVE_VL || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Other Leave (OTHER)</td>
                                        <td>{leaveBalances?.LEAVE_OTHER || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Compensatory Off (COMPOFF)</td>
                                        <td>{leaveBalances?.LEAVE_COMPOFF || 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="close-btn"
                                onClick={() => setShowBalanceModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Leave Type:</label>
                    <select 
                        name="LTYPE" 
                        value={form.LTYPE} 
                        onChange={handleChange}
                        required
                    >
                        <option value="EL">Earned Leave</option>
                        <option value="SCL">Special Casual Leave</option>
                        <option value="RH">Restricted Holiday</option>
                        <option value="OOD">Out of Duty</option>
                        <option value="CL">Casual Leave</option>
                        <option value="VL">Vacation Leave</option>
                        <option value="OTHER">Other Leave</option>
                        <option value="COMPOFF">Compensatory Off</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>From Date:</label>
                    <input 
                        type="date" 
                        name="from_date" 
                        value={form.from_date} 
                        onChange={handleChange}
                        onBlur={calculateDays}
                        min={getNextDate()}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>To Date:</label>
                    <input 
                        type="date" 
                        name="to_date" 
                        value={form.to_date} 
                        onChange={handleChange}
                        onBlur={calculateDays}
                        min={form.from_date}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>No. of Days:</label>
                    <input 
                        type="number" 
                        step="0.5" 
                        name="no_of_days" 
                        value={form.no_of_days} 
                        onChange={handleChange}
                        min="0.5"
                        required
                        readOnly
                    />
                </div>

                <div className="form-group">
                    <label>Reason:</label>
                    <textarea 
                        name="reason" 
                        value={form.reason} 
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Handover To:</label>
                    <select
                        name="handover_to"
                        required
                        value={form.handover_to}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Colleague --</option>
                        {colleagues.map(col => (
                            <option key={col.EID} value={col.EID}>
                                {col.name} ({col.designation})
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting || !!error}
                >
                    {isSubmitting ? 'Applying...' : 'Apply Leave'}
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Leave applied successfully!</div>}
        </div>
    );
}

export default FacultyLeaveForm;