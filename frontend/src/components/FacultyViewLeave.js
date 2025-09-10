import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import './FacultyViewLeave.css'; // reuse same styles

export default function FacultyLeaveView() {
    const location = useLocation();
    const facultyEID = location.state?.facultyEID;
    const [leaves, setLeaves] = useState([]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get("http://localhost:5000/view-leave", {
                params: { role: "faculty", EID: facultyEID }
            });
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching your leave records");
        }
    };

    useEffect(() => {
       if (facultyEID) { // Only fetch if we have an EID
      fetchLeaves();
    }
    }, [facultyEID]);

    return (
        <div className="leave-assign-container">
            <h2>My Leave Requests</h2>
            <table className="leave-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Hand Over To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.length > 0 ? (
                        leaves.map(l => (
                            <tr key={l.leave_id}>
                                <td>{l.LTYPE}</td>
                                <td>{new Date(l.from_date).toLocaleDateString()}</td>
                                <td>{new Date(l.to_date).toLocaleDateString()}</td>
                                <td>{l.no_of_days}</td>
                                <td>{l.reason}</td>
                                <td className={l.handover_name ? "" : "empty-cell"}>
                                    {l.handover_name || "—"}
                                </td>
                                <td>{l.status}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-cell">
                                No leave requests found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
