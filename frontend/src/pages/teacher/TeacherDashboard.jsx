import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTeacher } from "../../services/teachersService";
import {
  getSubjectAssignments,
  getClassAssignments,
} from "../../services/teachersService";
import {
  getSessions,
  getTerms,
} from "../../services/academicsService";

function TeacherDashboard() {
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [classAssignments, setClassAssignments] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.teacher_id) {
        setError("No teacher profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          teacherData,
          subjectData,
          classData,
          sessionData,
          termData,
        ] = await Promise.all([
          getTeacher(user.teacher_id),
          getSubjectAssignments(),
          getClassAssignments(),
          getSessions(),
          getTerms(),
        ]);

        setTeacher(teacherData);

        /*
         * The API may return either:
         * - an array
         * - a paginated object containing results
         */
        const subjects = Array.isArray(subjectData)
          ? subjectData
          : subjectData?.results || [];

        const classes = Array.isArray(classData)
          ? classData
          : classData?.results || [];

        const sessions = Array.isArray(sessionData)
          ? sessionData
          : sessionData?.results || [];

        const terms = Array.isArray(termData)
          ? termData
          : termData?.results || [];

        // Only assignments belonging to this Teacher
        const mySubjects = subjects.filter(
          (assignment) =>
            Number(assignment.teacher) === Number(user.teacher_id)
        );

        const myClasses = classes.filter(
          (assignment) =>
            Number(assignment.teacher) === Number(user.teacher_id) &&
            assignment.is_active !== false
        );

        setSubjectAssignments(mySubjects);
        setClassAssignments(myClasses);

        // Find current academic session
        const activeSession = sessions.find(
          (session) => session.is_current === true
        );

        // Find current term
        const activeTerm = terms.find(
          (term) => term.is_current === true
        );

        setCurrentSession(activeSession || null);
        setCurrentTerm(activeTerm || null);
      } catch (err) {
        console.error(
          "Failed to load teacher dashboard:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load your teacher dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.teacher_id]);

  const teacherName =
    teacher?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Teacher";

  const departmentName =
    teacher?.department_name || "—";

  const profileImage = teacher?.profile_image
    ? teacher.profile_image.startsWith("http")
      ? teacher.profile_image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${teacher.profile_image}`
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teacher dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-800">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "My Students",
      value: "—",
      icon: "👨‍🎓",
      description: "Students assigned to you",
    },
    {
      title: "My Classes",
      value: classAssignments.length,
      icon: "🏫",
      description: "Active classes you handle",
    },
    {
      title: "My Subjects",
      value: subjectAssignments.length,
      icon: "📚",
      description: "Subjects you teach",
    },
    {
      title: "Current Term",
      value: currentTerm?.name || "—",
      icon: "📅",
      description: currentSession?.name || "Academic term",
    },
  ];

  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome, {teacherName}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your teaching activities from your dashboard.
            </p>
          </div>

          {profileImage ? (
            <img
              src={profileImage}
              alt={teacherName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
              {teacherName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                {card.icon}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* =================================================
          TEACHER INFORMATION + ACADEMIC INFORMATION
      ================================================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teacher Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
              👨‍🏫
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Teacher Information
              </h2>

              <p className="text-sm text-slate-500">
                Your professional information
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <InfoRow
              label="Employee ID"
              value={teacher?.employee_id || "—"}
            />

            <InfoRow
              label="Department"
              value={departmentName}
            />

            <InfoRow
              label="Specialization"
              value={teacher?.specialization || "—"}
            />

            <InfoRow
              label="Qualification"
              value={teacher?.qualification || "—"}
            />

            <InfoRow
              label="Employment Status"
              value={formatValue(
                teacher?.employment_status
              )}
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Academic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current academic period
          </p>

          <div className="mt-5 space-y-4">
            <InfoRow
              label="Academic Session"
              value={currentSession?.name || "—"}
            />

            <InfoRow
              label="Current Term"
              value={currentTerm?.name || "—"}
            />

            <InfoRow
              label="Department"
              value={departmentName}
            />

            <InfoRow
              label="Classes Assigned"
              value={classAssignments.length}
            />

            <InfoRow
              label="Subjects Assigned"
              value={subjectAssignments.length}
            />
          </div>
        </div>
      </div>

      {/* =================================================
          MY CLASSES
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Classes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Classes currently assigned to you.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            🏫
          </div>
        </div>

        {classAssignments.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              No classes have been assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    🏫
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {assignment.class_level_name ||
                        "Class"}
                    </p>

                    {assignment.academic_session_name && (
                      <p className="mt-1 text-xs text-slate-500">
                        {assignment.academic_session_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          MY SUBJECTS
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Subjects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Subjects currently assigned to you.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            📚
          </div>
        </div>

        {subjectAssignments.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              No subjects have been assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjectAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    📚
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {assignment.subject_name ||
                        "Subject"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {assignment.class_level_name ||
                        "Class"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function formatValue(value) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default TeacherDashboard;