import React, { useEffect, useState } from "react";
import axios from "axios";
import './ViewLeave.css';

export default function ViewLeave() {
    const [leaves, setLeaves] = useState([]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get("http://localhost:5000/view-leave", {
                params: { role: "hr" ,EID:""} // explicitly tell backend it's HR
            });
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching leaves");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/update-leave-status/${id}`, { status });
            fetchLeaves();
        } catch (err) {
            console.error(err);
            alert("Error updating leave status");
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    return (
        <div className="leave-assign-container">
            <h2>Leave Requests</h2>
            <table className="leave-table">
                <thead>
                    <tr>
                        <th>Faculty</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Hand Over To</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map(l => (
                        <tr key={l.leave_id}>
                            <td>{l.FIRSTNAME} {l.LASTNAME}</td>
                            <td>{l.LTYPE}</td>
                            <td>{new Date(l.from_date).toLocaleDateString()}</td>
                            <td>{new Date(l.to_date).toLocaleDateString()}</td>
                            <td>{l.no_of_days}</td>
                            <td>{l.reason}</td>
                            <td>{l.handover_name}</td>
                            <td>{l.status}</td>
                            <td className="action-buttons">
                                {l.status === 'Pending' && (
                                        <>
                                <button className="save-btn" onClick={() => updateStatus(l.leave_id, "Approved")}>Approve</button>
                                <button className="cancel-btn" onClick={() => updateStatus(l.leave_id, "Rejected")}>Reject</button>
                                 </>
                                    )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
