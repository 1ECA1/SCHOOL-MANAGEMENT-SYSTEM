import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Users,
  Clock3,
  SearchCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function AdmissionOfficerApplicants() {
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

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

      const response = await fetch(`${API_BASE_URL}/admissions/applicants/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let message = "Failed to load applicants.";

        try {
          const data = await response.json();

          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore invalid JSON
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setApplicants(data);
      } else if (Array.isArray(data?.results)) {
        setApplicants(data.results);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error("Applicants error:", err);

      setError(err?.message || "Unable to load applicants.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applicants.filter((applicant) => {
      const matchesSearch =
        !query ||
        [
          applicant.application_number,
          applicant.first_name,
          applicant.middle_name,
          applicant.last_name,
          applicant.full_name,
          applicant.email,
          applicant.phone_number,
          applicant.guardian_name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || applicant.status === statusFilter;

      const matchesSource =
        sourceFilter === "ALL" || applicant.application_source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [applicants, search, statusFilter, sourceFilter]);

  const statistics = useMemo(() => {
    return {
      total: applicants.length,

      pending: applicants.filter((item) => item.status === "PENDING").length,

      underReview: applicants.filter((item) => item.status === "UNDER_REVIEW")
        .length,

      accepted: applicants.filter((item) => item.status === "ACCEPTED").length,

      rejected: applicants.filter((item) => item.status === "REJECTED").length,

      admitted: applicants.filter((item) => item.admitted_student).length,
    };
  }, [applicants]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      case "WITHDRAWN":
        return "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
    }
  };

  const getStatusLabel = (applicant) => {
    return applicant.status_display || applicant.status || "Unknown";
  };

  const formatDate = (date) => {
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
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]"
            />
          ))}
        </div>

        <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]" />

        <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => navigate("/admission-officer/applicants/register")}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        <UserPlus className="h-4 w-4" />
        Register Walk-in Applicant
      </button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Applicants
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review and manage student applications for your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchApplicants(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Unable to load applicants</p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applicants"
          value={statistics.total}
          icon={Users}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
          icon={Clock3}
          iconClass="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />

        <StatCard
          label="Under Review"
          value={statistics.underReview}
          icon={SearchCheck}
          iconClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
        />

        <StatCard
          label="Accepted"
          value={statistics.accepted}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
      </div>

      {/* FILTER CARD */}
      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-[var(--color-primary)]" />

          <h2 className="font-bold text-[var(--color-text)]">
            Search & Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* SEARCH */}
          <div className="relative lg:col-span-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="w-full rounded-2xl border border-slate-200 bg-[var(--color-background)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
            />
          </div>

          {/* STATUS */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 pr-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* SOURCE */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 pr-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="ALL">All Sources</option>
              <option value="ONLINE">Online</option>
              <option value="WALK_IN">Walk-in</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing{" "}
            <strong className="text-[var(--color-text)]">
              {filteredApplicants.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[var(--color-text)]">
              {applicants.length}
            </strong>{" "}
            applicants
          </span>

          {(search || statusFilter !== "ALL" || sourceFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSourceFilter("ALL");
              }}
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* APPLICANTS TABLE */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Application List
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select an applicant to review their complete application.
          </p>
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <FileText size={28} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[var(--color-text)]">
              No applicants found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Try changing your search or filter options.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applicant
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Application
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredApplicants.map((applicant) => (
                    <ApplicantRow
                      key={applicant.id}
                      applicant={applicant}
                      navigate={navigate}
                      getStatusClasses={getStatusClasses}
                      getStatusLabel={getStatusLabel}
                      formatDate={formatDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 p-4 lg:hidden">
              {filteredApplicants.map((applicant) => (
                <MobileApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  navigate={navigate}
                  getStatusClasses={getStatusClasses}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DESKTOP ROW
============================================================ */

function ApplicantRow({
  applicant,
  navigate,
  getStatusClasses,
  getStatusLabel,
  formatDate,
}) {
  const initials = `${(applicant.first_name?.[0] || "A").toUpperCase()}${(
    applicant.last_name?.[0] || ""
  ).toUpperCase()}`;

  return (
    <tr className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--color-text)]">
              {applicant.full_name ||
                `${applicant.first_name || ""} ${applicant.last_name || ""}`}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {applicant.email ||
                applicant.phone_number ||
                "No contact information"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {applicant.application_number || "—"}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formatDate(applicant.application_date || applicant.created_at)}
        </p>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {applicant.class_level_name || applicant.class_name || "—"}
        </p>

        {applicant.department_name && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {applicant.department_name}
          </p>
        )}
      </td>

      <td className="px-6 py-5">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {applicant.application_source_display ||
            applicant.application_source ||
            "—"}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
              applicant.status,
            )}`}
          >
            {getStatusLabel(applicant)}
          </span>

          {applicant.admitted_student && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Student admitted
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <button
          type="button"
          onClick={() =>
            navigate(`/admission-officer/applicants/${applicant.id}`)
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10"
        >
          <Eye size={16} />
          View
        </button>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE CARD
============================================================ */

function MobileApplicantCard({
  applicant,
  navigate,
  getStatusClasses,
  getStatusLabel,
  formatDate,
}) {
  const initials = `${(applicant.first_name?.[0] || "A").toUpperCase()}${(
    applicant.last_name?.[0] || ""
  ).toUpperCase()}`;

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--color-text)]">
              {applicant.full_name ||
                `${applicant.first_name || ""} ${applicant.last_name || ""}`}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {applicant.application_number || "No application number"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClasses(
            applicant.status,
          )}`}
        >
          {getStatusLabel(applicant)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400">Class</p>

          <p className="mt-1 font-medium text-[var(--color-text)]">
            {applicant.class_level_name || applicant.class_name || "—"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Source</p>

          <p className="mt-1 font-medium text-[var(--color-text)]">
            {applicant.application_source_display ||
              applicant.application_source ||
              "—"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Application Date</p>

          <p className="mt-1 font-medium text-[var(--color-text)]">
            {formatDate(applicant.application_date || applicant.created_at)}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Student</p>

          <p className="mt-1 font-medium text-[var(--color-text)]">
            {applicant.admitted_student ? "Admitted" : "Not admitted"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          navigate(`/admission-officer/applicants/${applicant.id}`)
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Eye size={17} />
        View Application
      </button>
    </div>
  );
}

export default AdmissionOfficerApplicants;
