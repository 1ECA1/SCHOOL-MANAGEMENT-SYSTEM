import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPrincipals } from "../../services/principalService";
import { getStudents } from "../../services/studentsService";
import { getTeachers } from "../../services/teachersService";
import {
  getClassLevels,
  getSessions,
  getTerms,
} from "../../services/academicsService";

function PrincipalDashboard() {
  const { user } = useAuth();

  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [classCount, setClassCount] = useState(0);

  const [currentSession, setCurrentSession] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Principal";

  useEffect(() => {
    const loadPrincipal = async () => {
      try {
        setError("");

        // =====================================================
        // GET PRINCIPAL PROFILE
        // =====================================================

        const data = await getPrincipals();

        // Find the profile belonging to the logged-in user.
        const currentPrincipal = data.find((item) => item.user_id === user?.id);

        setPrincipal(currentPrincipal || null);

        // If no Principal profile was found, stop here.
        if (!currentPrincipal) {
          setLoading(false);
          return;
        }

        const schoolId = currentPrincipal.school;

        // =====================================================
        // SCHOOL STUDENTS
        // =====================================================

        const students = await getStudents();

        const schoolStudents = students.filter(
          (student) => student.school === schoolId,
        );

        setStudentCount(schoolStudents.length);

        // =====================================================
        // SCHOOL TEACHERS
        // =====================================================

        const teachers = await getTeachers();

        const schoolTeachers = teachers.filter(
          (teacher) => teacher.school === schoolId,
        );

        setTeacherCount(schoolTeachers.length);

        // =====================================================
        // SCHOOL CLASSES
        // =====================================================

        const classLevels = await getClassLevels();

        console.log("PRINCIPAL CLASS LEVELS:", classLevels);

        const schoolClasses = classLevels.filter(
          (classLevel) =>
            classLevel.school === schoolId && classLevel.is_active !== false,
        );

        setClassCount(schoolClasses.length);

        // =====================================================
        // CURRENT ACADEMIC SESSION
        // =====================================================

        const sessions = await getSessions();

        console.log("ALL SESSIONS:", sessions);

        const schoolCurrentSession = sessions.find(
          (session) =>
            session.school === schoolId && session.is_current === true,
        );

        setCurrentSession(schoolCurrentSession || null);

        console.log("PRINCIPAL CURRENT SESSION:", schoolCurrentSession);

        // =====================================================
        // CURRENT TERM
        // =====================================================

        const terms = await getTerms();

        console.log(
          "ALL TERMS DETAILED:",
          terms.map((term) => ({
            id: term.id,
            name: term.name,
            school: term.school,
            academic_session: term.academic_session,
            is_current: term.is_current,
          })),
        );

        const schoolCurrentTerm = terms.find(
          (term) =>
            term.is_current === true &&
            (term.school === schoolId ||
              term.school === undefined ||
              term.school === null) &&
            (term.academic_session === schoolCurrentSession?.id ||
              term.academic_session_id === schoolCurrentSession?.id ||
              term.session === schoolCurrentSession?.id ||
              term.session_id === schoolCurrentSession?.id ||
              term.academic_session === undefined ||
              term.academic_session === null),
        );

        setCurrentTerm(schoolCurrentTerm || null);

        console.log("PRINCIPAL CURRENT TERM:", schoolCurrentTerm);
        console.log("PRINCIPAL CURRENT TERM:", schoolCurrentTerm);

        // =====================================================
        // DEBUG INFORMATION
        // =====================================================

        console.log("PRINCIPAL:", currentPrincipal);

        console.log("PRINCIPAL SCHOOL STUDENTS:", schoolStudents);

        console.log("PRINCIPAL SCHOOL TEACHERS:", schoolTeachers);

        console.log("PRINCIPAL SCHOOL CLASSES:", schoolClasses);
      } catch (err) {
        console.error("Failed to load principal:", err);
        setError("Unable to load principal information.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadPrincipal();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <p className="text-sm font-medium text-slate-500">Principal Portal</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {fullName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage and monitor your school from one place.
        </p>
      </div>

      {/* =====================================================
          PRINCIPAL / SCHOOL INFORMATION
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          School Information
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">
            Loading school information...
          </p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : principal ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* School */}

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                School
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {principal.school_name || "—"}
              </p>
            </div>

            {/* Employee ID */}

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Employee ID
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {principal.employee_id || "—"}
              </p>
            </div>

            {/* Qualification */}

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Qualification
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {principal.qualification || "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No principal profile was found.
          </p>
        )}
      </div>

      {/* =====================================================
          DASHBOARD SUMMARY
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* ===================================================
            STUDENTS
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Students</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {studentCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">School students</p>
        </div>

        {/* ===================================================
            TEACHERS
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Teachers</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {teacherCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">School teachers</p>
        </div>

        {/* ===================================================
            CLASSES
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Classes</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{classCount}</p>

          <p className="mt-1 text-xs text-slate-400">Active classes</p>
        </div>

        {/* ===================================================
            CURRENT SESSION
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Current Session</p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {currentSession?.name || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">Academic session</p>
        </div>

        {/* ===================================================
            CURRENT TERM
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Current Term</p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {currentTerm?.name || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">Academic term</p>
        </div>
      </div>
    </div>
  );
}

export default PrincipalDashboard;

// ### One thing to watch

// I used:

// ```jsx
// term.academic_session === schoolCurrentSession.id
// ```

// because your Term model is connected to the Academic Session.

// If your API returns the session under a different field, such as:

// ```text
// session
// ```

// or:

// ```text
// session_id

// the console will show us immediately.

// For now, **paste this version and refresh**.

// If the card shows something like:

// **Current Term — Second Term**

// then we're done with the dynamic dashboard data.

// After that, **we move directly to the sidebar redesign**. We'll redesign the actual Principal sidebar rather than changing the dashboard again.
