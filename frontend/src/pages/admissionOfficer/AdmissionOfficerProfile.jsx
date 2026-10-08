import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
  BriefcaseBusiness,
  UserRound,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import api from "../../services/api";

export default function AdmissionOfficerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  const loadProfile = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/admissions/my-profile/"
      );

      setProfile(response.data);
    } catch (err) {
      console.error(
        "Admission Officer profile error:",
        err
      );

      const data = err?.response?.data;

      setError(
        data?.detail ||
          data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const getFullName = () => {
    if (!profile) {
      return "—";
    }

    return (
      profile.full_name ||
      `${profile.first_name || ""} ${
        profile.last_name || ""
      }`.trim() ||
      profile.username ||
      "—"
    );
  };

  const getInitials = () => {
    const name = getFullName();

    if (!name || name === "—") {
      return "AO";
    }

    const parts = name
      .split(" ")
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const accountIsActive =
    profile?.is_active !== false;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 transition-colors sm:p-6 lg:p-8 dark:bg-[var(--color-background)]">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-[var(--color-card)] p-10 text-center shadow-sm ring-1 ring-slate-200/70 transition-colors dark:ring-slate-700/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
              <RefreshCw
                size={26}
                className="animate-spin text-[var(--color-primary)]"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[var(--color-text)]">
              Loading Profile
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please wait while we load your
              profile information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 transition-colors sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40">
                <ShieldCheck
                  size={21}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
                  Unable to Load Profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-600 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadProfile()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROFILE
  // ============================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 transition-colors sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
              <UserRound size={14} />
              Admission Officer
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              View your personal, employment,
              school, and account information.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadProfile(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Profile"}
          </button>
        </div>

        {/* ======================================================
            PROFILE HERO
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 transition-colors dark:ring-slate-700/60">

          {/* THEME BANNER */}

          <div className="relative h-32 overflow-hidden bg-[var(--color-primary)] sm:h-40">
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[var(--color-secondary)]/20" />
          </div>

          <div className="px-5 pb-7 sm:px-8">

            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">

              {/* PROFILE IDENTITY */}

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">

                {/* AVATAR */}

                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-[var(--color-card)] bg-[var(--color-primary)]/10 text-3xl font-bold text-[var(--color-primary)] shadow-lg sm:h-32 sm:w-32">
                  {getInitials()}
                </div>

                {/* NAME */}

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    {getFullName()}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {profile?.role_display ||
                      "Admission Officer"}
                  </p>

                  {profile?.employee_number && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <BadgeCheck size={14} />
                      Employee No:{" "}
                      {profile.employee_number}
                    </div>
                  )}
                </div>
              </div>

              {/* STATUS */}

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold ${
                  accountIsActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
              >
                {accountIsActive ? (
                  <CheckCircle2
                    size={17}
                  />
                ) : (
                  <Clock3 size={17} />
                )}

                {accountIsActive
                  ? "Active Account"
                  : "Inactive Account"}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            INFORMATION GRID
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ====================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <ProfileSection
            icon={
              <User size={21} />
            }
            title="Personal Information"
            description="Your basic personal details"
            iconClass="bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          >
            <InfoRow
              icon={<User size={18} />}
              label="First Name"
              value={
                profile?.first_name ||
                "—"
              }
            />

            <InfoRow
              icon={<User size={18} />}
              label="Last Name"
              value={
                profile?.last_name ||
                "—"
              }
            />

            <InfoRow
              icon={<Mail size={18} />}
              label="Email Address"
              value={
                profile?.email || "—"
              }
            />

            <InfoRow
              icon={<Phone size={18} />}
              label="Phone Number"
              value={
                profile?.phone_number ||
                "—"
              }
            />
          </ProfileSection>

          {/* ====================================================
              EMPLOYMENT INFORMATION
          ==================================================== */}

          <ProfileSection
            icon={
              <BriefcaseBusiness
                size={21}
              />
            }
            title="Employment Information"
            description="Your school and employment details"
            iconClass="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
          >
            <InfoRow
              icon={
                <BadgeCheck
                  size={18}
                />
              }
              label="Employee Number"
              value={
                profile?.employee_number ||
                "—"
              }
            />

            <InfoRow
              icon={
                <Building2
                  size={18}
                />
              }
              label="School"
              value={
                profile?.school_name ||
                profile?.school ||
                "—"
              }
            />

            <InfoRow
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Employment Date"
              value={formatDate(
                profile?.employment_date
              )}
            />

            <InfoRow
              icon={
                <ShieldCheck
                  size={18}
                />
              }
              label="Role"
              value={
                profile?.role_display ||
                profile?.role ||
                "Admission Officer"
              }
            />
          </ProfileSection>
        </div>

        {/* ======================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm ring-1 ring-slate-200/70 transition-colors dark:ring-slate-700/60 sm:p-7">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <ShieldCheck
                size={21}
              />
            </div>

            <div>
              <h2 className="font-bold text-[var(--color-text)]">
                Account Information
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your login and account details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InfoCard
              label="Username"
              value={
                profile?.username ||
                "—"
              }
            />

            <InfoCard
              label="Account Role"
              value={
                profile?.role_display ||
                profile?.role ||
                "Admission Officer"
              }
            />

            <InfoCard
              label="Account Status"
              value={
                accountIsActive
                  ? "Active"
                  : "Inactive"
              }
              status={accountIsActive}
            />

            <InfoCard
              label="Profile Created"
              value={formatDate(
                profile?.created_at
              )}
            />
          </div>

          {/* SECURITY NOTICE */}

          <div className="mt-6 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
              />

              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">
                  Account Security
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Your password is securely
                  stored and is never displayed
                  on your profile. Keep your
                  login credentials private.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            LAST UPDATED
        ====================================================== */}

        {profile?.updated_at && (
          <div className="pb-4 text-center text-xs text-slate-400">
            Profile last updated{" "}
            {formatDate(
              profile.updated_at
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PROFILE SECTION
// ============================================================

function ProfileSection({
  icon,
  title,
  description,
  iconClass,
  children,
}) {
  return (
    <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm ring-1 ring-slate-200/70 transition-colors dark:ring-slate-700/60 sm:p-7">

      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-[var(--color-text)]">
            {title}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[var(--color-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  label,
  value,
  status,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--color-background)] p-4 transition-colors dark:border-slate-700 dark:bg-slate-900/50">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      {status !== undefined ? (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          <p
            className={`text-sm font-bold ${
              status
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {value}
          </p>
        </div>
      ) : (
        <p className="mt-2 break-words text-sm font-bold text-[var(--color-text)]">
          {value}
        </p>
      )}
    </div>
  );
}