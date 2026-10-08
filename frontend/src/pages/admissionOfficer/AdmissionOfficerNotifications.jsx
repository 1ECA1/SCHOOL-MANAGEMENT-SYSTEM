import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const AdmissionOfficerNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/notifications/");

      const notificationList = Array.isArray(data)
        ? data
        : data?.results || [];

      setNotifications(notificationList);
    } catch (err) {
      console.error(
        "Failed to load admission officer notifications:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                <Bell
                  size={22}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Notifications
                </h1>

                <p className="text-sm text-[var(--color-secondary)]">
                  View your school notifications and announcements.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-[var(--color-card)] bg-[var(--color-card)]">
            <div className="flex items-center gap-3 text-[var(--color-secondary)]">
              <Loader2 size={22} className="animate-spin" />
              <span>Loading notifications...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* EMPTY */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <Bell
                size={26}
                className="text-[var(--color-primary)]"
              />
            </div>

            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              No notifications
            </h2>

            <p className="mt-1 max-w-md text-sm text-[var(--color-secondary)]">
              You don't have any notifications at the moment.
            </p>
          </div>
        ) : (
          /* NOTIFICATION LIST */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/admission-officer/notifications/${notification.id}`
                  )
                }
                className="group w-full rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* ICON */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                    <Bell
                      size={19}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <h2
                        className={`truncate text-base ${
                          notification.is_read
                            ? "font-medium"
                            : "font-bold"
                        } text-[var(--color-text)]`}
                      >
                        {notification.title || "Notification"}
                      </h2>

                      <span className="shrink-0 text-xs text-[var(--color-secondary)]">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>

                    {notification.notification_type_display && (
                      <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                        {notification.notification_type_display}
                      </p>
                    )}

                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-secondary)]">
                      {notification.message}
                    </p>
                  </div>

                  {/* ARROW */}
                  <ChevronRight
                    size={20}
                    className="mt-1 shrink-0 text-[var(--color-secondary)] transition group-hover:translate-x-1"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionOfficerNotifications;