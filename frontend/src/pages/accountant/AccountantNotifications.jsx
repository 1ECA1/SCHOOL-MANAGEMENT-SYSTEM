import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AccountantNotifications() {
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
        "Failed to load accountant notifications:",
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
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
              <Bell size={24} />
              Notifications
            </h1>

            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              View notifications and announcements from your school.
            </p>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--color-secondary)]">
              <Loader2 className="animate-spin" size={20} />
              Loading notifications...
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-8 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-[var(--color-background)] p-4">
              <Bell
                size={30}
                className="text-[var(--color-secondary)]"
              />
            </div>

            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/accountant/notifications/${notification.id}`
                  )
                }
                className={`group flex w-full items-center gap-4 rounded-xl border bg-[var(--color-card)] p-4 text-left shadow-sm transition hover:shadow-md ${
                  notification.is_read
                    ? "border-[var(--color-card)]"
                    : "border-[var(--color-primary)]/30"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    notification.is_read
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-primary)]/10"
                  }`}
                >
                  <Bell
                    size={20}
                    className={
                      notification.is_read
                        ? "text-[var(--color-secondary)]"
                        : "text-[var(--color-primary)]"
                    }
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`truncate text-sm sm:text-base ${
                        notification.is_read
                          ? "font-medium text-[var(--color-text)]"
                          : "font-bold text-[var(--color-text)]"
                      }`}
                    >
                      {notification.title || "Notification"}
                    </h2>

                    {!notification.is_read && (
                      <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-secondary)]">
                    {notification.message}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-secondary)]">
                    <span>
                      Type:{" "}
                      {notification.notification_type_display ||
                        notification.notification_type ||
                        "Notification"}
                    </span>

                    <span>•</span>

                    <span>
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={20}
                  className="shrink-0 text-[var(--color-secondary)] transition-transform group-hover:translate-x-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountantNotifications;