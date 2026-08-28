import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function CollegeOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [numberOfDepartments, setNumberOfDepartments] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (Number(numberOfDepartments) < 1) {
      setError("Number of departments must be at least 1.");
      return;
    }

    setLoading(true);

    // --------------------------------------------------
    // 1. Create institution
    // --------------------------------------------------

    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .insert({
        name: collegeName,
        institution_code: collegeCode || null,
        contact_email: officialEmail,
        type: "college",
      })
      .select("id")
      .single();

    if (institutionError) {
      setLoading(false);
      setError(institutionError.message);
      return;
    }

    // --------------------------------------------------
    // 2. Link logged-in user to institution
    // --------------------------------------------------

    const { error: memberError } = await supabase
      .from("institution_members")
      .insert({
        user_id: user.id,
        institution_id: institution.id,
        member_role: "placement_officer",
      });

    if (memberError) {
      setLoading(false);
      setError(memberError.message);
      return;
    }

    setLoading(false);

    // --------------------------------------------------
    // 3. Move to department setup
    // --------------------------------------------------
    // We pass the institution ID and department count
    // through navigation state for the next page.

    navigate("/college/departments", {
      state: {
        institutionId: institution.id,
        numberOfDepartments: Number(numberOfDepartments),
      },
    });
  }

  return (
    <div>
      <h1>Set Up Your Institution</h1>

      <p>
        Add your institution details before setting up departments.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>College Name</label>
          <br />

          <input
            type="text"
            value={collegeName}
            onChange={(event) => setCollegeName(event.target.value)}
            placeholder="Enter college name"
            required
          />
        </div>

        <br />

        <div>
          <label>College ID / Code</label>
          <br />

          <input
            type="text"
            value={collegeCode}
            onChange={(event) => setCollegeCode(event.target.value)}
            placeholder="Example: HITK"
          />
        </div>

        <br />

        <div>
          <label>Official Email</label>
          <br />

          <input
            type="email"
            value={officialEmail}
            onChange={(event) => setOfficialEmail(event.target.value)}
            placeholder="placement@college.edu"
            required
          />
        </div>

        <br />

        <div>
          <label>Number of Departments</label>
          <br />

          <input
            type="number"
            value={numberOfDepartments}
            onChange={(event) =>
              setNumberOfDepartments(event.target.value)
            }
            min="1"
            max="30"
            placeholder="Example: 6"
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating institution..." : "Next"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}

export default CollegeOnboarding;