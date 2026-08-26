import { useState } from "react";
import { supabase } from "../../services/supabase";

function Signup() {
  // Form values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Used for loading and messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event) {
    // Prevent page refresh when form is submitted
    event.preventDefault();

    setError("");
    setMessage("");

    // Make sure both passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Create the user inside Supabase Authentication
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,

      // Store the user's name in Supabase auth metadata.
      // We will create the SkillBridge profile later.
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    // Handle Supabase errors
    if (signupError) {
      setError(signupError.message);
      return;
    }

    // Because email confirmation is enabled,
    // the user must verify their email before continuing.
    if (data.user) {
      setMessage(
        "Account created! Please check your email and confirm your account."
      );

      // Clear the form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div>
      <h1>Create your SkillBridge account</h1>

      <p>
        Connect your skills with opportunities, recruiters and institutions.
      </p>

      <form onSubmit={handleSignup}>
        <div>
          <label>Full Name</label>
          <br />

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <br />

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
            placeholder="Create a password"
            required
          />
        </div>

        <br />

        <div>
          <label>Confirm Password</label>
          <br />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Show error if signup fails */}
      {error && <p>{error}</p>}

      {/* Show success message after signup */}
      {message && <p>{message}</p>}

      <p>
        Already have an account? Sign in
      </p>
    </div>
  );
}

export default Signup;