import { NavLink, Outlet, useNavigate } from "react-router-dom";

import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../hooks/useAuth";
import "./CollegeLayout.css";

function CollegeLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const accountName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "College Admin";

  return (
    <div className="college-shell">
      <aside className="college-sidebar">
        <button
          type="button"
          className="college-sidebar-logo"
          onClick={() => navigate("/")}
          aria-label="Go to SkillBridge home"
        >
          <span className="college-sidebar-mark">
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

        <div className="college-sidebar-role">
          <span className="college-role-dot"></span>
          College workspace
        </div>

        <nav className="college-sidebar-nav">
          {/* DASHBOARD */}

          <NavLink
            to="/college"
            end
            className={({ isActive }) =>
              `college-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>

            Dashboard
          </NavLink>

          {/* DEPARTMENTS */}

          <NavLink
            to="/college/departments"
            className={({ isActive }) =>
              `college-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 20V8l8-4 8 4v12" />
              <path d="M8 20v-6h8v6M9 10h.01M15 10h.01" />
            </svg>

            Departments
          </NavLink>

          {/* STUDENTS */}

          <NavLink
            to="/college/students"
            className={({ isActive }) =>
              `college-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="8" r="3" />
              <circle cx="17" cy="10" r="2" />
              <path d="M3 20c.6-4 2.8-6 6-6s5.4 2 6 6M15 15c3 0 5 1.7 6 5" />
            </svg>

            Students
          </NavLink>

          {/* SKILL GAP MAP */}

          <NavLink
            to="/college/skill-gap"
            className={({ isActive }) =>
              `college-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
            </svg>

            Skill gap map
          </NavLink>

          {/* TRAINING */}

          <NavLink
            to="/college/training"
            className={({ isActive }) =>
              `college-nav-item ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
            </svg>

            Training
          </NavLink>
        </nav>

        <div className="college-sidebar-bottom">
          <div className="college-user-card">
            <div className="college-avatar">
              {accountName.charAt(0).toUpperCase()}
            </div>

            <div className="college-user-copy">
              <strong>{accountName}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <div className="college-main-area">
        <header className="college-topbar">
          <span className="college-topbar-kicker">
            // college portal
          </span>

          <button
            type="button"
            className="college-department-shortcut"
            onClick={() =>
              navigate("/college/departments")
            }
          >
            Manage departments
          </button>
        </header>

        <main className="college-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CollegeLayout;