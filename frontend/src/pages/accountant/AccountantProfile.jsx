import { useEffect, useState } from "react";
import { UserCircle, Mail, Phone, Building2, Badge } from "lucide-react";
import api from "../../services/api";

function AccountantProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/finance/profile/");
        setProfile(response.data);
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load Accountant profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-red-600 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          View your Accountant account and employment information.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm">
        {/* Profile header */}
        <div className="bg-[var(--color-primary)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold backdrop-blur">
              {profile?.first_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {profile?.first_name} {profile?.last_name}
              </h2>

              <p className="mt-1 text-blue-100">
                Finance Officer / Accountant
              </p>

              <p className="mt-2 text-sm text-blue-100">
                Employee No: {profile?.employee_number}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <ProfileItem
            icon={UserCircle}
            label="Username"
            value={profile?.username}
          />

          <ProfileItem
            icon={Badge}
            label="Employee Number"
            value={profile?.employee_number}
          />

          <ProfileItem
            icon={Mail}
            label="Email"
            value={profile?.email}
          />

          <ProfileItem
            icon={Phone}
            label="Phone Number"
            value={profile?.phone_number || "Not provided"}
          />

          <ProfileItem
            icon={Building2}
            label="School"
            value={profile?.school_name}
          />

          <ProfileItem
            icon={Badge}
            label="Employment Date"
            value={profile?.employment_date || "Not provided"}
          />
        </div>

        {/* Status */}
        <div className="border-t border-slate-200 px-6 py-5 dark:border-slate-700 sm:px-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Account Status
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                profile?.is_active
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
              }`}
            >
              {profile?.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[var(--color-primary)] dark:bg-blue-950/40">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate font-semibold">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default AccountantProfile;