
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

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

  // Django REST Framework validation errors
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

export default function PromotionEnrollment() {
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

  const [showContinueModal, setShowContinueModal] = useState(false);
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
  // TERM-AWARE LOGIC
  // ==========================================================

  const selectedTermObject = useMemo(() => {
    return terms.find(
      (term) =>
        String(getId(term)) === String(selectedTerm)
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

      // ======================================================
      // EXTRA FRONTEND FILTERING
      // ======================================================

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

      // Remove selected students that no longer exist
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
  // OPEN CONTINUE MODAL
  // ==========================================================

  const openContinueModal = () => {
    clearMessages();

    // Safety check:
    // Third Term must never use continue-term.
    if (isThirdTerm) {
      setError(
        "Students in Third Term must use the promotion workflow."
      );
      return;
    }

    if (selectedStudents.length === 0) {
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

  const handleContinueSelected = async () => {
    if (isThirdTerm) {
      setShowContinueModal(false);

      setError(
        "Students in Third Term cannot be continued. Please use Promote Selected."
      );

      return;
    }

    if (selectedStudents.length === 0) {
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

      // ======================================================
      // PROCESS EACH STUDENT
      // ======================================================

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
            ENDPOINTS.continueTerm,
            {
              student_id: studentId,
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
            err?.response?.data || err
          );
        }
      }

      setShowContinueModal(false);

      // ======================================================
      // SUCCESS MESSAGE
      // ======================================================

      if (successful > 0) {
        setSuccess(
          `${successful} student${
            successful === 1 ? "" : "s"
          } successfully continued to the next term.`
        );
      }

      // ======================================================
      // FAILURE MESSAGE
      // ======================================================

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
            failed === 1 ? "" : "s"
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

      // ======================================================
      // PROCESS EACH STUDENT
      // ======================================================

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

      // ======================================================
      // SUCCESS
      // ======================================================

      if (successful > 0) {
        setSuccess(
          `${successful} student${
            successful === 1 ? "" : "s"
          } successfully promoted.`
        );
      }

      // ======================================================
      // FAILURE
      // ======================================================

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

      // ======================================================
      // PROCESS EACH STUDENT
      // ======================================================

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

      // ======================================================
      // SUCCESS
      // ======================================================

      if (successful > 0) {
        setSuccess(
          `${successful} student${
            successful === 1 ? "" : "s"
          } successfully graduated.`
        );
      }

      // ======================================================
      // FAILURE
      // ======================================================

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

  const selectedCount =
    selectedStudents.length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Promotion & Enrollment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Continue, promote, or graduate students in bulk.
        </p>
      </div>

      {/* ====================================================
          SUCCESS MESSAGE
      ==================================================== */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="flex items-start justify-between gap-4">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          ERROR MESSAGE
      ==================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start justify-between gap-4">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          FILTER CARD
      ==================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Enrollment Filters
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the academic session, term, and class.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* SESSION */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
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

        {/* TERM INFORMATION */}

        {selectedTerm && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              isThirdTerm
                ? "border border-purple-200 bg-purple-50 text-purple-700"
                : "border border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <span className="font-semibold">
              {selectedTermName || "Selected Term"}
            </span>

            {isThirdTerm ? (
              <span>
                {" "}
                — Third Term students should be promoted
                rather than continued.
              </span>
            ) : (
              <span>
                {" "}
                — Students can continue to the next term.
              </span>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          ACTION BAR
      ==================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="w-full lg:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student or admission number..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex flex-wrap gap-2">

            {/* =================================================
                CONTINUE TERM

                IMPORTANT:
                Hidden during Third Term.
            ================================================= */}

            {!isThirdTerm && (
              <button
                type="button"
                onClick={openContinueModal}
                disabled={
                  selectedCount === 0 ||
                  processing
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue Term
              </button>
            )}

            {/* =================================================
                PROMOTE
            ================================================= */}

            <button
              type="button"
              onClick={loadPromotionTargets}
              disabled={
                selectedCount === 0 ||
                processing ||
                loadingPromotionTargets
              }
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPromotionTargets
                ? "Loading..."
                : "Promote Selected"}
            </button>

            {/* =================================================
                GRADUATE

                Only visible when a specific SS3 class
                is selected.
            ================================================= */}

            {isSS3Class && (
              <button
                type="button"
                onClick={openGraduationModal}
                disabled={
                  selectedCount === 0 ||
                  processing
                }
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Graduate Selected
              </button>
            )}

          </div>
        </div>

        {/* SELECTED COUNT */}

        <div className="mt-3 text-sm text-gray-500">
          {selectedCount > 0 ? (
            <span>
              <span className="font-semibold text-purple-600">
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
          STUDENTS TABLE
      ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">
              <tr>

                <th className="w-12 px-4 py-3 text-left">
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
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
                  Status
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">

              {loadingStudents ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No students found for the selected filters.
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
                      className={`transition hover:bg-gray-50 ${
                        isSelected
                          ? "bg-purple-50"
                          : ""
                      }`}
                    >

                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectStudent(
                              studentId,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {getStudentName(student)}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getAdmissionNumber(student)}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getClassName(student)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
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

      {/* ====================================================
          CONTINUE TERM MODAL
      ==================================================== */}

      {showContinueModal && !isThirdTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold text-gray-900">
              Continue Students
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You are about to continue{" "}
              <span className="font-semibold text-gray-900">
                {selectedCount}
              </span>{" "}
              student
              {selectedCount === 1
                ? ""
                : "s"}{" "}
              to the next term.
            </p>

            <div className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              Students will remain in their current
              class. Their active subject enrollments
              will also be copied where applicable.
            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowContinueModal(false)
                }
                disabled={processing}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleContinueSelected}
                disabled={processing}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : "Continue Students"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PROMOTION MODAL
      ==================================================== */}

      {showPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold text-gray-900">
              Promote Students
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Select the target class for the selected
              students.
            </p>

            {promotionTargets.length === 0 ? (
              <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
                No promotion targets are available.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

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
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {targetName}
                      </div>

                      {target?.education_level && (
                        <div className="mt-1 text-xs text-gray-500">
                          {target.education_level}
                        </div>
                      )}

                      {target?.department_name && (
                        <div className="mt-1 text-xs text-gray-500">
                          {target.department_name}
                        </div>
                      )}
                    </button>
                  );
                })}

              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowPromotionModal(false)
                }
                disabled={processing}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : "Promote Students"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          GRADUATION MODAL
      ==================================================== */}

      {showGraduationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
              🎓
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Graduate Students
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You are about to graduate{" "}
              <span className="font-semibold text-gray-900">
                {selectedCount}
              </span>{" "}
              student
              {selectedCount === 1
                ? ""
                : "s"}{" "}
              from SS3.
            </p>

            <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              Graduated students will no longer have
              an active enrollment for the next
              academic session.
            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowGraduationModal(false)
                }
                disabled={processing}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGraduateSelected}
                disabled={processing}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : "Graduate Students"}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

