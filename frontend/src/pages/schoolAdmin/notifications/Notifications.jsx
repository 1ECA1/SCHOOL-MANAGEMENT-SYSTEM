import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  CheckCheck,
  Clock,
  Inbox,
  MailOpen,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../../../services/notificationsService";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getNotifications();

      setNotifications(
        Array.isArray(data) ? data : data?.results || [],
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  // =====================================================
  // MARK AS READ
  // =====================================================

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      const updated = await updateNotification(
        notification.id,
        {
          is_read: true,
        },
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? updated : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (notification) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteNotification(notification.id);

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notification.id,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error,
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* TITLE */}

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
              View and manage your school notifications.
            </p>
          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex flex-wrap items-center gap-3">

          {/* COMPOSE NOTIFICATION */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/notifications/compose",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Send size={17} />

            Compose Notification
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadNotifications(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* TOTAL */}

        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Inbox
                size={20}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div>
              <p className="text-sm text-[var(--color-secondary)]">
                Total Notifications
              </p>

              <p className="text-2xl font-bold text-[var(--color-text)]">
                {notifications.length}
              </p>
            </div>

          </div>

        </div>

        {/* UNREAD */}

        <div className="rounded-xl border border-[var(--color-secondary)]/10 bg-[var(--color-card)] p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10">
              <MailOpen
                size={20}
                className="text-[var(--color-secondary)]"
              />
            </div>

            <div>
              <p className="text-sm text-[var(--color-secondary)]">
                Unread
              </p>

              <p className="text-2xl font-bold text-[var(--color-text)]">
                {unreadCount}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-card)] p-4 text-sm text-[var(--color-text)]">
          {error}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-12 text-center shadow-sm">

          <RefreshCw
            size={25}
            className="mx-auto mb-3 animate-spin text-[var(--color-primary)]"
          />

          <p className="text-sm text-[var(--color-secondary)]">
            Loading notifications...
          </p>

        </div>

      ) : notifications.length === 0 ? (

        /* ===============================================
           EMPTY
        =============================================== */

        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-12 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">

            <Bell
              size={26}
              className="text-[var(--color-primary)]"
            />

          </div>

          <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
            No notifications
          </h2>

          <p className="text-sm text-[var(--color-secondary)]">
            You don't have any notifications yet.
          </p>

        </div>

      ) : (

        /* ===============================================
           LIST
        =============================================== */

        <div className="space-y-3">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`rounded-xl border bg-[var(--color-card)] p-4 shadow-sm transition ${
                notification.is_read
                  ? "border-[var(--color-primary)]/10"
                  : "border-[var(--color-primary)]/40"
              }`}
            >

              <div className="flex gap-4">

                {/* ICON */}

                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    notification.is_read
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-primary)]/10"
                  }`}
                >
                  <Bell
                    size={18}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

                  <div className="mb-2">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2
                        className={`text-base text-[var(--color-text)] ${
                          notification.is_read
                            ? "font-medium"
                            : "font-bold"
                        }`}
                      >
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                          New
                        </span>
                      )}

                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--color-secondary)]">

                      <span>
                        {notification.notification_type_display ||
                          notification.notification_type}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={13} />

                        {formatDate(
                          notification.created_at,
                        )}
                      </span>

                    </div>

                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]/80">
                    {notification.message}
                  </p>

                  {/* ACTIONS */}

                  <div className="mt-4 flex flex-wrap gap-2">

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-card)] px-3 py-2 text-xs font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/5"
                      >
                        <CheckCheck size={15} />

                        Mark as read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(notification)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-card)] px-3 py-2 text-xs font-medium text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)]/5"
                    >
                      <Trash2 size={15} />

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
  );
}