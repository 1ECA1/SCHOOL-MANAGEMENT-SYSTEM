import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Loader2,
  Send,
  User,
} from "lucide-react";

import api from "../../services/api";
import PublicNavbar from "../../components/navigation/PublicNavbar";
import PublicFooter from "../../components/navigation/PublicFooter";

// =====================================================
// HELPERS
// =====================================================

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getName = (item) => {
  return (
    item?.name ||
    item?.title ||
    item?.school_name ||
    item?.class_name ||
    item?.class_level_name ||
    item?.department_name ||
    item?.session_name ||
    item?.term_name ||
    `Item ${item?.id ?? ""}`
  );
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Unable to submit your application. Please check your internet connection and try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      messages.push(`${field}: ${value.join(", ")}`);
    } else if (typeof value === "string") {
      messages.push(`${field}: ${value}`);
    }
  });

  return messages.length
    ? messages.join(" ")
    : "Please check the form and try again.";
};

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  school: "",
  academic_session: "",
  term: "",

  first_name: "",
  middle_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",

  email: "",
  phone_number: "",
  address: "",
  previous_school: "",

  class_level: "",
  department: "",

  blood_group: "",
  nationality: "",
  state_of_origin: "",
  local_government: "",

  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",
  guardian_address: "",

  admission_date: "",
  roll_number: "",
};

// =====================================================
// INPUT COMPONENT
// =====================================================

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-white/10"
      />
    </div>
  );
}

// =====================================================
// SELECT COMPONENT
// =====================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = "Select an option",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10"
      >
        <option value="">{placeholder}</option>

        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {getName(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

// =====================================================
// TEXTAREA COMPONENT
// =====================================================

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 4,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-white/10"
      />
    </div>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function Admission() {
  const [form, setForm] = useState(initialForm);

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ===================================================
  // LOAD PUBLIC ACADEMIC DATA
  // ===================================================

  useEffect(() => {
    const loadAcademicData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const [
          schoolsResponse,
          sessionsResponse,
          termsResponse,
          classesResponse,
          departmentsResponse,
        ] = await Promise.all([
          api.get("/academics/schools/"),
          api.get("/academics/sessions/"),
          api.get("/academics/terms/"),
          api.get("/academics/class-levels/"),
          api.get("/academics/departments/"),
        ]);

        setSchools(getItems(schoolsResponse.data));
        setSessions(getItems(sessionsResponse.data));
        setTerms(getItems(termsResponse.data));
        setClassLevels(getItems(classesResponse.data));
        setDepartments(getItems(departmentsResponse.data));
      } catch (err) {
        console.error("Admission academic data error:", err);

        setError(
          "We could not load the admission information. Please refresh the page and try again.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadAcademicData();
  }, []);

  // ===================================================
  // SELECTED CLASS
  // ===================================================

  const selectedClass = useMemo(() => {
    return classLevels.find(
      (item) => String(item.id) === String(form.class_level),
    );
  }, [classLevels, form.class_level]);

  // ===================================================
  // DETERMINE WHETHER CLASS IS SS
  // ===================================================

  const isSSClass = useMemo(() => {
    if (!selectedClass) return false;

    const educationLevel =
      selectedClass.education_level ||
      selectedClass.level_type ||
      selectedClass.category ||
      selectedClass.section ||
      "";

    return String(educationLevel).toUpperCase() === "SS";
  }, [selectedClass]);

  // ===================================================
  // FILTER SESSION BY SCHOOL
  // ===================================================

  const filteredSessions = useMemo(() => {
    if (!form.school) return sessions;

    return sessions.filter(
      (item) =>
        String(item.school) === String(form.school) ||
        String(item.school_id) === String(form.school),
    );
  }, [sessions, form.school]);

  // ===================================================
  // FILTER TERMS BY SESSION / SCHOOL
  // ===================================================

  const filteredTerms = useMemo(() => {
    let result = terms;

    if (form.school) {
      const schoolTerms = result.filter(
        (item) =>
          String(item.school) === String(form.school) ||
          String(item.school_id) === String(form.school),
      );

      if (schoolTerms.length > 0) {
        result = schoolTerms;
      }
    }

    if (form.academic_session) {
      const sessionTerms = result.filter(
        (item) =>
          String(item.academic_session) ===
            String(form.academic_session) ||
          String(item.session) === String(form.academic_session) ||
          String(item.academic_session_id) ===
            String(form.academic_session),
      );

      if (sessionTerms.length > 0) {
        result = sessionTerms;
      }
    }

    return result;
  }, [
    terms,
    form.school,
    form.academic_session,
  ]);

  // ===================================================
  // FILTER DEPARTMENTS BY SCHOOL
  // ===================================================

  const filteredDepartments = useMemo(() => {
    if (!form.school) return departments;

    const schoolDepartments = departments.filter(
      (item) =>
        String(item.school) === String(form.school) ||
        String(item.school_id) === String(form.school),
    );

    return schoolDepartments.length
      ? schoolDepartments
      : departments;
  }, [departments, form.school]);

  // ===================================================
  // HANDLE INPUT
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ===================================================
  // SCHOOL CHANGE
  // ===================================================

  const handleSchoolChange = (event) => {
    const school = event.target.value;

    setForm((previous) => ({
      ...previous,
      school,
      academic_session: "",
      term: "",
      class_level: "",
      department: "",
    }));

    setError("");
  };

  // ===================================================
  // SESSION CHANGE
  // ===================================================

  const handleSessionChange = (event) => {
    const academic_session = event.target.value;

    setForm((previous) => ({
      ...previous,
      academic_session,
      term: "",
    }));

    setError("");
  };

  // ===================================================
  // CLASS CHANGE
  // ===================================================

  const handleClassChange = (event) => {
    const class_level = event.target.value;

    const newClass = classLevels.find(
      (item) => String(item.id) === String(class_level),
    );

    const educationLevel =
      newClass?.education_level ||
      newClass?.level_type ||
      newClass?.category ||
      newClass?.section ||
      "";

    const newIsSS =
      String(educationLevel).toUpperCase() === "SS";

    setForm((previous) => ({
      ...previous,
      class_level,
      department: newIsSS ? previous.department : "",
    }));

    setError("");
  };

  // ===================================================
  // IMAGE CHANGE
  // ===================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must not exceed 5MB.");
      event.target.value = "";
      return;
    }

    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    // -----------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------

    if (!form.school) {
      setError("Please select the school.");
      return;
    }

    if (!form.academic_session) {
      setError("Please select the academic session.");
      return;
    }

    if (!form.class_level) {
      setError("Please select the class you are applying for.");
      return;
    }

    if (isSSClass && !form.department) {
      setError(
        "Please select a department for the Senior Secondary class.",
      );
      return;
    }

    // -----------------------------------------------
    // FORM DATA
    // -----------------------------------------------

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (profileImage) {
      formData.append("profile_image", profileImage);
    }

    setSubmitting(true);

    try {
      const response = await api.post(
        "/admissions/applicants/",
        formData,
      );

      setSuccess(response.data);

      // Reset form after successful submission.
      setForm(initialForm);
      setProfileImage(null);
      setImagePreview("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Admission submission error:", err);

      setError(getErrorMessage(err));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // SUCCESS SCREEN
  // ===================================================

  if (success) {
    const application =
      success.applicant || success.data || {};

    const applicationNumber =
      application.application_number ||
      success.application_number ||
      "Generated successfully";

    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        {/* <PublicNavbar /> */}

        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-white/10 sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Application Submitted Successfully
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[var(--color-text)]/65">
                Thank you for applying. Your admission application has
                been received and is now awaiting review by the
                admissions office.
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6">
                <p className="text-sm font-medium text-[var(--color-text)]/60">
                  Your Application Number
                </p>

                <p className="mt-2 text-2xl font-bold tracking-wide text-[var(--color-primary)]">
                  {applicationNumber}
                </p>

                <p className="mt-3 text-xs text-[var(--color-text)]/50">
                  Please save this number for future admission
                  enquiries.
                </p>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Return to Home
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(null);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] dark:border-white/10"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* <PublicNavbar /> */}

      {/* HERO */}
      <section className="border-b border-black/5 bg-[var(--color-primary)]/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-secondary)]">
              Admissions
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Online Admission Application
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--color-text)]/65 sm:text-lg">
              Complete the form below to apply for admission. Please
              provide accurate information and review your details
              carefully before submitting.
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* LOADING */}
          {loadingData ? (
            <div className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-12 text-center shadow-sm dark:border-white/10">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />

              <p className="mt-4 text-sm text-[var(--color-text)]/60">
                Loading admission information...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* =========================================
                  ACADEMIC INFORMATION
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <SectionHeader
                  number="1"
                  title="Admission Information"
                  description="Select the school and academic programme you are applying for."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="School"
                    name="school"
                    value={form.school}
                    onChange={handleSchoolChange}
                    options={schools}
                    required
                    placeholder="Select school"
                  />

                  <SelectField
                    label="Academic Session"
                    name="academic_session"
                    value={form.academic_session}
                    onChange={handleSessionChange}
                    options={filteredSessions}
                    required
                    disabled={!form.school}
                    placeholder={
                      form.school
                        ? "Select academic session"
                        : "Select school first"
                    }
                  />

                  <SelectField
                    label="Class Applying For"
                    name="class_level"
                    value={form.class_level}
                    onChange={handleClassChange}
                    options={classLevels}
                    required
                    disabled={!form.school}
                    placeholder={
                      form.school
                        ? "Select class"
                        : "Select school first"
                    }
                  />

                  <SelectField
                    label="Term"
                    name="term"
                    value={form.term}
                    onChange={handleChange}
                    options={filteredTerms}
                    disabled={!form.academic_session}
                    placeholder={
                      form.academic_session
                        ? "Select term"
                        : "Select session first"
                    }
                  />

                  {isSSClass && (
                    <SelectField
                      label="Department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      options={filteredDepartments}
                      required
                      disabled={!form.class_level}
                      placeholder="Select department"
                    />
                  )}

                  <InputField
                    label="Preferred Admission Date"
                    name="admission_date"
                    value={form.admission_date}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              </section>

              {/* =========================================
                  PERSONAL INFORMATION
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <SectionHeader
                  number="2"
                  title="Student Information"
                  description="Enter the applicant's personal information."
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <InputField
                    label="First Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                  />

                  <InputField
                    label="Middle Name"
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    placeholder="Middle name"
                  />

                  <InputField
                    label="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                  />

                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    type="date"
                  />

                  <SelectField
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      { id: "MALE", name: "Male" },
                      { id: "FEMALE", name: "Female" },
                    ]}
                  />

                  <SelectField
                    label="Blood Group"
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    options={[
                      { id: "A+", name: "A+" },
                      { id: "A-", name: "A-" },
                      { id: "B+", name: "B+" },
                      { id: "B-", name: "B-" },
                      { id: "AB+", name: "AB+" },
                      { id: "AB-", name: "AB-" },
                      { id: "O+", name: "O+" },
                      { id: "O-", name: "O-" },
                    ]}
                  />

                  <InputField
                    label="Nationality"
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="e.g. Nigerian"
                  />

                  <InputField
                    label="State of Origin"
                    name="state_of_origin"
                    value={form.state_of_origin}
                    onChange={handleChange}
                    placeholder="State of origin"
                  />

                  <InputField
                    label="Local Government"
                    name="local_government"
                    value={form.local_government}
                    onChange={handleChange}
                    placeholder="Local government"
                  />
                </div>

                <div className="mt-5">
                  <TextAreaField
                    label="Residential Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter the applicant's residential address"
                  />
                </div>

                <div className="mt-5">
                  <InputField
                    label="Previous School"
                    name="previous_school"
                    value={form.previous_school}
                    onChange={handleChange}
                    placeholder="Name of previous school"
                  />
                </div>
              </section>

              {/* =========================================
                  CONTACT
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <SectionHeader
                  number="3"
                  title="Contact Information"
                  description="Provide contact details where the school can reach you."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="example@email.com"
                  />

                  <InputField
                    label="Phone Number"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    type="tel"
                    required
                    placeholder="080XXXXXXXX"
                  />
                </div>
              </section>

              {/* =========================================
                  GUARDIAN
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <SectionHeader
                  number="4"
                  title="Parent / Guardian Information"
                  description="Provide information about the applicant's parent or guardian."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Guardian Full Name"
                    name="guardian_name"
                    value={form.guardian_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                  />

                  <InputField
                    label="Guardian Phone"
                    name="guardian_phone"
                    value={form.guardian_phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    placeholder="080XXXXXXXX"
                  />

                  <InputField
                    label="Guardian Email"
                    name="guardian_email"
                    value={form.guardian_email}
                    onChange={handleChange}
                    type="email"
                    placeholder="guardian@email.com"
                  />

                  <InputField
                    label="Guardian Address"
                    name="guardian_address"
                    value={form.guardian_address}
                    onChange={handleChange}
                    placeholder="Guardian residential address"
                  />
                </div>
              </section>

              {/* =========================================
                  PHOTO
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <SectionHeader
                  number="5"
                  title="Applicant Photograph"
                  description="Upload a clear recent passport photograph."
                />

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[var(--color-background)] dark:border-white/10">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Applicant preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-[var(--color-text)]/20" />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profile_image"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] dark:border-white/10"
                    >
                      <FileImage className="h-4 w-4" />
                      Choose Photograph
                    </label>

                    <input
                      id="profile_image"
                      name="profile_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-xs text-[var(--color-text)]/50">
                      JPG, PNG or other image formats. Maximum size:
                      5MB.
                    </p>

                    {profileImage && (
                      <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                        {profileImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =========================================
                  SUBMIT
              ========================================= */}
              <section className="rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-sm dark:border-white/10 sm:p-8">
                <div className="rounded-2xl bg-[var(--color-background)] p-5">
                  <p className="text-sm leading-6 text-[var(--color-text)]/65">
                    By submitting this application, I confirm that the
                    information provided is accurate and complete to
                    the best of my knowledge.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || loadingData}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Admission Application
                    </>
                  )}
                </button>
              </section>
            </form>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}