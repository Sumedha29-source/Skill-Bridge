import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function selectRole(role) {
    setLoading(true);
    setError("");

    // Get currently logged-in Supabase user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError("You must be logged in to choose a role.");
      return;
    }

    // Check whether this user already has a SkillBridge profile
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (checkError) {
      setLoading(false);
      setError(checkError.message);
      return;
    }

    // If profile already exists, don't create another one
    if (existingProfile) {
      setLoading(false);

      if (existingProfile.role === "student") {
        navigate(
          existingProfile.onboarding_completed
            ? "/student"
            : "/student/onboarding"
        );
      } else if (existingProfile.role === "recruiter") {
        navigate(
          existingProfile.onboarding_completed
            ? "/recruiter"
            : "/recruiter/onboarding"
        );
      } else if (existingProfile.role === "college") {
        navigate(
          existingProfile.onboarding_completed
            ? "/college"
            : "/college/onboarding"
        );
      }

      return;
    }

    // No profile exists → create a new SkillBridge profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name:
          user.user_metadata?.full_name || "SkillBridge User",
        email: user.email,
        role: role,
        onboarding_completed: false,
      });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    // Send user to the correct onboarding page
    if (role === "student") {
      navigate("/student/onboarding");
    } else if (role === "recruiter") {
      navigate("/recruiter/onboarding");
    } else if (role === "college") {
      navigate("/college/onboarding");
    }

    setLoading(false);
  }

  return (
    <div className="role-page">
      <div className="role-container">

        {/* Brand */}
        <div className="role-brand">
          <div className="role-logo">SB</div>
          <span>SkillBridge</span>
        </div>

        {/* Heading */}
        <div className="role-heading">
          <h1>How will you use SkillBridge?</h1>

          <p>
            Choose your role so we can personalize your SkillBridge experience.
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-cards">

          {/* Student */}
          <button
            type="button"
            className="role-card"
            onClick={() => selectRole("student")}
            disabled={loading}
          >
            <div className="role-icon">🎓</div>

            <h2>Student</h2>

            <p>
              Build your skills, discover opportunities and prepare for your
              career.
            </p>

            <ul>
              <li>Build your skill profile</li>
              <li>Discover matching opportunities</li>
              <li>Identify missing skills</li>
            </ul>

            <span className="role-continue">
              Continue as Student →
            </span>
          </button>

          {/* Recruiter */}
          <button
            type="button"
            className="role-card"
            onClick={() => selectRole("recruiter")}
            disabled={loading}
          >
            <div className="role-icon">💼</div>

            <h2>Recruiter / Industry</h2>

            <p>
              Find skilled candidates and connect your opportunities with the
              right talent.
            </p>

            <ul>
              <li>Post jobs and internships</li>
              <li>Find eligible candidates</li>
              <li>Rank candidates by skills</li>
            </ul>

            <span className="role-continue">
              Continue as Recruiter →
            </span>
          </button>

          {/* College */}
          <button
            type="button"
            className="role-card"
            onClick={() => selectRole("college")}
            disabled={loading}
          >
            <div className="role-icon">🏫</div>

            <h2>College / Placement Cell</h2>

            <p>
              Understand student readiness and bridge the gap between academia
              and industry.
            </p>

            <ul>
              <li>Monitor student readiness</li>
              <li>Analyze industry skill demand</li>
              <li>Discover institutional skill gaps</li>
            </ul>

            <span className="role-continue">
              Continue as College →
            </span>
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <div className="role-message">
            <div className="role-spinner"></div>
            <p>Setting up your account...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="role-error">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}

export default RoleSelection;