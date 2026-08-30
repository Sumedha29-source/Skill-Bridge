import { useState } from "react";

import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

function ResumeUpload({ studentId, onUploadComplete }) {
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // SELECT FILE
  // --------------------------------------------------

  function handleFileChange(event) {
    const file = event.target.files[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Only PDF files allowed
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setSelectedFile(null);
      return;
    }

    // Maximum size = 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Resume must be smaller than 5 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  // --------------------------------------------------
  // UPLOAD RESUME
  // --------------------------------------------------

  async function handleUpload() {
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!studentId) {
      setError("Student profile information is missing.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a PDF resume.");
      return;
    }

    setUploading(true);

    // --------------------------------------------------
    // CREATE SAFE FILE NAME
    // --------------------------------------------------

    const safeFileName = selectedFile.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${user.id}/${Date.now()}-${safeFileName}`;

    // --------------------------------------------------
    // 1. UPLOAD PDF TO SUPABASE STORAGE
    // --------------------------------------------------

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, selectedFile, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    // --------------------------------------------------
    // 2. MARK OLD RESUMES AS NOT CURRENT
    // --------------------------------------------------

    const { error: oldResumeError } = await supabase
      .from("resumes")
      .update({
        is_current: false,
      })
      .eq("student_id", studentId)
      .eq("is_current", true);

    if (oldResumeError) {
      // Remove uploaded file if database update fails
      await supabase.storage
        .from("resumes")
        .remove([filePath]);

      setUploading(false);
      setError(oldResumeError.message);
      return;
    }

    // --------------------------------------------------
    // 3. CREATE RESUME DATABASE RECORD
    // --------------------------------------------------

    const { data: resumeData, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        student_id: studentId,

        // Store private Supabase Storage path
        file_url: filePath,

        file_name: selectedFile.name,

        is_current: true,
      })
      .select()
      .single();

    if (resumeError) {
      // Remove uploaded file if database insertion fails
      await supabase.storage
        .from("resumes")
        .remove([filePath]);

      setUploading(false);
      setError(resumeError.message);
      return;
    }

    // --------------------------------------------------
    // 4. SEND PDF TO FLASK FOR TEXT EXTRACTION
    // --------------------------------------------------

    try {
      const formData = new FormData();

      formData.append("resume", selectedFile);

      const parseResponse = await fetch(
        "http://127.0.0.1:5000/api/resume/parse",
        {
          method: "POST",
          body: formData,
        }
      );

      const parseResult = await parseResponse.json();

      if (!parseResponse.ok || !parseResult.success) {
        setUploading(false);

        setError(
          parseResult.message ||
            "Resume uploaded, but text extraction failed."
        );

        return;
      }

      // --------------------------------------------------
      // 5. SAVE EXTRACTED TEXT INTO RESUMES TABLE
      // --------------------------------------------------

      const { error: parsedTextError } = await supabase
        .from("resumes")
        .update({
          parsed_text: parseResult.text,
        })
        .eq("id", resumeData.id);

      if (parsedTextError) {
        setUploading(false);
        setError(
          `Resume was uploaded, but extracted text could not be saved: ${parsedTextError.message}`
        );
        return;
      }

      // --------------------------------------------------
      // 6. UPDATE PROFILE COMPLETION
      // --------------------------------------------------

      const { error: profileError } = await supabase
        .from("student_profiles")
        .update({
          profile_completion: 70,
        })
        .eq("id", studentId);

      if (profileError) {
        setUploading(false);
        setError(profileError.message);
        return;
      }

      // --------------------------------------------------
      // 7. FINISHED
      // --------------------------------------------------

      setSelectedFile(null);
      setUploading(false);

      setSuccess(
        "Resume uploaded and processed successfully."
      );

      if (onUploadComplete) {
        onUploadComplete({
          ...resumeData,
          parsed_text: parseResult.text,
        });
      }
    } catch (parseError) {
      console.error("Resume parsing error:", parseError);

      setUploading(false);

      setError(
        "Resume was uploaded, but SkillBridge could not connect to the resume parser. Make sure the Flask backend is running."
      );
    }
  }

  // --------------------------------------------------
  // COMPONENT
  // --------------------------------------------------

  return (
    <div>
      <h3>Upload Resume</h3>

      <p>
        Upload your latest resume in PDF format.
      </p>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      <br />
      <br />

      {selectedFile && (
        <p>
          Selected:{" "}
          <strong>{selectedFile.name}</strong>
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading
          ? "Processing Resume..."
          : "Upload Resume"}
      </button>

      {error && (
        <p>
          {error}
        </p>
      )}

      {success && (
        <p>
          {success}
        </p>
      )}
    </div>
  );
}

export default ResumeUpload;