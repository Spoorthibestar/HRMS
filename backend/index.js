const express = require('express');
const cors = require('cors');
const pool = require('./db');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// ------------------- Helper Functions -------------------

const calculateSalaryComponents = (basic, hra, allowance) => {
  const b = parseFloat(basic) || 0;
  const h = parseFloat(hra) || 0;
  const a = parseFloat(allowance) || 0;

  const totalSalary = b + h + a;
  const pf = (b * 0.12);

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

  return { totalSalary, pf, tds, netSalary };
};

// ------------------- Authentication Routes -------------------

// HR login route
app.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM hrms_users WHERE user_id = ? AND password = ?',
      [userId, password]
    );
    if (rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Faculty login route
app.post('/faculty-login', async (req, res) => {
  const { eid, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM employee_master WHERE EID = ? AND PASSWORD = ?',
      [eid, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, faculty: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Faculty login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Faculty Password Reset
app.post('/faculty-update-password', async (req, res) => {
  const { eid, oldPassword, newPassword } = req.body;

  try {
    const [rows] = await pool.execute('SELECT PASSWORD FROM employee_master WHERE EID = ?', [eid]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Faculty not found' });
    }

    if (rows[0].PASSWORD !== oldPassword) {
      return res.json({ success: false, message: 'Incorrect current password' });
    }

    await pool.execute('UPDATE employee_master SET PASSWORD = ? WHERE EID = ?', [newPassword, eid]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ------------------- Employee Management Routes -------------------

// Generate next available EID
app.get('/generate-eid', async (req, res) => {
  try {
    // Get all existing EIDs in order
    const [rows] = await pool.execute('SELECT EID FROM employee_master ORDER BY EID');
    
    // Find the first available gap starting from 1
    let expectedId = 1;
    for (const row of rows) {
      if (row.EID > expectedId) {
        // Found a gap, use expectedId
        break;
      }
      expectedId = row.EID + 1;
    }
    
    res.json({ eid: expectedId });
  } catch (err) {
    console.error('Error in /generate-eid:', err);
    res.status(500).json({ error: 'Failed to generate EID' });
  }
});

// Add employee with EID
app.post('/add-employee', async (req, res) => {
  const employeeData = req.body;
  try {
    const query = `INSERT INTO employee_master (
      EID, INITIAL, FIRSTNAME, MIDDLENAME, LASTNAME, DESIGNATION,
      DOB, DATE_OF_JOIN, FTYPE, NATIONALITY, PHONE, EMAIL, CASTE,
      DOORNO, CITY, STATE, PINCODE, GENDER, PROFEXP_DESIGNATION,
      PPROFEXP_FROM, PPROFEXP_TO, DID,
      BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN,
      INSTITUTION, PERCENTAGE, SPECIALIZATION, YOG,
      FNAME, F_DOB, MNAME, M_DOB, PASSWORD
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      employeeData.EID, employeeData.INITIAL, employeeData.FIRSTNAME, 
      employeeData.MIDDLENAME, employeeData.LASTNAME, employeeData.DESIGNATION,
      employeeData.DOB, employeeData.DATE_OF_JOIN, employeeData.FTYPE, 
      employeeData.NATIONALITY, employeeData.PHONE, employeeData.EMAIL, 
      employeeData.CASTE, employeeData.DOORNO, employeeData.CITY, 
      employeeData.STATE, employeeData.PINCODE, employeeData.GENDER, 
      employeeData.PROFEXP_DESIGNATION, employeeData.PPROFEXP_FROM, 
      employeeData.PPROFEXP_TO, employeeData.DID,
      employeeData.BIOMETRIC_CARD_NO, employeeData.AADHAR, 
      employeeData.BANK_ACC, employeeData.PAN,
      employeeData.INSTITUTION, employeeData.PERCENTAGE, 
      employeeData.SPECIALIZATION, employeeData.YOG,
      employeeData.FNAME, employeeData.F_DOB, employeeData.MNAME, 
      employeeData.M_DOB, employeeData.EID // Using EID as default password
    ];

    await pool.execute(query, values);
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ success: false, message: 'Failed to add employee' });
  }
});

// Get employee by EID
app.get('/employee/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM employee_master WHERE EID = ?', 
      [eid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Get all employees with all fields
app.get('/employees/full', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM employee_master ORDER BY EID'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in /employees/full:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// View employees with search
app.get('/view-employees', async (req, res) => {
  const { q } = req.query;
  try {
    let query = `
      SELECT 
        EID, INITIAL, FIRSTNAME, MIDDLENAME, LASTNAME, 
        DESIGNATION, DOB, DATE_OF_JOIN, PHONE, EMAIL, 
        CITY, STATE, GENDER, DID
      FROM employee_master
    `;
    let params = [];
    
    if (q) {
      query += ' WHERE EID = ? OR FIRSTNAME LIKE ? OR LASTNAME LIKE ? OR EMAIL LIKE ?';
      params.push(q, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    
    query += ' ORDER BY EID';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in /view-employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Delete employee
app.delete('/employee/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    await pool.execute('DELETE FROM employee_master WHERE EID = ?', [eid]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update employee
app.put('/employee/:eid', async (req, res) => {
  const { eid } = req.params;
  const employeeData = req.body;
  
  try {
    // Build dynamic update query
    const fields = Object.keys(employeeData)
      .filter(key => key !== 'EID')
      .map(key => `${key} = ?`);
    
    const values = Object.values(employeeData)
      .filter((_, index) => Object.keys(employeeData)[index] !== 'EID');
    
    values.push(eid);
    
    await pool.execute(
      `UPDATE employee_master SET ${fields.join(', ')} WHERE EID = ?`,
      values
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ------------------- Department Management Routes -------------------

// Generate next available DID
app.get('/generate-did', async (req, res) => {
  try {
    // Get all existing DIDs in order
    const [rows] = await pool.execute('SELECT DID FROM department ORDER BY DID');
    
    // Find the first available gap starting from 1
    let expectedId = 1;
    for (const row of rows) {
      if (row.DID > expectedId) {
        // Found a gap, use expectedId
        break;
      }
      expectedId = row.DID + 1;
    }
    
    res.json({ did: expectedId });
  } catch (err) {
    console.error('Error in /generate-did:', err);
    res.status(500).json({ error: 'Failed to generate DID' });
  }
});

// Add department with DID
app.post('/add-department', async (req, res) => {
  const { did, name } = req.body;
  try {
    await pool.execute('INSERT INTO department (DID, NAME) VALUES (?, ?)', [did, name]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add department' });
  }
});

// View departments with optional filters
app.get('/view-departments', async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT * FROM department';
    let params = [];
    
    if (q) {
      query += ' WHERE DID = ? OR NAME LIKE ?';
      params.push(q, `%${q}%`);
    }
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in /view-departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Delete department
app.delete('/department/:did', async (req, res) => {
  const { did } = req.params;
  try {
    await pool.execute('DELETE FROM department WHERE DID = ?', [did]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update department
app.put('/department/:did', async (req, res) => {
  const { did } = req.params;
  const { name } = req.body;
  try {
    await pool.execute('UPDATE department SET NAME = ? WHERE DID = ?', [name, did]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ------------------- Salary Management Routes -------------------

// Add Salary
app.post("/add-salary", async (req, res) => {
  try {
    const { EID, BASIC, HRA, ALLOWANCE } = req.body;

    // Validation
    if (!EID || isNaN(EID)) {
      return res.status(400).json({ message: "Valid Employee ID is required" });
    }
    if (isNaN(BASIC) || BASIC <= 0) {
      return res.status(400).json({ message: "Basic Salary must be a positive number" });
    }
    if (isNaN(HRA) || HRA < 0) {
      return res.status(400).json({ message: "HRA must be a non-negative number" });
    }
    if (isNaN(ALLOWANCE) || ALLOWANCE < 0) {
      return res.status(400).json({ message: "Allowance must be a non-negative number" });
    }

    // Calculate salary components
    const { totalSalary, pf, tds, netSalary } = calculateSalaryComponents(BASIC, HRA, ALLOWANCE);

    const query = `
      INSERT INTO SALARY 
      (EID, BASIC, HRA, ALLOWANCE, SALARY, PF, TDS, NET_SALARY)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      EID, BASIC, HRA, ALLOWANCE,
      totalSalary, pf, tds, netSalary
    ]);

    const [newSalary] = await pool.execute(`SELECT * FROM SALARY WHERE EID = ?`, [EID]);

    res.json({
      success: true,
      message: "Salary added successfully",
      data: newSalary[0]
    });

  } catch (err) {
    console.error("Database error:", err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: "Salary record already exists for this employee"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add salary",
      error: err.message
    });
  }
});

// Update Salary
app.put("/update-salary/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const { BASIC, HRA, ALLOWANCE } = req.body;

    // Validation
    if (isNaN(BASIC) || BASIC <= 0) {
      return res.status(400).json({ message: "Basic Salary must be a positive number" });
    }
    if (isNaN(HRA) || HRA < 0) {
      return res.status(400).json({ message: "HRA must be a non-negative number" });
    }
    if (isNaN(ALLOWANCE) || ALLOWANCE < 0) {
      return res.status(400).json({ message: "Allowance must be a non-negative number" });
    }

    // Calculate salary components
    const { totalSalary, pf, tds, netSalary } = calculateSalaryComponents(BASIC, HRA, ALLOWANCE);

    const query = `
      UPDATE SALARY 
      SET BASIC = ?, HRA = ?, ALLOWANCE = ?, SALARY = ?, PF = ?, TDS = ?, NET_SALARY = ?
      WHERE EID = ?
    `;

    const [result] = await pool.execute(query, [
      BASIC, HRA, ALLOWANCE,
      totalSalary, pf, tds, netSalary,
      eid
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    const [updatedSalary] = await pool.execute(`SELECT * FROM SALARY WHERE EID = ?`, [eid]);

    res.json({
      success: true,
      message: "Salary updated successfully",
      data: updatedSalary[0]
    });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update salary",
      error: err.message
    });
  }
});

// View all salary data
app.get('/view-salary', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.EID,
        em.FIRSTNAME,
        em.LASTNAME,
        s.BASIC,
        s.HRA,
        s.ALLOWANCE,
        s.SALARY,
        s.PF,
        s.TDS,
        s.NET_SALARY
      FROM SALARY s
      JOIN EMPLOYEE_MASTER em ON s.EID = em.EID
      ORDER BY s.EID DESC
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching salary data:', err);
    res.status(500).json({ error: 'Failed to fetch salary data' });
  }
});

// Delete salary record
app.delete('/delete-salary/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM SALARY WHERE EID = ?', [eid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    res.json({ success: true, message: 'Salary record deleted successfully' });
  } catch (err) {
    console.error('Error deleting salary:', err);
    res.status(500).json({ success: false, message: 'Failed to delete salary' });
  }
});

// Faculty Viewing Salary
app.get('/api/faculty/salary/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT BASIC, HRA, ALLOWANCE, SALARY, PF, TDS, NET_SALARY FROM SALARY WHERE EID = ?', 
      [eid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No salary data found for this employee.' });
    }
    
    // Calculate any missing fields if necessary
    const salaryData = rows[0];
    if (!salaryData.PF || !salaryData.TDS || !salaryData.NET_SALARY) {
      // Calculate PF (12% of Basic)
      salaryData.PF = (salaryData.BASIC * 0.12).toFixed(2);
      
      // Calculate TDS based on annual salary
      const annualSalary = salaryData.SALARY * 12;
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
      }
      
      salaryData.TDS = tds.toFixed(2);
      
      // Calculate Net Salary
      salaryData.NET_SALARY = (salaryData.SALARY - salaryData.PF - salaryData.TDS).toFixed(2);
    }
    
    res.json(salaryData);
  } catch (err) {
    console.error('Error fetching faculty salary:', err);
    res.status(500).json({ error: 'Failed to fetch salary data.' });
  }
});

// Salary Update with History Tracking
app.post('/api/salary/update', async (req, res) => {
  const { EID, BASIC, HRA, ALLOWANCE } = req.body;
  
  try {
    // Get current salary
    const [current] = await pool.execute(
      'SELECT * FROM SALARY WHERE EID = ?', 
      [EID]
    );
    
    if (current.length > 0) {
      // Archive current salary
      await pool.execute(
        `UPDATE SALARY_HISTORY SET effective_to = CURDATE() 
         WHERE EID = ? AND effective_to IS NULL`,
        [EID]
      );
      
      await pool.execute(
        `INSERT INTO SALARY_HISTORY 
         (EID, BASIC, HRA, ALLOWANCE, SALARY, PF, TDS, NET_SALARY, effective_from)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          EID, 
          current[0].BASIC, 
          current[0].HRA, 
          current[0].ALLOWANCE,
          current[0].SALARY,
          current[0].PF,
          current[0].TDS,
          current[0].NET_SALARY
        ]
      );
    }
    
    // Calculate new salary components
    const { totalSalary, pf, tds, netSalary } = calculateSalaryComponents(BASIC, HRA, ALLOWANCE);
    
    // Update current salary
    await pool.execute(
      `UPDATE SALARY SET 
       BASIC = ?, HRA = ?, ALLOWANCE = ?, SALARY = ?, PF = ?, TDS = ?, NET_SALARY = ?
       WHERE EID = ?`,
      [BASIC, HRA, ALLOWANCE, totalSalary, pf, tds, netSalary, EID]
    );
    
    res.json({ success: true, message: 'Salary updated successfully' });
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ error: 'Failed to update salary' });
  }
});

app.get('/api/payroll/:eid/:year/:month', async (req, res) => {
  const { eid, year, month } = req.params;
  const targetDate = `${year}-${month.padStart(2, '0')}-01`;
  
  try {
    // Try to get historical data first
    const [historical] = await pool.execute(
      `SELECT * FROM SALARY_HISTORY 
       WHERE EID = ? AND effective_from <= ?
       ORDER BY effective_from DESC LIMIT 1`,
      [eid, targetDate]
    );

    // Fallback to current salary
    if (historical.length === 0) {
      const [current] = await pool.execute(
        'SELECT * FROM SALARY WHERE EID = ?',
        [eid]
      );
      return res.json(current[0] || { error: 'No payroll data found' });
    }

    res.json(historical[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
});

app.get('/api/payroll/download/:eid/:year/:month', async (req, res) => {
  const { eid, year, month } = req.params;

  try {
    // 1. Get employee info
    const [employee] = await pool.execute(
      'SELECT FIRSTNAME, LASTNAME FROM EMPLOYEE_MASTER WHERE EID = ?',
      [eid]
    );

    if (!employee.length) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // 2. Get payroll data
    const [payroll] = await pool.execute(
      `SELECT * FROM SALARY WHERE EID = ?`,
      [eid]
    );

    if (!payroll.length) {
      return res.status(404).json({ error: 'No payroll data found' });
    }

    // 3. Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `Payslip_${employee[0].FIRSTNAME}_${year}_${month}.pdf`;

    // Response headers
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // Format helper (no ₹ to avoid "¹" issue)
    const formatNumber = (amount) => {
      return Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // ✅ Logo positioning
    const logoWidth = 100;
    const logoHeight = 80;
    const rightMargin = 50;
    const topMargin = 50;

    try {
      const logoPath = path.join(__dirname, 'Sayhadri_logo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(
          logoPath,
          doc.page.width - logoWidth - rightMargin,
          topMargin,
          { width: logoWidth, height: logoHeight }
        );
      } else {
        console.warn('Logo not found at:', logoPath);
      }
    } catch (logoErr) {
      console.error('Error loading logo:', logoErr);
    }

    // Current date
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Content starts below logo
    const contentStartY = topMargin + logoHeight + 70;
    doc.y = contentStartY;

    // PDF Title
    doc.font('Helvetica-Bold').fontSize(20)
       .text('PAYSLIP', { align: 'center' })
       .moveDown();

    // Generated date
    doc.font('Helvetica').fontSize(10)
       .text(`Generated on: ${generatedDate}`, { align: 'right' })
       .moveDown();

    // Employee info
    doc.font('Helvetica').fontSize(14)
       .text(`Employee: ${employee[0].FIRSTNAME} ${employee[0].LASTNAME}`)
       .text(`Employee ID: ${eid}`)
       .text(`Pay Period: ${month}/${year}`)
       .moveDown();

    // Salary details
    doc.font('Helvetica-Bold').text('EARNINGS', { underline: true });
    doc.font('Helvetica')
       .text(`Basic Salary: ${formatNumber(payroll[0].BASIC)}`)
       .text(`HRA: ${formatNumber(payroll[0].HRA)}`)
       .text(`Allowance: ${formatNumber(payroll[0].ALLOWANCE)}`)
       .moveDown();

    doc.font('Helvetica-Bold').text('DEDUCTIONS', { underline: true });
    doc.font('Helvetica')
       .text(`PF (12%): ${formatNumber(payroll[0].PF)}`)
       .text(`TDS: ${formatNumber(payroll[0].TDS)}`)
       .moveDown();

    doc.font('Helvetica-Bold')
       .text(`Net Salary: ${formatNumber(payroll[0].NET_SALARY)}`, { align: 'right' });

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error('Error generating PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
});



// app.get('/api/payroll/download/:eid/:year/:month', async (req, res) => {
//   const { eid, year, month } = req.params;
  
//   try {
//     // 1. Get employee info
//     const [employee] = await pool.execute(
//       'SELECT FIRSTNAME, LASTNAME FROM EMPLOYEE_MASTER WHERE EID = ?',
//       [eid]
//     );

//     if (!employee.length) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     // 2. Get payroll data
//     const [payroll] = await pool.execute(
//       `SELECT * FROM SALARY WHERE EID = ?`,
//       [eid]
//     );

//     if (!payroll.length) {
//       return res.status(404).json({ error: 'No payroll data found' });
//     }

//     // 3. Create PDF
//     const doc = new PDFDocument();
//     const filename = `Payslip_${employee[0].FIRSTNAME}_${year}_${month}.pdf`;
    
//     // Set response headers
//     res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//     res.setHeader('Content-type', 'application/pdf');

//     // Pipe PDF to response
//     doc.pipe(res);

//     // Logo positioning - Top Right Corner with margin
//     const logoWidth = 100;
//     const logoHeight = 80;
//     const rightMargin = 50; // 50px from right edge
//     const topMargin = 50;   // 50px from top edge
    
//     try {
//       const logoPath = path.join(__dirname, 'Sayhadri_logo.jpg');
//       if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, 
//           doc.page.width - logoWidth - rightMargin, // X position (right-aligned)
//           topMargin,                               // Y position
//           { width: logoWidth, height: logoHeight } // Dimensions
//         );
//       } else {
//         console.warn('Logo not found at:', logoPath);
//       }
//     } catch (logoErr) {
//       console.error('Error loading logo:', logoErr);
//     }

//     // Current date for payroll generation
//     const generatedDate = new Date().toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//     // Content starts below logo with 70px gap
//     const contentStartY = topMargin + logoHeight + 70;
//     doc.y = contentStartY;

//     // PDF Content
//     doc.fontSize(20)
//        .text('PAYSLIP', { align: 'center' })
//        .moveDown();
    
//     // Generation date
//     doc.fontSize(10)
//        .text(`Generated on: ${generatedDate}`, { align: 'right' })
//        .moveDown();

//     // Employee info
//     doc.fontSize(14)
//        .text(`Employee: ${employee[0].FIRSTNAME} ${employee[0].LASTNAME}`)
//        .text(`Employee ID: ${eid}`)
//        .text(`Pay Period: ${month}/${year}`)
//        .moveDown();

//     // Salary details - using list: false to disable automatic numbering
//     doc.font('Helvetica-Bold').text('EARNINGS', { underline: true });
//     doc.font('Helvetica')
//        .text(`Basic Salary: ₹${Number(payroll[0].BASIC).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { list: false })
//        .text(`HRA: ₹${Number(payroll[0].HRA).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { list: false })
//        .text(`Allowance: ₹${Number(payroll[0].ALLOWANCE).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { list: false })
//        .moveDown();

//     doc.font('Helvetica-Bold').text('DEDUCTIONS', { underline: true });
//     doc.font('Helvetica')
//        .text(`PF (12%): ₹${Number(payroll[0].PF).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { list: false })
//        .text(`TDS: ₹${Number(payroll[0].TDS).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, { list: false })
//        .moveDown();

//     doc.font('Helvetica-Bold')
//        .text(`Net Salary: ₹${Number(payroll[0].NET_SALARY).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
//        { align: 'right', list: false });

//     // Finalize PDF
//     doc.end();

//   } catch (err) {
//     console.error('Error generating PDF:', err);
//     if (!res.headersSent) {
//       res.status(500).json({ error: 'Failed to generate PDF' });
//     }
//   }
// });


// ------------------- Leave Management Routes -------------------

// Apply for leave
app.post("/apply-leave", async (req, res) => {
  try {
    const { EID, LTYPE, from_date, to_date, no_of_days, reason, handover_to } = req.body;

    // Validate required fields
    if (!EID || !LTYPE || !from_date || !to_date || !no_of_days) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check date validity
    if (new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ error: "From date cannot be after to date" });
    }

    // Check if handover_to is valid (not self and exists in system)
    if (handover_to) {
      if (parseInt(handover_to) === EID) {
        return res.status(400).json({ error: "Cannot handover to yourself" });
      }
      
      const [user] = await pool.query('SELECT EID FROM employee_master WHERE EID = ?', [handover_to]);
      if (!user) {
        return res.status(400).json({ error: "Invalid handover employee" });
      }
    }

    const sql = `
      INSERT INTO emp_leave (EID, LTYPE, from_date, to_date, no_of_days, reason, handover_to, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;
    
    await pool.query(sql, [
      EID, 
      LTYPE, 
      from_date, 
      to_date, 
      no_of_days, 
      reason, 
      handover_to || null
    ]);

    res.json({ message: "Leave applied successfully" });
  } catch (err) {
    console.error("Leave application error:", err);
    res.status(500).json({ error: "Failed to apply leave" });
  }
});

// Get colleagues for handover
app.get('/api/colleagues/:eid', async (req, res) => {
  try {
    const { eid } = req.params;
    const [rows] = await pool.query(
      `SELECT EID, CONCAT(FIRSTNAME, ' ', LASTNAME) as name, DESIGNATION as designation 
       FROM employee_master 
       WHERE EID != ? 
       ORDER BY FIRSTNAME`,
      [eid]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching colleagues:", err);
    res.status(500).json({ error: "Failed to fetch colleagues" });
  }
});

// Assign leave quotas
app.post("/assign-leave", async (req, res) => {
  try {
    const { EID, fiscal_year, leaveData } = req.body;
    const columns = Object.keys(leaveData).join(", ");
    const values = Object.values(leaveData);
    const placeholders = Object.keys(leaveData).map(() => "?").join(", ");

    const sql = `
      INSERT INTO emp_leave_type (EID, fiscal_year, ${columns})
      VALUES (?, ?, ${placeholders})
      ON DUPLICATE KEY UPDATE ${Object.keys(leaveData)
        .map(col => `${col} = VALUES(${col})`)
        .join(", ")}
    `;
    
    await pool.query(sql, [EID, fiscal_year, ...values]);
    res.json({ message: "Leave assigned successfully" });
  } catch (err) {
    console.error("Leave assignment error:", err);
    res.status(500).json({ 
      error: "Failed to assign leave",
      details: err.message 
    });
  }
});

// Get employee list
app.get("/get-employees", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT EID, FIRSTNAME, LASTNAME FROM employee_master");
    res.json(results);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Get leave data
app.get("/get-leave-data", async (req, res) => {
  try {
    const { year } = req.query;
    const [results] = await pool.query(
      "SELECT * FROM emp_leave_type WHERE fiscal_year = ?", 
      [year]
    );
    
    // Convert array to object with EID as key
    const leaveData = {};
    results.forEach(row => {
      leaveData[row.EID] = {
        LEAVE_EL: row.LEAVE_EL ?? null,
        LEAVE_CL: row.LEAVE_CL ?? null,
        LEAVE_VL: row.LEAVE_VL ?? null,
        LEAVE_SCL: row.LEAVE_SCL ?? null,
        LEAVE_RH: row.LEAVE_RH ?? null,
        LEAVE_OOD: row.LEAVE_OOD ?? null,
        LEAVE_OTHER: row.LEAVE_OTHER ?? null,
        LEAVE_COMPOFF: row.LEAVE_COMPOFF ?? null
      };
    });
    
    res.json(leaveData);
  } catch (err) {
    console.error("Error fetching leave data:", err);
    res.status(500).json({ error: "Failed to fetch leave data" });
  }
});

// View leave requests
app.get("/view-leave", async(req, res) => {
  try {  
    const { role, EID } = req.query;

    let sql = `
      SELECT l.leave_id, l.EID, e.FIRSTNAME, e.LASTNAME, l.LTYPE, 
            l.from_date, l.to_date, l.no_of_days, l.reason, CONCAT(h.FIRSTNAME, ' ', h.LASTNAME) AS handover_name, 
            l.status, l.applied_date
      FROM emp_leave l
      JOIN employee_master e ON l.EID = e.EID
      LEFT JOIN employee_master h ON l.handover_to = h.EID
    `;
    const params = [];

    if (role === "faculty") {
      sql += " WHERE l.EID = ?";
      params.push(EID);
    }

    sql += " ORDER BY l.applied_date DESC";

    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("Error fetching leave requests:", err);
    res.status(500).json({ error: "Failed to fetch leave requests"});
  }
});

// Update leave status
app.put("/update-leave-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const leave_id = req.params.id;

    const sql = "UPDATE emp_leave SET status = ? WHERE leave_id = ?";
    await pool.query(sql, [status, leave_id]);

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

// ------------------- Server Startup -------------------
app.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});