
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import assignmentsService from "../../../services/assignmentsService";

import {
  getSchools,
  getSessions,
  getTerms,
  getClassLevels,
  getSubjects,
} from "../../../services/academicsService";

import { getTeachers } from "../../../services/teachersService";

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  school: "",
  academic_session: "",
  term: "",
  class_level: "",
  subject: "",
  teacher: "",

  title: "",
  instructions: "",

  assigned_date: "",
  due_date: "",

  maximum_score: 100,
  allow_late_submission: false,

  status: "DRAFT",

  attachment: null,
};

// =====================================================
// HELPERS
// =====================================================

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
};

// Convert Django datetime into datetime-local format
const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert Django date/datetime into YYYY-MM-DD
const formatDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.substring(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().substring(0, 10);
};

// =====================================================
// COMPONENT
// =====================================================

export default function EditAssignment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(initialForm);

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [existingAttachment, setExistingAttachment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  // ===================================================
  // LOAD ASSIGNMENT + DROPDOWN DATA
  // ===================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrors({});

      try {
        const [
          assignmentData,
          schoolsData,
          sessionsData,
          termsData,
          classesData,
          subjectsData,
          teachersData,
        ] = await Promise.all([
          assignmentsService.getById(id),
          getSchools(),
          getSessions(),
          getTerms(),
          getClassLevels(),
          getSubjects(),
          getTeachers(),
        ]);

        console.log(
          "ASSIGNMENT DATA:",
          assignmentData
        );

        // ---------------------------------------------
        // DROPDOWN DATA
        // ---------------------------------------------

        setSchools(normalizeList(schoolsData));
        setSessions(normalizeList(sessionsData));
        setTerms(normalizeList(termsData));
        setClasses(normalizeList(classesData));
        setSubjects(normalizeList(subjectsData));
        setTeachers(normalizeList(teachersData));

        // ---------------------------------------------
        // EXISTING ATTACHMENT
        // ---------------------------------------------

        setExistingAttachment(
          assignmentData.attachment || null
        );

        // ---------------------------------------------
        // EXISTING ASSIGNMENT
        // ---------------------------------------------

        setForm({
          school: assignmentData.school || "",
          academic_session:
            assignmentData.academic_session || "",
          term: assignmentData.term || "",
          class_level:
            assignmentData.class_level || "",
          subject: assignmentData.subject || "",
          teacher: assignmentData.teacher || "",

          title: assignmentData.title || "",
          instructions:
            assignmentData.instructions || "",

          assigned_date: formatDate(
            assignmentData.assigned_date
          ),

          due_date: formatDateTimeLocal(
            assignmentData.due_date
          ),

          maximum_score:
            assignmentData.maximum_score ?? 100,

          allow_late_submission:
            Boolean(
              assignmentData.allow_late_submission
            ),

          status:
            assignmentData.status || "DRAFT",

          // Do NOT put the existing server file
          // inside the file input state.
          attachment: null,
        });
      } catch (error) {
        console.error(
          "Failed to load assignment:",
          error
        );

        console.error(
          "ASSIGNMENT LOAD API RESPONSE:",
          error.response?.data
        );

        const responseData =
          error.response?.data;

        if (responseData) {
          setErrors(responseData);
        } else {
          setErrors({
            general:
              "Failed to load assignment. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // ===================================================
  // HANDLE INPUT CHANGE
  // ===================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    const newValue =
      type === "checkbox"
        ? checked
        : type === "file"
          ? files?.[0] || null
          : value;

    setForm((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    setErrors((previous) => {
      const updated = { ...previous };

      delete updated[name];

      return updated;
    });
  };

  // ===================================================
  // UPDATE ASSIGNMENT
  // ===================================================

  const handleSubmit = async (
    event,
    statusOverride = null
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setErrors({});

    const status =
      statusOverride || form.status;

    try {
      const formData = new FormData();

      // ---------------------------------------------
      // ACADEMIC INFORMATION
      // ---------------------------------------------

      formData.append(
        "school",
        form.school
      );

      formData.append(
        "academic_session",
        form.academic_session
      );

      formData.append(
        "term",
        form.term
      );

      formData.append(
        "class_level",
        form.class_level
      );

      formData.append(
        "subject",
        form.subject
      );

      formData.append(
        "teacher",
        form.teacher
      );

      // ---------------------------------------------
      // ASSIGNMENT DETAILS
      // ---------------------------------------------

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "instructions",
        form.instructions
      );

      formData.append(
        "assigned_date",
        form.assigned_date
      );

      formData.append(
        "due_date",
        form.due_date
      );

      formData.append(
        "maximum_score",
        form.maximum_score
      );

      formData.append(
        "allow_late_submission",
        form.allow_late_submission
      );

      formData.append(
        "status",
        status
      );

      // ---------------------------------------------
      // NEW ATTACHMENT
      // ---------------------------------------------

      if (form.attachment) {
        formData.append(
          "attachment",
          form.attachment
        );
      }

      // ---------------------------------------------
      // DEBUG
      // ---------------------------------------------

      console.log(
        "UPDATING ASSIGNMENT:",
        id
      );

      for (const [key, value] of formData.entries()) {
        console.log(
          `${key}:`,
          value
        );
      }

      // ---------------------------------------------
      // UPDATE
      // ---------------------------------------------

      await assignmentsService.update(
        id,
        formData
      );

      console.log(
        "Assignment updated successfully."
      );

      navigate(
        "/admin/assignments"
      );
    } catch (error) {
      console.error(
        "Failed to update assignment:",
        error
      );

      console.error(
        "ASSIGNMENT UPDATE API RESPONSE:",
        error.response?.data
      );

      const responseData =
        error.response?.data;

      if (responseData) {
        setErrors(responseData);
      } else {
        setErrors({
          general:
            "Failed to update assignment. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // ERROR DISPLAY HELPER
  // ===================================================

  const renderError = (field) => {
    if (!errors[field]) {
      return null;
    }

    return (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        {Array.isArray(errors[field])
          ? errors[field].join(", ")
          : errors[field]}
      </p>
    );
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 shadow-sm dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />

              <p className="text-sm text-[var(--color-text)]">
                Loading assignment information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Edit Assignment
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update assignment information and settings.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/assignments")
              }
              className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Back to Assignments
            </button>

          </div>
        </div>

        {/* =================================================
            GENERAL ERROR
        ================================================= */}

        {errors.general && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {Array.isArray(errors.general)
                ? errors.general.join(", ")
                : errors.general}
            </p>
          </div>
        )}

        {/* =================================================
            LOAD ERROR
        ================================================= */}

        {errors.load && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              {errors.load}
            </p>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={(event) =>
            handleSubmit(event, "DRAFT")
          }
          className="space-y-6"
        >

          {/* =================================================
              ACADEMIC INFORMATION
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Academic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* SCHOOL */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  School
                </label>

                <select
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select school
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

                {renderError("school")}
              </div>

              {/* ACADEMIC SESSION */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Academic Session
                </label>

                <select
                  name="academic_session"
                  value={form.academic_session}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select session
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

                {renderError("academic_session")}
              </div>

              {/* TERM */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Term
                </label>

                <select
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select term
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

                {renderError("term")}
              </div>

            </div>
          </div>

          {/* =================================================
              ASSIGNMENT TARGET
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Assignment Target
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* CLASS */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Class
                </label>

                <select
                  name="class_level"
                  value={form.class_level}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select class
                  </option>

                  {classes.map((classItem) => (
                    <option
                      key={classItem.id}
                      value={classItem.id}
                    >
                      {classItem.name}
                    </option>
                  ))}
                </select>

                {renderError("class_level")}
              </div>

              {/* SUBJECT */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Subject
                </label>

                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>

                {renderError("subject")}
              </div>

              {/* TEACHER */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Teacher
                </label>

                <select
                  name="teacher"
                  value={form.teacher}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                >
                  <option value="">
                    Select teacher
                  </option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.full_name ||
                        `${teacher.first_name || ""} ${
                          teacher.last_name || ""
                        }`.trim()}
                    </option>
                  ))}
                </select>

                {renderError("teacher")}
              </div>

            </div>
          </div>

          {/* =================================================
              ASSIGNMENT DETAILS
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Assignment Details
            </h2>

            <div className="space-y-5">

              {/* TITLE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Assignment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mathematics Assignment 1"
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                />

                {renderError("title")}
              </div>

              {/* INSTRUCTIONS */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Instructions
                </label>

                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Enter the assignment instructions..."
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                />

                {renderError("instructions")}
              </div>

            </div>
          </div>

          {/* =================================================
              SCHEDULE & SCORING
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Schedule & Scoring
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* ASSIGNED DATE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Assigned Date
                </label>

                <input
                  type="date"
                  name="assigned_date"
                  value={form.assigned_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                />

                {renderError("assigned_date")}
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                />

                {renderError("due_date")}
              </div>

              {/* MAXIMUM SCORE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Maximum Score
                </label>

                <input
                  type="number"
                  name="maximum_score"
                  value={form.maximum_score}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
                />

                {renderError("maximum_score")}
              </div>

            </div>

            {/* ALLOW LATE SUBMISSION */}

            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  name="allow_late_submission"
                  checked={
                    form.allow_late_submission
                  }
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />

                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    Allow late submissions
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Students can submit after the due date.
                  </p>
                </div>

              </label>

              {renderError(
                "allow_late_submission"
              )}
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Assignment Status
            </h2>

            <div className="max-w-md">
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:focus:ring-blue-900"
              >
                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

                <option value="CLOSED">
                  Closed
                </option>
              </select>

              {renderError("status")}
            </div>
          </div>

          {/* =================================================
              ATTACHMENT
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
              Attachment
            </h2>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Select a new file only if you want to replace the existing attachment.
            </p>

            {/* EXISTING FILE */}

            {existingAttachment && !form.attachment && (
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <p className="text-sm font-medium text-[var(--color-primary)]">
                  Existing attachment
                </p>

                <a
                  href={existingAttachment}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm text-[var(--color-secondary)] hover:underline"
                >
                  View current attachment
                </a>
              </div>
            )}

            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] dark:border-gray-600"
            />

            {form.attachment && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                New file selected:{" "}
                <span className="font-medium">
                  {form.attachment.name}
                </span>
              </p>
            )}

            {renderError("attachment")}
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">

            {/* CANCEL */}

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                navigate("/admin/assignments")
              }
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            {/* SAVE DRAFT */}

            <button
              type="button"
              disabled={submitting}
              onClick={(event) =>
                handleSubmit(event, "DRAFT")
              }
              className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {submitting
                ? "Saving..."
                : "Save as Draft"}
            </button>

            {/* SAVE CHANGES */}

            <button
              type="button"
              disabled={submitting}
              onClick={(event) =>
                handleSubmit(
                  event,
                  form.status
                )
              }
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : "Save Changes"}
            </button>

            {/* PUBLISH */}

            <button
              type="button"
              disabled={submitting}
              onClick={(event) =>
                handleSubmit(
                  event,
                  "PUBLISHED"
                )
              }
              className="rounded-lg bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Publishing..."
                : "Publish Assignment"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

