import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  User,
} from "lucide-react";

import { getReportCards } from "../../services/resultsService";

// ============================================================
// HELPERS
// ============================================================

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0.00";
  }

  return number.toFixed(2);
};

const formatPosition = (position, totalStudents) => {
  if (!position) {
    return "—";
  }

  if (totalStudents) {
    return `${position} / ${totalStudents}`;
  }

  return String(position);
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParentResults() {
  const navigate = useNavigate();

  const [reportCards, setReportCards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  // ==========================================================
  // LOAD REPORT CARDS
  // ==========================================================

  const loadReportCards = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getReportCards();

      const reportCardList = Array.isArray(data)
        ? data
        : data?.results || [];

      setReportCards(reportCardList);
    } catch (err) {
      console.error(
        "Failed to load parent report cards:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load your children's results."
      );

      setReportCards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadReportCards();
  }, []);

  // ==========================================================
  // SESSION OPTIONS
  // ==========================================================

  const sessions = useMemo(() => {
    const map = new Map();

    reportCards.forEach((reportCard) => {
      if (
        reportCard.academic_session &&
        reportCard.session_name
      ) {
        map.set(
          String(reportCard.academic_session),
          reportCard.session_name
        );
      }
    });

    return Array.from(map.entries()).sort((a, b) =>
      b[1].localeCompare(a[1])
    );
  }, [reportCards]);

  // ==========================================================
  // TERM OPTIONS
  // ==========================================================

  const terms = useMemo(() => {
    const map = new Map();

    reportCards.forEach((reportCard) => {
      if (reportCard.term && reportCard.term_name) {
        map.set(
          String(reportCard.term),
          reportCard.term_name
        );
      }
    });

    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [reportCards]);

  // ==========================================================
  // FILTERED RESULTS
  // ==========================================================

  const filteredReportCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reportCards.filter((reportCard) => {
      const matchesSearch =
        !query ||
        reportCard.student_name
          ?.toLowerCase()
          .includes(query) ||
        reportCard.student_admission_number
          ?.toLowerCase()
          .includes(query) ||
        reportCard.class_name
          ?.toLowerCase()
          .includes(query);

      const matchesSession =
        !sessionFilter ||
        String(reportCard.academic_session) ===
          String(sessionFilter);

      const matchesTerm =
        !termFilter ||
        String(reportCard.term) === String(termFilter) ||
        reportCard.term_name === termFilter;

      return (
        matchesSearch &&
        matchesSession &&
        matchesTerm
      );
    });
  }, [
    reportCards,
    search,
    sessionFilter,
    termFilter,
  ]);

  // ==========================================================
  // OPEN RESULT
  // ==========================================================

  const openReportCard = (id) => {
    navigate(`/parent/results/${id}`);
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 text-[var(--color-text)]">
        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={34}
            className="animate-spin text-[var(--color-primary)]"
          />

          <p className="text-sm opacity-60">
            Loading children's results...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-8 text-[var(--color-text)]">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                <FileText
                  size={23}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Results
                </h1>

                <p className="mt-1 text-sm opacity-60">
                  View your children's published academic results.
                </p>
              </div>

            </div>
          </div>

          {/* Refresh */}

          <button
            type="button"
            onClick={() => loadReportCards(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary)]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                Unable to load results
              </p>

              <p className="mt-1 opacity-80">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ==================================================
            RESULT SELECTION / FILTER CARD
        ================================================== */}

        <div className="rounded-xl bg-[var(--color-card)] p-5 shadow-sm sm:p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Result Selection
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Search and filter your children's published
              results by academic period.
            </p>
          </div>

          {/* ==================================================
              SEARCH + SESSION + TERM
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search child or class..."
                  className="h-11 w-full rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-background)] pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:opacity-40 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>

            {/* SESSION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Academic Session
              </label>

              <select
                value={sessionFilter}
                onChange={(event) =>
                  setSessionFilter(event.target.value)
                }
                className="h-11 w-full rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-background)] px-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">
                  All Academic Sessions
                </option>

                {sessions.map(([id, name]) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* TERM */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Academic Term
              </label>

              <select
                value={termFilter}
                onChange={(event) =>
                  setTermFilter(event.target.value)
                }
                className="h-11 w-full rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-background)] px-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">
                  All Terms
                </option>

                {terms.map(([id, name]) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* ==================================================
              FILTER SUMMARY
          ================================================== */}

          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-[var(--color-text)]">

              <span className="font-semibold">
                Results Found:
              </span>{" "}

              {filteredReportCards.length}

            </p>

            {(search ||
              sessionFilter ||
              termFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-sm font-medium text-[var(--color-primary)] hover:opacity-80 sm:text-right"
              >
                Clear filters
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            NO RESULTS
        ================================================== */}

        {filteredReportCards.length === 0 ? (
          <div className="mt-6 rounded-xl bg-[var(--color-card)] p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <FileText
                size={27}
                className="text-[var(--color-primary)]"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              No published results
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm opacity-60">
              There are no published report cards available
              for your children matching the selected filters.
            </p>

            {(search ||
              sessionFilter ||
              termFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <div className="mt-6">

            {/* ==================================================
                RESULT CARDS
            ================================================== */}

            <div className="space-y-5">

              {filteredReportCards.map(
                (reportCard) => (
                  <div
                    key={reportCard.id}
                    className="rounded-xl bg-[var(--color-card)] shadow-sm transition hover:shadow-md"
                  >

                    {/* ==================================================
                        CARD HEADER
                    ================================================== */}

                    <div className="border-b border-black/5 dark:border-white/10 p-5 sm:p-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* STUDENT */}

                        <div className="flex items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)]/10">

                            {reportCard.student_profile_image ? (
                              <img
                                src={
                                  reportCard.student_profile_image
                                }
                                alt={
                                  reportCard.student_name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User
                                size={22}
                                className="text-[var(--color-primary)]"
                              />
                            )}

                          </div>

                          <div className="min-w-0">

                            <h2 className="truncate text-base font-semibold text-[var(--color-text)] sm:text-lg">
                              {reportCard.student_name ||
                                "Unknown Student"}
                            </h2>

                            <p className="mt-1 text-xs opacity-60 sm:text-sm">
                              {reportCard.student_admission_number ||
                                "No admission number"}
                            </p>

                          </div>

                        </div>

                        {/* PUBLISHED */}

                        <span className="w-fit rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-secondary)]">
                          Published
                        </span>

                      </div>

                    </div>

                    {/* ==================================================
                        ACADEMIC INFORMATION
                    ================================================== */}

                    <div className="p-5 sm:p-6">

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                        {/* SESSION */}

                        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-background)] p-4">

                          <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                            Academic Session
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            {reportCard.session_name ||
                              "—"}
                          </p>

                        </div>

                        {/* TERM */}

                        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-background)] p-4">

                          <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                            Academic Term
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            {reportCard.term_name ||
                              "—"}
                          </p>

                        </div>

                        {/* CLASS */}

                        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-background)] p-4">

                          <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                            Class
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            {reportCard.class_name ||
                              "—"}
                          </p>

                        </div>

                      </div>

                      {/* ==================================================
                          PERFORMANCE
                      ================================================== */}

                      <div className="mt-5">

                        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                          Academic Performance
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                          {/* AVERAGE */}

                          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-card)] p-4">

                            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                              Average Score
                            </p>

                            <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                              {formatScore(
                                reportCard.average_score
                              )}
                            </p>

                          </div>

                          {/* GRADE */}

                          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-card)] p-4">

                            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                              Overall Grade
                            </p>

                            <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                              {reportCard.overall_grade ||
                                "—"}
                            </p>

                          </div>

                          {/* POSITION */}

                          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--color-card)] p-4">

                            <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                              Position
                            </p>

                            <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                              {formatPosition(
                                reportCard.position,
                                reportCard.total_students
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ==================================================
                          VIEW RESULT
                      ================================================== */}

                      <div className="mt-6 flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            openReportCard(
                              reportCard.id
                            )
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
                        >
                          <Eye size={17} />

                          View Result
                        </button>

                      </div>

                    </div>
                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            RESULT COUNT
        ================================================== */}

        {filteredReportCards.length > 0 && (
          <div className="mt-6 text-center text-sm opacity-60">
            Showing{" "}
            <span className="font-medium text-[var(--color-text)]">
              {filteredReportCards.length}
            </span>{" "}
            {filteredReportCards.length === 1
              ? "published result"
              : "published results"}
          </div>
        )}

      </div>
    </div>
  );
}