import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

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

    // Create the user's SkillBridge profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "SkillBridge User",
        email: user.email,
        role: role,
        onboarding_completed: false,
      });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    // Send user to the correct portal
    if (role === "student") {
      navigate("/student");
    } else if (role === "recruiter") {
      navigate("/recruiter");
    } else if (role === "college") {
      navigate("/college");
    }

    setLoading(false);
  }

  return (
    <div>
      <h1>How will you use SkillBridge?</h1>

      <p>
        Choose your role so we can personalize your SkillBridge experience.
      </p>

      <div>
        <button
          onClick={() => selectRole("student")}
          disabled={loading}
        >
          Student
        </button>

        <button
          onClick={() => selectRole("recruiter")}
          disabled={loading}
        >
          Recruiter / Industry
        </button>

        <button
          onClick={() => selectRole("college")}
          disabled={loading}
        >
          College / Placement Cell
        </button>
      </div>

      {loading && <p>Setting up your account...</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default RoleSelection;