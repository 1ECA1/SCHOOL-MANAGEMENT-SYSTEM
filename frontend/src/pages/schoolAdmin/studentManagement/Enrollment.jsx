import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  UserCheck,
} from "lucide-react";

import api from "../../../services/api";


// ============================================================
// API ENDPOINTS
// ============================================================

const ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  enrollments: "/students/enrollments/",
  continueTerm: "/students/enrollments/continue-term/",
};


// ============================================================
// HELPERS
// ============================================================

function getItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}


function getId(item) {
  return item?.id ?? item?.pk;
}


function getSessionName(session) {
  return (
    session?.name ||
    session?.session_name ||
    session?.academic_session_name ||
    `Session ${getId(session)}`
  );
}


function getTermName(term) {
  return (
    term?.term_name ||
    term?.name_display ||
    term?.display_name ||
    term?.name ||
    `Term ${getId(term)}`
  );
}


function getClassName(classLevel) {
  return (
    classLevel?.name ||
    classLevel?.class_name ||
    `Class ${getId(classLevel)}`
  );
}


function isCurrentSession(session) {
  return (
    session?.is_current === true ||
    session?.current === true
  );
}


function isCurrentTerm(term) {
  return (
    term?.is_current === true ||
    term?.current === true
  );
}


function isActiveTerm(term) {
  return term?.is_active === true || term?.active === true;
}


// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="
            w-full appearance-none rounded-lg border
            border-gray-200 dark:border-gray-700
            bg-[var(--color-card)]
            px-4 py-3 pr-10
            text-sm text-[var(--color-text)]
            outline-none transition
            focus:border-[var(--color-primary)]
            focus:ring-2
            focus:ring-[var(--color-primary)]/20
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {children}
        </select>

        <ChevronDown
          size={18}
          className="
            pointer-events-none
            absolute right-3 top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />
      </div>
    </div>
  );
}


// ============================================================
// MESSAGE BOX
// ============================================================

function MessageBox({ type = "error", children }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`
        flex items-start gap-3 rounded-lg border px-4 py-3 text-sm
        ${
          isSuccess
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
        }
      `}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}

      <div>{children}</div>
    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Enrollment() {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");

  // ----------------------------------------------------------
  // SELECTION
  // ----------------------------------------------------------

  const [selectedStudents, setSelectedStudents] = useState([]);

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [continuing, setContinuing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD SESSIONS
  // ==========================================================

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError("");

      const response = await api.get(
        ENDPOINTS.sessions
      );

      const items = getItems(response.data);

      setSessions(items);

      if (items.length === 0) {
        setSelectedSession("");
        return;
      }

      // Current session first
      const currentSession =
        items.find(isCurrentSession) || items[0];

      setSelectedSession(
        String(getId(currentSession))
      );
    } catch (err) {
      console.error(
        "Failed to load academic sessions:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load academic sessions."
      );
    } finally {
      setLoadingSessions(false);
    }
  };


  // ==========================================================
  // LOAD CLASSES
  // ==========================================================

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);

      const response = await api.get(
        ENDPOINTS.classes
      );

      setClasses(getItems(response.data));
    } catch (err) {
      console.error(
        "Failed to load classes:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  };


  // ==========================================================
  // LOAD TERMS
  // ==========================================================

  const loadTerms = async (sessionId) => {
    if (!sessionId) {
      setTerms([]);
      setSelectedTerm("");
      return;
    }

    try {
      setLoadingTerms(true);

      const response = await api.get(
        ENDPOINTS.terms,
        {
          params: {
            academic_session: sessionId,
          },
        }
      );

      const items = getItems(response.data);

      setTerms(items);

      if (items.length === 0) {
        setSelectedTerm("");
        return;
      }

      // Prefer explicitly current term.
      // Otherwise prefer active term.
      // Finally fall back to first returned term.
      const currentTerm =
        items.find(isCurrentTerm) ||
        items.find(isActiveTerm) ||
        items[0];

      setSelectedTerm(
        String(getId(currentTerm))
      );
    } catch (err) {
      console.error(
        "Failed to load terms:",
        err
      );

      setTerms([]);
      setSelectedTerm("");

      setError(
        err?.response?.data?.detail ||
          "Failed to load terms for the selected session."
      );
    } finally {
      setLoadingTerms(false);
    }
  };


  // ==========================================================
  // LOAD ENROLLMENTS
  // ==========================================================

  const loadEnrollments = async () => {
    if (!selectedSession || !selectedTerm) {
      setEnrollments([]);
      return;
    }

    try {
      setLoadingEnrollments(true);
      setError("");

      const params = {
        academic_session: selectedSession,
        term: selectedTerm,
      };

      if (selectedClass) {
        params.class_level = selectedClass;
      }

      const response = await api.get(
        ENDPOINTS.enrollments,
        { params }
      );

      setEnrollments(
        getItems(response.data)
      );

      setSelectedStudents([]);
    } catch (err) {
      console.error(
        "Failed to load student enrollments:",
        err
      );

      setEnrollments([]);

      setError(
        err?.response?.data?.detail ||
          "Failed to load student enrollments."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadSessions();
    loadClasses();
  }, []);


  // ==========================================================
  // LOAD TERMS WHEN SESSION CHANGES
  // ==========================================================

  useEffect(() => {
    if (selectedSession) {
      loadTerms(selectedSession);
    }
  }, [selectedSession]);


  // ==========================================================
  // LOAD ENROLLMENTS WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    if (selectedSession && selectedTerm) {
      loadEnrollments();
    }
  }, [
    selectedSession,
    selectedTerm,
    selectedClass,
  ]);


  // ==========================================================
  // FILTER STUDENTS
  // ==========================================================

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const studentName =
        enrollment.student_name ||
        enrollment.student?.full_name ||
        "";

      const admissionNumber =
        enrollment.admission_number ||
        enrollment.student?.admission_number ||
        "";

      const className =
        enrollment.class_name ||
        enrollment.class_level?.name ||
        "";

      return (
        studentName
          .toLowerCase()
          .includes(query) ||
        admissionNumber
          .toLowerCase()
          .includes(query) ||
        className
          .toLowerCase()
          .includes(query)
      );
    });
  }, [enrollments, search]);


  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const allVisibleSelected =
    filteredEnrollments.length > 0 &&
    filteredEnrollments.every((enrollment) =>
      selectedStudents.includes(
        enrollment.student
      )
    );


  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleStudentIds =
        filteredEnrollments.map(
          (enrollment) =>
            enrollment.student
        );

      setSelectedStudents((current) =>
        current.filter(
          (id) =>
            !visibleStudentIds.includes(id)
        )
      );

      return;
    }

    const visibleStudentIds =
      filteredEnrollments.map(
        (enrollment) =>
          enrollment.student
      );

    setSelectedStudents((current) => [
      ...new Set([
        ...current,
        ...visibleStudentIds,
      ]),
    ]);
  };


  // ==========================================================
  // SELECT STUDENT
  // ==========================================================

  const toggleStudent = (studentId) => {
    setSelectedStudents((current) => {
      if (current.includes(studentId)) {
        return current.filter(
          (id) => id !== studentId
        );
      }

      return [
        ...current,
        studentId,
      ];
    });
  };


  // ==========================================================
  // CONTINUE TERM
  // ==========================================================

  const continueSelectedStudents = async () => {
    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    try {
      setContinuing(true);
      setError("");
      setSuccess("");

      const results = [];
      const failures = [];

      for (const studentId of selectedStudents) {
        try {
          const response = await api.post(
            ENDPOINTS.continueTerm,
            {
              student_id: studentId,
            }
          );

          results.push(response.data);
        } catch (err) {
          const student =
            enrollments.find(
              (enrollment) =>
                enrollment.student ===
                studentId
            );

          failures.push({
            student:
              student?.student_name ||
              "Selected student",
            message:
              err?.response?.data?.detail ||
              "Unable to continue this student.",
          });
        }
      }

      if (results.length > 0) {
        setSuccess(
          `${results.length} student${
            results.length === 1
              ? ""
              : "s"
          } successfully continued to the next term.`
        );
      }

      if (failures.length > 0) {
        const failureMessage =
          failures
            .map(
              (item) =>
                `${item.student}: ${item.message}`
            )
            .join(" ");

        setError(failureMessage);
      }

      setSelectedStudents([]);

      await loadEnrollments();
    } catch (err) {
      console.error(
        "Failed to continue students:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to continue selected students."
      );
    } finally {
      setContinuing(false);
    }
  };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await Promise.all([
        loadSessions(),
        loadClasses(),
      ]);

      if (selectedSession) {
        await loadTerms(selectedSession);
      }

      if (
        selectedSession &&
        selectedTerm
      ) {
        await loadEnrollments();
      }
    } finally {
      setRefreshing(false);
    }
  };


  // ==========================================================
  // CURRENT SESSION / TERM DISPLAY
  // ==========================================================

  const currentSession = sessions.find(
    (session) =>
      String(getId(session)) ===
      String(selectedSession)
  );

  const currentTerm = terms.find(
    (term) =>
      String(getId(term)) ===
      String(selectedTerm)
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-[var(--color-primary)]/10
                text-[var(--color-primary)]
              "
            >
              <UserCheck size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Student Enrollment
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage student term enrollment and
                continue students to the next term.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg
            border border-gray-200
            bg-[var(--color-card)]
            px-4 py-2.5
            text-sm font-medium
            text-[var(--color-text)]
            transition
            hover:bg-gray-50
            dark:border-gray-700
            dark:hover:bg-gray-800
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>


      {/* ======================================================
          CURRENT ACADEMIC PERIOD
      ====================================================== */}

      <div
        className="
          rounded-xl border
          border-[var(--color-primary)]/20
          bg-[var(--color-primary)]/5
          p-4
        "
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Current Academic Period
            </p>

            <p className="mt-1 text-sm text-[var(--color-text)]">
              {currentSession
                ? getSessionName(currentSession)
                : "Loading session..."}{" "}
              {currentTerm
                ? `• ${getTermName(currentTerm)}`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Current settings are selected automatically
          </div>
        </div>
      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        className="
          rounded-xl border
          border-gray-200
          bg-[var(--color-card)]
          p-5
          shadow-sm
          dark:border-gray-700
        "
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterSelect
            label="Academic Session"
            value={selectedSession}
            onChange={(value) => {
              setSelectedSession(value);
              setSelectedTerm("");
              setEnrollments([]);
              setSelectedStudents([]);
            }}
            disabled={loadingSessions}
          >
            <option value="">
              Select session
            </option>

            {sessions.map((session) => (
              <option
                key={getId(session)}
                value={getId(session)}
              >
                {getSessionName(session)}
                {isCurrentSession(session)
                  ? " — Current"
                  : ""}
              </option>
            ))}
          </FilterSelect>


          <FilterSelect
            label="Term"
            value={selectedTerm}
            onChange={(value) => {
              setSelectedTerm(value);
              setSelectedStudents([]);
            }}
            disabled={
              loadingTerms ||
              !selectedSession
            }
          >
            <option value="">
              {loadingTerms
                ? "Loading terms..."
                : "Select term"}
            </option>

            {terms.map((term) => (
              <option
                key={getId(term)}
                value={getId(term)}
              >
                {getTermName(term)}
                {isCurrentTerm(term)
                  ? " — Current"
                  : ""}
              </option>
            ))}
          </FilterSelect>


          <FilterSelect
            label="Class"
            value={selectedClass}
            onChange={(value) => {
              setSelectedClass(value);
              setSelectedStudents([]);
            }}
            disabled={loadingClasses}
          >
            <option value="">
              All Classes
            </option>

            {classes.map((classLevel) => (
              <option
                key={getId(classLevel)}
                value={getId(classLevel)}
              >
                {getClassName(classLevel)}
              </option>
            ))}
          </FilterSelect>
        </div>


        {/* SEARCH */}

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Search Students
          </label>

          <div className="relative">
            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by student name, admission number, or class..."
              className="
                w-full rounded-lg border
                border-gray-200
                bg-[var(--color-card)]
                py-3 pl-10 pr-4
                text-sm text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
                dark:border-gray-700
              "
            />
          </div>
        </div>
      </div>


      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {success && (
        <MessageBox type="success">
          {success}
        </MessageBox>
      )}

      {error && (
        <MessageBox type="error">
          {error}
        </MessageBox>
      )}


      {/* ======================================================
          SUMMARY / ACTION BAR
      ====================================================== */}

      <div
        className="
          flex flex-col gap-4
          rounded-xl border
          border-gray-200
          bg-[var(--color-card)]
          p-4
          shadow-sm
          dark:border-gray-700
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg
              bg-[var(--color-primary)]/10
              text-[var(--color-primary)]
            "
          >
            <Users size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {filteredEnrollments.length}{" "}
              student
              {filteredEnrollments.length === 1
                ? ""
                : "s"}
            </p>

            <p className="text-xs text-gray-500">
              {selectedStudents.length} selected
            </p>
          </div>
        </div>


        <button
          type="button"
          onClick={continueSelectedStudents}
          disabled={
            continuing ||
            selectedStudents.length === 0
          }
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg
            bg-[var(--color-primary)]
            px-5 py-2.5
            text-sm font-semibold
            text-white
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {continuing ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />

              Continuing...
            </>
          ) : (
            <>
              <UserCheck size={17} />

              Continue Selected
            </>
          )}
        </button>
      </div>


      {/* ======================================================
          STUDENT TABLE
      ====================================================== */}

      <div
        className="
          overflow-hidden rounded-xl border
          border-gray-200
          bg-[var(--color-card)]
          shadow-sm
          dark:border-gray-700
        "
      >
        {loadingEnrollments ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading students...
            </div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div
              className="
                mb-4 flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-gray-100
                text-gray-400
                dark:bg-gray-800
              "
            >
              <Users size={25} />
            </div>

            <h3 className="text-base font-semibold text-[var(--color-text)]">
              No students found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              There are no student enrollments matching
              the selected session, term, class, or
              search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="
                        h-4 w-4 rounded
                        border-gray-300
                        text-[var(--color-primary)]
                        focus:ring-[var(--color-primary)]
                      "
                    />
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Admission No.
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Roll No.
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEnrollments.map(
                  (enrollment) => {
                    const studentId =
                      enrollment.student;

                    const studentName =
                      enrollment.student_name ||
                      enrollment.student?.full_name ||
                      "Unknown Student";

                    const admissionNumber =
                      enrollment.admission_number ||
                      enrollment.student
                        ?.admission_number ||
                      "—";

                    const className =
                      enrollment.class_name ||
                      enrollment.class_level?.name ||
                      "—";

                    const isSelected =
                      selectedStudents.includes(
                        studentId
                      );

                    return (
                      <tr
                        key={enrollment.id}
                        className={`
                          border-b border-gray-100
                          transition
                          dark:border-gray-800
                          ${
                            isSelected
                              ? "bg-[var(--color-primary)]/5"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                          }
                        `}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleStudent(
                                studentId
                              )
                            }
                            className="
                              h-4 w-4 rounded
                              border-gray-300
                              text-[var(--color-primary)]
                              focus:ring-[var(--color-primary)]
                            "
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex h-9 w-9
                                shrink-0
                                items-center justify-center
                                rounded-full
                                bg-[var(--color-primary)]/10
                                text-sm font-semibold
                                text-[var(--color-primary)]
                              "
                            >
                              {studentName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[var(--color-text)]">
                                {studentName}
                              </p>

                              <p className="text-xs text-gray-500">
                                {enrollment.term_name ||
                                  ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {admissionNumber}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {className}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {enrollment.roll_number ??
                            "—"}
                        </td>

                        <td className="px-4 py-4">
                          {enrollment.is_current ? (
                            <span
                              className="
                                inline-flex items-center gap-1.5
                                rounded-full
                                bg-green-50
                                px-2.5 py-1
                                text-xs font-medium
                                text-green-700
                                dark:bg-green-900/20
                                dark:text-green-400
                              "
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Current
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex items-center
                                rounded-full
                                bg-gray-100
                                px-2.5 py-1
                                text-xs font-medium
                                text-gray-600
                                dark:bg-gray-800
                                dark:text-gray-400
                              "
                            >
                              Not Current
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <div
        className="
          rounded-xl border
          border-amber-200
          bg-amber-50
          p-4
          dark:border-amber-900/40
          dark:bg-amber-900/10
        "
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold">
              Term progression
            </p>

            <p className="mt-1">
              Students move from First Term to Second
              Term and from Second Term to Third Term.
              Students already in Third Term must be
              handled through the Promotion workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


