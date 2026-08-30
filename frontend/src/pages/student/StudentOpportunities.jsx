import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";
import "./StudentOpportunities.css";

function StudentOpportunities() {
  const { user } = useAuth();

  const [studentProfile, setStudentProfile] = useState(null);
  const [departmentCode, setDepartmentCode] = useState("");

  const [opportunities, setOpportunities] = useState([]);
  const [opportunitySkills, setOpportunitySkills] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      if (!user) return;

      setLoading(true);
      setError("");

      // --------------------------------------------------
      // 1. Load the logged-in student's eligibility data
      // --------------------------------------------------

      const { data: profile, error: profileError } = await supabase
        .from("student_profiles")
        .select(
          "department_id, cgpa, graduation_year, verification_status"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profile) {
        setError("Complete your student profile before viewing opportunities.");
        setLoading(false);
        return;
      }

      setStudentProfile(profile);

      if (profile.department_id) {
        const { data: department, error: departmentError } = await supabase
          .from("departments")
          .select("code")
          .eq("id", profile.department_id)
          .maybeSingle();

        if (departmentError) {
          setError(departmentError.message);
          setLoading(false);
          return;
        }

        const currentDepartmentCode =
          department?.code?.trim().toUpperCase() || "";

        setDepartmentCode(currentDepartmentCode);
      }

      // --------------------------------------------------
      // 2. Load only published/open opportunities
      // RLS also enforces this on the database side.
      // --------------------------------------------------

      const { data: opportunityRows, error: opportunityError } = await supabase
        .from("opportunities")
        .select(
          "id, company_id, title, type, description, location, work_mode, duration, stipend_min, stipend_max, salary_min, salary_max, minimum_cgpa, graduation_year, eligible_department_codes, application_deadline, status, created_at"
        )
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (opportunityError) {
        setError(opportunityError.message);
        setLoading(false);
        return;
      }

      const openOpportunities = opportunityRows || [];
      setOpportunities(openOpportunities);

      // --------------------------------------------------
      // 3. Load required/preferred skills for these roles
      // --------------------------------------------------

      if (openOpportunities.length > 0) {
        const opportunityIds = openOpportunities.map(
          (opportunity) => opportunity.id
        );

        const { data: skillRequirementRows, error: requirementError } =
          await supabase
            .from("opportunity_skills")
            .select(
              "opportunity_id, skill_id, requirement_type, minimum_proficiency, weight"
            )
            .in("opportunity_id", opportunityIds);

        if (requirementError) {
          setError(requirementError.message);
          setLoading(false);
          return;
        }

        setOpportunitySkills(skillRequirementRows || []);
      }

      // --------------------------------------------------
      // 4. Load skill names from the shared skill catalog
      // --------------------------------------------------

      const { data: skillRows, error: skillError } = await supabase
        .from("skills")
        .select("id, name, category");

      if (skillError) {
        setError(skillError.message);
        setLoading(false);
        return;
      }

      setSkills(skillRows || []);
      setLoading(false);
    }

    loadOpportunities();
  }, [user]);

  const skillMap = useMemo(() => {
    return new Map(skills.map((skill) => [skill.id, skill]));
  }, [skills]);

  const eligibilityResults = useMemo(() => {
    if (!studentProfile) return [];

    const studentCgpa =
      studentProfile.cgpa === null || studentProfile.cgpa === undefined
        ? null
        : Number(studentProfile.cgpa);

    const studentGraduationYear = studentProfile.graduation_year
      ? Number(studentProfile.graduation_year)
      : null;

    return opportunities.map((opportunity) => {
      const eligibleDepartments = (
        opportunity.eligible_department_codes || []
      ).map((code) => String(code).trim().toUpperCase());

      const departmentEligible =
        eligibleDepartments.length === 0 ||
        (departmentCode &&
          eligibleDepartments.includes(departmentCode));

      const cgpaEligible =
        opportunity.minimum_cgpa === null ||
        opportunity.minimum_cgpa === undefined ||
        (studentCgpa !== null &&
          studentCgpa >= Number(opportunity.minimum_cgpa));

      const graduationEligible =
        opportunity.graduation_year === null ||
        opportunity.graduation_year === undefined ||
        (studentGraduationYear !== null &&
          studentGraduationYear === Number(opportunity.graduation_year));

      const eligible =
        departmentEligible && cgpaEligible && graduationEligible;

      const reasons = [];

      if (!departmentEligible) {
        reasons.push("department");
      }

      if (!cgpaEligible) {
        reasons.push("CGPA");
      }

      if (!graduationEligible) {
        reasons.push("graduation year");
      }

      return {
        ...opportunity,
        eligible,
        reasons,
      };
    });
  }, [opportunities, studentProfile, departmentCode]);

  const eligibleOpportunities = useMemo(
    () => eligibilityResults.filter((opportunity) => opportunity.eligible),
    [eligibilityResults]
  );

  function getOpportunitySkills(opportunityId) {
    return opportunitySkills
      .filter((row) => row.opportunity_id === opportunityId)
      .map((row) => ({
        ...row,
        skill: skillMap.get(row.skill_id),
      }))
      .filter((row) => row.skill);
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  function formatDeadline(value) {
    if (!value) return "No deadline set";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="student-opportunity-state">
        Finding eligible opportunities…
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-opportunity-state error">
        Could not load opportunities: {error}
      </div>
    );
  }

  return (
    <div className="student-opportunities-page">
      <section className="student-opportunities-head">
        <div>
          <span className="student-opportunities-kicker">
            // opportunity matching
          </span>

          <h1>Opportunities for you</h1>

          <p>
            SkillBridge first checks your department, CGPA and graduation
            year. Only opportunities that pass those eligibility rules appear
            below.
          </p>
        </div>

        <div className="student-eligibility-summary">
          <strong>{eligibleOpportunities.length}</strong>
          <span>eligible now</span>
        </div>
      </section>

      <section className="student-eligibility-strip">
        <div>
          <span>Department</span>
          <strong>{departmentCode || "Not set"}</strong>
        </div>

        <div>
          <span>CGPA</span>
          <strong>
            {studentProfile?.cgpa !== null &&
            studentProfile?.cgpa !== undefined
              ? studentProfile.cgpa
              : "Not set"}
          </strong>
        </div>

        <div>
          <span>Graduation year</span>
          <strong>{studentProfile?.graduation_year || "Not set"}</strong>
        </div>

        <div>
          <span>Open roles checked</span>
          <strong>{opportunities.length}</strong>
        </div>
      </section>

      {eligibleOpportunities.length === 0 ? (
        <section className="student-opportunities-empty">
          <div className="student-opportunities-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16v12H4z" />
              <path d="M8 7V5h8v2M8 12h8" />
            </svg>
          </div>

          <h2>No eligible open opportunities yet</h2>

          <p>
            This can simply mean recruiters have not published an open role
            matching your department, CGPA and graduation year yet.
          </p>
        </section>
      ) : (
        <section className="student-opportunity-list">
          {eligibleOpportunities.map((opportunity) => {
            const requirements = getOpportunitySkills(opportunity.id);

            const requiredSkills = requirements.filter(
              (item) => item.requirement_type === "required"
            );

            const preferredSkills = requirements.filter(
              (item) => item.requirement_type === "preferred"
            );

            const isInternship =
              String(opportunity.type || "").toLowerCase() === "internship";

            const compensation = isInternship
              ? opportunity.stipend_min || opportunity.stipend_max
                ? `${formatMoney(opportunity.stipend_min) || "—"} – ${
                    formatMoney(opportunity.stipend_max) || "—"
                  } / month`
                : "Stipend not specified"
              : opportunity.salary_min || opportunity.salary_max
                ? `${formatMoney(opportunity.salary_min) || "—"} – ${
                    formatMoney(opportunity.salary_max) || "—"
                  }`
                : "Salary not specified";

            return (
              <article
                key={opportunity.id}
                className="student-opportunity-card"
              >
                <div className="student-opportunity-card-top">
                  <div>
                    <div className="student-opportunity-tags">
                      <span>{opportunity.type || "Opportunity"}</span>
                      <span>{opportunity.work_mode || "Work mode not set"}</span>
                    </div>

                    <h2>{opportunity.title}</h2>
                  </div>

                  <span className="student-eligible-badge">
                    ✓ Eligible
                  </span>
                </div>

                <p className="student-opportunity-description">
                  {opportunity.description}
                </p>

                <div className="student-opportunity-meta">
                  <span>{opportunity.location || "Location not specified"}</span>
                  <span>{opportunity.duration || "Duration not specified"}</span>
                  <span>{compensation}</span>
                  <span>
                    Apply by {formatDeadline(opportunity.application_deadline)}
                  </span>
                </div>

                <div className="student-opportunity-eligibility">
                  <div>
                    <span>Minimum CGPA</span>
                    <strong>{opportunity.minimum_cgpa ?? "Any"}</strong>
                  </div>

                  <div>
                    <span>Graduation year</span>
                    <strong>{opportunity.graduation_year ?? "Any"}</strong>
                  </div>

                  <div>
                    <span>Departments</span>
                    <strong>
                      {opportunity.eligible_department_codes?.length
                        ? opportunity.eligible_department_codes.join(", ")
                        : "All"}
                    </strong>
                  </div>
                </div>

                <div className="student-opportunity-skills">
                  <div>
                    <span className="student-skill-group-label">
                      Required skills
                    </span>

                    <div className="student-skill-chips">
                      {requiredSkills.length > 0 ? (
                        requiredSkills.map((item) => (
                          <span key={item.skill_id} className="required">
                            {item.skill.name}
                            <small>{item.minimum_proficiency}</small>
                          </span>
                        ))
                      ) : (
                        <span className="student-no-skills">
                          None specified
                        </span>
                      )}
                    </div>
                  </div>

                  {preferredSkills.length > 0 && (
                    <div>
                      <span className="student-skill-group-label">
                        Preferred skills
                      </span>

                      <div className="student-skill-chips">
                        {preferredSkills.map((item) => (
                          <span key={item.skill_id} className="preferred">
                            {item.skill.name}
                            <small>{item.minimum_proficiency}</small>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="student-opportunity-footer">
                  <span>
                    Skill match score and applications are the next step.
                  </span>

                  <button
                    type="button"
                    disabled
                    title="Applications will be connected next"
                  >
                    Apply — coming next
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default StudentOpportunities;
