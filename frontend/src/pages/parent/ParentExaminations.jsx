import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import api from "../../services/api";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (exam) => {
  if (exam.is_published) {
    return {
      label: "Published",
      className:
        "border-primary/20 bg-primary/10 text-primary",
    };
  }

  if (exam.is_active) {
    return {
      label: "Active",
      className:
        "border-secondary/20 bg-secondary/10 text-secondary",
    };
  }

  return {
    label: "Inactive",
    className:
      "border-text/10 bg-background text-text/60",
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParentExaminations() {
  const navigate = useNavigate();

  const [examinations, setExaminations] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD EXAMINATIONS
  // ==========================================================

  const loadExaminations = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        "/examinations/"
      );

      setExaminations(
        getArray(response.data)
      );
    } catch (err) {
      console.error(
        "Failed to load parent examinations:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load examinations."
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
  // FILTER
  // ==========================================================

  const filteredExaminations = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return examinations;
    }

    return examinations.filter((exam) => {
      return [
        exam.name,
        exam.examination_type_display,
        exam.class_name,
        exam.session_name,
        exam.term_name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term)
        );
    });
  }, [examinations, search]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-text/70">
          <Loader2
            size={22}
            className="animate-spin text-primary"
          />
          <span>
            Loading examinations...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">

        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText
                size={22}
                className="text-primary"
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Examinations
              </h1>

              <p className="text-sm text-text/60 mt-1">
                Examination schedules for your children
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadExaminations(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-text/10 bg-card px-4 py-2.5 text-sm font-medium hover:bg-background transition disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {error}
        </div>
      )}

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="rounded-xl border border-text/10 bg-card p-4 mb-6 shadow-sm">

        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search examinations..."
            className="w-full rounded-lg border border-text/10 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ======================================================
          EMPTY
      ====================================================== */}

      {filteredExaminations.length === 0 ? (
        <div className="rounded-xl border border-text/10 bg-card p-10 text-center shadow-sm">

          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarDays
              size={26}
              className="text-primary"
            />
          </div>

          <h2 className="text-lg font-semibold">
            No examinations found
          </h2>

          <p className="mt-2 text-sm text-text/60">
            {search
              ? "No examination matches your search."
              : "There are currently no examination schedules available for your children."}
          </p>
        </div>
      ) : (
        <>
          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="hidden md:block overflow-hidden rounded-xl border border-text/10 bg-card shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="border-b border-text/10 bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Examination
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Type
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Class
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Session
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Term
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Dates
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExaminations.map(
                    (exam) => {
                      const status =
                        getStatus(exam);

                      return (
                        <tr
                          key={exam.id}
                          className="border-b border-text/5 last:border-b-0 hover:bg-background/60"
                        >
                          <td className="px-4 py-4 font-medium">
                            {exam.name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {exam.examination_type_display ||
                              exam.examination_type ||
                              "—"}
                          </td>

                          <td className="px-4 py-4">
                            {exam.class_level_name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {exam.academic_session_name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {exam.term_name || "—"}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            {formatDate(
                              exam.start_date
                            )}

                            {" — "}

                            {formatDate(
                              exam.end_date
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/parent/examinations/${exam.id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================================
              MOBILE CARDS
          ================================================== */}

          <div className="md:hidden space-y-4">

            {filteredExaminations.map(
              (exam) => {
                const status =
                  getStatus(exam);

                return (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-text/10 bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <h2 className="font-semibold truncate">
                          {exam.name || "—"}
                        </h2>

                        <p className="mt-1 text-xs text-text/60">
                          {exam.examination_type_display ||
                            exam.examination_type ||
                            "Examination"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                      <div>
                        <p className="text-xs text-text/50">
                          Class
                        </p>
                        <p className="font-medium mt-1">
                          {exam.class_level_name ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text/50">
                          Term
                        </p>
                        <p className="font-medium mt-1">
                          {exam.term_name ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text/50">
                          Session
                        </p>
                        <p className="font-medium mt-1">
                          {exam.academic_session_name ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text/50">
                          Dates
                        </p>
                        <p className="font-medium mt-1">
                          {formatDate(
                            exam.start_date
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/parent/examinations/${exam.id}`
                        )
                      }
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      <Eye size={17} />
                      View Examination
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </div>
  );
}