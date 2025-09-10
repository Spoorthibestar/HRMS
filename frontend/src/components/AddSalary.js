import axios from "axios";
import "./AddSalary.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddSalary = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams();

    const [salaryData, setSalaryData] = useState({
        EID: employeeId || "",
        BASIC: "",
        HRA: "",
        ALLOWANCE: "",
        SALARY: "0.00",
        PF: "0.00",
        TDS: "0.00",
        NET_SALARY: "0.00"
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (employeeId) {
            setSalaryData((prev) => ({ ...prev, EID: employeeId }));
        }
    }, [employeeId]);

    const calculateSalaryComponents = (basic, hra, allowance) => {
        const b = parseFloat(basic) || 0;
        const h = parseFloat(hra) || 0;
        const a = parseFloat(allowance) || 0;

        const totalSalary = b + h + a;
        const pf = (b * 0.12);

        // TDS calculation
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

    useEffect(() => {
        const { BASIC, HRA, ALLOWANCE } = salaryData;
        const basicNum = parseFloat(BASIC) || 0;
        const hraNum = parseFloat(HRA) || 0;
        const allowanceNum = parseFloat(ALLOWANCE) || 0;

        if (!isNaN(basicNum)) {
            const { totalSalary, pf, tds, netSalary } = calculateSalaryComponents(
                basicNum,
                hraNum,
                allowanceNum
            );

            setSalaryData(prev => ({
                ...prev,
                SALARY: totalSalary.toFixed(2),
                PF: pf.toFixed(2),
                TDS: tds.toFixed(2),
                NET_SALARY: netSalary.toFixed(2)
            }));
        }
    }, [salaryData.BASIC, salaryData.HRA, salaryData.ALLOWANCE]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSalaryData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        let newErrors = {};
        const requiredFields = ["EID", "BASIC", "HRA", "ALLOWANCE"];
        
        requiredFields.forEach((field) => {
            if (!salaryData[field] || salaryData[field].toString().trim() === "") {
                newErrors[field] = `${field} is required`;
            } else if (["BASIC", "HRA", "ALLOWANCE"].includes(field)) {
                const numValue = parseFloat(salaryData[field]);
                if (isNaN(numValue)) {
                    newErrors[field] = `${field} must be a number`;
                } else if (numValue < 0) {
                    newErrors[field] = `${field} must be positive`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            const payload = {
                EID: salaryData.EID,
                BASIC: parseFloat(salaryData.BASIC),
                HRA: parseFloat(salaryData.HRA),
                ALLOWANCE: parseFloat(salaryData.ALLOWANCE),
                SALARY: parseFloat(salaryData.SALARY),
                PF: parseFloat(salaryData.PF),
                TDS: parseFloat(salaryData.TDS),
                NET_SALARY: parseFloat(salaryData.NET_SALARY)
            };

            const res = await axios.post("http://localhost:5000/add-salary", payload);
            
            if (res.data && res.data.success) {
                alert(`Salary added successfully!
                    Basic: ₹${res.data.data.BASIC}
                    HRA: ₹${res.data.data.HRA}
                    Allowance: ₹${res.data.data.ALLOWANCE}
                    Total Salary: ₹${res.data.data.SALARY}
                    PF: ₹${res.data.data.PF}
                    TDS: ₹${res.data.data.TDS}
                    Net Salary: ₹${res.data.data.NET_SALARY}
                `);
                navigate("/view-salary");
            } else {
                alert(res.data.message || "Salary added successfully!");
                navigate("/view-salary");
            }
            
        } catch (error) {
            console.error("Submission error:", error);
            
            if (error.response) {
                console.error("Backend error response:", error.response.data);
                alert(error.response.data.message || "Failed to add salary");
            } else {
                alert("Network error. Please try again.");
            }
        }
    };

    return (
        <div className="add-salary-container">
            <h2>Add Salary</h2>
            <form onSubmit={handleSubmit} className="salary-form">
                <div className="form-group compact">
                    <label>Employee ID*</label>
                    <input
                        type="text"
                        name="EID"
                        value={salaryData.EID}
                        onChange={handleChange}
                        className={errors.EID ? "error-input" : ""}
                        required
                        readOnly={!!employeeId}
                    />
                    {errors.EID && <span className="error-message">{errors.EID}</span>}
                </div>
                <div className="form-group compact">
                    <label>Basic Salary*</label>
                    <input
                        type="number"
                        name="BASIC"
                        value={salaryData.BASIC}
                        onChange={handleChange}
                        className={errors.BASIC ? "error-input" : ""}
                        required
                        min="0"
                        step="0.01"
                    />
                    {errors.BASIC && <span className="error-message">{errors.BASIC}</span>}
                </div>
                <div className="form-group compact">
                    <label>HRA*</label>
                    <input
                        type="number"
                        name="HRA"
                        value={salaryData.HRA}
                        onChange={handleChange}
                        className={errors.HRA ? "error-input" : ""}
                        required
                        min="0"
                        step="0.01"
                    />
                    {errors.HRA && <span className="error-message">{errors.HRA}</span>}
                </div>
                <div className="form-group compact">
                    <label>Allowance*</label>
                    <input
                        type="number"
                        name="ALLOWANCE"
                        value={salaryData.ALLOWANCE}
                        onChange={handleChange}
                        className={errors.ALLOWANCE ? "error-input" : ""}
                        required
                        min="0"
                        step="0.01"
                    />
                    {errors.ALLOWANCE && <span className="error-message">{errors.ALLOWANCE}</span>}
                </div>
                <div className="form-group compact">
                    <label>Total Salary</label>
                    <input
                        type="number"
                        name="SALARY"
                        value={salaryData.SALARY}
                        readOnly
                    />
                </div>
                <div className="form-group compact">
                    <label>Provident Fund (PF)</label>
                    <input
                        type="number"
                        name="PF"
                        value={salaryData.PF}
                        readOnly
                    />
                </div>
                <div className="form-group compact">
                    <label>TDS (Income Tax)</label>
                    <input
                        type="number"
                        name="TDS"
                        value={salaryData.TDS}
                        readOnly
                    />
                </div>
                <div className="form-group compact">
                    <label>Net Salary</label>
                    <input
                        type="number"
                        name="NET_SALARY"
                        value={salaryData.NET_SALARY}
                        readOnly
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-btn">Add Salary</button>
                    <button type="button" className="back-btn" onClick={() => navigate(-1)}>Back</button>
                </div>
            </form>
        </div>
    );
};

export default AddSalary;