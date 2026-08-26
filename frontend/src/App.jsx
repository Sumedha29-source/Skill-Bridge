import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/public/Landing";
import Signup from "./pages/public/Signup";
import Login from "./pages/public/Login";
import RoleSelection from "./pages/public/RoleSelection";

import StudentDashboard from "./pages/student/Dashboard";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CollegeDashboard from "./pages/college/Dashboard";

import StudentLayout from "./layouts/StudentLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import CollegeLayout from "./layouts/CollegeLayout";

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
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* Recruiter portal */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<RecruiterDashboard />} />
        </Route>

        {/* College portal */}
        <Route path="/college" element={<CollegeLayout />}>
          <Route index element={<CollegeDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;