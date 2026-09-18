import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* =========================
   RECRUITER PAGES
========================= */

import RecruiterOnboarding from "./pages/recruiter/Onboarding";
import RecruiterOpportunities from "./pages/recruiter/Opportunities";
import CreateOpportunity from "./pages/recruiter/CreateOpportunities";
import RecruiterCandidates from "./pages/recruiter/Candidates";
import CandidateDetails from "./pages/recruiter/CandidateDetails";
import Shortlist from "./pages/recruiter/Shortlist";

/* =========================
   COLLEGE PAGES
========================= */

import CollegeOnboarding from "./pages/college/Onboarding";
import DepartmentSetup from "./pages/college/DepartmentSetup";
import Students from "./pages/college/Students";

/* =========================
   STUDENT PAGES
========================= */

import StudentProfile from "./pages/student/Profile";
import StudentOpportunities from "./pages/student/StudentOpportunities";
import Assessment from "./pages/student/Assessment";
import TakeAssessment from "./pages/student/TakeAssessment";
import SkillRoadmap from "./pages/student/SkillRoadmap";

/* =========================
   PUBLIC PAGES
========================= */

import Landing from "./pages/public/Landing";
import Signup from "./pages/public/Signup";
import Login from "./pages/public/Login";
import RoleSelection from "./pages/public/RoleSelection";

/* =========================
   DASHBOARDS / ONBOARDING
========================= */

import StudentDashboard from "./pages/student/Dashboard";
import StudentOnboarding from "./pages/student/Onboarding";

import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CollegeDashboard from "./pages/college/Dashboard";

/* =========================
   LAYOUTS
========================= */

import StudentLayout from "./layouts/StudentLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import CollegeLayout from "./layouts/CollegeLayout";

/* =========================
   AUTH
========================= */

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/select-role"
          element={<RoleSelection />}
        />

        {/* =========================
            STUDENT PORTAL
        ========================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<StudentDashboard />}
          />

          <Route
            path="onboarding"
            element={<StudentOnboarding />}
          />

          <Route
            path="profile"
            element={<StudentProfile />}
          />

          <Route
            path="assessment"
            element={<Assessment />}
          />

          <Route
            path="assessment/:skillId"
            element={<TakeAssessment />}
          />

          <Route
            path="opportunities"
            element={<StudentOpportunities />}
          />

          <Route
            path="roadmap"
            element={<SkillRoadmap />}
          />
        </Route>

        {/* =========================
            RECRUITER PORTAL
        ========================= */}

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<RecruiterDashboard />}
          />

          <Route
            path="onboarding"
            element={<RecruiterOnboarding />}
          />

          <Route
            path="opportunities"
            element={<RecruiterOpportunities />}
          />

          <Route
            path="opportunities/create"
            element={<CreateOpportunity />}
          />

          <Route
            path="candidates"
            element={<RecruiterCandidates />}
          />

          <Route
            path="candidates/:applicationId"
            element={<CandidateDetails />}
          />

          <Route
            path="shortlist"
            element={<Shortlist />}
          />
        </Route>

        {/* =========================
            COLLEGE PORTAL
        ========================= */}

        <Route
          path="/college"
          element={
            <ProtectedRoute allowedRole="college">
              <CollegeLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<CollegeDashboard />}
          />

          <Route
            path="onboarding"
            element={<CollegeOnboarding />}
          />

          <Route
            path="departments"
            element={<DepartmentSetup />}
          />

          <Route
            path="students"
            element={<Students />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;