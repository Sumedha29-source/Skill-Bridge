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

import FacultyOpportunities from "./pages/recruiter/FacultyOpportunities";
import CreateFacultyOpportunity from "./pages/recruiter/CreateFacultyOpportunity";

/* =========================
   COLLEGE PAGES
========================= */

import CollegeOnboarding from "./pages/college/Onboarding";
import DepartmentSetup from "./pages/college/DepartmentSetup";
import Students from "./pages/college/Students";
import SkillGapMap from "./pages/college/SkillGapMap";
import Training from "./pages/college/Training";

/* =========================
   STUDENT PAGES
========================= */

import StudentProfile from "./pages/student/Profile";
import StudentOpportunities from "./pages/student/StudentOpportunities";
import Assessment from "./pages/student/Assessment";
import TakeAssessment from "./pages/student/TakeAssessment";
import SkillRoadmap from "./pages/student/SkillRoadmap";

/* =========================
   FACULTY PAGES
========================= */

import FacultyOnboarding from "./pages/faculty/Onboarding";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyOpportunitiesPage from "./pages/faculty/Opportunities";

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
import FacultyLayout from "./layouts/FacultyLayout";

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
          {/* STUDENT DASHBOARD */}

          <Route
            index
            element={<StudentDashboard />}
          />

          {/* STUDENT ONBOARDING */}

          <Route
            path="onboarding"
            element={<StudentOnboarding />}
          />

          {/* STUDENT PROFILE */}

          <Route
            path="profile"
            element={<StudentProfile />}
          />

          {/* ASSESSMENTS */}

          <Route
            path="assessment"
            element={<Assessment />}
          />

          <Route
            path="assessment/:skillId"
            element={<TakeAssessment />}
          />

          {/* OPPORTUNITIES */}

          <Route
            path="opportunities"
            element={<StudentOpportunities />}
          />

          {/* SKILL ROADMAP */}

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
          {/* RECRUITER DASHBOARD */}

          <Route
            index
            element={<RecruiterDashboard />}
          />

          {/* RECRUITER ONBOARDING */}

          <Route
            path="onboarding"
            element={<RecruiterOnboarding />}
          />

          {/* STUDENT OPPORTUNITIES */}

          <Route
            path="opportunities"
            element={<RecruiterOpportunities />}
          />

          <Route
            path="opportunities/create"
            element={<CreateOpportunity />}
          />

          {/* FACULTY COLLABORATIONS */}

          <Route
            path="faculty-opportunities"
            element={<FacultyOpportunities />}
          />

          <Route
            path="faculty-opportunities/create"
            element={<CreateFacultyOpportunity />}
          />

          {/* CANDIDATES */}

          <Route
            path="candidates"
            element={<RecruiterCandidates />}
          />

          <Route
            path="candidates/:applicationId"
            element={<CandidateDetails />}
          />

          {/* SHORTLIST */}

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
          {/* COLLEGE DASHBOARD */}

          <Route
            index
            element={<CollegeDashboard />}
          />

          {/* COLLEGE ONBOARDING */}

          <Route
            path="onboarding"
            element={<CollegeOnboarding />}
          />

          {/* DEPARTMENTS */}

          <Route
            path="departments"
            element={<DepartmentSetup />}
          />

          {/* STUDENTS */}

          <Route
            path="students"
            element={<Students />}
          />

          {/* SKILL GAP MAP */}

          <Route
            path="skill-gap"
            element={<SkillGapMap />}
          />

          {/* TRAINING */}

          <Route
            path="training"
            element={<Training />}
          />
        </Route>

        {/* =========================
            FACULTY PORTAL
        ========================= */}

        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          {/* FACULTY DASHBOARD */}

          <Route
            index
            element={<FacultyDashboard />}
          />

          {/* FACULTY ONBOARDING */}

          <Route
            path="onboarding"
            element={<FacultyOnboarding />}
          />

          {/* FACULTY OPPORTUNITIES */}

          <Route
            path="opportunities"
            element={<FacultyOpportunitiesPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;