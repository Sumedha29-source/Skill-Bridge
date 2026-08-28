import { BrowserRouter, Routes, Route } from "react-router-dom";

import RecruiterOnboarding from "./pages/recruiter/Onboarding";
import CollegeOnboarding from "./pages/college/Onboarding";
import DepartmentSetup from "./pages/college/DepartmentSetup";

import Landing from "./pages/public/Landing";
import Signup from "./pages/public/Signup";
import Login from "./pages/public/Login";
import RoleSelection from "./pages/public/RoleSelection";

import StudentDashboard from "./pages/student/Dashboard";
import StudentOnboarding from "./pages/student/Onboarding";

import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CollegeDashboard from "./pages/college/Dashboard";

import StudentLayout from "./layouts/StudentLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import CollegeLayout from "./layouts/CollegeLayout";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-role" element={<RoleSelection />} />

        {/* Student portal */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="onboarding" element={<StudentOnboarding />} />
        </Route>

        {/* Recruiter portal */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RecruiterDashboard />} />
          <Route path="onboarding" element={<RecruiterOnboarding />} />
        </Route>

        {/* College portal */}
        <Route
          path="/college"
          element={
            <ProtectedRoute allowedRole="college">
              <CollegeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CollegeDashboard />} />
          <Route path="onboarding" element={<CollegeOnboarding />} />
          <Route path="departments" element={<DepartmentSetup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;