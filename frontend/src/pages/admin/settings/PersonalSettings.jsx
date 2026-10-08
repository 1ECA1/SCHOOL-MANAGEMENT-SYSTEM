import { useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Globe,
  KeyRound,
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
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

const PersonalSettings = () => {
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

  const [saving, setSaving] = useState(false);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Administrator";

  const roleLabel =
    user?.role_display ||
    user?.role ||
    "Administrator";

  const initial = displayName.charAt(0).toUpperCase();

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const handleToggle = (setter, value) => {
    setSaving(true);
    setter(!value);

    window.setTimeout(() => {
      setSaving(false);
    }, 250);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    children,
  }) => (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 sm:ml-6">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        enabled
          ? "bg-[var(--color-primary)]"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const ThemeOption = ({
    value,
    label,
    icon: Icon,
  }) => {
    const selected = theme === value;

    return (
      <button
        type="button"
        onClick={() => handleThemeChange(value)}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
          selected
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : "border-slate-200 bg-[var(--color-card)] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            selected
              ? "bg-[var(--color-primary)] text-white"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <Icon size={18} />
        </div>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-medium ${
              selected
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
            }`}
          >
            {label}
          </span>
        </span>

        {selected && (
          <Check
            size={18}
            className="shrink-0 text-[var(--color-primary)]"
          />
        )}
      </button>
    );
  };

  return (
    <div className="min-w-0 space-y-5 pb-8">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
            {initial}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-[var(--color-text)]">
              Personal Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your personal preferences and account settings.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-[var(--color-text)]">
                {displayName}
              </span>

              <span>•</span>

              <span>{roleLabel}</span>

              {user?.email && (
                <>
                  <span>•</span>
                  <span className="break-all">{user.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          APPEARANCE
      ===================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <Palette
              size={19}
              className="text-[var(--color-primary)]"
            />

            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Appearance
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Customize how EduManageERP looks for you.
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Theme
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose light, dark, or follow your device setting.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ThemeOption
              value="light"
              label="Light"
              icon={Sun}
            />

            <ThemeOption
              value="dark"
              label="Dark"
              icon={Moon}
            />

            <ThemeOption
              value="system"
              label="System"
              icon={Monitor}
            />
          </div>
        </div>

        <SettingRow
          icon={Monitor}
          title="Compact Mode"
          description="Use a more compact layout with reduced spacing."
        >
          <Toggle
            enabled={compactMode}
            onChange={() =>
              handleToggle(setCompactMode, compactMode)
            }
          />
        </SettingRow>
      </section>

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <Bell
              size={19}
              className="text-[var(--color-primary)]"
            />

            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Control how notifications behave for your account.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <SettingRow
            icon={Bell}
            title="Notifications"
            description="Receive notifications and alerts from EduManageERP."
          >
            <Toggle
              enabled={notifications}
              onChange={() =>
                handleToggle(
                  setNotifications,
                  notifications,
                )
              }
            />
          </SettingRow>

          <SettingRow
            icon={
              notificationSound
                ? Volume2
                : VolumeX
            }
            title="Notification Sound"
            description="Play a sound when a notification is received."
          >
            <Toggle
              enabled={notificationSound}
              onChange={() =>
                handleToggle(
                  setNotificationSound,
                  notificationSound,
                )
              }
            />
          </SettingRow>
        </div>
      </section>

      {/* =====================================================
          PREFERENCES
      ===================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <Globe
              size={19}
              className="text-[var(--color-primary)]"
            />

            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Preferences
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Configure your personal application preferences.
              </p>
            </div>
          </div>
        </div>

        <SettingRow
          icon={Globe}
          title="Language"
          description="Choose the language used by the application."
        >
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
            className="h-10 min-w-[150px] rounded-lg border border-slate-200 bg-[var(--color-card)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
          >
            <option value="English">English</option>
          </select>
        </SettingRow>
      </section>

      {/* =====================================================
          ACCOUNT
      ===================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <Shield
              size={19}
              className="text-[var(--color-primary)]"
            />

            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Account
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Manage your account and security.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/profile")
            }
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
                <User size={19} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  Profile
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  View and manage your personal profile.
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-slate-400"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/change-password")
            }
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
                <KeyRound size={19} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  Change Password
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Update your account password.
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-slate-400"
            />
          </button>
        </div>
      </section>

      {/* =====================================================
          SESSION
      ===================================================== */}
      <section className="overflow-hidden rounded-xl border border-red-200 bg-[var(--color-card)] shadow-sm dark:border-red-900/50">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-red-50 dark:hover:bg-red-500/10 sm:px-6"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <LogOut size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Logout
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Sign out of your EduManageERP account.
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="shrink-0 text-red-400"
          />
        </button>
      </section>

      {saving && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[var(--color-text)] px-4 py-2 text-xs font-medium text-[var(--color-card)] shadow-lg">
          Settings saved
        </div>
      )}
    </div>
  );
};

export default PersonalSettings;