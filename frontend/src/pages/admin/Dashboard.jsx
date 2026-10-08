import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Loader2,
  RefreshCw,
  Users,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/school-super-admin/super-admin/dashboard/"
      );

      setDashboard(response.data);
    } catch (err) {
      console.error("Failed to load Super Admin dashboard:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // DATA
  // ============================================================

  const statistics = dashboard?.statistics || {};
  const finance = dashboard?.finance || {};
  const academic = dashboard?.academic || {};

  const notices = dashboard?.notices || [];
  const activities = dashboard?.recent_activities || [];

  // Show no more than 7 audit activities
  const recentActivities = activities.slice(0, 7);

  // ============================================================
  // CURRENCY
  // ============================================================

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₦${number.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ============================================================
  // NUMBER
  // ============================================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-NG");
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ============================================================
  // FINANCE CHART
  // ============================================================

  const financeBars = useMemo(() => {
    const collections = Number(finance.total_collected || 0);
    const fees = Number(finance.total_invoiced || 0);
    const expenses = Number(finance.total_expenses || 0);

    const maximum = Math.max(collections, fees, expenses, 1);

    return [
      {
        label: "Collections",
        value: collections,
        height: `${Math.max(
          (collections / maximum) * 100,
          collections > 0 ? 8 : 3
        )}%`,
        className: "bg-[var(--color-primary)]",
      },
      {
        label: "Fees",
        value: fees,
        height: `${Math.max(
          (fees / maximum) * 100,
          fees > 0 ? 8 : 3
        )}%`,
        className: "bg-[var(--color-secondary)]",
      },
      {
        label: "Expenses",
        value: expenses,
        height: `${Math.max(
          (expenses / maximum) * 100,
          expenses > 0 ? 8 : 3
        )}%`,
        className: "bg-slate-400",
      },
    ];
  }, [
    finance.total_collected,
    finance.total_invoiced,
    finance.total_expenses,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statisticCards = [
    {
      title: "Students",
      value: formatNumber(statistics.students),
      subtitle: `${formatNumber(statistics.active_students)} active`,
      icon: GraduationCap,
      path: "/admin/students",
    },
    {
      title: "Teachers",
      value: formatNumber(statistics.teachers),
      subtitle: `${formatNumber(statistics.active_teachers)} active`,
      icon: UserRound,
      path: "/admin/teachers",
    },
    {
      title: "Parents",
      value: formatNumber(statistics.parents),
      subtitle: `${formatNumber(statistics.active_parents)} active`,
      icon: Users,
      path: "/admin/parents",
    },
    {
      title: "Total Collected",
      value: formatCurrency(finance.total_collected),
      subtitle: `${finance.collection_rate || 0}% collection rate`,
      icon: DollarSign,
      path: "/admin/finance",
    },
  ];

  // ============================================================
  // SYSTEM OVERVIEW CARDS
  // ============================================================

  const systemOverviewCards = [
    {
      title: "Schools",
      value: formatNumber(statistics.schools),
      subtitle: `${formatNumber(statistics.active_schools)} active`,
      path: "/admin/academic/schools",
    },
    {
      title: "School Admins",
      value: formatNumber(statistics.school_admins),
      subtitle: `${formatNumber(statistics.active_school_admins)} active`,
      path: "/admin/school-admins",
    },
    {
      title: "Current Enrollments",
      value: formatNumber(statistics.current_enrollments),
      subtitle: "Currently enrolled",
      path: "/admin/students",
    },
    {
      title: "Current Terms",
      value: formatNumber(academic.current_terms),
      subtitle: "Active current terms",
      path: "/admin/academic/terms",
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !dashboard) {
    return (
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-[var(--color-card)] p-6 text-center shadow-sm dark:border-red-900/50">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-[var(--color-text)]">
              Unable to load dashboard
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, Super Admin. Here's what's happening across the
            system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR BANNER
          ===================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-500/10">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Dashboard refresh issue
            </p>

            <p className="mt-1 text-xs text-red-600 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statisticCards.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className="group flex min-h-[125px] w-full items-center gap-4 rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md dark:border-slate-800"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[var(--color-primary)] dark:bg-purple-500/10">
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h3 className="truncate text-2xl font-bold text-[var(--color-text)]">
                  {item.value}
                </h3>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)] dark:text-slate-600" />
            </button>
          );
        })}
      </div>

      {/* =====================================================
          SYSTEM OVERVIEW
          ===================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {systemOverviewCards.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => navigate(item.path)}
            className="group rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md dark:border-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)] dark:text-slate-600" />
            </div>
          </button>
        ))}
      </div>

      {/* =====================================================
          FINANCE + NOTICE BOARD
          ===================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Finance Card */}

        <button
          type="button"
          onClick={() => navigate("/admin/finance")}
          className="group min-h-[320px] rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 text-left shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md dark:border-slate-800"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Fees Collection & Expenses
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Real-time financial overview
              </p>
            </div>

            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)]" />
          </div>

          <div className="flex h-[190px] items-end justify-evenly gap-4 border-b border-slate-200 px-2 dark:border-slate-700 sm:gap-8 sm:px-6">
            {financeBars.map((bar) => (
              <div
                key={bar.label}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div
                  className={`relative mx-auto w-10 rounded-t-lg transition-all duration-500 sm:w-16 ${bar.className}`}
                  style={{
                    height: bar.height,
                  }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[var(--color-text)]">
                    {formatCurrency(bar.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-evenly gap-4 pt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            {financeBars.map((bar) => (
              <span key={bar.label} className="flex-1">
                {bar.label}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Collected
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                {formatCurrency(finance.total_collected)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Invoiced
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                {formatCurrency(finance.total_invoiced)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Outstanding
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                {formatCurrency(finance.total_outstanding)}
              </p>
            </div>
          </div>
        </button>

        {/* Notice Board */}

        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          className="group rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 text-left shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md dark:border-slate-800"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Notice Board
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your latest notifications
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-[var(--color-primary)] dark:bg-purple-500/10">
                <Bell className="h-4 w-4" />
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)]" />
            </div>
          </div>

          {notices.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Bell className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-[var(--color-text)]">
                No notifications
              </p>

              <p className="mt-1 max-w-[220px] text-xs text-slate-500 dark:text-slate-400">
                You don't have any notifications yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[310px] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`py-4 ${
                    !notice.is_read
                      ? "rounded-lg bg-purple-50/50 px-3 dark:bg-purple-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notice.is_read
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-[var(--color-primary)]"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <strong className="text-sm font-semibold text-[var(--color-text)]">
                          {notice.title}
                        </strong>

                        {!notice.is_read && (
                          <span className="w-fit rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-primary)] dark:bg-purple-500/10">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {notice.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {notice.notification_type_display && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {notice.notification_type_display}
                          </span>
                        )}

                        <span className="text-[9px] text-slate-400">
                          {formatDateTime(notice.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </button>
      </div>

      {/* =====================================================
          ACTIVITIES + ACADEMIC SUMMARY
          ===================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent Audit Activities */}

        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">
                Recent Audit Activity
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Latest system activities
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/audit")}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-700"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-[var(--color-text)]">
                No recent activities
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                System activities will appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/audit")}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Open Audit
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 py-4">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <strong className="text-sm font-semibold text-[var(--color-text)]">
                        {activity.description ||
                          activity.action_display ||
                          activity.action ||
                          "System activity"}
                      </strong>

                      <span className="shrink-0 text-[9px] text-slate-400">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {activity.user_name
                        ? `By ${activity.user_name}`
                        : "System"}
                      {activity.model_name
                        ? ` • ${activity.model_name}`
                        : ""}
                      {activity.object_repr
                        ? ` • ${activity.object_repr}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}

              {/* Bottom Audit Button */}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/audit")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800/50"
                >
                  View All Audit Activities
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Summary */}

        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Quick Summary
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Current system overview
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Active schools
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {formatNumber(statistics.active_schools)}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Current enrollments
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {formatNumber(statistics.current_enrollments)}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Finance collection
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {finance.collection_rate || 0}%
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Paid expenses
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {formatCurrency(finance.total_expenses)}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Current academic sessions
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {formatNumber(academic.current_sessions)}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Current terms
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                {formatNumber(academic.current_terms)}
              </strong>
            </div>

            {academic.sessions?.length > 0 && (
              <div className="py-4">
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Current Sessions
                </p>

                <div className="space-y-2">
                  {academic.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                    >
                      <span className="truncate text-xs font-medium text-[var(--color-text)]">
                        {session.school_name}
                      </span>

                      <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
                        {session.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {academic.terms?.length > 0 && (
              <div className="py-4">
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Current Terms
                </p>

                <div className="space-y-2">
                  {academic.terms.map((term) => (
                    <div
                      key={term.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                    >
                      <span className="truncate text-xs font-medium text-[var(--color-text)]">
                        {term.school_name}
                      </span>

                      <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
                        {term.name_display || term.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;