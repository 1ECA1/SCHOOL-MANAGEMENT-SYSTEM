import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { getStudentResults } from "../../../services/resultsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};

const getStudentName = (result) => {
  return (
    result?.student_name ||
    result?.student?.name ||
    "Unknown Student"
  );
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};

// ============================================================
// COMPONENT
// ============================================================

export default function PrincipalResults() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [results, setResults] = useState([]);

  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] =
    useState([]);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [sessionFilter, setSessionFilter] =
    useState("");

  const [termFilter, setTermFilter] =
    useState("");

  const [classFilter, setClassFilter] =
    useState("");

  const [examFilter, setExamFilter] =
    useState("");

  const [publicationFilter, setPublicationFilter] =
    useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

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

      setResults(
        extractList(resultsResponse)
      );

      setExaminations(
        extractList(examinationsResponse)
      );

      setExaminationSubjects(
        extractList(
          examinationSubjectsResponse
        )
      );

      setSessions(
        extractList(sessionsResponse)
      );

      setTerms(
        extractList(termsResponse)
      );

      setClassLevels(
        extractList(classLevelsResponse)
      );
    } catch (err) {
      console.error(
        "Failed to load principal results:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load student results."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // LOOKUP MAPS
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

    examinationSubjects.forEach((item) => {
      map[getId(item.id)] = item;
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
  // NORMALIZE RESULTS
  // ==========================================================

  const normalizedResults = useMemo(() => {
    return results.map((result) => {
      const examinationSubject =
        examinationSubjectMap[
          getId(result.examination_subject)
        ];

      const examination =
        examinationMap[
          getId(
            result.examination ||
              examinationSubject?.examination
          )
        ];

      const session =
        sessionMap[
          getId(
            result.academic_session ||
              examination?.academic_session ||
              examinationSubject?.academic_session
          )
        ];

      const term =
        termMap[
          getId(
            result.term ||
              examination?.term ||
              examinationSubject?.term
          )
        ];

      const classLevel =
        classMap[
          getId(
            result.class_level ||
              examination?.class_level ||
              examinationSubject?.class_level
          )
        ];

      const subjectName =
        result.subject_name ||
        examinationSubject?.subject_name ||
        examinationSubject?.subject?.name ||
        "Unknown Subject";

      const examinationName =
        result.examination_name ||
        examination?.name ||
        "Unknown Examination";

      const studentName =
        getStudentName(result);

      return {
        ...result,

        _studentName: studentName,

        _subjectName: subjectName,

        _examinationName: examinationName,

        _examinationSubject:
          examinationSubject,

        _examination: examination,

        _session: session,

        _term: term,

        _classLevel: classLevel,
      };
    });
  }, [
    results,
    examinationMap,
    examinationSubjectMap,
    sessionMap,
    termMap,
    classMap,
  ]);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const filteredTermsForSession = useMemo(() => {
    if (!sessionFilter) {
      return terms;
    }

    return terms.filter(
      (term) =>
        getId(term.academic_session) ===
        getId(sessionFilter)
    );
  }, [terms, sessionFilter]);

  const filteredExaminations = useMemo(() => {
    return examinations.filter((exam) => {
      if (
        sessionFilter &&
        getId(exam.academic_session) !==
          getId(sessionFilter)
      ) {
        return false;
      }

      if (
        termFilter &&
        getId(exam.term) !==
          getId(termFilter)
      ) {
        return false;
      }

      if (
        classFilter &&
        getId(exam.class_level) !==
          getId(classFilter)
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

  // ==========================================================
  // RESET DEPENDENT FILTERS
  // ==========================================================

  useEffect(() => {
    if (
      termFilter &&
      !filteredTermsForSession.some(
        (term) =>
          getId(term.id) ===
          getId(termFilter)
      )
    ) {
      setTermFilter("");
    }
  }, [
    filteredTermsForSession,
    termFilter,
  ]);

  useEffect(() => {
    if (
      examFilter &&
      !filteredExaminations.some(
        (exam) =>
          getId(exam.id) ===
          getId(examFilter)
      )
    ) {
      setExamFilter("");
    }
  }, [
    filteredExaminations,
    examFilter,
  ]);

  // ==========================================================
  // FILTER RESULTS
  // ==========================================================

  const filteredResults = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return normalizedResults.filter(
      (result) => {
        const studentName =
          result._studentName;

        const admissionNumber =
          result.student_admission_number ||
          result.admission_number ||
          "";

        const subjectName =
          result._subjectName;

        const examinationName =
          result._examinationName;

        const sessionName =
          result.academic_session_name ||
          result._session?.name ||
          result._session?.session_name ||
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

        if (query) {
          const searchableText = [
            studentName,
            admissionNumber,
            subjectName,
            examinationName,
            sessionName,
            termName,
            className,
          ]
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(query)
          ) {
            return false;
          }
        }

        if (
          sessionFilter &&
          getId(
            result.academic_session ||
              result._examination
                ?.academic_session
          ) !== getId(sessionFilter)
        ) {
          return false;
        }

        if (
          termFilter &&
          getId(
            result.term ||
              result._examination?.term
          ) !== getId(termFilter)
        ) {
          return false;
        }

        if (
          classFilter &&
          getId(
            result.class_level ||
              result._examination
                ?.class_level
          ) !== getId(classFilter)
        ) {
          return false;
        }

        if (
          examFilter &&
          getId(
            result._examination?.id
          ) !== getId(examFilter)
        ) {
          return false;
        }

        if (
          publicationFilter ===
            "published" &&
          !result.is_published
        ) {
          return false;
        }

        if (
          publicationFilter ===
            "unpublished" &&
          result.is_published
        ) {
          return false;
        }

        return true;
      }
    );
  }, [
    normalizedResults,
    search,
    sessionFilter,
    termFilter,
    classFilter,
    examFilter,
    publicationFilter,
  ]);

  // ==========================================================
  // GROUP BY STUDENT
  // ==========================================================

  const studentGroups = useMemo(() => {
    const groups = {};

    filteredResults.forEach((result) => {
      const studentId =
        result.student ??
        result.student_id ??
        result.student_name;

      const key = getId(studentId);

      if (!groups[key]) {
        groups[key] = {
          key,

          studentId:
            result.student ??
            result.student_id,

          studentName:
            result._studentName,

          admissionNumber:
            result.student_admission_number ||
            result.admission_number ||
            "",

          results: [],

          publishedCount: 0,

          unpublishedCount: 0,

          examinations: new Set(),

          subjects: new Set(),

          sessions: new Set(),

          terms: new Set(),

          classes: new Set(),
        };
      }

      const group = groups[key];

      group.results.push(result);

      if (result.is_published) {
        group.publishedCount += 1;
      } else {
        group.unpublishedCount += 1;
      }

      if (result._examinationName) {
        group.examinations.add(
          result._examinationName
        );
      }

      if (result._subjectName) {
        group.subjects.add(
          result._subjectName
        );
      }

      const sessionName =
        result.academic_session_name ||
        result._session?.name ||
        result._session?.session_name;

      if (sessionName) {
        group.sessions.add(
          sessionName
        );
      }

      const termName =
        result.term_name ||
        result._term?.name ||
        result._term?.term_name;

      if (termName) {
        group.terms.add(
          termName
        );
      }

      const className =
        result.class_level_name ||
        result._classLevel?.name;

      if (className) {
        group.classes.add(className);
      }
    });

    return Object.values(groups).map(
      (group) => ({
        ...group,

        examinations:
          Array.from(group.examinations),

        subjects:
          Array.from(group.subjects),

        sessions:
          Array.from(group.sessions),

        terms:
          Array.from(group.terms),

        classes:
          Array.from(group.classes),
      })
    );
  }, [filteredResults]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const totalStudents =
      studentGroups.length;

    const totalResults =
      filteredResults.length;

    const published =
      filteredResults.filter(
        (result) => result.is_published
      ).length;

    const unpublished =
      totalResults - published;

    return {
      totalStudents,
      totalResults,
      published,
      unpublished,
    };
  }, [
    studentGroups,
    filteredResults,
  ]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const hasActiveFilters =
    search ||
    sessionFilter ||
    termFilter ||
    classFilter ||
    examFilter ||
    publicationFilter;

  const resetFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
    setExamFilter("");
    setPublicationFilter("");
  };

  // ==========================================================
  // VIEW STUDENT RESULT
  // ==========================================================

  const handleView = (group) => {
    if (!group.results.length) {
      return;
    }

    const firstResult =
      group.results[0];

    navigate(
      `/principal/results/${firstResult.id}`
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

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
                  View and manage student examination results.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {refreshing ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={17} />
              )}

              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/principal/results/add"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <FileText size={17} />

              Enter Result
            </button>
          </div>
        </div>

        {/* ERROR */}

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
              className="rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Students"
            value={statistics.totalStudents}
            icon={<Users size={21} />}
          />

          <StatCard
            label="Total Results"
            value={statistics.totalResults}
            icon={<FileText size={21} />}
          />

          <StatCard
            label="Published"
            value={statistics.published}
            icon={<CheckCircle size={21} />}
            iconClass="text-green-600"
          />

          <StatCard
            label="Unpublished"
            value={statistics.unpublished}
            icon={<XCircle size={21} />}
            iconClass="text-orange-600"
          />

        </div>

        {/* FILTERS */}

        <div className="rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">

          <div className="border-b border-gray-200 p-4 dark:border-gray-700">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="font-semibold">
                  Search & Filters
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Find student results by session, term, class or examination.
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

            {/* SEARCH */}

            <div className="relative md:col-span-2">

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
                placeholder="Search student, admission number, subject..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700"
              />

            </div>

            <FilterSelect
              label="Academic Session"
              value={sessionFilter}
              onChange={(event) =>
                setSessionFilter(
                  event.target.value
                )
              }
              options={sessions}
              getOptionLabel={(item) =>
                item.name ||
                item.session_name ||
                item.title ||
                "Academic Session"
              }
            />

            <FilterSelect
              label="Term"
              value={termFilter}
              onChange={(event) =>
                setTermFilter(
                  event.target.value
                )
              }
              options={
                filteredTermsForSession
              }
              getOptionLabel={(item) =>
                item.name ||
                item.term_name ||
                item.title ||
                "Term"
              }
            />

            <FilterSelect
              label="Class"
              value={classFilter}
              onChange={(event) =>
                setClassFilter(
                  event.target.value
                )
              }
              options={classLevels}
              getOptionLabel={(item) =>
                item.name ||
                item.class_name ||
                item.title ||
                "Class"
              }
            />

            <FilterSelect
              label="Examination"
              value={examFilter}
              onChange={(event) =>
                setExamFilter(
                  event.target.value
                )
              }
              options={filteredExaminations}
              getOptionLabel={(item) =>
                item.name ||
                "Examination"
              }
            />

            <FilterSelect
              label="Publication"
              value={publicationFilter}
              onChange={(event) =>
                setPublicationFilter(
                  event.target.value
                )
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
              getOptionLabel={(item) =>
                item.name
              }
            />

          </div>
        </div>

        {/* STUDENT RESULTS */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">

          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">

            <div>
              <h2 className="font-semibold">
                Student Results
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Showing {studentGroups.length} students
              </p>
            </div>

          </div>

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
          ) : studentGroups.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="rounded-full bg-gray-100 p-4 text-gray-400 dark:bg-gray-800">
                <FileText size={30} />
              </div>

              <h3 className="mt-4 text-base font-semibold">
                No student results found
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
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="min-w-full text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">

                    <tr>

                      <th className="px-5 py-4 font-semibold">
                        Student
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Class
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Examinations
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Subjects
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-semibold">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                    {studentGroups.map(
                      (group) => (
                        <tr
                          key={group.key}
                          className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >

                          {/* STUDENT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {getInitials(
                                  group.studentName
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="font-semibold">
                                  {group.studentName}
                                </p>

                                {group.admissionNumber && (
                                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {group.admissionNumber}
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* CLASS */}

                          <td className="px-5 py-4">

                            {group.classes.length > 0
                              ? group.classes.join(
                                  ", "
                                )
                              : "—"}

                          </td>

                          {/* EXAMINATIONS */}

                          <td className="px-5 py-4">

                            <div className="max-w-[220px] space-y-1">

                              {group.examinations
                                .slice(0, 2)
                                .map(
                                  (
                                    examination
                                  ) => (
                                    <p
                                      key={
                                        examination
                                      }
                                      className="truncate font-medium"
                                    >
                                      {examination}
                                    </p>
                                  )
                                )}

                              {group.examinations.length >
                                2 && (
                                <p className="text-xs text-gray-500">
                                  +
                                  {group.examinations.length -
                                    2}{" "}
                                  more
                                </p>
                              )}

                            </div>

                          </td>

                          {/* SUBJECT COUNT */}

                          <td className="px-5 py-4">

                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {group.subjects.length}{" "}
                              {group.subjects.length ===
                              1
                                ? "Subject"
                                : "Subjects"}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <div className="space-y-1">

                              {group.publishedCount >
                                0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                  <CheckCircle
                                    size={13}
                                  />

                                  {
                                    group.publishedCount
                                  }{" "}
                                  Published
                                </span>
                              )}

                              {group.unpublishedCount >
                                0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                                  <XCircle
                                    size={13}
                                  />

                                  {
                                    group.unpublishedCount
                                  }{" "}
                                  Unpublished
                                </span>
                              )}

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end">

                              <button
                                type="button"
                                title="View student result"
                                onClick={() =>
                                  handleView(
                                    group
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <Eye
                                  size={17}
                                />

                                View
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}

              <div className="grid gap-3 p-4 lg:hidden">

                {studentGroups.map(
                  (group) => (
                    <div
                      key={group.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-background p-4 dark:border-gray-700"
                    >

                      {/* STUDENT NAME ONLY */}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">
                          {group.studentName}
                        </h3>
                      </div>

                      {/* VIEW ONLY */}

                      <button
                        type="button"
                        title="View result"
                        aria-label={`View result for ${group.studentName}`}
                        onClick={() =>
                          handleView(
                            group
                          )
                        }
                        className="shrink-0 rounded-lg p-2 text-primary transition hover:bg-primary/10"
                      >
                        <Eye size={20} />
                      </button>

                    </div>
                  )
                )}

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon,
  iconClass = "text-primary",
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg bg-primary/10 p-2.5 ${iconClass}`}
        >
          {icon}
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