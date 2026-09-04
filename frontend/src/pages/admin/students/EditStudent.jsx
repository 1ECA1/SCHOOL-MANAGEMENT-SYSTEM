import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStudent, updateStudent } from "../../../services/studentsService";

import { getSchools } from "../../../services/academicsService";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  };

  const [form, setForm] = useState(initialForm);

  const [schools, setSchools] = useState([]);

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
        });
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

      // ===================================================
      // STUDENT DATA
      // ===================================================

      const studentData = {
        school: Number(form.school),

        admission_number: form.admissionNo.trim(),

        first_name: form.firstName.trim(),

        middle_name: form.middleName.trim(),

        last_name: form.lastName.trim(),

        date_of_birth: form.dob,

        gender: form.gender,

        email: form.email.trim(),

        phone_number: form.phone.trim(),

        address: form.address.trim(),

        admission_date: form.admissionDate,
      };

      console.log("Updating student:", studentData);

      await updateStudent(id, studentData);

      setSuccess("Student updated successfully.");

      // Give the user a moment to see success message
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
