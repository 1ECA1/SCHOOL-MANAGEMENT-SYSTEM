



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
// HELPER
// =====================================================

const normalizeList = (data) => {
if (Array.isArray(data)) {
return data;
}

return data?.results || [];
};

// =====================================================
// COMPONENT
// =====================================================

export default function AddAssignment() {
const navigate = useNavigate();

const [form, setForm] = useState(initialForm);

const [schools, setSchools] = useState([]);
const [sessions, setSessions] = useState([]);
const [terms, setTerms] = useState([]);
const [classes, setClasses] = useState([]);
const [subjects, setSubjects] = useState([]);
const [teachers, setTeachers] = useState([]);

const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

const [errors, setErrors] = useState({});

// ===================================================
// LOAD DROPDOWN DATA
// ===================================================

useEffect(() => {
const loadData = async () => {
setLoading(true);
setErrors({});


  try {
    const [
      schoolsData,
      sessionsData,
      termsData,
      classesData,
      subjectsData,
      teachersData,
    ] = await Promise.all([
      getSchools(),
      getSessions(),
      getTerms(),
      getClassLevels(),
      getSubjects(),
      getTeachers(),
    ]);

    setSchools(normalizeList(schoolsData));
    setSessions(normalizeList(sessionsData));
    setTerms(normalizeList(termsData));
    setClasses(normalizeList(classesData));
    setSubjects(normalizeList(subjectsData));
    setTeachers(normalizeList(teachersData));
  } catch (error) {
    console.error(
      "Failed to load assignment form data:",
      error
    );

    console.error(
      "ASSIGNMENT FORM LOAD ERROR:",
      error.response?.data
    );

    setErrors({
      load:
        "Some assignment data could not be loaded. Please check your authentication and try again.",
    });
  } finally {
    setLoading(false);
  }
};

loadData();


}, []);

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

// Clear the error for this field
setErrors((previous) => {
  const updated = { ...previous };

  delete updated[name];

  return updated;
});

};

// ===================================================
// SUBMIT ASSIGNMENT
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

  // -------------------------------------------------
  // ACADEMIC INFORMATION
  // -------------------------------------------------

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

  // -------------------------------------------------
  // ASSIGNMENT DETAILS
  // -------------------------------------------------

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

  // -------------------------------------------------
  // OPTIONAL ATTACHMENT
  // -------------------------------------------------

  if (form.attachment) {
    formData.append(
      "attachment",
      form.attachment
    );
  }

  // -------------------------------------------------
  // DEBUG
  // -------------------------------------------------

  console.log(
    "CREATING ASSIGNMENT..."
  );

  for (const [key, value] of formData.entries()) {
    console.log(
      `${key}:`,
      value
    );
  }

  // -------------------------------------------------
  // CREATE ASSIGNMENT
  // -------------------------------------------------

  await assignmentsService.create(
    formData
  );

  console.log(
    "Assignment created successfully."
  );

  navigate(
    "/admin/assignments"
  );
} catch (error) {
  console.error(
    "Failed to create assignment:",
    error
  );

  console.error(
    "ASSIGNMENT API RESPONSE:",
    error.response?.data
  );

  const responseData =
    error.response?.data;

  if (responseData) {
    setErrors(responseData);
  } else {
    setErrors({
      general:
        "Failed to create assignment. Please try again.",
    });
  }
} finally {
  setSubmitting(false);
}


};

// ===================================================
// LOADING SCREEN
// ===================================================

if (loading) {
return ( <div className="mx-auto max-w-4xl p-6"> <div className="rounded-xl border bg-white p-8 shadow-sm"> <div className="flex items-center gap-3"> <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600" />

```
        <p className="text-sm text-gray-600">
          Loading assignment information...
        </p>
      </div>
    </div>
  </div>
);


}

// ===================================================
// MAIN PAGE
// ===================================================

return ( <div className="mx-auto max-w-4xl p-6">


  {/* =================================================
      HEADER
  ================================================= */}

  <div className="mb-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          New Assignment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create and publish an assignment for students.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          navigate("/admin/assignments")
        }
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Back to Assignments
      </button>

    </div>
  </div>

  {/* =================================================
      GENERAL ERROR
  ================================================= */}

  {errors.general && (
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">
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
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
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

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Academic Information
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* SCHOOL */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            School
          </label>

          <select
            name="school"
            value={form.school}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.school && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.school)
                ? errors.school.join(", ")
                : errors.school}
            </p>
          )}
        </div>

        {/* ACADEMIC SESSION */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Academic Session
          </label>

          <select
            name="academic_session"
            value={form.academic_session}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.academic_session && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(
                errors.academic_session
              )
                ? errors.academic_session.join(", ")
                : errors.academic_session}
            </p>
          )}
        </div>

        {/* TERM */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Term
          </label>

          <select
            name="term"
            value={form.term}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.term && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.term)
                ? errors.term.join(", ")
                : errors.term}
            </p>
          )}
        </div>

      </div>
    </div>

    {/* =================================================
        ASSIGNMENT TARGET
    ================================================= */}

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Assignment Target
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* CLASS */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Class
          </label>

          <select
            name="class_level"
            value={form.class_level}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.class_level && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.class_level)
                ? errors.class_level.join(", ")
                : errors.class_level}
            </p>
          )}
        </div>

        {/* SUBJECT */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Subject
          </label>

          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.subject)
                ? errors.subject.join(", ")
                : errors.subject}
            </p>
          )}
        </div>

        {/* TEACHER */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Teacher
          </label>

          <select
            name="teacher"
            value={form.teacher}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

          {errors.teacher && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.teacher)
                ? errors.teacher.join(", ")
                : errors.teacher}
            </p>
          )}
        </div>

      </div>
    </div>

    {/* =================================================
        ASSIGNMENT DETAILS
    ================================================= */}

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Assignment Details
      </h2>

      <div className="space-y-5">

        {/* TITLE */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Assignment Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Mathematics Assignment 1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.title)
                ? errors.title.join(", ")
                : errors.title}
            </p>
          )}
        </div>

        {/* INSTRUCTIONS */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Instructions
          </label>

          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Enter the assignment instructions..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          {errors.instructions && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.instructions)
                ? errors.instructions.join(", ")
                : errors.instructions}
            </p>
          )}
        </div>

      </div>
    </div>

    {/* =================================================
        SCHEDULE & SCORING
    ================================================= */}

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Schedule & Scoring
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* ASSIGNED DATE */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Assigned Date
          </label>

          <input
            type="date"
            name="assigned_date"
            value={form.assigned_date}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          {errors.assigned_date && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.assigned_date)
                ? errors.assigned_date.join(", ")
                : errors.assigned_date}
            </p>
          )}
        </div>

        {/* DUE DATE */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Due Date
          </label>

          <input
            type="datetime-local"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.due_date)
                ? errors.due_date.join(", ")
                : errors.due_date}
            </p>
          )}
        </div>

        {/* MAXIMUM SCORE */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          {errors.maximum_score && (
            <p className="mt-1 text-sm text-red-600">
              {Array.isArray(errors.maximum_score)
                ? errors.maximum_score.join(", ")
                : errors.maximum_score}
            </p>
          )}
        </div>

      </div>

      {/* ALLOW LATE SUBMISSION */}

      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">

        <label className="flex cursor-pointer items-center gap-3">

          <input
            type="checkbox"
            name="allow_late_submission"
            checked={
              form.allow_late_submission
            }
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />

          <div>
            <p className="text-sm font-medium text-gray-800">
              Allow late submissions
            </p>

            <p className="text-xs text-gray-500">
              Students can submit after the due date.
            </p>
          </div>

        </label>

        {errors.allow_late_submission && (
          <p className="mt-1 text-sm text-red-600">
            {Array.isArray(
              errors.allow_late_submission
            )
              ? errors.allow_late_submission.join(", ")
              : errors.allow_late_submission}
          </p>
        )}

      </div>
    </div>

    {/* =================================================
        ATTACHMENT
    ================================================= */}

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Attachment
      </h2>

      <p className="mb-4 text-sm text-gray-500">
        Attach a PDF, Word document, image, or other supported file.
        This is optional.
      </p>

      <input
        type="file"
        name="attachment"
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      />

      {form.attachment && (
        <p className="mt-2 text-sm text-gray-600">
          Selected:{" "}
          <span className="font-medium">
            {form.attachment.name}
          </span>
        </p>
      )}

      {errors.attachment && (
        <p className="mt-1 text-sm text-red-600">
          {Array.isArray(errors.attachment)
            ? errors.attachment.join(", ")
            : errors.attachment}
        </p>
      )}

    </div>

    {/* =================================================
        BUTTONS
    ================================================= */}

    <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border bg-white p-5 shadow-sm">

      {/* CANCEL */}

      <button
        type="button"
        disabled={submitting}
        onClick={() =>
          navigate("/admin/assignments")
        }
        className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      {/* SAVE DRAFT */}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : "Save as Draft"}
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
        className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Publishing..."
          : "Publish Assignment"}
      </button>

    </div>
  </form>
</div>

);
}
