import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock3,
  SearchCheck,
  CheckCircle2,
  XCircle,
  UserPlus,
  ArrowRight,
  RefreshCw,
  FileText,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function AdmissionOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH APPLICANTS
  // ============================================================

  const fetchApplicants = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_BASE_URL}/admissions/applicants/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to load applicants.";

        try {
          const data = await response.json();

          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const data = await response.json();

      // Django REST Framework pagination
      if (Array.isArray(data)) {
        setApplicants(data);
      } else if (Array.isArray(data?.results)) {
        setApplicants(data.results);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error("Admission dashboard error:", err);
      setError(
        err?.message ||
          "Unable to load applicant information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const total = applicants.length;

    const pending = applicants.filter(
      (applicant) => applicant.status === "PENDING"
    ).length;

    const underReview = applicants.filter(
      (applicant) => applicant.status === "UNDER_REVIEW"
    ).length;

    const accepted = applicants.filter(
      (applicant) => applicant.status === "ACCEPTED"
    ).length;

    const rejected = applicants.filter(
      (applicant) => applicant.status === "REJECTED"
    ).length;

    const withdrawn = applicants.filter(
      (applicant) => applicant.status === "WITHDRAWN"
    ).length;

    const admitted = applicants.filter(
      (applicant) => applicant.admitted_student
    ).length;

    return {
      total,
      pending,
      underReview,
      accepted,
      rejected,
      withdrawn,
      admitted,
    };
  }, [applicants]);

  // ============================================================
  // RECENT APPLICANTS
  // ============================================================

  const recentApplicants = useMemo(() => {
    return [...applicants]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.application_date || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || b.application_date || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [applicants]);

  // ============================================================
  // STATUS HELPERS
  // ============================================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-700";

      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "WITHDRAWN":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusLabel = (applicant) => {
    return (
      applicant.status_display ||
      applicant.status ||
      "Unknown"
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]" />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Welcome back,{" "}
            {user?.first_name || "Admission Officer"} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage applications, admissions, students, and
            enrollment from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchApplicants(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-start gap-3">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load dashboard data
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STAT CARDS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL APPLICANTS */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Applicants
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {statistics.total}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={23} />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/applicants")
            }
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            View applicants
            <ArrowRight size={13} />
          </button>
        </div>

        {/* PENDING */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {statistics.pending}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Clock3 size={23} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Applications waiting for review
          </p>
        </div>

        {/* UNDER REVIEW */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Under Review
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {statistics.underReview}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <SearchCheck size={23} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Applications currently being reviewed
          </p>
        </div>

        {/* ACCEPTED */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Accepted
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {statistics.accepted}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={23} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Applicants accepted for admission
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* SECONDARY SUMMARY */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* ADMITTED */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <UserPlus size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Students Admitted
              </p>

              <p className="text-2xl font-bold text-[var(--color-text)]">
                {statistics.admitted}
              </p>
            </div>
          </div>
        </div>

        {/* REJECTED */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <XCircle size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rejected
              </p>

              <p className="text-2xl font-bold text-[var(--color-text)]">
                {statistics.rejected}
              </p>
            </div>
          </div>
        </div>

        {/* WITHDRAWN */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400">
              <FileText size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Withdrawn
              </p>

              <p className="text-2xl font-bold text-[var(--color-text)]">
                {statistics.withdrawn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* RECENT APPLICATIONS */}
      {/* ================================================== */}

      <div className="rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest applications submitted to your school.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/applicants")
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        {/* CONTENT */}

        {recentApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <ClipboardList size={28} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[var(--color-text)]">
              No applications yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Applications submitted through the public
              application form or created as walk-ins will
              appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40"
              >
                {/* APPLICANT */}

                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    {(
                      applicant.first_name?.[0] ||
                      "A"
                    ).toUpperCase()}
                    {(
                      applicant.last_name?.[0] ||
                      ""
                    ).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text)]">
                      {applicant.full_name ||
                        `${applicant.first_name || ""} ${
                          applicant.last_name || ""
                        }`}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {applicant.application_number ||
                          "No application number"}
                      </span>

                      <span className="hidden sm:inline">
                        •
                      </span>

                      <span>
                        {formatDate(
                          applicant.application_date ||
                            applicant.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS / ACTION */}

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        applicant.status
                      )}`}
                    >
                      {getStatusLabel(applicant)}
                    </span>

                    {applicant.application_source_display && (
                      <span className="text-[11px] text-slate-400">
                        {applicant.application_source_display}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admission-officer/applicants/${applicant.id}`
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:hover:bg-blue-500/10"
                    title="View applicant"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* QUICK ACTIONS */}
      {/* ================================================== */}

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quickly access common admission tasks.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/applicants")
            }
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-500/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ClipboardList size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--color-text)]">
                Manage Applicants
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Review and process applications
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/students")
            }
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-500/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Users size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--color-text)]">
                Students
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                View admitted students
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/enrollment")
            }
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-500/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <UserPlus size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--color-text)]">
                Enrollment
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Manage student enrollment
              </p>
            </div>

            <ArrowRight
              size={17}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdmissionOfficerDashboard;