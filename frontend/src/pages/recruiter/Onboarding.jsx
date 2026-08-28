import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function RecruiterOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);

    // --------------------------------------------------
    // 1. Create company
    // --------------------------------------------------

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        contact_email: companyEmail,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (companyError) {
      setLoading(false);
      setError(companyError.message);
      return;
    }

    // --------------------------------------------------
    // 2. Create recruiter profile
    // --------------------------------------------------

    const { error: recruiterError } = await supabase
      .from("recruiter_profiles")
      .insert({
        user_id: user.id,
        company_id: company.id,
        designation: designation,
        phone: phone || null,
      });

    if (recruiterError) {
      setLoading(false);
      setError(recruiterError.message);
      return;
    }

    // --------------------------------------------------
    // 3. Mark onboarding complete
    // --------------------------------------------------

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    setLoading(false);

    // --------------------------------------------------
    // 4. Go to recruiter dashboard
    // --------------------------------------------------

    navigate("/recruiter");
  }

  return (
    <div>
      <h1>Complete Your Recruiter Profile</h1>

      <p>
        Tell us about you and your company so you can start posting
        opportunities and finding candidates.
      </p>

      <form onSubmit={handleSubmit}>

        {/* NAME */}
        <div>
          <label>Name</label>
          <br />

          <input
            type="text"
            value={user?.user_metadata?.full_name || ""}
            readOnly
          />
        </div>

        <br />

        {/* COMPANY */}
        <div>
          <label>Company</label>
          <br />

          <input
            type="text"
            value={companyName}
            onChange={(event) =>
              setCompanyName(event.target.value)
            }
            placeholder="Enter company name"
            required
          />
        </div>

        <br />

        {/* DESIGNATION */}
        <div>
          <label>Designation</label>
          <br />

          <input
            type="text"
            value={designation}
            onChange={(event) =>
              setDesignation(event.target.value)
            }
            placeholder="Example: HR Manager"
            required
          />
        </div>

        <br />

        {/* COMPANY EMAIL */}
        <div>
          <label>Company Email</label>
          <br />

          <input
            type="email"
            value={companyEmail}
            onChange={(event) =>
              setCompanyEmail(event.target.value)
            }
            placeholder="Example: hr@company.com"
            required
          />
        </div>

        <br />

        {/* PHONE */}
        <div>
          <label>Phone Number (Optional)</label>
          <br />

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="Enter phone number"
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Saving profile..." : "Complete Profile"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}

export default RecruiterOnboarding;