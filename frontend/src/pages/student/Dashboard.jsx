import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [institutionName, setInstitutionName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [skillCount, setSkillCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      setLoading(true);
      setError("");

      const { data: studentProfile, error: profileError } = await supabase
        .from("student_profiles")
        .select(
          "institution_id, department_id, degree, current_year, current_semester, graduation_year, cgpa, profile_completion, verification_status"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(studentProfile);

      const requests = [];

      if (studentProfile?.institution_id) {
        requests.push(
          supabase
            .from("institutions")
            .select("name")
            .eq("id", studentProfile.institution_id)
            .maybeSingle()
            .then(({ data }) => {
              setInstitutionName(data?.name || "");
            })
        );
      }

      if (studentProfile?.department_id) {
        requests.push(
          supabase
            .from("departments")
            .select("name")
            .eq("id", studentProfile.department_id)
            .maybeSingle()
            .then(({ data }) => {
              setDepartmentName(data?.name || "");
            })
        );
      }

      requests.push(
        supabase
          .from("resumes")
          .select("id")
          .eq("student_id", user.id)
          .eq("is_current", true)
          .maybeSingle()
          .then(({ data }) => {
            setResumeUploaded(Boolean(data));
          })
      );

      requests.push(
        supabase
          .from("student_skills")
          .select("skill_id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .then(({ count }) => {
            setSkillCount(count || 0);
          })
      );

      requests.push(
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .then(({ count }) => {
            setMatchCount(count || 0);
          })
      );

      requests.push(
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .then(({ count }) => {
            setApplicationCount(count || 0);
          })
      );

      await Promise.allSettled(requests);
      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  if (loading) {
    return <div className="student-dashboard-state">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="student-dashboard-state error">
        Could not load dashboard: {error}
      </div>
    );
  }

  const studentName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  const completion = profile?.profile_completion ?? 0;
  const verificationStatus = profile?.verification_status || "pending";

  return (
    <div className="student-dashboard">
      <section className="student-dashboard-hero">
        <div>
          <div className="student-dashboard-eyebrow">
            // welcome back
          </div>

          <h1>
            Hi, <span>{studentName}</span>.
          </h1>

          <p>
            Build your profile, strengthen your skills and move toward the
            opportunities that fit you best.
          </p>
        </div>

        <div className={`student-verification-pill ${verificationStatus}`}>
          <span></span>
          Verification: {verificationStatus}
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <span className="student-stat-label">Profile completion</span>
          <strong>{completion}%</strong>
          <div className="student-progress-track">
            <div
              className="student-progress-fill"
              style={{ width: `${Math.min(completion, 100)}%` }}
            ></div>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-label">Skills added</span>
          <strong>{skillCount}</strong>
          <span className="student-stat-foot">Your skill profile</span>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-label">Opportunity matches</span>
          <strong>{matchCount}</strong>
          <span className="student-stat-foot">Matching engine results</span>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-label">Applications</span>
          <strong>{applicationCount}</strong>
          <span className="student-stat-foot">Tracked applications</span>
        </article>
      </section>

      <section className="student-dashboard-grid">
        <article className="student-dashboard-card student-profile-card">
          <div className="student-card-heading">
            <div>
              <span className="student-card-kicker">// your profile</span>
              <h2>Academic snapshot</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/student/profile")}
            >
              Edit profile
            </button>
          </div>

          <div className="student-profile-details">
            <div>
              <span>College</span>
              <strong>{institutionName || "Not set"}</strong>
            </div>

            <div>
              <span>Department</span>
              <strong>{departmentName || "Not set"}</strong>
            </div>

            <div>
              <span>Degree</span>
              <strong>{profile?.degree || "Not set"}</strong>
            </div>

            <div>
              <span>Current semester</span>
              <strong>
                {profile?.current_semester
                  ? `Semester ${profile.current_semester}`
                  : "Not set"}
              </strong>
            </div>

            <div>
              <span>Graduation year</span>
              <strong>{profile?.graduation_year || "Not set"}</strong>
            </div>

            <div>
              <span>CGPA</span>
              <strong>
                {profile?.cgpa !== null && profile?.cgpa !== undefined
                  ? profile.cgpa
                  : "Not added"}
              </strong>
            </div>
          </div>
        </article>

        <article className="student-dashboard-card student-next-step-card">
          <span className="student-card-kicker">// next best action</span>

          <h2>
            {resumeUploaded
              ? "Strengthen your skill profile"
              : "Upload your resume"}
          </h2>

          <p>
            {resumeUploaded
              ? "Your resume is ready. Add and refine your skills so SkillBridge can improve your opportunity matches."
              : "Your resume unlocks skill extraction, matching and personalized skill-gap insights."}
          </p>

          <button
            type="button"
            className="student-primary-action"
            onClick={() => navigate("/student/profile")}
          >
            {resumeUploaded ? "Open profile" : "Upload resume"}
            <span>→</span>
          </button>
        </article>
      </section>

      <section className="student-dashboard-card student-progress-card">
        <div className="student-card-heading">
          <div>
            <span className="student-card-kicker">// skillbridge journey</span>
            <h2>Your progress</h2>
          </div>
        </div>

        <div className="student-journey">
          <div className="student-journey-item done">
            <span className="student-journey-index">01</span>
            <div>
              <strong>Student profile</strong>
              <p>Academic details added to SkillBridge.</p>
            </div>
          </div>

          <div className={`student-journey-item ${resumeUploaded ? "done" : ""}`}>
            <span className="student-journey-index">02</span>
            <div>
              <strong>Resume intelligence</strong>
              <p>
                {resumeUploaded
                  ? "Resume uploaded and ready for analysis."
                  : "Upload your resume to begin skill extraction."}
              </p>
            </div>
          </div>

          <div className={`student-journey-item ${skillCount > 0 ? "done" : ""}`}>
            <span className="student-journey-index">03</span>
            <div>
              <strong>Skill profile</strong>
              <p>Add verified and extracted skills to your profile.</p>
            </div>
          </div>

          <div className={`student-journey-item ${matchCount > 0 ? "done" : ""}`}>
            <span className="student-journey-index">04</span>
            <div>
              <strong>Opportunity matching</strong>
              <p>See matches, missing skills and personalized roadmaps.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
