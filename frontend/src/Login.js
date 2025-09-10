// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// function Login() {
//   const [role, setRole] = useState('HR');
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       if (role === 'HR') {
//         // HR login
//         const response = await axios.post('http://localhost:5000/login', {
//           userId,
//           password
//         });

//         if (response.data.success) {
//           setMessage('✅ HR login successful!');
//           setTimeout(() => navigate('/hr-dashboard'), 1000);
//         } else {
//           setMessage('❌ Invalid HR credentials');
//         }
//       } 
//       else if (role === 'Faculty') {
//         // Faculty login
//         const response = await axios.post('http://localhost:5000/faculty-login', {
//           eid: userId,
//           password
//         });

//         if (response.data.success) {
//           setMessage('✅ Faculty login successful!');
//           setTimeout(() => {
//             navigate(`/faculty-dashboard/${userId}`, {
//               state: { facultyData: response.data.faculty },
//             });
//           }, 1000);
//         } else {
//           setMessage('❌ Invalid Faculty credentials');
//         }
//       }
//       else if (role === 'Payroll') {
//         // Payroll login
//         const response = await axios.post('http://localhost:5000/payroll-login', {
//           payrollId: userId,
//           password
//         });

//         if (response.data.success) {
//           setMessage('✅ Payroll login successful!');
//           setTimeout(() => navigate('/payroll-dashboard'), 1000);
//         } else {
//           setMessage('❌ Invalid Payroll credentials');
//         }
//       }
//     } catch (err) {
//       setMessage('⚠️ Server error. Try again.');
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>HRMS Login</h2>
//       <form onSubmit={handleLogin}>
//         <div>
//           <label>Role:</label>
//           <select value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="HR">HR</option>
//             <option value="Faculty">Faculty</option>
//             <option value="Payroll">Payroll</option> {/* 👈 Added Payroll */}
//           </select>
//         </div>
//         <div>
//           <label>
//             {role === 'HR'
//               ? 'User ID:'
//               : role === 'Faculty'
//               ? 'Faculty ID (EID):'
//               : 'Payroll ID:'}
//           </label>
//           <input
//             type="text"
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Login</button>
//       </form>

//       {/* Faculty-specific link */}
//       {role === 'Faculty' && (
//         <p style={{ marginTop: '10px' }}>
//           <a href="/faculty-reset-password" style={{ color: '#007bff' }}>
//             Change your password?
//           </a>
//         </p>
//       )}

//       <p>{message}</p>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [role, setRole] = useState('HR');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    if (role === 'HR') {
      const response = await axios.post('http://localhost:5000/login', {
        userId,
        password
      });

      if (response.data.success) {
        setMessage('✅ HR login successful!');
        setTimeout(() => navigate('/hr-dashboard'), 1000);
      } else {
        setMessage('❌ Invalid HR credentials');
      }

    } else {
      const response = await axios.post('http://localhost:5000/faculty-login', {
        eid: userId,
        password
      });

      if (response.data.success) {
        setMessage('✅ Faculty login successful!');
        
        // 👇👇 Navigate to faculty-home and pass the data
        setTimeout(() => {
          navigate('/faculty-home', {
            state: { facultyData: response.data.faculty }
          });
        }, 1000);
      } else {
        setMessage('❌ Invalid Faculty credentials');
      }
    }

  } catch (err) {
    setMessage('⚠ Server error. Try again.');
  }
};

  return (
    <div className="login-container">
      <h2>HRMS Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="HR">HR</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>
        <div>
          <label>{role === 'HR' ? 'User ID:' : 'Faculty ID (EID):'}</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;