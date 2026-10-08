import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const getId = (item) => item?.id ?? item?.value ?? "";

const getName = (item, fallback = "—") =>
  item?.name ||
  item?.title ||
  item?.class_name ||
  item?.session_name ||
  item?.term_name ||
  fallback;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  return Number.isInteger(number) ? number : number.toFixed(2);
};

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherReportCards() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [reportCards, setReportCards] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [search, setSearch] = useState("");

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD FILTER DATA
  // ==========================================================

  const loadFilters = async () => {
    setLoadingFilters(true);

    try {
      const [sessionsResponse, termsResponse, classesResponse] =
        await Promise.all([
          api.get("/academics/sessions/"),
          api.get("/academics/terms/"),
          api.get("/academics/class-levels/"),
        ]);

      const sessionData = getArray(sessionsResponse.data);
      const termData = getArray(termsResponse.data);
      const classData = getArray(classesResponse.data);

      setSessions(sessionData);
      setTerms(termData);
      setClasses(classData);

      // --------------------------------------------------------
      // DEFAULT CURRENT SESSION
      // --------------------------------------------------------

      const currentSession =
        sessionData.find(
          (session) =>
            session?.is_current === true ||
            session?.current === true
        ) || sessionData[0];

      if (currentSession) {
        setSessionFilter(String(getId(currentSession)));
      }

      // --------------------------------------------------------
      // DEFAULT CURRENT TERM
      // --------------------------------------------------------

      const currentTerm =
        termData.find(
          (term) =>
            term?.is_current === true ||
            term?.current === true
        ) || termData[0];

      if (currentTerm) {
        setTermFilter(String(getId(currentTerm)));
      }
    } catch (err) {
      console.error("Failed to load report card filters:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load report card filters."
      );
    } finally {
      setLoadingFilters(false);
    }
  };

  // ==========================================================
  // LOAD REPORT CARDS
  // ==========================================================

  const loadReportCards = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/results/report-cards/");
      const data = getArray(response.data);

      setReportCards(data);
    } catch (err) {
      console.error("Failed to load report cards:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load report cards."
      );

      setReportCards([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadFilters();
    loadReportCards();
  }, []);

  // ==========================================================
  // FILTER REPORT CARDS
  // ==========================================================

  const filteredReportCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reportCards.filter((card) => {
      // --------------------------------------------------------
      // SESSION
      // --------------------------------------------------------

      if (
        sessionFilter &&
        String(card?.academic_session) !== String(sessionFilter)
      ) {
        return false;
      }

      // --------------------------------------------------------
      // TERM
      // --------------------------------------------------------

      if (
        termFilter &&
        String(card?.term) !== String(termFilter)
      ) {
        return false;
      }

      // --------------------------------------------------------
      // CLASS
      // --------------------------------------------------------

      if (
        classFilter &&
        String(card?.class_level) !== String(classFilter)
      ) {
        return false;
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (!query) return true;

      const searchableText = [
        card?.student_name,
        card?.full_name,
        card?.admission_number,
        card?.student_admission_number,
        card?.class_name,
        card?.session_name,
        card?.term_name,
        card?.overall_grade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    reportCards,
    sessionFilter,
    termFilter,
    classFilter,
    search,
  ]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
    setSearch("");
  };

  // ==========================================================
  // REPORT CARD DETAILS
  // ==========================================================

  const openReportCard = (id) => {
    if (!id) return;

    navigate(`/teacher/report-cards/${id}`);
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalCards = filteredReportCards.length;

  const publishedCards = filteredReportCards.filter(
    (card) => card?.is_published === true
  ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FileText size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  Report Cards
                </h1>

                <p className="mt-1 text-sm opacity-70">
                  View report cards for students in your assigned
                  classes.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              loadFilters();
              loadReportCards();
            }}
            disabled={loading || loadingFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-primary)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading || loadingFilters
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-card)] p-4 shadow-sm">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[var(--color-primary)]"
            />

            <div className="flex-1">
              <p className="font-medium">
                Unable to load report cards
              </p>

              <p className="mt-1 text-sm opacity-70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 opacity-60 transition hover:bg-[var(--color-background)] hover:opacity-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* SUMMARY CARDS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-65">
                  Report Cards
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalCards}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FileText size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-secondary)]/10 bg-[var(--color-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-65">
                  Published
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {publishedCards}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                <Users size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Filters
              </h2>

              <p className="text-xs opacity-60">
                Select a session, term, class or search for a
                student.
              </p>
            </div>

            {(sessionFilter ||
              termFilter ||
              classFilter ||
              search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* SESSION */}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Academic Session
              </label>

              <select
                value={sessionFilter}
                onChange={(e) =>
                  setSessionFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              >
                <option value="">
                  All Sessions
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
              <label className="mb-1.5 block text-sm font-medium">
                Term
              </label>

              <select
                value={termFilter}
                onChange={(e) =>
                  setTermFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              >
                <option value="">
                  All Terms
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
              <label className="mb-1.5 block text-sm font-medium">
                Class
              </label>

              <select
                value={classFilter}
                onChange={(e) =>
                  setClassFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
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

            {/* SEARCH */}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Search Student
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Name or admission number"
                  className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* REPORT CARDS */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)]"
                />

                <p className="text-sm opacity-65">
                  Loading report cards...
                </p>
              </div>
            </div>
          ) : filteredReportCards.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FileText size={25} />
              </div>

              <h3 className="font-semibold">
                No report cards found
              </h3>

              <p className="mt-1 max-w-md text-sm opacity-60">
                No report cards match the selected filters or
                your teacher account currently has no available
                report cards.
              </p>
            </div>
          ) : (
            <>
              {/* ================================================== */}
              {/* DESKTOP TABLE */}
              {/* ================================================== */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-[var(--color-text)]/10 bg-[var(--color-background)]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Student
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Admission No.
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Class
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Session
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Term
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Average
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Grade
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Position
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide opacity-60">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-text)]/5">
                    {filteredReportCards.map((card) => (
                      <tr
                        key={card.id}
                        className="transition hover:bg-[var(--color-background)]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {card.student_name ||
                              card.full_name ||
                              "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm opacity-75">
                          {card.admission_number ||
                            card.student_admission_number ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {card.class_name || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {card.session_name || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {card.term_name || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium">
                          {formatScore(card.average_score)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-[var(--color-primary)]">
                            {card.overall_grade || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {card.position
                            ? `${card.position}${
                                card.total_students
                                  ? ` / ${card.total_students}`
                                  : ""
                              }`
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              card.is_published
                                ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            }`}
                          >
                            {card.is_published
                              ? "Published"
                              : "Not Published"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openReportCard(card.id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ================================================== */}
              {/* MOBILE CARDS */}
              {/* ================================================== */}

              <div className="divide-y divide-[var(--color-text)]/5 md:hidden">
                {filteredReportCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {card.student_name ||
                            card.full_name ||
                            "—"}
                        </h3>

                        <p className="mt-1 text-xs opacity-60">
                          {card.admission_number ||
                            card.student_admission_number ||
                            "—"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          card.is_published
                            ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        }`}
                      >
                        {card.is_published
                          ? "Published"
                          : "Not Published"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs opacity-50">
                          Class
                        </p>

                        <p className="mt-0.5 font-medium">
                          {card.class_name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs opacity-50">
                          Term
                        </p>

                        <p className="mt-0.5 font-medium">
                          {card.term_name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs opacity-50">
                          Average
                        </p>

                        <p className="mt-0.5 font-medium">
                          {formatScore(card.average_score)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs opacity-50">
                          Grade
                        </p>

                        <p className="mt-0.5 font-semibold text-[var(--color-primary)]">
                          {card.overall_grade || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs opacity-50">
                          Position
                        </p>

                        <p className="mt-0.5 font-medium">
                          {card.position
                            ? `${card.position}${
                                card.total_students
                                  ? ` / ${card.total_students}`
                                  : ""
                              }`
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs opacity-50">
                          Updated
                        </p>

                        <p className="mt-0.5 font-medium">
                          {formatDate(card.updated_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openReportCard(card.id)
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Eye size={17} />
                      View Report Card
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}