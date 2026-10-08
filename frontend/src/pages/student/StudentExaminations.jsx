
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";

import api from "../../services/api";

const StudentExaminations = () => {
  const navigate = useNavigate();

  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      setError("");

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
    }
  };

  const filteredExaminations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return examinations;
    }

    return examinations.filter((exam) => {
      return [
        exam.name,
        exam.examination_type_display,
        exam.examination_type,
        exam.class_level_name,
        exam.academic_session_name,
        exam.term_name,
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(value),
      );
    });
  }, [examinations, search]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (exam) => {
    if (!exam.start_date && !exam.end_date) {
      return "—";
    }

    if (exam.start_date && exam.end_date) {
      if (exam.start_date === exam.end_date) {
        return formatDate(exam.start_date);
      }

      return `${formatDate(exam.start_date)} – ${formatDate(exam.end_date)}`;
    }

    return formatDate(exam.start_date || exam.end_date);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
                <FileText size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Examinations
                </h1>

                <p className="text-sm opacity-70">
                  View your published examination schedules.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-card)] px-4 py-2 text-sm shadow-sm">
            <span className="opacity-70">Total Exams: </span>
            <span className="font-semibold">
              {examinations.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 shadow-sm dark:border-white/10">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search examinations..."
              className="w-full rounded-lg border border-black/10 bg-[var(--color-background)] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[var(--color-primary)] dark:border-white/10"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 transition hover:opacity-100"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-black/5 bg-[var(--color-card)] dark:border-white/10">
            <div className="flex items-center gap-3 text-sm opacity-70">
              <Loader2
                size={20}
                className="animate-spin text-[var(--color-primary)]"
              />
              Loading examinations...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-card)] p-6 text-center shadow-sm">
            <p className="text-sm">{error}</p>

            <button
              type="button"
              onClick={fetchExaminations}
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredExaminations.length === 0 && (
          <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-10 text-center shadow-sm dark:border-white/10">
            <FileText
              size={42}
              className="mx-auto mb-4 opacity-30"
            />

            <h2 className="text-lg font-semibold">
              No examinations found
            </h2>

            <p className="mt-1 text-sm opacity-60">
              {search
                ? "No examinations match your search."
                : "There are currently no published examinations available."}
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && filteredExaminations.length > 0 && (
          <div className="hidden overflow-hidden rounded-xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-black/5 bg-[var(--color-background)] dark:border-white/10">
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

                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExaminations.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-black/5 last:border-b-0 hover:bg-[var(--color-background)] dark:border-white/10"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {exam.name || "Unnamed Examination"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {exam.examination_type_display ||
                          exam.examination_type ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {exam.class_level_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {exam.academic_session_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {exam.term_name || "—"}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {formatDateRange(exam)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/student/examinations/${exam.id}`,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)]/20 px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                        >
                          View
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && !error && filteredExaminations.length > 0 && (
          <div className="space-y-3 md:hidden">
            {filteredExaminations.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() =>
                  navigate(`/student/examinations/${exam.id}`)
                }
                className="w-full rounded-xl border border-black/5 bg-[var(--color-card)] p-4 text-left shadow-sm transition hover:border-[var(--color-primary)]/30 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">
                      {exam.name || "Unnamed Examination"}
                    </h2>

                    <p className="mt-1 text-xs opacity-60">
                      {exam.examination_type_display ||
                        exam.examination_type ||
                        "Examination"}
                    </p>
                  </div>

                  <ChevronRight
                    size={19}
                    className="shrink-0 text-[var(--color-primary)]"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs opacity-50">Class</p>
                    <p className="mt-0.5 font-medium">
                      {exam.class_level_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-50">Session</p>
                    <p className="mt-0.5 font-medium">
                      {exam.academic_session_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-50">Term</p>
                    <p className="mt-0.5 font-medium">
                      {exam.term_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-50">Dates</p>
                    <p className="mt-0.5 font-medium">
                      {formatDateRange(exam)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExaminations;


