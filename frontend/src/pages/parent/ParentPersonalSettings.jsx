import {
  Bell,
  Check,
  Globe,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const ParentPersonalSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    theme,
    compactMode,
    notifications,
    notificationSound,
    language,
    setTheme,
    setCompactMode,
    setNotifications,
    setNotificationSound,
    setLanguage,
  } = useTheme();

  const [loggingOut, setLoggingOut] = useState(false);

  const getDisplayName = () => {
    if (!user) {
      return "Parent";
    }

    const fullName = `${user.first_name || ""} ${
      user.last_name || ""
    }`.trim();

    return (
      fullName ||
      user.username ||
      user.email ||
      "Parent"
    );
  };

  const displayName = getDisplayName();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 text-[var(--color-text)] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Personal Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal preferences and account
            settings.
          </p>
        </div>

        {/* ACCOUNT */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <User size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Account
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your signed-in account information
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">
                  {displayName}
                </h3>

                {user?.email && (
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                )}

                <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Parent / Guardian
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Palette size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Appearance
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize how EduManage looks for you.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">

            {/* THEME */}
            <div className="p-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">
                  Theme
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Choose your preferred appearance.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    value: "light",
                    label: "Light",
                    icon: Sun,
                  },
                  {
                    value: "dark",
                    label: "Dark",
                    icon: Moon,
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: Monitor,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const selected =
                    theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setTheme(option.value)
                      }
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-sm font-medium transition ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={18} />

                      <span>{option.label}</span>

                      {selected && (
                        <Check
                          size={17}
                          className="ml-auto"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COMPACT MODE */}
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <Monitor
                  size={19}
                  className="mt-0.5 text-slate-500"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Compact Mode
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Use a more compact interface.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={compactMode}
                onClick={() =>
                  setCompactMode(!compactMode)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  compactMode
                    ? "bg-[var(--color-primary)]"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    compactMode
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Notifications
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control how you receive notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">

            {/* NOTIFICATIONS */}
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <Bell
                  size={19}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Receive notifications about school
                    activities and updates.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() =>
                  setNotifications(!notifications)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notifications
                    ? "bg-[var(--color-primary)]"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    notifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* SOUND */}
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                {notificationSound ? (
                  <Volume2
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                ) : (
                  <VolumeX
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                )}

                <div>
                  <h3 className="text-sm font-semibold">
                    Notification Sound
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Play a sound when a new notification
                    arrives.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationSound}
                onClick={() =>
                  setNotificationSound(
                    !notificationSound,
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notificationSound
                    ? "bg-[var(--color-primary)]"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    notificationSound
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Globe size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Preferences
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your personal application
                  preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label className="block">
              <span className="text-sm font-semibold">
                Language
              </span>

              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                Select your preferred language.
              </span>

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
                className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:max-w-sm"
              >
                <option value="English">
                  English
                </option>
              </select>
            </label>
          </div>
        </section>

        {/* ACCOUNT & SECURITY */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Shield size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Account & Security
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your account and security.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">

            {/* PROFILE */}
            <button
              type="button"
              onClick={() =>
                navigate("/parent/profile")
              }
              className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:p-6"
            >
              <User
                size={19}
                className="shrink-0 text-slate-500"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  My Profile
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  View and manage your profile.
                </p>
              </div>

              <span className="text-slate-400">
                →
              </span>
            </button>
          </div>
        </section>

        {/* SIGN OUT */}
        <section className="rounded-2xl border border-red-200 bg-[var(--color-card)] shadow-sm dark:border-red-900/50">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <LogOut size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Sign Out
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Sign out of your EduManage account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={17} />

              {loggingOut
                ? "Signing Out..."
                : "Sign Out"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParentPersonalSettings;