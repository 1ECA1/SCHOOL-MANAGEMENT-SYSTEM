import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  FileText,
  GraduationCap,
  Loader2,
  Printer,
  User,
  Users,
  X,
} from "lucide-react";

import { getReportCard } from "../../services/resultsService";

// ============================================================
// HELPERS
// ============================================================

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  return Number.isInteger(number) ? number : number.toFixed(2);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStudentName = (reportCard) =>
  reportCard?.student_name ||
  reportCard?.full_name ||
  [
    reportCard?.first_name,
    reportCard?.middle_name,
    reportCard?.last_name,
  ]
    .filter(Boolean)
    .join(" ") ||
  "Student";

const getAdmissionNumber = (reportCard) =>
  reportCard?.admission_number ||
  reportCard?.student_admission_number ||
  "—";

const getSubjectName = (result) =>
  result?.subject_name ||
  result?.subject?.name ||
  "—";

const getExamName = (result) =>
  result?.examination_name ||
  result?.examination?.name ||
  "—";

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherReportCardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD REPORT CARD
  // ==========================================================

  const loadReportCard = async () => {
    if (!id) {
      setError("Report card ID was not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getReportCard(id);
      setReportCard(data);
    } catch (err) {
      console.error("Failed to load report card:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load this report card."
      );

      setReportCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportCard();
  }, [id]);

  // ==========================================================
  // RESULTS
  // ==========================================================

  const results = useMemo(() => {
    if (!reportCard?.results) return [];

    if (Array.isArray(reportCard.results)) {
      return reportCard.results;
    }

    if (Array.isArray(reportCard.results.results)) {
      return reportCard.results.results;
    }

    return [];
  }, [reportCard]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalSubjects = results.length;

  const passedSubjects = results.filter((result) => {
    const grade = String(result?.grade || "").toUpperCase();

    return !["F", "FAIL"].includes(grade);
  }).length;

  const failedSubjects = results.filter((result) => {
    const grade = String(result?.grade || "").toUpperCase();

    return ["F", "FAIL"].includes(grade);
  }).length;

  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={32}
              className="animate-spin text-[var(--color-primary)]"
            />

            <p className="text-sm opacity-65">
              Loading report card...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !reportCard) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-card)] p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
              />

              <div className="flex-1">
                <h2 className="font-semibold">
                  Unable to load report card
                </h2>

                <p className="mt-1 text-sm opacity-65">
                  {error ||
                    "The requested report card could not be found."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-md p-1 opacity-60 hover:bg-[var(--color-background)] hover:opacity-100"
              >
                <X size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={loadReportCard}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const studentName = getStudentName(reportCard);
  const admissionNumber = getAdmissionNumber(reportCard);

  const schoolName =
    reportCard.school_name ||
    reportCard.school?.name ||
    "School";

  const schoolAddress =
    reportCard.school_address ||
    reportCard.school?.address ||
    "";

  const schoolLogo =
    reportCard.school_logo ||
    reportCard.school?.logo ||
    reportCard.logo ||
    null;

  const sessionName =
    reportCard.session_name ||
    reportCard.academic_session_name ||
    "—";

  const termName = reportCard.term_name || "—";

  const className =
    reportCard.class_name ||
    reportCard.class_level_name ||
    "—";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* ================================================== */}
        {/* TOP ACTION BAR */}
        {/* ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Report Cards
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Printer size={17} />
            Print Report Card
          </button>
        </div>

        {/* ================================================== */}
        {/* REPORT CARD */}
        {/* ================================================== */}

        <div
          id="teacher-report-card"
          className="overflow-hidden rounded-2xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] shadow-sm print:rounded-none print:border-0 print:shadow-none"
        >

          {/* ================================================== */}
          {/* SCHOOL HEADER */}
          {/* ================================================== */}

          <div className="border-b border-[var(--color-text)]/10 p-5 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">

              {schoolLogo ? (
                <img
                  src={schoolLogo}
                  alt={schoolName}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <GraduationCap size={38} />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-xl font-bold uppercase sm:text-2xl">
                  {schoolName}
                </h1>

                {schoolAddress && (
                  <p className="mt-1 text-sm opacity-60">
                    {schoolAddress}
                  </p>
                )}

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  <FileText size={14} />
                  STUDENT REPORT CARD
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* SESSION INFORMATION */}
          {/* ================================================== */}

          <div className="border-b border-[var(--color-text)]/10 bg-[var(--color-background)] p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Academic Session
                  </p>

                  <p className="mt-0.5 font-semibold">
                    {sessionName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                  <BookOpen size={19} />
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Term
                  </p>

                  <p className="mt-0.5 font-semibold">
                    {termName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Users size={19} />
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Class
                  </p>

                  <p className="mt-0.5 font-semibold">
                    {className}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* STUDENT INFORMATION */}
          {/* ================================================== */}

          <div className="p-5 sm:p-8">
            <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4 sm:p-5">

              <div className="mb-4 flex items-center gap-2">
                <User
                  size={18}
                  className="text-[var(--color-primary)]"
                />

                <h2 className="font-semibold">
                  Student Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <p className="text-xs opacity-50">
                    Student Name
                  </p>

                  <p className="mt-1 font-semibold">
                    {studentName}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Admission Number
                  </p>

                  <p className="mt-1 font-semibold">
                    {admissionNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Class
                  </p>

                  <p className="mt-1 font-semibold">
                    {className}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Department
                  </p>

                  <p className="mt-1 font-semibold">
                    {reportCard.department_name || "—"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* PERFORMANCE SUMMARY */}
          {/* ================================================== */}

          <div className="px-5 pb-5 sm:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Total Subjects
                </p>

                <p className="mt-1 text-xl font-bold">
                  {totalSubjects}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-secondary)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Average
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatScore(reportCard.average_score)}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Overall Grade
                </p>

                <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">
                  {reportCard.overall_grade || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-secondary)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Position
                </p>

                <p className="mt-1 text-xl font-bold">
                  {reportCard.position
                    ? `${reportCard.position}${
                        reportCard.total_students
                          ? ` / ${reportCard.total_students}`
                          : ""
                      }`
                    : "—"}
                </p>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* SUBJECT RESULTS */}
          {/* ================================================== */}

          <div className="px-5 pb-5 sm:px-8">

            <div className="mb-4 flex items-center gap-2">
              <BookOpen
                size={19}
                className="text-[var(--color-primary)]"
              />

              <h2 className="font-semibold">
                Academic Performance
              </h2>
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto rounded-xl border border-[var(--color-text)]/10 md:block">
              <table className="w-full min-w-[850px] text-left">

                <thead className="border-b border-[var(--color-text)]/10 bg-[var(--color-background)]">
                  <tr>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-60">
                      Subject
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-60">
                      Examination
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                      CA
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                      Exam
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                      Total
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide opacity-60">
                      Grade
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide opacity-60">
                      Point
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Remark
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-text)]/5">

                  {results.map((result) => (
                    <tr key={result.id}>

                      <td className="px-4 py-3 font-medium">
                        {getSubjectName(result)}
                      </td>

                      <td className="px-4 py-3 text-sm opacity-70">
                        {getExamName(result)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm">
                        {formatScore(result.ca_score)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm">
                        {formatScore(result.exam_score)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatScore(result.total_score)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-[var(--color-primary)]">
                          {result.grade || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center text-sm">
                        {formatScore(result.grade_point)}
                      </td>

                      <td className="px-4 py-3 text-sm opacity-75">
                        {result.remark || "—"}
                      </td>

                    </tr>
                  ))}

                  {results.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm opacity-60"
                      >
                        No subject results are available for this
                        report card.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* MOBILE RESULTS */}

            <div className="space-y-3 md:hidden">

              {results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h3 className="font-semibold">
                        {getSubjectName(result)}
                      </h3>

                      <p className="mt-1 text-xs opacity-50">
                        {getExamName(result)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs opacity-50">
                        Grade
                      </p>

                      <p className="font-bold text-[var(--color-primary)]">
                        {result.grade || "—"}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>
                      <p className="text-xs opacity-50">
                        CA Score
                      </p>

                      <p className="mt-0.5 font-medium">
                        {formatScore(result.ca_score)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Exam Score
                      </p>

                      <p className="mt-0.5 font-medium">
                        {formatScore(result.exam_score)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Total
                      </p>

                      <p className="mt-0.5 font-semibold">
                        {formatScore(result.total_score)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Grade Point
                      </p>

                      <p className="mt-0.5 font-medium">
                        {formatScore(result.grade_point)}
                      </p>
                    </div>

                  </div>

                  <div className="mt-3 border-t border-[var(--color-text)]/10 pt-3">

                    <p className="text-xs opacity-50">
                      Remark
                    </p>

                    <p className="mt-1 text-sm">
                      {result.remark || "—"}
                    </p>

                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="rounded-xl border border-[var(--color-text)]/10 p-6 text-center text-sm opacity-60">
                  No subject results are available.
                </div>
              )}

            </div>
          </div>

          {/* ================================================== */}
          {/* CLASS PERFORMANCE */}
          {/* ================================================== */}

          <div className="px-5 pb-5 sm:px-8">

            <div className="mb-4 flex items-center gap-2">
              <Users
                size={19}
                className="text-[var(--color-secondary)]"
              />

              <h2 className="font-semibold">
                Class Performance
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              {/* CLASS AVERAGE */}

              <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Class Average
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatScore(reportCard.class_average)}
                </p>
              </div>

              {/* HIGHEST SCORE */}

              <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Highest Score
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatScore(
                    reportCard.class_highest_score
                  )}
                </p>
              </div>

              {/* LOWEST SCORE */}

              <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4">
                <p className="text-xs opacity-50">
                  Lowest Score
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatScore(
                    reportCard.class_lowest_score
                  )}
                </p>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* ATTENDANCE */}
          {/* ================================================== */}

          <div className="px-5 pb-5 sm:px-8">

            <div className="mb-4 flex items-center gap-2">
              <CalendarDays
                size={19}
                className="text-[var(--color-primary)]"
              />

              <h2 className="font-semibold">
                Attendance
              </h2>
            </div>

            <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4 sm:p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div>
                  <p className="text-xs opacity-50">
                    School Days Opened
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {reportCard.school_days_opened ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Attendance Days
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {reportCard.attendance_days ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-50">
                    Attendance Percentage
                  </p>

                  <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">
                    {formatScore(
                      reportCard.attendance_percentage
                    )}

                    {reportCard.attendance_percentage !==
                      null &&
                    reportCard.attendance_percentage !==
                      undefined
                      ? "%"
                      : ""}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* COMMENTS */}
          {/* ================================================== */}

          <div className="px-5 pb-5 sm:px-8">

            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={19}
                className="text-[var(--color-secondary)]"
              />

              <h2 className="font-semibold">
                Comments
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-5">

                <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                  Teacher's Comment
                </p>

                <p className="mt-3 text-sm leading-6">
                  {reportCard.teacher_comment ||
                    "No teacher comment provided."}
                </p>

              </div>

              <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-5">

                <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                  Principal's Comment
                </p>

                <p className="mt-3 text-sm leading-6">
                  {reportCard.principal_comment ||
                    "No principal comment provided."}
                </p>

              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* PROMOTION / PUBLICATION */}
          {/* ================================================== */}

          <div className="border-t border-[var(--color-text)]/10 p-5 sm:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs uppercase tracking-wide opacity-50">
                  Promotion Status
                </p>

                <p className="mt-1 font-semibold">
                  {reportCard.promoted
                    ? "Student promoted"
                    : "Promotion not recorded"}
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-sm font-medium ${
                  reportCard.is_published
                    ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                    : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                }`}
              >
                <CheckCircle size={17} />

                {reportCard.is_published
                  ? "Published"
                  : "Not Published"}
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <div className="border-t border-[var(--color-text)]/10 px-5 py-4 text-center text-xs opacity-50 sm:px-8">
            Report card generated from EduManageERP
          </div>

        </div>
      </div>

      {/* ====================================================== */}
      {/* PRINT STYLES */}
      {/* ====================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            @page {
              size: A4;
              margin: 12mm;
            }

            #teacher-report-card {
              width: 100%;
            }

            button {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}