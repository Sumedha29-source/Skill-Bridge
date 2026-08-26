import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    // If Supabase rejects the login
    if (loginError) {
      setError(loginError.message);
      return;
    }

    // If login succeeds
    if (data.user) {
      console.log("Login successful:", data.user);

      // Send user to landing page for now
      navigate("/select-role");
    }
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

      {error && (
        <p>
          {error}
        </p>
      )}

      <p>Don't have an account? Create one</p>
    </div>
  );
}

export default Login;