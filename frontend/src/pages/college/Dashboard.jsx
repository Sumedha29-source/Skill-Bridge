import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function CollegeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      setLoading(true);
      setError("");

      // 1. Find the institution linked to this logged-in college member.
      const { data: memberData, error: memberError } = await supabase
        .from("institution_members")
        .select("institution_id, member_role, designation, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      if (!memberData?.institution_id) {
        setError("No institution is linked to this college account yet.");
        setLoading(false);
        return;
      }

      setMember(memberData);

      const institutionId = memberData.institution_id;

      // 2. Load institution, departments and registered students.
      const [institutionResult, departmentResult, studentResult] =
        await Promise.all([
          supabase
            .from("institutions")
            .select(
              "id, name, state, official_email, website, aishe_code, institution_code"
            )
            .eq("id", institutionId)
            .maybeSingle(),

          supabase
            .from("departments")
            .select("id, name, code, student_count")
            .eq("institution_id", institutionId)
            .order("name"),

          supabase
            .from("student_profiles")
            .select(
              "user_id, department_id, profile_completion, verification_status, cgpa"
            )
            .eq("institution_id", institutionId),
        ]);

      if (institutionResult.error) {
        setError(institutionResult.error.message);
        setLoading(false);
        return;
      }

      if (departmentResult.error) {
        setError(departmentResult.error.message);
        setLoading(false);
        return;
      }

      if (studentResult.error) {
        setError(studentResult.error.message);
        setLoading(false);
        return;
      }

      setInstitution(institutionResult.data || null);
      setDepartments(departmentResult.data || []);
      setStudents(studentResult.data || []);
      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  const stats = useMemo(() => {
    const totalDeclaredStudents = departments.reduce(
      (sum, department) => sum + Number(department.student_count || 0),
      0
    );

    const verifiedStudents = students.filter(
      (student) => student.verification_status === "verified"
    ).length;

    const pendingStudents = students.filter(
      (student) =>
        !student.verification_status ||
        student.verification_status === "pending"
    ).length;

    const profilesWithCompletion = students
      .map((student) => Number(student.profile_completion || 0))
      .filter((value) => Number.isFinite(value));

    const averageProfileCompletion = profilesWithCompletion.length
      ? Math.round(
          profilesWithCompletion.reduce((sum, value) => sum + value, 0) /
            profilesWithCompletion.length
        )
      : 0;

    return {
      totalDeclaredStudents,
      registeredStudents: students.length,
      verifiedStudents,
      pendingStudents,
      averageProfileCompletion,
    };
  }, [departments, students]);

  const departmentRows = useMemo(() => {
    return departments.map((department) => {
      const registered = students.filter(
        (student) => student.department_id === department.id
      ).length;

      return {
        ...department,
        registered,
      };
    });
  }, [departments, students]);

  if (loading) {
    return <div className="college-dashboard-state">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="college-dashboard-state error">
        Could not load dashboard: {error}
      </div>
    );
  }

  const accountName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "College Admin";

  return (
    <div className="college-dashboard">
      <section className="college-dashboard-hero">
        <div>
          <div className="college-dashboard-eyebrow">
            // institution overview
          </div>

          <h1>
            Welcome, <span>{accountName}</span>.
          </h1>

          <p>
            Track student onboarding, department coverage and placement
            readiness from one college workspace.
          </p>
        </div>

        <div className="college-institution-badge">
          <span></span>
          {institution?.name || "Institution"}
        </div>
      </section>

      <section className="college-stat-grid">
        <article className="college-stat-card">
          <span className="college-stat-label">Departments</span>
          <strong>{departments.length}</strong>
          <span className="college-stat-foot">Configured on SkillBridge</span>
        </article>

        <article className="college-stat-card">
          <span className="college-stat-label">Registered students</span>
          <strong>{stats.registeredStudents}</strong>
          <span className="college-stat-foot">
            {stats.totalDeclaredStudents
              ? `of ${stats.totalDeclaredStudents} declared`
              : "Student profiles linked"}
          </span>
        </article>

        <article className="college-stat-card">
          <span className="college-stat-label">Pending verification</span>
          <strong>{stats.pendingStudents}</strong>
          <span className="college-stat-foot">
            {stats.verifiedStudents} verified
          </span>
        </article>

        <article className="college-stat-card">
          <span className="college-stat-label">
            Avg. profile completion
          </span>
          <strong>{stats.averageProfileCompletion}%</strong>

          <div className="college-progress-track">
            <div
              className="college-progress-fill"
              style={{
                width: `${Math.min(
                  stats.averageProfileCompletion,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </article>
      </section>

      <section className="college-dashboard-grid">
        <article className="college-dashboard-card college-institution-card">
          <div className="college-card-heading">
            <div>
              <span className="college-card-kicker">// institution</span>
              <h2>College details</h2>
            </div>
          </div>

          <div className="college-detail-grid">
            <div>
              <span>College</span>
              <strong>{institution?.name || "Not set"}</strong>
            </div>

            <div>
              <span>State</span>
              <strong>{institution?.state || "Not set"}</strong>
            </div>

            <div>
              <span>AISHE code</span>
              <strong>{institution?.aishe_code || "Not set"}</strong>
            </div>

            <div>
              <span>Institution code</span>
              <strong>
                {institution?.institution_code || "Not set"}
              </strong>
            </div>

            <div>
              <span>Official email</span>
              <strong>
                {institution?.official_email || "Not set"}
              </strong>
            </div>

            <div>
              <span>Your designation</span>
              <strong>{member?.designation || "Placement Officer"}</strong>
            </div>
          </div>
        </article>

        <article className="college-dashboard-card college-next-step-card">
          <span className="college-card-kicker">// next best action</span>

          <h2>
            {departments.length
              ? "Grow student participation"
              : "Set up your departments"}
          </h2>

          <p>
            {departments.length
              ? "Your departments are ready. The next milestone is bringing student profiles into the institution workspace."
              : "Departments are required before SkillBridge can organize students, readiness and skill-gap insights."}
          </p>

          <button
            type="button"
            className="college-primary-action"
            onClick={() => navigate("/college/departments")}
          >
            Manage departments
            <span>→</span>
          </button>
        </article>
      </section>

      <section className="college-dashboard-card college-department-card">
        <div className="college-card-heading">
          <div>
            <span className="college-card-kicker">// departments</span>
            <h2>Department coverage</h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/college/departments")}
          >
            Edit departments
          </button>
        </div>

        {departmentRows.length === 0 ? (
          <div className="college-empty-state">
            No departments have been configured yet.
          </div>
        ) : (
          <div className="college-department-list">
            {departmentRows.map((department) => (
              <div
                key={department.id}
                className="college-department-row"
              >
                <div className="college-department-name">
                  <span className="college-department-icon">
                    {department.code?.slice(0, 2)?.toUpperCase() || "DP"}
                  </span>

                  <div>
                    <strong>{department.name}</strong>
                    <span>{department.code || "No code"}</span>
                  </div>
                </div>

                <div className="college-department-metric">
                  <span>Registered</span>
                  <strong>{department.registered}</strong>
                </div>

                <div className="college-department-metric">
                  <span>Declared</span>
                  <strong>{department.student_count || 0}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="college-dashboard-card college-roadmap-card">
        <div className="college-card-heading">
          <div>
            <span className="college-card-kicker">
              // academia-industry pipeline
            </span>
            <h2>What comes next</h2>
          </div>
        </div>

        <div className="college-journey">
          <div className="college-journey-item done">
            <span className="college-journey-index">01</span>
            <div>
              <strong>Institution setup</strong>
              <p>College details added to SkillBridge.</p>
            </div>
          </div>

          <div
            className={`college-journey-item ${
              departments.length > 0 ? "done" : ""
            }`}
          >
            <span className="college-journey-index">02</span>
            <div>
              <strong>Departments</strong>
              <p>Organize students by academic department.</p>
            </div>
          </div>

          <div
            className={`college-journey-item ${
              students.length > 0 ? "done" : ""
            }`}
          >
            <span className="college-journey-index">03</span>
            <div>
              <strong>Student readiness</strong>
              <p>Track student profiles and verification status.</p>
            </div>
          </div>

          <div className="college-journey-item">
            <span className="college-journey-index">04</span>
            <div>
              <strong>Skill gap intelligence</strong>
              <p>
                Compare student skills with industry demand and recommend
                training.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CollegeDashboard;
