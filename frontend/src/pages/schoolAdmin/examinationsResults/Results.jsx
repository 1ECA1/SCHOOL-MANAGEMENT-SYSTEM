// src/pages/schoolAdmin/examinationsResults/Results.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Eye,
  FileText,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import { getStudentResults, deleteStudentResult } from "../../../services/resultsService";
import { getExaminations, getExaminationSubjects } from "../../../services/examinationsService";
import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const extractList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getId = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/\.?0+$/, "");
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

// ============================================================
// COMPONENT
// ============================================================

export default function Results() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [results, setResults] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // ----------------------------------------------------------
  // LOAD DATA
  // ----------------------------------------------------------

  const loadData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        resultsResponse,
        examinationsResponse,
        examinationSubjectsResponse,
        sessionsResponse,
        termsResponse,
        classLevelsResponse,
      ] = await Promise.all([
        getStudentResults(),
        getExaminations(),
        getExaminationSubjects(),
        getSessions(),
        getTerms(),
        getClassLevels(),
      ]);

      setResults(extractList(resultsResponse));
      setExaminations(extractList(examinationsResponse));
      setExaminationSubjects(extractList(examinationSubjectsResponse));
      setSessions(extractList(sessionsResponse));
      setTerms(extractList(termsResponse));
      setClassLevels(extractList(classLevelsResponse));
    } catch (err) {
      console.error("Failed to load results:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load student results.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // LOOKUPS
  // ==========================================================

  const examinationMap = useMemo(() => {
    const map = {};

    examinations.forEach((exam) => {
      map[getId(exam.id)] = exam;
    });

    return map;
  }, [examinations]);

  const examinationSubjectMap = useMemo(() => {
    const map = {};

    examinationSubjects.forEach((subject) => {
      map[getId(subject.id)] = subject;
    });

    return map;
  }, [examinationSubjects]);

  const sessionMap = useMemo(() => {
    const map = {};

    sessions.forEach((session) => {
      map[getId(session.id)] = session;
    });

    return map;
  }, [sessions]);

  const termMap = useMemo(() => {
    const map = {};

    terms.forEach((term) => {
      map[getId(term.id)] = term;
    });

    return map;
  }, [terms]);

  const classMap = useMemo(() => {
    const map = {};

    classLevels.forEach((classLevel) => {
      map[getId(classLevel.id)] = classLevel;
    });

    return map;
  }, [classLevels]);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const filteredTermsForSession = useMemo(() => {
    if (!sessionFilter) {
      return terms;
    }

    return terms.filter(
      (term) => getId(term.academic_session) === getId(sessionFilter)
    );
  }, [terms, sessionFilter]);

  const filteredExamsForFilters = useMemo(() => {
    return examinations.filter((exam) => {
      if (
        sessionFilter &&
        getId(exam.academic_session) !== getId(sessionFilter)
      ) {
        return false;
      }

      if (termFilter && getId(exam.term) !== getId(termFilter)) {
        return false;
      }

      if (
        classFilter &&
        getId(exam.class_level) !== getId(classFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    examinations,
    sessionFilter,
    termFilter,
    classFilter,
  ]);

  const filteredSubjectsForFilters = useMemo(() => {
    if (!examFilter) {
      return examinationSubjects;
    }

    return examinationSubjects.filter(
      (item) => getId(item.examination) === getId(examFilter)
    );
  }, [examinationSubjects, examFilter]);

  // ==========================================================
  // RESET DEPENDENT FILTERS
  // ==========================================================

  useEffect(() => {
    if (
      termFilter &&
      !filteredTermsForSession.some(
        (term) => getId(term.id) === getId(termFilter)
      )
    ) {
      setTermFilter("");
    }
  }, [filteredTermsForSession, termFilter]);

  useEffect(() => {
    if (
      examFilter &&
      !filteredExamsForFilters.some(
        (exam) => getId(exam.id) === getId(examFilter)
      )
    ) {
      setExamFilter("");
    }
  }, [filteredExamsForFilters, examFilter]);

  useEffect(() => {
    if (
      subjectFilter &&
      !filteredSubjectsForFilters.some(
        (subject) => getId(subject.id) === getId(subjectFilter)
      )
    ) {
      setSubjectFilter("");
    }
  }, [filteredSubjectsForFilters, subjectFilter]);

  // ==========================================================
  // RESULT NORMALIZATION
  // ==========================================================

  const normalizedResults = useMemo(() => {
    return results.map((result) => {
      const examinationSubject =
        examinationSubjectMap[getId(result.examination_subject)];

      const examination =
        examinationMap[getId(
          result.examination ||
            examinationSubject?.examination
        )];

      const session =
        sessionMap[getId(
          result.academic_session ||
            examination?.academic_session ||
            examinationSubject?.academic_session
        )];

      const term =
        termMap[getId(
          result.term ||
            examination?.term ||
            examinationSubject?.term
        )];

      const classLevel =
        classMap[getId(
          result.class_level ||
            examination?.class_level ||
            examinationSubject?.class_level
        )];

      return {
        ...result,
        _examinationSubject: examinationSubject,
        _examination: examination,
        _session: session,
        _term: term,
        _classLevel: classLevel,
      };
    });
  }, [
    results,
    examinationSubjectMap,
    examinationMap,
    sessionMap,
    termMap,
    classMap,
  ]);

  // ==========================================================
  // FILTER RESULTS
  // ==========================================================

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedResults.filter((result) => {
      const examination = result._examination;
      const examinationSubject = result._examinationSubject;

      const studentName =
        result.student_name ||
        result.student?.name ||
        "";

      const subjectName =
        result.subject_name ||
        examinationSubject?.subject_name ||
        examinationSubject?.subject?.name ||
        "";

      const examinationName =
        result.examination_name ||
        examination?.name ||
        "";

      const sessionName =
        result.academic_session_name ||
        result._session?.name ||
        "";

      const termName =
        result.term_name ||
        result._term?.name ||
        result._term?.term_name ||
        "";

      const className =
        result.class_level_name ||
        result._classLevel?.name ||
        "";

      const admissionNumber =
        result.student_admission_number ||
        result.admission_number ||
        "";

      // Search
      if (query) {
        const searchableText = [
          studentName,
          subjectName,
          examinationName,
          sessionName,
          termName,
          className,
          admissionNumber,
          result.grade,
          result.remark,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Session
      if (
        sessionFilter &&
        getId(result.academic_session) !== getId(sessionFilter)
      ) {
        return false;
      }

      // Term
      if (
        termFilter &&
        getId(result.term) !== getId(termFilter)
      ) {
        return false;
      }

      // Class
      if (
        classFilter &&
        getId(result.class_level) !== getId(classFilter)
      ) {
        return false;
      }

      // Examination
      if (
        examFilter &&
        getId(result._examination?.id) !== getId(examFilter)
      ) {
        return false;
      }

      // Examination subject
      if (
        subjectFilter &&
        getId(result.examination_subject) !== getId(subjectFilter)
      ) {
        return false;
      }

      // Publication
      if (publicationFilter === "published" && !result.is_published) {
        return false;
      }

      if (
        publicationFilter === "unpublished" &&
        result.is_published
      ) {
        return false;
      }

      return true;
    });
  }, [
    normalizedResults,
    search,
    sessionFilter,
    termFilter,
    classFilter,
    examFilter,
    subjectFilter,
    publicationFilter,
  ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const total = filteredResults.length;

    const published = filteredResults.filter(
      (result) => result.is_published
    ).length;

    const unpublished = total - published;

    const totalScore = filteredResults.reduce(
      (sum, result) => sum + Number(result.total_score || 0),
      0
    );

    const average = total
      ? totalScore / total
      : 0;

    return {
      total,
      published,
      unpublished,
      average,
    };
  }, [filteredResults]);

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (result) => {
    const studentName =
      result.student_name || "this student";

    const subjectName =
      result.subject_name ||
      result._examinationSubject?.subject_name ||
      "this subject";

    const confirmed = window.confirm(
      `Delete the result for ${studentName} in ${subjectName}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(result.id);
      setError("");

      await deleteStudentResult(result.id);

      setResults((current) =>
        current.filter(
          (item) => item.id !== result.id
        )
      );
    } catch (err) {
      console.error("Failed to delete result:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete the result.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const hasActiveFilters =
    search ||
    sessionFilter ||
    termFilter ||
    classFilter ||
    examFilter ||
    subjectFilter ||
    publicationFilter;

  const resetFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
    setExamFilter("");
    setSubjectFilter("");
    setPublicationFilter("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Results
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage student examination results and publication status.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-card px-4 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {refreshing ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}

              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/examinations-results/results/add"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <FileText size={17} />
              Enter Result
            </button>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Unable to load results
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}
          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Results
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Users size={21} />
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Published
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {statistics.published}
                </p>
              </div>

              <div className="rounded-lg bg-green-500/10 p-2.5 text-green-600 dark:text-green-400">
                <CheckCircle size={21} />
              </div>
            </div>
          </div>

          {/* Unpublished */}
          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Unpublished
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {statistics.unpublished}
                </p>
              </div>

              <div className="rounded-lg bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400">
                <XCircle size={21} />
              </div>
            </div>
          </div>

          {/* Average */}
          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {statistics.average.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg bg-secondary/10 p-2.5 text-secondary">
                <FileText size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold">
                  Search & Filters
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Filter results by academic session, term, class, examination or subject.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <XCircle size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search student, admission number, subject, examination..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700"
              />
            </div>

            {/* Session */}
            <FilterSelect
              label="Academic Session"
              value={sessionFilter}
              onChange={(event) =>
                setSessionFilter(event.target.value)
              }
              options={sessions}
              getOptionLabel={(item) =>
                item.name ||
                item.session_name ||
                item.title ||
                `Session ${item.id}`
              }
            />

            {/* Term */}
            <FilterSelect
              label="Term"
              value={termFilter}
              onChange={(event) =>
                setTermFilter(event.target.value)
              }
              options={filteredTermsForSession}
              getOptionLabel={(item) =>
                item.name ||
                item.term_name ||
                item.title ||
                `Term ${item.id}`
              }
            />

            {/* Class */}
            <FilterSelect
              label="Class"
              value={classFilter}
              onChange={(event) =>
                setClassFilter(event.target.value)
              }
              options={classLevels}
              getOptionLabel={(item) =>
                item.name ||
                item.class_name ||
                item.title ||
                `Class ${item.id}`
              }
            />

            {/* Examination */}
            <FilterSelect
              label="Examination"
              value={examFilter}
              onChange={(event) =>
                setExamFilter(event.target.value)
              }
              options={filteredExamsForFilters}
              getOptionLabel={(item) =>
                item.name ||
                `Examination ${item.id}`
              }
            />

            {/* Subject */}
            <FilterSelect
              label="Subject"
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(event.target.value)
              }
              options={filteredSubjectsForFilters}
              getOptionLabel={(item) =>
                item.subject_name ||
                item.subject?.name ||
                item.name ||
                `Subject ${item.id}`
              }
            />

            {/* Publication */}
            <FilterSelect
              label="Publication"
              value={publicationFilter}
              onChange={(event) =>
                setPublicationFilter(event.target.value)
              }
              options={[
                {
                  id: "published",
                  name: "Published",
                },
                {
                  id: "unpublished",
                  name: "Unpublished",
                },
              ]}
              getOptionLabel={(item) => item.name}
            />
          </div>
        </div>

        {/* ====================================================
            RESULTS TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">

          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
            <div>
              <h2 className="font-semibold">
                Student Results
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredResults.length} of {results.length} results
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                <Loader2
                  size={32}
                  className="animate-spin text-primary"
                />

                <p className="text-sm">
                  Loading results...
                </p>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-gray-100 p-4 text-gray-400 dark:bg-gray-800">
                <FileText size={30} />
              </div>

              <h3 className="mt-4 text-base font-semibold">
                No results found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? "No student results match the selected filters."
                  : "There are no student results yet."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Student
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Examination
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Subject
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        CA
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Exam
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Total
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Grade
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredResults.map((result) => {
                      const examination =
                        result._examination;

                      const examinationSubject =
                        result._examinationSubject;

                      const studentName =
                        result.student_name ||
                        "Unknown Student";

                      const subjectName =
                        result.subject_name ||
                        examinationSubject?.subject_name ||
                        examinationSubject?.subject?.name ||
                        "Unknown Subject";

                      const examinationName =
                        result.examination_name ||
                        examination?.name ||
                        "Unknown Examination";

                      return (
                        <tr
                          key={result.id}
                          className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >
                          {/* Student */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {getInitials(studentName)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {studentName}
                                </p>

                                {result.student_admission_number && (
                                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {result.student_admission_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Examination */}
                          <td className="px-5 py-4">
                            <div className="max-w-[180px]">
                              <p className="truncate font-medium">
                                {examinationName}
                              </p>

                              {result._classLevel?.name && (
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                  {result._classLevel.name}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="px-5 py-4">
                            <span className="font-medium">
                              {subjectName}
                            </span>
                          </td>

                          {/* CA */}
                          <td className="px-5 py-4">
                            {formatScore(result.ca_score)}
                          </td>

                          {/* Exam */}
                          <td className="px-5 py-4">
                            {formatScore(result.exam_score)}
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4">
                            <span className="font-bold">
                              {formatScore(result.total_score)}
                            </span>
                          </td>

                          {/* Grade */}
                          <td className="px-5 py-4">
                            <div>
                              <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                                {result.grade || "—"}
                              </span>

                              {result.remark && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {result.remark}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {result.is_published ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                <CheckCircle size={13} />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                                <XCircle size={13} />
                                Unpublished
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <ActionButton
                                title="View result"
                                onClick={() =>
                                  navigate(
                                    `/school-admin/examinations-results/results/${result.id}`
                                  )
                                }
                              >
                                <Eye size={17} />
                              </ActionButton>

                              <ActionButton
                                title="Edit result"
                                onClick={() =>
                                  navigate(
                                    `/school-admin/examinations-results/results/${result.id}/edit`
                                  )
                                }
                              >
                                <Pencil size={17} />
                              </ActionButton>

                              <ActionButton
                                title="Delete result"
                                danger
                                disabled={
                                  deletingId === result.id
                                }
                                onClick={() =>
                                  handleDelete(result)
                                }
                              >
                                {deletingId === result.id ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={17} />
                                )}
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {filteredResults.map((result) => {
                  const examination =
                    result._examination;

                  const examinationSubject =
                    result._examinationSubject;

                  const studentName =
                    result.student_name ||
                    "Unknown Student";

                  const subjectName =
                    result.subject_name ||
                    examinationSubject?.subject_name ||
                    examinationSubject?.subject?.name ||
                    "Unknown Subject";

                  const examinationName =
                    result.examination_name ||
                    examination?.name ||
                    "Unknown Examination";

                  return (
                    <div
                      key={result.id}
                      className="rounded-xl border border-gray-200 bg-background p-4 dark:border-gray-700"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(studentName)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {studentName}
                            </h3>

                            {result.student_admission_number && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {result.student_admission_number}
                              </p>
                            )}
                          </div>
                        </div>

                        {result.is_published ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                            <CheckCircle size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                            <XCircle size={12} />
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Examination */}
                      <div className="mt-4 rounded-lg border border-gray-200 bg-card p-3 dark:border-gray-700">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Examination
                        </p>

                        <p className="mt-1 font-medium">
                          {examinationName}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {result._session?.name && (
                            <span>
                              {result._session.name}
                            </span>
                          )}

                          {result._term?.name && (
                            <span>
                              {result._term.name}
                            </span>
                          )}

                          {result._classLevel?.name && (
                            <span>
                              {result._classLevel.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Subject
                        </p>

                        <p className="mt-1 font-semibold">
                          {subjectName}
                        </p>
                      </div>

                      {/* Scores */}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <ScoreBox
                          label="CA"
                          value={formatScore(
                            result.ca_score
                          )}
                        />

                        <ScoreBox
                          label="Exam"
                          value={formatScore(
                            result.exam_score
                          )}
                        />

                        <ScoreBox
                          label="Total"
                          value={formatScore(
                            result.total_score
                          )}
                          strong
                        />

                        <ScoreBox
                          label="Grade"
                          value={result.grade || "—"}
                          strong
                        />
                      </div>

                      {/* Remark */}
                      {result.remark && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/60">
                          <span className="font-medium">
                            Remark:
                          </span>{" "}
                          <span className="text-gray-600 dark:text-gray-300">
                            {result.remark}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/examinations-results/results/${result.id}`
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-card px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/examinations-results/results/${result.id}/edit`
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId === result.id
                          }
                          onClick={() =>
                            handleDelete(result)
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                        >
                          {deletingId === result.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
  options,
  getOptionLabel,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700"
        >
          <option value="">
            All {label}
          </option>

          {options.map((option) => (
            <option
              key={option.id}
              value={option.id}
            >
              {getOptionLabel(option)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}

// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ============================================================
// SCORE BOX
// ============================================================

function ScoreBox({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-card p-2 text-center dark:border-gray-700">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-base font-bold text-primary"
            : "text-sm font-semibold"
        }`}
      >
        {value}
      </p>
    </div>
  );
}