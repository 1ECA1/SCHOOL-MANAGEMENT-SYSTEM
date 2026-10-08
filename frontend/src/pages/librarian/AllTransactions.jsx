
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLoans,
  deleteLoan,
} from "../../services/libraryService";

function AllTransactions() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLoans();

      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Failed to load transactions:",
        err,
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load library transactions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const filteredLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchesSearch =
        !query ||
        loan.book_title
          ?.toLowerCase()
          .includes(query) ||
        loan.borrower_name
          ?.toLowerCase()
          .includes(query) ||
        loan.student_admission_number
          ?.toLowerCase()
          .includes(query) ||
        loan.teacher_name
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: loans.length,

      borrowed: loans.filter(
        (loan) => loan.status === "BORROWED",
      ).length,

      returned: loans.filter(
        (loan) => loan.status === "RETURNED",
      ).length,

      overdue: loans.filter(
        (loan) => loan.status === "OVERDUE",
      ).length,

      lost: loans.filter(
        (loan) => loan.status === "LOST",
      ).length,
    };
  }, [loans]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "BORROWED":
        return "bg-primary/10 text-primary border-primary/20";

      case "RETURNED":
        return "bg-secondary/10 text-secondary border-secondary/20";

      case "OVERDUE":
        return "bg-primary/10 text-primary border-primary/20";

      case "LOST":
        return "bg-primary/10 text-primary border-primary/20";

      default:
        return "bg-background text-text/60 border-text/10";
    }
  };

  const getStatusLabel = (loan) => {
    return (
      loan.status_display ||
      loan.status ||
      "Unknown"
    );
  };

  const handleDelete = async (loan) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this transaction for "${loan.book_title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(loan.id);
      setError("");

      await deleteLoan(loan.id);

      setLoans((current) =>
        current.filter(
          (item) => item.id !== loan.id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete transaction:",
        err,
      );

      const data = err.response?.data;

      let message =
        "Unable to delete this transaction.";

      if (data?.detail) {
        message = data.detail;
      } else if (data?.error) {
        message = data.error;
      } else if (
        data &&
        typeof data === "object"
      ) {
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
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-primary">
                Library
              </p>

              <h1 className="text-2xl font-bold text-text">
                Borrowing & Returns
              </h1>

              <p className="mt-1 text-sm text-text/60">
                Manage all library borrowing and return transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/librarian/borrowing/issue")
              }
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
            >
              + Issue Book
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-text/10 bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text/40">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-text">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Borrowed
            </p>

            <p className="mt-2 text-3xl font-bold text-primary">
              {stats.borrowed}
            </p>
          </div>

          <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              Returned
            </p>

            <p className="mt-2 text-3xl font-bold text-secondary">
              {stats.returned}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Overdue
            </p>

            <p className="mt-2 text-3xl font-bold text-primary">
              {stats.overdue}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Lost
            </p>

            <p className="mt-2 text-3xl font-bold text-primary">
              {stats.lost}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-text/10 bg-card p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="transaction-search"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Search
              </label>

              <input
                id="transaction-search"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search book, student, admission number, or teacher..."
                className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="BORROWED">
                  Borrowed
                </option>

                <option value="RETURNED">
                  Returned
                </option>

                <option value="OVERDUE">
                  Overdue
                </option>

                <option value="LOST">
                  Lost
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-text/10 bg-card shadow-sm">
          <div className="border-b border-text/10 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-bold text-text">
              All Transactions
            </h2>

            <p className="mt-1 text-sm text-text/60">
              {filteredLoans.length} transaction
              {filteredLoans.length === 1
                ? ""
                : "s"} found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm font-medium text-text/60">
                Loading transactions...
              </p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                🔄
              </div>

              <h3 className="text-lg font-bold text-text">
                No transactions found
              </h3>

              <p className="mt-1 max-w-md text-sm text-text/60">
                There are no borrowing transactions matching your current filters.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/librarian/borrowing/issue")
                }
                className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Issue a Book
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-text/10 bg-background">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Book
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Borrower
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Issue Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Due Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Return Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Fine
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-text/40">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-text/40">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="border-b border-text/10 last:border-b-0 hover:bg-background"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-text">
                            {loan.book_title ||
                              "Unknown Book"}
                          </p>

                          <p className="mt-1 text-xs text-text/40">
                            Transaction #{loan.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-text/80">
                          {loan.borrower_name ||
                            "Unknown Borrower"}
                        </p>

                        {loan.student_admission_number && (
                          <p className="mt-1 text-xs text-text/40">
                            {loan.student_admission_number}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-text/70">
                        {formatDate(
                          loan.issue_date,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-text/70">
                        {formatDate(
                          loan.due_date,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-text/70">
                        {formatDate(
                          loan.return_date,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-text">
                        ₦
                        {Number(
                          loan.fine_amount || 0,
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                            loan.status,
                          )}`}
                        >
                          {getStatusLabel(loan)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/librarian/borrowing/${loan.id}`,
                              )
                            }
                            className="rounded-lg border border-text/10 bg-card px-3 py-2 text-xs font-semibold text-text/70 transition hover:bg-background"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(loan)
                            }
                            disabled={
                              deletingId === loan.id
                            }
                            className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            loan.id
                              ? "..."
                              : "Delete"}
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
    </div>
  );
}

export default AllTransactions;
