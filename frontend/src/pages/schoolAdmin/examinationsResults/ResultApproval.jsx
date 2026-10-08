import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Square,
  UserCheck,
  XCircle,
} from "lucide-react";

import api from "../../../services/api";

import {
  getStudentResults,
  updateStudentResult,
} from "../../../services/resultsService";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const getArrayData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

const getStudentName = (result, studentsMap) => {
  if (result?.student_name) {
    return result.student_name;
  }

  const student = studentsMap[result?.student];

  if (!student) {
    return "Unknown Student";
  }

  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || student.name || "Unknown Student";
};

const getAdmissionNumber = (result, studentsMap) => {
  if (result?.student_admission_number) {
    return result.student_admission_number;
  }

  const student = studentsMap[result?.student];

  return (
    student?.admission_number ||
    student?.admissionNumber ||
    "—"
  );
};

const getSubjectName = (result, subjectsMap) => {
  if (result?.subject_name) {
    return result.subject_name;
  }

  const examinationSubject =
    subjectsMap[result?.examination_subject];

  return (
    examinationSubject?.subject_name ||
    examinationSubject?.subject?.name ||
    "Unknown Subject"
  );
};

const getExaminationName = (result, subjectsMap, examinationsMap) => {
  if (result?.examination_name) {
    return result.examination_name;
  }

  const examinationSubject =
    subjectsMap[result?.examination_subject];

  if (!examinationSubject) {
    return "Unknown Examination";
  }

  if (examinationSubject.examination_name) {
    return examinationSubject.examination_name;
  }

  const examination =
    examinationsMap[examinationSubject.examination];

  return examination?.name || "Unknown Examination";
};

const getSessionName = (
  result,
  subjectsMap,
  examinationsMap
) => {
  if (result?.academic_session_name) {
    return result.academic_session_name;
  }

  const examinationSubject =
    subjectsMap[result?.examination_subject];

  const examination =
    examinationsMap[examinationSubject?.examination];

  return (
    examination?.academic_session_name ||
    result?.session_name ||
    "—"
  );
};

const getTermName = (
  result,
  subjectsMap,
  examinationsMap
) => {
  if (result?.term_name) {
    return result.term_name;
  }

  const examinationSubject =
    subjectsMap[result?.examination_subject];

  const examination =
    examinationsMap[examinationSubject?.examination];

  return (
    examination?.term_name ||
    result?.term_name ||
    "—"
  );
};

const getClassName = (
  result,
  subjectsMap,
  examinationsMap
) => {
  if (result?.class_level_name) {
    return result.class_level_name;
  }

  const examinationSubject =
    subjectsMap[result?.examination_subject];

  const examination =
    examinationsMap[examinationSubject?.examination];

  return (
    examination?.class_level_name ||
    "—"
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function ResultApproval() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [filterSession, setFilterSession] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [
        resultsResponse,
        studentsResponse,
        examinationsResponse,
        examinationSubjectsResponse,
      ] = await Promise.all([
        getStudentResults(),
        api.get("/students/"),
        getExaminations(),
        getExaminationSubjects(),
      ]);

      setResults(getArrayData(resultsResponse));
      setStudents(getArrayData(studentsResponse));
      setExaminations(getArrayData(examinationsResponse));
      setExaminationSubjects(
        getArrayData(examinationSubjectsResponse)
      );

      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to load result approval data:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load results for approval."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // LOOKUP MAPS
  // ==========================================================

  const studentsMap = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      if (student?.id !== undefined) {
        map[student.id] = student;
      }
    });

    return map;
  }, [students]);

  const examinationsMap = useMemo(() => {
    const map = {};

    examinations.forEach((exam) => {
      if (exam?.id !== undefined) {
        map[exam.id] = exam;
      }
    });

    return map;
  }, [examinations]);

  const subjectsMap = useMemo(() => {
    const map = {};

    examinationSubjects.forEach((subject) => {
      if (subject?.id !== undefined) {
        map[subject.id] = subject;
      }
    });

    return map;
  }, [examinationSubjects]);

  // ==========================================================
  // ONLY UNPUBLISHED RESULTS
  // ==========================================================

  const pendingResults = useMemo(() => {
    return results.filter(
      (result) => result.is_published !== true
    );
  }, [results]);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const sessionOptions = useMemo(() => {
    const values = new Set();

    pendingResults.forEach((result) => {
      const value = getSessionName(
        result,
        subjectsMap,
        examinationsMap
      );

      if (value && value !== "—") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  }, [
    pendingResults,
    subjectsMap,
    examinationsMap,
  ]);

  const termOptions = useMemo(() => {
    const values = new Set();

    pendingResults.forEach((result) => {
      const value = getTermName(
        result,
        subjectsMap,
        examinationsMap
      );

      if (value && value !== "—") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  }, [
    pendingResults,
    subjectsMap,
    examinationsMap,
  ]);

  const examOptions = useMemo(() => {
    const values = new Set();

    pendingResults.forEach((result) => {
      const value = getExaminationName(
        result,
        subjectsMap,
        examinationsMap
      );

      if (value && value !== "Unknown Examination") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  }, [
    pendingResults,
    subjectsMap,
    examinationsMap,
  ]);

  const classOptions = useMemo(() => {
    const values = new Set();

    pendingResults.forEach((result) => {
      const value = getClassName(
        result,
        subjectsMap,
        examinationsMap
      );

      if (value && value !== "—") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  }, [
    pendingResults,
    subjectsMap,
    examinationsMap,
  ]);

  // ==========================================================
  // FILTERED RESULTS
  // ==========================================================

  const filteredResults = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return pendingResults.filter((result) => {
      const studentName = getStudentName(
        result,
        studentsMap
      );

      const admissionNumber = getAdmissionNumber(
        result,
        studentsMap
      );

      const subjectName = getSubjectName(
        result,
        subjectsMap
      );

      const examinationName = getExaminationName(
        result,
        subjectsMap,
        examinationsMap
      );

      const sessionName = getSessionName(
        result,
        subjectsMap,
        examinationsMap
      );

      const termName = getTermName(
        result,
        subjectsMap,
        examinationsMap
      );

      const className = getClassName(
        result,
        subjectsMap,
        examinationsMap
      );

      const matchesSearch =
        !searchValue ||
        studentName.toLowerCase().includes(searchValue) ||
        admissionNumber
          .toString()
          .toLowerCase()
          .includes(searchValue) ||
        subjectName.toLowerCase().includes(searchValue) ||
        examinationName.toLowerCase().includes(searchValue);

      const matchesSession =
        !filterSession ||
        sessionName === filterSession;

      const matchesTerm =
        !filterTerm ||
        termName === filterTerm;

      const matchesExam =
        !filterExam ||
        examinationName === filterExam;

      const matchesClass =
        !filterClass ||
        className === filterClass;

      return (
        matchesSearch &&
        matchesSession &&
        matchesTerm &&
        matchesExam &&
        matchesClass
      );
    });
  }, [
    pendingResults,
    studentsMap,
    subjectsMap,
    examinationsMap,
    search,
    filterSession,
    filterTerm,
    filterExam,
    filterClass,
  ]);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allVisibleSelected =
    filteredResults.length > 0 &&
    filteredResults.every((result) =>
      selectedIds.includes(result.id)
    );

  const toggleSelection = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (selectedId) => selectedId !== id
        );
      }

      return [...current, id];
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredResults.some(
              (result) => result.id === id
            )
        )
      );

      return;
    }

    const visibleIds = filteredResults.map(
      (result) => result.id
    );

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  };

  // ==========================================================
  // PUBLISH ONE RESULT
  // ==========================================================

  const publishResult = async (result) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await updateStudentResult(result.id, {
        is_published: true,
      });

      setResults((current) =>
        current.map((item) =>
          item.id === result.id
            ? {
                ...item,
                is_published: true,
              }
            : item
        )
      );

      setSelectedIds((current) =>
        current.filter((id) => id !== result.id)
      );

      setSuccess(
        "Result published successfully."
      );
    } catch (err) {
      console.error("Failed to publish result:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to publish result."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // PUBLISH SELECTED RESULTS
  // ==========================================================

  const publishSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await Promise.all(
        selectedIds.map((id) =>
          updateStudentResult(id, {
            is_published: true,
          })
        )
      );

      setResults((current) =>
        current.map((result) =>
          selectedIds.includes(result.id)
            ? {
                ...result,
                is_published: true,
              }
            : result
        )
      );

      const count = selectedIds.length;

      setSelectedIds([]);

      setSuccess(
        `${count} result${count === 1 ? "" : "s"} published successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to publish selected results:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to publish selected results."
      );

      // Refresh because some requests may have succeeded.
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setFilterSession("");
    setFilterTerm("");
    setFilterExam("");
    setFilterClass("");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-text">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading results for approval...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Result Approval
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review and publish student results.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading || actionLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">
              Success
            </p>

            <p className="text-sm mt-1">
              {success}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Approval
          </p>

          <p className="text-3xl font-bold mt-2">
            {pendingResults.length}
          </p>
        </div>

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing
          </p>

          <p className="text-3xl font-bold mt-2">
            {filteredResults.length}
          </p>
        </div>

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selected
          </p>

          <p className="text-3xl font-bold mt-2 text-primary">
            {selectedIds.length}
          </p>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {/* Search */}

          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student, admission number, subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Session */}

          <select
            value={filterSession}
            onChange={(event) =>
              setFilterSession(event.target.value)
            }
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              All Sessions
            </option>

            {sessionOptions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>

          {/* Term */}

          <select
            value={filterTerm}
            onChange={(event) =>
              setFilterTerm(event.target.value)
            }
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              All Terms
            </option>

            {termOptions.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>

          {/* Examination */}

          <select
            value={filterExam}
            onChange={(event) =>
              setFilterExam(event.target.value)
            }
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              All Examinations
            </option>

            {examOptions.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <select
            value={filterClass}
            onChange={(event) =>
              setFilterClass(event.target.value)
            }
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              All Classes
            </option>

            {classOptions.map((className) => (
              <option
                key={className}
                value={className}
              >
                {className}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ======================================================
          BULK ACTION BAR
      ====================================================== */}

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div>
            <p className="font-medium">
              {selectedIds.length} result
              {selectedIds.length === 1 ? "" : "s"} selected
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selected results will be published.
            </p>
          </div>

          <button
            type="button"
            onClick={publishSelected}
            disabled={actionLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}

            Publish Selected
          </button>
        </div>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />

            <h2 className="text-lg font-semibold">
              No Results Pending Approval
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              There are no unpublished results matching
              your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center"
                      title={
                        allVisibleSelected
                          ? "Deselect all"
                          : "Select all"
                      }
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Admission No.
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Examination
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Subject
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Session
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Term
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Class
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    CA
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Exam
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Total
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Grade
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => {
                  const studentName = getStudentName(
                    result,
                    studentsMap
                  );

                  const admissionNumber =
                    getAdmissionNumber(
                      result,
                      studentsMap
                    );

                  const examinationName =
                    getExaminationName(
                      result,
                      subjectsMap,
                      examinationsMap
                    );

                  const subjectName =
                    getSubjectName(
                      result,
                      subjectsMap
                    );

                  const sessionName =
                    getSessionName(
                      result,
                      subjectsMap,
                      examinationsMap
                    );

                  const termName =
                    getTermName(
                      result,
                      subjectsMap,
                      examinationsMap
                    );

                  const className =
                    getClassName(
                      result,
                      subjectsMap,
                      examinationsMap
                    );

                  const isSelected =
                    selectedIds.includes(result.id);

                  return (
                    <tr
                      key={result.id}
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                        isSelected
                          ? "bg-primary/5"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleSelection(result.id)
                          }
                          className="flex items-center justify-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Student */}

                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {studentName}
                        </div>
                      </td>

                      {/* Admission Number */}

                      <td className="px-4 py-4 text-sm">
                        {admissionNumber}
                      </td>

                      {/* Examination */}

                      <td className="px-4 py-4 text-sm">
                        {examinationName}
                      </td>

                      {/* Subject */}

                      <td className="px-4 py-4 text-sm">
                        {subjectName}
                      </td>

                      {/* Session */}

                      <td className="px-4 py-4 text-sm">
                        {sessionName}
                      </td>

                      {/* Term */}

                      <td className="px-4 py-4 text-sm">
                        {termName}
                      </td>

                      {/* Class */}

                      <td className="px-4 py-4 text-sm">
                        {className}
                      </td>

                      {/* CA */}

                      <td className="px-4 py-4 text-sm">
                        {formatNumber(
                          result.ca_score
                        )}
                      </td>

                      {/* Exam */}

                      <td className="px-4 py-4 text-sm">
                        {formatNumber(
                          result.exam_score
                        )}
                      </td>

                      {/* Total */}

                      <td className="px-4 py-4">
                        <span className="font-semibold">
                          {formatNumber(
                            result.total_score
                          )}
                        </span>
                      </td>

                      {/* Grade */}

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {result.grade || "—"}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/school-admin/examinations-results/results/${result.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                          >
                            <Eye className="w-4 h-4" />

                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              publishResult(result)
                            }
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition text-sm disabled:opacity-50"
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}

                            Publish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}