// import { useState } from "react";

// function AddStudent() {
//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     class: "",
//     section: "",
//     gender: "",
//     dob: "",
//     roll: "",
//     admissionNo: "",
//     email: "",
//     fatherName: "",
//     motherName: "",
//     fatherOccupation: "",
//     motherOccupation: "",
//     phone: "",
//     address: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     // TODO: wire to Django REST API (students app) once endpoint is ready
//     console.log(form);
//   };

//   const inputClass =
//     "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700";
//   const labelClass =
//     "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

//   return (
//     <div className="mx-auto w-full max-w-[1100px]">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
//           Add Student
//         </h2>
//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//           Register a new student and guardian information.
//         </p>
//       </div>

//       <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
//         {/* Student Information */}
//         <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//           Student Information
//         </h3>

//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <div>
//             <label className={labelClass}>First Name</label>
//             <input
//               name="firstName"
//               value={form.firstName}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Last Name</label>
//             <input
//               name="lastName"
//               value={form.lastName}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Class</label>
//             <select
//               name="class"
//               value={form.class}
//               onChange={handleChange}
//               className={inputClass}
//             >
//               <option value="">Select Class</option>
//             </select>
//           </div>
//           <div>
//             <label className={labelClass}>Section</label>
//             <select
//               name="section"
//               value={form.section}
//               onChange={handleChange}
//               className={inputClass}
//             >
//               <option value="">Select Section</option>
//             </select>
//           </div>

//           <div>
//             <label className={labelClass}>Gender</label>
//             <select
//               name="gender"
//               value={form.gender}
//               onChange={handleChange}
//               className={inputClass}
//             >
//               <option value="">Select Gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>
//           <div>
//             <label className={labelClass}>Date of Birth</label>
//             <input
//               type="date"
//               name="dob"
//               value={form.dob}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Roll No</label>
//             <input
//               name="roll"
//               value={form.roll}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Admission No</label>
//             <input
//               name="admissionNo"
//               value={form.admissionNo}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>

//           <div className="sm:col-span-2 lg:col-span-2">
//             <label className={labelClass}>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//         </div>

//         {/* Parent Information */}
//         <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//           Parent / Guardian Information
//         </h3>

//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <div>
//             <label className={labelClass}>Father Name</label>
//             <input
//               name="fatherName"
//               value={form.fatherName}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Mother Name</label>
//             <input
//               name="motherName"
//               value={form.motherName}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Father Occupation</label>
//             <input
//               name="fatherOccupation"
//               value={form.fatherOccupation}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div>
//             <label className={labelClass}>Mother Occupation</label>
//             <input
//               name="motherOccupation"
//               value={form.motherOccupation}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>

//           <div>
//             <label className={labelClass}>Phone Number</label>
//             <input
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//           <div className="sm:col-span-2 lg:col-span-3">
//             <label className={labelClass}>Address</label>
//             <input
//               name="address"
//               value={form.address}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
//           <button
//             type="button"
//             onClick={handleSubmit}
//             className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90"
//           >
//             Save Student
//           </button>
//           <button
//             type="button"
//             onClick={() => setForm({})}
//             className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//           >
//             Reset
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AddStudent;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createStudent,
  createEnrollment,
} from "../../../services/studentsService";

import {
  getSchools,
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

function AddStudent() {
  const navigate = useNavigate();

  // =====================================================
  // FORM
  // =====================================================

  const initialForm = {
    firstName: "",
    middleName: "",
    lastName: "",

    school: "",
    classLevel: "",
    academicSession: "",
    term: "",

    gender: "",
    dob: "",
    admissionDate: "",
    admissionNo: "",
    roll: "",

    email: "",
    phone: "",
    address: "",
  };

  const [form, setForm] = useState(initialForm);

  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  const [schools, setSchools] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD DROPDOWN DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [schoolsData, classLevelsData, sessionsData, termsData] =
          await Promise.all([
            getSchools(),
            getClassLevels(),
            getSessions(),
            getTerms(),
          ]);

        setSchools(
          Array.isArray(schoolsData) ? schoolsData : schoolsData?.results || [],
        );

        setClassLevels(
          Array.isArray(classLevelsData)
            ? classLevelsData
            : classLevelsData?.results || [],
        );

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || [],
        );

        setTerms(
          Array.isArray(termsData) ? termsData : termsData?.results || [],
        );
      } catch (err) {
        console.error("Failed to load student registration data:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load school information. Please check that the backend is running and you are logged in.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear old messages when user starts editing
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm(initialForm);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // FORMAT DJANGO ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Unable to save student. Please try again.";
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

    return "Unable to save student. Please check the information and try again.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // FRONTEND VALIDATION
    // -----------------------------------------------------

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

    if (!form.classLevel) {
      setError("Please select a class.");
      return;
    }

    if (!form.academicSession) {
      setError("Please select an academic session.");
      return;
    }

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    try {
      setSaving(true);

      // ===================================================
      // STEP 1 — CREATE STUDENT
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

      console.log("Creating student:", studentData);

      const student = await createStudent(studentData);

      console.log("Student created:", student);

      // ===================================================
      // STEP 2 — CREATE ENROLLMENT
      // ===================================================

      const enrollmentData = {
        student: student.id,

        academic_session: Number(form.academicSession),

        term: Number(form.term),

        class_level: Number(form.classLevel),

        roll_number: form.roll ? Number(form.roll) : null,
      };

      console.log("Creating enrollment:", enrollmentData);

      await createEnrollment(enrollmentData);

      // ===================================================
      // SUCCESS
      // ===================================================

      setSuccess(
        `${student.full_name || `${form.firstName} ${form.lastName}`} has been registered successfully.`,
      );

      // Reset the form WITHOUT clearing success
      setForm(initialForm);

      // Redirect after showing success
      setTimeout(() => {
        window.location.href = "/admin/students";
      }, 1200);
    } catch (err) {
      console.error("Student registration failed:", err);

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
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Add Student
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Register a new student and enrollment information.
        </p>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loadingData && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-[var(--color-card)] p-4 text-sm text-slate-500 dark:border-slate-800">
          Loading school information...
        </div>
      )}

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
          </div>

          {/* =================================================
              ENROLLMENT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Enrollment Information
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Academic Session */}

            <div>
              <label className={labelClass}>Academic Session *</label>

              <select
                name="academicSession"
                value={form.academicSession}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Session</option>

                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}

            <div>
              <label className={labelClass}>Term *</label>

              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Term</option>

                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}

            <div>
              <label className={labelClass}>Class *</label>

              <select
                name="classLevel"
                value={form.classLevel}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Class</option>

                {classLevels.map((classLevel) => (
                  <option key={classLevel.id} value={classLevel.id}>
                    {classLevel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Number */}

            <div>
              <label className={labelClass}>Roll Number</label>

              <input
                type="number"
                min="1"
                name="roll"
                value={form.roll}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Contact Information
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Email */}

            <div>
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

            <div className="sm:col-span-2">
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
              disabled={saving || loadingData}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Student..." : "Save Student"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddStudent;
