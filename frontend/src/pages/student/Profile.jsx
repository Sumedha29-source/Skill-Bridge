import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

import ResumeUpload from "../../components/ResumeUpload";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  const [institution, setInstitution] = useState(null);
  const [department, setDepartment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        return;
      }

      setLoading(true);
      setError("");

      // ---------------------------------------------
      // 1. LOAD COMMON PROFILE
      // ---------------------------------------------

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "full_name, email, role, onboarding_completed"
          )
          .eq("id", user.id)
          .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // ---------------------------------------------
      // 2. LOAD STUDENT PROFILE
      // ---------------------------------------------

      const { data: studentData, error: studentError } =
        await supabase
          .from("student_profiles")
          .select(
            `
              id,
              phone,
              institution_id,
              department_id,
              degree,
              current_year,
              current_semester,
              graduation_year,
              cgpa,
              college_email,
              location,
              bio,
              linkedin_url,
              github_url,
              portfolio_url,
              profile_completion
            `
          )
          .eq("user_id", user.id)
          .single();

      if (studentError) {
        setError(studentError.message);
        setLoading(false);
        return;
      }

      setStudentProfile(studentData);

      // ---------------------------------------------
      // 3. LOAD COLLEGE
      // ---------------------------------------------

      if (studentData.institution_id) {
        const { data: institutionData } = await supabase
          .from("institutions")
          .select("id, name")
          .eq("id", studentData.institution_id)
          .single();

        setInstitution(institutionData);
      }

      // ---------------------------------------------
      // 4. LOAD DEPARTMENT
      // ---------------------------------------------

      if (studentData.department_id) {
        const { data: departmentData } = await supabase
          .from("departments")
          .select("id, name, code")
          .eq("id", studentData.department_id)
          .single();

        setDepartment(departmentData);
      }

      setLoading(false);
    }

    loadProfile();
  }, [user]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile || !studentProfile) {
    return <p>Student profile not found.</p>;
  }

  return (
    <div>
      <h1>My Profile</h1>

      {/* -----------------------------------------
          PROFILE COMPLETION
      ------------------------------------------ */}

      <section>
        <h2>Profile Completion</h2>

        <p>
          {studentProfile.profile_completion || 0}%
        </p>
      </section>

      <hr />

      {/* -----------------------------------------
          BASIC INFORMATION
      ------------------------------------------ */}

      <section>
        <h2>Basic Information</h2>

        <p>
          <strong>Name:</strong> {profile.full_name}
        </p>

        <p>
          <strong>Email:</strong> {profile.email}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {studentProfile.phone || "Not added"}
        </p>

        <p>
          <strong>College Email:</strong>{" "}
          {studentProfile.college_email || "Not added"}
        </p>
      </section>

      <hr />

      {/* -----------------------------------------
          ACADEMIC INFORMATION
      ------------------------------------------ */}

      <section>
        <h2>Academic Information</h2>

        <p>
          <strong>College:</strong>{" "}
          {institution?.name || "Not available"}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {department
            ? `${department.name} (${department.code})`
            : "Not available"}
        </p>

        <p>
          <strong>Degree:</strong>{" "}
          {studentProfile.degree}
        </p>

        <p>
          <strong>Current Year:</strong>{" "}
          {studentProfile.current_year || "Not added"}
        </p>

        <p>
          <strong>Current Semester:</strong>{" "}
          {studentProfile.current_semester || "Not added"}
        </p>

        <p>
          <strong>Graduation Year:</strong>{" "}
          {studentProfile.graduation_year}
        </p>

        <p>
          <strong>CGPA:</strong>{" "}
          {studentProfile.cgpa ?? "Not added"}
        </p>
      </section>

      <hr />

      {/* -----------------------------------------
          PROFESSIONAL INFORMATION
      ------------------------------------------ */}

      <section>
        <h2>Professional Information</h2>

        <p>
          <strong>LinkedIn:</strong>{" "}
          {studentProfile.linkedin_url || "Not added"}
        </p>

        <p>
          <strong>GitHub:</strong>{" "}
          {studentProfile.github_url || "Not added"}
        </p>

        <p>
          <strong>Portfolio:</strong>{" "}
          {studentProfile.portfolio_url || "Not added"}
        </p>
      </section>

      <hr />

      {/* -----------------------------------------
          FUTURE RESUME SECTION
      ------------------------------------------ */}

      <section>
  <h2>Resume</h2>

  <ResumeUpload
    studentId={studentProfile.id}
    onUploadComplete={(resume) => {
      console.log("Uploaded resume:", resume);
    }}
  />
</section>
      <hr />

      {/* -----------------------------------------
          FUTURE SKILLS SECTION
      ------------------------------------------ */}

      <section>
        <h2>Skills</h2>

        <p>No skills detected yet.</p>

        {/* Detected skills will appear here later */}
      </section>
    </div>
  );
}

export default Profile;