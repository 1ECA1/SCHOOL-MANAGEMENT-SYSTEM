
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  FileText,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";

import {
  getReportCard,
  updateReportCard,
} from "../../../services/resultsService";

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
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

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return "Failed to update report card.";
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditReportCard() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [reportCard, setReportCard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    attendance_percentage: "",
    teacher_comment: "",
    principal_comment: "",
    promoted: false,
    is_published: false,
  });

  // ==========================================================
  // LOAD REPORT CARD
  // ==========================================================

  useEffect(() => {
    const loadReportCard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getReportCard(id);

        setReportCard(data);

        setFormData({
          attendance_percentage:
            data?.attendance_percentage ?? "",
          teacher_comment: data?.teacher_comment ?? "",
          principal_comment: data?.principal_comment ?? "",
          promoted: data?.promoted === true,
          is_published: data?.is_published === true,
        });
      } catch (err) {
        console.error("Failed to load report card:", err);

        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadReportCard();
    }
  }, [id]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const attendance =
      formData.attendance_percentage === ""
        ? null
        : Number(formData.attendance_percentage);

    if (
      attendance !== null &&
      (Number.isNaN(attendance) || attendance < 0 || attendance > 100)
    ) {
      setError("Attendance percentage must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        attendance_percentage:
          attendance === null ? 0 : attendance,
        teacher_comment: formData.teacher_comment.trim(),
        principal_comment: formData.principal_comment.trim(),
        promoted: formData.promoted,
        is_published: formData.is_published,
      };

      await updateReportCard(id, payload);

      setSuccess("Report card updated successfully.");

      // Give the success message a moment to display.
      setTimeout(() => {
        navigate(
          `/school-admin/examinations-results/report-cards/${id}`,
        );
      }, 700);
    } catch (err) {
      console.error("Failed to update report card:", err);

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-text">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />

          <span>Loading report card...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR WITHOUT DATA
  // ==========================================================

  if (!reportCard) {
    return (
      <div className="min-h-screen bg-background text-text p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/report-cards",
              )
            }
            className="inline-flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report Cards
          </button>

          <div className="bg-card border border-red-200 dark:border-red-900/50 rounded-xl p-6">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

              <div>
                <h2 className="font-semibold">
                  Unable to load report card
                </h2>

                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DISPLAY VALUES
  // ==========================================================

  const studentName =
    reportCard.student_name || "Unknown Student";

  const admissionNumber =
    reportCard.student_admission_number || "—";

  const sessionName =
    reportCard.session_name ||
    reportCard.academic_session_name ||
    "—";

  const termName = reportCard.term_name || "—";

  const className =
    reportCard.class_name ||
    reportCard.class_level_name ||
    "—";

  const totalScore = reportCard.total_score ?? "0";

  const averageScore = reportCard.average_score ?? "0";

  const overallGrade = reportCard.overall_grade || "—";

  const position = reportCard.position
    ? `${reportCard.position}${
        reportCard.total_students
          ? ` / ${reportCard.total_students}`
          : ""
      }`
    : "—";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* ====================================================
            TOP NAVIGATION
        ==================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/school-admin/examinations-results/report-cards/${id}`,
              )
            }
            className="inline-flex items-center gap-2 w-fit px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report Card
          </button>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />

            <h1 className="text-xl md:text-2xl font-bold">
              Edit Report Card
            </h1>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">
                Something went wrong
              </p>

              <p className="text-sm mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">{success}</p>

              <p className="text-sm mt-1">
                Returning to the report card...
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            STUDENT / REPORT INFORMATION
        ==================================================== */}

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />

              <h2 className="font-semibold">
                Report Card Information
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Academic and student information cannot be changed
              from this page.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Student */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student
                </p>

                <p className="font-semibold mt-1">
                  {studentName}
                </p>
              </div>

              {/* Admission Number */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Admission Number
                </p>

                <p className="font-medium mt-1">
                  {admissionNumber}
                </p>
              </div>

              {/* Session */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Academic Session
                </p>

                <p className="font-medium mt-1">
                  {sessionName}
                </p>
              </div>

              {/* Term */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Term
                </p>

                <p className="font-medium mt-1">
                  {termName}
                </p>
              </div>

              {/* Class */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Class
                </p>

                <p className="font-medium mt-1">
                  {className}
                </p>
              </div>

              {/* Status */}

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Current Status
                </p>

                <div className="mt-1">
                  {reportCard.is_published ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Unpublished
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            PERFORMANCE SUMMARY
        ==================================================== */}

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">
              Academic Performance
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              These values are calculated from the student's
              results.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Score
                </p>

                <p className="text-2xl font-bold mt-2">
                  {totalScore}
                </p>
              </div>

              {/* Average */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Average
                </p>

                <p className="text-2xl font-bold mt-2">
                  {averageScore}
                </p>
              </div>

              {/* Grade */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Grade
                </p>

                <p className="text-2xl font-bold mt-2 text-primary">
                  {overallGrade}
                </p>
              </div>

              {/* Position */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Position
                </p>

                <p className="text-2xl font-bold mt-2">
                  {position}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            EDIT FORM
        ==================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">
                Editable Report Card Information
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Update attendance, comments, promotion status,
                and publication status.
              </p>
            </div>

            <div className="p-5 space-y-6">
              {/* ==================================================
                  ATTENDANCE
              ================================================== */}

              <div>
                <label
                  htmlFor="attendance_percentage"
                  className="block text-sm font-medium mb-2"
                >
                  Attendance Percentage
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    id="attendance_percentage"
                    name="attendance_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.attendance_percentage}
                    onChange={handleChange}
                    placeholder="Enter attendance percentage"
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    %
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a value from 0 to 100.
                </p>
              </div>

              {/* ==================================================
                  TEACHER COMMENT
              ================================================== */}

              <div>
                <label
                  htmlFor="teacher_comment"
                  className="block text-sm font-medium mb-2"
                >
                  Teacher Comment
                </label>

                <textarea
                  id="teacher_comment"
                  name="teacher_comment"
                  rows={5}
                  value={formData.teacher_comment}
                  onChange={handleChange}
                  placeholder="Enter teacher comment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* ==================================================
                  PRINCIPAL COMMENT
              ================================================== */}

              <div>
                <label
                  htmlFor="principal_comment"
                  className="block text-sm font-medium mb-2"
                >
                  Principal Comment
                </label>

                <textarea
                  id="principal_comment"
                  name="principal_comment"
                  rows={5}
                  value={formData.principal_comment}
                  onChange={handleChange}
                  placeholder="Enter principal comment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* ==================================================
                  PROMOTION
              ================================================== */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="promoted"
                    checked={formData.promoted}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-primary"
                  />

                  <span>
                    <span className="block font-medium">
                      Student Promoted
                    </span>

                    <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Mark this student as promoted for this
                      report card.
                    </span>
                  </span>
                </label>
              </div>

              {/* ==================================================
                  PUBLISH
              ================================================== */}

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-primary"
                  />

                  <span>
                    <span className="block font-medium">
                      Publish Report Card
                    </span>

                    <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Published report cards become available
                      according to the existing results access
                      rules.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/school-admin/examinations-results/report-cards/${id}`,
                    )
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

