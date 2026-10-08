import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getLoans,
  updateLoan,
  deleteLoan,
} from "../../../services/libraryService";

const getStatusClasses = (status) => {
  switch (status) {
    case "BORROWED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "RETURNED":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

    case "OVERDUE":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

    case "LOST":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
};

function AllLoans() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [returningId, setReturningId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // LOAD
  // =====================================================

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLoans();

      setLoans(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load loans:", err);

      setError(err?.response?.data?.detail || "Unable to load book loans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredLoans = useMemo(() => {
    const value = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const borrower = loan.student_admission_number || loan.teacher_name || "";

      const book = loan.book_title || "";

      const matchesSearch =
        !value ||
        book.toLowerCase().includes(value) ||
        borrower.toLowerCase().includes(value);

      const matchesStatus = !statusFilter || loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  // =====================================================
  // RETURN
  // =====================================================

  const handleReturn = async (loan) => {
    if (loan.status === "RETURNED") {
      return;
    }

    const confirmed = window.confirm(`Mark "${loan.book_title}" as returned?`);

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(loan.id);
      setError("");

      const updatedLoan = await updateLoan(loan.id, {
        status: "RETURNED",
        return_date: new Date().toISOString().split("T")[0],
      });

      setLoans((current) =>
        current.map((item) =>
          item.id === loan.id
            ? {
                ...item,
                ...updatedLoan,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to return book:", err);

      setError(err?.response?.data?.detail || "Unable to return book.");
    } finally {
      setReturningId(null);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (loan) => {
    const confirmed = window.confirm("Delete this loan record?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(loan.id);
      setError("");

      await deleteLoan(loan.id);

      setLoans((current) => current.filter((item) => item.id !== loan.id));
    } catch (err) {
      console.error("Failed to delete loan:", err);

      setError(err?.response?.data?.detail || "Unable to delete loan.");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // STATS
  // =====================================================

  const borrowedCount = loans.filter(
    (loan) => loan.status === "BORROWED",
  ).length;

  const returnedCount = loans.filter(
    (loan) => loan.status === "RETURNED",
  ).length;

  const overdueCount = loans.filter((loan) => loan.status === "OVERDUE").length;

  const lostCount = loans.filter((loan) => loan.status === "LOST").length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Book Loans
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage issued, returned, overdue and lost books.
          </p>
        </div>

        <Link
          to="/admin/library/loans/add"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          + Issue Book
        </Link>
      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Borrowed" value={borrowedCount} />

        <Stat label="Returned" value={returnedCount} />

        <Stat label="Overdue" value={overdueCount} />

        <Stat label="Lost" value={lostCount} />
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadLoans}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search book or borrower..."
            className="rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
          >
            <option value="">All Statuses</option>

            <option value="BORROWED">Borrowed</option>

            <option value="RETURNED">Returned</option>

            <option value="OVERDUE">Overdue</option>

            <option value="LOST">Lost</option>
          </select>

          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="mx-1 font-semibold text-[var(--color-text)]">
              {filteredLoans.length}
            </span>
            loan
            {filteredLoans.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading loans...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-text)]">
              No loans found.
            </p>

            <Link
              to="/admin/library/loans/add"
              className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Issue First Book
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Book
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Borrower
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Issue Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Due Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Return Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Fine
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                      {loan.book_title || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {loan.student
                        ? loan.student_admission_number || "—"
                        : loan.teacher_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {loan.issue_date || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {loan.due_date || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {loan.return_date || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      ₦{Number(loan.fine_amount || 0).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          loan.status,
                        )}`}
                      >
                        {loan.status_display || loan.status || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {loan.status !== "RETURNED" && (
                          <button
                            type="button"
                            disabled={returningId === loan.id}
                            onClick={() => handleReturn(loan)}
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 disabled:opacity-50 dark:border-green-900/40 dark:text-green-400"
                          >
                            {returningId === loan.id
                              ? "Returning..."
                              : "Return"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={deletingId === loan.id}
                          onClick={() => handleDelete(loan)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400"
                        >
                          {deletingId === loan.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}

export default AllLoans;
