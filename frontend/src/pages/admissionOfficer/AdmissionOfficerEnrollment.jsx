import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  School,
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
  continueTerm: "/students/enrollments/continue-term/",
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

  return (
    enrollment?.student?.id ||
    enrollment?.student_id
  );
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

    Object.entries(data).forEach(
      ([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(
            `${field}: ${value.join(", ")}`
          );
        } else if (
          typeof value === "string"
        ) {
          messages.push(
            `${field}: ${value}`
          );
        } else {
          messages.push(
            `${field}: ${JSON.stringify(
              value
            )}`
          );
        }
      }
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
};

// ============================================================
// COMPONENT
// ============================================================

export default function AdmissionOfficerEnrollment() {
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

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedTerm, setSelectedTerm] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [search, setSearch] = useState("");

  // ==========================================================
  // SELECTION
  // ==========================================================

  const [selectedStudents, setSelectedStudents] =
    useState([]);

  // ==========================================================
  // UI STATES
  // ==========================================================

  const [loadingSessions, setLoadingSessions] =
    useState(false);

  const [loadingTerms, setLoadingTerms] =
    useState(false);

  const [loadingClasses, setLoadingClasses] =
    useState(false);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // MODAL
  // ==========================================================

  const [showContinueModal, setShowContinueModal] =
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

      const response = await api.get(
        ENDPOINTS.sessions
      );

      const data = getArray(response);

      setSessions(data);

      if (data.length > 0) {
        const currentSession =
          data.find(
            (item) =>
              item.is_current === true ||
              item.current === true
          ) || data[0];

        setSelectedSession(
          String(getId(currentSession))
        );
      }
    } catch (err) {
      console.error(
        "Load sessions error:",
        err
      );

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
  // LOAD TERMS
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

      const response = await api.get(
        ENDPOINTS.terms,
        {
          params: {
            academic_session: sessionId,
          },
        }
      );

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

        setSelectedTerm(
          String(getId(currentTerm))
        );
      } else {
        setSelectedTerm("");
      }
    } catch (err) {
      console.error(
        "Load terms error:",
        err
      );

      setTerms([]);
      setSelectedTerm("");

      setError(
        getBackendError(
          err,
          "Unable to load terms."
        )
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

      const response = await api.get(
        ENDPOINTS.classes
      );

      const data = getArray(response);

      const activeClasses = data.filter(
        (item) => item.active !== false
      );

      setClasses(activeClasses);
    } catch (err) {
      console.error(
        "Load classes error:",
        err
      );

      setClasses([]);

      setError(
        getBackendError(
          err,
          "Unable to load classes."
        )
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  // ==========================================================
  // TERM LOGIC
  // ==========================================================

  const selectedTermObject = useMemo(() => {
    return terms.find(
      (term) =>
        String(getId(term)) ===
        String(selectedTerm)
    );
  }, [terms, selectedTerm]);

  const selectedTermName = (
    getName(selectedTermObject) || ""
  ).toUpperCase();

  const isThirdTerm =
    selectedTermName.includes("THIRD") ||
    selectedTermName.includes("3RD") ||
    selectedTermName.includes("TERM 3");

  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  useEffect(() => {
    if (!selectedSession || !selectedTerm) {
      setStudents([]);
      return;
    }

    loadStudents();
  }, [
    selectedSession,
    selectedTerm,
    selectedClass,
  ]);

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

      data = data.filter(
        (enrollment) => {
          const sessionId =
            enrollment?.academic_session
              ?.id ||
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
            String(sessionId) ===
              String(selectedSession);

          const termMatches =
            !termId ||
            String(termId) ===
              String(selectedTerm);

          const classMatches =
            !selectedClass ||
            !classId ||
            String(classId) ===
              String(selectedClass);

          return (
            sessionMatches &&
            termMatches &&
            classMatches
          );
        }
      );

      setStudents(data);

      setSelectedStudents(
        (previous) =>
          previous.filter((studentId) =>
            data.some(
              (student) =>
                String(
                  getStudentId(student)
                ) === String(studentId)
            )
          )
      );
    } catch (err) {
      console.error(
        "Load students error:",
        err
      );

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
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(
      (student) => {
        const name =
          getStudentName(
            student
          ).toLowerCase();

        const admission =
          getAdmissionNumber(
            student
          ).toLowerCase();

        const className =
          getClassName(
            student
          ).toLowerCase();

        return (
          name.includes(query) ||
          admission.includes(query) ||
          className.includes(query)
        );
      }
    );
  }, [students, search]);

  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every(
      (student) =>
        selectedStudents.some(
          (id) =>
            String(id) ===
            String(
              getStudentId(student)
            )
        )
    );

  const handleSelectAll = (checked) => {
    if (checked) {
      const visibleIds =
        filteredStudents
          .map((student) =>
            getStudentId(student)
          )
          .filter(Boolean);

      setSelectedStudents(
        (previous) => [
          ...new Set([
            ...previous,
            ...visibleIds,
          ]),
        ]
      );
    } else {
      const visibleIds = new Set(
        filteredStudents.map(
          (student) =>
            getStudentId(student)
        )
      );

      setSelectedStudents(
        (previous) =>
          previous.filter(
            (id) =>
              !visibleIds.has(id)
          )
      );
    }
  };

  // ==========================================================
  // SELECT ONE
  // ==========================================================

  const handleSelectStudent = (
    studentId,
    checked
  ) => {
    if (checked) {
      setSelectedStudents(
        (previous) => [
          ...new Set([
            ...previous,
            studentId,
          ]),
        ]
      );
    } else {
      setSelectedStudents(
        (previous) =>
          previous.filter(
            (id) =>
              String(id) !==
              String(studentId)
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
  // OPEN CONTINUE MODAL
  // ==========================================================

  const openContinueModal = () => {
    clearMessages();

    if (isThirdTerm) {
      setError(
        "Students in Third Term must use the Promotion page instead."
      );
      return;
    }

    if (
      selectedStudents.length === 0
    ) {
      setError(
        "Please select at least one student."
      );
      return;
    }

    setShowContinueModal(true);
  };

  // ==========================================================
  // CONTINUE SELECTED STUDENTS
  // ==========================================================

  const handleContinueSelected =
    async () => {
      if (isThirdTerm) {
        setShowContinueModal(false);

        setError(
          "Students in Third Term cannot be continued. Please use the Promotion page."
        );

        return;
      }

      if (
        selectedStudents.length === 0
      ) {
        setError(
          "Please select at least one student."
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
          const student =
            students.find(
              (item) =>
                String(
                  getStudentId(item)
                ) ===
                String(studentId)
            );

          const studentName = student
            ? getStudentName(student)
            : `Student ID ${studentId}`;

          try {
            await api.post(
              ENDPOINTS.continueTerm,
              {
                student_id:
                  studentId,
              }
            );

            successful += 1;
          } catch (err) {
            failed += 1;

            const backendError =
              getBackendError(
                err,
                "Unable to continue this student."
              );

            failedStudents.push({
              name: studentName,
              studentId,
              reason: backendError,
            });

            console.error(
              `Failed to continue ${studentName}:`,
              err?.response?.data ||
                err
            );
          }
        }

        setShowContinueModal(false);

        if (successful > 0) {
          setSuccess(
            `${successful} student${
              successful === 1
                ? ""
                : "s"
            } successfully continued to the next term.`
          );
        }

        if (failed > 0) {
          const failureDetails =
            failedStudents
              .map(
                (item) =>
                  `${item.name}: ${item.reason}`
              )
              .join(" | ");

          setError(
            `${failed} student${
              failed === 1
                ? ""
                : "s"
            } could not be continued. ${failureDetails}`
          );
        }

        setSelectedStudents([]);

        await loadStudents();
      } catch (err) {
        console.error(
          "Continue students error:",
          err
        );

        setError(
          getBackendError(
            err,
            "An error occurred while continuing students."
          )
        );
      } finally {
        setProcessing(false);
      }
    };

  const selectedCount =
    selectedStudents.length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 transition-colors sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
              <GraduationCap
                size={14}
              />
              Student Enrollment
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Term Enrollment
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Continue students into the next
              academic term while keeping their
              enrollment records organized.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              loadStudents();
            }}
            disabled={
              loadingStudents ||
              !selectedSession ||
              !selectedTerm
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm ring-1 ring-slate-200 transition hover:ring-[var(--color-primary)]/40 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-slate-700"
          >
            <RefreshCw
              size={17}
              className={
                loadingStudents
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {success && (
          <MessageBox
            type="success"
            message={success}
            onClose={() =>
              setSuccess("")
            }
          />
        )}

        {error && (
          <MessageBox
            type="error"
            message={error}
            onClose={() =>
              setError("")
            }
          />
        )}

        {/* ====================================================
            FILTER CARD
        ==================================================== */}

        <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700/60">

          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <CalendarDays
                size={21}
              />
            </div>

            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Enrollment Filters
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select the academic session,
                term, and class.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <FilterSelect
              label="Academic Session"
              value={selectedSession}
              onChange={(value) => {
                setSelectedSession(
                  value
                );
                setSelectedTerm("");
                setSelectedClass("");
                setSelectedStudents([]);
                clearMessages();
              }}
              disabled={
                loadingSessions
              }
              loading={
                loadingSessions
              }
              placeholder="Select session"
              options={sessions}
            />

            <FilterSelect
              label="Term"
              value={selectedTerm}
              onChange={(value) => {
                setSelectedTerm(
                  value
                );
                setSelectedStudents([]);
                clearMessages();
              }}
              disabled={
                !selectedSession ||
                loadingTerms
              }
              loading={loadingTerms}
              placeholder="Select term"
              options={terms}
            />

            <FilterSelect
              label="Class"
              value={selectedClass}
              onChange={(value) => {
                setSelectedClass(
                  value
                );
                setSelectedStudents([]);
                clearMessages();
              }}
              disabled={
                loadingClasses
              }
              loading={loadingClasses}
              placeholder="All Classes"
              options={classes}
              allowEmpty
            />
          </div>

          {/* TERM INFORMATION */}

          {selectedTerm && (
            <div
              className={`mt-5 rounded-2xl border p-4 ${
                isThirdTerm
                  ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                  : "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isThirdTerm
                      ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                      : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  }`}
                >
                  <CalendarDays
                    size={18}
                  />
                </div>

                <div>
                  <p
                    className={`text-sm font-bold ${
                      isThirdTerm
                        ? "text-[var(--color-secondary)]"
                        : "text-[var(--color-primary)]"
                    }`}
                  >
                    {selectedTermName ||
                      "Selected Term"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {isThirdTerm
                      ? "Third Term students should be promoted on the Promotion page instead of continued here."
                      : "Students in this term can be continued to the next term."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
            ACTION CARD
        ==================================================== */}

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700/60">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search student or admission number..."
                className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 dark:border-slate-700 dark:bg-slate-900/50"
              />
            </div>

            {/* ACTION */}

            <button
              type="button"
              onClick={
                openContinueModal
              }
              disabled={
                selectedCount === 0 ||
                processing ||
                isThirdTerm
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight
                size={17}
              />
              Continue Term
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users size={16} />

            {selectedCount > 0 ? (
              <span>
                <span className="font-bold text-[var(--color-primary)]">
                  {selectedCount}
                </span>{" "}
                student
                {selectedCount === 1
                  ? ""
                  : "s"}{" "}
                selected
              </span>
            ) : (
              "No students selected"
            )}
          </div>
        </div>

        {/* ====================================================
            STUDENT TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700/60">

          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Students
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredStudents.length} student
                {filteredStudents.length ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            </div>

            {selectedClass && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-3 py-2 text-xs font-bold text-[var(--color-primary)]">
                <School size={14} />
                {getName(
                  classes.find(
                    (item) =>
                      String(
                        getId(item)
                      ) ===
                      String(
                        selectedClass
                      )
                  )
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-[var(--color-background)] dark:bg-slate-900/50">
                <tr>

                  <th className="w-14 px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        allVisibleSelected
                      }
                      onChange={(e) =>
                        handleSelectAll(
                          e.target
                            .checked
                        )
                      }
                      disabled={
                        filteredStudents.length ===
                        0
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] dark:border-slate-600"
                    />
                  </th>

                  <TableHeader>
                    Student
                  </TableHeader>

                  <TableHeader>
                    Admission No.
                  </TableHeader>

                  <TableHeader>
                    Class
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                {loadingStudents ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
                          <RefreshCw
                            size={22}
                            className="animate-spin text-[var(--color-primary)]"
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
                          Loading students...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <Users
                            size={24}
                            className="text-slate-400"
                          />
                        </div>

                        <p className="mt-4 text-sm font-bold text-[var(--color-text)]">
                          No students found
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          No students match the
                          selected filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(
                    (student) => {
                      const studentId =
                        getStudentId(
                          student
                        );

                      const isSelected =
                        selectedStudents.some(
                          (id) =>
                            String(
                              id
                            ) ===
                            String(
                              studentId
                            )
                        );

                      return (
                        <tr
                          key={
                            studentId
                          }
                          className={`transition ${
                            isSelected
                              ? "bg-[var(--color-primary)]/5"
                              : "hover:bg-[var(--color-background)] dark:hover:bg-slate-900/40"
                          }`}
                        >

                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={(
                                e
                              ) =>
                                handleSelectStudent(
                                  studentId,
                                  e
                                    .target
                                    .checked
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] dark:border-slate-600"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                                {getStudentName(
                                  student
                                )
                                  .split(
                                    " "
                                  )
                                  .map(
                                    (
                                      part
                                    ) =>
                                      part[0]
                                  )
                                  .join(
                                    ""
                                  )
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-[var(--color-text)]">
                                  {getStudentName(
                                    student
                                  )}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Student
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {getAdmissionNumber(
                              student
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {getClassName(
                              student
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* ====================================================
            CONTINUE MODAL
        ==================================================== */}

        {showContinueModal &&
          !isThirdTerm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">

                {/* MODAL HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <ArrowRight
                        size={21}
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-[var(--color-text)]">
                        Continue Students
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Confirm term continuation
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowContinueModal(
                        false
                      )
                    }
                    disabled={
                      processing
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* MODAL BODY */}

                <div className="p-6">

                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    You are about to continue{" "}
                    <span className="font-bold text-[var(--color-text)]">
                      {selectedCount}
                    </span>{" "}
                    student
                    {selectedCount ===
                    1
                      ? ""
                      : "s"}{" "}
                    to the next term.
                  </p>

                  <div className="mt-5 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />

                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Students will remain
                        in their current
                        class. Their active
                        subject enrollments
                        will also be copied
                        where applicable.
                      </p>
                    </div>
                  </div>

                  {/* MODAL ACTIONS */}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        setShowContinueModal(
                          false
                        )
                      }
                      disabled={
                        processing
                      }
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleContinueSelected
                      }
                      disabled={
                        processing
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          Students
                          <ArrowRight
                            size={17}
                          />
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

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  label,
  value,
  onChange,
  disabled,
  loading,
  placeholder,
  options,
  allowEmpty = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm font-medium text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50"
      >
        <option value="">
          {loading
            ? `Loading ${label.toLowerCase()}...`
            : placeholder}
        </option>

        {options.map((item) => (
          <option
            key={getId(item)}
            value={getId(item)}
          >
            {getName(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// TABLE HEADER
// ============================================================

function TableHeader({
  children,
}) {
  return (
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </th>
  );
}

// ============================================================
// MESSAGE BOX
// ============================================================

function MessageBox({
  type,
  message,
  onClose,
}) {
  const success = type === "success";

  return (
    <div
      className={`rounded-3xl border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30"
          : "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
      }`}
    >
      <div className="flex items-start gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            success
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
          }`}
        >
          {success ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertCircle size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              success
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {success
              ? "Enrollment Successful"
              : "Enrollment Error"}
          </p>

          <p
            className={`mt-1 text-sm leading-6 ${
              success
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-red-600 dark:text-red-300"
            }`}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-[var(--color-text)] dark:hover:bg-white/5"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}