import { NavLink, Outlet, useNavigate } from "react-router-dom";

import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../hooks/useAuth";
import "./StudentLayout.css";

function StudentLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  return (
    <div className="student-shell">
      <aside className="student-sidebar">
        <button
          type="button"
          className="student-sidebar-logo"
          onClick={() => navigate("/")}
          aria-label="Go to SkillBridge home"
        >
          <span className="student-sidebar-mark">
            <svg
              viewBox="0 0 26 22"
              width="17"
              height="14"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 15 L2 9 M24 15 L24 9" />
              <path d="M2 9 C 9 -1 17 -1 24 9" />
              <line x1="0" y1="15" x2="26" y2="15" />
              <line x1="7" y1="10" x2="7" y2="15" />
              <line x1="13" y1="7.5" x2="13" y2="15" />
              <line x1="19" y1="10" x2="19" y2="15" />
            </svg>
          </span>

          <span>
            Skill<span>Bridge</span>
          </span>
        </button>

        <div className="student-sidebar-role">
          <span className="student-role-dot"></span>
          Student workspace
        </div>

        <nav className="student-sidebar-nav">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `student-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `student-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c.8-4.2 3.4-6 8-6s7.2 1.8 8 6" />
            </svg>
            Profile
          </NavLink>

          <div className="student-nav-item disabled" title="Coming soon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16v12H4z" />
              <path d="M8 7V5h8v2M9 12h6" />
            </svg>
            Opportunities
            <span className="student-coming-soon">soon</span>
          </div>

          <div className="student-nav-item disabled" title="Coming soon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
            </svg>
            Skill roadmap
            <span className="student-coming-soon">soon</span>
          </div>
        </nav>

        <div className="student-sidebar-bottom">
          <div className="student-user-card">
            <div className="student-avatar">
              {studentName.charAt(0).toUpperCase()}
            </div>

            <div className="student-user-copy">
              <strong>{studentName}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <div className="student-main-area">
        <header className="student-topbar">
          <div>
            <span className="student-topbar-kicker">// student portal</span>
          </div>

          <button
            type="button"
            className="student-profile-shortcut"
            onClick={() => navigate("/student/profile")}
          >
            View profile
          </button>
        </header>

        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
