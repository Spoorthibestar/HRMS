import React from 'react';
import { useLocation } from 'react-router-dom';
import './FacultyDashboard.css';

function FacultyDashboard() {
  const location = useLocation();
  const faculty = location.state?.facultyData;

const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // Handle ISO format with timestamp (e.g., "2007-08-12T18:30:00.000Z")
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}-${month}-${year}`;
    }
    
    // Handle already formatted dates or other cases
    return dateString;
  };

  if (!faculty) return <div>No data found</div>;

  const fieldAliases = {
    'EID': 'Employee ID',
    'INITIAL': 'Initial',
    'FIRSTNAME': 'First Name',
    'MIDDLENAME': 'Middle Name',
    'LASTNAME': 'Last Name',
    'DESIGNATION': 'Designation',
    'DID': 'Department ID',
    'DOB': 'Date of Birth',
    'DATE_OF_JOIN': 'Date of Joining',
    'FTYPE': 'Faculty Type',
    'GENDER': 'Gender',
    'PHONE': 'Phone Number',
    'EMAIL': 'Email',
    'NATIONALITY': 'Nationality',
    'CASTE': 'Caste',
    'DOORNO': 'Door Number',
    'CITY': 'City',
    'STATE': 'State',
    'PINCODE': 'Pincode',
    'AADHAR': 'Aadhar Number',
    'BANK_ACC': 'Bank Account',
    'PAN': 'PAN Number',
    'BIOMETRIC_CARD_NO': 'Biometric Card No',
    'INSTITUTION': 'Institution',
    'PERCENTAGE': 'Percentage',
    'SPECIALIZATION': 'Specialization',
    'YOG': 'Year of Graduation',
    'PPROFEXP_FROM': 'Professional Experience From',
    'PPROFEXP_TO': 'Professional Experience To',
    'PPROFEXP_ORGANIZATION': 'Organization',
    'PPROFEXP_DESIGNATION': 'Designation',
    'FNAME': "Father's Name",
    'F_DOB': "Father's Date of Birth",
    'MNAME': "Mother's Name",
    'M_DOB': "Mother's Date of Birth"
  };

  const sections = {
    'Basic Information': [
      'EID', 'INITIAL', 'FIRSTNAME', 'MIDDLENAME', 'LASTNAME', 'DESIGNATION', 'DID',
      'DOB', 'DATE_OF_JOIN', 'FTYPE', 'GENDER', 'PHONE', 'EMAIL', 'NATIONALITY', 'CASTE'
    ],
    'Address Information': ['DOORNO', 'CITY', 'STATE', 'PINCODE'],
    'Documents': ['AADHAR', 'BANK_ACC', 'PAN', 'BIOMETRIC_CARD_NO'],
    'Education': ['INSTITUTION', 'PERCENTAGE', 'SPECIALIZATION', 'YOG'],
    'Professional Experience': ['PPROFEXP_FROM', 'PPROFEXP_TO', 'PPROFEXP_ORGANIZATION', 'PPROFEXP_DESIGNATION'],
    'Parents Info': ['FNAME', 'F_DOB', 'MNAME', 'M_DOB']
  };
  const dateFields = ['DOB', 'DATE_OF_JOIN', 'F_DOB', 'M_DOB','PPROFEXP_FROM', 'PPROFEXP_TO'];
  return (
    <div className="faculty-dashboard">
      <div className="dashboard-content">
        <h2 className="dashboard-title">Faculty Information</h2>
        {Object.entries(sections).map(([section, fields]) => (
          <div className="section-card" key={section}>
            <div className="section-title">{section}</div>
            <div className="form-grid">
              {fields.map((field) => (
                <div className="form-field" key={field}>
                  <label>{fieldAliases[field] || field.replace(/_/g, ' ')}</label>
                  <div className="field-value">{dateFields.includes(field) 
                      ? formatDate(faculty[field])
                      : faculty[field] || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FacultyDashboard;