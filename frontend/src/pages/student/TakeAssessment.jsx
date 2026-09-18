import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";
import "./TakeAssessment.css";

function TakeAssessment() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [skill, setSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     LOAD ASSESSMENT DATA
  ========================= */

  useEffect(() => {
    if (!user || !skillId) {
      return;
    }

    let cancelled = false;

    async function loadAssessment() {
      try {
        /* -------------------------
           GET STUDENT PROFILE
        ------------------------- */

        const { data: profileData, error: profileError } =
          await supabase
            .from("student_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (profileError) {
          throw profileError;
        }

        /* -------------------------
           GET SKILL
        ------------------------- */

        const { data: skillData, error: skillError } =
          await supabase
            .from("skills")
            .select("id, name, category")
            .eq("id", skillId)
            .single();

        if (skillError) {
          throw skillError;
        }

        /* -------------------------
           GET QUESTIONS
        ------------------------- */

        const { data: questionData, error: questionError } =
          await supabase
            .from("assessment_questions")
            .select(`
              id,
              question_text,
              option_a,
              option_b,
              option_c,
              option_d,
              difficulty
            `)
            .eq("skill_id", skillId)
            .eq("question_type", "technical");

        if (questionError) {
          throw questionError;
        }

        if (!questionData || questionData.length === 0) {
          throw new Error(
            "No assessment questions are available for this skill."
          );
        }

        /* -------------------------
           SORT QUESTIONS
        ------------------------- */

        const difficultyOrder = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
        };

        const sortedQuestions = [...questionData].sort(
          (a, b) =>
            (difficultyOrder[a.difficulty] || 99) -
            (difficultyOrder[b.difficulty] || 99)
        );

        /* -------------------------
           UPDATE STATE
        ------------------------- */

        if (!cancelled) {
          setStudentProfile(profileData);
          setSkill(skillData);
          setQuestions(sortedQuestions);
          setError("");
        }
      } catch (err) {
        console.error("Assessment load error:", err);

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load this assessment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssessment();

    return () => {
      cancelled = true;
    };
  }, [user, skillId]);

  /* =========================
     CREATE ASSESSMENT ATTEMPT
  ========================= */

  async function startAttempt() {
    if (!studentProfile || questions.length === 0) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      const { data, error: attemptError } = await supabase
        .from("assessment_attempts")
        .insert({
          student_id: studentProfile.id,
          assessment_type: "skill",
          status: "in_progress",
          total_questions: questions.length,
          correct_answers: 0,
        })
        .select("id")
        .single();

      if (attemptError) {
        throw attemptError;
      }

      setAttemptId(data.id);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (err) {
      console.error("Attempt creation error:", err);

      setError(
        err?.message ||
          "Unable to start the assessment."
      );
    } finally {
      setStarting(false);
    }
  }

  /* =========================
     SELECT ANSWER
  ========================= */

  function selectAnswer(option) {
    const question = questions[currentQuestion];

    if (!question) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [question.id]: option,
    }));
  }

  /* =========================
     NEXT QUESTION
  ========================= */

  function goNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  }

  /* =========================
     PREVIOUS QUESTION
  ========================= */

  function goPrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  }

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {
    return (
      <div className="take-assessment-page">
        <div className="take-assessment-state">
          Loading assessment...
        </div>
      </div>
    );
  }

  /* =========================
     LOAD ERROR
  ========================= */

  if (error && !skill) {
    return (
      <div className="take-assessment-page">
        <div className="take-assessment-state">
          <h3>Unable to load assessment</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate("/student/assessment")
            }
          >
            Back to assessments
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     INTRODUCTION SCREEN
  ========================= */

  if (!attemptId) {
    return (
      <div className="take-assessment-page">
        <button
          type="button"
          className="take-assessment-back"
          onClick={() =>
            navigate("/student/assessment")
          }
        >
          ← Back to assessments
        </button>

        <section className="take-assessment-intro">
          <span className="take-assessment-kicker">
            // technical assessment
          </span>

          <h1>
            {skill?.name} Assessment
          </h1>

          <p>
            This assessment contains {questions.length} questions
            across beginner, intermediate and advanced difficulty
            levels.
          </p>

          <div className="take-assessment-rules">
            <div>
              <strong>
                {questions.length}
              </strong>

              <span>
                Questions
              </span>
            </div>

            <div>
              <strong>
                3
              </strong>

              <span>
                Difficulty levels
              </span>
            </div>

            <div>
              <strong>
                1
              </strong>

              <span>
                Answer per question
              </span>
            </div>
          </div>

          <div className="take-assessment-note">
            <strong>
              Before you begin
            </strong>

            <p>
              Complete all questions before submitting.
              Your result will be used to determine your
              assessed proficiency in {skill?.name}.
            </p>
          </div>

          {error && (
            <div className="take-assessment-error">
              {error}
            </div>
          )}

          <button
            type="button"
            className="take-assessment-start"
            onClick={startAttempt}
            disabled={starting}
          >
            {starting
              ? "Starting..."
              : "Begin assessment"}

            {!starting && (
              <span>→</span>
            )}
          </button>
        </section>
      </div>
    );
  }

  /* =========================
     CURRENT QUESTION
  ========================= */

  const question =
    questions[currentQuestion];

  if (!question) {
    return (
      <div className="take-assessment-page">
        <div className="take-assessment-state">
          Unable to display this question.
        </div>
      </div>
    );
  }

  const selectedAnswer =
    answers[question.id];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  /* =========================
     QUIZ SCREEN
  ========================= */

  return (
    <div className="take-assessment-page">
      <section className="take-assessment-quiz">

        {/* HEADER */}

        <div className="take-assessment-quiz-header">
          <div>
            <span className="take-assessment-kicker">
              // {skill?.name}
            </span>

            <h1>
              Skill Assessment
            </h1>
          </div>

          <div className="take-assessment-progress-copy">
            Question {currentQuestion + 1} of{" "}
            {questions.length}
          </div>
        </div>

        {/* PROGRESS BAR */}

        <div className="take-assessment-progress">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* QUESTION CARD */}

        <article className="take-question-card">

          <div className="take-question-meta">
            <span>
              Question {currentQuestion + 1}
            </span>

            <span className="take-question-difficulty">
              {question.difficulty}
            </span>
          </div>

          <h2>
            {question.question_text}
          </h2>

          {/* OPTIONS */}

          <div className="take-question-options">
            {[
              ["A", question.option_a],
              ["B", question.option_b],
              ["C", question.option_c],
              ["D", question.option_d],
            ].map(([letter, text]) => (
              <button
                type="button"
                key={letter}
                className={
                  selectedAnswer === letter
                    ? "take-option selected"
                    : "take-option"
                }
                onClick={() =>
                  selectAnswer(letter)
                }
              >
                <span className="take-option-letter">
                  {letter}
                </span>

                <span>
                  {text}
                </span>
              </button>
            ))}
          </div>
        </article>

        {/* NAVIGATION */}

        <div className="take-assessment-navigation">

          <button
            type="button"
            className="take-nav-secondary"
            onClick={goPrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion <
          questions.length - 1 ? (
            <button
              type="button"
              className="take-nav-primary"
              onClick={goNext}
              disabled={!selectedAnswer}
            >
              Next question →
            </button>
          ) : (
            <button
              type="button"
              className="take-nav-primary"
              disabled={!selectedAnswer}
            >
              Submit assessment
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default TakeAssessment;