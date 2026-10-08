import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function StudentNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/notifications/");

      const data = response.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data?.results)) {
        setNotifications(data.results);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  const getSenderName = (notification) => {
    return (
      notification?.sender_name ||
      notification?.sender?.name ||
      notification?.sender?.full_name ||
      notification?.sender ||
      "School"
    );
  };

  const isUnread = (notification) => {
    if ("is_read" in notification) {
      return !notification.is_read;
    }

    if ("read" in notification) {
      return !notification.read;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      {/* Header */}
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
              <h1 className="text-xl font-bold text-[var(--color-text)] md:text-2xl">
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
          onClick={() => loadNotifications(true)}
          disabled={refreshing}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl border border-[var(--color-card)]
            bg-[var(--color-card)]
            px-4 py-2.5
            text-sm font-medium
            text-[var(--color-text)]
            shadow-sm
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {refreshing ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}

          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[var(--color-secondary)]">
            <Loader2 size={22} className="animate-spin" />
            Loading notifications...
          </div>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl bg-[var(--color-card)] px-6 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <Bell
              size={28}
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
        /* Notification list */
        <div className="space-y-3">
          {notifications.map((notification) => {
            const unread = isUnread(notification);

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  navigate(`/student/notifications/${notification.id}`)
                }
                className={`
                  w-full rounded-2xl border p-4 text-left
                  shadow-sm transition
                  hover:-translate-y-[1px] hover:shadow-md
                  ${
                    unread
                      ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
                      : "border-transparent bg-[var(--color-card)]"
                  }
                `}
              >
                <div className="flex gap-4">
                  <div
                    className={`
                      flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                      ${
                        unread
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    <Bell size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3
                        className={`
                          truncate text-sm md:text-base
                          ${
                            unread
                              ? "font-bold text-[var(--color-text)]"
                              : "font-semibold text-[var(--color-text)]"
                          }
                        `}
                      >
                        {notification.title || "Notification"}
                      </h3>

                      {unread && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-secondary)]">
                      {notification.message || "No message provided."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-secondary)]">
                      <span>
                        From:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {getSenderName(notification)}
                        </span>
                      </span>

                      {notification.created_at && (
                        <span>{formatDate(notification.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentNotifications;