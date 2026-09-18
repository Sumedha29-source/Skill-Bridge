import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase";
import "./Assessment.css";

function Assessment() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      setLoading(true);
      setError("");

      const { data: questions, error: questionError } = await supabase
        .from("assessment_questions")
        .select(`
          id,
          difficulty,
          question_type,
          skill_id,
          skills (
            id,
            name,
            category
          )
        `)
        .eq("question_type", "technical");

      if (questionError) {
        throw questionError;
      }

      const skillMap = {};

      (questions || []).forEach((question) => {
        const skill = question.skills;

        if (!skill) {
          return;
        }

        if (!skillMap[skill.id]) {
          skillMap[skill.id] = {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            questionCount: 0,
            beginnerCount: 0,
            intermediateCount: 0,
            advancedCount: 0,
          };
        }

        skillMap[skill.id].questionCount += 1;

        if (question.difficulty === "beginner") {
          skillMap[skill.id].beginnerCount += 1;
        }

        if (question.difficulty === "intermediate") {
          skillMap[skill.id].intermediateCount += 1;
        }

        if (question.difficulty === "advanced") {
          skillMap[skill.id].advancedCount += 1;
        }
      });

      setAssessments(Object.values(skillMap));
    } catch (err) {
      console.error("Assessment loading error:", err);

      setError(
        err?.message ||
          "Unable to load assessments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-state">
          Loading assessments...
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      {/* PAGE HEADER */}
      <section className="assessment-header">
        <div>
          <span className="assessment-kicker">
            // skill verification
          </span>

          <h1>Skill Assessment</h1>

          <p>
            Test your skills and build a verified skill profile that
            can improve your opportunity matches.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="assessment-info-grid">
        <div className="assessment-info-card">
          <span>01</span>

          <strong>Take assessment</strong>

          <p>
            Answer questions across different difficulty levels.
          </p>
        </div>

        <div className="assessment-info-card">
          <span>02</span>

          <strong>Verify skill level</strong>

          <p>
            Your performance is converted into a measured proficiency.
          </p>
        </div>

        <div className="assessment-info-card">
          <span>03</span>

          <strong>Improve matching</strong>

          <p>
            Verified skills can contribute to your opportunity match
            profile.
          </p>
        </div>
      </section>

      {/* AVAILABLE ASSESSMENTS */}
      <section className="assessment-list-section">
        <div className="assessment-section-heading">
          <div>
            <span className="assessment-kicker">
              // available assessments
            </span>

            <h2>Choose a skill</h2>
          </div>

          <span className="assessment-count">
            {assessments.length} available
          </span>
        </div>

        {/* ERROR */}
        {error && (
          <div className="assessment-error">
            <p>{error}</p>

            <button
              type="button"
              onClick={loadAssessments}
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!error && assessments.length === 0 && (
          <div className="assessment-empty">
            <h3>No assessments available yet</h3>

            <p>
              Skill assessments will appear here once questions are
              available.
            </p>
          </div>
        )}

        {/* ASSESSMENT CARDS */}
        {!error && assessments.length > 0 && (
          <div className="assessment-grid">
            {assessments.map((assessment) => (
              <article
                className="assessment-card"
                key={assessment.id}
              >
                <div className="assessment-card-top">
                  <span className="assessment-category">
                    {assessment.category || "Skill"}
                  </span>

                  <span className="assessment-question-count">
                    {assessment.questionCount} questions
                  </span>
                </div>

                <h3>{assessment.name}</h3>

                <p className="assessment-card-description">
                  Measure your current {assessment.name} proficiency
                  through a structured technical assessment.
                </p>

                <div className="assessment-levels">
                  <div>
                    <strong>
                      {assessment.beginnerCount}
                    </strong>
                    <span>Beginner</span>
                  </div>

                  <div>
                    <strong>
                      {assessment.intermediateCount}
                    </strong>
                    <span>Intermediate</span>
                  </div>

                  <div>
                    <strong>
                      {assessment.advancedCount}
                    </strong>
                    <span>Advanced</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="assessment-start-button"
                  onClick={() => {
                    console.log(
                      "Start assessment:",
                      assessment.id
                    );
                  }}
                >
                  Start assessment
                  <span>→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Assessment;