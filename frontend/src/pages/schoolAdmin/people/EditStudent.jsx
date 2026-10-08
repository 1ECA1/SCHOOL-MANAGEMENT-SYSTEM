import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStudent, updateStudent } from "../../../services/studentsService";

import { getSchools } from "../../../services/academicsService";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // INITIAL FORM
  // =====================================================

  const initialForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    school: "",
    gender: "",
    dob: "",
    admissionDate: "",
    admissionNo: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  };

  const [form, setForm] = useState(initialForm);

  const [schools, setSchools] = useState([]);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD STUDENT + SCHOOLS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentData, schoolsData] = await Promise.all([
          getStudent(id),
          getSchools(),
        ]);

        const schoolList = Array.isArray(schoolsData)
          ? schoolsData
          : schoolsData?.results || [];

        setSchools(schoolList);

        // =================================================
        // STUDENT FORM
        // =================================================

        setForm({
          firstName: studentData.first_name || "",
          middleName: studentData.middle_name || "",
          lastName: studentData.last_name || "",

          school: studentData.school
            ? String(
                typeof studentData.school === "object"
                  ? studentData.school.id
                  : studentData.school,
              )
            : "",

          gender: studentData.gender || "",

          dob: studentData.date_of_birth || "",

          admissionDate: studentData.admission_date || "",

          admissionNo: studentData.admission_number || "",

          email: studentData.email || "",

          phone: studentData.phone_number || studentData.phone || "",

          address: studentData.address || "",
          status: studentData.status || "ACTIVE",
        });

        // =================================================
        // EXISTING PROFILE IMAGE
        // =================================================

        if (studentData.profile_image) {
          const imageUrl = studentData.profile_image.startsWith("http")
            ? studentData.profile_image
            : `http://127.0.0.1:8000${studentData.profile_image}`;

          setProfilePreview(imageUrl);
        } else {
          setProfilePreview("");
        }
      } catch (err) {
        console.error("Failed to load student:", err);

        setError(
          err.response?.data?.detail || "Unable to load student information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // HANDLE PROFILE IMAGE
  // =====================================================

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ===================================================
    // CHECK FILE TYPE
    // ===================================================

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // ===================================================
    // CHECK FILE SIZE
    // ===================================================

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5MB.");
      return;
    }

    setError("");
    setSuccess("");

    setProfileImage(file);

    // ===================================================
    // CREATE PREVIEW
    // ===================================================

    const previewUrl = URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  // =====================================================
  // FORMAT API ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Unable to update student. Please try again.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      const messages = Object.entries(data)
        .map(([field, message]) => {
          const text = Array.isArray(message)
            ? message.join(", ")
            : String(message);

          return `${field}: ${text}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Unable to update student. Please check the information and try again.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.school) {
      setError("Please select a school.");
      return;
    }

    if (!form.admissionNo.trim()) {
      setError("Admission number is required.");
      return;
    }

    if (!form.dob) {
      setError("Date of birth is required.");
      return;
    }

    if (!form.admissionDate) {
      setError("Admission date is required.");
      return;
    }

    if (!form.gender) {
      setError("Please select a gender.");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // FORM DATA
      // =================================================

      const studentData = new FormData();

      studentData.append("school", Number(form.school));

      studentData.append("admission_number", form.admissionNo.trim());

      studentData.append("first_name", form.firstName.trim());

      studentData.append("middle_name", form.middleName.trim());

      studentData.append("last_name", form.lastName.trim());

      studentData.append("date_of_birth", form.dob);

      studentData.append("gender", form.gender);

      studentData.append("email", form.email.trim());

      studentData.append("phone_number", form.phone.trim());

      studentData.append("address", form.address.trim());

      studentData.append("admission_date", form.admissionDate);

      studentData.append("status", form.status);

      // =================================================
      // PROFILE IMAGE
      // =================================================

      if (profileImage) {
        studentData.append("profile_image", profileImage);
      }

      console.log("Updating student...");

      await updateStudent(id, studentData);

      setSuccess("Student updated successfully.");

      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {
        navigate(`/admin/students/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Student update failed:", err);

      console.error("API response:", err.response?.data);

      setError(formatApiError(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STYLES
  // =====================================================

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

  // =====================================================
  // FULL NAME
  // =====================================================

  const fullName = [form.firstName, form.middleName, form.lastName]
    .filter(Boolean)
    .join(" ");

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading student information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/admin/students/${id}`)}
          className="mb-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Student
        </button>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Edit Student
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update the student's information.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
          {/* =================================================
              PROFILE PICTURE
          ================================================= */}

          <div className="mb-6 border-b border-slate-200 pb-6 dark:border-slate-800">
            <h3 className="mb-4 text-sm font-bold text-[var(--color-text)]">
              Profile Picture
            </h3>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Image Preview */}

              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)] shadow-md">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={fullName || "Student"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";

                      const fallback = event.currentTarget.nextElementSibling;

                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                {/* Fallback Initial */}

                <div
                  className={`h-full w-full items-center justify-center text-3xl font-bold text-white ${
                    profilePreview ? "hidden" : "flex"
                  }`}
                >
                  {fullName?.charAt(0)?.toUpperCase() || "S"}
                </div>
              </div>

              {/* Upload */}

              <div>
                <label className={labelClass}>Student Photo</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  disabled={saving}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                />

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  JPG, JPEG, PNG or other image formats. Maximum size: 5MB.
                </p>

                {profileImage && (
                  <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                    New image selected: {profileImage.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Student Information
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* First Name */}

            <div>
              <label className={labelClass}>First Name *</label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Middle Name */}

            <div>
              <label className={labelClass}>Middle Name</label>

              <input
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Last Name */}

            <div>
              <label className={labelClass}>Last Name *</label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Admission Number */}

            <div>
              <label className={labelClass}>Admission Number *</label>

              <input
                name="admissionNo"
                value={form.admissionNo}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* School */}

            <div>
              <label className={labelClass}>School *</label>

              <select
                name="school"
                value={form.school}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select School</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}

            <div>
              <label className={labelClass}>Gender *</label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Gender</option>

                <option value="MALE">Male</option>

                <option value="FEMALE">Female</option>

                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Status */}

            <div>
              <label className={labelClass}>Student Status *</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="ACTIVE">Active</option>

                <option value="GRADUATED">Graduated</option>

                <option value="TRANSFERRED">Transferred</option>

                <option value="SUSPENDED">Suspended</option>

                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            {/* Date of Birth */}

            <div>
              <label className={labelClass}>Date of Birth *</label>

              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Admission Date */}

            <div>
              <label className={labelClass}>Admission Date *</label>

              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Email */}

            <div className="sm:col-span-2">
              <label className={labelClass}>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Phone */}

            <div>
              <label className={labelClass}>Phone Number</label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Address */}

            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Address</label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating Student..." : "Update Student"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(`/admin/students/${id}`)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditStudent;
