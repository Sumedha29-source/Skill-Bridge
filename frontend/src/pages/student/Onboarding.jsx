import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function StudentOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --------------------------------------------------
  // College and department data from Supabase
  // --------------------------------------------------

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // --------------------------------------------------
  // Student form fields
  // --------------------------------------------------

  const [phone, setPhone] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [degree, setDegree] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const [cgpa, setCgpa] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");

  // --------------------------------------------------
  // Loading / errors
  // --------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load institutions when page opens
  // --------------------------------------------------

  useEffect(() => {
    async function loadInstitutions() {
      const { data, error: institutionError } = await supabase
        .from("institutions")
        .select("id, name")
        .order("name");

      if (institutionError) {
        setError(institutionError.message);
        setPageLoading(false);
        return;
      }

      setInstitutions(data || []);
      setPageLoading(false);
    }

    loadInstitutions();
  }, []);

  // --------------------------------------------------
  // Load departments whenever college changes
  // --------------------------------------------------

  useEffect(() => {
    async function loadDepartments() {
      // No college selected yet
      if (!institutionId) {
        setDepartments([]);
        setDepartmentId("");
        return;
      }

      const { data, error: departmentError } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("institution_id", institutionId)
        .order("name");

      if (departmentError) {
        setError(departmentError.message);
        return;
      }

      setDepartments(data || []);

      // Clear old department selection
      setDepartmentId("");
    }

    loadDepartments();
  }, [institutionId]);

  // --------------------------------------------------
  // Submit student onboarding
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!institutionId) {
      setError("Please select your college.");
      return;
    }

    if (!departmentId) {
      setError("Please select your department.");
      return;
    }

    setLoading(true);

    // --------------------------------------------------
    // 1. Create/update student profile
    // --------------------------------------------------

    const { error: studentError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          user_id: user.id,

          phone: phone,

          institution_id: institutionId,
          department_id: departmentId,

          degree: degree,

          current_year: Number(currentYear),
          current_semester: Number(currentSemester),

          graduation_year: Number(graduationYear),

          cgpa: cgpa ? Number(cgpa) : null,

          college_email: collegeEmail || null,

          // Basic profile completion value for now.
          // We will calculate this dynamically later.
          profile_completion: 60,
        },
        {
          onConflict: "user_id",
        }
      );

    if (studentError) {
      setLoading(false);
      setError(studentError.message);
      return;
    }

    // --------------------------------------------------
    // 2. Mark onboarding as completed
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
    // 3. Send student to dashboard
    // --------------------------------------------------

    navigate("/student");
  }

  // --------------------------------------------------
  // Loading institutions
  // --------------------------------------------------

  if (pageLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Complete Your Student Profile</h1>

      <p>
        Tell us about your academic background so SkillBridge can
        personalize opportunities for you.
      </p>

      <form onSubmit={handleSubmit}>
        {/* ------------------------------------------
            NAME
        ------------------------------------------ */}

        <div>
          <label>Full Name</label>
          <br />

          <input
            type="text"
            value={user?.user_metadata?.full_name || ""}
            readOnly
          />
        </div>

        <br />

        {/* ------------------------------------------
            LOGIN EMAIL
        ------------------------------------------ */}

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={user?.email || ""}
            readOnly
          />
        </div>

        <br />

        {/* ------------------------------------------
            PHONE
        ------------------------------------------ */}

        <div>
          <label>Phone Number</label>
          <br />

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <br />

        {/* ------------------------------------------
            COLLEGE
        ------------------------------------------ */}

        <div>
          <label>College / Institution</label>
          <br />

          <select
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
            required
          >
            <option value="">Select your college</option>

            {institutions.map((institution) => (
              <option
                key={institution.id}
                value={institution.id}
              >
                {institution.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* ------------------------------------------
            DEPARTMENT
        ------------------------------------------ */}

        <div>
          <label>Department</label>
          <br />

          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            disabled={!institutionId}
            required
          >
            <option value="">Select your department</option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name} ({department.code})
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* ------------------------------------------
            DEGREE
        ------------------------------------------ */}

        <div>
          <label>Degree</label>
          <br />

          <input
            type="text"
            value={degree}
            onChange={(event) => setDegree(event.target.value)}
            placeholder="Example: B.Tech"
            required
          />
        </div>

        <br />

        {/* ------------------------------------------
            CURRENT YEAR
        ------------------------------------------ */}

        <div>
          <label>Current Year</label>
          <br />

          <select
            value={currentYear}
            onChange={(event) => setCurrentYear(event.target.value)}
            required
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
        </div>

        <br />

        {/* ------------------------------------------
            CURRENT SEMESTER
        ------------------------------------------ */}

        <div>
          <label>Current Semester</label>
          <br />

          <select
            value={currentSemester}
            onChange={(event) => setCurrentSemester(event.target.value)}
            required
          >
            <option value="">Select semester</option>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((semester) => (
              <option
                key={semester}
                value={semester}
              >
                Semester {semester}
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* ------------------------------------------
            GRADUATION YEAR
        ------------------------------------------ */}

        <div>
          <label>Graduation Year</label>
          <br />

          <input
            type="number"
            value={graduationYear}
            onChange={(event) =>
              setGraduationYear(event.target.value)
            }
            placeholder="Example: 2029"
            min="2026"
            max="2040"
            required
          />
        </div>

        <br />

        {/* ------------------------------------------
            CGPA
        ------------------------------------------ */}

        <div>
          <label>CGPA</label>
          <br />

          <input
            type="number"
            value={cgpa}
            onChange={(event) => setCgpa(event.target.value)}
            placeholder="Example: 8.25"
            min="0"
            max="10"
            step="0.01"
          />
        </div>

        <br />

        {/* ------------------------------------------
            COLLEGE EMAIL
        ------------------------------------------ */}

        <div>
          <label>College Email (Optional)</label>
          <br />

          <input
            type="email"
            value={collegeEmail}
            onChange={(event) =>
              setCollegeEmail(event.target.value)
            }
            placeholder="student@college.edu"
          />
        </div>

        <br />

        {/* ------------------------------------------
            SUBMIT
        ------------------------------------------ */}

        <button type="submit" disabled={loading}>
          {loading ? "Saving profile..." : "Complete Profile"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}

export default StudentOnboarding;