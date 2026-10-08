
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Edit,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { getReportCards } from "../../../services/resultsService";

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

  return Number.isInteger(number) ? String(number) : number.toFixed(2);
};

// ============================================================
// COMPONENT
// ============================================================

export default function ReportCards() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [reportCards, setReportCards] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filterSession, setFilterSession] = useState("");

  const [filterTerm, setFilterTerm] = useState("");

  const [filterClass, setFilterClass] = useState("");

  const [filterPublished, setFilterPublished] = useState("");

  // ==========================================================
  // LOAD REPORT CARDS
  // ==========================================================

  const loadReportCards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReportCards();

      setReportCards(getArrayData(response));
    } catch (err) {
      console.error("Failed to load report cards:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load report cards.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportCards();
  }, []);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const sessionOptions = useMemo(() => {
    const values = new Set();

    reportCards.forEach((reportCard) => {
      if (reportCard.session_name) {
        values.add(reportCard.session_name);
      } else if (reportCard.academic_session_name) {
        values.add(reportCard.academic_session_name);
      }
    });

    return Array.from(values).sort();
  }, [reportCards]);

  const termOptions = useMemo(() => {
    const values = new Set();

    reportCards.forEach((reportCard) => {
      if (reportCard.term_name) {
        values.add(reportCard.term_name);
      }
    });

    return Array.from(values).sort();
  }, [reportCards]);

  const classOptions = useMemo(() => {
    const values = new Set();

    reportCards.forEach((reportCard) => {
      if (reportCard.class_name) {
        values.add(reportCard.class_name);
      } else if (reportCard.class_level_name) {
        values.add(reportCard.class_level_name);
      }
    });

    return Array.from(values).sort();
  }, [reportCards]);

  // ==========================================================
  // FILTERED REPORT CARDS
  // ==========================================================

  const filteredReportCards = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reportCards.filter((reportCard) => {
      const studentName = reportCard.student_name || "";

      const admissionNumber = reportCard.student_admission_number || "";

      const sessionName =
        reportCard.session_name || reportCard.academic_session_name || "";

      const termName = reportCard.term_name || "";

      const className =
        reportCard.class_name || reportCard.class_level_name || "";

      const matchesSearch =
        !searchValue ||
        studentName.toLowerCase().includes(searchValue) ||
        admissionNumber.toString().toLowerCase().includes(searchValue);

      const matchesSession =
        !filterSession || sessionName === filterSession;

      const matchesTerm = !filterTerm || termName === filterTerm;

      const matchesClass = !filterClass || className === filterClass;

      const matchesPublished =
        !filterPublished ||
        (filterPublished === "published" &&
          reportCard.is_published === true) ||
        (filterPublished === "unpublished" &&
          reportCard.is_published !== true);

      return (
        matchesSearch &&
        matchesSession &&
        matchesTerm &&
        matchesClass &&
        matchesPublished
      );
    });
  }, [
    reportCards,
    search,
    filterSession,
    filterTerm,
    filterClass,
    filterPublished,
  ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const total = reportCards.length;

    const published = reportCards.filter(
      (reportCard) => reportCard.is_published === true,
    ).length;

    const unpublished = total - published;

    return {
      total,
      published,
      unpublished,
    };
  }, [reportCards]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setFilterSession("");
    setFilterTerm("");
    setFilterClass("");
    setFilterPublished("");
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleView = (id) => {
    navigate(
      `/school-admin/examinations-results/report-cards/${id}`,
    );
  };

  const handleEdit = (id) => {
    navigate(
      `/school-admin/examinations-results/report-cards/${id}/edit`,
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-text">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />

          <span>Loading report cards...</span>
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

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mb-6">
        <button
          type="button"
          onClick={loadReportCards}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/school-admin/examinations-results/report-cards/add",
            )
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 transition"
        >
          <FileText className="w-4 h-4" />
          Add Report Card
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">Something went wrong</p>

            <p className="text-sm mt-1">{error}</p>
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
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Report Cards
          </p>

          <p className="text-3xl font-bold mt-2">
            {statistics.total}
          </p>
        </div>

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Published
          </p>

          <p className="text-3xl font-bold mt-2 text-green-600">
            {statistics.published}
          </p>
        </div>

        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unpublished
          </p>

          <p className="text-3xl font-bold mt-2 text-orange-500">
            {statistics.unpublished}
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student or admission number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Session */}

          <select
            value={filterSession}
            onChange={(event) => setFilterSession(event.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Sessions</option>

            {sessionOptions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>

          {/* Term */}

          <select
            value={filterTerm}
            onChange={(event) => setFilterTerm(event.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Terms</option>

            {termOptions.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>

          {/* Class */}

          <select
            value={filterClass}
            onChange={(event) => setFilterClass(event.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Classes</option>

            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {/* Published */}

          <select
            value={filterPublished}
            onChange={(event) => setFilterPublished(event.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Statuses</option>

            <option value="published">Published</option>

            <option value="unpublished">Unpublished</option>
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
          REPORT CARDS
      ====================================================== */}

      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {filteredReportCards.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />

            <h2 className="text-lg font-semibold">
              No Report Cards Found
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              There are no report cards matching your current filters.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                MOBILE LIST
                Only Student Name + Action
            ================================================== */}

            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
              {filteredReportCards.map((reportCard) => (
                <div
                  key={reportCard.id}
                  className="flex items-center justify-between gap-3 px-4 py-4"
                >
                  {/* Student Name */}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {reportCard.student_name || "Unknown Student"}
                    </p>
                  </div>

                  {/* Actions */}

                  <div className="flex items-center gap-2 shrink-0">
                    {/* View */}

                    <button
                      type="button"
                      onClick={() => handleView(reportCard.id)}
                      title="View Report Card"
                      aria-label="View Report Card"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() => handleEdit(reportCard.id)}
                      title="Edit Report Card"
                      aria-label="Edit Report Card"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Student
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Admission No.
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
                      Total
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Average
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Grade
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Position
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReportCards.map((reportCard) => {
                    const sessionName =
                      reportCard.session_name ||
                      reportCard.academic_session_name ||
                      "—";

                    const className =
                      reportCard.class_name ||
                      reportCard.class_level_name ||
                      "—";

                    return (
                      <tr
                        key={reportCard.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        {/* Student */}

                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {reportCard.student_name ||
                              "Unknown Student"}
                          </div>
                        </td>

                        {/* Admission Number */}

                        <td className="px-4 py-4 text-sm">
                          {reportCard.student_admission_number || "—"}
                        </td>

                        {/* Session */}

                        <td className="px-4 py-4 text-sm">
                          {sessionName}
                        </td>

                        {/* Term */}

                        <td className="px-4 py-4 text-sm">
                          {reportCard.term_name || "—"}
                        </td>

                        {/* Class */}

                        <td className="px-4 py-4 text-sm">
                          {className}
                        </td>

                        {/* Total */}

                        <td className="px-4 py-4 font-semibold">
                          {formatNumber(reportCard.total_score)}
                        </td>

                        {/* Average */}

                        <td className="px-4 py-4">
                          {formatNumber(reportCard.average_score)}
                        </td>

                        {/* Grade */}

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {reportCard.overall_grade || "—"}
                          </span>
                        </td>

                        {/* Position */}

                        <td className="px-4 py-4 text-sm">
                          {reportCard.position
                            ? `${reportCard.position}${
                                reportCard.total_students
                                  ? ` / ${reportCard.total_students}`
                                  : ""
                              }`
                            : "—"}
                        </td>

                        {/* Status */}

                        <td className="px-4 py-4">
                          {reportCard.is_published ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                              Unpublished
                            </span>
                          )}
                        </td>

                        {/* Action */}

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}

                            <button
                              type="button"
                              onClick={() =>
                                handleView(reportCard.id)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(reportCard.id)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
