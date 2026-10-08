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
  getDepartments,
} from "../../../services/academicsService";

function AddStudent({ basePath = "/admin/students", schoolScoped = false }) {
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
    department: "",

    gender: "",
    dob: "",
    admissionDate: "",
    admissionNo: "",
    roll: "",

    email: "",
    phone: "",
    address: "",

    nationality: "",
    stateOfOrigin: "",
    localGovernment: "",

    bloodGroup: "",
  };

  const [form, setForm] = useState(initialForm);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  const [schools, setSchools] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [departments, setDepartments] = useState([]);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // CREATED STUDENT DETAILS
  // =====================================================

  const [createdStudent, setCreatedStudent] = useState(null);
  const [createdEnrollment, setCreatedEnrollment] = useState(null);

  // =====================================================
  // COPY STATE
  // =====================================================

  const [copied, setCopied] = useState(false);

  // =====================================================
  // LOAD DROPDOWN DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          schoolsData,
          classLevelsData,
          sessionsData,
          termsData,
          departmentsData,
        ] = await Promise.all([
          getSchools(),
          getClassLevels(),
          getSessions(),
          getTerms(),
          getDepartments(),
        ]);

        setSchools(
          Array.isArray(schoolsData)
            ? schoolsData
            : schoolsData?.results || [],
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
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || [],
        );

        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData?.results || [],
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

    setForm((previous) => {
      const updatedForm = {
        ...previous,
        [name]: value,
      };

      // -------------------------------------------------
      // SCHOOL CHANGE
      // -------------------------------------------------

      if (name === "school") {
        updatedForm.department = "";
        updatedForm.classLevel = "";
      }

      // -------------------------------------------------
      // CLASS CHANGE
      // -------------------------------------------------

      if (name === "classLevel") {
        const changedClass = classLevels.find(
          (classLevel) => String(classLevel.id) === String(value),
        );

        const changedClassIsSeniorSecondary = changedClass?.name
          ?.toUpperCase()
          .startsWith("SS");

        if (!changedClassIsSeniorSecondary) {
          updatedForm.department = "";
        }
      }

      return updatedForm;
    });

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setProfilePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must not be larger than 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setProfileImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // =====================================================
  // SELECTED CLASS
  // =====================================================

  const selectedClass = classLevels.find(
    (classLevel) =>
      String(classLevel.id) === String(form.classLevel),
  );

  // =====================================================
  // SENIOR SECONDARY CHECK
  // =====================================================

  const isSeniorSecondary = selectedClass?.name
    ?.toUpperCase()
    .startsWith("SS");

  const isDepartmentRequired = isSeniorSecondary;

  // =====================================================
  // AVAILABLE DEPARTMENTS
  // =====================================================

  const availableDepartments = departments.filter(
    (department) =>
      String(department.school) === String(form.school) &&
      department.is_active !== false,
  );

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm(initialForm);
    setProfileImage(null);
    setProfilePreview("");
    setError("");
    setSuccess("");
    setCreatedStudent(null);
    setCreatedEnrollment(null);
    setCopied(false);
  };

  // =====================================================
  // FORMAT API ERROR
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
  // GET DISPLAY VALUES
  // =====================================================

  const getSchoolName = () => {
    if (createdStudent?.school) {
      const school = schools.find(
        (item) =>
          String(item.id) === String(createdStudent.school),
      );

      return school?.name || `School ${createdStudent.school}`;
    }

    if (form.school) {
      const school = schools.find(
        (item) => String(item.id) === String(form.school),
      );

      return school?.name || "";
    }

    return "";
  };

  // =====================================================
  // BUILD STUDENT LOGIN DETAILS
  // =====================================================

  const getCredentialText = () => {
    if (!createdStudent) {
      return "";
    }

    const credentials = createdStudent.login_credentials || {};

    const studentName =
      createdStudent.full_name ||
      [
        createdStudent.first_name,
        createdStudent.middle_name,
        createdStudent.last_name,
      ]
        .filter(Boolean)
        .join(" ");

    const className =
      createdEnrollment?.class_name ||
      selectedClass?.name ||
      "";

    const sessionName =
      createdEnrollment?.session_name ||
      "";

    const termName =
      createdEnrollment?.term_name ||
      "";

    const rollNumber =
      createdEnrollment?.roll_number ??
      form.roll ??
      "";

    return [
      "EDUMANAGEERP STUDENT LOGIN DETAILS",
      "===================================",
      "",
      `Student Name: ${studentName}`,
      `Admission Number: ${createdStudent.admission_number || ""}`,
      `School: ${getSchoolName()}`,
      `Class: ${className}`,
      `Academic Session: ${sessionName}`,
      `Term: ${termName}`,
      `Roll Number: ${rollNumber}`,
      "",
      "LOGIN INFORMATION",
      "-----------------",
      `Username: ${credentials.username || ""}`,
      `Password: ${credentials.password || ""}`,
      "",
      "Please keep these login details safe.",
    ].join("\n");
  };

  // =====================================================
  // COPY LOGIN DETAILS
  // =====================================================

  const handleCopyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        getCredentialText(),
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Unable to copy student credentials:", err);

      setError(
        "Unable to copy the login details. Please select and copy them manually.",
      );
    }
  };

  // =====================================================
  // PRINT LOGIN DETAILS
  // =====================================================

  const handlePrintCredentials = () => {
    if (!createdStudent) {
      return;
    }

    const credentials =
      createdStudent.login_credentials || {};

    const studentName =
      createdStudent.full_name ||
      [
        createdStudent.first_name,
        createdStudent.middle_name,
        createdStudent.last_name,
      ]
        .filter(Boolean)
        .join(" ");

    const className =
      createdEnrollment?.class_name ||
      selectedClass?.name ||
      "";

    const sessionName =
      createdEnrollment?.session_name ||
      "";

    const termName =
      createdEnrollment?.term_name ||
      "";

    const rollNumber =
      createdEnrollment?.roll_number ??
      form.roll ??
      "";

    const schoolName = getSchoolName();

    const printWindow = window.open(
      "",
      "_blank",
      "width=800,height=700",
    );

    if (!printWindow) {
      setError(
        "Unable to open the print window. Please allow pop-ups and try again.",
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Login Details</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .container {
              max-width: 700px;
              margin: 0 auto;
              border: 1px solid #d1d5db;
              border-radius: 12px;
              padding: 32px;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }

            .header h1 {
              margin: 0 0 8px;
              font-size: 24px;
            }

            .header p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }

            .section {
              margin-top: 24px;
            }

            .section h2 {
              margin: 0 0 14px;
              font-size: 16px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 9px 0;
              border-bottom: 1px solid #f3f4f6;
            }

            .label {
              color: #6b7280;
            }

            .value {
              font-weight: 600;
              text-align: right;
            }

            .credentials {
              margin-top: 24px;
              padding: 22px;
              border: 2px solid #d1d5db;
              border-radius: 10px;
              background: #f9fafb;
            }

            .credential-row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 10px 0;
            }

            .credential-label {
              color: #6b7280;
            }

            .credential-value {
              font-size: 18px;
              font-weight: 700;
              letter-spacing: 0.3px;
            }

            .warning {
              margin-top: 24px;
              padding: 14px;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              border-radius: 8px;
              color: #9a3412;
              font-size: 13px;
            }

            .footer {
              margin-top: 30px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }

            @media print {
              body {
                padding: 0;
              }

              .container {
                border: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="container">

            <div class="header">
              <h1>Student Login Details</h1>
              <p>${schoolName || "EduManageERP"}</p>
            </div>

            <div class="section">
              <h2>Student Information</h2>

              <div class="row">
                <span class="label">Student Name</span>
                <span class="value">${studentName}</span>
              </div>

              <div class="row">
                <span class="label">Admission Number</span>
                <span class="value">${createdStudent.admission_number || ""}</span>
              </div>

              <div class="row">
                <span class="label">Class</span>
                <span class="value">${className}</span>
              </div>

              <div class="row">
                <span class="label">Academic Session</span>
                <span class="value">${sessionName}</span>
              </div>

              <div class="row">
                <span class="label">Term</span>
                <span class="value">${termName}</span>
              </div>

              <div class="row">
                <span class="label">Roll Number</span>
                <span class="value">${rollNumber}</span>
              </div>
            </div>

            <div class="credentials">
              <h2>Login Information</h2>

              <div class="credential-row">
                <span class="credential-label">Username</span>
                <span class="credential-value">
                  ${credentials.username || ""}
                </span>
              </div>

              <div class="credential-row">
                <span class="credential-label">Temporary Password</span>
                <span class="credential-value">
                  ${credentials.password || ""}
                </span>
              </div>
            </div>

            <div class="warning">
              Please give these login details to the student securely.
              The student should change the temporary password after
              logging in if the application provides that option.
            </div>

            <div class="footer">
              Generated by EduManageERP
            </div>

          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setCreatedStudent(null);
    setCreatedEnrollment(null);

    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!schoolScoped && !form.school) {
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

    // ===================================================
    // DEPARTMENT VALIDATION
    // ===================================================

    if (isDepartmentRequired && !form.department) {
      setError(
        "Please select a department for Senior Secondary.",
      );
      return;
    }

    if (!isDepartmentRequired && form.department) {
      setError(
        "Department is only allowed for Senior Secondary students.",
      );
      return;
    }

    if (isDepartmentRequired) {
      const selectedDepartment =
        availableDepartments.find(
          (department) =>
            String(department.id) ===
            String(form.department),
        );

      if (!selectedDepartment) {
        setError(
          "The selected department is not available for this school.",
        );
        return;
      }
    }

    // ===================================================
    // ACADEMIC SESSION
    // ===================================================

    if (!form.academicSession) {
      setError("Please select an academic session.");
      return;
    }

    // ===================================================
    // TERM
    // ===================================================

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // STEP 1 — CREATE STUDENT
      // =================================================

      const studentData = new FormData();

      if (!schoolScoped) {
        studentData.append(
          "school",
          Number(form.school),
        );
      }

      studentData.append(
        "admission_number",
        form.admissionNo.trim(),
      );

      studentData.append(
        "first_name",
        form.firstName.trim(),
      );

      studentData.append(
        "middle_name",
        form.middleName.trim(),
      );

      studentData.append(
        "last_name",
        form.lastName.trim(),
      );

      studentData.append(
        "date_of_birth",
        form.dob,
      );

      studentData.append(
        "gender",
        form.gender,
      );

      studentData.append(
        "admission_date",
        form.admissionDate,
      );

      // -------------------------------------------------
      // OPTIONAL INFORMATION
      // -------------------------------------------------

      if (form.email.trim()) {
        studentData.append(
          "email",
          form.email.trim(),
        );
      }

      if (form.phone.trim()) {
        studentData.append(
          "phone_number",
          form.phone.trim(),
        );
      }

      if (form.address.trim()) {
        studentData.append(
          "address",
          form.address.trim(),
        );
      }

      if (form.nationality.trim()) {
        studentData.append(
          "nationality",
          form.nationality.trim(),
        );
      }

      if (form.stateOfOrigin.trim()) {
        studentData.append(
          "state_of_origin",
          form.stateOfOrigin.trim(),
        );
      }

      if (form.localGovernment.trim()) {
        studentData.append(
          "local_government",
          form.localGovernment.trim(),
        );
      }

      if (form.bloodGroup) {
        studentData.append(
          "blood_group",
          form.bloodGroup,
        );
      }

      // -------------------------------------------------
      // DEPARTMENT
      // -------------------------------------------------

      if (
        isDepartmentRequired &&
        form.department
      ) {
        studentData.append(
          "department",
          Number(form.department),
        );
      }

      // -------------------------------------------------
      // PROFILE IMAGE
      // -------------------------------------------------

      if (profileImage) {
        studentData.append(
          "profile_image",
          profileImage,
        );
      }

      console.log("Creating student...");

      const student = await createStudent(
        studentData,
      );

      console.log("Student created:", student);

      // =================================================
      // STEP 2 — CREATE ENROLLMENT
      // =================================================

      const enrollmentData = {
        student: student.id,
        academic_session: Number(
          form.academicSession,
        ),
        term: Number(form.term),
        class_level: Number(form.classLevel),
        roll_number: form.roll
          ? Number(form.roll)
          : null,
      };

      console.log(
        "Creating enrollment:",
        enrollmentData,
      );

      const enrollment =
        await createEnrollment(
          enrollmentData,
        );

      console.log(
        "Enrollment created:",
        enrollment,
      );

      // =================================================
      // SAVE CREATED DETAILS
      // =================================================

      setCreatedStudent(student);
      setCreatedEnrollment(enrollment);

      setSuccess(
        `${
          student.full_name ||
          `${form.firstName} ${form.lastName}`
        } has been registered successfully.`,
      );

      // Do NOT redirect automatically.
      // Keep credentials visible so the admin can
      // copy or print them.
    } catch (err) {
      console.error(
        "Student registration failed:",
        err,
      );

      console.error(
        "API response:",
        err.response?.data,
      );

      setError(
        formatApiError(
          err.response?.data,
        ),
      );
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
  // SUCCESS / CREDENTIALS VIEW
  // =====================================================

  if (createdStudent) {
    const credentials =
      createdStudent.login_credentials || {};

    const studentName =
      createdStudent.full_name ||
      [
        createdStudent.first_name,
        createdStudent.middle_name,
        createdStudent.last_name,
      ]
        .filter(Boolean)
        .join(" ");

    const className =
      createdEnrollment?.class_name ||
      selectedClass?.name ||
      "";

    const sessionName =
      createdEnrollment?.session_name ||
      "";

    const termName =
      createdEnrollment?.term_name ||
      "";

    const rollNumber =
      createdEnrollment?.roll_number ??
      form.roll ??
      "";

    return (
      <div className="mx-auto w-full max-w-[900px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Student Registered Successfully
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The student account has been created. You can now
            copy or print the login details and send them to
            the student.
          </p>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
          <div className="font-semibold">
            Student registration completed successfully.
          </div>

          <div className="mt-1">
            Student ID: {createdStudent.id}
          </div>
        </div>

        {/* =================================================
            STUDENT DETAILS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
          <h3 className="mb-5 border-b border-slate-200 pb-3 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Student Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className={labelClass}>
                Student Name
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {studentName}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Admission Number
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {createdStudent.admission_number}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                School
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {getSchoolName()}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Class
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {className || "—"}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Academic Session
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {sessionName || "—"}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Term
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {termName || "—"}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Roll Number
              </p>

              <p className="text-sm font-semibold text-[var(--color-text)]">
                {rollNumber || "—"}
              </p>
            </div>

            <div>
              <p className={labelClass}>
                Student Status
              </p>

              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {createdStudent.status || "ACTIVE"}
              </p>
            </div>
          </div>

          {/* =================================================
              LOGIN DETAILS
          ================================================= */}

          <div className="mt-8 rounded-xl border-2 border-[var(--color-primary)]/20 bg-[var(--color-background)] p-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Student Login Details
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Send these credentials securely to the student.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Username */}

              <div className="rounded-lg border border-slate-200 bg-[var(--color-card)] p-4 dark:border-slate-700">
                <p className={labelClass}>
                  Username
                </p>

                <p className="break-all text-base font-bold text-[var(--color-text)]">
                  {credentials.username || "—"}
                </p>
              </div>

              {/* Password */}

              <div className="rounded-lg border border-slate-200 bg-[var(--color-card)] p-4 dark:border-slate-700">
                <p className={labelClass}>
                  Temporary Password
                </p>

                <p className="break-all font-mono text-base font-bold text-[var(--color-text)]">
                  {credentials.password || "—"}
                </p>
              </div>
            </div>

            {/* =================================================
                WARNING
            ================================================= */}

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
              Keep these credentials secure. Give them only to
              the student or an authorized parent/guardian.
            </div>
          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row dark:border-slate-800">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              {copied
                ? "✓ Details Copied"
                : "Copy Login Details"}
            </button>

            <button
              type="button"
              onClick={handlePrintCredentials}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Print Login Details
            </button>

            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Back to Students
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Add Another Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM RENDER
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

          {/* =================================================
              PROFILE PICTURE
          ================================================= */}

          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Student preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-xs text-slate-400">
                  <div className="mb-1 text-2xl">
                    👤
                  </div>
                  No Photo
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Profile Picture
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
              />

              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or other image format. Maximum 5MB.
              </p>
            </div>
          </div>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* First Name */}

            <div>
              <label className={labelClass}>
                First Name *
              </label>

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
              <label className={labelClass}>
                Middle Name
              </label>

              <input
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Last Name */}

            <div>
              <label className={labelClass}>
                Last Name *
              </label>

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
              <label className={labelClass}>
                Admission Number *
              </label>

              <input
                name="admissionNo"
                value={form.admissionNo}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* School */}

            {!schoolScoped && (
              <div>
                <label className={labelClass}>
                  School *
                </label>

                <select
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select School
                  </option>

                  {schools.map((school) => (
                    <option
                      key={school.id}
                      value={school.id}
                    >
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender */}

            <div>
              <label className={labelClass}>
                Gender *
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Gender
                </option>

                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* Date of Birth */}

            <div>
              <label className={labelClass}>
                Date of Birth *
              </label>

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
              <label className={labelClass}>
                Admission Date *
              </label>

              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Blood Group */}

            <div>
              <label className={labelClass}>
                Blood Group
              </label>

              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Blood Group
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
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
              <label className={labelClass}>
                Academic Session *
              </label>

              <select
                name="academicSession"
                value={form.academicSession}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Session
                </option>

                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}

            <div>
              <label className={labelClass}>
                Term *
              </label>

              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Term
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}

            <div>
              <label className={labelClass}>
                Class *
              </label>

              <select
                name="classLevel"
                value={form.classLevel}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Class
                </option>

                {classLevels.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {classLevel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}

            {isDepartmentRequired && (
              <div>
                <label className={labelClass}>
                  Department *
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={!form.school}
                  required
                >
                  <option value="">
                    {form.school
                      ? "Select Department"
                      : "Select School First"}
                  </option>

                  {availableDepartments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

            {/* Roll Number */}

            <div>
              <label className={labelClass}>
                Roll Number
              </label>

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
              <label className={labelClass}>
                Email
              </label>

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
              <label className={labelClass}>
                Phone Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Address */}

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Address
              </label>

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
              NATIONALITY
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Nationality & Origin
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Nationality */}

            <div>
              <label className={labelClass}>
                Nationality
              </label>

              <input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Nigerian"
              />
            </div>

            {/* State of Origin */}

            <div>
              <label className={labelClass}>
                State of Origin
              </label>

              <input
                name="stateOfOrigin"
                value={form.stateOfOrigin}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Anambra"
              />
            </div>

            {/* Local Government */}

            <div>
              <label className={labelClass}>
                Local Government
              </label>

              <input
                name="localGovernment"
                value={form.localGovernment}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Awka South"
              />
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row dark:border-slate-800">
            <button
              type="submit"
              disabled={saving || loadingData}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Student..."
                : "Save Student"}
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