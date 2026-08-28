import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    // ---------------------------------------------
    // 1. LOGIN USING SUPABASE AUTH
    // ---------------------------------------------

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    const user = data.user;

    // ---------------------------------------------
    // 2. CHECK SKILLBRIDGE PROFILE
    // ---------------------------------------------

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    // ---------------------------------------------
    // 3. USER HAS NOT SELECTED ROLE YET
    // ---------------------------------------------

    if (!profile) {
      setLoading(false);
      navigate("/select-role");
      return;
    }

    // ---------------------------------------------
    // 4. STUDENT
    // ---------------------------------------------

    if (profile.role === "student") {
      setLoading(false);

      if (profile.onboarding_completed) {
        navigate("/student");
      } else {
        navigate("/student/onboarding");
      }

      return;
    }

    // ---------------------------------------------
    // 5. RECRUITER
    // ---------------------------------------------

    if (profile.role === "recruiter") {
      setLoading(false);

      if (profile.onboarding_completed) {
        navigate("/recruiter");
      } else {
        navigate("/recruiter/onboarding");
      }

      return;
    }

    // ---------------------------------------------
    // 6. COLLEGE
    // ---------------------------------------------

    if (profile.role === "college") {
      setLoading(false);

      if (profile.onboarding_completed) {
        navigate("/college");
      } else {
        navigate("/college/onboarding");
      }

      return;
    }

    // Invalid role just in case
    setLoading(false);
    setError("Invalid account role.");
  }

  return (
    <div>
      <h1>Welcome back to SkillBridge</h1>

      <p>Sign in to continue to your account.</p>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <p>
  Don't have an account? <Link to="/signup">Create one</Link>
</p>
    </div>
  );
}

export default Login;