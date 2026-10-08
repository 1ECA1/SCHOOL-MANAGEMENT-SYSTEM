import { useCallback, useEffect, useMemo, useState } from "react";
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

// =====================================================
// TEACHER NOTIFICATIONS
// =====================================================

const TeacherNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = useCallback(async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getNotifications();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

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
      setProcessingId(notification.id);

      const updated = await updateNotification(notification.id, {
        is_read: true,
      });

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                ...updated,
                is_read: true,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to mark notification as read.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const handleDelete = async (notificationId) => {
    try {
      setProcessingId(notificationId);

      await deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId),
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete notification.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const totalNotifications = notifications.length;

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full space-y-6 p-4 md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <Bell className="h-6 w-6 text-[var(--color-primary)]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Notifications
              </h1>

              <p className="text-sm text-[var(--color-secondary)]">
                View and manage your school notifications.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate("/teacher/notifications/compose")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            Compose Notification
          </button>

          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total */}

        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-secondary)]">
                Total Notifications
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                {totalNotifications}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>

        {/* Unread */}

        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-secondary)]">
                Unread
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                {unreadNotifications}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
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
          NOTIFICATIONS
      ================================================= */}

      <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] shadow-sm">
        <div className="border-b border-[var(--color-card)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Notification Inbox
          </h2>

          <p className="mt-1 text-sm text-[var(--color-secondary)]">
            Your latest school notifications appear here.
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[var(--color-secondary)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading notifications...
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty */

          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <Bell className="h-7 w-7 text-[var(--color-primary)]" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
              No notifications
            </h3>

            <p className="mt-1 max-w-md text-sm text-[var(--color-secondary)]">
              You currently have no notifications in your inbox.
            </p>
          </div>
        ) : (
          /* Notification List */

          <div className="divide-y divide-[var(--color-card)]">
            {notifications.map((notification) => {
              const isProcessing =
                processingId === notification.id;

              return (
                <div
                  key={notification.id}
                  className={`px-5 py-5 transition ${
                    notification.is_read
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-primary)]/[0.04]"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Notification icon */}

                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.is_read
                          ? "bg-[var(--color-card)]"
                          : "bg-[var(--color-primary)]/10"
                      }`}
                    >
                      {notification.is_read ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-secondary)]" />
                      ) : (
                        <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                      )}
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-semibold ${
                                notification.is_read
                                  ? "text-[var(--color-text)]"
                                  : "text-[var(--color-text)]"
                              }`}
                            >
                              {notification.title ||
                                "Notification"}
                            </h3>

                            {!notification.is_read && (
                              <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                New
                              </span>
                            )}
                          </div>

                          {notification.notification_type_display && (
                            <p className="mt-1 text-xs text-[var(--color-secondary)]">
                              {
                                notification.notification_type_display
                              }
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-[var(--color-secondary)]">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>

                      {/* Message */}

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-secondary)]">
                        {notification.message}
                      </p>

                      {/* Actions */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(notification)
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition hover:bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}

                            Mark as read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(notification.id)
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}

                          Delete
                        </button>

                        {notification.link && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(notification.link)
                            }
                            className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10"
                          >
                            Open
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotifications;