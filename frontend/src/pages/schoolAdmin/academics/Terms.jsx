import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTerms,
  deleteTerm,
  getSessions,
} from "../../../services/academicsService";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [termsData, sessionsData] = await Promise.all([
        getTerms(),
        getSessions(),
      ]);

      setTerms(Array.isArray(termsData) ? termsData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (err) {
      console.error("Failed to load academic terms:", err);
      setError("Failed to load academic terms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSessionName = (term) => {
    if (term.academic_session_name) {
      return term.academic_session_name;
    }

    if (term.session_name) {
      return term.session_name;
    }

    if (typeof term.academic_session === "object") {
      return (
        term.academic_session.name ||
        term.academic_session.title ||
        "—"
      );
    }

    if (term.academic_session) {
      const session = sessions.find(
        (item) => item.id === term.academic_session,
      );

      return session?.name || `Session ${term.academic_session}`;
    }

    if (term.session) {
      const session = sessions.find(
        (item) => item.id === term.session,
      );

      return session?.name || `Session ${term.session}`;
    }

    return "—";
  };

  const getTermName = (term) => {
    return (
      term.name ||
      term.term_name ||
      term.term_display ||
      term.term ||
      "—"
    );
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic term?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTerm(id);

      setTerms((prev) =>
        prev.filter((term) => term.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete academic term:", err);

      alert("Failed to delete academic term.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading academic terms...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Academic Terms
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage academic terms for your school.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/academics/terms/add")
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Term
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadData}
                className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-400"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {terms.length === 0 ? (
        <div className="rounded-xl bg-[var(--color-card)] p-8 text-center shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
            <CalendarDays className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No Academic Terms
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first academic term.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/academics/terms/add")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Term
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
          {/* =========================
              DESKTOP TABLE
          ========================== */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Term
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Academic Session
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Start Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    End Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {terms.map((term) => (
                  <tr
                    key={term.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    {/* TERM */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
                          <CalendarDays className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold">
                            {getTermName(term)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ID: {term.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SESSION */}
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {getSessionName(term)}
                    </td>

                    {/* START DATE */}
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {term.start_date || "—"}
                    </td>

                    {/* END DATE */}
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {term.end_date || "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/academics/terms/${term.id}`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-primary)] transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View term"
                          aria-label="View term"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/academics/terms/${term.id}/edit`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Edit term"
                          aria-label="Edit term"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(term.id)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete term"
                          aria-label="Delete term"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =========================
              MOBILE LIST
          ========================== */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
            {terms.map((term) => (
              <div
                key={term.id}
                className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {getTermName(term)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {getSessionName(term)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {term.start_date || "—"} —{" "}
                    {term.end_date || "—"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/school-admin/academics/terms/${term.id}`,
                    )
                  }
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                  title="View term"
                  aria-label="View term"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Terms;