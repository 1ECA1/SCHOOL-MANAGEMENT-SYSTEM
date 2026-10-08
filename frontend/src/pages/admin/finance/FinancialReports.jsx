import { useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Wallet,
  Receipt,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  Search,
  Building2,
} from "lucide-react";

import api from "../../../services/api";

function FinancialReports() {
  const [activeReport, setActiveReport] = useState("summary");

  // =====================================================
  // SCHOOL
  // =====================================================

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);

  // =====================================================
  // REPORT DATA
  // =====================================================

  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [students, setStudents] = useState(null);

  // =====================================================
  // FILTER DATA
  // =====================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  // =====================================================
  // STUDENT SEARCH
  // =====================================================

  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [searchingStudents, setSearchingStudents] = useState(false);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [summaryFilters, setSummaryFilters] = useState({
    date_from: "",
    date_to: "",
  });

  const [studentFilters, setStudentFilters] = useState({
    academic_session: "",
    term: "",
    student: "",
  });

  // =====================================================
  // LOAD SCHOOLS
  // =====================================================

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      setError("");

      const response = await api.get("/academics/schools/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const activeSchools = data.filter(
        (school) => school.is_active !== false,
      );

      setSchools(activeSchools);
    } catch (err) {
      console.error("Failed to load schools:", err);

      setSchools([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load schools.",
      );
    } finally {
      setLoadingSchools(false);
    }
  };

  // =====================================================
  // SCHOOL CHANGE
  // =====================================================

  const handleSchoolChange = async (event) => {
    const schoolId = event.target.value;

    setSelectedSchool(schoolId);

    setSummary(null);
    setIncome(null);
    setExpenses(null);
    setStudents(null);

    setSessions([]);
    setTerms([]);

    setStudentSearch("");
    setStudentSearchResults([]);
    setSelectedStudent(null);

    setStudentFilters({
      academic_session: "",
      term: "",
      student: "",
    });

    setError("");

    if (!schoolId) {
      return;
    }

    await loadFilterData(schoolId);

    await loadReport(activeReport, schoolId);
  };

  // =====================================================
  // LOAD SESSION AND TERM FILTER DATA
  // =====================================================

  const loadFilterData = async (schoolId) => {
    if (!schoolId) {
      return;
    }

    try {
      setLoadingFilters(true);

      const [sessionsResponse, termsResponse] =
        await Promise.all([
          api.get("/academics/sessions/", {
            params: {
              school: schoolId,
            },
          }),

          api.get("/academics/terms/", {
            params: {
              school: schoolId,
            },
          }),
        ]);

      setSessions(
        Array.isArray(sessionsResponse.data)
          ? sessionsResponse.data
          : sessionsResponse.data?.results || [],
      );

      setTerms(
        Array.isArray(termsResponse.data)
          ? termsResponse.data
          : termsResponse.data?.results || [],
      );
    } catch (err) {
      console.error(
        "Failed to load report filters:",
        err,
      );

      setSessions([]);
      setTerms([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load academic filters.",
      );
    } finally {
      setLoadingFilters(false);
    }
  };

  // =====================================================
  // LOAD CURRENT REPORT WHEN TAB CHANGES
  // =====================================================

  useEffect(() => {
    if (!selectedSchool) {
      return;
    }

    loadReport(activeReport, selectedSchool);
  }, [activeReport]);

  // =====================================================
  // LOAD REPORT
  // =====================================================

  const loadReport = async (
    reportType,
    schoolId = selectedSchool,
  ) => {
    if (!schoolId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (reportType === "summary") {
        await loadSummary(schoolId);
      }

      if (reportType === "income") {
        await loadIncome(schoolId);
      }

      if (reportType === "expenses") {
        await loadExpenses(schoolId);
      }

      if (reportType === "students") {
        await loadStudents(schoolId);
      }
    } catch (err) {
      console.error(
        "Failed to load financial report:",
        err,
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load financial report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentReport = async () => {
    if (!selectedSchool) {
      setError("Please select a school first.");
      return;
    }

    await loadReport(activeReport, selectedSchool);
  };

  // =====================================================
  // SUMMARY REPORT
  // =====================================================

  const loadSummary = async (schoolId) => {
    if (!schoolId) {
      return;
    }

    const params = {
      school: schoolId,
    };

    if (summaryFilters.date_from) {
      params.date_from = summaryFilters.date_from;
    }

    if (summaryFilters.date_to) {
      params.date_to = summaryFilters.date_to;
    }

    const response = await api.get(
      "/finance/reports/financial-summary/",
      { params },
    );

    setSummary(response.data);
  };

  // =====================================================
  // INCOME REPORT
  // =====================================================

  const loadIncome = async (schoolId) => {
    if (!schoolId) {
      return;
    }

    const response = await api.get(
      "/finance/reports/income/",
      {
        params: {
          school: schoolId,
        },
      },
    );

    setIncome(response.data);
  };

  // =====================================================
  // EXPENSE REPORT
  // =====================================================

  const loadExpenses = async (schoolId) => {
    if (!schoolId) {
      return;
    }

    const response = await api.get(
      "/finance/reports/expenses/",
      {
        params: {
          school: schoolId,
        },
      },
    );

    setExpenses(response.data);
  };

  // =====================================================
  // STUDENT FINANCIAL REPORT
  // =====================================================

  const loadStudents = async (schoolId) => {
    if (!schoolId) {
      return;
    }

    const params = {
      school: schoolId,
    };

    if (studentFilters.academic_session) {
      params.academic_session =
        studentFilters.academic_session;
    }

    if (studentFilters.term) {
      params.term = studentFilters.term;
    }

    if (studentFilters.student) {
      params.student = studentFilters.student;
    }

    const response = await api.get(
      "/finance/reports/students/",
      { params },
    );

    setStudents(response.data);
  };

  // =====================================================
  // SEARCH STUDENT
  // =====================================================

  const handleStudentSearch = async (event) => {
    const value = event.target.value;

    setStudentSearch(value);
    setSelectedStudent(null);

    setStudentFilters((prev) => ({
      ...prev,
      student: "",
    }));

    if (!value.trim()) {
      setStudentSearchResults([]);
      return;
    }

    if (!selectedSchool) {
      setError("Please select a school first.");
      return;
    }

    try {
      setSearchingStudents(true);
      setError("");

      const response = await api.get("/students/", {
        params: {
          search: value.trim(),
          school: selectedSchool,
        },
      });

      const results = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setStudentSearchResults(results);
    } catch (err) {
      console.error(
        "Failed to search students:",
        err,
      );

      setStudentSearchResults([]);

      setError(
        err.response?.data?.detail ||
          "Failed to search students.",
      );
    } finally {
      setSearchingStudents(false);
    }
  };

  // =====================================================
  // SELECT STUDENT
  // =====================================================

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);

    setStudentSearch(
      student.admission_number ||
        student.admission_no ||
        "",
    );

    setStudentSearchResults([]);

    setStudentFilters((prev) => ({
      ...prev,
      student: student.id,
    }));
  };

  // =====================================================
  // CLEAR STUDENT
  // =====================================================

  const clearSelectedStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setStudentSearchResults([]);

    setStudentFilters((prev) => ({
      ...prev,
      student: "",
    }));
  };

  // =====================================================
  // FILTER HANDLERS
  // =====================================================

  const handleSummaryFilterChange = (event) => {
    const { name, value } = event.target;

    setSummaryFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentFilterChange = (event) => {
    const { name, value } = event.target;

    setStudentFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SUMMARY FILTER SUBMIT
  // =====================================================

  const handleSummaryFilterSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSchool) {
      setError("Please select a school first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await loadSummary(selectedSchool);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.date_from ||
          err.response?.data?.date_to ||
          "Failed to load summary report.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STUDENT FILTER SUBMIT
  // =====================================================

  const handleStudentFilterSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSchool) {
      setError("Please select a school first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await loadStudents(selectedSchool);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.academic_session ||
          err.response?.data?.term ||
          err.response?.data?.student ||
          "Failed to load student financial report.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMATTING
  // =====================================================

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-NG").format(
      Number(value || 0),
    );
  };

  const getStudentName = (student) => {
    if (!student) {
      return "";
    }

    return (
      student.full_name ||
      student.name ||
      `${student.first_name || ""} ${
        student.last_name || ""
      }`.trim() ||
      student.admission_number ||
      "Student"
    );
  };

  const getAdmissionNumber = (student) => {
    return (
      student?.admission_number ||
      student?.admission_no ||
      "No admission number"
    );
  };

  const selectedSchoolName =
    schools.find(
      (school) =>
        String(school.id) ===
        String(selectedSchool),
    )?.name || "";

  // =====================================================
  // REPORT TABS
  // =====================================================

  const reportTabs = [
    {
      id: "summary",
      name: "Summary",
      icon: BarChart3,
    },
    {
      id: "income",
      name: "Income",
      icon: TrendingUp,
    },
    {
      id: "expenses",
      name: "Expenses",
      icon: TrendingDown,
    },
    {
      id: "students",
      name: "Students",
      icon: Users,
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full min-w-0 space-y-6 bg-[var(--color-background)] text-[var(--color-text)]">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Financial Reports
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            View financial reports for a selected
            school.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCurrentReport}
          disabled={loading || !selectedSchool}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {/* =================================================
          SCHOOL SELECTOR
      ================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Building2 size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-[var(--color-text)]">
              Select School
            </h2>

            <p className="text-sm text-[var(--color-text)]/60">
              Select a school before viewing its
              financial reports.
            </p>
          </div>
        </div>

        <select
          value={selectedSchool}
          onChange={handleSchoolChange}
          disabled={loadingSchools}
          className="h-11 w-full rounded-xl border border-slate-300 bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600"
        >
          <option value="">
            {loadingSchools
              ? "Loading schools..."
              : "Select a school"}
          </option>

          {schools.map((school) => (
            <option
              key={school.id}
              value={school.id}
            >
              {school.name}
            </option>
          ))}
        </select>

        {selectedSchool && (
          <div className="mt-3 rounded-lg bg-[var(--color-primary)]/5 px-3 py-2 text-sm text-[var(--color-text)]/70">
            Showing financial information for{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {selectedSchoolName}
            </span>
          </div>
        )}
      </div>

      {/* =================================================
          REQUIRE SCHOOL
      ================================================= */}
      {!selectedSchool && !loadingSchools && (
        <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] py-16 text-center shadow-sm dark:border-slate-700">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Building2 size={26} />
          </div>

          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Select a School
          </h2>

          <p className="mx-auto mt-1 max-w-md px-4 text-sm text-[var(--color-text)]/60">
            Please select a school above to view
            its financial reports.
          </p>
        </div>
      )}

      {/* =================================================
          REPORT CONTENT
      ================================================= */}
      {selectedSchool && (
        <>
          {/* Report Navigation */}
          <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-2 shadow-sm dark:border-slate-700">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  activeReport === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveReport(tab.id)
                    }
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-[var(--color-text)]/70 hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />
                    <span className="truncate">
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-[var(--color-card)] py-16 shadow-sm dark:border-slate-700">
              <div className="flex items-center gap-3 text-sm text-[var(--color-text)]/60">
                <RefreshCw
                  size={20}
                  className="animate-spin text-[var(--color-primary)]"
                />
                Loading report...
              </div>
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}
          {!loading &&
            activeReport === "summary" && (
              <div className="space-y-6">
                <form
                  onSubmit={
                    handleSummaryFilterSubmit
                  }
                  className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700"
                >
                  <div className="mb-4">
                    <h2 className="font-semibold text-[var(--color-text)]">
                      Summary Filters
                    </h2>

                    <p className="text-sm text-[var(--color-text)]/60">
                      Filter financial activity by
                      date.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]/80">
                        Date From
                      </label>

                      <input
                        type="date"
                        name="date_from"
                        value={
                          summaryFilters.date_from
                        }
                        onChange={
                          handleSummaryFilterChange
                        }
                        className="w-full rounded-xl border border-slate-300 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-600"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]/80">
                        Date To
                      </label>

                      <input
                        type="date"
                        name="date_to"
                        value={
                          summaryFilters.date_to
                        }
                        onChange={
                          handleSummaryFilterChange
                        }
                        className="w-full rounded-xl border border-slate-300 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-600"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </form>

                {summary && (
                  <>
                    <div>
                      <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
                        Income
                      </h2>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <ReportCard
                          title="Total Invoiced"
                          value={formatMoney(
                            summary.income
                              ?.total_invoiced,
                          )}
                          icon={Receipt}
                        />

                        <ReportCard
                          title="Total Discounts"
                          value={formatMoney(
                            summary.income
                              ?.total_discounts,
                          )}
                          icon={Wallet}
                        />

                        <ReportCard
                          title="Net Invoiced"
                          value={formatMoney(
                            summary.income
                              ?.net_invoiced,
                          )}
                          icon={FileText}
                        />

                        <ReportCard
                          title="Total Collected"
                          value={formatMoney(
                            summary.income
                              ?.total_collected,
                          )}
                          icon={CreditCard}
                        />

                        <ReportCard
                          title="Outstanding"
                          value={formatMoney(
                            summary.income
                              ?.total_outstanding,
                          )}
                          icon={Receipt}
                        />

                        <ReportCard
                          title="Collection Rate"
                          value={`${Number(
                            summary.income
                              ?.collection_rate ||
                              0,
                          ).toFixed(2)}%`}
                          icon={TrendingUp}
                        />
                      </div>
                    </div>

                    <div>
                      <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
                        Expenses
                      </h2>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <ReportCard
                          title="Paid Expenses"
                          value={formatMoney(
                            summary.expenses
                              ?.total_expenses,
                          )}
                          icon={TrendingDown}
                        />

                        <ReportCard
                          title="Pending Expenses"
                          value={formatMoney(
                            summary.expenses
                              ?.pending_expenses,
                          )}
                          icon={Wallet}
                        />

                        <ReportCard
                          title="Cancelled Expenses"
                          value={formatMoney(
                            summary.expenses
                              ?.cancelled_expenses,
                          )}
                          icon={FileText}
                        />

                        <ReportCard
                          title="Net Balance"
                          value={formatMoney(
                            summary.net_balance,
                          )}
                          icon={BarChart3}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
                      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                        Financial Counts
                      </h2>

                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        <CountItem
                          label="Invoices"
                          value={
                            summary.counts
                              ?.invoice_count
                          }
                        />

                        <CountItem
                          label="Paid Invoices"
                          value={
                            summary.counts
                              ?.paid_invoice_count
                          }
                        />

                        <CountItem
                          label="Partial Invoices"
                          value={
                            summary.counts
                              ?.partial_invoice_count
                          }
                        />

                        <CountItem
                          label="Unpaid Invoices"
                          value={
                            summary.counts
                              ?.unpaid_invoice_count
                          }
                        />

                        <CountItem
                          label="Overdue Invoices"
                          value={
                            summary.counts
                              ?.overdue_invoice_count
                          }
                        />

                        <CountItem
                          label="Successful Payments"
                          value={
                            summary.counts
                              ?.successful_payment_count
                          }
                        />

                        <CountItem
                          label="Expenses"
                          value={
                            summary.counts
                              ?.expense_count
                          }
                        />

                        <CountItem
                          label="Paid Expenses"
                          value={
                            summary.counts
                              ?.paid_expense_count
                          }
                        />

                        <CountItem
                          label="Pending Expenses"
                          value={
                            summary.counts
                              ?.pending_expense_count
                          }
                        />

                        <CountItem
                          label="Cancelled Expenses"
                          value={
                            summary.counts
                              ?.cancelled_expense_count
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          {/* =================================================
              INCOME
          ================================================= */}
          {!loading &&
            activeReport === "income" &&
            income && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ReportCard
                    title="Total Invoiced"
                    value={formatMoney(
                      income.summary
                        ?.total_invoiced,
                    )}
                    icon={Receipt}
                  />

                  <ReportCard
                    title="Total Discounts"
                    value={formatMoney(
                      income.summary
                        ?.total_discounts,
                    )}
                    icon={Wallet}
                  />

                  <ReportCard
                    title="Net Invoiced"
                    value={formatMoney(
                      income.summary
                        ?.net_invoiced,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Total Collected"
                    value={formatMoney(
                      income.summary
                        ?.total_collected,
                    )}
                    icon={CreditCard}
                  />

                  <ReportCard
                    title="Outstanding"
                    value={formatMoney(
                      income.summary
                        ?.total_outstanding,
                    )}
                    icon={Receipt}
                  />

                  <ReportCard
                    title="Collection Rate"
                    value={`${Number(
                      income.summary
                        ?.collection_rate || 0,
                    ).toFixed(2)}%`}
                    icon={TrendingUp}
                  />
                </div>

                <ReportTable
                  title="Payment Methods"
                  columns={[
                    "Payment Method",
                    "Transactions",
                    "Total",
                  ]}
                >
                  {income.payment_methods
                    ?.length ? (
                    income.payment_methods.map(
                      (item) => (
                        <tr
                          key={
                            item.payment_method
                          }
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {
                              item.payment_method
                            }
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              item.count,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              item.total,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={3}
                    />
                  )}
                </ReportTable>

                <ReportTable
                  title="Fee Category Breakdown"
                  columns={[
                    "Fee Category",
                    "Invoices",
                    "Invoiced",
                    "Discounts",
                    "Net Invoiced",
                    "Outstanding",
                  ]}
                >
                  {income.fee_categories
                    ?.length ? (
                    income.fee_categories.map(
                      (item) => (
                        <tr
                          key={
                            item.fee_category_id
                          }
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {
                              item.fee_category_name
                            }
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              item.invoice_count,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              item.total_invoiced,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              item.total_discounts,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              item.net_invoiced,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              item.total_outstanding,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={6}
                    />
                  )}
                </ReportTable>
              </div>
            )}

          {/* =================================================
              EXPENSES
          ================================================= */}
          {!loading &&
            activeReport === "expenses" &&
            expenses && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ReportCard
                    title="Paid Expenses"
                    value={formatMoney(
                      expenses.summary
                        ?.total_expenses,
                    )}
                    icon={TrendingDown}
                  />

                  <ReportCard
                    title="Pending Expenses"
                    value={formatMoney(
                      expenses.summary
                        ?.pending_expenses,
                    )}
                    icon={Wallet}
                  />

                  <ReportCard
                    title="Cancelled Expenses"
                    value={formatMoney(
                      expenses.summary
                        ?.cancelled_expenses,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Total Expense Records"
                    value={formatNumber(
                      expenses.summary
                        ?.expense_count,
                    )}
                    icon={Receipt}
                  />
                </div>

                <ReportTable
                  title="Expense Categories"
                  columns={[
                    "Category",
                    "Records",
                    "Total",
                  ]}
                >
                  {expenses.categories
                    ?.length ? (
                    expenses.categories.map(
                      (item) => (
                        <tr
                          key={
                            item.expense_category_id
                          }
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {
                              item.expense_category_name
                            }
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              item.count,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              item.total,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={3}
                    />
                  )}
                </ReportTable>

                <ReportTable
                  title="Expense Payment Methods"
                  columns={[
                    "Payment Method",
                    "Records",
                    "Total",
                  ]}
                >
                  {expenses.payment_methods
                    ?.length ? (
                    expenses.payment_methods.map(
                      (item) => (
                        <tr
                          key={
                            item.payment_method
                          }
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {
                              item.payment_method
                            }
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              item.count,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              item.total,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={3}
                    />
                  )}
                </ReportTable>

                <ReportTable
                  title="Expense Status"
                  columns={[
                    "Status",
                    "Records",
                    "Total",
                  ]}
                >
                  {expenses.statuses
                    ?.length ? (
                    expenses.statuses.map(
                      (item) => (
                        <tr
                          key={item.status}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {item.status}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              item.count,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              item.total,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={3}
                    />
                  )}
                </ReportTable>
              </div>
            )}

          {/* =================================================
              STUDENTS
          ================================================= */}
          {!loading &&
            activeReport === "students" &&
            students && (
              <div className="space-y-6">
                <form
                  onSubmit={
                    handleStudentFilterSubmit
                  }
                  className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700"
                >
                  <div className="mb-4">
                    <h2 className="font-semibold text-[var(--color-text)]">
                      Student Report Filters
                    </h2>

                    <p className="text-sm text-[var(--color-text)]/60">
                      Search for a student within the
                      selected school and optionally
                      filter by session or term.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]/80">
                        Academic Session
                      </label>

                      <select
                        name="academic_session"
                        value={
                          studentFilters.academic_session
                        }
                        onChange={
                          handleStudentFilterChange
                        }
                        disabled={loadingFilters}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:opacity-60 dark:border-slate-600"
                      >
                        <option value="">
                          All Sessions
                        </option>

                        {sessions.map(
                          (session) => (
                            <option
                              key={session.id}
                              value={session.id}
                            >
                              {session.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]/80">
                        Term
                      </label>

                      <select
                        name="term"
                        value={
                          studentFilters.term
                        }
                        onChange={
                          handleStudentFilterChange
                        }
                        disabled={loadingFilters}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:opacity-60 dark:border-slate-600"
                      >
                        <option value="">
                          All Terms
                        </option>

                        {terms.map(
                          (term) => (
                            <option
                              key={term.id}
                              value={term.id}
                            >
                              {term.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]/80">
                        Student Admission Number
                      </label>

                      <div className="relative">
                        <Search
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40"
                        />

                        <input
                          type="text"
                          value={studentSearch}
                          onChange={
                            handleStudentSearch
                          }
                          placeholder="Search admission number..."
                          className="w-full rounded-xl border border-slate-300 bg-[var(--color-background)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-600"
                        />

                        {searchingStudents && (
                          <RefreshCw
                            size={17}
                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text)]/40"
                          />
                        )}
                      </div>

                      {studentSearchResults.length >
                        0 && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-xl dark:border-slate-700">
                          {studentSearchResults.map(
                            (student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() =>
                                  handleSelectStudent(
                                    student,
                                  )
                                }
                                className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left transition last:border-b-0 hover:bg-[var(--color-background)] dark:border-slate-700"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                    {getStudentName(
                                      student,
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[var(--color-text)]/60">
                                    Admission No:{" "}
                                    {getAdmissionNumber(
                                      student,
                                    )}
                                  </p>
                                </div>
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedStudent && (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-[var(--color-background)] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text)]/50">
                          Selected Student
                        </p>

                        <p className="mt-1 truncate font-semibold text-[var(--color-text)]">
                          {getStudentName(
                            selectedStudent,
                          )}
                        </p>

                        <p className="text-sm text-[var(--color-text)]/60">
                          Admission No:{" "}
                          {getAdmissionNumber(
                            selectedStudent,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          clearSelectedStudent
                        }
                        className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)]/70 transition hover:bg-[var(--color-background)] sm:w-auto dark:border-slate-600"
                      >
                        Clear Student
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !studentFilters.student
                      }
                      className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Search Financial Report
                    </button>
                  </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ReportCard
                    title="Total Invoiced"
                    value={formatMoney(
                      students.summary
                        ?.total_invoiced,
                    )}
                    icon={Receipt}
                  />

                  <ReportCard
                    title="Total Discounts"
                    value={formatMoney(
                      students.summary
                        ?.total_discounts,
                    )}
                    icon={Wallet}
                  />

                  <ReportCard
                    title="Net Invoiced"
                    value={formatMoney(
                      students.summary
                        ?.net_invoiced,
                    )}
                    icon={FileText}
                  />

                  <ReportCard
                    title="Total Collected"
                    value={formatMoney(
                      students.summary
                        ?.total_collected,
                    )}
                    icon={CreditCard}
                  />

                  <ReportCard
                    title="Outstanding"
                    value={formatMoney(
                      students.summary
                        ?.total_outstanding,
                    )}
                    icon={Receipt}
                  />

                  <ReportCard
                    title="Students"
                    value={formatNumber(
                      students.summary
                        ?.student_count,
                    )}
                    icon={Users}
                  />
                </div>

                <ReportTable
                  title="Student Financial Details"
                  columns={[
                    "Student",
                    "Invoices",
                    "Invoiced",
                    "Discounts",
                    "Net Invoiced",
                    "Collected",
                    "Outstanding",
                    "Payments",
                  ]}
                >
                  {students.students
                    ?.length ? (
                    students.students.map(
                      (student) => (
                        <tr
                          key={
                            student.student_id
                          }
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                            {
                              student.student_name ||
                              "Student"
                            }
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              student.invoice_count,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              student.total_invoiced,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              student.total_discounts,
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {formatMoney(
                              student.net_invoiced,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              student.total_collected,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatMoney(
                              student.total_outstanding,
                            )}
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text)]/70">
                            {formatNumber(
                              student.successful_payment_count,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <EmptyTableRow
                      colSpan={8}
                    />
                  )}
                </ReportTable>
              </div>
            )}

          {/* No report data */}
          {!loading &&
            ((activeReport === "income" &&
              !income) ||
              (activeReport === "expenses" &&
                !expenses) ||
              (activeReport === "students" &&
                !students)) && (
              <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] py-16 text-center shadow-sm dark:border-slate-700">
                <p className="text-sm text-[var(--color-text)]/60">
                  No report data available.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}

// =====================================================
// REPORT CARD
// =====================================================

function ReportCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-text)]/60">
            {title}
          </p>

          <p className="mt-2 break-words text-xl font-bold text-[var(--color-text)]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// COUNT ITEM
// =====================================================

function CountItem({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--color-background)] p-4">
      <p className="text-xs font-medium text-[var(--color-text)]/60">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-[var(--color-text)]">
        {Number(value || 0).toLocaleString(
          "en-NG",
        )}
      </p>
    </div>
  );
}

// =====================================================
// REPORT TABLE
// =====================================================

function ReportTable({
  title,
  columns,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="font-semibold text-[var(--color-text)]">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-background)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// EMPTY TABLE
// =====================================================

function EmptyTableRow({ colSpan }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-[var(--color-text)]/60"
      >
        No data available.
      </td>
    </tr>
  );
}

export default FinancialReports;