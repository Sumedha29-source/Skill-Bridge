import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";
import "./RecruiterOpportunities.css";

function RecruiterOpportunities() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [opportunities, setOpportunities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      if (!user) return;

      setLoading(true);
      setError("");

      const { data: recruiter, error: recruiterError } = await supabase
        .from("recruiter_profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (recruiterError) {
        setError(recruiterError.message);
        setLoading(false);
        return;
      }

      if (!recruiter?.company_id) {
        setError("No company is linked to this recruiter account.");
        setLoading(false);
        return;
      }

      const [companyResult, opportunityResult] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name")
          .eq("id", recruiter.company_id)
          .maybeSingle(),

        supabase
          .from("opportunities")
          .select(
            "id, title, type, location, work_mode, duration, stipend_min, stipend_max, salary_min, salary_max, minimum_cgpa, graduation_year, status, application_deadline, eligible_department_codes, created_at"
          )
          .eq("company_id", recruiter.company_id)
          .order("created_at", { ascending: false }),
      ]);

      if (companyResult.error) {
        setError(companyResult.error.message);
        setLoading(false);
        return;
      }

      if (opportunityResult.error) {
        setError(opportunityResult.error.message);
        setLoading(false);
        return;
      }

      setCompany(companyResult.data || null);
      setOpportunities(opportunityResult.data || []);
      setLoading(false);
    }

    loadOpportunities();
  }, [user]);

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") {
      return "Not specified";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  function formatDeadline(value) {
    if (!value) return "No deadline";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="recruiter-opportunity-state">
        Loading opportunities…
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-opportunity-state error">
        Could not load opportunities: {error}
      </div>
    );
  }

  return (
    <div className="recruiter-opportunities-page">
      <section className="recruiter-opportunities-head">
        <div>
          <span className="recruiter-opportunities-kicker">
            // opportunities
          </span>

          <h1>Your hiring opportunities</h1>

          <p>
            Manage the roles posted by {company?.name || "your company"} and
            prepare them for SkillBridge candidate matching.
          </p>
        </div>

        <button
          type="button"
          className="recruiter-opportunities-create"
          onClick={() => navigate("/recruiter/opportunities/create")}
        >
          <span>+</span>
          Create opportunity
        </button>
      </section>

      <section className="recruiter-opportunities-summary">
        <article>
          <span>Total opportunities</span>
          <strong>{opportunities.length}</strong>
        </article>

        <article>
          <span>Open / active</span>
          <strong>
            {
              opportunities.filter((opportunity) =>
                ["open", "active", "published"].includes(
                  String(opportunity.status || "").toLowerCase()
                )
              ).length
            }
          </strong>
        </article>

        <article>
          <span>Internships</span>
          <strong>
            {
              opportunities.filter(
                (opportunity) =>
                  String(opportunity.type || "").toLowerCase() ===
                  "internship"
              ).length
            }
          </strong>
        </article>
      </section>

      {opportunities.length === 0 ? (
        <section className="recruiter-opportunities-empty">
          <div className="recruiter-opportunities-empty-icon">
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

          <h2>No opportunities yet</h2>

          <p>
            Create your first internship or job and define its eligibility
            rules, required skills and application deadline.
          </p>

          <button
            type="button"
            onClick={() => navigate("/recruiter/opportunities/create")}
          >
            Create first opportunity
          </button>
        </section>
      ) : (
        <section className="recruiter-opportunity-list">
          {opportunities.map((opportunity) => {
            const compensation =
              String(opportunity.type || "").toLowerCase() ===
              "internship"
                ? opportunity.stipend_min || opportunity.stipend_max
                  ? `${formatMoney(opportunity.stipend_min)} – ${formatMoney(
                      opportunity.stipend_max
                    )} / month`
                  : "Stipend not specified"
                : opportunity.salary_min || opportunity.salary_max
                  ? `${formatMoney(opportunity.salary_min)} – ${formatMoney(
                      opportunity.salary_max
                    )}`
                  : "Salary not specified";

            return (
              <article
                key={opportunity.id}
                className="recruiter-opportunity-card"
              >
                <div className="recruiter-opportunity-card-top">
                  <div>
                    <div className="recruiter-opportunity-tags">
                      <span className="type">
                        {opportunity.type || "Opportunity"}
                      </span>

                      <span className="status">
                        {opportunity.status || "created"}
                      </span>
                    </div>

                    <h2>{opportunity.title}</h2>
                  </div>

                  <span className="recruiter-opportunity-deadline">
                    Deadline {formatDeadline(opportunity.application_deadline)}
                  </span>
                </div>

                <div className="recruiter-opportunity-meta">
                  <span>{opportunity.work_mode || "Work mode not set"}</span>
                  <span>{opportunity.location || "Location not set"}</span>
                  <span>{opportunity.duration || "Duration not set"}</span>
                  <span>{compensation}</span>
                </div>

                <div className="recruiter-opportunity-rules">
                  <div>
                    <span>Minimum CGPA</span>
                    <strong>
                      {opportunity.minimum_cgpa ?? "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Graduation year</span>
                    <strong>
                      {opportunity.graduation_year ?? "Any"}
                    </strong>
                  </div>

                  <div className="departments">
                    <span>Eligible departments</span>
                    <strong>
                      {opportunity.eligible_department_codes?.length
                        ? opportunity.eligible_department_codes.join(", ")
                        : "All / not specified"}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default RecruiterOpportunities;
