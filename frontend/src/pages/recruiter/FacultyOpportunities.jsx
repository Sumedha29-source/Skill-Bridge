import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

import "./FacultyOpportunities.css";

const TYPE_LABELS = {
  faculty_internship: "Faculty Internship",
  fdp: "Faculty Development Programme",
  industrial_training: "Industrial Training",
  research_collaboration: "Research Collaboration",
  consultancy: "Consultancy",
  mentorship: "Mentorship",
  guest_lecture: "Guest Lecture",
  live_industry_project: "Live Industry Project",
};

function FacultyOpportunities() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [opportunities, setOpportunities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    async function loadFacultyOpportunities() {
      try {
        setLoading(true);
        setError("");

        /* =========================
           1. RECRUITER PROFILE
        ========================= */

        const {
          data: recruiterProfile,
          error: recruiterError,
        } = await supabase
          .from("recruiter_profiles")
          .select("company_id")
          .eq("user_id", user.id)
          .single();

        if (recruiterError) {
          throw recruiterError;
        }

        if (!recruiterProfile?.company_id) {
          setError(
            "Complete your recruiter profile before managing faculty collaborations."
          );

          return;
        }

        /* =========================
           2. COMPANY
        ========================= */

        const {
          data: companyData,
          error: companyError,
        } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", recruiterProfile.company_id)
          .single();

        if (companyError) {
          throw companyError;
        }

        setCompany(companyData);

        /* =========================
           3. FACULTY OPPORTUNITIES
        ========================= */

        const {
          data: opportunityData,
          error: opportunityError,
        } = await supabase
          .from("faculty_opportunities")
          .select(`
            id,
            company_id,
            title,
            description,
            opportunity_type,
            specialization,
            location,
            mode,
            start_date,
            end_date,
            application_deadline,
            status,
            created_at
          `)
          .eq(
            "company_id",
            recruiterProfile.company_id
          )
          .order("created_at", {
            ascending: false,
          });

        if (opportunityError) {
          throw opportunityError;
        }

        setOpportunities(
          opportunityData || []
        );
      } catch (err) {
        console.error(
          "Faculty opportunities error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load faculty collaborations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFacultyOpportunities();
  }, [user?.id]);

  /* =========================
     FILTERED OPPORTUNITIES
  ========================= */

  const filteredOpportunities = useMemo(() => {
    if (statusFilter === "all") {
      return opportunities;
    }

    return opportunities.filter(
      (opportunity) =>
        opportunity.status === statusFilter
    );
  }, [opportunities, statusFilter]);

  /* =========================
     STATISTICS
  ========================= */

  const stats = useMemo(() => {
    const total =
      opportunities.length;

    const open =
      opportunities.filter(
        (item) => item.status === "open"
      ).length;

    const draft =
      opportunities.filter(
        (item) => item.status === "draft"
      ).length;

    const inactive =
      opportunities.filter((item) =>
        [
          "closed",
          "completed",
          "cancelled",
        ].includes(item.status)
      ).length;

    return {
      total,
      open,
      draft,
      inactive,
    };
  }, [opportunities]);

  /* =========================
     HELPERS
  ========================= */

  function formatDate(date) {
    if (!date) {
      return "Not specified";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    if (!status) {
      return "";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="faculty-opps-state">
        Loading faculty collaborations...
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="faculty-opps-page">
      {/* =========================
          HEADER
      ========================= */}

      <section className="faculty-opps-hero">
        <div>
          <span className="faculty-opps-eyebrow">
            // industry × academia
          </span>

          <h1>
            Faculty <span>Collaborations</span>
          </h1>

          <p>
            Create industry programmes for
            academicians, faculty members and
            institutional partners.
          </p>

          {company?.name && (
            <div className="faculty-opps-company">
              Publishing as{" "}
              <strong>
                {company.name}
              </strong>
            </div>
          )}
        </div>

        <button
          type="button"
          className="faculty-opps-create"
          onClick={() =>
            navigate(
              "/recruiter/faculty-opportunities/create"
            )
          }
        >
          <span>+</span>
          Create collaboration
        </button>
      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="faculty-opps-error">
          {error}
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="faculty-opps-stats">
        <div className="faculty-opps-stat">
          <span>Total programmes</span>

          <strong>
            {stats.total}
          </strong>

          <small>
            All faculty collaborations
          </small>
        </div>

        <div className="faculty-opps-stat">
          <span>Open</span>

          <strong>
            {stats.open}
          </strong>

          <small>
            Visible to faculty
          </small>
        </div>

        <div className="faculty-opps-stat">
          <span>Draft</span>

          <strong>
            {stats.draft}
          </strong>

          <small>
            Not published yet
          </small>
        </div>

        <div className="faculty-opps-stat">
          <span>Inactive</span>

          <strong>
            {stats.inactive}
          </strong>

          <small>
            Closed, completed or cancelled
          </small>
        </div>
      </section>

      {/* =========================
          PROGRAMMES PANEL
      ========================= */}

      <section className="faculty-opps-panel">
        <div className="faculty-opps-panel-header">
          <div>
            <span className="faculty-opps-panel-kicker">
              YOUR PROGRAMMES
            </span>

            <h2>
              Published collaborations
            </h2>
          </div>

          <div className="faculty-opps-filter">
            <label
              htmlFor="faculty-status-filter"
            >
              Status
            </label>

            <select
              id="faculty-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="closed">
                Closed
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {/* =========================
            EMPTY STATE
        ========================= */}

        {filteredOpportunities.length === 0 ? (
          <div className="faculty-opps-empty">
            <div className="faculty-opps-empty-icon">
              ◎
            </div>

            <h3>
              {opportunities.length === 0
                ? "No faculty collaborations yet"
                : "No collaborations match this filter"}
            </h3>

            <p>
              {opportunities.length === 0
                ? "Create your first programme for faculty internships, FDPs, research collaborations or industrial training."
                : "Choose another status to view your other programmes."}
            </p>

            {opportunities.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/recruiter/faculty-opportunities/create"
                  )
                }
              >
                Create first collaboration →
              </button>
            )}
          </div>
        ) : (
          /* =========================
             OPPORTUNITY LIST
          ========================= */

          <div className="faculty-opps-list">
            {filteredOpportunities.map(
              (opportunity) => (
                <article
                  className="faculty-opps-card"
                  key={opportunity.id}
                >
                  {/* CARD HEADER */}

                  <div className="faculty-opps-card-top">
                    <div>
                      <span className="faculty-opps-type">
                        {TYPE_LABELS[
                          opportunity
                            .opportunity_type
                        ] ||
                          opportunity.opportunity_type}
                      </span>

                      <h3>
                        {opportunity.title}
                      </h3>
                    </div>

                    <span
                      className={`faculty-opps-status ${opportunity.status}`}
                    >
                      {formatStatus(
                        opportunity.status
                      )}
                    </span>
                  </div>

                  {/* DESCRIPTION */}

                  <p className="faculty-opps-description">
                    {opportunity.description ||
                      "No programme description provided."}
                  </p>

                  {/* DETAILS */}

                  <div className="faculty-opps-meta">
                    <div>
                      <span>
                        Specialization
                      </span>

                      <strong>
                        {opportunity.specialization ||
                          "Open specialization"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Mode
                      </span>

                      <strong>
                        {opportunity.mode
                          ? formatStatus(
                              opportunity.mode
                            )
                          : "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Location
                      </span>

                      <strong>
                        {opportunity.location ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Deadline
                      </span>

                      <strong>
                        {formatDate(
                          opportunity
                            .application_deadline
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="faculty-opps-card-footer">
                    <div>
                      {opportunity.start_date ? (
                        <>
                          Programme:{" "}
                          <strong>
                            {formatDate(
                              opportunity.start_date
                            )}
                          </strong>

                          {opportunity.end_date && (
                            <>
                              {" "}
                              —{" "}
                              <strong>
                                {formatDate(
                                  opportunity.end_date
                                )}
                              </strong>
                            </>
                          )}
                        </>
                      ) : (
                        "Programme dates not specified"
                      )}
                    </div>

                    <span>
                      {opportunity.status ===
                      "open"
                        ? "Accepting applications"
                        : formatStatus(
                            opportunity.status
                          )}
                    </span>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default FacultyOpportunities;