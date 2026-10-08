import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  School,
  RefreshCw,
  AlertCircle,
  Hash,
  Briefcase,
  HeartPulse,
  UserRound,
  Clock,
  CheckCircle2,
} from "lucide-react";

import {
  getStudent,
  getStudentEnrollments,
  getStudentSubjects,
} from "../../services/studentsService";

// ============================================================
// HELPERS
// ============================================================

const getStatus = (student) =>
  String(student?.status || "ACTIVE")
    .trim()
    .toUpperCase();

const getStudentName = (student) => {
  if (student?.full_name) {
    return student.full_name;
  }

  return [
    student?.first_name,
    student?.middle_name,
    student?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unnamed Student";
};

const getInitials = (student) => {
  const name = getStudentName(student);

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ============================================================
// FIND LAST / BEST CLASS
// ============================================================

const getDisplayClass = (student, enrollments = []) => {
  // Current class
  if (student?.current_class) {
    return student.current_class;
  }

  // Current enrollment
  if (student?.current_enrollment?.class_name) {
    return student.current_enrollment.class_name;
  }

  // Explicit last-class fields
  if (student?.last_class) {
    return student.last_class;
  }

  if (student?.last_class_name) {
    return student.last_class_name;
  }

  if (student?.graduation_class) {
    return student.graduation_class;
  }

  if (student?.graduation_class_name) {
    return student.graduation_class_name;
  }

  if (student?.last_enrollment?.class_name) {
    return student.last_enrollment.class_name;
  }

  // Enrollment history
  if (Array.isArray(enrollments) && enrollments.length > 0) {
    const sortedEnrollments = [...enrollments].sort(
      (a, b) => {
        const dateA = new Date(
          a?.enrollment_date ||
            a?.created_at ||
            0
        );

        const dateB = new Date(
          b?.enrollment_date ||
            b?.created_at ||
            0
        );

        return dateB - dateA;
      }
    );

    const latest = sortedEnrollments[0];

    return (
      latest?.class_name ||
      latest?.class ||
      "Not assigned"
    );
  }

  return "Not assigned";
};

// ============================================================
// STATUS STYLING
// ============================================================

const getStatusStyles = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";

    case "GRADUATED":
      return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400";

    case "TRANSFERRED":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";

    case "WITHDRAWN":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

// ============================================================
// PAGE
// ============================================================

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [subjectData, setSubjectData] = useState({
    general_compulsory: [],
    department_compulsory: [],
    selected_optional: [],
    available_optional: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD STUDENT
  // ==========================================================

  const loadStudent = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * IMPORTANT:
       *
       * Enrollment and subjects are optional.
       *
       * A student must still open even when:
       * - there is no current enrollment
       * - there is no enrollment history
       * - subjects cannot be loaded
       */

      const studentResponse = await getStudent(id);

      setStudent(studentResponse);

      // -------------------------------------------------------
      // ENROLLMENTS
      // -------------------------------------------------------

      try {
        const enrollmentResponse =
          await getStudentEnrollments(id);

        const enrollmentList = Array.isArray(
          enrollmentResponse
        )
          ? enrollmentResponse
          : enrollmentResponse?.results || [];

        setEnrollments(enrollmentList);
      } catch (enrollmentError) {
        console.warn(
          "Could not load student enrollments:",
          enrollmentError
        );

        setEnrollments([]);
      }

      // -------------------------------------------------------
      // SUBJECTS
      // -------------------------------------------------------

      try {
        const subjectsResponse =
          await getStudentSubjects(id);

        setSubjectData({
          general_compulsory:
            subjectsResponse?.general_compulsory || [],

          department_compulsory:
            subjectsResponse?.department_compulsory || [],

          selected_optional:
            subjectsResponse?.selected_optional || [],

          available_optional:
            subjectsResponse?.available_optional || [],
        });
      } catch (subjectError) {
        console.warn(
          "Could not load student subjects:",
          subjectError
        );

        setSubjectData({
          general_compulsory: [],
          department_compulsory: [],
          selected_optional: [],
          available_optional: [],
        });
      }
    } catch (err) {
      console.error(
        "Failed to load student details:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load student details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const status = getStatus(student);

  const displayClass = useMemo(
    () => getDisplayClass(student, enrollments),
    [student, enrollments]
  );

  const studentName = getStudentName(student);

  const currentEnrollment =
    student?.current_enrollment || null;

  const allSubjects = [
    ...subjectData.general_compulsory,
    ...subjectData.department_compulsory,
    ...subjectData.selected_optional,
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <LoadingState />;
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !student) {
    return (
      <ErrorState
        error={
          error ||
          "Student information could not be found."
        }
        onRetry={() => loadStudent(true)}
        onBack={() => navigate(-1)}
      />
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-[var(--color-card)] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>

          <button
            type="button"
            onClick={() => loadStudent(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:bg-[var(--color-card)] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

        </div>

        {/* ================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">

          <div className="bg-[var(--color-primary)] px-6 py-8 sm:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* IMAGE */}

              {student?.profile_image ? (
                <img
                  src={student.profile_image}
                  alt={studentName}
                  className="h-24 w-24 rounded-3xl border-4 border-white/30 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold text-white ring-4 ring-white/20">
                  {getInitials(student)}
                </div>
              )}

              {/* NAME */}

              <div className="min-w-0 flex-1 text-white">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  <h1 className="text-2xl font-bold sm:text-3xl">
                    {studentName}
                  </h1>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(
                      status
                    )}`}
                  >
                    {status}
                  </span>

                </div>

                <div className="mt-3 flex flex-col gap-2 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-6">

                  <span className="inline-flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {student?.admission_number ||
                      "No admission number"}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {displayClass}
                  </span>

                  {student?.department_name && (
                    <span className="inline-flex items-center gap-2">
                      <School className="h-4 w-4" />
                      {student.department_name}
                    </span>
                  )}

                </div>

              </div>

            </div>
          </div>

          {/* QUICK SUMMARY */}

          <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4 dark:divide-slate-800">

            <SummaryCard
              label="Class"
              value={displayClass}
            />

            <SummaryCard
              label="Session"
              value={
                student?.current_session ||
                currentEnrollment?.session_name ||
                "Not available"
              }
            />

            <SummaryCard
              label="Term"
              value={
                student?.current_term ||
                currentEnrollment?.term_name ||
                "Not available"
              }
            />

            <SummaryCard
              label="Roll Number"
              value={
                student?.current_roll_number ??
                currentEnrollment?.roll_number ??
                "Not available"
              }
            />

          </div>
        </div>

        {/* ================================================== */}
        {/* PERSONAL INFORMATION */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<User className="h-5 w-5" />}
            title="Personal Information"
          />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            <InfoRow
              icon={<UserRound className="h-4 w-4" />}
              label="Full Name"
              value={studentName}
            />

            <InfoRow
              icon={<Hash className="h-4 w-4" />}
              label="Admission Number"
              value={student?.admission_number}
            />

            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Gender"
              value={student?.gender}
            />

            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date of Birth"
              value={formatDate(student?.date_of_birth)}
            />

            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={student?.email}
            />

            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone Number"
              value={student?.phone_number}
            />

            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Address"
              value={student?.address}
            />

            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Nationality"
              value={student?.nationality}
            />

            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="State of Origin"
              value={student?.state_of_origin}
            />

            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Local Government"
              value={student?.local_government}
            />

          </div>
        </section>

        {/* ================================================== */}
        {/* ACADEMIC INFORMATION */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<GraduationCap className="h-5 w-5" />}
            title="Academic Information"
          />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <AcademicCard
              label="Class"
              value={displayClass}
              icon={<School className="h-5 w-5" />}
            />

            <AcademicCard
              label="Department"
              value={
                student?.department_name ||
                "Not assigned"
              }
              icon={<BookOpen className="h-5 w-5" />}
            />

            <AcademicCard
              label="Academic Session"
              value={
                student?.current_session ||
                currentEnrollment?.session_name ||
                "Not available"
              }
              icon={<Calendar className="h-5 w-5" />}
            />

            <AcademicCard
              label="Current Term"
              value={
                student?.current_term ||
                currentEnrollment?.term_name ||
                "Not available"
              }
              icon={<Clock className="h-5 w-5" />}
            />

          </div>
        </section>

        {/* ================================================== */}
        {/* GRADUATION / STATUS INFORMATION */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<GraduationCap className="h-5 w-5" />}
            title="Student Status Information"
          />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            <InfoRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Status"
              value={status}
            />

            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Admission Date"
              value={formatDate(student?.admission_date)}
            />

            <InfoRow
              icon={<GraduationCap className="h-4 w-4" />}
              label="Graduation Session"
              value={
                student?.graduation_session ||
                "Not available"
              }
            />

            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Graduation Year"
              value={
                student?.graduation_year ||
                "Not available"
              }
            />

            <InfoRow
              icon={<HeartPulse className="h-4 w-4" />}
              label="Blood Group"
              value={
                student?.blood_group ||
                "Not available"
              }
            />

            <InfoRow
              icon={<HeartPulse className="h-4 w-4" />}
              label="Medical Notes"
              value={
                student?.medical_notes ||
                "No medical notes"
              }
            />

          </div>
        </section>

        {/* ================================================== */}
        {/* CURRENT ENROLLMENT */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<School className="h-5 w-5" />}
            title="Current Enrollment"
          />

          <div className="mt-6">

            {currentEnrollment ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <AcademicCard
                  label="Session"
                  value={
                    currentEnrollment.session_name ||
                    "Not available"
                  }
                  icon={<Calendar className="h-5 w-5" />}
                />

                <AcademicCard
                  label="Term"
                  value={
                    currentEnrollment.term_name ||
                    "Not available"
                  }
                  icon={<Clock className="h-5 w-5" />}
                />

                <AcademicCard
                  label="Class"
                  value={
                    currentEnrollment.class_name ||
                    "Not assigned"
                  }
                  icon={<School className="h-5 w-5" />}
                />

                <AcademicCard
                  label="Roll Number"
                  value={
                    currentEnrollment.roll_number ??
                    "Not available"
                  }
                  icon={<Hash className="h-5 w-5" />}
                />

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      No Current Enrollment
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      This student does not currently have
                      an active enrollment. The student
                      record and previous enrollment
                      information are still available.
                    </p>

                    <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Last known class:{" "}
                      <span className="text-[var(--color-primary)]">
                        {displayClass}
                      </span>
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>
        </section>

        {/* ================================================== */}
        {/* SUBJECTS */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<BookOpen className="h-5 w-5" />}
            title="Student Subjects"
          />

          {allSubjects.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-7 w-7" />}
              title="No subjects available"
              message="There are no subject records available for this student."
            />
          ) : (
            <div className="mt-6 space-y-6">

              <SubjectGroup
                title="General Compulsory"
                subjects={
                  subjectData.general_compulsory
                }
              />

              <SubjectGroup
                title="Department Compulsory"
                subjects={
                  subjectData.department_compulsory
                }
              />

              <SubjectGroup
                title="Selected Optional"
                subjects={
                  subjectData.selected_optional
                }
              />

            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* PARENTS / GUARDIANS */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<Users className="h-5 w-5" />}
            title="Parents / Guardians"
          />

          {Array.isArray(student?.parents) &&
          student.parents.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

              {student.parents.map((parent) => (
                <div
                  key={parent.id}
                  className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800"
                >
                  <div className="flex items-start gap-4">

                    {parent?.profile_image ? (
                      <img
                        src={parent.profile_image}
                        alt={parent.full_name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[var(--color-primary)] dark:bg-blue-950/40">
                        {getInitials({
                          full_name:
                            parent?.full_name ||
                            "Parent",
                        })}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {parent?.full_name ||
                            "Unnamed Parent"}
                        </h3>

                        {parent?.relationship && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                            {parent.relationship}
                          </span>
                        )}

                      </div>

                      <div className="mt-3 space-y-2">

                        <DetailLine
                          icon={<Phone className="h-4 w-4" />}
                          value={
                            parent?.phone_number
                          }
                        />

                        <DetailLine
                          icon={<Mail className="h-4 w-4" />}
                          value={parent?.email}
                        />

                        <DetailLine
                          icon={<Briefcase className="h-4 w-4" />}
                          value={parent?.occupation}
                        />

                        <DetailLine
                          icon={<MapPin className="h-4 w-4" />}
                          value={parent?.address}
                        />

                      </div>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No parents or guardians"
              message="No parent or guardian information is available for this student."
            />
          )}
        </section>

        {/* ================================================== */}
        {/* ENROLLMENT HISTORY */}
        {/* ================================================== */}

        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

          <SectionHeader
            icon={<Clock className="h-5 w-5" />}
            title="Enrollment History"
          />

          {enrollments.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-7 w-7" />}
              title="No enrollment history"
              message="There are no enrollment records available for this student."
            />
          ) : (
            <div className="mt-6 overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Session
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Term
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Roll No.
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >

                      <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {enrollment?.session_name ||
                          "Not available"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {enrollment?.term_name ||
                          "Not available"}
                      </td>

                      <td className="px-4 py-4">

                        <span className="inline-flex rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {enrollment?.class_name ||
                            "Not assigned"}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {enrollment?.roll_number ??
                          "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(
                          enrollment?.enrollment_date
                        )}
                      </td>

                      <td className="px-4 py-4">

                        {enrollment?.is_current ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Previous
                          </span>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
        {icon}
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value || "Not available"}
        </p>

      </div>
    </div>
  );
}

// ============================================================
// DETAIL LINE
// ============================================================

function DetailLine({ icon, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      {icon}
      <span>{value}</span>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ label, value }) {
  return (
    <div className="p-5">

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
        {value || "Not available"}
      </p>

    </div>
  );
}

// ============================================================
// ACADEMIC CARD
// ============================================================

function AcademicCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] shadow-sm dark:bg-slate-700">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
            {value || "Not available"}
          </p>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// SUBJECT GROUP
// ============================================================

function SubjectGroup({ title, subjects }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return null;
  }

  return (
    <div>

      <div className="mb-3 flex items-center justify-between">

        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h3>

        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] dark:bg-blue-950/40">
          {subjects.length}
        </span>

      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

        {subjects.map((subject) => (
          <div
            key={
              subject?.class_subject_id ||
              subject?.subject_id ||
              subject?.id
            }
            className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
          >

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {subject?.name ||
                    "Unnamed Subject"}
                </h4>

                {subject?.code && (
                  <p className="mt-1 text-xs text-slate-400">
                    {subject.code}
                  </p>
                )}

              </div>

              {subject?.is_core && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Core
                </span>
              )}

            </div>

            {subject?.department_name && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {subject.department_name}
              </p>
            )}

            {subject?.teacher_name && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <User className="h-3.5 w-3.5" />
                {subject.teacher_name}
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ icon, title, message }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-700">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>

    </div>
  );
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">

      <div className="flex min-h-[500px] items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading student details...
          </p>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ error, onRetry, onBack }) {
  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">

      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-[var(--color-card)]">

        <div className="flex flex-col items-center text-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Unable to Load Student
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentDetails;