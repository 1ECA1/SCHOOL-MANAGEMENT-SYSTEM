import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  FileText,
  Loader2,
  User,
} from "lucide-react";

import { getReportCard } from "../../services/resultsService";

// ============================================================
// HELPERS
// ============================================================

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0.00";
  }

  return number.toFixed(2);
};

const formatPosition = (position, totalStudents) => {
  if (!position) {
    return "—";
  }

  if (totalStudents) {
    return `${position} / ${totalStudents}`;
  }

  return String(position);
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParentResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        console.error(
          "Failed to load parent report card:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load this report card."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadReportCard();
    }
  }, [id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-[var(--color-primary)]"
          />

          <p className="text-sm opacity-70">
            Loading report card...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !reportCard) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">

          <button
            type="button"
            onClick={() => navigate("/parent/results")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-card)] hover:bg-[var(--color-primary)]/5 transition"
          >
            <ArrowLeft size={17} />
            Back to Results
          </button>

          <div className="mt-6 bg-[var(--color-card)] border border-black/5 dark:border-white/10 rounded-2xl p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h1 className="text-xl font-bold mt-4">
              Unable to load report card
            </h1>

            <p className="text-sm opacity-70 mt-2">
              {error ||
                "The requested report card could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/parent/results")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition"
            >
              <ArrowLeft size={17} />
              Back to Results
            </button>

          </div>
        </div>
      </div>
    );
  }

  const results = Array.isArray(reportCard.results)
    ? reportCard.results
    : [];

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      {/* ====================================================== */}
      {/* PAGE */}
      {/* ====================================================== */}

      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ================================================== */}
          {/* ACTION BAR */}
          {/* ================================================== */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/parent/results")}
              className="inline-flex items-center gap-2 w-fit px-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-card)] hover:bg-[var(--color-primary)]/5 transition"
            >
              <ArrowLeft size={17} />
              Back to Results
            </button>
          </div>

          {/* ================================================== */}
          {/* REPORT CARD */}
          {/* ================================================== */}

          <div className="bg-[var(--color-card)] border border-black/5 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">

            {/* ================================================= */}
            {/* SCHOOL HEADER */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">

                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-[var(--color-background)] flex items-center justify-center shrink-0">
                  {reportCard.school_logo ? (
                    <img
                      src={reportCard.school_logo}
                      alt={
                        reportCard.school_name ||
                        "School logo"
                      }
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FileText
                      size={32}
                      className="text-[var(--color-primary)]"
                    />
                  )}
                </div>

                {/* School details */}
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    {reportCard.school_name ||
                      "School Name"}
                  </h1>

                  {reportCard.school_address && (
                    <p className="text-sm opacity-70 mt-1">
                      {reportCard.school_address}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm opacity-70 mt-2">
                    {reportCard.school_phone && (
                      <span>
                        {reportCard.school_phone}
                      </span>
                    )}

                    {reportCard.school_email && (
                      <span>
                        {reportCard.school_email}
                      </span>
                    )}

                    {reportCard.school_website && (
                      <span>
                        {reportCard.school_website}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
                  Student Report Card
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-sm opacity-70">
                  <span>
                    {reportCard.session_name || "—"}
                  </span>

                  <span>•</span>

                  <span>
                    {reportCard.term_name || "—"}
                  </span>

                  <span>•</span>

                  <span>
                    {reportCard.class_name || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* STUDENT INFORMATION */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">

                {/* Profile image */}
                <div className="flex justify-center lg:justify-start">
                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-[var(--color-background)] flex items-center justify-center">
                    {reportCard.student_profile_image ? (
                      <img
                        src={
                          reportCard.student_profile_image
                        }
                        alt={
                          reportCard.student_name ||
                          "Student"
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={42}
                        className="text-[var(--color-primary)]"
                      />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div>
                    <p className="text-xs opacity-60">
                      Student Name
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.student_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Admission Number
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.student_admission_number ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Date of Birth
                    </p>

                    <p className="font-semibold mt-1">
                      {formatDate(
                        reportCard.student_date_of_birth
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Class
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.class_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Department
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.department_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Academic Session
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.session_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Term
                    </p>

                    <p className="font-semibold mt-1">
                      {reportCard.term_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Result Status
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle
                        size={16}
                        className="text-[var(--color-secondary)]"
                      />

                      <span className="font-semibold">
                        Published
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* PERFORMANCE SUMMARY */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FileText
                  size={19}
                  className="text-[var(--color-primary)]"
                />

                <h2 className="font-bold text-lg">
                  Performance Summary
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <div className="rounded-xl bg-[var(--color-background)] p-4 text-center">
                  <p className="text-xs opacity-60">
                    Total Score
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.total_score
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4 text-center">
                  <p className="text-xs opacity-60">
                    Average
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.average_score
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4 text-center">
                  <p className="text-xs opacity-60">
                    Overall Grade
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {reportCard.overall_grade || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4 text-center">
                  <p className="text-xs opacity-60">
                    Position
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatPosition(
                      reportCard.position,
                      reportCard.total_students
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* SUBJECT RESULTS */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText
                    size={19}
                    className="text-[var(--color-primary)]"
                  />

                  <h2 className="font-bold text-lg">
                    Subject Results
                  </h2>
                </div>

                <span className="text-sm opacity-60">
                  {results.length}{" "}
                  {results.length === 1
                    ? "subject"
                    : "subjects"}
                </span>
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl bg-[var(--color-background)] p-6 text-center">
                  <p className="text-sm opacity-70">
                    No subject results are available.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 bg-[var(--color-background)]">
                          <th className="text-left px-4 py-3 font-semibold">
                            #
                          </th>

                          <th className="text-left px-4 py-3 font-semibold">
                            Subject
                          </th>

                          <th className="text-center px-4 py-3 font-semibold">
                            CA
                          </th>

                          <th className="text-center px-4 py-3 font-semibold">
                            Exam
                          </th>

                          <th className="text-center px-4 py-3 font-semibold">
                            Total
                          </th>

                          <th className="text-center px-4 py-3 font-semibold">
                            Grade
                          </th>

                          <th className="text-left px-4 py-3 font-semibold">
                            Remark
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {results.map(
                          (result, index) => (
                            <tr
                              key={result.id}
                              className="border-b border-black/5 dark:border-white/10 last:border-b-0"
                            >
                              <td className="px-4 py-3">
                                {index + 1}
                              </td>

                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">
                                    {result.subject_name ||
                                      "—"}
                                  </p>

                                  {result.examination_name && (
                                    <p className="text-xs opacity-50 mt-0.5">
                                      {result.examination_name}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-center">
                                {formatScore(
                                  result.ca_score
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {formatScore(
                                  result.exam_score
                                )}
                              </td>

                              <td className="px-4 py-3 text-center font-semibold">
                                {formatScore(
                                  result.total_score
                                )}
                              </td>

                              <td className="px-4 py-3 text-center font-semibold">
                                {result.grade || "—"}
                              </td>

                              <td className="px-4 py-3">
                                {result.remark || "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden space-y-3">
                    {results.map(
                      (result, index) => (
                        <div
                          key={result.id}
                          className="rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-background)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs opacity-50">
                                Subject {index + 1}
                              </p>

                              <h3 className="font-semibold mt-1">
                                {result.subject_name ||
                                  "—"}
                              </h3>

                              {result.examination_name && (
                                <p className="text-xs opacity-50 mt-1">
                                  {result.examination_name}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-xs opacity-50">
                                Grade
                              </p>

                              <p className="font-bold mt-1">
                                {result.grade || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="rounded-lg bg-[var(--color-card)] p-2.5 text-center">
                              <p className="text-xs opacity-50">
                                CA
                              </p>

                              <p className="font-semibold mt-1">
                                {formatScore(
                                  result.ca_score
                                )}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--color-card)] p-2.5 text-center">
                              <p className="text-xs opacity-50">
                                Exam
                              </p>

                              <p className="font-semibold mt-1">
                                {formatScore(
                                  result.exam_score
                                )}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--color-card)] p-2.5 text-center">
                              <p className="text-xs opacity-50">
                                Total
                              </p>

                              <p className="font-semibold mt-1">
                                {formatScore(
                                  result.total_score
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10">
                            <p className="text-xs opacity-50">
                              Remark
                            </p>

                            <p className="text-sm font-medium mt-1">
                              {result.remark || "—"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ================================================= */}
            {/* CLASS PERFORMANCE */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <h2 className="font-bold text-lg mb-4">
                Class Performance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    Class Average
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.class_average
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    Highest Average
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.class_highest_score
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    Lowest Average
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.class_lowest_score
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* ATTENDANCE */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays
                  size={19}
                  className="text-[var(--color-primary)]"
                />

                <h2 className="font-bold text-lg">
                  Attendance
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    Days Present
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {reportCard.attendance_days ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    School Days Opened
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {reportCard.school_days_opened ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <p className="text-xs opacity-60">
                    Attendance Percentage
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {formatScore(
                      reportCard.attendance_percentage
                    )}
                    %
                  </p>
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* COMMENTS */}
            {/* ================================================= */}

            <div className="p-5 sm:p-8">
              <h2 className="font-bold text-lg mb-4">
                Comments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="rounded-xl border border-black/5 dark:border-white/10 p-4 min-h-[120px]">
                  <p className="text-xs opacity-60 font-medium">
                    Teacher's Comment
                  </p>

                  <p className="text-sm mt-3 leading-6">
                    {reportCard.teacher_comment ||
                      "No teacher comment provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-black/5 dark:border-white/10 p-4 min-h-[120px]">
                  <p className="text-xs opacity-60 font-medium">
                    Principal's Comment
                  </p>

                  <p className="text-sm mt-3 leading-6">
                    {reportCard.principal_comment ||
                      "No principal comment provided."}
                  </p>
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="px-5 sm:px-8 py-5 border-t border-black/5 dark:border-white/10 bg-[var(--color-background)]">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs opacity-60">
                <span>
                  Report Card ID: {reportCard.id}
                </span>

                <span>
                  Generated from EduManageERP
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}