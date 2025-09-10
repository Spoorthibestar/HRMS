import axios from 'axios';
import './AddEmployee.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Employee Details
    EID: '',
    INITIAL: '',
    FIRSTNAME: '',
    MIDDLENAME: '',
    LASTNAME: '',
    DESIGNATION: '',
    DOB: '',
    DATE_OF_JOIN: '',
    FTYPE: '',
    NATIONALITY: '',
    PHONE: '',
    EMAIL: '',
    CASTE: '',
    DOORNO: '',
    CITY: '',
    STATE: '',
    PINCODE: '',
    GENDER: '',
    PROFEXP_DESIGNATION: '',
    PPROFEXP_FROM: '',
    PPROFEXP_TO: '',
    DID: '',
    // Qualification Details
    INSTITUTION: '',
    PERCENTAGE: '',
    SPECIALIZATION: '',
    YOG: '',
    // Employee Account Details
    BIOMETRIC_CARD_NO: '',
    AADHAR: '',
    BANK_ACC: '',
    PAN: '',
    // Family Details
    FNAME: '',
    F_DOB: '',
    MNAME: '',
    M_DOB: ''
  });

  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');

  // Date constraints
  const currentDate = new Date().toISOString().split('T')[0];
  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - 100);
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - 18);
  const minDateOfJoin = formData.DOB ? new Date(formData.DOB) : null;
  if (minDateOfJoin) minDateOfJoin.setFullYear(minDateOfJoin.getFullYear() + 18);

  useEffect(() => {
    fetchDepartments();
    generateEID();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/view-departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const generateEID = async () => {
    try {
      const response = await axios.get('http://localhost:5000/generate-eid');
      setFormData(prev => ({ ...prev, EID: response.data.eid }));
    } catch (error) {
      console.error('Failed to generate EID:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.PPROFEXP_FROM) > new Date(formData.PPROFEXP_TO)) {
      alert('Professional Experience From must be before Professional Experience To');
      return;
    }
    try {
      // Convert empty date strings to null for MySQL
      const formatForMySQL = (date) => date === '' ? null : date;
      
      const fullData = { 
        ...formData,
        PASSWORD: formData.EID, // Using EID as password
        // Send dates in YYYY-MM-DD format (no conversion needed)
        DOB: formatForMySQL(formData.DOB),
        DATE_OF_JOIN: formatForMySQL(formData.DATE_OF_JOIN),
        PPROFEXP_FROM: formatForMySQL(formData.PPROFEXP_FROM),
        PPROFEXP_TO: formatForMySQL(formData.PPROFEXP_TO),
        F_DOB: formatForMySQL(formData.F_DOB),
        M_DOB: formatForMySQL(formData.M_DOB)
      };

      await axios.post('http://localhost:5000/add-employee', fullData);
      setMessage('✅ Employee added successfully!');
      setTimeout(() => navigate('/view-employees'), 1500);
    } catch (err) {
      console.error('Error adding employee:', err);
      setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to add employee'}`);
    }
  };

  const ProgressStep = ({ step, label, current }) => (
    <div 
      className={`step ${current >= step ? 'active' : ''}`}
      onClick={() => current >= step && setCurrentStep(step)}
    >
      {label}
    </div>
  );

  return (
    <div className="onboarding-container">
      <h1>Employee Onboarding</h1>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        <ProgressStep step={1} label="Basic Info" current={currentStep} />
        <ProgressStep step={2} label="Qualification" current={currentStep} />
        <ProgressStep step={3} label="Professional Experience Details" current={currentStep} />
        <ProgressStep step={4} label="Account Details" current={currentStep} />
        <ProgressStep step={5} label="Family Info" current={currentStep} />
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="form-container">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group compact">
                <label>Employee ID</label>
                <input type="text" name="EID" value={formData.EID} readOnly />
              </div>
              
              <div className="form-group compact">
                <label>Initial*</label>
                <select name="INITIAL" value={formData.INITIAL} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="DR">DR</option>
                  <option value="MR">MR</option>
                  <option value="MRS">MRS</option>
                  <option value="MISS">MISS</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>First Name*</label>
                <input type="text" name="FIRSTNAME" value={formData.FIRSTNAME} onChange={handleChange} required />
              </div>
              
              <div className="form-group compact">
                <label>Middle Name</label>
                <input type="text" name="MIDDLENAME" value={formData.MIDDLENAME} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Last Name</label>
                <input type="text" name="LASTNAME" value={formData.LASTNAME} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Designation*</label>
                <select name="DESIGNATION" value={formData.DESIGNATION} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Professor">Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="HoD">Head of Department</option>
                </select>
              </div>
              
              <div className="form-group compact">
                <label>Department*</label>
                <select name="DID" value={formData.DID} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.DID} value={dept.DID}>{dept.NAME}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Date of Birth*</label>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  min={minDOB.toISOString().split('T')[0]}
                  max={maxDOB.toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group compact">
                <label>Date of Joining*</label>
                <input
                  type="date"
                  name="DATE_OF_JOIN"
                  value={formData.DATE_OF_JOIN}
                  onChange={handleChange}
                  min={minDateOfJoin?.toISOString().split('T')[0]}
                  max={currentDate}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Gender*</label>
                <select name="GENDER" value={formData.GENDER} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group compact">
                <label>Employee Type*</label>
                <select name="FTYPE" value={formData.FTYPE} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="TEACHING">Teaching</option>
                  <option value="NON-TEACHING">Non-Teaching</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Phone*</label>
                <input 
                  type="tel" 
                  name="PHONE" 
                  value={formData.PHONE} 
                  onChange={handleChange} 
                  pattern="[0-9]{10}" 
                  required 
                />
              </div>
              
              <div className="form-group compact">
                <label>Email*</label>
                <input 
                  type="email" 
                  name="EMAIL" 
                  value={formData.EMAIL} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Nationality</label>
                <input type="text" name="NATIONALITY" value={formData.NATIONALITY} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Caste</label>
                <input type="text" name="CASTE" value={formData.CASTE} onChange={handleChange} />
              </div>
            </div>

            <h3>Address Information</h3>
            <div className="form-row">
              <div className="form-group compact">
                <label>Door No</label>
                <input type="text" name="DOORNO" value={formData.DOORNO} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>City</label>
                <input type="text" name="CITY" value={formData.CITY} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>State</label>
                <input type="text" name="STATE" value={formData.STATE} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Pincode</label>
                <input 
                  type="text" 
                  name="PINCODE" 
                  value={formData.PINCODE} 
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  title="6-digit pincode"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="next-btn" onClick={nextStep}>
                Next: Qualification →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Qualification Details */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Qualification Details</h2>
            
            <div className="form-row">
              <div className="form-group compact">
                <label>Institution</label>
                <input type="text" name="INSTITUTION" value={formData.INSTITUTION} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Specialization</label>
                <input type="text" name="SPECIALIZATION" value={formData.SPECIALIZATION} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Percentage</label>
                <input 
                  type="number" 
                  name="PERCENTAGE" 
                  value={formData.PERCENTAGE} 
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              
              <div className="form-group compact">
                <label>Year of Graduation</label>
                <input 
                  type="number" 
                  name="YOG" 
                  value={formData.YOG} 
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                ← Previous
              </button>
              <button type="button" className="next-btn" onClick={nextStep}>
                Next: Professional Experience Details →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h2>Professional Experience Details</h2>
            
            <div className="form-row">
              <div className="form-group compact">
                <label>Designation</label>
                <input type="text" name="PROFEXP_DESIGNATION" value={formData.PROFEXP_DESIGNATION} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>From</label>
                <input type="date"
                  name="PPROFEXP_FROM"
                  value={formData.PPROFEXP_FROM}
                  onChange={handleChange}
                  max={formData.PPROFEXP_TO || currentDate}/>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>To</label>
                <input 
                  type="date"
                  name="PPROFEXP_TO"
                  value={formData.PPROFEXP_TO}
                  onChange={handleChange}
                  min={formData.PPROFEXP_FROM} // Minimum: PPROFEXP_FROM
                  max={currentDate}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                ← Previous
              </button>
              <button type="button" className="next-btn" onClick={nextStep}>
                Next: Account Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Account Details */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Account Details</h2>
            
            <div className="form-row">
              <div className="form-group compact">
                <label>Biometric Card No</label>
                <input type="text" name="BIOMETRIC_CARD_NO" value={formData.BIOMETRIC_CARD_NO} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Aadhar Number</label>
                <input 
                  type="text" 
                  name="AADHAR" 
                  value={formData.AADHAR} 
                  onChange={handleChange}
                  pattern="[0-9]{12}"
                  title="12-digit Aadhar number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Bank Account</label>
                <input 
                  type="text" 
                  name="BANK_ACC" 
                  value={formData.BANK_ACC} 
                  onChange={handleChange}
                  pattern="[0-9]{9,18}"
                  title="9-18 digit account number"
                />
              </div>
              
              <div className="form-group compact">
                <label>PAN Number</label>
                <input 
                  type="text" 
                  name="PAN" 
                  value={formData.PAN} 
                  onChange={handleChange}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  title="PAN format: ABCDE1234F"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                ← Previous
              </button>
              <button type="button" className="next-btn" onClick={nextStep}>
                Next: Family Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Family Details */}
        {currentStep === 5 && (
          <div className="form-step">
            <h2>Family Details</h2>
            
            <div className="form-row">
              <div className="form-group compact">
                <label>Father's Name</label>
                <input type="text" name="FNAME" value={formData.FNAME} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Father's DOB</label>
                <input
                  type="date"
                  name="F_DOB"
                  value={formData.F_DOB}
                  onChange={handleChange}
                  min={minDOB.toISOString().split('T')[0]}
                  max={maxDOB.toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group compact">
                <label>Mother's Name</label>
                <input type="text" name="MNAME" value={formData.MNAME} onChange={handleChange} />
              </div>
              
              <div className="form-group compact">
                <label>Mother's DOB</label>
                <input
                  type="date"
                  name="M_DOB"
                  value={formData.M_DOB}
                  onChange={handleChange}
                  min={minDOB.toISOString().split('T')[0]}
                  max={maxDOB.toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                ← Previous
              </button>
              <button type="submit" className="submit-btn">
                Submit Employee Data
              </button>
            </div>
          </div>
        )}
      </form>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AddEmployee;

// import axios from 'axios';
// import './AddEmployee.css';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AddEmployee = () => {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Employee Details
//     EID: '',
//     INITIAL: '',
//     FIRSTNAME: '',
//     MIDDLENAME: '',
//     LASTNAME: '',
//     DESIGNATION: '',
//     DOB: '',
//     DATE_OF_JOIN: '',
//     FTYPE: '',
//     NATIONALITY: '',
//     PHONE: '',
//     EMAIL: '',
//     CASTE: '',
//     DOORNO: '',
//     CITY: '',
//     STATE: '',
//     PINCODE: '',
//     GENDER: '',
//     professionalExperiences: [
//     {
//       PROFEXP_DESIGNATION: '',
//       PPROFEXP_FROM: '',
//       PPROFEXP_TO: ''
//     }
//   ],
//     DID: '',
//     // Qualification Details
//     qualifications: [
//     {
//       INSTITUTION: '',
//       PERCENTAGE: '',
//       SPECIALIZATION: '',
//       YOG: ''
//     }
//   ],
//     // Employee Account Details
//     BIOMETRIC_CARD_NO: '',
//     AADHAR: '',
//     BANK_ACC: '',
//     PAN: '',
//     // Family Details
//     FNAME: '',
//     F_DOB: '',
//     MNAME: '',
//     M_DOB: ''
//   });

//   const [departments, setDepartments] = useState([]);
//   const [message, setMessage] = useState('');

//   // Date constraints
//   const currentDate = new Date().toISOString().split('T')[0];
//   const minDOB = new Date();
//   minDOB.setFullYear(minDOB.getFullYear() - 100);
//   const maxDOB = new Date();
//   maxDOB.setFullYear(maxDOB.getFullYear() - 18);
//   const minDateOfJoin = formData.DOB ? new Date(formData.DOB) : null;
//   if (minDateOfJoin) minDateOfJoin.setFullYear(minDateOfJoin.getFullYear() + 18);

//   useEffect(() => {
//     fetchDepartments();
//     generateEID();
//   }, []);

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/view-departments');
//       setDepartments(response.data);
//     } catch (error) {
//       console.error('Failed to fetch departments:', error);
//     }
//   };

//   const generateEID = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/generate-eid');
//       setFormData(prev => ({ ...prev, EID: response.data.eid }));
//     } catch (error) {
//       console.error('Failed to generate EID:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const nextStep = () => {
//     setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(currentStep - 1);
//   };

//   // Qualification handlers
// const addQualification = () => {
//   setFormData(prev => ({
//     ...prev,
//     qualifications: [
//       ...prev.qualifications,
//       { INSTITUTION: '', PERCENTAGE: '', SPECIALIZATION: '', YOG: '' }
//     ]
//   }));
// };

// const removeQualification = (index) => {
//   setFormData(prev => ({
//     ...prev,
//     qualifications: prev.qualifications.filter((_, i) => i !== index)
//   }));
// };

// const handleQualificationChange = (index, e) => {
//   const { name, value } = e.target;
//   setFormData(prev => {
//     const qualifications = [...prev.qualifications];
//     qualifications[index][name] = value;
//     return { ...prev, qualifications };
//   });
// };

// // Professional Experience handlers
// const addProfessionalExperience = () => {
//   setFormData(prev => ({
//     ...prev,
//     professionalExperiences: [
//       ...prev.professionalExperiences,
//       { PROFEXP_DESIGNATION: '', PPROFEXP_FROM: '', PPROFEXP_TO: '' }
//     ]
//   }));
// };

// const removeProfessionalExperience = (index) => {
//   setFormData(prev => ({
//     ...prev,
//     professionalExperiences: prev.professionalExperiences.filter((_, i) => i !== index)
//   }));
// };

// const handleProfessionalExperienceChange = (index, e) => {
//   const { name, value } = e.target;
//   setFormData(prev => {
//     const professionalExperiences = [...prev.professionalExperiences];
//     professionalExperiences[index][name] = value;
//     return { ...prev, professionalExperiences };
//   });
// };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (new Date(formData.PPROFEXP_FROM) > new Date(formData.PPROFEXP_TO)) {
//       alert('Professional Experience From must be before Professional Experience To');
//       return;
//     }
//     try {
//       // Convert empty date strings to null for MySQL
//       const formatForMySQL = (date) => date === '' ? null : date;
      
//       const fullData = { 
//         ...formData,
//         PASSWORD: formData.EID, // Using EID as password
//         // Send dates in YYYY-MM-DD format (no conversion needed)
//         DOB: formatForMySQL(formData.DOB),
//         DATE_OF_JOIN: formatForMySQL(formData.DATE_OF_JOIN),
//         PPROFEXP_FROM: formatForMySQL(formData.PPROFEXP_FROM),
//         PPROFEXP_TO: formatForMySQL(formData.PPROFEXP_TO),
//         F_DOB: formatForMySQL(formData.F_DOB),
//         M_DOB: formatForMySQL(formData.M_DOB)
//       };

//       await axios.post('http://localhost:5000/add-employee', fullData);
//       setMessage('✅ Employee added successfully!');
//       setTimeout(() => navigate('/view-employees'), 1500);
//     } catch (err) {
//       console.error('Error adding employee:', err);
//       setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to add employee'}`);
//     }
//   };

//   const ProgressStep = ({ step, label, current }) => (
//     <div 
//       className={`step ${current >= step ? 'active' : ''}`}
//       onClick={() => current >= step && setCurrentStep(step)}
//     >
//       {label}
//     </div>
//   );

//   return (
//     <div className="onboarding-container">
//       <h1>Employee Onboarding</h1>
      
//       {/* Progress Bar */}
//       <div className="progress-bar">
//         <ProgressStep step={1} label="Basic Info" current={currentStep} />
//         <ProgressStep step={2} label="Qualification" current={currentStep} />
//         <ProgressStep step={3} label="Professional Experience Details" current={currentStep} />
//         <ProgressStep step={4} label="Account Details" current={currentStep} />
//         <ProgressStep step={5} label="Family Info" current={currentStep} />
//       </div>

//       {/* Form Steps */}
//       <form onSubmit={handleSubmit} className="form-container">
//         {/* Step 1: Basic Information */}
//         {currentStep === 1 && (
//           <div className="form-step">
//             <h2>Basic Information</h2>
            
//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Employee ID</label>
//                 <input type="text" name="EID" value={formData.EID} readOnly />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Initial*</label>
//                 <select name="INITIAL" value={formData.INITIAL} onChange={handleChange} required>
//                   <option value="">Select</option>
//                   <option value="DR">DR</option>
//                   <option value="MR">MR</option>
//                   <option value="MRS">MRS</option>
//                   <option value="MISS">MISS</option>
//                 </select>
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>First Name*</label>
//                 <input type="text" name="FIRSTNAME" value={formData.FIRSTNAME} onChange={handleChange} required />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Middle Name</label>
//                 <input type="text" name="MIDDLENAME" value={formData.MIDDLENAME} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Last Name</label>
//                 <input type="text" name="LASTNAME" value={formData.LASTNAME} onChange={handleChange} />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Designation*</label>
//                 <select name="DESIGNATION" value={formData.DESIGNATION} onChange={handleChange} required>
//                   <option value="">Select</option>
//                   <option value="Professor">Professor</option>
//                   <option value="Assistant Professor">Assistant Professor</option>
//                   <option value="HoD">Head of Department</option>
//                 </select>
//               </div>
              
//               <div className="form-group compact">
//                 <label>Department*</label>
//                 <select name="DID" value={formData.DID} onChange={handleChange} required>
//                   <option value="">Select Department</option>
//                   {departments.map(dept => (
//                     <option key={dept.DID} value={dept.DID}>{dept.NAME}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Date of Birth*</label>
//                 <input
//                   type="date"
//                   name="DOB"
//                   value={formData.DOB}
//                   onChange={handleChange}
//                   min={minDOB.toISOString().split('T')[0]}
//                   max={maxDOB.toISOString().split('T')[0]}
//                   required
//                 />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Date of Joining*</label>
//                 <input
//                   type="date"
//                   name="DATE_OF_JOIN"
//                   value={formData.DATE_OF_JOIN}
//                   onChange={handleChange}
//                   min={minDateOfJoin?.toISOString().split('T')[0]}
//                   max={currentDate}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Gender*</label>
//                 <select name="GENDER" value={formData.GENDER} onChange={handleChange} required>
//                   <option value="">Select</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
              
//               <div className="form-group compact">
//                 <label>Employee Type*</label>
//                 <select name="FTYPE" value={formData.FTYPE} onChange={handleChange} required>
//                   <option value="">Select</option>
//                   <option value="TEACHING">Teaching</option>
//                   <option value="NON-TEACHING">Non-Teaching</option>
//                 </select>
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Phone*</label>
//                 <input 
//                   type="tel" 
//                   name="PHONE" 
//                   value={formData.PHONE} 
//                   onChange={handleChange} 
//                   pattern="[0-9]{10}" 
//                   required 
//                 />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Email*</label>
//                 <input 
//                   type="email" 
//                   name="EMAIL" 
//                   value={formData.EMAIL} 
//                   onChange={handleChange} 
//                   required 
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Nationality</label>
//                 <input type="text" name="NATIONALITY" value={formData.NATIONALITY} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Caste</label>
//                 <input type="text" name="CASTE" value={formData.CASTE} onChange={handleChange} />
//               </div>
//             </div>

//             <h3>Address Information</h3>
//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Door No</label>
//                 <input type="text" name="DOORNO" value={formData.DOORNO} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>City</label>
//                 <input type="text" name="CITY" value={formData.CITY} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>State</label>
//                 <input type="text" name="STATE" value={formData.STATE} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Pincode</label>
//                 <input 
//                   type="text" 
//                   name="PINCODE" 
//                   value={formData.PINCODE} 
//                   onChange={handleChange}
//                   pattern="[0-9]{6}"
//                   title="6-digit pincode"
//                 />
//               </div>
//             </div>

//             <div className="form-actions">
//               <button type="button" className="next-btn" onClick={nextStep}>
//                 Next: Qualification →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Qualification Details */}
//         {currentStep === 2 && (
//           <div className="form-step">
//             <h2>Qualification Details</h2>
            
//             {formData.qualifications.map((qualification, index) => (
//   <div key={index} className="qualification-entry">
//     <div className="form-row">
//       <div className="form-group compact">
//         <label>Institution</label>
//         <input
//           type="text"
//           name="INSTITUTION"
//           value={qualification.INSTITUTION}
//           onChange={e => handleQualificationChange(index, e)}
//         />
//       </div>
//       <div className="form-group compact">
//         <label>Specialization</label>
//         <input
//           type="text"
//           name="SPECIALIZATION"
//           value={qualification.SPECIALIZATION}
//           onChange={e => handleQualificationChange(index, e)}
//         />
//       </div>
//     </div>

//     <div className="form-row">
//       <div className="form-group compact">
//         <label>Percentage</label>
//         <input
//           type="number"
//           name="PERCENTAGE"
//           value={qualification.PERCENTAGE}
//           onChange={e => handleQualificationChange(index, e)}
//           min="0"
//           max="100"
//           step="0.01"
//         />
//       </div>
//       <div className="form-group compact">
//         <label>Year of Graduation</label>
//         <input
//           type="number"
//           name="YOG"
//           value={qualification.YOG}
//           onChange={e => handleQualificationChange(index, e)}
//           min="1900"
//           max={new Date().getFullYear()}
//         />
//       </div>
//     </div>

//     {formData.qualifications.length > 1 && (
//       <button type="button" className="remove-btn" onClick={() => removeQualification(index)}>
//         Remove
//       </button>
//     )}
//   </div>
// ))}

// <button type="button" className="add-btn" onClick={addQualification}>
//   + Add Qualification
// </button>


//             <div className="form-actions">
//               <button type="button" className="prev-btn" onClick={prevStep}>
//                 ← Previous
//               </button>
//               <button type="button" className="next-btn" onClick={nextStep}>
//                 Next: Professional Experience Details →
//               </button>
//             </div>
//           </div>
//         )}

//         {currentStep === 3 && (
//           <div className="form-step">
//             <h2>Professional Experience Details</h2>
            
//             {formData.professionalExperiences.map((exp, index) => (
//   <div key={index} className="professional-experience-entry">
//     <div className="form-row">
//       <div className="form-group compact">
//         <label>Designation</label>
//         <input
//           type="text"
//           name="PROFEXP_DESIGNATION"
//           value={exp.PROFEXP_DESIGNATION}
//           onChange={e => handleProfessionalExperienceChange(index, e)}
//         />
//       </div>
//       <div className="form-group compact">
//         <label>From</label>
//         <input
//           type="date"
//           name="PPROFEXP_FROM"
//           value={exp.PPROFEXP_FROM}
//           onChange={e => handleProfessionalExperienceChange(index, e)}
//           max={exp.PPROFEXP_TO || currentDate}
//         />
//       </div>
//     </div>

//     <div className="form-row">
//       <div className="form-group compact">
//         <label>To</label>
//         <input
//           type="date"
//           name="PPROFEXP_TO"
//           value={exp.PPROFEXP_TO}
//           onChange={e => handleProfessionalExperienceChange(index, e)}
//           min={exp.PPROFEXP_FROM}
//           max={currentDate}
//         />
//       </div>
//     </div>

//     {formData.professionalExperiences.length > 1 && (
//       <button type="button" className="remove-btn" onClick={() => removeProfessionalExperience(index)}>
//         Remove
//       </button>
//     )}
//   </div>
// ))}

// <button type="button" className="add-btn" onClick={addProfessionalExperience}>
//   + Add Professional Experience
// </button>


//             <div className="form-actions">
//               <button type="button" className="prev-btn" onClick={prevStep}>
//                 ← Previous
//               </button>
//               <button type="button" className="next-btn" onClick={nextStep}>
//                 Next: Account Details →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Account Details */}
//         {currentStep === 4 && (
//           <div className="form-step">
//             <h2>Account Details</h2>
            
//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Biometric Card No</label>
//                 <input type="text" name="BIOMETRIC_CARD_NO" value={formData.BIOMETRIC_CARD_NO} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Aadhar Number</label>
//                 <input 
//                   type="text" 
//                   name="AADHAR" 
//                   value={formData.AADHAR} 
//                   onChange={handleChange}
//                   pattern="[0-9]{12}"
//                   title="12-digit Aadhar number"
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Bank Account</label>
//                 <input 
//                   type="text" 
//                   name="BANK_ACC" 
//                   value={formData.BANK_ACC} 
//                   onChange={handleChange}
//                   pattern="[0-9]{9,18}"
//                   title="9-18 digit account number"
//                 />
//               </div>
              
//               <div className="form-group compact">
//                 <label>PAN Number</label>
//                 <input 
//                   type="text" 
//                   name="PAN" 
//                   value={formData.PAN} 
//                   onChange={handleChange}
//                   pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
//                   title="PAN format: ABCDE1234F"
//                 />
//               </div>
//             </div>

//             <div className="form-actions">
//               <button type="button" className="prev-btn" onClick={prevStep}>
//                 ← Previous
//               </button>
//               <button type="button" className="next-btn" onClick={nextStep}>
//                 Next: Family Info →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 4: Family Details */}
//         {currentStep === 5 && (
//           <div className="form-step">
//             <h2>Family Details</h2>
            
//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Father's Name</label>
//                 <input type="text" name="FNAME" value={formData.FNAME} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Father's DOB</label>
//                 <input
//                   type="date"
//                   name="F_DOB"
//                   value={formData.F_DOB}
//                   onChange={handleChange}
//                   min={minDOB.toISOString().split('T')[0]}
//                   max={maxDOB.toISOString().split('T')[0]}
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group compact">
//                 <label>Mother's Name</label>
//                 <input type="text" name="MNAME" value={formData.MNAME} onChange={handleChange} />
//               </div>
              
//               <div className="form-group compact">
//                 <label>Mother's DOB</label>
//                 <input
//                   type="date"
//                   name="M_DOB"
//                   value={formData.M_DOB}
//                   onChange={handleChange}
//                   min={minDOB.toISOString().split('T')[0]}
//                   max={maxDOB.toISOString().split('T')[0]}
//                 />
//               </div>
//             </div>

//             <div className="form-actions">
//               <button type="button" className="prev-btn" onClick={prevStep}>
//                 ← Previous
//               </button>
//               <button type="submit" className="submit-btn">
//                 Submit Employee Data
//               </button>
//             </div>
//           </div>
//         )}
//       </form>

//       {message && (
//         <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
//           {message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEmployee;