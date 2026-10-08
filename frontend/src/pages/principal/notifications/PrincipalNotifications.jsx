import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../../../services/notificationsService";

const PrincipalNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getNotifications();

      // API may return either an array or DRF pagination
      const notificationList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setNotifications(notificationList);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // =====================================================
  // MARK AS READ
  // =====================================================

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await updateNotification(notification.id, {
        is_read: true,
      });

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to mark notification as read.",
      );
    }
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== notificationId,
        ),
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete notification.",
      );
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-text)]">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <Bell className="h-6 w-6 text-[var(--color-primary)]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Notifications
              </h1>

              <p className="text-sm text-[var(--color-text)]/60">
                View and manage your school notifications.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            HEADER ACTIONS
        ================================================= */}

        <div className="flex flex-wrap items-center gap-2">
          {/* COMPOSE NOTIFICATION */}

          <button
            type="button"
            onClick={() =>
              navigate("/principal/notifications/compose")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Send className="h-4 w-4" />

            Compose Notification
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text)]/60">
                Total Notifications
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">
                {notifications.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text)]/60">
                Unread
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--color-text)]">
                {unreadCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] shadow-sm">
        <div className="border-b border-[var(--color-background)] px-5 py-4">
          <h2 className="font-semibold text-[var(--color-text)]">
            Your Notifications
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <Bell className="h-8 w-8 text-[var(--color-primary)]" />
            </div>

            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              No notifications
            </h3>

            <p className="mt-1 max-w-md text-sm text-[var(--color-text)]/60">
              You do not have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-background)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-5 py-5 transition ${
                  !notification.is_read
                    ? "bg-[var(--color-primary)]/[0.03]"
                    : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* ICON */}

                  <div
                    className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.is_read
                        ? "bg-gray-500/10"
                        : "bg-[var(--color-primary)]/10"
                    }`}
                  >
                    {notification.is_read ? (
                      <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[var(--color-text)]">
                            {notification.title ||
                              "Notification"}
                          </h3>

                          {!notification.is_read && (
                            <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>

                        {notification.notification_type_display && (
                          <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                            {
                              notification.notification_type_display
                            }
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-xs text-[var(--color-text)]/50">
                        {formatDate(
                          notification.created_at,
                        )}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]/75">
                      {notification.message}
                    </p>

                    {/* ACTIONS */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition hover:opacity-80"
                        >
                          <CheckCircle2 className="h-4 w-4" />

                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(notification.id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />

                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalNotifications;