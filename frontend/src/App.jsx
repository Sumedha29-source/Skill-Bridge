import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/public/Landing";
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
        <Route path="/" element={<Landing />} />

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
        </Route>

        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<RecruiterDashboard />} />
        </Route>

        <Route path="/college" element={<CollegeLayout />}>
          <Route index element={<CollegeDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;