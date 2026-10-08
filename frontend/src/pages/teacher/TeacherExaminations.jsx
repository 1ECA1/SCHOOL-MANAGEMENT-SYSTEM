import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getExaminations } from "../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "—";

  if (startDate && endDate && startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} — ${formatDate(endDate)}`;
};

const getExaminationTypeLabel = (exam) => {
  if (exam?.examination_type_display) {
    return exam.examination_type_display;
  }

  const labels = {
    FIRST_CA: "First Continuous Assessment",
    SECOND_CA: "Second Continuous Assessment",
    MID_TERM: "Mid-Term Examination",
    MOCK: "Mock",
    TERMINAL: "Terminal",
    PROMOTION: "Promotion",
    ENTRANCE: "Entrance",
  };

  return (
    labels[exam?.examination_type] ||
    exam?.examination_type ||
    "—"
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherExaminations() {
  const navigate = useNavigate();

  const [examinations, setExaminations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // ==========================================================
  // LOAD EXAMINATIONS
  // ==========================================================

  const loadExaminations = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getExaminations();

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setExaminations(data);
    } catch (err) {
      console.error(
        "Failed to load examinations:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load examinations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, []);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const sessions = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam.academic_session) {
        map.set(
          exam.academic_session,
          exam.academic_session_name ||
            String(exam.academic_session)
        );
      }
    });

    return Array.from(map.entries());
  }, [examinations]);

  const terms = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam.term) {
        map.set(
          exam.term,
          exam.term_name || String(exam.term)
        );
      }
    });

    return Array.from(map.entries());
  }, [examinations]);

  const classes = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam.class_level) {
        map.set(
          exam.class_level,
          exam.class_level_name ||
            String(exam.class_level)
        );
      }
    });

    return Array.from(map.entries());
  }, [examinations]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredExaminations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !searchValue ||
        exam.name?.toLowerCase().includes(searchValue) ||
        exam.class_level_name
          ?.toLowerCase()
          .includes(searchValue) ||
        exam.examination_type_display
          ?.toLowerCase()
          .includes(searchValue);

      const matchesSession =
        !sessionFilter ||
        String(exam.academic_session) ===
          String(sessionFilter);

      const matchesTerm =
        !termFilter ||
        String(exam.term) === String(termFilter);

      const matchesClass =
        !classFilter ||
        String(exam.class_level) ===
          String(classFilter);

      return (
        matchesSearch &&
        matchesSession &&
        matchesTerm &&
        matchesClass
      );
    });
  }, [
    examinations,
    search,
    sessionFilter,
    termFilter,
    classFilter,
  ]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
  };

  const hasFilters =
    search ||
    sessionFilter ||
    termFilter ||
    classFilter;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-3 text-[var(--color-secondary)]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading examinations...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full space-y-6 bg-[var(--color-background)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Examinations
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            View examination schedules and details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadExaminations(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          <span className="hidden sm:inline">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>

          <span className="sm:hidden">
            Refresh
          </span>
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-4 text-[var(--color-text)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-secondary)]" />

          <div className="flex-1">
            <p className="font-medium">
              Unable to load examinations
            </p>

            <p className="mt-1 text-sm opacity-70">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadExaminations()}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* SEARCH */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-secondary)]" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search examination..."
              className="w-full rounded-lg border border-[var(--color-primary)]/10 bg-[var(--color-background)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          {/* SESSION */}

          <select
            value={sessionFilter}
            onChange={(e) =>
              setSessionFilter(e.target.value)
            }
            className="rounded-lg border border-[var(--color-primary)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
          >
            <option value="">All Sessions</option>

            {sessions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {/* TERM */}

          <select
            value={termFilter}
            onChange={(e) =>
              setTermFilter(e.target.value)
            }
            className="rounded-lg border border-[var(--color-primary)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
          >
            <option value="">All Terms</option>

            {terms.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {/* CLASS */}

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value)
            }
            className="rounded-lg border border-[var(--color-primary)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
          >
            <option value="">All Classes</option>

            {classes.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-0">
            <thead>
              <tr className="border-b border-[var(--color-primary)]/10 bg-[var(--color-primary)]/5">
                {/* EXAMINATION */}

                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] sm:px-5">
                  Examination
                </th>

                {/* TYPE */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] md:table-cell">
                  Type
                </th>

                {/* CLASS */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] md:table-cell">
                  Class
                </th>

                {/* SESSION */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] lg:table-cell">
                  Session
                </th>

                {/* TERM */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] lg:table-cell">
                  Term
                </th>

                {/* DATES */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] md:table-cell">
                  Dates
                </th>

                {/* STATUS */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] md:table-cell">
                  Status
                </th>

                {/* ACTION */}

                <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] sm:px-5">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredExaminations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium text-[var(--color-text)]">
                      No examinations found
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]/60">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExaminations.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-[var(--color-primary)]/10 last:border-b-0 transition hover:bg-[var(--color-primary)]/5"
                  >
                    {/* ==================================================
                        EXAMINATION
                        MOBILE: VISIBLE
                    ================================================== */}

                    <td className="px-3 py-4 sm:px-5">
                      <div
                        className="max-w-[220px] truncate font-semibold text-[var(--color-text)] sm:max-w-[300px]"
                        title={exam.name}
                      >
                        {exam.name || "—"}
                      </div>
                    </td>

                    {/* ==================================================
                        TYPE
                        MOBILE: HIDDEN
                    ================================================== */}

                    <td className="hidden px-5 py-4 text-sm text-[var(--color-text)] md:table-cell">
                      {getExaminationTypeLabel(exam)}
                    </td>

                    {/* ==================================================
                        CLASS
                        MOBILE: HIDDEN
                    ================================================== */}

                    <td className="hidden px-5 py-4 text-sm text-[var(--color-text)] md:table-cell">
                      {exam.class_level_name || "—"}
                    </td>

                    {/* ==================================================
                        SESSION
                        MOBILE + TABLET: HIDDEN
                    ================================================== */}

                    <td className="hidden px-5 py-4 text-sm text-[var(--color-text)] lg:table-cell">
                      {exam.academic_session_name || "—"}
                    </td>

                    {/* ==================================================
                        TERM
                        MOBILE + TABLET: HIDDEN
                    ================================================== */}

                    <td className="hidden px-5 py-4 text-sm text-[var(--color-text)] lg:table-cell">
                      {exam.term_name || "—"}
                    </td>

                    {/* ==================================================
                        DATES
                        MOBILE: HIDDEN
                    ================================================== */}

                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-[var(--color-text)] md:table-cell">
                      {formatDateRange(
                        exam.start_date,
                        exam.end_date
                      )}
                    </td>

                    {/* ==================================================
                        STATUS
                        MOBILE: HIDDEN
                    ================================================== */}

                    <td className="hidden px-5 py-4 md:table-cell">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          exam.is_published
                            ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        }`}
                      >
                        {exam.is_published
                          ? "Published"
                          : "Not Published"}
                      </span>
                    </td>

                    {/* ==================================================
                        ACTION
                        MOBILE: ONLY ICON
                        DESKTOP: ICON + VIEW
                    ================================================== */}

                    <td className="px-3 py-4 text-right sm:px-5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/teacher/examinations/${exam.id}`
                          )
                        }
                        title="View examination"
                        aria-label={`View ${exam.name}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] p-2 text-white transition hover:opacity-90 sm:gap-2 sm:px-3 sm:py-2"
                      >
                        <Eye className="h-4 w-4" />

                        <span className="hidden sm:inline">
                          View
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="border-t border-[var(--color-primary)]/10 px-4 py-3 text-sm text-[var(--color-text)]/60 sm:px-5">
          Showing{" "}
          <span className="font-medium text-[var(--color-text)]">
            {filteredExaminations.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-[var(--color-text)]">
            {examinations.length}
          </span>{" "}
          examinations
        </div>
      </div>
    </div>
  );
}