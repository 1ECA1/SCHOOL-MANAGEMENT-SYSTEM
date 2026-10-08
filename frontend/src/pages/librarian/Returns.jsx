import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getLoans,
  updateLoan,
} from "../../services/libraryService";

function Returns() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // =====================================================
  // LOAD ACTIVE LOANS
  // =====================================================

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLoans();

      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load loans:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load borrowing transactions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // =====================================================
  // ACTIVE BORROWED BOOKS
  // =====================================================

  const activeLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const isActive =
        loan.status === "BORROWED" ||
        loan.status === "OVERDUE";

      if (!isActive) return false;

      if (!query) return true;

      return (
        loan.book_title?.toLowerCase().includes(query) ||
        loan.borrower_name?.toLowerCase().includes(query) ||
        loan.student_admission_number
          ?.toLowerCase()
          .includes(query) ||
        loan.teacher_name?.toLowerCase().includes(query)
      );
    });
  }, [loans, search]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClasses = (status) => {
    if (status === "OVERDUE") {
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400";
    }

    return "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)]";
  };

  // =====================================================
  // RETURN BOOK
  // =====================================================

  const handleReturn = async (loan) => {
    const confirmed = window.confirm(
      `Mark "${loan.book_title}" as returned by ${loan.borrower_name}?`,
    );

    if (!confirmed) return;

    try {
      setReturningId(loan.id);
      setError("");
      setSuccess("");

      const today = new Date().toISOString().split("T")[0];

      await updateLoan(loan.id, {
        status: "RETURNED",
        return_date: today,
      });

      setSuccess(
        `"${loan.book_title}" has been returned successfully.`,
      );

      setLoans((current) =>
        current.map((item) =>
          item.id === loan.id
            ? {
                ...item,
                status: "RETURNED",
                status_display: "Returned",
                return_date: today,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to return book:", err);

      const data = err.response?.data;

      let message = "Unable to return this book.";

      if (data?.detail) {
        message = data.detail;
      } else if (data?.error) {
        message = data.error;
      } else if (data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${text}`;
          })
          .join(" ");
      }

      setError(message);
    } finally {
      setReturningId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading borrowed books...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/librarian/borrowing")
            }
            className="mb-4 text-sm font-medium text-slate-500 transition hover:text-[var(--color-primary)] dark:text-slate-400"
          >
            ← Back to Transactions
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-[var(--color-primary)]">
                Library
              </p>

              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Returns
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage books currently borrowed by students and teachers.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/librarian/borrowing")
              }
              className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-700"
            >
              View All Transactions
            </button>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
            {success}
          </div>
        )}

        {/* SEARCH */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700">
          <label
            htmlFor="return-search"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Search borrowed books
          </label>

          <input
            id="return-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by book, borrower, admission number..."
            className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
          />
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">

          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Currently Borrowed
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeLoans.length} active borrowing transaction
              {activeLoans.length === 1 ? "" : "s"}.
            </p>
          </div>

          {activeLoans.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-3 text-4xl">📚</div>

              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                No borrowed books found
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                There are currently no books waiting to be returned.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">

                <thead className="bg-[var(--color-background)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Book
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Borrower
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Issue Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

                  {activeLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="transition hover:bg-[var(--color-background)]"
                    >

                      {/* BOOK */}

                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text)]">
                          {loan.book_title || "—"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Transaction #{loan.id}
                        </div>
                      </td>

                      {/* BORROWER */}

                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text)]">
                          {loan.borrower_name || "—"}
                        </div>

                        {loan.student_admission_number && (
                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {loan.student_admission_number}
                          </div>
                        )}

                        {loan.teacher_name && (
                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Teacher
                          </div>
                        )}
                      </td>

                      {/* ISSUE DATE */}

                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(loan.issue_date)}
                      </td>

                      {/* DUE DATE */}

                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(loan.due_date)}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            loan.status,
                          )}`}
                        >
                          {loan.status_display ||
                            loan.status ||
                            "Unknown"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            handleReturn(loan)
                          }
                          disabled={
                            returningId === loan.id
                          }
                          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {returningId === loan.id
                            ? "Returning..."
                            : "Return Book"}
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Returns;