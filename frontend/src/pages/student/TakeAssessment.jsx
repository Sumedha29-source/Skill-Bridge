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
  const [submitting, setSubmitting] = useState(false);

  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  /* =========================
     LOAD ASSESSMENT
  ========================= */

  useEffect(() => {
    if (!user || !skillId) {
      return;
    }

    let cancelled = false;

    async function loadAssessment() {
      try {
        const { data: profileData, error: profileError } =
          await supabase
            .from("student_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (profileError) {
          throw profileError;
        }

        const { data: skillData, error: skillError } =
          await supabase
            .from("skills")
            .select("id, name, category")
            .eq("id", skillId)
            .single();

        if (skillError) {
          throw skillError;
        }

        /*
          We now need correct_option because the browser
          calculates the assessment result on submission.
        */

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
              correct_option,
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
     START ATTEMPT
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
     NAVIGATION
  ========================= */

  function goNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  }

  function goPrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  }

  /* =========================
     SUBMIT ASSESSMENT
  ========================= */

  async function submitAssessment() {
    if (
      !attemptId ||
      !studentProfile ||
      !skill ||
      questions.length === 0
    ) {
      return;
    }

    /*
      Make sure every question has an answer.
    */

    const unansweredQuestions = questions.filter(
      (question) => !answers[question.id]
    );

    if (unansweredQuestions.length > 0) {
      setError(
        `Please answer all ${questions.length} questions before submitting.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
        Calculate correct answers.
      */

      let correctAnswers = 0;

      const answerRows = questions.map((question) => {
        const selectedOption = answers[question.id];

        const isCorrect =
          selectedOption === question.correct_option;

        if (isCorrect) {
          correctAnswers += 1;
        }

        return {
          attempt_id: attemptId,
          question_id: question.id,
          selected_option: selectedOption,
          is_correct: isCorrect,
          points: isCorrect ? 1 : 0,
        };
      });

      /*
        Calculate percentage.
      */

      const score = Math.round(
        (correctAnswers / questions.length) * 100
      );

      /*
        Convert result into proficiency.
      */

      let proficiency = "beginner";

      if (correctAnswers >= 5) {
        proficiency = "advanced";
      } else if (correctAnswers >= 3) {
        proficiency = "intermediate";
      }

      /*
        1. SAVE ANSWERS
      */

      const { error: answerError } = await supabase
        .from("assessment_answers")
        .insert(answerRows);

      if (answerError) {
        throw answerError;
      }

      /*
        2. COMPLETE ATTEMPT
      */

      const { error: attemptError } = await supabase
        .from("assessment_attempts")
        .update({
          status: "completed",
          correct_answers: correctAnswers,
          score,
          completed_at: new Date().toISOString(),
        })
        .eq("id", attemptId);

      if (attemptError) {
        throw attemptError;
      }

      /*
        3. UPDATE VERIFIED STUDENT SKILL

        Because student_id + skill_id is unique,
        upsert will update an existing Python skill
        instead of creating a duplicate.
      */

      const { error: skillError } = await supabase
        .from("student_skills")
        .upsert(
          {
            student_id: studentProfile.id,
            skill_id: skill.id,
            proficiency,
            source: "assessment",
            verified: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "student_id,skill_id",
          }
        );

      if (skillError) {
        throw skillError;
      }

      /*
        4. SHOW RESULT
      */

      setResult({
        correctAnswers,
        totalQuestions: questions.length,
        score,
        proficiency,
      });
    } catch (err) {
      console.error("Assessment submission error:", err);

      setError(
        err?.message ||
          "Unable to submit the assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================
     LOADING
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
     RESULT SCREEN
  ========================= */

  if (result) {
    return (
      <div className="take-assessment-page">
        <section className="take-assessment-intro">
          <span className="take-assessment-kicker">
            // assessment complete
          </span>

          <h1>{skill?.name} Result</h1>

          <p>
            Your assessment has been completed and your
            SkillBridge skill profile has been updated.
          </p>

          <div className="take-assessment-rules">
            <div>
              <strong>
                {result.correctAnswers}/
                {result.totalQuestions}
              </strong>

              <span>Correct</span>
            </div>

            <div>
              <strong>
                {result.score}%
              </strong>

              <span>Score</span>
            </div>

            <div>
              <strong
                style={{
                  textTransform: "capitalize",
                }}
              >
                {result.proficiency}
              </strong>

              <span>Proficiency</span>
            </div>
          </div>

          <div className="take-assessment-note">
            <strong>Verified skill updated</strong>

            <p>
              Your {skill?.name} proficiency is now marked as{" "}
              <strong>
                {result.proficiency}
              </strong>{" "}
              and verified through SkillBridge assessment.
            </p>
          </div>

          <button
            type="button"
            className="take-assessment-start"
            onClick={() =>
              navigate("/student/opportunities")
            }
          >
            View opportunity matches
            <span>→</span>
          </button>

          <button
            type="button"
            className="take-assessment-back"
            style={{
              marginTop: "18px",
              marginBottom: 0,
            }}
            onClick={() =>
              navigate("/student/assessment")
            }
          >
            ← Back to assessments
          </button>
        </section>
      </div>
    );
  }

  /* =========================
     INTRO SCREEN
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

          <h1>{skill?.name} Assessment</h1>

          <p>
            This assessment contains {questions.length} questions
            across beginner, intermediate and advanced difficulty
            levels.
          </p>

          <div className="take-assessment-rules">
            <div>
              <strong>{questions.length}</strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>3</strong>
              <span>Difficulty levels</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Answer per question</span>
            </div>
          </div>

          <div className="take-assessment-note">
            <strong>Before you begin</strong>

            <p>
              Complete all questions before submitting. Your result
              will determine your assessed proficiency in{" "}
              {skill?.name}.
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

            {!starting && <span>→</span>}
          </button>
        </section>
      </div>
    );
  }

  /* =========================
     QUESTION SCREEN
  ========================= */

  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="take-assessment-page">
        <div className="take-assessment-state">
          Unable to display this question.
        </div>
      </div>
    );
  }

  const selectedAnswer = answers[question.id];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="take-assessment-page">
      <section className="take-assessment-quiz">
        <div className="take-assessment-quiz-header">
          <div>
            <span className="take-assessment-kicker">
              // {skill?.name}
            </span>

            <h1>Skill Assessment</h1>
          </div>

          <div className="take-assessment-progress-copy">
            Question {currentQuestion + 1} of{" "}
            {questions.length}
          </div>
        </div>

        <div className="take-assessment-progress">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <article className="take-question-card">
          <div className="take-question-meta">
            <span>
              Question {currentQuestion + 1}
            </span>

            <span className="take-question-difficulty">
              {question.difficulty}
            </span>
          </div>

          <h2>{question.question_text}</h2>

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
                disabled={submitting}
              >
                <span className="take-option-letter">
                  {letter}
                </span>

                <span>{text}</span>
              </button>
            ))}
          </div>
        </article>

        {error && (
          <div
            className="take-assessment-error"
            style={{
              marginTop: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div className="take-assessment-navigation">
          <button
            type="button"
            className="take-nav-secondary"
            onClick={goPrevious}
            disabled={
              currentQuestion === 0 ||
              submitting
            }
          >
            ← Previous
          </button>

          {currentQuestion <
          questions.length - 1 ? (
            <button
              type="button"
              className="take-nav-primary"
              onClick={goNext}
              disabled={
                !selectedAnswer ||
                submitting
              }
            >
              Next question →
            </button>
          ) : (
            <button
              type="button"
              className="take-nav-primary"
              onClick={submitAssessment}
              disabled={
                !selectedAnswer ||
                submitting
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit assessment"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default TakeAssessment;