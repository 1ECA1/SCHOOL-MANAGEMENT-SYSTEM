import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function ExamOfficerProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("access_token");

        const response = await fetch(
          `${API_BASE_URL}/api/examinations/officers/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load Exam Officer profile.");
        }

        const data = await response.json();

        const currentProfile = Array.isArray(data)
          ? data.find((item) => item.user_id === user?.id) || data[0]
          : data;

        setProfile(currentProfile);
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-6 h-10 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-card p-8 text-center shadow-sm">
            <p className="font-semibold text-text">
              Exam Officer profile not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    profile.username;

  const profileImage = profile.profile_image
    ? profile.profile_image.startsWith("http")
      ? profile.profile_image
      : `${API_BASE_URL}${profile.profile_image}`
    : null;

  const initials =
    `${profile.first_name?.charAt(0) || ""}${profile.last_name?.charAt(0) || ""}` ||
    "EO";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Page Header */}
        <div>
          <p className="mb-1 text-sm font-semibold text-primary">
            Exam Officer
          </p>

          <h1 className="text-2xl font-bold text-text md:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View your personal and employment information.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="overflow-hidden rounded-3xl bg-card shadow-sm">
          <div className="h-32 bg-[var(--color-primary)]" />

          <div className="px-5 pb-6 md:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="h-28 w-28 rounded-3xl border-4 border-card object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-card bg-primary text-3xl font-bold text-white shadow-lg">
                    {initials}
                  </div>
                )}

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-text md:text-2xl">
                    {fullName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {profile.role_display || "Exam Officer"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-1">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    profile.is_active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Personal Information */}
          <div className="rounded-3xl bg-card p-6 shadow-sm md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-xl">
                👤
              </div>

              <div>
                <h3 className="font-bold text-text">
                  Personal Information
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your basic account information
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <InfoRow
                label="First Name"
                value={profile.first_name}
              />

              <InfoRow
                label="Last Name"
                value={profile.last_name}
              />

              <InfoRow
                label="Username"
                value={profile.username}
              />

              <InfoRow
                label="Email Address"
                value={profile.email}
              />

              <InfoRow
                label="Phone Number"
                value={profile.phone_number}
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="rounded-3xl bg-card p-6 shadow-sm md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-xl">
                💼
              </div>

              <div>
                <h3 className="font-bold text-text">
                  Employment Information
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your role and employment details
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <InfoRow
                label="Employee Number"
                value={profile.employee_number}
              />

              <InfoRow
                label="Role"
                value={profile.role_display || "Exam Officer"}
              />

              <InfoRow
                label="Employment Date"
                value={profile.employment_date}
              />

              <InfoRow
                label="Status"
                value={profile.is_active ? "Active" : "Inactive"}
              />
            </div>
          </div>
        </div>

        {/* School Information */}
        <div className="rounded-3xl bg-card p-6 shadow-sm md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-xl">
              🏫
            </div>

            <div>
              <h3 className="font-bold text-text">
                School Information
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                School assigned to your Exam Officer account
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InfoRow
              label="School"
              value={profile.school_name}
            />

            <InfoRow
              label="School ID"
              value={profile.school}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-text">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default ExamOfficerProfile;