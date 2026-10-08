
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBooks, getLoans } from "../../services/libraryService";

// =====================================================
// HELPERS
// =====================================================

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysOverdue(dueDate) {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference = today - due;

  return Math.max(
    0,
    Math.ceil(
      difference / (1000 * 60 * 60 * 24),
    ),
  );
}

function getActivityTime(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const now = new Date();
  const difference = now - parsed;

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return formatDate(date);
}

// =====================================================
// SMALL COMPONENTS
// =====================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
}) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-text/60">
            {title}
          </p>

          <h3 className="text-3xl font-bold tracking-tight text-text">
            {value}
          </h3>

          <p className="mt-2 text-xs text-text/40">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-text">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-text/60">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// =====================================================
// RECENT ACTIVITY
// =====================================================

function RecentActivity({
  loans,
  loading,
  onViewAll,
}) {
  const activities = useMemo(() => {
    return [...loans]
      .sort((a, b) => {
        const dateA = new Date(
          a.updated_at ||
            a.created_at ||
            a.issue_date ||
            0,
        );

        const dateB = new Date(
          b.updated_at ||
            b.created_at ||
            b.issue_date ||
            0,
        );

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((loan) => {
        const returned =
          loan.status === "RETURNED";

        return {
          id: loan.id,
          student:
            loan.borrower_name ||
            loan.student_name ||
            loan.teacher_name ||
            "Unknown borrower",
          book:
            loan.book_title ||
            "Unknown book",
          action: returned
            ? "Returned"
            : "Borrowed",
          time: getActivityTime(
            loan.updated_at ||
              loan.created_at ||
              loan.issue_date,
          ),
          icon: returned ? "↩️" : "📖",
        };
      });
  }, [loans]);

  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Recent Library Activity"
        subtitle="Latest borrowing and return activities"
        action="View All"
        onAction={onViewAll}
      />

      {loading ? (
        <div className="py-8 text-center text-sm text-text/40">
          Loading library activity...
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl bg-background p-6 text-center text-sm text-text/40">
          No library activity yet.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 rounded-2xl border border-text/10 p-3 transition hover:bg-background"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                {activity.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">
                  {activity.student}
                </p>

                <p className="truncate text-xs text-text/60">
                  {activity.action}{" "}
                  <span className="font-medium text-text/80">
                    {activity.book}
                  </span>
                </p>
              </div>

              <span className="shrink-0 text-[11px] text-text/40">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// OVERDUE BOOKS
// =====================================================

function OverdueBooks({
  loans,
  loading,
  onViewAll,
}) {
  const overdueBooks = useMemo(() => {
    return loans
      .filter(
        (loan) => loan.status === "OVERDUE",
      )
      .sort(
        (a, b) =>
          new Date(a.due_date || 0) -
          new Date(b.due_date || 0),
      )
      .slice(0, 5)
      .map((loan) => ({
        id: loan.id,
        student:
          loan.borrower_name ||
          loan.student_name ||
          loan.teacher_name ||
          "Unknown borrower",
        book:
          loan.book_title ||
          "Unknown book",
        dueDate: formatDate(loan.due_date),
        days: getDaysOverdue(loan.due_date),
      }));
  }, [loans]);

  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Overdue Books"
        subtitle="Books that need attention"
        action="View All"
        onAction={onViewAll}
      />

      {loading ? (
        <div className="py-8 text-center text-sm text-text/40">
          Loading overdue books...
        </div>
      ) : overdueBooks.length === 0 ? (
        <div className="rounded-2xl bg-secondary/10 p-6 text-center text-sm font-medium text-secondary">
          No overdue books 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {overdueBooks.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-text/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {item.book}
                  </p>

                  <p className="mt-1 text-xs text-text/60">
                    {item.student}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  {item.days}{" "}
                  {item.days === 1
                    ? "day"
                    : "days"}{" "}
                  overdue
                </span>
              </div>

              <p className="mt-3 text-[11px] text-text/40">
                Due date: {item.dueDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// LIBRARY STATISTICS
// =====================================================

function LibraryStatistics({
  totalCopies,
  availableCopies,
  issuedLoans,
  lostLoans,
}) {
  const statistics = useMemo(() => {
    const total = Math.max(
      totalCopies,
      1,
    );

    return [
      {
        label: "Available Copies",
        value: availableCopies,
        percentage: Math.round(
          (availableCopies / total) * 100,
        ),
      },
      {
        label: "Currently Issued",
        value: issuedLoans,
        percentage: Math.round(
          (issuedLoans / total) * 100,
        ),
      },
      {
        label: "Lost",
        value: lostLoans,
        percentage: Math.round(
          (lostLoans / total) * 100,
        ),
      },
    ];
  }, [
    totalCopies,
    availableCopies,
    issuedLoans,
    lostLoans,
  ]);

  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Library Statistics"
        subtitle="Current library collection status"
      />

      <div className="space-y-5">
        {statistics.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text/60">
                {item.label}
              </span>

              <span className="text-sm font-bold text-text/80">
                {item.value}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-text/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    item.percentage,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// RECENT MEMBERS
// =====================================================

function RecentMembers({ onViewMembers }) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Library Members"
        subtitle="Manage students and teachers using the library"
        action="View Members"
        onAction={onViewMembers}
      />

      <div className="rounded-2xl bg-background p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-2xl shadow-sm">
          👥
        </div>

        <p className="mt-3 text-sm font-semibold text-text">
          Library members
        </p>

        <p className="mt-1 text-xs leading-5 text-text/40">
          Member management will be connected here
          when the library members API is added.
        </p>

        <button
          type="button"
          onClick={onViewMembers}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
        >
          View Members
        </button>
      </div>
    </div>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

function LibrarianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const librarianName = useMemo(() => {
    return (
      user?.first_name ||
      user?.firstName ||
      user?.username ||
      "Librarian"
    );
  }, [user]);

  // ===================================================
  // LOAD LIBRARY DATA
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [booksData, loansData] =
          await Promise.all([
            getBooks(),
            getLoans(),
          ]);

        if (!mounted) return;

        setBooks(
          Array.isArray(booksData)
            ? booksData
            : booksData?.results || [],
        );

        setLoans(
          Array.isArray(loansData)
            ? loansData
            : loansData?.results || [],
        );
      } catch (err) {
        console.error(
          "Failed to load librarian dashboard:",
          err,
        );

        if (mounted) {
          setError(
            "Unable to load library data. Please refresh the page.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================
  // REAL STATISTICS
  // ===================================================

  const statistics = useMemo(() => {
    const totalCopies = books.reduce(
      (sum, book) =>
        sum +
        Number(book.total_copies || 0),
      0,
    );

    const availableCopies = books.reduce(
      (sum, book) =>
        sum +
        Number(book.available_copies || 0),
      0,
    );

    const issuedLoans = loans.filter(
      (loan) =>
        loan.status === "BORROWED" ||
        loan.status === "OVERDUE",
    ).length;

    const returnedLoans = loans.filter(
      (loan) =>
        loan.status === "RETURNED",
    ).length;

    const overdueLoans = loans.filter(
      (loan) =>
        loan.status === "OVERDUE",
    ).length;

    const lostLoans = loans.filter(
      (loan) =>
        loan.status === "LOST",
    ).length;

    return {
      totalBooks: books.length,
      totalCopies,
      availableCopies,
      issuedLoans,
      returnedLoans,
      overdueLoans,
      lostLoans,
    };
  }, [books, loans]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* =================================================
            WELCOME BANNER
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-white/70">
                Library Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {librarianName}! 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage your school library, track books,
                monitor borrowing activity, and keep your
                members connected with the resources they
                need.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/librarian/borrowing/issue",
                )
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:opacity-90"
            >
              + Issue Book
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {error}
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Books"
            value={
              loading
                ? "..."
                : statistics.totalBooks
            }
            subtitle={`${statistics.totalCopies} total copies`}
            icon="📚"
            iconBg="bg-primary/10"
          />

          <StatCard
            title="Books Issued"
            value={
              loading
                ? "..."
                : statistics.issuedLoans
            }
            subtitle="Currently with members"
            icon="📖"
            iconBg="bg-primary/10"
          />

          <StatCard
            title="Books Returned"
            value={
              loading
                ? "..."
                : statistics.returnedLoans
            }
            subtitle="Recorded returned loans"
            icon="↩️"
            iconBg="bg-secondary/10"
          />

          <StatCard
            title="Overdue Books"
            value={
              loading
                ? "..."
                : statistics.overdueLoans
            }
            subtitle="Need follow-up"
            icon="⏰"
            iconBg="bg-primary/10"
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* LEFT / MAIN */}

          <div className="space-y-6 xl:col-span-2">
            <RecentActivity
              loans={loans}
              loading={loading}
              onViewAll={() =>
                navigate(
                  "/librarian/borrowing",
                )
              }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <LibraryStatistics
                totalCopies={
                  statistics.totalCopies
                }
                availableCopies={
                  statistics.availableCopies
                }
                issuedLoans={
                  statistics.issuedLoans
                }
                lostLoans={
                  statistics.lostLoans
                }
              />

              <RecentMembers
                onViewMembers={() =>
                  navigate(
                    "/librarian/members",
                  )
                }
              />
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            <OverdueBooks
              loans={loans}
              loading={loading}
              onViewAll={() =>
                navigate(
                  "/librarian/borrowing",
                )
              }
            />

            {/* QUICK ACTIONS */}

            <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
              <SectionHeader
                title="Quick Actions"
                subtitle="Common library tasks"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/librarian/books",
                    )
                  }
                  className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-xl">
                    📚
                  </span>

                  <p className="mt-2 text-sm font-semibold text-text">
                    Books
                  </p>

                  <p className="mt-1 text-[11px] text-text/40">
                    Manage books
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/librarian/borrowing/issue",
                    )
                  }
                  className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-xl">
                    📖
                  </span>

                  <p className="mt-2 text-sm font-semibold text-text">
                    Issue Book
                  </p>

                  <p className="mt-1 text-[11px] text-text/40">
                    Lend a book
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/librarian/members",
                    )
                  }
                  className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-xl">
                    👥
                  </span>

                  <p className="mt-2 text-sm font-semibold text-text">
                    Members
                  </p>

                  <p className="mt-1 text-[11px] text-text/40">
                    View members
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/librarian/reports",
                    )
                  }
                  className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-xl">
                    📊
                  </span>

                  <p className="mt-2 text-sm font-semibold text-text">
                    Reports
                  </p>

                  <p className="mt-1 text-[11px] text-text/40">
                    Library reports
                  </p>
                </button>
              </div>
            </div>

            {/* ANNOUNCEMENT */}

            <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-lg">
                  📢
                </div>

                <div>
                  <h2 className="text-lg font-bold text-text">
                    Library Notice
                  </h2>

                  <p className="text-xs text-text/40">
                    Important information
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-text/60">
                Students with overdue books should
                return them before borrowing additional
                books from the library.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibrarianDashboard;
