import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HRDashboard from './components/HRDashboard';
import AddEmployee from './components/AddEmployee';
import ViewEmployees from './components/ViewEmployees';
import AddDepartment from './components/AddDepartment';
import ViewDepartments from './components/ViewDepartments';
import FacultyPasswordReset from './components/FacultyPasswordReset';
import FacultyDashboard from './components/FacultyDashboard';
import AddSalary from './components/AddSalary';
import ViewSalary from './components/ViewSalary';
import FacultyHome from './components/FacultyHome';
import FacultySalary from './components/FacultySalary';
import ViewFacultySalary from "./components/ViewFacultySalary";
import ViewLeave from './components/ViewLeave';
import LeaveForm from './components/LeaveForm';
import LeaveAssign from './components/LeaveAssign';
import FacultyLeaveView from './components/FacultyViewLeave';
import Payroll from './components/Payroll';   // ✅ NEW Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/view-employees" element={<ViewEmployees />} />
        <Route path="/add-department" element={<AddDepartment />} />
        <Route path="/view-departments" element={<ViewDepartments />} />
        <Route path="/faculty-reset-password" element={<FacultyPasswordReset />} />
        <Route path="/faculty-dashboard/:eid" element={<FacultyDashboard />} />
        <Route path="/add-salary" element={<AddSalary />} />
        <Route path="/add-salary/:employeeId" element={<AddSalary />} />
        <Route path="/view-salary" element={<ViewSalary />} />
        <Route path="/faculty-home/:eid" element={<FacultyHome />} />
        <Route path="/faculty-home" element={<FacultyHome />} />
        <Route path="/faculty-salary/:eid" element={<FacultySalary />} />
        <Route path="/faculty-salary/:eid" element={<ViewFacultySalary />} />
        <Route path="/hr/view-leave" element={<ViewLeave />} />
        <Route path="/apply-leave" element={<LeaveForm />} />
        <Route path="/assign-leave" element={<LeaveAssign />} />
        <Route path="/faculty/view-leave" element={<FacultyLeaveView />} />
        <Route path="/payroll" element={<Payroll />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
