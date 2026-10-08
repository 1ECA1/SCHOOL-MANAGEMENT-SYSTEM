import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import api from "../../../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [model, setModel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          page,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (action) {
          params.action = action;
        }

        if (model.trim()) {
          params.model = model.trim();
        }

        if (dateFrom) {
          params.date_from = dateFrom;
        }

        if (dateTo) {
          params.date_to = dateTo;
        }

        const response = await api.get("/audit/", {
          params,
        });

        const data = response.data;

        if (Array.isArray(data)) {
          setLogs(data);
          setNextPage(null);
          setPreviousPage(null);
        } else {
          setLogs(data.results || []);
          setNextPage(data.next || null);
          setPreviousPage(data.previous || null);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load audit logs. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, action, model, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAction("");
    setModel("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters =
    search ||
    action ||
    model ||
    dateFrom ||
    dateTo;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return date.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionBadge = (value) => {
    const actionValue = String(value || "").toUpperCase();

    const styles = {
      CREATE:
        "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",

      UPDATE:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

      DELETE:
        "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

      LOGIN:
        "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

      LOGOUT:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",

      OTHER:
        "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          styles[actionValue] || styles.OTHER
        }`}
      >
        {actionValue || "OTHER"}
      </span>
    );
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <Activity size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                System Audit Logs
              </h1>

              <p className="text-sm text-[var(--color-secondary)]">
                Monitor important activities performed across the system.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs({ refresh: true })}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5"
        >
          {/* SEARCH */}
          <div className="relative lg:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit logs..."
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          {/* ACTION */}
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="OTHER">Other</option>
          </select>

          {/* MODEL */}
          <input
            type="text"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(1);
            }}
            placeholder="Module / model"
            className="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />

          {/* DATE RANGE */}
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-9 pr-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="relative min-w-0 flex-1">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-9 pr-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </form>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              <X size={15} />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* AUDIT TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
        {/* =====================================================
            MOBILE TABLE
            ONLY USER + VIEW
        ====================================================== */}
        <div className="block sm:hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  View
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2
                        size={25}
                        className="animate-spin"
                      />

                      <span className="text-sm">
                        Loading system audit logs...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity
                        size={35}
                        className="text-gray-300"
                      />

                      <p className="font-medium text-[var(--color-text)]">
                        No audit logs found
                      </p>

                      <p className="text-sm text-gray-500">
                        There are no system audit records matching your
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-gray-50/60"
                  >
                    {/* USER */}
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--color-text)]">
                          {log.user_name || "System"}
                        </div>

                        {log.user_role && (
                          <div className="mt-0.5 truncate text-xs text-gray-500">
                            {log.user_role}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* VIEW */}
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            DESKTOP / TABLET TABLE
            ALL COLUMNS
        ====================================================== */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-[950px] w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date & Time
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Module
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  View
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2
                        size={25}
                        className="animate-spin"
                      />

                      <span className="text-sm">
                        Loading system audit logs...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity
                        size={35}
                        className="text-gray-300"
                      />

                      <p className="font-medium text-[var(--color-text)]">
                        No audit logs found
                      </p>

                      <p className="text-sm text-gray-500">
                        There are no system audit records matching your
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-gray-50/60"
                  >
                    {/* DATE */}
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-text)]">
                      {formatDate(log.created_at)}
                    </td>

                    {/* USER */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--color-text)]">
                        {log.user_name || "System"}
                      </div>

                      {log.user_role && (
                        <div className="mt-0.5 text-xs text-gray-500">
                          {log.user_role}
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4">
                      {getActionBadge(log.action)}
                    </td>

                    {/* MODULE */}
                    <td className="px-4 py-4 text-sm font-medium text-[var(--color-text)]">
                      {log.model_name || "—"}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="max-w-[350px] px-4 py-4">
                      <p className="truncate text-sm text-gray-600">
                        {log.description ||
                          log.object_repr ||
                          "No description"}
                      </p>
                    </td>

                    {/* VIEW */}
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              disabled={!previousPage}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span className="hidden xs:inline">
                Previous
              </span>
            </button>

            <span className="text-sm text-gray-500">
              Page {page}
            </span>

            <button
              type="button"
              disabled={!nextPage}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden xs:inline">
                Next
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Audit Details
                </h2>

                <p className="text-sm text-gray-500">
                  Audit record #{selectedLog.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <DetailItem
                label="Date & Time"
                value={formatDate(selectedLog.created_at)}
              />

              <DetailItem
                label="User"
                value={selectedLog.user_name || "System"}
              />

              <DetailItem
                label="Role"
                value={selectedLog.user_role || "SYSTEM"}
              />

              <DetailItem
                label="Action"
                value={
                  selectedLog.action_display ||
                  selectedLog.action ||
                  "OTHER"
                }
              />

              <DetailItem
                label="Module"
                value={selectedLog.model_name || "—"}
              />

              <DetailItem
                label="Object ID"
                value={selectedLog.object_id || "—"}
              />

              <DetailItem
                label="Object"
                value={selectedLog.object_repr || "—"}
              />

              <DetailItem
                label="IP Address"
                value={selectedLog.ip_address || "—"}
              />

              <div className="sm:col-span-2">
                <DetailItem
                  label="Description"
                  value={
                    selectedLog.description ||
                    "No description"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="break-words text-sm font-medium text-[var(--color-text)]">
      {value}
    </p>
  </div>
);

export default AuditLogs;