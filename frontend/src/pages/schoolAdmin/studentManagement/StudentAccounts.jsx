
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import api from "../../../services/api";

// ============================================================
// ENDPOINTS
// ============================================================

const ENDPOINTS = {
  list: "/students/accounts/",
};

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (Array.isArray(value) && value.length) {
      return `${key}: ${value[0]}`;
    }

    if (typeof value === "string") {
      return `${key}: ${value}`;
    }
  }

  return "Something went wrong. Please try again.";
}

function getResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

// ============================================================
// STATUS BADGE
// ============================================================

function AccountStatusBadge({ student }) {
  if (!student.has_account) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
        <UserX size={13} />
        No Account
      </span>
    );
  }

  if (student.account_is_active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <UserCheck size={13} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
      <UserX size={13} />
      Inactive
    </span>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function StudentAccounts() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState("");

  const [totalCount, setTotalCount] = useState(0);

  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  const loadStudents = useCallback(
    async ({ showLoader = true } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (accountStatus) {
          params.account_status = accountStatus;
        }

        const response = await api.get(ENDPOINTS.list, {
          params,
        });

        const data = response.data;
        const results = getResults(data);

        setStudents(results);

        setTotalCount(
          typeof data?.count === "number"
            ? data.count
            : results.length
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, accountStatus]
  );

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [loadStudents]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadStudents({
      showLoader: false,
    });
  };

  // ==========================================================
  // COUNTS
  // ==========================================================

  const activeCount = students.filter(
    (student) =>
      student.has_account &&
      student.account_is_active
  ).length;

  const inactiveCount = students.filter(
    (student) =>
      student.has_account &&
      !student.account_is_active
  ).length;

  const noAccountCount = students.filter(
    (student) => !student.has_account
  ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen min-w-0 bg-slate-50 p-3 sm:p-6 lg:p-8">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              Student Accounts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage student login accounts and access.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-800">
              Unable to load student accounts
            </p>

            <p className="mt-1 break-words text-sm text-red-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="shrink-0 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* STAT CARDS */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Students
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total found
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {activeCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Login enabled
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {inactiveCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Login disabled
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            No Account
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-600">
            {noAccountCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ready to create
          </p>
        </div>
      </div>

      {/* SEARCH / FILTER */}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, admission number, email or username..."
              className="w-full min-w-0 rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:pr-4"
            />
          </div>

          <select
            value={accountStatus}
            onChange={(event) =>
              setAccountStatus(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 lg:w-56"
          >
            <option value="">All Account Status</option>
            <option value="HAS_ACCOUNT">Has Account</option>
            <option value="NO_ACCOUNT">No Account</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* STUDENT ACCOUNTS TABLE */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="w-full min-w-0">
          <table className="w-full table-fixed">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {/* Always visible */}

                <th className="w-[72%] px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 md:w-auto">
                  Student
                </th>

                {/* Desktop only */}

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Class
                </th>

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Contact
                </th>

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Username
                </th>

                <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Account Status
                </th>

                {/* Always visible */}

                <th className="w-[28%] px-3 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 md:w-auto">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-16 text-center sm:px-5"
                  >
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading student accounts...
                    </p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-16 text-center sm:px-5"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <GraduationCap size={27} />
                      </div>

                      <p className="mt-4 font-semibold text-slate-800">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or account status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* STUDENT: MOBILE AND DESKTOP */}

                    <td className="px-3 py-4 sm:px-5">
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:h-10 sm:w-10">
                          <GraduationCap size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold leading-5 text-slate-900 sm:text-base">
                            {student.full_name}
                          </p>

                          <p className="mt-0.5 break-words text-xs text-slate-500">
                            {student.admission_number}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CLASS: DESKTOP ONLY */}

                    <td className="hidden px-5 py-4 md:table-cell">
                      <p className="text-sm font-medium text-slate-700">
                        {student.class_name || "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {student.academic_session_name || ""}
                      </p>
                    </td>

                    {/* CONTACT: DESKTOP ONLY */}

                    <td className="hidden px-5 py-4 md:table-cell">
                      <div className="space-y-1">
                        {student.email && (
                          <div className="flex max-w-[230px] items-center gap-2">
                            <Mail
                              size={13}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate text-xs text-slate-600">
                              {student.email}
                            </span>
                          </div>
                        )}

                        {student.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone
                              size={13}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-xs text-slate-600">
                              {student.phone_number}
                            </span>
                          </div>
                        )}

                        {!student.email &&
                          !student.phone_number && (
                            <span className="text-xs text-slate-400">
                              No contact details
                            </span>
                          )}
                      </div>
                    </td>

                    {/* USERNAME: DESKTOP ONLY */}

                    <td className="hidden px-5 py-4 md:table-cell">
                      {student.username ? (
                        <span className="break-all rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700">
                          {student.username}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* ACCOUNT STATUS: DESKTOP ONLY */}

                    <td className="hidden px-5 py-4 md:table-cell">
                      <AccountStatusBadge student={student} />
                    </td>

                    {/* ACTION: MOBILE AND DESKTOP */}

                    <td className="px-2 py-4 text-right sm:px-5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/student-management/student-accounts/${student.id}`
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:rounded-xl sm:px-4"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
