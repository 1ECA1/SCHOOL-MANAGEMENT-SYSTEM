import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers3,
  Search,
  Users,
  X,
} from "lucide-react";
import api from "../../services/api";

// ============================================================
// API ENDPOINTS
// ============================================================

const ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  enrollments: "/students/enrollments/",

  promotionEligibility: (studentId) =>
    `/students/enrollments/${studentId}/promotion/`,

  promote: "/students/enrollments/promote/",
};

// ============================================================
// HELPERS
// ============================================================

const getArray = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  return [];
};

const getId = (item) => {
  return item?.id ?? item?.value ?? item?.pk;
};

const getName = (item) => {
  return (
    item?.name ||
    item?.title ||
    item?.class_name ||
    item?.session_name ||
    item?.term_name ||
    ""
  );
};

const getStudentName = (enrollment) => {
  const fullName =
    enrollment?.student_name ||
    enrollment?.student?.full_name ||
    enrollment?.student?.name ||
    enrollment?.student?.student_name ||
    `${enrollment?.student?.first_name || ""} ${
      enrollment?.student?.last_name || ""
    }`.trim();

  return fullName || "Unnamed Student";
};

const getStudentId = (enrollment) => {
  if (typeof enrollment?.student === "number") {
    return enrollment.student;
  }

  return enrollment?.student?.id || enrollment?.student_id;
};

const getAdmissionNumber = (enrollment) => {
  return (
    enrollment?.admission_number ||
    enrollment?.student?.admission_number ||
    enrollment?.admission_no ||
    enrollment?.student?.admission_no ||
    "—"
  );
};

const getClassName = (enrollment) => {
  return (
    enrollment?.class_name ||
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    "—"
  );
};

const getBackendError = (
  error,
  fallback = "An unexpected error occurred."
) => {
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
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
      } else {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
};

// ============================================================
// COMPONENT
// ============================================================

export default function AdmissionOfficerPromotion() {
  // ==========================================================
  // DATA STATES
  // ==========================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // ==========================================================
  // FILTER STATES
  // ==========================================================

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================================
  // SELECTION
  // ==========================================================

  const [selectedStudents, setSelectedStudents] = useState([]);

  // ==========================================================
  // UI STATES
  // ==========================================================

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // MODALS
  // ==========================================================

  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);

  // ==========================================================
  // PROMOTION
  // ==========================================================

  const [promotionTargets, setPromotionTargets] = useState([]);
  const [selectedTargetClass, setSelectedTargetClass] = useState("");

  const [loadingPromotionTargets, setLoadingPromotionTargets] =
    useState(false);

  // ==========================================================
  // LOAD SESSIONS
  // ==========================================================

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError("");

      const response = await api.get(ENDPOINTS.sessions);

      const data = getArray(response);

      setSessions(data);

      if (data.length > 0) {
        const currentSession =
          data.find(
            (item) =>
              item.is_current === true ||
              item.current === true
          ) || data[0];

        setSelectedSession(String(getId(currentSession)));
      }
    } catch (err) {
      console.error("Load sessions error:", err);

      setError(
        getBackendError(
          err,
          "Unable to load academic sessions."
        )
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  // ==========================================================
  // LOAD TERMS WHEN SESSION CHANGES
  // ==========================================================

  useEffect(() => {
    if (!selectedSession) {
      setTerms([]);
      setSelectedTerm("");
      return;
    }

    loadTerms(selectedSession);
  }, [selectedSession]);

  const loadTerms = async (sessionId) => {
    try {
      setLoadingTerms(true);
      setError("");

      const response = await api.get(ENDPOINTS.terms, {
        params: {
          academic_session: sessionId,
        },
      });

      const data = getArray(response);

      setTerms(data);

      if (data.length > 0) {
        const currentTerm =
          data.find(
            (item) =>
              item.is_current === true ||
              item.current === true ||
              item.active === true
          ) || data[0];

        setSelectedTerm(String(getId(currentTerm)));
      } else {
        setSelectedTerm("");
      }
    } catch (err) {
      console.error("Load terms error:", err);

      setTerms([]);
      setSelectedTerm("");

      setError(
        getBackendError(err, "Unable to load terms.")
      );
    } finally {
      setLoadingTerms(false);
    }
  };

  // ==========================================================
  // LOAD CLASSES
  // ==========================================================

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);

      const response = await api.get(ENDPOINTS.classes);

      const data = getArray(response);

      const activeClasses = data.filter(
        (item) => item.active !== false
      );

      setClasses(activeClasses);
    } catch (err) {
      console.error("Load classes error:", err);

      setClasses([]);

      setError(
        getBackendError(err, "Unable to load classes.")
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  // ==========================================================
  // CHECK WHETHER CURRENT CLASS IS SS3
  // ==========================================================

  const isSS3Class = useMemo(() => {
    const currentClass = classes.find(
      (item) =>
        String(getId(item)) === String(selectedClass)
    );

    if (!currentClass) {
      return false;
    }

    const className = getName(currentClass).toUpperCase();

    return className.includes("SS3");
  }, [classes, selectedClass]);

  // ==========================================================
  // LOAD STUDENTS / ENROLLMENTS
  // ==========================================================

  useEffect(() => {
    if (!selectedSession || !selectedTerm) {
      setStudents([]);
      return;
    }

    loadStudents();
  }, [selectedSession, selectedTerm, selectedClass]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
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
        {
          params,
        }
      );

      let data = getArray(response);

      data = data.filter((enrollment) => {
        const sessionId =
          enrollment?.academic_session?.id ||
          enrollment?.academic_session_id ||
          enrollment?.session_id;

        const termId =
          enrollment?.term?.id ||
          enrollment?.term_id;

        const classId =
          enrollment?.class_level?.id ||
          enrollment?.class_level_id;

        const sessionMatches =
          !sessionId ||
          String(sessionId) === String(selectedSession);

        const termMatches =
          !termId ||
          String(termId) === String(selectedTerm);

        const classMatches =
          !selectedClass ||
          !classId ||
          String(classId) === String(selectedClass);

        return (
          sessionMatches &&
          termMatches &&
          classMatches
        );
      });

      setStudents(data);

      setSelectedStudents((previous) =>
        previous.filter((studentId) =>
          data.some(
            (student) =>
              String(getStudentId(student)) ===
              String(studentId)
          )
        )
      );
    } catch (err) {
      console.error("Load students error:", err);

      setStudents([]);

      setError(
        getBackendError(
          err,
          "Unable to load student enrollments."
        )
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  // ==========================================================
  // FILTERED STUDENTS
  // ==========================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase();

      const admission =
        getAdmissionNumber(student).toLowerCase();

      const className =
        getClassName(student).toLowerCase();

      return (
        name.includes(query) ||
        admission.includes(query) ||
        className.includes(query)
      );
    });
  }, [students, search]);

  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudents.some(
        (id) =>
          String(id) ===
          String(getStudentId(student))
      )
    );

  const handleSelectAll = (checked) => {
    if (checked) {
      const visibleIds = filteredStudents
        .map((student) => getStudentId(student))
        .filter(Boolean);

      setSelectedStudents((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    } else {
      const visibleIds = new Set(
        filteredStudents.map((student) =>
          getStudentId(student)
        )
      );

      setSelectedStudents((previous) =>
        previous.filter(
          (id) => !visibleIds.has(id)
        )
      );
    }
  };

  // ==========================================================
  // SELECT ONE STUDENT
  // ==========================================================

  const handleSelectStudent = (
    studentId,
    checked
  ) => {
    if (checked) {
      setSelectedStudents((previous) => [
        ...new Set([
          ...previous,
          studentId,
        ]),
      ]);
    } else {
      setSelectedStudents((previous) =>
        previous.filter(
          (id) =>
            String(id) !== String(studentId)
        )
      );
    }
  };

  // ==========================================================
  // CLEAR MESSAGES
  // ==========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // LOAD PROMOTION TARGETS
  // ==========================================================

  const loadPromotionTargets = async () => {
    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    try {
      setLoadingPromotionTargets(true);
      setError("");
      setSuccess("");

      const firstStudentId =
        selectedStudents[0];

      const response = await api.get(
        ENDPOINTS.promotionEligibility(
          firstStudentId
        )
      );

      const data = response?.data || {};

      const targets =
        data?.target_classes ||
        data?.target_class_options ||
        data?.eligible_target_classes ||
        [];

      setPromotionTargets(targets);

      setSelectedTargetClass("");

      if (targets.length === 0) {
        setError(
          data?.detail ||
            "No promotion target classes are available for this student."
        );

        return;
      }

      setShowPromotionModal(true);
    } catch (err) {
      console.error(
        "Load promotion targets error:",
        err
      );

      setError(
        getBackendError(
          err,
          "Unable to load promotion target classes."
        )
      );
    } finally {
      setLoadingPromotionTargets(false);
    }
  };

  // ==========================================================
  // PROMOTE SELECTED STUDENTS
  // ==========================================================

  const handlePromoteSelected = async () => {
    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    if (!selectedTargetClass) {
      setError(
        "Please select a target class."
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      let successful = 0;
      let failed = 0;

      const failedStudents = [];

      for (const studentId of selectedStudents) {
        const student = students.find(
          (item) =>
            String(getStudentId(item)) ===
            String(studentId)
        );

        const studentName = student
          ? getStudentName(student)
          : `Student ID ${studentId}`;

        try {
          await api.post(
            ENDPOINTS.promote,
            {
              student_id: studentId,
              target_class_id:
                Number(selectedTargetClass),
            }
          );

          successful += 1;
        } catch (err) {
          failed += 1;

          failedStudents.push({
            name: studentName,
            reason: getBackendError(
              err,
              "Unable to promote this student."
            ),
          });

          console.error(
            `Failed to promote ${studentName}:`,
            err?.response?.data || err
          );
        }
      }

      setShowPromotionModal(false);

      if (successful > 0) {
        setSuccess(
          `${successful} student${
            successful === 1 ? "" : "s"
          } successfully promoted.`
        );
      }

      if (failed > 0) {
        const details =
          failedStudents
            .map(
              (item) =>
                `${item.name}: ${item.reason}`
            )
            .join(" | ");

        setError(
          `${failed} student${
            failed === 1 ? "" : "s"
          } could not be promoted. ${details}`
        );
      }

      setSelectedStudents([]);

      await loadStudents();
    } catch (err) {
      console.error(
        "Promote students error:",
        err
      );

      setError(
        getBackendError(
          err,
          "An error occurred while promoting students."
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================================
  // OPEN GRADUATION MODAL
  // ==========================================================

  const openGraduationModal = () => {
    clearMessages();

    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    if (!isSS3Class) {
      setError(
        "Graduation is only available for SS3 students."
      );
      return;
    }

    setShowGraduationModal(true);
  };

  // ==========================================================
  // GRADUATE SELECTED STUDENTS
  // ==========================================================

  const handleGraduateSelected = async () => {
    if (selectedStudents.length === 0) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    if (!isSS3Class) {
      setShowGraduationModal(false);

      setError(
        "Graduation is only available for SS3 students."
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      let successful = 0;
      let failed = 0;

      const failedStudents = [];

      for (const studentId of selectedStudents) {
        const student = students.find(
          (item) =>
            String(getStudentId(item)) ===
            String(studentId)
        );

        const studentName = student
          ? getStudentName(student)
          : `Student ID ${studentId}`;

        try {
          await api.post(
            ENDPOINTS.promote,
            {
              student_id: studentId,
            }
          );

          successful += 1;
        } catch (err) {
          failed += 1;

          failedStudents.push({
            name: studentName,
            reason: getBackendError(
              err,
              "Unable to graduate this student."
            ),
          });

          console.error(
            `Failed to graduate ${studentName}:`,
            err?.response?.data || err
          );
        }
      }

      setShowGraduationModal(false);

      if (successful > 0) {
        setSuccess(
          `${successful} student${
            successful === 1 ? "" : "s"
          } successfully graduated.`
        );
      }

      if (failed > 0) {
        const details =
          failedStudents
            .map(
              (item) =>
                `${item.name}: ${item.reason}`
            )
            .join(" | ");

        setError(
          `${failed} student${
            failed === 1 ? "" : "s"
          } could not be graduated. ${details}`
        );
      }

      setSelectedStudents([]);

      await loadStudents();
    } catch (err) {
      console.error(
        "Graduate students error:",
        err
      );

      setError(
        getBackendError(
          err,
          "An error occurred while graduating students."
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================================
  // SELECTED COUNT
  // ==========================================================

  const selectedCount = selectedStudents.length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                <GraduationCap
                  size={21}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <span className="text-sm font-semibold text-[var(--color-primary)]">
                Admission Officer
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Promotion & Graduation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Promote students to their next class or graduate
              eligible SS3 students in bulk.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-card)] px-4 py-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10">
              <Users
                size={18}
                className="text-[var(--color-secondary)]"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Selected
              </p>

              <p className="text-lg font-bold text-[var(--color-text)]">
                {selectedCount}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ================================================== */}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle2
                size={17}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Operation completed
              </p>

              <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* ERROR MESSAGE */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50">
              <AlertCircle
                size={17}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm leading-5 text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-600 transition hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* FILTER CARD */}
        {/* ================================================== */}

        <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <Layers3
                size={20}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Class Filters
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select the academic session, term, and class.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* SESSION */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Academic Session
              </label>

              <select
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  setSelectedTerm("");
                  setSelectedClass("");
                  setSelectedStudents([]);
                  clearMessages();
                }}
                disabled={loadingSessions}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
              >
                <option value="">
                  {loadingSessions
                    ? "Loading sessions..."
                    : "Select session"}
                </option>

                {sessions.map((session) => (
                  <option
                    key={getId(session)}
                    value={getId(session)}
                  >
                    {getName(session)}
                  </option>
                ))}
              </select>
            </div>

            {/* TERM */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Term
              </label>

              <select
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  setSelectedStudents([]);
                  clearMessages();
                }}
                disabled={
                  !selectedSession ||
                  loadingTerms
                }
                className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
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
                    {getName(term)}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Class
              </label>

              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudents([]);
                  clearMessages();
                }}
                disabled={loadingClasses}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
              >
                <option value="">
                  All Classes
                </option>

                {classes.map((classLevel) => (
                  <option
                    key={getId(classLevel)}
                    value={getId(classLevel)}
                  >
                    {getName(classLevel)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ACTION BAR */}
        {/* ================================================== */}

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="w-full lg:max-w-md">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search student or admission number..."
                  className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700"
                />
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadPromotionTargets}
                disabled={
                  selectedCount === 0 ||
                  processing ||
                  loadingPromotionTargets
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingPromotionTargets ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronRight size={17} />
                    Promote Selected
                  </>
                )}
              </button>

              {isSS3Class && (
                <button
                  type="button"
                  onClick={openGraduationModal}
                  disabled={
                    selectedCount === 0 ||
                    processing
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <GraduationCap size={18} />
                  Graduate Selected
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 px-2 text-sm font-bold text-[var(--color-primary)]">
              {selectedCount}
            </div>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedCount > 0
                ? `student${selectedCount === 1 ? "" : "s"} selected`
                : "No students selected"}
            </span>
          </div>
        </div>

        {/* ================================================== */}
        {/* STUDENTS TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Students
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredStudents.length} student
                {filteredStudents.length === 1
                  ? ""
                  : "s"}{" "}
                displayed
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-secondary)]/10">
              <Users
                size={19}
                className="text-[var(--color-secondary)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="w-12 px-5 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) =>
                        handleSelectAll(
                          e.target.checked
                        )
                      }
                      disabled={
                        filteredStudents.length === 0
                      }
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Admission No.
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Class
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingStudents ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
                          Loading students...
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Please wait while enrollment data is loaded.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <Users
                            size={24}
                            className="text-slate-400"
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
                          No students found
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                          No student enrollments match the
                          selected session, term, class, or search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const studentId =
                      getStudentId(student);

                    const isSelected =
                      selectedStudents.some(
                        (id) =>
                          String(id) ===
                          String(studentId)
                      );

                    return (
                      <tr
                        key={studentId}
                        className={`transition ${
                          isSelected
                            ? "bg-[var(--color-primary)]/5"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectStudent(
                                studentId,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                              {getStudentName(student)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="font-semibold text-[var(--color-text)]">
                                {getStudentName(student)}
                              </div>

                              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Student
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {getAdmissionNumber(student)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-secondary)]">
                            {getClassName(student)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================================== */}
        {/* PROMOTION MODAL */}
        {/* ================================================== */}

        {showPromotionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-2xl ring-1 ring-white/10">

              <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                      <ChevronRight
                        size={21}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">
                        Bulk Promotion
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[var(--color-text)]">
                        Promote Students
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Select the target class for the selected
                        students.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPromotionModal(false)
                    }
                    disabled={processing}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Target Class
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Choose where these students should be moved.
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {selectedCount} selected
                  </span>
                </div>

                {promotionTargets.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                    No promotion targets are available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {promotionTargets.map((target) => {
                      const targetId = getId(target);

                      const targetName =
                        getName(target) ||
                        target?.class_level_name ||
                        target?.class_name ||
                        `Class ${targetId}`;

                      const selected =
                        String(
                          selectedTargetClass
                        ) === String(targetId);

                      return (
                        <button
                          key={targetId}
                          type="button"
                          onClick={() =>
                            setSelectedTargetClass(
                              String(targetId)
                            )
                          }
                          className={`group rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20"
                              : "border-slate-200 bg-[var(--color-background)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-[var(--color-text)]">
                                {targetName}
                              </div>

                              {target?.education_level && (
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {target.education_level}
                                </div>
                              )}

                              {target?.department_name && (
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {target.department_name}
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                                selected
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                              }`}
                            >
                              {selected && (
                                <Check size={17} />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowPromotionModal(false)
                    }
                    disabled={processing}
                    className="rounded-2xl border border-slate-200 bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handlePromoteSelected}
                    disabled={
                      processing ||
                      !selectedTargetClass ||
                      promotionTargets.length === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ChevronRight size={17} />
                        Promote Students
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* GRADUATION MODAL */}
        {/* ================================================== */}

        {showGraduationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-2xl ring-1 ring-white/10">

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-secondary)]/10">
                    <GraduationCap
                      size={23}
                      className="text-[var(--color-secondary)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowGraduationModal(false)
                    }
                    disabled={processing}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800"
                  >
                    <X size={19} />
                  </button>
                </div>

                <h2 className="mt-5 text-xl font-bold text-[var(--color-text)]">
                  Graduate Students
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  You are about to graduate{" "}
                  <span className="font-bold text-[var(--color-text)]">
                    {selectedCount}
                  </span>{" "}
                  student
                  {selectedCount === 1
                    ? ""
                    : "s"}{" "}
                  from SS3.
                </p>

                <div className="mt-5 rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-secondary)]"
                    />

                    <p className="text-sm leading-5 text-[var(--color-text)]">
                      Graduated students will no longer have
                      an active enrollment for the next
                      academic session.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowGraduationModal(false)
                    }
                    disabled={processing}
                    className="rounded-2xl border border-slate-200 bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleGraduateSelected}
                    disabled={processing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <GraduationCap size={18} />
                        Graduate Students
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import api from "../../services/api";

// // ============================================================
// // API ENDPOINTS
// // ============================================================

// const ENDPOINTS = {
//   sessions: "/academics/sessions/",
//   terms: "/academics/terms/",
//   classes: "/academics/class-levels/",
//   enrollments: "/students/enrollments/",

//   promotionEligibility: (studentId) =>
//     `/students/enrollments/${studentId}/promotion/`,

//   promote: "/students/enrollments/promote/",
// };

// // ============================================================
// // HELPERS
// // ============================================================

// const getArray = (response) => {
//   if (Array.isArray(response?.data)) {
//     return response.data;
//   }

//   if (Array.isArray(response?.data?.results)) {
//     return response.data.results;
//   }

//   return [];
// };

// const getId = (item) => {
//   return item?.id ?? item?.value ?? item?.pk;
// };

// const getName = (item) => {
//   return (
//     item?.name ||
//     item?.title ||
//     item?.class_name ||
//     item?.session_name ||
//     item?.term_name ||
//     ""
//   );
// };

// const getStudentName = (enrollment) => {
//   const fullName =
//     enrollment?.student_name ||
//     enrollment?.student?.full_name ||
//     enrollment?.student?.name ||
//     enrollment?.student?.student_name ||
//     `${enrollment?.student?.first_name || ""} ${
//       enrollment?.student?.last_name || ""
//     }`.trim();

//   return fullName || "Unnamed Student";
// };

// const getStudentId = (enrollment) => {
//   if (typeof enrollment?.student === "number") {
//     return enrollment.student;
//   }

//   return enrollment?.student?.id || enrollment?.student_id;
// };

// const getAdmissionNumber = (enrollment) => {
//   return (
//     enrollment?.admission_number ||
//     enrollment?.student?.admission_number ||
//     enrollment?.admission_no ||
//     enrollment?.student?.admission_no ||
//     "—"
//   );
// };

// const getClassName = (enrollment) => {
//   return (
//     enrollment?.class_name ||
//     enrollment?.class_level_name ||
//     enrollment?.class_level?.name ||
//     "—"
//   );
// };

// const getBackendError = (
//   error,
//   fallback = "An unexpected error occurred."
// ) => {
//   const data = error?.response?.data;

//   if (!data) {
//     return fallback;
//   }

//   if (typeof data === "string") {
//     return data;
//   }

//   if (data.detail) {
//     return data.detail;
//   }

//   if (data.error) {
//     return data.error;
//   }

//   if (data.message) {
//     return data.message;
//   }

//   if (typeof data === "object") {
//     const messages = [];

//     Object.entries(data).forEach(([field, value]) => {
//       if (Array.isArray(value)) {
//         messages.push(`${field}: ${value.join(", ")}`);
//       } else if (typeof value === "string") {
//         messages.push(`${field}: ${value}`);
//       } else {
//         messages.push(`${field}: ${JSON.stringify(value)}`);
//       }
//     });

//     if (messages.length > 0) {
//       return messages.join(" | ");
//     }
//   }

//   return fallback;
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function AdmissionOfficerPromotion() {
//   // ==========================================================
//   // DATA STATES
//   // ==========================================================

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [students, setStudents] = useState([]);

//   // ==========================================================
//   // FILTER STATES
//   // ==========================================================

//   const [selectedSession, setSelectedSession] = useState("");
//   const [selectedTerm, setSelectedTerm] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");

//   const [search, setSearch] = useState("");

//   // ==========================================================
//   // SELECTION
//   // ==========================================================

//   const [selectedStudents, setSelectedStudents] = useState([]);

//   // ==========================================================
//   // UI STATES
//   // ==========================================================

//   const [loadingSessions, setLoadingSessions] = useState(false);
//   const [loadingTerms, setLoadingTerms] = useState(false);
//   const [loadingClasses, setLoadingClasses] = useState(false);
//   const [loadingStudents, setLoadingStudents] = useState(false);

//   const [processing, setProcessing] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ==========================================================
//   // MODALS
//   // ==========================================================

//   const [showPromotionModal, setShowPromotionModal] = useState(false);
//   const [showGraduationModal, setShowGraduationModal] = useState(false);

//   // ==========================================================
//   // PROMOTION
//   // ==========================================================

//   const [promotionTargets, setPromotionTargets] = useState([]);
//   const [selectedTargetClass, setSelectedTargetClass] = useState("");

//   const [loadingPromotionTargets, setLoadingPromotionTargets] =
//     useState(false);

//   // ==========================================================
//   // LOAD SESSIONS
//   // ==========================================================

//   useEffect(() => {
//     loadSessions();
//   }, []);

//   const loadSessions = async () => {
//     try {
//       setLoadingSessions(true);
//       setError("");

//       const response = await api.get(ENDPOINTS.sessions);

//       const data = getArray(response);

//       setSessions(data);

//       if (data.length > 0) {
//         const currentSession =
//           data.find(
//             (item) =>
//               item.is_current === true ||
//               item.current === true
//           ) || data[0];

//         setSelectedSession(String(getId(currentSession)));
//       }
//     } catch (err) {
//       console.error("Load sessions error:", err);

//       setError(
//         getBackendError(
//           err,
//           "Unable to load academic sessions."
//         )
//       );
//     } finally {
//       setLoadingSessions(false);
//     }
//   };

//   // ==========================================================
//   // LOAD TERMS WHEN SESSION CHANGES
//   // ==========================================================

//   useEffect(() => {
//     if (!selectedSession) {
//       setTerms([]);
//       setSelectedTerm("");
//       return;
//     }

//     loadTerms(selectedSession);
//   }, [selectedSession]);

//   const loadTerms = async (sessionId) => {
//     try {
//       setLoadingTerms(true);
//       setError("");

//       const response = await api.get(ENDPOINTS.terms, {
//         params: {
//           academic_session: sessionId,
//         },
//       });

//       const data = getArray(response);

//       setTerms(data);

//       if (data.length > 0) {
//         const currentTerm =
//           data.find(
//             (item) =>
//               item.is_current === true ||
//               item.current === true ||
//               item.active === true
//           ) || data[0];

//         setSelectedTerm(String(getId(currentTerm)));
//       } else {
//         setSelectedTerm("");
//       }
//     } catch (err) {
//       console.error("Load terms error:", err);

//       setTerms([]);
//       setSelectedTerm("");

//       setError(
//         getBackendError(err, "Unable to load terms.")
//       );
//     } finally {
//       setLoadingTerms(false);
//     }
//   };

//   // ==========================================================
//   // LOAD CLASSES
//   // ==========================================================

//   useEffect(() => {
//     loadClasses();
//   }, []);

//   const loadClasses = async () => {
//     try {
//       setLoadingClasses(true);

//       const response = await api.get(ENDPOINTS.classes);

//       const data = getArray(response);

//       const activeClasses = data.filter(
//         (item) => item.active !== false
//       );

//       setClasses(activeClasses);
//     } catch (err) {
//       console.error("Load classes error:", err);

//       setClasses([]);

//       setError(
//         getBackendError(err, "Unable to load classes.")
//       );
//     } finally {
//       setLoadingClasses(false);
//     }
//   };

//   // ==========================================================
//   // CHECK WHETHER CURRENT CLASS IS SS3
//   // ==========================================================

//   const isSS3Class = useMemo(() => {
//     const currentClass = classes.find(
//       (item) =>
//         String(getId(item)) === String(selectedClass)
//     );

//     if (!currentClass) {
//       return false;
//     }

//     const className = getName(currentClass).toUpperCase();

//     return className.includes("SS3");
//   }, [classes, selectedClass]);

//   // ==========================================================
//   // LOAD STUDENTS / ENROLLMENTS
//   // ==========================================================

//   useEffect(() => {
//     if (!selectedSession || !selectedTerm) {
//       setStudents([]);
//       return;
//     }

//     loadStudents();
//   }, [selectedSession, selectedTerm, selectedClass]);

//   const loadStudents = async () => {
//     try {
//       setLoadingStudents(true);
//       setError("");

//       const params = {
//         academic_session: selectedSession,
//         term: selectedTerm,
//       };

//       if (selectedClass) {
//         params.class_level = selectedClass;
//       }

//       const response = await api.get(
//         ENDPOINTS.enrollments,
//         {
//           params,
//         }
//       );

//       let data = getArray(response);

//       data = data.filter((enrollment) => {
//         const sessionId =
//           enrollment?.academic_session?.id ||
//           enrollment?.academic_session_id ||
//           enrollment?.session_id;

//         const termId =
//           enrollment?.term?.id ||
//           enrollment?.term_id;

//         const classId =
//           enrollment?.class_level?.id ||
//           enrollment?.class_level_id;

//         const sessionMatches =
//           !sessionId ||
//           String(sessionId) === String(selectedSession);

//         const termMatches =
//           !termId ||
//           String(termId) === String(selectedTerm);

//         const classMatches =
//           !selectedClass ||
//           !classId ||
//           String(classId) === String(selectedClass);

//         return (
//           sessionMatches &&
//           termMatches &&
//           classMatches
//         );
//       });

//       setStudents(data);

//       setSelectedStudents((previous) =>
//         previous.filter((studentId) =>
//           data.some(
//             (student) =>
//               String(getStudentId(student)) ===
//               String(studentId)
//           )
//         )
//       );
//     } catch (err) {
//       console.error("Load students error:", err);

//       setStudents([]);

//       setError(
//         getBackendError(
//           err,
//           "Unable to load student enrollments."
//         )
//       );
//     } finally {
//       setLoadingStudents(false);
//     }
//   };

//   // ==========================================================
//   // FILTERED STUDENTS
//   // ==========================================================

//   const filteredStudents = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) {
//       return students;
//     }

//     return students.filter((student) => {
//       const name = getStudentName(student).toLowerCase();
//       const admission =
//         getAdmissionNumber(student).toLowerCase();
//       const className =
//         getClassName(student).toLowerCase();

//       return (
//         name.includes(query) ||
//         admission.includes(query) ||
//         className.includes(query)
//       );
//     });
//   }, [students, search]);

//   // ==========================================================
//   // SELECT ALL
//   // ==========================================================

//   const allVisibleSelected =
//     filteredStudents.length > 0 &&
//     filteredStudents.every((student) =>
//       selectedStudents.some(
//         (id) =>
//           String(id) ===
//           String(getStudentId(student))
//       )
//     );

//   const handleSelectAll = (checked) => {
//     if (checked) {
//       const visibleIds = filteredStudents
//         .map((student) => getStudentId(student))
//         .filter(Boolean);

//       setSelectedStudents((previous) => [
//         ...new Set([
//           ...previous,
//           ...visibleIds,
//         ]),
//       ]);
//     } else {
//       const visibleIds = new Set(
//         filteredStudents.map((student) =>
//           getStudentId(student)
//         )
//       );

//       setSelectedStudents((previous) =>
//         previous.filter(
//           (id) => !visibleIds.has(id)
//         )
//       );
//     }
//   };

//   // ==========================================================
//   // SELECT ONE STUDENT
//   // ==========================================================

//   const handleSelectStudent = (
//     studentId,
//     checked
//   ) => {
//     if (checked) {
//       setSelectedStudents((previous) => [
//         ...new Set([
//           ...previous,
//           studentId,
//         ]),
//       ]);
//     } else {
//       setSelectedStudents((previous) =>
//         previous.filter(
//           (id) =>
//             String(id) !== String(studentId)
//         )
//       );
//     }
//   };

//   // ==========================================================
//   // CLEAR MESSAGES
//   // ==========================================================

//   const clearMessages = () => {
//     setError("");
//     setSuccess("");
//   };

//   // ==========================================================
//   // LOAD PROMOTION TARGETS
//   // ==========================================================

//   const loadPromotionTargets = async () => {
//     if (selectedStudents.length === 0) {
//       setError(
//         "Please select at least one student."
//       );
//       return;
//     }

//     try {
//       setLoadingPromotionTargets(true);
//       setError("");
//       setSuccess("");

//       const firstStudentId =
//         selectedStudents[0];

//       const response = await api.get(
//         ENDPOINTS.promotionEligibility(
//           firstStudentId
//         )
//       );

//       const data = response?.data || {};

//       const targets =
//         data?.target_classes ||
//         data?.target_class_options ||
//         data?.eligible_target_classes ||
//         [];

//       setPromotionTargets(targets);

//       setSelectedTargetClass("");

//       if (targets.length === 0) {
//         setError(
//           data?.detail ||
//             "No promotion target classes are available for this student."
//         );

//         return;
//       }

//       setShowPromotionModal(true);
//     } catch (err) {
//       console.error(
//         "Load promotion targets error:",
//         err
//       );

//       setError(
//         getBackendError(
//           err,
//           "Unable to load promotion target classes."
//         )
//       );
//     } finally {
//       setLoadingPromotionTargets(false);
//     }
//   };

//   // ==========================================================
//   // PROMOTE SELECTED STUDENTS
//   // ==========================================================

//   const handlePromoteSelected = async () => {
//     if (selectedStudents.length === 0) {
//       setError(
//         "Please select at least one student."
//       );
//       return;
//     }

//     if (!selectedTargetClass) {
//       setError(
//         "Please select a target class."
//       );
//       return;
//     }

//     try {
//       setProcessing(true);
//       setError("");
//       setSuccess("");

//       let successful = 0;
//       let failed = 0;

//       const failedStudents = [];

//       for (const studentId of selectedStudents) {
//         const student = students.find(
//           (item) =>
//             String(getStudentId(item)) ===
//             String(studentId)
//         );

//         const studentName = student
//           ? getStudentName(student)
//           : `Student ID ${studentId}`;

//         try {
//           await api.post(
//             ENDPOINTS.promote,
//             {
//               student_id: studentId,
//               target_class_id:
//                 Number(selectedTargetClass),
//             }
//           );

//           successful += 1;
//         } catch (err) {
//           failed += 1;

//           failedStudents.push({
//             name: studentName,
//             reason: getBackendError(
//               err,
//               "Unable to promote this student."
//             ),
//           });

//           console.error(
//             `Failed to promote ${studentName}:`,
//             err?.response?.data || err
//           );
//         }
//       }

//       setShowPromotionModal(false);

//       if (successful > 0) {
//         setSuccess(
//           `${successful} student${
//             successful === 1 ? "" : "s"
//           } successfully promoted.`
//         );
//       }

//       if (failed > 0) {
//         const details =
//           failedStudents
//             .map(
//               (item) =>
//                 `${item.name}: ${item.reason}`
//             )
//             .join(" | ");

//         setError(
//           `${failed} student${
//             failed === 1 ? "" : "s"
//           } could not be promoted. ${details}`
//         );
//       }

//       setSelectedStudents([]);

//       await loadStudents();
//     } catch (err) {
//       console.error(
//         "Promote students error:",
//         err
//       );

//       setError(
//         getBackendError(
//           err,
//           "An error occurred while promoting students."
//         )
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ==========================================================
//   // OPEN GRADUATION MODAL
//   // ==========================================================

//   const openGraduationModal = () => {
//     clearMessages();

//     if (selectedStudents.length === 0) {
//       setError(
//         "Please select at least one student."
//       );
//       return;
//     }

//     if (!isSS3Class) {
//       setError(
//         "Graduation is only available for SS3 students."
//       );
//       return;
//     }

//     setShowGraduationModal(true);
//   };

//   // ==========================================================
//   // GRADUATE SELECTED STUDENTS
//   // ==========================================================

//   const handleGraduateSelected = async () => {
//     if (selectedStudents.length === 0) {
//       setError(
//         "Please select at least one student."
//       );
//       return;
//     }

//     if (!isSS3Class) {
//       setShowGraduationModal(false);

//       setError(
//         "Graduation is only available for SS3 students."
//       );

//       return;
//     }

//     try {
//       setProcessing(true);
//       setError("");
//       setSuccess("");

//       let successful = 0;
//       let failed = 0;

//       const failedStudents = [];

//       for (const studentId of selectedStudents) {
//         const student = students.find(
//           (item) =>
//             String(getStudentId(item)) ===
//             String(studentId)
//         );

//         const studentName = student
//           ? getStudentName(student)
//           : `Student ID ${studentId}`;

//         try {
//           await api.post(
//             ENDPOINTS.promote,
//             {
//               student_id: studentId,
//             }
//           );

//           successful += 1;
//         } catch (err) {
//           failed += 1;

//           failedStudents.push({
//             name: studentName,
//             reason: getBackendError(
//               err,
//               "Unable to graduate this student."
//             ),
//           });

//           console.error(
//             `Failed to graduate ${studentName}:`,
//             err?.response?.data || err
//           );
//         }
//       }

//       setShowGraduationModal(false);

//       if (successful > 0) {
//         setSuccess(
//           `${successful} student${
//             successful === 1 ? "" : "s"
//           } successfully graduated.`
//         );
//       }

//       if (failed > 0) {
//         const details =
//           failedStudents
//             .map(
//               (item) =>
//                 `${item.name}: ${item.reason}`
//             )
//             .join(" | ");

//         setError(
//           `${failed} student${
//             failed === 1 ? "" : "s"
//           } could not be graduated. ${details}`
//         );
//       }

//       setSelectedStudents([]);

//       await loadStudents();
//     } catch (err) {
//       console.error(
//         "Graduate students error:",
//         err
//       );

//       setError(
//         getBackendError(
//           err,
//           "An error occurred while graduating students."
//         )
//       );
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ==========================================================
//   // SELECTED COUNT
//   // ==========================================================

//   const selectedCount = selectedStudents.length;

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="space-y-6">

//       {/* HEADER */}

//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">
//           Promotion & Graduation
//         </h1>

//         <p className="mt-1 text-sm text-gray-500">
//           Promote or graduate students in bulk.
//         </p>
//       </div>

//       {/* SUCCESS */}

//       {success && (
//         <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//           <div className="flex items-start justify-between gap-4">
//             <span>{success}</span>

//             <button
//               type="button"
//               onClick={() => setSuccess("")}
//               className="font-bold text-green-700 hover:text-green-900"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ERROR */}

//       {error && (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           <div className="flex items-start justify-between gap-4">
//             <span>{error}</span>

//             <button
//               type="button"
//               onClick={() => setError("")}
//               className="font-bold text-red-700 hover:text-red-900"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* FILTER CARD */}

//       <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

//         <div className="mb-4">
//           <h2 className="text-base font-semibold text-gray-900">
//             Class Filters
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             Select the academic session, term, and class.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

//           <div>
//             <label className="mb-1 block text-sm font-medium text-gray-700">
//               Academic Session
//             </label>

//             <select
//               value={selectedSession}
//               onChange={(e) => {
//                 setSelectedSession(e.target.value);
//                 setSelectedTerm("");
//                 setSelectedClass("");
//                 setSelectedStudents([]);
//                 clearMessages();
//               }}
//               disabled={loadingSessions}
//               className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
//             >
//               <option value="">
//                 {loadingSessions
//                   ? "Loading sessions..."
//                   : "Select session"}
//               </option>

//               {sessions.map((session) => (
//                 <option
//                   key={getId(session)}
//                   value={getId(session)}
//                 >
//                   {getName(session)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-medium text-gray-700">
//               Term
//             </label>

//             <select
//               value={selectedTerm}
//               onChange={(e) => {
//                 setSelectedTerm(e.target.value);
//                 setSelectedStudents([]);
//                 clearMessages();
//               }}
//               disabled={
//                 !selectedSession ||
//                 loadingTerms
//               }
//               className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
//             >
//               <option value="">
//                 {loadingTerms
//                   ? "Loading terms..."
//                   : "Select term"}
//               </option>

//               {terms.map((term) => (
//                 <option
//                   key={getId(term)}
//                   value={getId(term)}
//                 >
//                   {getName(term)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-medium text-gray-700">
//               Class
//             </label>

//             <select
//               value={selectedClass}
//               onChange={(e) => {
//                 setSelectedClass(e.target.value);
//                 setSelectedStudents([]);
//                 clearMessages();
//               }}
//               disabled={loadingClasses}
//               className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
//             >
//               <option value="">
//                 All Classes
//               </option>

//               {classes.map((classLevel) => (
//                 <option
//                   key={getId(classLevel)}
//                   value={getId(classLevel)}
//                 >
//                   {getName(classLevel)}
//                 </option>
//               ))}
//             </select>
//           </div>

//         </div>
//       </div>

//       {/* ACTION BAR */}

//       <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//           <div className="w-full lg:max-w-md">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search student or admission number..."
//               className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
//             />
//           </div>

//           <div className="flex flex-wrap gap-2">

//             <button
//               type="button"
//               onClick={loadPromotionTargets}
//               disabled={
//                 selectedCount === 0 ||
//                 processing ||
//                 loadingPromotionTargets
//               }
//               className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {loadingPromotionTargets
//                 ? "Loading..."
//                 : "Promote Selected"}
//             </button>

//             {isSS3Class && (
//               <button
//                 type="button"
//                 onClick={openGraduationModal}
//                 disabled={
//                   selectedCount === 0 ||
//                   processing
//                 }
//                 className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Graduate Selected
//               </button>
//             )}

//           </div>
//         </div>

//         <div className="mt-3 text-sm text-gray-500">
//           {selectedCount > 0 ? (
//             <span>
//               <span className="font-semibold text-purple-600">
//                 {selectedCount}
//               </span>{" "}
//               student
//               {selectedCount === 1
//                 ? ""
//                 : "s"}{" "}
//               selected
//             </span>
//           ) : (
//             "No students selected"
//           )}
//         </div>
//       </div>

//       {/* STUDENTS TABLE */}

//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

//         <div className="overflow-x-auto">

//           <table className="min-w-full divide-y divide-gray-200">

//             <thead className="bg-gray-50">
//               <tr>

//                 <th className="w-12 px-4 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={allVisibleSelected}
//                     onChange={(e) =>
//                       handleSelectAll(
//                         e.target.checked
//                       )
//                     }
//                     disabled={
//                       filteredStudents.length === 0
//                     }
//                     className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                   />
//                 </th>

//                 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                   Student
//                 </th>

//                 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                   Admission No.
//                 </th>

//                 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                   Class
//                 </th>

//                 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                   Status
//                 </th>

//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-100 bg-white">

//               {loadingStudents ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="px-4 py-12 text-center text-sm text-gray-500"
//                   >
//                     Loading students...
//                   </td>
//                 </tr>
//               ) : filteredStudents.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="px-4 py-12 text-center text-sm text-gray-500"
//                   >
//                     No students found for the selected filters.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredStudents.map((student) => {
//                   const studentId =
//                     getStudentId(student);

//                   const isSelected =
//                     selectedStudents.some(
//                       (id) =>
//                         String(id) ===
//                         String(studentId)
//                     );

//                   return (
//                     <tr
//                       key={studentId}
//                       className={`transition hover:bg-gray-50 ${
//                         isSelected
//                           ? "bg-purple-50"
//                           : ""
//                       }`}
//                     >

//                       <td className="px-4 py-3">
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={(e) =>
//                             handleSelectStudent(
//                               studentId,
//                               e.target.checked
//                             )
//                           }
//                           className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                         />
//                       </td>

//                       <td className="px-4 py-3">
//                         <div className="font-medium text-gray-900">
//                           {getStudentName(student)}
//                         </div>
//                       </td>

//                       <td className="px-4 py-3 text-sm text-gray-600">
//                         {getAdmissionNumber(student)}
//                       </td>

//                       <td className="px-4 py-3 text-sm text-gray-600">
//                         {getClassName(student)}
//                       </td>

//                       <td className="px-4 py-3">
//                         <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
//                           Active
//                         </span>
//                       </td>

//                     </tr>
//                   );
//                 })
//               )}

//             </tbody>
//           </table>

//         </div>
//       </div>

//       {/* PROMOTION MODAL */}

//       {showPromotionModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

//           <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

//             <h2 className="text-xl font-bold text-gray-900">
//               Promote Students
//             </h2>

//             <p className="mt-2 text-sm text-gray-600">
//               Select the target class for the selected
//               students.
//             </p>

//             {promotionTargets.length === 0 ? (
//               <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
//                 No promotion targets are available.
//               </div>
//             ) : (
//               <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

//                 {promotionTargets.map((target) => {
//                   const targetId = getId(target);

//                   const targetName =
//                     getName(target) ||
//                     target?.class_level_name ||
//                     target?.class_name ||
//                     `Class ${targetId}`;

//                   const selected =
//                     String(
//                       selectedTargetClass
//                     ) === String(targetId);

//                   return (
//                     <button
//                       key={targetId}
//                       type="button"
//                       onClick={() =>
//                         setSelectedTargetClass(
//                           String(targetId)
//                         )
//                       }
//                       className={`rounded-xl border p-4 text-left transition ${
//                         selected
//                           ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
//                           : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       <div className="font-semibold text-gray-900">
//                         {targetName}
//                       </div>

//                       {target?.education_level && (
//                         <div className="mt-1 text-xs text-gray-500">
//                           {target.education_level}
//                         </div>
//                       )}

//                       {target?.department_name && (
//                         <div className="mt-1 text-xs text-gray-500">
//                           {target.department_name}
//                         </div>
//                       )}
//                     </button>
//                   );
//                 })}

//               </div>
//             )}

//             <div className="mt-6 flex justify-end gap-3">

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowPromotionModal(false)
//                 }
//                 disabled={processing}
//                 className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handlePromoteSelected}
//                 disabled={
//                   processing ||
//                   !selectedTargetClass ||
//                   promotionTargets.length === 0
//                 }
//                 className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {processing
//                   ? "Processing..."
//                   : "Promote Students"}
//               </button>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* GRADUATION MODAL */}

//       {showGraduationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

//           <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
//               🎓
//             </div>

//             <h2 className="mt-4 text-xl font-bold text-gray-900">
//               Graduate Students
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-gray-600">
//               You are about to graduate{" "}
//               <span className="font-semibold text-gray-900">
//                 {selectedCount}
//               </span>{" "}
//               student
//               {selectedCount === 1
//                 ? ""
//                 : "s"}{" "}
//               from SS3.
//             </p>

//             <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
//               Graduated students will no longer have
//               an active enrollment for the next
//               academic session.
//             </div>

//             <div className="mt-6 flex justify-end gap-3">

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowGraduationModal(false)
//                 }
//                 disabled={processing}
//                 className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleGraduateSelected}
//                 disabled={processing}
//                 className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
//               >
//                 {processing
//                   ? "Processing..."
//                   : "Graduate Students"}
//               </button>

//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }