import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

function DepartmentSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data passed from College Onboarding page
  const institutionId = location.state?.institutionId;
  const numberOfDepartments = location.state?.numberOfDepartments;

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // CREATE ONE FORM OBJECT FOR EACH DEPARTMENT
  // --------------------------------------------------

  const [departments, setDepartments] = useState(
    Array.from({ length: numberOfDepartments || 0 }, () => ({
      name: "",
      code: "",
      studentCount: "",
    }))
  );

  // --------------------------------------------------
  // UPDATE A FIELD OF A SPECIFIC DEPARTMENT
  // --------------------------------------------------

  function handleDepartmentChange(index, field, value) {
    const updatedDepartments = [...departments];

    updatedDepartments[index] = {
      ...updatedDepartments[index],
      [field]: value,
    };

    setDepartments(updatedDepartments);
  }

  // --------------------------------------------------
  // SUBMIT ALL DEPARTMENTS
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // User must be logged in
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    // Institution information must exist
    if (!institutionId) {
      setError("Institution information is missing.");
      return;
    }

    // There must be at least one department
    if (departments.length === 0) {
      setError("Please add at least one department.");
      return;
    }

    // Validate every department
    for (const department of departments) {
      if (!department.name.trim()) {
        setError("Please enter a name for every department.");
        return;
      }

      if (!department.code.trim()) {
        setError("Please enter a code for every department.");
        return;
      }

      if (
        department.studentCount !== "" &&
        Number(department.studentCount) < 0
      ) {
        setError("Number of students cannot be negative.");
        return;
      }
    }

    setLoading(true);

    // --------------------------------------------------
    // CONVERT FRONTEND DATA INTO DATABASE ROWS
    // --------------------------------------------------

    const departmentRows = departments.map((department) => ({
      institution_id: institutionId,

      // Remove unnecessary spaces
      name: department.name.trim(),

      // Example:
      // cse → CSE
      code: department.code.trim().toUpperCase(),

      // If empty, store 0
      student_count:
        department.studentCount !== ""
          ? Number(department.studentCount)
          : 0,
    }));

    // --------------------------------------------------
    // 1. INSERT ALL DEPARTMENTS
    // --------------------------------------------------

    const { error: departmentError } = await supabase
      .from("departments")
      .insert(departmentRows);

    if (departmentError) {
      setLoading(false);

      // Useful message for duplicate department codes
      if (departmentError.code === "23505") {
        setError(
          "A department with the same code already exists for this institution."
        );
      } else {
        setError(departmentError.message);
      }

      return;
    }

    // --------------------------------------------------
    // 2. MARK COLLEGE ONBOARDING AS COMPLETE
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
    // 3. GO TO COLLEGE DASHBOARD
    // --------------------------------------------------

    navigate("/college");
  }

  // --------------------------------------------------
  // PREVENT DIRECT ACCESS
  // --------------------------------------------------
  // If someone manually opens /college/departments
  // without completing institution setup first.

  if (!institutionId || !numberOfDepartments) {
    return (
      <div>
        <h2>Institution setup required</h2>

        <p>
          Please complete your institution details before adding departments.
        </p>

        <button onClick={() => navigate("/college/onboarding")}>
          Go to Institution Setup
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div>
      <h1>Set Up Departments</h1>

      <p>
        Add details for your {numberOfDepartments}{" "}
        {numberOfDepartments === 1 ? "department" : "departments"}.
      </p>

      <form onSubmit={handleSubmit}>
        {departments.map((department, index) => (
          <div key={index}>
            <h2>Department {index + 1}</h2>

            {/* ----------------------------------------
                DEPARTMENT NAME
            ----------------------------------------- */}

            <div>
              <label>Department Name</label>
              <br />

              <input
                type="text"
                value={department.name}
                onChange={(event) =>
                  handleDepartmentChange(
                    index,
                    "name",
                    event.target.value
                  )
                }
                placeholder="Example: Computer Science & Engineering"
                required
              />
            </div>

            <br />

            {/* ----------------------------------------
                DEPARTMENT CODE
            ----------------------------------------- */}

            <div>
              <label>Department Code</label>
              <br />

              <input
                type="text"
                value={department.code}
                onChange={(event) =>
                  handleDepartmentChange(
                    index,
                    "code",
                    event.target.value
                  )
                }
                placeholder="Example: CSE"
                required
              />
            </div>

            <br />

            {/* ----------------------------------------
                NUMBER OF STUDENTS
            ----------------------------------------- */}

            <div>
              <label>Number of Students</label>
              <br />

              <input
                type="number"
                value={department.studentCount}
                onChange={(event) =>
                  handleDepartmentChange(
                    index,
                    "studentCount",
                    event.target.value
                  )
                }
                min="0"
                placeholder="Example: 180"
                required
              />
            </div>

            <br />

            <hr />
          </div>
        ))}

        {/* ----------------------------------------
            SUBMIT
        ----------------------------------------- */}

        <button type="submit" disabled={loading}>
          {loading ? "Saving departments..." : "Complete Setup"}
        </button>
      </form>

      {/* Error message */}
      {error && <p>{error}</p>}
    </div>
  );
}

export default DepartmentSetup;