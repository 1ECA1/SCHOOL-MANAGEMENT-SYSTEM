import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import {
  getFinancialSummaryReport,
  getIncomeReport,
  getExpenseReport,
  getStudentFinancialReport,
} from "../../../services/financeService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const money = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₦0.00";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const number = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-NG").format(amount);
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.message) {
    return data.message;
  }

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const value = data[firstKey];

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      if (typeof value === "string") {
        return value;
      }
    }
  }

  return fallback;
};

const firstValue = (
  object,
  keys,
  fallback = null,
) => {
  if (
    !object ||
    typeof object !== "object"
  ) {
    return fallback;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getReportValue = (
  report,
  keys,
  fallback = 0,
) => {
  if (!report) {
    return fallback;
  }

  const direct = firstValue(
    report,
    keys,
    null,
  );

  if (
    direct !== null &&
    direct !== undefined
  ) {
    return direct;
  }

  if (report.summary) {
    const nested = firstValue(
      report.summary,
      keys,
      null,
    );

    if (
      nested !== null &&
      nested !== undefined
    ) {
      return nested;
    }
  }

  if (
    report.data &&
    typeof report.data === "object"
  ) {
    const nested = firstValue(
      report.data,
      keys,
      null,
    );

    if (
      nested !== null &&
      nested !== undefined
    ) {
      return nested;
    }

    if (report.data.summary) {
      const summaryValue =
        firstValue(
          report.data.summary,
          keys,
          null,
        );

      if (
        summaryValue !== null &&
        summaryValue !== undefined
      ) {
        return summaryValue;
      }
    }
  }

  return fallback;
};

const getSessionName = (session) =>
  session?.name ||
  session?.session ||
  session?.academic_session ||
  `Session ${session?.id}`;

const getTermName = (term) =>
  term?.name ||
  term?.term ||
  term?.display_name ||
  `Term ${term?.id}`;

const getClassName = (classLevel) =>
  classLevel?.name ||
  classLevel?.code ||
  `Class ${classLevel?.id}`;

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function FinancialReports() {
  const [activeReport, setActiveReport] =
    useState("summary");

  const [sessions, setSessions] =
    useState([]);

  const [terms, setTerms] =
    useState([]);

  const [classLevels, setClassLevels] =
    useState([]);

  const [sessionFilter, setSessionFilter] =
    useState("ALL");

  const [termFilter, setTermFilter] =
    useState("ALL");

  const [classFilter, setClassFilter] =
    useState("ALL");

  const [summaryReport, setSummaryReport] =
    useState(null);

  const [incomeReport, setIncomeReport] =
    useState(null);

  const [expenseReport, setExpenseReport] =
    useState(null);

  const [studentReport, setStudentReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ==========================================================
  // LOAD FILTER DATA
  // ==========================================================

  const loadFilters = async () => {
    const [
      sessionData,
      termData,
      classData,
    ] = await Promise.all([
      getSessions(),
      getTerms(),
      getClassLevels(),
    ]);

    const sessionList =
      getArray(sessionData);

    const termList =
      getArray(termData);

    const classList =
      getArray(classData);

    setSessions(sessionList);
    setTerms(termList);
    setClassLevels(classList);

    // --------------------------------------------------------
    // CURRENT SESSION
    // --------------------------------------------------------

    const currentSession =
      sessionList.find(
        (item) =>
          item.is_current === true ||
          item.current === true,
      );

    // --------------------------------------------------------
    // CURRENT TERM
    // --------------------------------------------------------

    const currentTerm =
      termList.find(
        (item) =>
          item.is_current === true ||
          item.current === true,
      );

    if (currentSession) {
      setSessionFilter(
        String(currentSession.id),
      );
    }

    if (currentTerm) {
      setTermFilter(
        String(currentTerm.id),
      );
    }
  };

  // ==========================================================
  // REPORT PARAMS
  // ==========================================================

  const buildParams = () => {
    const params = {};

    if (sessionFilter !== "ALL") {
      params.academic_session =
        sessionFilter;
    }

    if (termFilter !== "ALL") {
      params.term = termFilter;
    }

    if (classFilter !== "ALL") {
      params.class_level =
        classFilter;
    }

    return params;
  };

  // ==========================================================
  // LOAD REPORT
  // ==========================================================

  const loadReport = async (
    reportName = activeReport,
  ) => {
    try {
      setReportLoading(true);
      setError("");

      const params =
        buildParams();

      // ------------------------------------------------------
      // SUMMARY
      // ------------------------------------------------------

      if (reportName === "summary") {
        const data =
          await getFinancialSummaryReport(
            params,
          );

        setSummaryReport(data);
      }

      // ------------------------------------------------------
      // INCOME
      // ------------------------------------------------------

      if (reportName === "income") {
        const data =
          await getIncomeReport(
            params,
          );

        setIncomeReport(data);
      }

      // ------------------------------------------------------
      // EXPENSES
      // ------------------------------------------------------

      if (reportName === "expenses") {
        const data =
          await getExpenseReport(
            params,
          );

        setExpenseReport(data);
      }

      // ------------------------------------------------------
      // STUDENTS
      // ------------------------------------------------------

      if (reportName === "students") {
        const data =
          await getStudentFinancialReport(
            params,
          );

        setStudentReport(data);
      }
    } catch (err) {
      console.error(
        "Financial report error:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load the financial report.",
        ),
      );
    } finally {
      setReportLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const initialize =
      async () => {
        try {
          setLoading(true);
          setError("");

          await loadFilters();
        } catch (err) {
          console.error(
            "Financial report filters error:",
            err,
          );

          setError(
            getErrorMessage(
              err,
              "Unable to load financial report filters.",
            ),
          );
        } finally {
          setLoading(false);
        }
      };

    initialize();
  }, []);

  // ==========================================================
  // LOAD ACTIVE REPORT
  // ==========================================================

  useEffect(() => {
    if (!loading) {
      loadReport(activeReport);
    }
  }, [
    activeReport,
    sessionFilter,
    termFilter,
    classFilter,
  ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const income =
      summaryReport?.income ||
      summaryReport?.data?.income ||
      {};

    const counts =
      summaryReport?.counts ||
      summaryReport?.data?.counts ||
      {};

    const expenses =
      summaryReport?.expenses ||
      summaryReport?.data?.expenses ||
      {};

    return {
      invoiced: Number(
        firstValue(
          income,
          [
            "total_invoiced",
            "invoiced",
            "total_invoice_amount",
          ],
          0,
        ),
      ),

      collected: Number(
        firstValue(
          income,
          [
            "total_collected",
            "collected",
            "total_paid",
            "total_payments",
          ],
          0,
        ),
      ),

      outstanding: Number(
        firstValue(
          income,
          [
            "total_outstanding",
            "outstanding",
            "balance",
          ],
          0,
        ),
      ),

      discounts: Number(
        firstValue(
          income,
          [
            "total_discounts",
            "discounts",
            "total_discount",
          ],
          0,
        ),
      ),

      collectionRate: Number(
        firstValue(
          income,
          [
            "collection_rate",
          ],
          0,
        ),
      ),

      totalExpenses: Number(
        firstValue(
          expenses,
          [
            "total_expenses",
          ],
          0,
        ),
      ),

      pendingExpenses: Number(
        firstValue(
          expenses,
          [
            "pending_expenses",
          ],
          0,
        ),
      ),

      cancelledExpenses: Number(
        firstValue(
          expenses,
          [
            "cancelled_expenses",
          ],
          0,
        ),
      ),

      paidInvoices: Number(
        firstValue(
          counts,
          [
            "paid_invoice_count",
            "paid_invoices",
          ],
          0,
        ),
      ),

      partialInvoices: Number(
        firstValue(
          counts,
          [
            "partial_invoice_count",
            "partial_invoices",
          ],
          0,
        ),
      ),

      unpaidInvoices: Number(
        firstValue(
          counts,
          [
            "unpaid_invoice_count",
            "unpaid_invoices",
          ],
          0,
        ),
      ),

      overdueInvoices: Number(
        firstValue(
          counts,
          [
            "overdue_invoice_count",
            "overdue_invoices",
          ],
          0,
        ),
      ),

      invoiceCount: Number(
        firstValue(
          counts,
          [
            "invoice_count",
          ],
          0,
        ),
      ),

      successfulPaymentCount:
        Number(
          firstValue(
            counts,
            [
              "successful_payment_count",
            ],
            0,
          ),
        ),

      expenseCount: Number(
        firstValue(
          counts,
          [
            "expense_count",
          ],
          0,
        ),
      ),
    };
  }, [summaryReport]);

  // ==========================================================
  // INCOME DATA
  // ==========================================================

  const incomePaymentMethods =
    useMemo(() => {
      if (!incomeReport) {
        return [];
      }

      return getArray(
        incomeReport.payment_methods,
      );
    }, [incomeReport]);

  const incomeFeeCategories =
    useMemo(() => {
      if (!incomeReport) {
        return [];
      }

      return getArray(
        incomeReport.fee_categories,
      );
    }, [incomeReport]);

  const incomeTotal = useMemo(() => {
    return Number(
      getReportValue(
        incomeReport,
        [
          "total_collected",
          "total_income",
          "total",
        ],
        0,
      ),
    );
  }, [incomeReport]);

  // ==========================================================
  // EXPENSE DATA
  // ==========================================================

  const expenseCategories =
    useMemo(() => {
      if (!expenseReport) {
        return [];
      }

      return getArray(
        expenseReport.categories,
      );
    }, [expenseReport]);

  const expensePaymentMethods =
    useMemo(() => {
      if (!expenseReport) {
        return [];
      }

      return getArray(
        expenseReport.payment_methods,
      );
    }, [expenseReport]);

  const expenseStatuses =
    useMemo(() => {
      if (!expenseReport) {
        return [];
      }

      return getArray(
        expenseReport.statuses,
      );
    }, [expenseReport]);

  const expenseTotal = useMemo(() => {
    return Number(
      getReportValue(
        expenseReport,
        [
          "total_expenses",
          "total_expense",
          "total",
        ],
        0,
      ),
    );
  }, [expenseReport]);

  // ==========================================================
  // STUDENT DATA
  // ==========================================================

  const studentRows = useMemo(() => {
    if (!studentReport) {
      return [];
    }

    return getArray(
      studentReport.students ||
        studentReport.data ||
        studentReport.results ||
        studentReport.items ||
        studentReport.records ||
        [],
    );
  }, [studentReport]);

  const filteredStudentRows =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return studentRows;
      }

      return studentRows.filter(
        (row) => {
          return [
            row.student_name,
            row.name,
            row.full_name,
            row.admission_number,
            row.admission_no,
            row.class_name,
            row.class_level_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
        },
      );
    }, [studentRows, search]);

  // ==========================================================
  // REPORT TABS
  // ==========================================================

  const reportTabs = [
    {
      id: "summary",
      label: "Financial Summary",
      icon: BarChart3,
    },
    {
      id: "income",
      label: "Income",
      icon: TrendingUp,
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: TrendingDown,
    },
    {
      id: "students",
      label: "Student Finance",
      icon: FileText,
    },
  ];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="flex items-center gap-3 text-text/65">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Loading financial reports...
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Financial Reports
              </h1>

              <p className="text-sm text-text/60 mt-1">
                Review income, expenses,
                collections, balances, and
                student financial activity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadReport(activeReport)
            }
            disabled={reportLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-card hover:bg-primary/5 transition disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                reportLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300">

            <AlertCircle
              size={19}
              className="mt-0.5"
            />

            <div className="flex-1 text-sm">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* SESSION */}

            <div>
              <label className="block text-xs font-medium text-text/55 mb-1.5">
                Academic Session
              </label>

              <select
                value={sessionFilter}
                onChange={(event) =>
                  setSessionFilter(
                    event.target.value,
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
              >
                <option value="ALL">
                  All Sessions
                </option>

                {sessions.map(
                  (session) => (
                    <option
                      key={session.id}
                      value={session.id}
                    >
                      {getSessionName(
                        session,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* TERM */}

            <div>
              <label className="block text-xs font-medium text-text/55 mb-1.5">
                Term
              </label>

              <select
                value={termFilter}
                onChange={(event) =>
                  setTermFilter(
                    event.target.value,
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
              >
                <option value="ALL">
                  All Terms
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {getTermName(term)}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS */}

            <div>
              <label className="block text-xs font-medium text-text/55 mb-1.5">
                Class
              </label>

              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(
                    event.target.value,
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none"
              >
                <option value="ALL">
                  All Classes
                </option>

                {classLevels.map(
                  (classLevel) => (
                    <option
                      key={classLevel.id}
                      value={classLevel.id}
                    >
                      {getClassName(
                        classLevel,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ====================================================
            REPORT NAVIGATION
        ==================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-2">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">

            {reportTabs.map(
              (tab) => {
                const Icon = tab.icon;

                const active =
                  activeReport ===
                  tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveReport(
                        tab.id,
                      );

                      setSearch("");
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-primary text-white"
                        : "hover:bg-background text-text/65"
                    }`}
                  >
                    <Icon size={17} />

                    {tab.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* ====================================================
            REPORT CONTENT
        ==================================================== */}

        {reportLoading ? (
          <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 py-20 flex items-center justify-center gap-3 text-text/60">

            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading report...
          </div>
        ) : (
          <>
            {/* =================================================
                SUMMARY
            ================================================= */}

            {activeReport ===
              "summary" && (
              <div className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  <ReportCard
                    title="Total Invoiced"
                    value={money(
                      summary.invoiced,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Total Collected"
                    value={money(
                      summary.collected,
                    )}
                    icon={TrendingUp}
                  />

                  <ReportCard
                    title="Outstanding"
                    value={money(
                      summary.outstanding,
                    )}
                    icon={WalletCards}
                  />

                  <ReportCard
                    title="Discounts"
                    value={money(
                      summary.discounts,
                    )}
                    icon={BarChart3}
                  />
                </div>

                {/* EXPENSE OVERVIEW */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  <ReportCard
                    title="Total Expenses"
                    value={money(
                      summary.totalExpenses,
                    )}
                    icon={TrendingDown}
                  />

                  <ReportCard
                    title="Pending Expenses"
                    value={money(
                      summary.pendingExpenses,
                    )}
                    icon={WalletCards}
                  />

                  <ReportCard
                    title="Successful Payments"
                    value={number(
                      summary.successfulPaymentCount,
                    )}
                    icon={TrendingUp}
                  />
                </div>

                {/* INVOICE STATUS */}

                <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">

                  <h2 className="font-semibold mb-4">
                    Invoice Status
                  </h2>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    <StatusCard
                      label="Paid"
                      value={
                        summary.paidInvoices
                      }
                    />

                    <StatusCard
                      label="Partial"
                      value={
                        summary.partialInvoices
                      }
                    />

                    <StatusCard
                      label="Unpaid"
                      value={
                        summary.unpaidInvoices
                      }
                    />

                    <StatusCard
                      label="Overdue"
                      value={
                        summary.overdueInvoices
                      }
                    />
                  </div>
                </div>

                {/* COLLECTION OVERVIEW */}

                <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">

                  <h2 className="font-semibold">
                    Collection Overview
                  </h2>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>
                      <p className="text-sm text-text/55">
                        Total Invoiced
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {money(
                          summary.invoiced,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-text/55">
                        Total Collected
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {money(
                          summary.collected,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-text/55">
                        Remaining
                      </p>

                      <p className="text-xl font-bold mt-1 text-primary">
                        {money(
                          summary.outstanding,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">

                    <div className="flex justify-between text-xs text-text/55 mb-2">

                      <span>
                        Collection rate
                      </span>

                      <span>
                        {summary.collectionRate >
                        0
                          ? `${Math.min(
                              100,
                              summary.collectionRate,
                            ).toFixed(
                              1,
                            )}%`
                          : summary.invoiced >
                              0
                            ? `${Math.min(
                                100,
                                (summary.collected /
                                  summary.invoiced) *
                                  100,
                              ).toFixed(
                                1,
                              )}%`
                            : "0%"}
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-background overflow-hidden">

                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width:
                            summary.collectionRate >
                            0
                              ? `${Math.min(
                                  100,
                                  summary.collectionRate,
                                )}%`
                              : summary.invoiced >
                                  0
                                ? `${Math.min(
                                    100,
                                    (summary.collected /
                                      summary.invoiced) *
                                      100,
                                  )}%`
                                : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                INCOME
            ================================================= */}

            {activeReport ===
              "income" && (
              <div className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  <ReportCard
                    title="Total Collected"
                    value={money(
                      incomeTotal,
                    )}
                    icon={TrendingUp}
                  />

                  <ReportCard
                    title="Payment Methods"
                    value={number(
                      incomePaymentMethods.length,
                    )}
                    icon={WalletCards}
                  />

                  <ReportCard
                    title="Fee Categories"
                    value={number(
                      incomeFeeCategories.length,
                    )}
                    icon={FileText}
                  />
                </div>

                <IncomeReportTable
                  rows={
                    incomePaymentMethods
                  }
                />

                <IncomeCategoryTable
                  rows={
                    incomeFeeCategories
                  }
                />
              </div>
            )}

            {/* =================================================
                EXPENSES
            ================================================= */}

            {activeReport ===
              "expenses" && (
              <div className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  <ReportCard
                    title="Total Expenses"
                    value={money(
                      expenseTotal,
                    )}
                    icon={TrendingDown}
                  />

                  <ReportCard
                    title="Expense Categories"
                    value={number(
                      expenseCategories.length,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Expense Records"
                    value={number(
                      expenseReport?.summary
                        ?.expense_count ??
                        summary.expenseCount,
                    )}
                    icon={BarChart3}
                  />
                </div>

                <ExpenseCategoryTable
                  rows={
                    expenseCategories
                  }
                />

                <ExpensePaymentTable
                  rows={
                    expensePaymentMethods
                  }
                />

                <ExpenseStatusTable
                  rows={
                    expenseStatuses
                  }
                />
              </div>
            )}

            {/* =================================================
                STUDENTS
            ================================================= */}

            {activeReport ===
              "students" && (
              <div className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  <ReportCard
                    title="Students"
                    value={number(
                      studentReport
                        ?.summary
                        ?.student_count ??
                        studentRows.length,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Total Invoiced"
                    value={money(
                      studentReport
                        ?.summary
                        ?.total_invoiced ??
                        0,
                    )}
                    icon={BarChart3}
                  />

                  <ReportCard
                    title="Total Collected"
                    value={money(
                      studentReport
                        ?.summary
                        ?.total_collected ??
                        0,
                    )}
                    icon={TrendingUp}
                  />
                </div>

                <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-4">

                  <div className="relative">

                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search student, admission number, class..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-background text-text outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <StudentReportTable
                  rows={
                    filteredStudentRows
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// REPORT CARD
// ============================================================

function ReportCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 p-5">

      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-sm text-text/55">
            {title}
          </p>

          <p className="text-2xl font-bold mt-2">
            {value}
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATUS CARD
// ============================================================

function StatusCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">

      <p className="text-sm text-text/55">
        {label}
      </p>

      <p className="text-2xl font-bold mt-2">
        {number(value)}
      </p>
    </div>
  );
}

// ============================================================
// INCOME PAYMENT METHODS
// ============================================================

function IncomeReportTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Income by Payment Method
        </h2>

        <p className="text-sm text-text/50 mt-1">
          Collection breakdown by
          payment method.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No income payment records
          found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Payment Method
                </th>

                <th className="px-5 py-3 text-right">
                  Transactions
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.payment_method ||
                      index
                    }
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {row.payment_method ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {number(
                        row.count,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right font-semibold">
                      {money(
                        row.total,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INCOME BY FEE CATEGORY
// ============================================================

function IncomeCategoryTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Income by Fee Category
        </h2>

        <p className="text-sm text-text/50 mt-1">
          Invoice and collection
          breakdown by fee category.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No fee category records
          found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Fee Category
                </th>

                <th className="px-5 py-3 text-right">
                  Invoices
                </th>

                <th className="px-5 py-3 text-right">
                  Invoiced
                </th>

                <th className="px-5 py-3 text-right">
                  Discounts
                </th>

                <th className="px-5 py-3 text-right">
                  Net Invoiced
                </th>

                <th className="px-5 py-3 text-right">
                  Outstanding
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.fee_category_id ||
                      index
                    }
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {row.fee_category_name ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {number(
                        row.invoice_count,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {money(
                        row.total_invoiced,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {money(
                        row.total_discounts,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right font-semibold">
                      {money(
                        row.net_invoiced,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right text-primary font-semibold">
                      {money(
                        row.total_outstanding,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXPENSE CATEGORY TABLE
// ============================================================

function ExpenseCategoryTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Expenses by Category
        </h2>

        <p className="text-sm text-text/50 mt-1">
          Expense breakdown by
          category.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No expense category
          records found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Category
                </th>

                <th className="px-5 py-3 text-right">
                  Records
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.expense_category_id ||
                      index
                    }
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {row.expense_category_name ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {number(
                        row.count,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right font-semibold">
                      {money(
                        row.total,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXPENSE PAYMENT METHODS
// ============================================================

function ExpensePaymentTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Expenses by Payment Method
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No expense payment
          records found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Payment Method
                </th>

                <th className="px-5 py-3 text-right">
                  Records
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.payment_method ||
                      index
                    }
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {row.payment_method ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {number(
                        row.count,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right font-semibold">
                      {money(
                        row.total,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXPENSE STATUS TABLE
// ============================================================

function ExpenseStatusTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Expenses by Status
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No expense status
          records found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Status
                </th>

                <th className="px-5 py-3 text-right">
                  Records
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.status ||
                      index
                    }
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {row.status ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-right">
                      {number(
                        row.count,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-right font-semibold">
                      {money(
                        row.total,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT REPORT TABLE
// ============================================================

function StudentReportTable({
  rows,
}) {
  return (
    <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">

      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">

        <h2 className="font-semibold">
          Student Financial Report
        </h2>

        <p className="text-sm text-text/50 mt-1">
          {rows.length} student record
          {rows.length === 1
            ? ""
            : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-text/50">
          No student financial
          records found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>
              <tr className="text-xs uppercase tracking-wide text-text/45">

                <th className="px-5 py-3 text-left">
                  Student
                </th>

                <th className="px-5 py-3 text-left">
                  Admission No.
                </th>

                <th className="px-5 py-3 text-right">
                  Invoices
                </th>

                <th className="px-5 py-3 text-right">
                  Invoiced
                </th>

                <th className="px-5 py-3 text-right">
                  Discount
                </th>

                <th className="px-5 py-3 text-right">
                  Paid
                </th>

                <th className="px-5 py-3 text-right">
                  Balance
                </th>

                <th className="px-5 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">

              {rows.map(
                (row, index) => {
                  const studentName =
                    row.student_name ||
                    row.name ||
                    row.full_name ||
                    "Unknown Student";

                  const admissionNumber =
                    row.admission_number ||
                    row.admission_no ||
                    "—";

                  const invoiceCount =
                    Number(
                      firstValue(
                        row,
                        [
                          "invoice_count",
                        ],
                        0,
                      ),
                    );

                  const invoiced =
                    Number(
                      firstValue(
                        row,
                        [
                          "total_invoiced",
                          "invoiced",
                          "total_amount",
                        ],
                        0,
                      ),
                    );

                  const discount =
                    Number(
                      firstValue(
                        row,
                        [
                          "total_discounts",
                          "discounts",
                          "total_discount",
                        ],
                        0,
                      ),
                    );

                  const paid =
                    Number(
                      firstValue(
                        row,
                        [
                          "total_collected",
                          "total_paid",
                          "paid",
                        ],
                        0,
                      ),
                    );

                  const balance =
                    Number(
                      firstValue(
                        row,
                        [
                          "total_outstanding",
                          "outstanding",
                          "balance",
                        ],
                        0,
                      ),
                    );

                  const status =
                    row.status ||
                    (balance <= 0
                      ? "PAID"
                      : paid > 0
                        ? "PARTIAL"
                        : "UNPAID");

                  return (
                    <tr
                      key={
                        row.student_id ||
                        row.id ||
                        index
                      }
                    >

                      <td className="px-5 py-4 text-sm font-medium">
                        {studentName}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {admissionNumber}
                      </td>

                      <td className="px-5 py-4 text-sm text-right">
                        {number(
                          invoiceCount,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-right">
                        {money(
                          invoiced,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-right">
                        {money(
                          discount,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-right">
                        {money(
                          paid,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-right font-semibold text-primary">
                        {money(
                          balance,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {status}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}