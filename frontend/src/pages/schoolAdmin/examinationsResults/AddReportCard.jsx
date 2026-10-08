import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createReportCard } from "../../../services/resultsService";

import { getStudents } from "../../../services/studentsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

function AddReportCard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [formData, setFormData] = useState({
    student: "",
    academic_session: "",
    term: "",
    class_level: "",
    attendance_percentage: "",
    teacher_comment: "",
    principal_comment: "",
    is_published: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          studentsData,
          sessionsData,
          termsData,
          classesData,
        ] = await Promise.all([
          getStudents(),
          getSessions(),
          getTerms(),
          getClassLevels(),
        ]);

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : studentsData?.results || []
        );

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || []
        );

        setTerms(
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || []
        );

        setClassLevels(
          Array.isArray(classesData)
            ? classesData
            : classesData?.results || []
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load report card information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================================================
  // HANDLE CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================================================
  // STUDENT NAME
  // ============================================================

  const getStudentName = (student) => {
    if (student.full_name) {
      return student.full_name;
    }

    const name = [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return name || `Student #${student.id}`;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!formData.student) {
      setError("Please select a student.");
      return;
    }

    if (!formData.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!formData.term) {
      setError("Please select a term.");
      return;
    }

    if (!formData.class_level) {
      setError("Please select a class.");
      return;
    }

    // ----------------------------------------------------------
    // ATTENDANCE VALIDATION
    // ----------------------------------------------------------

    if (
      formData.attendance_percentage !== "" &&
      (
        Number(formData.attendance_percentage) < 0 ||
        Number(formData.attendance_percentage) > 100
      )
    ) {
      setError(
        "Attendance percentage must be between 0 and 100."
      );

      return;
    }

    // ----------------------------------------------------------
    // CREATE REPORT CARD
    // ----------------------------------------------------------

    try {
      setSaving(true);

      await createReportCard({
        student: Number(formData.student),

        academic_session: Number(
          formData.academic_session
        ),

        term: Number(formData.term),

        class_level: Number(
          formData.class_level
        ),

        attendance_percentage:
          formData.attendance_percentage === ""
            ? 0
            : Number(formData.attendance_percentage),

        teacher_comment:
          formData.teacher_comment.trim(),

        principal_comment:
          formData.principal_comment.trim(),

        is_published:
          formData.is_published,
      });

      navigate(
        "/school-admin/examinations-results/report-cards"
      );
    } catch (err) {
      console.error(err);

      const data = err?.response?.data;

      if (
        data &&
        typeof data === "object"
      ) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages ||
            "Failed to create report card."
        );
      } else {
        setError(
          "Failed to create report card."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-[var(--color-card)] border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center text-slate-500">
          Loading report card information...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Create Report Card
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Generate a report card from the student's
            academic records.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/school-admin/examinations-results/report-cards"
            )
          }
          className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          ← Back
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}


      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card)] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-5xl shadow-sm"
      >

        {/* ====================================================
            ACADEMIC INFORMATION
        ==================================================== */}

        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Academic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* STUDENT */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Student
            </label>

            <select
              name="student"
              value={formData.student}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                Select student
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {getStudentName(student)}

                  {student.admission_number
                    ? ` — ${student.admission_number}`
                    : ""}
                </option>
              ))}
            </select>
          </div>


          {/* SESSION */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
          </div>


          {/* TERM */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Term
            </label>

            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
          </div>


          {/* CLASS */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Class
            </label>

            <select
              name="class_level"
              value={formData.class_level}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">
                Select class
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

        </div>


        {/* ====================================================
            ATTENDANCE
        ==================================================== */}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">

          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Attendance
          </h2>

          <div className="max-w-md">

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Attendance Percentage
            </label>

            <input
              type="number"
              name="attendance_percentage"
              value={formData.attendance_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g. 95"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />

            <p className="text-xs text-slate-500 mt-1">
              Enter a value between 0 and 100.
            </p>

          </div>

        </div>


        {/* ====================================================
            COMMENTS
        ==================================================== */}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">

          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Comments
          </h2>

          <div className="space-y-5">

            {/* TEACHER COMMENT */}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Teacher Comment
              </label>

              <textarea
                name="teacher_comment"
                value={formData.teacher_comment}
                onChange={handleChange}
                rows="4"
                placeholder="Enter teacher's comment..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>


            {/* PRINCIPAL COMMENT */}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Principal Comment
              </label>

              <textarea
                name="principal_comment"
                value={formData.principal_comment}
                onChange={handleChange}
                rows="4"
                placeholder="Enter principal's comment..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

          </div>

        </div>


        {/* ====================================================
            PUBLISH
        ==================================================== */}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">

          <label className="inline-flex items-center gap-3 cursor-pointer">

            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="w-4 h-4"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Publish report card
            </span>

          </label>

          <p className="text-xs text-slate-500 mt-1 ml-7">
            Published report cards can be made available
            to students and parents.
          </p>

        </div>


        {/* ====================================================
            BUTTONS
        ==================================================== */}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">

          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            {saving
              ? "Generating..."
              : "Create Report Card"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/report-cards"
              )
            }
            className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddReportCard;