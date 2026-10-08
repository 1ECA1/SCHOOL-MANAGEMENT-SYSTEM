import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  getInvoices,
  getStudentFinancialStatement,
} from "../../../services/financeService";

import { getSessions, getTerms } from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const money = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStudentName = (invoice) => {
  if (invoice.student_name) return invoice.student_name;

  if (invoice.student?.name) return invoice.student.name;

  if (invoice.student?.full_name) return invoice.student.full_name;

  if (invoice.student?.user?.full_name) return invoice.student.user.full_name;

  if (invoice.student?.user?.first_name || invoice.student?.user?.last_name) {
    return [
      invoice.student?.user?.first_name,
      invoice.student?.user?.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "Unknown Student";
};

const getAdmissionNumber = (invoice) => {
  if (invoice.admission_number) return invoice.admission_number;

  if (invoice.student?.admission_number) {
    return invoice.student.admission_number;
  }

  return "—";
};

const getStudentId = (invoice) => {
  if (typeof invoice.student === "number") {
    return invoice.student;
  }

  return invoice.student?.id || invoice.student_id || null;
};

const getSessionId = (invoice) => {
  if (typeof invoice.academic_session === "number") {
    return invoice.academic_session;
  }

  return invoice.academic_session?.id || invoice.session_id || null;
};

const getSessionName = (invoice) => {
  if (invoice.academic_session_name) {
    return invoice.academic_session_name;
  }

  if (typeof invoice.academic_session === "object") {
    return (
      invoice.academic_session?.name ||
      invoice.academic_session?.session ||
      "—"
    );
  }

  return "—";
};

const getTermId = (invoice) => {
  if (typeof invoice.term === "number") {
    return invoice.term;
  }

  return invoice.term?.id || invoice.term_id || null;
};

const getTermName = (invoice) => {
  if (invoice.term_name) return invoice.term_name;

  if (typeof invoice.term === "object") {
    return invoice.term?.name || invoice.term?.term || "—";
  }

  return "—";
};

const getClassName = (invoice) => {
  if (invoice.class_level_name) return invoice.class_level_name;

  if (typeof invoice.class_level === "object") {
    return invoice.class_level?.name || "—";
  }

  return "—";
};

const getInvoiceBalance = (invoice) => {
  const balance = Number(invoice.balance);

  if (!Number.isNaN(balance)) {
    return Math.max(balance, 0);
  }

  const amount = Number(invoice.amount || 0);
  const discount = Number(invoice.discount || 0);
  const amountPaid = Number(invoice.amount_paid || 0);

  return Math.max(amount - discount - amountPaid, 0);
};

const getInvoiceAmount = (invoice) => {
  const amount = Number(invoice.amount || 0);
  const discount = Number(invoice.discount || 0);

  return Math.max(amount - discount, 0);
};

const isOverdue = (invoice) => {
  if (String(invoice.status || "").toUpperCase() === "OVERDUE") {
    return true;
  }

  if (!invoice.due_date) return false;

  const balance = getInvoiceBalance(invoice);

  if (balance <= 0) return false;

  return new Date(invoice.due_date) < new Date();
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================
// COMPONENT
// ============================================================

export default function OutstandingBalances() {
  const [invoices, setInvoices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState("ALL");
  const [termFilter, setTermFilter] = useState("ALL");

  const [sortField, setSortField] = useState("balance");
  const [sortDirection, setSortDirection] = useState("desc");

  const [expandedStudent, setExpandedStudent] = useState(null);

  const [statementStudent, setStatementStudent] = useState(null);
  const [statement, setStatement] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState("");

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [invoiceData, sessionData, termData] = await Promise.all([
        getInvoices(),
        getSessions(),
        getTerms(),
      ]);

      setInvoices(getArray(invoiceData));
      setSessions(getArray(sessionData));
      setTerms(getArray(termData));
    } catch (err) {
      console.error("Outstanding balances load error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load outstanding balances.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // CURRENT / FILTERED INVOICES
  // ============================================================

  const outstandingInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const balance = getInvoiceBalance(invoice);

      if (balance <= 0) return false;

      if (
        statusFilter !== "ALL" &&
        String(invoice.status || "").toUpperCase() !== statusFilter
      ) {
        return false;
      }

      if (
        sessionFilter !== "ALL" &&
        String(getSessionId(invoice)) !== String(sessionFilter)
      ) {
        return false;
      }

      if (
        termFilter !== "ALL" &&
        String(getTermId(invoice)) !== String(termFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [invoices, statusFilter, sessionFilter, termFilter]);

  // ============================================================
  // GROUP BY STUDENT
  // ============================================================

  const studentBalances = useMemo(() => {
    const map = new Map();

    outstandingInvoices.forEach((invoice) => {
      const studentId = getStudentId(invoice);

      if (!studentId) return;

      if (!map.has(studentId)) {
        map.set(studentId, {
          studentId,
          studentName: getStudentName(invoice),
          admissionNumber: getAdmissionNumber(invoice),
          className: getClassName(invoice),
          totalInvoiced: 0,
          totalPaid: 0,
          totalBalance: 0,
          overdueAmount: 0,
          invoices: [],
        });
      }

      const student = map.get(studentId);

      student.totalInvoiced += getInvoiceAmount(invoice);
      student.totalPaid += Number(invoice.amount_paid || 0);
      student.totalBalance += getInvoiceBalance(invoice);

      if (isOverdue(invoice)) {
        student.overdueAmount += getInvoiceBalance(invoice);
      }

      student.invoices.push(invoice);
    });

    return Array.from(map.values());
  }, [outstandingInvoices]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = studentBalances;

    if (query) {
      result = result.filter((student) => {
        const invoiceText = student.invoices
          .map((invoice) =>
            [
              invoice.invoice_number,
              invoice.fee_category_name,
              invoice.description,
              getSessionName(invoice),
              getTermName(invoice),
            ]
              .filter(Boolean)
              .join(" "),
          )
          .join(" ");

        return [
          student.studentName,
          student.admissionNumber,
          student.className,
          invoiceText,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    return [...result].sort((a, b) => {
      let first;
      let second;

      switch (sortField) {
        case "student":
          first = a.studentName.toLowerCase();
          second = b.studentName.toLowerCase();
          break;

        case "admission":
          first = a.admissionNumber.toLowerCase();
          second = b.admissionNumber.toLowerCase();
          break;

        case "overdue":
          first = a.overdueAmount;
          second = b.overdueAmount;
          break;

        case "balance":
        default:
          first = a.totalBalance;
          second = b.totalBalance;
          break;
      }

      if (typeof first === "string") {
        return sortDirection === "asc"
          ? first.localeCompare(second)
          : second.localeCompare(first);
      }

      return sortDirection === "asc" ? first - second : second - first;
    });
  }, [studentBalances, search, sortField, sortDirection]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    let totalInvoiced = 0;
    let totalPaid = 0;

    outstandingInvoices.forEach((invoice) => {
      const balance = getInvoiceBalance(invoice);

      outstanding += balance;
      totalInvoiced += getInvoiceAmount(invoice);
      totalPaid += Number(invoice.amount_paid || 0);

      if (isOverdue(invoice)) {
        overdue += balance;
      }
    });

    return {
      students: studentBalances.length,
      invoices: outstandingInvoices.length,
      outstanding,
      overdue,
      totalInvoiced,
      totalPaid,
    };
  }, [outstandingInvoices, studentBalances]);

  // ============================================================
  // SORT
  // ============================================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return null;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  // ============================================================
  // VIEW STATEMENT
  // ============================================================

  const viewStatement = async (student) => {
    try {
      setStatementStudent(student);
      setStatement(null);
      setStatementError("");
      setStatementLoading(true);

      const data = await getStudentFinancialStatement(student.studentId);

      setStatement(data);
    } catch (err) {
      console.error("Statement error:", err);

      setStatementError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load student financial statement.",
      );
    } finally {
      setStatementLoading(false);
    }
  };

  // ============================================================
  // TOGGLE STUDENT
  // ============================================================

  const toggleStudent = (studentId) => {
    setExpandedStudent((current) =>
      current === studentId ? null : studentId,
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="flex items-center gap-3 text-text/70">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading outstanding balances...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <WalletCards size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Outstanding Balances
                </h1>

                <p className="text-sm text-text/60 mt-1">
                  Track students with unpaid or partially paid invoices.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-card hover:bg-primary/5 transition disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1 text-sm">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="opacity-70 hover:opacity-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Outstanding
                </p>

                <p className="text-2xl font-bold mt-2">
                  {money(summary.outstanding)}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <WalletCards size={21} />
              </div>
            </div>

            <p className="text-xs text-text/50 mt-3">
              Total unpaid balance
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Students
                </p>

                <p className="text-2xl font-bold mt-2">
                  {summary.students}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <FileText size={21} />
              </div>
            </div>

            <p className="text-xs text-text/50 mt-3">
              Students with outstanding balances
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Overdue
                </p>

                <p className="text-2xl font-bold mt-2">
                  {money(summary.overdue)}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <AlertCircle size={21} />
              </div>
            </div>

            <p className="text-xs text-text/50 mt-3">
              Balance past the due date
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Outstanding Invoices
                </p>

                <p className="text-2xl font-bold mt-2">
                  {summary.invoices}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText size={21} />
              </div>
            </div>

            <p className="text-xs text-text/50 mt-3">
              Unpaid or partially paid invoices
            </p>
          </div>
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

            {/* Search */}

            <div className="xl:col-span-2 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, admission number, invoice..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            {/* Session */}

            <select
              value={sessionFilter}
              onChange={(event) => setSessionFilter(event.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
            >
              <option value="ALL">All Sessions</option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name ||
                    session.session ||
                    session.academic_session ||
                    `Session ${session.id}`}
                </option>
              ))}
            </select>

            {/* Term */}

            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
            >
              <option value="ALL">All Terms</option>

              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name || term.term || `Term ${term.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ======================================================
            RESULT COUNT
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-semibold">
              Students with Outstanding Balances
            </h2>

            <p className="text-sm text-text/55 mt-1">
              Showing {filteredStudents.length} student
              {filteredStudents.length === 1 ? "" : "s"}
            </p>
          </div>

          {(search ||
            statusFilter !== "ALL" ||
            sessionFilter !== "ALL" ||
            termFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSessionFilter("ALL");
                setTermFilter("ALL");
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <WalletCards
                size={40}
                className="mx-auto text-text/25"
              />

              <h3 className="font-semibold mt-4">
                No outstanding balances found
              </h3>

              <p className="text-sm text-text/55 mt-2">
                There are no students matching the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">

                <thead className="bg-background/70 border-b border-black/5 dark:border-white/10">
                  <tr className="text-left text-xs uppercase tracking-wide text-text/50">

                    <th className="px-5 py-4">
                      #
                    </th>

                    <th className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("student")}
                        className="flex items-center gap-1 hover:text-text"
                      >
                        Student
                        <SortIcon field="student" />
                      </button>
                    </th>

                    <th className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("admission")}
                        className="flex items-center gap-1 hover:text-text"
                      >
                        Admission No.
                        <SortIcon field="admission" />
                      </button>
                    </th>

                    <th className="px-5 py-4">
                      Class
                    </th>

                    <th className="px-5 py-4 text-right">
                      Invoiced
                    </th>

                    <th className="px-5 py-4 text-right">
                      Paid
                    </th>

                    <th className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort("balance")}
                        className="ml-auto flex items-center gap-1 hover:text-text"
                      >
                        Balance
                        <SortIcon field="balance" />
                      </button>
                    </th>

                    <th className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort("overdue")}
                        className="ml-auto flex items-center gap-1 hover:text-text"
                      >
                        Overdue
                        <SortIcon field="overdue" />
                      </button>
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/5 dark:divide-white/10">

                  {filteredStudents.map((student, index) => {
                    const expanded =
                      expandedStudent === student.studentId;

                    return (
                      <>
                        <tr
                          key={student.studentId}
                          className="hover:bg-background/50 transition"
                        >
                          <td className="px-5 py-4 text-sm text-text/60">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium">
                              {student.studentName}
                            </div>

                            <div className="text-xs text-text/50 mt-1">
                              {student.invoices.length} outstanding invoice
                              {student.invoices.length === 1 ? "" : "s"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {student.admissionNumber}
                          </td>

                          <td className="px-5 py-4 text-sm text-text/70">
                            {student.className}
                          </td>

                          <td className="px-5 py-4 text-sm text-right">
                            {money(student.totalInvoiced)}
                          </td>

                          <td className="px-5 py-4 text-sm text-right">
                            {money(student.totalPaid)}
                          </td>

                          <td className="px-5 py-4 text-sm text-right font-semibold text-primary">
                            {money(student.totalBalance)}
                          </td>

                          <td className="px-5 py-4 text-sm text-right font-semibold">
                            {student.overdueAmount > 0
                              ? money(student.overdueAmount)
                              : "—"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  toggleStudent(student.studentId)
                                }
                                title={
                                  expanded
                                    ? "Hide invoices"
                                    : "View invoices"
                                }
                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition"
                              >
                                {expanded ? (
                                  <ChevronUp size={17} />
                                ) : (
                                  <ChevronDown size={17} />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  viewStatement(student)
                                }
                                title="View financial statement"
                                className="p-2 rounded-lg hover:bg-secondary/10 text-secondary transition"
                              >
                                <Eye size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ==================================================
                            EXPANDED INVOICES
                        ================================================== */}

                        {expanded && (
                          <tr key={`${student.studentId}-details`}>
                            <td
                              colSpan={9}
                              className="px-5 py-4 bg-background/40"
                            >
                              <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">

                                <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
                                  <h3 className="font-semibold text-sm">
                                    Outstanding Invoices
                                  </h3>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full min-w-[800px]">

                                    <thead>
                                      <tr className="text-xs uppercase tracking-wide text-text/45">
                                        <th className="px-4 py-3 text-left">
                                          Invoice
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                          Session
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                          Term
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                          Fee Category
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                          Amount
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                          Paid
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                          Balance
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                          Due Date
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                      {student.invoices.map((invoice) => {
                                        const balance =
                                          getInvoiceBalance(invoice);

                                        const overdue =
                                          isOverdue(invoice);

                                        return (
                                          <tr key={invoice.id}>
                                            <td className="px-4 py-3 text-sm font-medium">
                                              {invoice.invoice_number ||
                                                `INV-${invoice.id}`}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-text/70">
                                              {getSessionName(invoice)}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-text/70">
                                              {getTermName(invoice)}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-text/70">
                                              {invoice.fee_category_name ||
                                                invoice.fee_category?.name ||
                                                invoice.description ||
                                                "—"}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-right">
                                              {money(
                                                getInvoiceAmount(invoice),
                                              )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-right">
                                              {money(
                                                invoice.amount_paid,
                                              )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-right font-semibold text-primary">
                                              {money(balance)}
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                              <div>
                                                {formatDate(
                                                  invoice.due_date,
                                                )}

                                                {overdue && (
                                                  <div className="text-xs text-secondary mt-1">
                                                    Overdue
                                                  </div>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          FINANCIAL STATEMENT MODAL
      ======================================================== */}

      {statementStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card rounded-2xl shadow-2xl border border-black/10 dark:border-white/10">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">
                  Financial Statement
                </h2>

                <p className="text-sm text-text/55 mt-1">
                  {statementStudent.studentName}
                  {" · "}
                  {statementStudent.admissionNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatementStudent(null);
                  setStatement(null);
                  setStatementError("");
                }}
                className="p-2 rounded-lg hover:bg-background"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Content */}

            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">

              {statementLoading && (
                <div className="py-16 flex items-center justify-center gap-3 text-text/60">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                  Loading financial statement...
                </div>
              )}

              {statementError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                  {statementError}
                </div>
              )}

              {!statementLoading &&
                !statementError &&
                statement && (
                  <StatementContent statement={statement} />
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STATEMENT CONTENT
// ============================================================

function StatementContent({ statement }) {
  const summary = statement.summary || {};

  const invoices = getArray(statement.invoices);
  const payments = getArray(statement.payments);

  return (
    <div className="space-y-5">

      {/* Summary */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
          <p className="text-sm text-text/55">
            Total Invoiced
          </p>

          <p className="text-xl font-bold mt-2">
            {money(
              summary.total_invoiced ??
                statement.total_invoiced ??
                0,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
          <p className="text-sm text-text/55">
            Total Paid
          </p>

          <p className="text-xl font-bold mt-2">
            {money(
              summary.total_paid ??
                statement.total_paid ??
                0,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
          <p className="text-sm text-text/55">
            Outstanding
          </p>

          <p className="text-xl font-bold mt-2 text-primary">
            {money(
              summary.total_outstanding ??
                summary.outstanding ??
                statement.total_outstanding ??
                0,
            )}
          </p>
        </div>
      </div>

      {/* Invoices */}

      <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">

        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
          <h3 className="font-semibold">
            Invoices
          </h3>
        </div>

        {invoices.length === 0 ? (
          <div className="p-6 text-center text-sm text-text/50">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-text/45">
                  <th className="px-4 py-3 text-left">
                    Invoice
                  </th>

                  <th className="px-4 py-3 text-left">
                    Fee
                  </th>

                  <th className="px-4 py-3 text-right">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-right">
                    Paid
                  </th>

                  <th className="px-4 py-3 text-right">
                    Balance
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {invoice.invoice_number ||
                        `INV-${invoice.id}`}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {invoice.fee_category_name ||
                        invoice.fee_category?.name ||
                        invoice.description ||
                        "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-right">
                      {money(invoice.amount)}
                    </td>

                    <td className="px-4 py-3 text-sm text-right">
                      {money(invoice.amount_paid)}
                    </td>

                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {money(invoice.balance)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {invoice.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments */}

      <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">

        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
          <h3 className="font-semibold">
            Payments
          </h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-text/50">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-text/45">
                  <th className="px-4 py-3 text-left">
                    Reference
                  </th>

                  <th className="px-4 py-3 text-left">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left">
                    Method
                  </th>

                  <th className="px-4 py-3 text-right">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {payment.reference || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatDate(
                        payment.payment_date ||
                          payment.created_at,
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {payment.payment_method || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {money(payment.amount)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {payment.status || "—"}
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