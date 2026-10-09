
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  School,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getTerms,
  deleteTerm,
  updateTerm,
  getSchools,
  getSessions,
  setCurrentTerm,
} from "../../../services/academicsService";

// Supports normal arrays and Django REST Framework responses.
const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }
  return [];
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return Number(value.id);
  }

  return Number(value);
};

const getSessionId = (term) => getId(term?.academic_session);

const getSessionLabel = (session) => {
  if (!session) return "Unknown session";

  return (
    session.name ||
    session.session_name ||
    session.academic_year ||
    `Session ${session.id}`
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parts = String(date).split("-");
  if (parts.length !== 3) return date;

  // Avoid timezone-related date changes.
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const value = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${value}`;
      })
      .join(" | ") || fallback;
  }

  if (error?.message) return error.message;

  return fallback;
};

const AllTerms = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedSession, setSelectedSession] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [settingCurrent, setSettingCurrent] = useState(null);
  const [busyTerm, setBusyTerm] = useState(null);

  // -------------------------------------------------------
  // LOAD TERMS, SCHOOLS AND SESSIONS
  // -------------------------------------------------------
  const loadTerms = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [termResponse, schoolResponse, sessionResponse] =
        await Promise.all([
          getTerms(),
          getSchools(),
          getSessions(),
        ]);

      const loadedTerms = getList(termResponse);
      const loadedSchools = getList(schoolResponse);
      const loadedSessions = getList(sessionResponse);

      // Diagnostics: compare these IDs with the browser Network response.
      console.log("AllTerms: raw API response", termResponse);
      console.log("AllTerms: normalized term IDs", loadedTerms.map((term) => ({
        id: term.id,
        name: term.name,
        academic_session: term.academic_session,
        start_date: term.start_date,
        end_date: term.end_date,
      })));
      console.log("AllTerms: loaded sessions", loadedSessions);

      setTerms(loadedTerms);
      setSchools(loadedSchools);
      setSessions(loadedSessions);
    } catch (err) {
      console.error("Failed to load academic terms:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to load academic terms. Please try again."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  // -------------------------------------------------------
  // SESSION AND SCHOOL LOOKUPS
  // -------------------------------------------------------
  const getSession = (sessionValue) => {
    if (sessionValue && typeof sessionValue === "object") {
      if (sessionValue.name) return sessionValue;

      const sessionId = getId(sessionValue);

      return (
        sessions.find((item) => Number(item.id) === sessionId) ||
        sessionValue
      );
    }

    const sessionId = getId(sessionValue);

    return sessions.find(
      (item) => Number(item.id) === sessionId
    );
  };

  const getSessionName = (sessionValue) => {
    return getSessionLabel(getSession(sessionValue));
  };

  const getSchoolName = (sessionValue) => {
    const session = getSession(sessionValue);
    if (!session) return "—";

    const schoolValue = session.school;

    if (
      schoolValue &&
      typeof schoolValue === "object" &&
      schoolValue.name
    ) {
      return schoolValue.name;
    }

    const schoolId = getId(schoolValue);

    const school = schools.find(
      (item) => Number(item.id) === schoolId
    );

    return school?.name || school?.school_name || "—";
  };

  // -------------------------------------------------------
  // FILTER AND SORT
  // -------------------------------------------------------
  const filteredTerms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...terms]
      .filter((term) => {
        if (selectedSession !== "all") {
          if (
            getSessionId(term) !== Number(selectedSession)
          ) {
            return false;
          }
        }

        if (!query) return true;

        const sessionName = getSessionName(
          term.academic_session
        );

        const schoolName = getSchoolName(
          term.academic_session
        );

        return [
          term.name,
          sessionName,
          schoolName,
          term.start_date,
          term.end_date,
          term.id,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );
      })
      .sort((a, b) => {
        const sessionComparison = getSessionName(
          a.academic_session
        ).localeCompare(
          getSessionName(b.academic_session)
        );

        if (sessionComparison !== 0) {
          return sessionComparison;
        }

        return String(a.start_date || "").localeCompare(
          String(b.start_date || "")
        );
      });
  }, [terms, selectedSession, searchTerm, sessions, schools]);

  // -------------------------------------------------------
  // SET CURRENT TERM
  // -------------------------------------------------------
  const handleSetCurrent = async (term) => {
    const sessionName = getSessionName(
      term.academic_session
    );

    const confirmed = window.confirm(
      `Set ${term.name} as the current term for ${sessionName}?`
    );

    if (!confirmed) return;

    try {
      setSettingCurrent(term.id);

      await setCurrentTerm(term.id);

      setTerms((previous) =>
        previous.map((item) => {
          if (
            getSessionId(item) !== getSessionId(term)
          ) {
            return item;
          }

          return {
            ...item,
            is_current:
              Number(item.id) === Number(term.id),
          };
        })
      );
    } catch (err) {
      console.error("Failed to set current term:", err);

      window.alert(
        getErrorMessage(err, "Failed to set current term.")
      );
    } finally {
      setSettingCurrent(null);
    }
  };

  // -------------------------------------------------------
  // DELETE TERM
  // -------------------------------------------------------
  const handleDelete = async (term) => {
    const confirmed = window.confirm(
      `Delete ${term.name} for ${getSessionName(
        term.academic_session
      )}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setBusyTerm(term.id);

      await deleteTerm(term.id);

      setTerms((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(term.id)
        )
      );
    } catch (err) {
      console.error("Failed to delete term:", err);

      window.alert(
        getErrorMessage(err, "Failed to delete term.")
      );
    } finally {
      setBusyTerm(null);
    }
  };

  // -------------------------------------------------------
  // TOGGLE ACTIVE / INACTIVE
  // -------------------------------------------------------
  const handleToggleStatus = async (term) => {
    try {
      setBusyTerm(term.id);

      const response = await updateTerm(term.id, {
        academic_session: getSessionId(term),
        name: term.name,
        start_date: term.start_date,
        end_date: term.end_date,
        is_current: Boolean(term.is_current),
        is_active: !term.is_active,
      });

      const updatedTerm = response?.data || response;

      setTerms((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(term.id)
            ? { ...item, ...updatedTerm }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update term status:", err);

      window.alert(
        getErrorMessage(err, "Failed to update term status.")
      );
    } finally {
      setBusyTerm(null);
    }
  };

  // -------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------
  const renderActions = (term) => (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => navigate(`/admin/terms/${term.id}`)}
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
      >
        <Eye size={15} />
        View
      </button>

      <button
        type="button"
        onClick={() =>
          navigate(`/admin/terms/${term.id}/edit`)
        }
        className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
      >
        Edit
      </button>

      <button
        type="button"
        disabled={busyTerm === term.id}
        onClick={() => handleDelete(term)}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
      >
        {busyTerm === term.id ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        Delete
      </button>
    </div>
  );

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
        <Loader2
          className="mr-2 animate-spin text-[var(--color-primary)]"
          size={20}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading academic terms...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------
  // PAGE
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-1 rounded-lg border border-slate-200 p-2 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              Academic Terms
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage terms, dates, and current-term settings.
            </p>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredTerms.length} of {terms.length}{" "}
              loaded term{terms.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => loadTerms(false)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800 sm:w-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/terms/add")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            <Plus size={17} />
            Add Term
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
        >
          <CircleAlert size={20} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Unable to load or update terms
            </p>
            <p className="mt-1 break-words text-sm">
              {error}
            </p>
            <button
              type="button"
              onClick={() => loadTerms()}
              className="mt-2 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-[var(--color-card)] p-4 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700 sm:grid-cols-2">
        <div>
          <label
            htmlFor="term-session-filter"
            className="mb-1.5 block text-sm font-medium"
          >
            Academic session
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="term-session-filter"
              value={selectedSession}
              onChange={(event) =>
                setSelectedSession(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-600"
            >
              <option value="all">All academic sessions</option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {getSessionLabel(session)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="term-search"
            className="mb-1.5 block text-sm font-medium"
          >
            Search terms
          </label>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="term-search"
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search term, session, school or date..."
              className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-600"
            />
          </div>
        </div>
      </div>

      {/* TERMS */}
      <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
        {filteredTerms.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <School
              size={35}
              className="mx-auto mb-3 text-slate-400"
            />

            <h2 className="font-semibold">
              No terms found
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {terms.length === 0
                ? "The API did not return any terms."
                : "No terms match your current search or session filter."}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {(searchTerm || selectedSession !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSession("all");
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
                >
                  Clear filters
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/admin/terms/add")}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
              >
                Add Term
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {[
                      "Term",
                      "Academic Session",
                      "School",
                      "Start Date",
                      "End Date",
                      "Current",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredTerms.map((term) => (
                    <tr
                      key={term.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-semibold">
                          {term.name || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          ID: {term.id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm">
                        {getSessionName(term.academic_session)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {getSchoolName(term.academic_session)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(term.start_date)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(term.end_date)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {term.is_current ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <CheckCircle2 size={13} />
                            Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              settingCurrent === term.id ||
                              busyTerm === term.id
                            }
                            onClick={() => handleSetCurrent(term)}
                            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {settingCurrent === term.id
                              ? "Setting..."
                              : "Set Current"}
                          </button>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          disabled={
                            busyTerm === term.id ||
                            settingCurrent === term.id
                          }
                          onClick={() => handleToggleStatus(term)}
                          className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                            term.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {busyTerm === term.id
                            ? "Saving..."
                            : term.is_active
                              ? "Active"
                              : "Inactive"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        {renderActions(term)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
              {filteredTerms.map((term) => (
                <article
                  key={term.id}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold">
                        {term.name || "—"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {getSessionName(term.academic_session)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {getSchoolName(term.academic_session)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Term ID: {term.id}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        term.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {term.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDate(term.start_date)}</span>
                    <span>to</span>
                    <span>{formatDate(term.end_date)}</span>

                    {term.is_current && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!term.is_current && (
                      <button
                        type="button"
                        disabled={
                          settingCurrent === term.id ||
                          busyTerm === term.id
                        }
                        onClick={() => handleSetCurrent(term)}
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {settingCurrent === term.id
                          ? "Setting..."
                          : "Set Current"}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        busyTerm === term.id ||
                        settingCurrent === term.id
                      }
                      onClick={() => handleToggleStatus(term)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium dark:border-slate-600"
                    >
                      {busyTerm === term.id
                        ? "Saving..."
                        : "Toggle Status"}
                    </button>
                  </div>

                  {renderActions(term)}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllTerms;




// import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getTerms,
//   deleteTerm,
//   updateTerm,
//   getSchools,
//   getSessions,
//   setCurrentTerm,
// } from "../../../services/academicsService";

// // Supports both ordinary arrays and Django REST Framework responses.
// const getList = (response) => {
//   if (Array.isArray(response)) return response;
//   if (Array.isArray(response?.results)) return response.results;
//   if (Array.isArray(response?.data)) return response.data;
//   return [];
// };

// // The API may return an ID or a nested academic-session object.
// const getSessionId = (term) => {
//   const session = term?.academic_session;
//   return Number(
//     typeof session === "object" && session !== null
//       ? session.id
//       : session
//   );
// };

// const getSchoolId = (session) => {
//   const school = session?.school;
//   return Number(
//     typeof school === "object" && school !== null
//       ? school.id
//       : school
//   );
// };

// const AllTerms = () => {
//   const navigate = useNavigate();

//   const [terms, setTerms] = useState([]);
//   const [schools, setSchools] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [settingCurrent, setSettingCurrent] = useState(null);
//   const [busyTerm, setBusyTerm] = useState(null);

//   const loadTerms = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [termData, schoolData, sessionData] = await Promise.all([
//         getTerms(),
//         getSchools(),
//         getSessions(),
//       ]);

//       const normalizedTerms = getList(termData);
//       const normalizedSchools = getList(schoolData);
//       const normalizedSessions = getList(sessionData);

//       console.log("All Terms API response:", termData);
//       console.log("Normalized terms:", normalizedTerms);

//       setTerms(normalizedTerms);
//       setSchools(normalizedSchools);
//       setSessions(normalizedSessions);
//     } catch (err) {
//       console.error("Failed to load terms:", err);
//       setError(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to load terms. Please refresh and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadTerms();
//   }, [loadTerms]);

//   const getSession = (termOrSessionId) => {
//     const sessionId =
//       typeof termOrSessionId === "object" && termOrSessionId !== null
//         ? getSessionId(termOrSessionId)
//         : Number(termOrSessionId);

//     return sessions.find(
//       (session) => Number(session.id) === sessionId
//     );
//   };

//   const getSessionName = (termOrSessionId) => {
//     if (
//       typeof termOrSessionId === "object" &&
//       termOrSessionId !== null &&
//       termOrSessionId.name
//     ) {
//       return termOrSessionId.name;
//     }

//     return getSession(termOrSessionId)?.name || "—";
//   };

//   const getSchoolName = (termOrSessionId) => {
//     const session = getSession(termOrSessionId);

//     // The session may include its school as an object.
//     if (
//       typeof session?.school === "object" &&
//       session.school !== null
//     ) {
//       return session.school.name || "—";
//     }

//     const schoolId = session
//       ? getSchoolId(session)
//       : typeof termOrSessionId === "object" &&
//           termOrSessionId !== null
//         ? getSchoolId(termOrSessionId)
//         : NaN;

//     const school = schools.find(
//       (item) => Number(item.id) === schoolId
//     );

//     return school?.name || "—";
//   };

//   const handleSetCurrent = async (term) => {
//     const sessionId = getSessionId(term);

//     const confirmed = window.confirm(
//       `Set ${term.name} as the current term for ${getSessionName(
//         term.academic_session
//       )}?`
//     );

//     if (!confirmed) return;

//     try {
//       setSettingCurrent(term.id);
//       await setCurrentTerm(term.id);

//       setTerms((previous) =>
//         previous.map((item) => ({
//           ...item,
//           is_current:
//             getSessionId(item) === sessionId
//               ? Number(item.id) === Number(term.id)
//               : item.is_current,
//         }))
//       );
//     } catch (err) {
//       console.error("Failed to set current term:", err);
//       window.alert(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to set current term."
//       );
//     } finally {
//       setSettingCurrent(null);
//     }
//   };

//   const handleDelete = async (term) => {
//     const confirmed = window.confirm(
//       `Delete ${term.name} for ${getSessionName(
//         term.academic_session
//       )}? This action cannot be undone.`
//     );

//     if (!confirmed) return;

//     try {
//       setBusyTerm(term.id);
//       await deleteTerm(term.id);

//       setTerms((previous) =>
//         previous.filter(
//           (item) => Number(item.id) !== Number(term.id)
//         )
//       );
//     } catch (err) {
//       console.error("Failed to delete term:", err);
//       window.alert(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to delete term."
//       );
//     } finally {
//       setBusyTerm(null);
//     }
//   };

//   const handleToggleStatus = async (term) => {
//     try {
//       setBusyTerm(term.id);

//       const updatedTerm = await updateTerm(term.id, {
//         academic_session: getSessionId(term),
//         name:
//           typeof term.name === "string"
//             ? term.name.toUpperCase()
//             : term.name,
//         start_date: term.start_date,
//         end_date: term.end_date,
//         is_current: term.is_current,
//         is_active: !term.is_active,
//       });

//       const normalizedUpdatedTerm =
//         updatedTerm?.data || updatedTerm;

//       setTerms((previous) =>
//         previous.map((item) =>
//           Number(item.id) === Number(term.id)
//             ? { ...item, ...normalizedUpdatedTerm }
//             : item
//         )
//       );
//     } catch (err) {
//       console.error("Failed to update term status:", err);
//       window.alert(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to update term status."
//       );
//     } finally {
//       setBusyTerm(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
//         <p className="text-sm text-slate-500 dark:text-slate-400">
//           Loading terms...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold">Terms</h1>
//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             Manage academic terms.
//           </p>
//         </div>

//         <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
//           {error}
//           <button
//             type="button"
//             onClick={loadTerms}
//             className="ml-3 font-semibold underline"
//           >
//             Try again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Sort terms by session, then by term start date.
//   const sortedTerms = [...terms].sort((a, b) => {
//     const sessionComparison = getSessionName(
//       a.academic_session
//     ).localeCompare(getSessionName(b.academic_session));

//     if (sessionComparison !== 0) return sessionComparison;

//     return String(a.start_date || "").localeCompare(
//       String(b.start_date || "")
//     );
//   });

//   const renderActions = (term) => (
//     <div className="flex flex-wrap items-center gap-3">
//       <button
//         type="button"
//         onClick={() => navigate(`/admin/terms/${term.id}`)}
//         className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
//       >
//         View
//       </button>

//       <button
//         type="button"
//         onClick={() => navigate(`/admin/terms/${term.id}/edit`)}
//         className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
//       >
//         Edit
//       </button>

//       <button
//         type="button"
//         disabled={busyTerm === term.id}
//         onClick={() => handleDelete(term)}
//         className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
//       >
//         {busyTerm === term.id ? "Please wait..." : "Delete"}
//       </button>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Terms</h1>
//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             Manage academic terms.
//           </p>
//           <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
//             {terms.length} term{terms.length === 1 ? "" : "s"} loaded
//           </p>
//         </div>

//         <div className="flex flex-col gap-2 sm:flex-row">
//           <button
//             type="button"
//             onClick={loadTerms}
//             className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800 sm:w-auto"
//           >
//             Refresh
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/admin/terms/add")}
//             className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
//           >
//             + Add Term
//           </button>
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
//         {sortedTerms.length === 0 ? (
//           <div className="p-8 text-center sm:p-10">
//             <p className="text-slate-500 dark:text-slate-400">
//               No terms were returned by the API.
//             </p>
//             <button
//               type="button"
//               onClick={() => navigate("/admin/terms/add")}
//               className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
//             >
//               Add your first term
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* Desktop and tablet table */}
//             <div className="hidden overflow-x-auto md:block">
//               <table className="min-w-full">
//                 <thead className="bg-slate-50 dark:bg-slate-800/60">
//                   <tr>
//                     {[
//                       "Term",
//                       "Academic Session",
//                       "School",
//                       "Start Date",
//                       "End Date",
//                       "Current",
//                       "Status",
//                       "Actions",
//                     ].map((heading) => (
//                       <th
//                         key={heading}
//                         className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
//                       >
//                         {heading}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
//                   {sortedTerms.map((term) => (
//                     <tr
//                       key={term.id}
//                       className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
//                     >
//                       <td className="whitespace-nowrap px-5 py-4 font-medium">
//                         {term.name || "—"}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                         {getSessionName(term.academic_session)}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                         {getSchoolName(term.academic_session)}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                         {term.start_date || "—"}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                         {term.end_date || "—"}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4">
//                         {term.is_current ? (
//                           <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
//                             Current
//                           </span>
//                         ) : (
//                           <button
//                             type="button"
//                             disabled={settingCurrent === term.id}
//                             onClick={() => handleSetCurrent(term)}
//                             className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
//                           >
//                             {settingCurrent === term.id
//                               ? "Setting..."
//                               : "Set Current"}
//                           </button>
//                         )}
//                       </td>

//                       <td className="whitespace-nowrap px-5 py-4">
//                         <button
//                           type="button"
//                           disabled={busyTerm === term.id}
//                           onClick={() => handleToggleStatus(term)}
//                           className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
//                             term.is_active
//                               ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
//                               : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
//                           }`}
//                         >
//                           {busyTerm === term.id
//                             ? "Saving..."
//                             : term.is_active
//                               ? "Active"
//                               : "Inactive"}
//                         </button>
//                       </td>

//                       <td className="px-5 py-4">
//                         {renderActions(term)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile cards */}
//             <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
//               {sortedTerms.map((term) => (
//                 <div key={term.id} className="space-y-3 p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <h2 className="font-semibold">
//                         {term.name || "—"}
//                       </h2>
//                       <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
//                         {getSessionName(term.academic_session)}
//                       </p>
//                       <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                         {getSchoolName(term.academic_session)}
//                       </p>
//                     </div>

//                     <span
//                       className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
//                         term.is_active
//                           ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
//                           : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
//                       }`}
//                     >
//                       {term.is_active ? "Active" : "Inactive"}
//                     </span>
//                   </div>

//                   <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
//                     <span>{term.start_date || "—"}</span>
//                     <span>to</span>
//                     <span>{term.end_date || "—"}</span>
//                     {term.is_current && (
//                       <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
//                         Current
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-2">
//                     {!term.is_current && (
//                       <button
//                         type="button"
//                         disabled={settingCurrent === term.id}
//                         onClick={() => handleSetCurrent(term)}
//                         className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
//                       >
//                         {settingCurrent === term.id
//                           ? "Setting..."
//                           : "Set Current"}
//                       </button>
//                     )}

//                     <button
//                       type="button"
//                       disabled={busyTerm === term.id}
//                       onClick={() => handleToggleStatus(term)}
//                       className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium dark:border-slate-600"
//                     >
//                       Toggle Status
//                     </button>
//                   </div>

//                   {renderActions(term)}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllTerms;
