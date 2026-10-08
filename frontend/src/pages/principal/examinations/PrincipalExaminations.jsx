import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import api from "../../../services/api";

const PrincipalExaminations = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const loadExaminations = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/examinations/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setExaminations(data);
    } catch (err) {
      console.error("Failed to load examinations:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load examinations. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, []);

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !query ||
        String(exam.name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam.examination_type || "")
          .toLowerCase()
          .includes(query) ||
        String(exam.class_name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam.session_name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam.term_name || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "ALL" ||
        (status === "PUBLISHED" && exam.is_published) ||
        (status === "UNPUBLISHED" && !exam.is_published);

      return matchesSearch && matchesStatus;
    });
  }, [examinations, search, status]);

  const statistics = useMemo(() => {
    const total = examinations.length;
    const published = examinations.filter(
      (exam) => exam.is_published,
    ).length;

    return {
      total,
      published,
      unpublished: total - published,
    };
  }, [examinations]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getClassName = (exam) => {
    return (
      exam.class_name ||
      exam.class_level_name ||
      exam.class_level?.name ||
      "—"
    );
  };

  const getSessionName = (exam) => {
    return (
      exam.session_name ||
      exam.academic_session_name ||
      exam.academic_session?.name ||
      "—"
    );
  };

  const getTermName = (exam) => {
    return (
      exam.term_name ||
      exam.term?.name ||
      exam.term?.term ||
      "—"
    );
  };

  const getTypeLabel = (type) => {
    if (!type) return "—";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Examinations
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and monitor examinations for your school.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadExaminations(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Examinations
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {statistics.total}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Published
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {statistics.published}
                </p>
              </div>

              <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unpublished
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {statistics.unpublished}
                </p>
              </div>

              <div className="rounded-lg bg-orange-500/10 p-3 text-orange-600">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-700">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search examinations..."
                className="w-full rounded-lg border border-gray-300 bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary dark:border-gray-600"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-gray-600"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Unpublished</option>
            </select>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-card dark:border-gray-700">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading examinations...
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-700 md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Examination
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Type
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Class
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Session
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Term
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Dates
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
                    {filteredExaminations.map((exam) => (
                      <tr
                        key={exam.id}
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {exam.name || "Unnamed Examination"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {getTypeLabel(exam.examination_type)}
                        </td>

                        <td className="px-5 py-4">
                          {getClassName(exam)}
                        </td>

                        <td className="px-5 py-4">
                          {getSessionName(exam)}
                        </td>

                        <td className="px-5 py-4">
                          {getTermName(exam)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />

                            <span>
                              {formatDate(exam.start_date)}
                              {" — "}
                              {formatDate(exam.end_date)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {exam.is_published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                              <XCircle className="h-3.5 w-3.5" />
                              Unpublished
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredExaminations.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-gray-500">
                  No examinations found.
                </div>
              )}
            </div>

            {/* MOBILE */}
            <div className="space-y-3 md:hidden">
              {filteredExaminations.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {exam.name || "Unnamed Examination"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {getClassName(exam)}
                      </p>
                    </div>

                    {exam.is_published ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-orange-500" />
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {getTypeLabel(exam.examination_type)}
                    </span>

                    <span>
                      {getTermName(exam)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                    <span className="text-xs text-gray-500">
                      {formatDate(exam.start_date)}
                      {" — "}
                      {formatDate(exam.end_date)}
                    </span>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
                      title="View examination"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredExaminations.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-card px-5 py-12 text-center text-sm text-gray-500 dark:border-gray-700">
                  No examinations found.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrincipalExaminations;