
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ParentNotifications() {
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
      console.error("Failed to load parent notifications:", err);

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
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-text">
              <Bell size={24} />
              Notifications
            </h1>

            <p className="mt-1 text-sm text-text/60">
              View announcements and notifications from your school.
            </p>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="rounded-lg border border-text/10 bg-card px-4 py-2 text-sm font-medium text-text transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="animate-spin" size={20} />
              Loading notifications...
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-text/10 bg-card p-8 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-background p-4">
              <Bell
                size={30}
                className="text-secondary"
              />
            </div>

            <h2 className="text-lg font-semibold text-text">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-text/60">
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
                    `/parent/notifications/${notification.id}`
                  )
                }
                className={`group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md ${
                  notification.is_read
                    ? "border-text/10"
                    : "border-primary/30"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    notification.is_read
                      ? "bg-background"
                      : "bg-primary/10"
                  }`}
                >
                  <Bell
                    size={20}
                    className={
                      notification.is_read
                        ? "text-secondary"
                        : "text-primary"
                    }
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`truncate text-sm sm:text-base ${
                        notification.is_read
                          ? "font-medium text-text"
                          : "font-bold text-text"
                      }`}
                    >
                      {notification.title || "Notification"}
                    </h2>

                    {!notification.is_read && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-text/60">
                    {notification.message}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text/60">
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
                  className="shrink-0 text-text/60 transition-transform group-hover:translate-x-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParentNotifications;
