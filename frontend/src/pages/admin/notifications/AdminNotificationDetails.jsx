import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

const AdminNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "/notifications/sent/",
      );

      const notificationList = Array.isArray(data)
        ? data
        : data?.results || [];

      setNotifications(notificationList);
    } catch (err) {
      console.error(
        "Failed to load sent admin notifications:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load notifications. Please try again.",
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
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-[var(--color-card)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <Bell
                size={22}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                Notifications
              </h1>

              <p className="text-sm text-[var(--color-secondary)]">
                View notifications sent by you
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/notifications/compose",
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Compose Notification
            </button>

            <button
              type="button"
              onClick={loadNotifications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-[var(--color-card)] shadow-sm">

            <div className="flex items-center gap-3 text-[var(--color-secondary)]">

              <Loader2
                size={22}
                className="animate-spin"
              />

              <span>
                Loading sent notifications...
              </span>

            </div>

          </div>

        ) : notifications.length === 0 ? (

          /* ===================================================
             EMPTY
          ==================================================== */

          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl bg-[var(--color-card)] px-6 text-center shadow-sm">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">

              <Bell
                size={30}
                className="text-[var(--color-primary)]"
              />

            </div>

            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              No sent notifications
            </h2>

            <p className="mt-1 max-w-md text-sm text-[var(--color-secondary)]">
              You have not sent any notifications yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/notifications/compose",
                )
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Compose Notification
            </button>

          </div>

        ) : (

          /* ===================================================
             NOTIFICATION LIST
          ==================================================== */

          <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm">

            <div className="divide-y divide-gray-100">

              {notifications.map(
                (notification) => (

                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/notifications/sent/${notification.id}`,
                      )
                    }
                    className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-gray-50"
                  >

                    {/* ICON */}

                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">

                      <Bell
                        size={19}
                        className="text-[var(--color-primary)]"
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="truncate text-sm font-bold text-[var(--color-text)]">
                          {notification.title ||
                            "Notification"}
                        </h3>

                        <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                          SENT
                        </span>

                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-secondary)]">
                        {notification.message ||
                          ""}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-secondary)]">

                        {notification.notification_type_display && (
                          <>
                            <span>
                              {
                                notification.notification_type_display
                              }
                            </span>

                            <span>
                              •
                            </span>
                          </>
                        )}

                        <span>
                          {formatDate(
                            notification.created_at,
                          )}
                        </span>

                      </div>

                    </div>

                    {/* ARROW */}

                    <ChevronRight
                      size={20}
                      className="mt-2 shrink-0 text-gray-400"
                    />

                  </button>

                ),
              )}

            </div>

          </div>

        )}

      </div>
    </div>
  );
};

export default AdminNotifications;