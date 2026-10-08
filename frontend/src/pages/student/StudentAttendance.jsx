import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import {
  getAttendance,
  getAttendanceSummary,
} from "../../services/attendanceService";

import {
  getStudent,
  getCurrentStudentEnrollment,
} from "../../services/studentsService";


const StudentAttendance = () => {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  useEffect(() => {
    const loadAttendance = async () => {
      if (!user?.student_id) {
        setError("No student profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // -------------------------------------------------
        // GET STUDENT
        // -------------------------------------------------

        const studentData = await getStudent(user.student_id);

        setStudent(studentData);

        // -------------------------------------------------
        // GET CURRENT ENROLLMENT
        // -------------------------------------------------

        const enrollmentData =
          await getCurrentStudentEnrollment(user.student_id);

        setEnrollment(enrollmentData);

        // -------------------------------------------------
        // GET REQUIRED IDS
        // -------------------------------------------------

        const studentId = user.student_id;

        const academicSessionId =
          enrollmentData?.academic_session ??
          enrollmentData?.academic_session_id;

        const termId =
          enrollmentData?.term ??
          enrollmentData?.term_id;

        const classLevelId =
          enrollmentData?.class_level ??
          enrollmentData?.class_level_id;

        // -------------------------------------------------
        // VALIDATE ENROLLMENT
        // -------------------------------------------------

        if (
          !academicSessionId ||
          !termId ||
          !classLevelId
        ) {
          throw new Error(
            "The student's current enrollment is incomplete."
          );
        }

        // -------------------------------------------------
        // GET ATTENDANCE RECORDS
        // -------------------------------------------------

        const records = await getAttendance({
          student: studentId,
          academic_session: academicSessionId,
          term: termId,
          class_level: classLevelId,
        });

        setAttendance(
          Array.isArray(records)
            ? records
            : records?.results || []
        );

        // -------------------------------------------------
        // GET ATTENDANCE SUMMARY
        // -------------------------------------------------

        const summaryData =
          await getAttendanceSummary(
            studentId,
            academicSessionId,
            termId,
            classLevelId
          );

        setSummary(summaryData);

      } catch (err) {
        console.error(
          "Failed to load attendance:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to load attendance."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [user?.student_id]);


  // =====================================================
  // GROUP RECORDS BY DATE
  // =====================================================

  const attendanceByDate = useMemo(() => {
    const grouped = {};

    attendance.forEach((record) => {
      const date = record.date;

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(record);
    });

    return grouped;
  }, [attendance]);


  // =====================================================
  // SORT ATTENDANCE DATES
  // =====================================================

  const sortedAttendance = useMemo(() => {
    return Object.entries(attendanceByDate).sort(
      ([dateA], [dateB]) =>
        new Date(dateB) - new Date(dateA)
    );
  }, [attendanceByDate]);


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // =====================================================
  // GET DAY
  // =====================================================

  const getDayName = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-NG",
      {
        weekday: "short",
      }
    );
  };


  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20";

      case "ABSENT":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";

      case "LATE":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";

      case "EXCUSED":
        return "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20";

      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
    }
  };


  // =====================================================
  // STATUS DOT
  // =====================================================

  const getStatusDot = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500";

      case "ABSENT":
        return "bg-red-500";

      case "LATE":
        return "bg-amber-500";

      case "EXCUSED":
        return "bg-cyan-500";

      default:
        return "bg-slate-400";
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 animate-pulse">
            <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
              />
            ))}
          </div>

          <div className="mt-5 h-96 animate-pulse rounded-2xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800" />

        </div>
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.12 12a1.5 1.5 0 001.3 2.25h15.06a1.5 1.5 0 001.3-2.25l-7.12-12a1.5 1.5 0 00-2.6 0z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-base font-semibold text-red-800 dark:text-red-300">
                  Unable to load attendance
                </h2>

                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }


  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  const sessionName =
    enrollment?.academic_session_name ||
    enrollment?.session_name ||
    enrollment?.academic_session?.name ||
    "-";

  const termName =
    enrollment?.term_name ||
    enrollment?.term?.name ||
    "-";

  const className =
    enrollment?.class_level_name ||
    enrollment?.class_name ||
    enrollment?.class_level?.name ||
    "-";

  const attendancePercentage =
    Number(
      summary?.attendance_percentage || 0
    ).toFixed(2);

  const attendanceDays =
    Object.keys(attendanceByDate).length;

  const studentName =
    student?.full_name ||
    student?.name ||
    "Student";


  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    description,
    icon,
    iconBg,
    iconColor,
  }) => {
    return (
      <div className="group rounded-2xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:ring-slate-800">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
          >
            {icon}
          </div>

        </div>

      </div>
    );
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
              <span>Student Portal</span>

              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>

              <span className="text-[var(--color-primary)]">
                Attendance
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View your attendance record for the current academic term.
            </p>

          </div>


          {/* CURRENT TERM BADGE */}

          <div className="flex w-fit items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-sm">

              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                Current Term
              </p>

              <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {termName}
              </p>
            </div>

          </div>

        </div>


        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <div className="mb-5 grid gap-4 md:grid-cols-3">

          {/* SESSION */}

          <div className="rounded-2xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10">

                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12v5c2.5 2 4.5 3 7 3s4.5-1 7-3v-5"
                  />
                </svg>

              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Academic Session
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {sessionName}
                </p>
              </div>

            </div>

          </div>


          {/* TERM */}

          <div className="rounded-2xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[var(--color-secondary)] dark:bg-cyan-500/10">

                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Current Term
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {termName}
                </p>
              </div>

            </div>

          </div>


          {/* CLASS */}

          <div className="rounded-2xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10">

                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Current Class
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {className}
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <StatCard
            title="School Opened"
            value={summary?.times_school_opened ?? 0}
            description="Total school days"
            iconBg="bg-blue-50 dark:bg-blue-500/10"
            iconColor="text-[var(--color-primary)]"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />

          <StatCard
            title="Present"
            value={summary?.present_days ?? 0}
            description="Days present"
            iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
          />

          <StatCard
            title="Absent"
            value={summary?.absent_days ?? 0}
            description="Days absent"
            iconBg="bg-red-50 dark:bg-red-500/10"
            iconColor="text-red-600 dark:text-red-400"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          />

          <StatCard
            title="Late"
            value={summary?.late_days ?? 0}
            description="Days late"
            iconBg="bg-amber-50 dark:bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <StatCard
            title="Excused"
            value={summary?.excused_days ?? 0}
            description="Excused days"
            iconBg="bg-cyan-50 dark:bg-cyan-500/10"
            iconColor="text-[var(--color-secondary)]"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 3c-2.236 0-4.33.61-6.118 1.984A11.955 11.955 0 003 12c0 2.236.61 4.33 1.984 6.118A11.955 11.955 0 0012 21c2.236 0 4.33-.61 6.118-1.984A11.955 11.955 0 0021 12c0-2.236-.61-4.33-1.984-6.118z"
                />
              </svg>
            }
          />

          <StatCard
            title="Attendance Rate"
            value={`${attendancePercentage}%`}
            description="Current term"
            iconBg="bg-blue-50 dark:bg-blue-500/10"
            iconColor="text-[var(--color-primary)]"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />

        </div>


        {/* =================================================
            ATTENDANCE RATE OVERVIEW
        ================================================= */}

        <div className="mb-5 rounded-2xl bg-[var(--color-card)] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Attendance Overview
              </p>

              <h2 className="mt-1 text-xl font-bold text-[var(--color-text)]">
                Your current term attendance
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your attendance rate is calculated from the number
                of school days you attended compared with the
                total number of days the school has opened.
              </p>

            </div>


            {/* CIRCULAR PROGRESS */}

            <div className="flex items-center gap-5">

              <div className="relative h-28 w-28 shrink-0">

                <svg
                  className="h-28 w-28 -rotate-90"
                  viewBox="0 0 120 120"
                >

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={314}
                    strokeDashoffset={
                      314 -
                      (314 *
                        Math.min(
                          Number(attendancePercentage),
                          100
                        )) /
                        100
                    }
                    className="text-[var(--color-primary)] transition-all duration-700"
                  />

                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">

                  <span className="text-xl font-bold text-[var(--color-text)]">
                    {attendancePercentage}%
                  </span>

                  <span className="text-[10px] font-medium text-slate-400">
                    Rate
                  </span>

                </div>

              </div>


              <div>

                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {summary?.present_days ?? 0} days attended
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  out of {summary?.times_school_opened ?? 0} school days
                </p>

                <p className="mt-2 text-xs font-medium text-[var(--color-secondary)]">
                  {attendanceDays} recorded attendance days
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            ATTENDANCE HISTORY
        ================================================= */}

        <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">

          {/* SECTION HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10">

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2v12a2 2 0 002 2z"
                    />
                  </svg>

                </div>

                <div>

                  <h2 className="text-base font-bold text-[var(--color-text)]">
                    Attendance History
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your recorded attendance for this term.
                  </p>

                </div>

              </div>

            </div>


            <div className="flex w-fit items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">

              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {attendanceDays} attendance days
              </span>

            </div>

          </div>


          {/* EMPTY STATE */}

          {attendance.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">

                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2v12a2 2 0 002 2v12a2 2 0 002-2z"
                  />
                </svg>

              </div>

              <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
                No attendance records yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your attendance records will appear here once
                they are recorded by the school.
              </p>

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Day
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Subject
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Remark
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {sortedAttendance.map(
                    ([date, records]) =>

                      records.map((record) => (

                        <tr
                          key={record.id}
                          className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        >

                          {/* DATE */}

                          <td className="px-5 py-4">

                            <div className="font-medium text-[var(--color-text)]">
                              {formatDate(date)}
                            </div>

                          </td>


                          {/* DAY */}

                          <td className="px-5 py-4">

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {getDayName(date)}
                            </span>

                          </td>


                          {/* SUBJECT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-[var(--color-secondary)] dark:bg-cyan-500/10">

                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
                                  />
                                </svg>

                              </div>

                              <span className="text-sm font-medium text-[var(--color-text)]">
                                {record.subject_name || "General"}
                              </span>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                                record.status
                              )}`}
                            >

                              <span
                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                  record.status
                                )}`}
                              />

                              {record.status_display ||
                                record.status}

                            </span>

                          </td>


                          {/* REMARK */}

                          <td className="max-w-xs px-5 py-4">

                            <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                              {record.remarks || "-"}
                            </span>

                          </td>

                        </tr>

                      ))
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            FOOTER INFORMATION
        ================================================= */}

        {attendance.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between dark:text-slate-500">

            <span>
              Showing {attendanceDays} attendance days
            </span>

            <span>
              {studentName}
            </span>

          </div>
        )}

      </div>

    </div>
  );
};

export default StudentAttendance;