import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

const AdminNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ============================================================
  // LOAD SENT NOTIFICATIONS
  // ============================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/notifications/sent/");

      const notificationList = Array.isArray(data)
        ? data
        : data?.results || [];

      setNotifications(notificationList);
    } catch (err) {
      console.error(
        "Failed to load sent notifications:",
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

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

  // ============================================================
  // FORMAT RECIPIENT TYPE
  // ============================================================

  const formatRecipientType = (value) => {
    if (!value) return "";

    const labels = {
      ALL_ROLES: "All Roles",
      ALL_SCHOOLS: "All Schools",
      SCHOOL: "School",
      ALL_STUDENTS: "All Students",
      STUDENTS: "Selected Students",
      ALL_PARENTS: "All Parents",
      PARENTS: "Selected Parents",
      ALL_TEACHERS: "All Teachers",
      TEACHERS: "Selected Teachers",
      CLASS: "Class Students",
      SUBJECT: "Subject Students",
    };

    if (labels[value]) {
      return labels[value];
    }

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  };

  // ============================================================
  // GROUP NOTIFICATIONS BY BATCH
  //
  // One send operation creates multiple Notification rows.
  // batch_id allows us to display that operation as ONE item.
  //
  // Legacy notifications without batch_id are kept individually.
  // ============================================================

  const groupedNotifications = useMemo(() => {
    const groups = new Map();

    notifications.forEach((notification) => {
      const batchId = notification.batch_id;

      // --------------------------------------------------------
      // New notifications with batch_id
      // --------------------------------------------------------

      if (batchId) {
        if (!groups.has(batchId)) {
          groups.set(batchId, {
            id: notification.id,
            batch_id: batchId,

            title: notification.title,
            message: notification.message,
            notification_type:
              notification.notification_type,
            notification_type_display:
              notification.notification_type_display,
            recipient_type:
              notification.recipient_type,
            created_at: notification.created_at,

            recipientCount: 0,
            notificationIds: [],
          });
        }

        const group = groups.get(batchId);

        group.recipientCount += 1;
        group.notificationIds.push(notification.id);

        return;
      }

      // --------------------------------------------------------
      // Legacy notifications without batch_id
      // --------------------------------------------------------

      const legacyKey = `legacy-${notification.id}`;

      groups.set(legacyKey, {
        id: notification.id,
        batch_id: null,

        title: notification.title,
        message: notification.message,
        notification_type:
          notification.notification_type,
        notification_type_display:
          notification.notification_type_display,
        recipient_type:
          notification.recipient_type,
        created_at: notification.created_at,

        recipientCount: 1,
        notificationIds: [notification.id],
      });
    });

    return Array.from(groups.values());
  }, [notifications]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      // --------------------------------------------------------
      // New batch notification
      // --------------------------------------------------------

      if (deleteTarget.batch_id) {
        await api.delete(
          `/notifications/sent/${deleteTarget.id}/`,
        );

        setNotifications((current) =>
          current.filter(
            (notification) =>
              notification.batch_id !==
              deleteTarget.batch_id,
          ),
        );
      }

      // --------------------------------------------------------
      // Legacy notification
      // --------------------------------------------------------

      else {
        await api.delete(
          `/notifications/sent/${deleteTarget.id}/`,
        );

        setNotifications((current) =>
          current.filter(
            (notification) =>
              notification.id !== deleteTarget.id,
          ),
        );
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete notification. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // OPEN COMPOSE
  // ============================================================

  const handleCompose = () => {
    navigate("/admin/notifications/compose");
  };

  // ============================================================
  // OPEN DETAILS
  // ============================================================

  const handleView = (notification) => {
    navigate(
      `/admin/notifications/sent/${notification.id}`,
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
            THIS HEADER IS ALWAYS DISPLAYED
        ===================================================== */}

        <div className="mb-6 rounded-2xl bg-[var(--color-card)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* TITLE */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
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

            {/* =================================================
                ACTIONS

                IMPORTANT:
                These buttons are OUTSIDE loading/empty/list
                conditions, so New Notification never disappears.
            ================================================= */}

            <div className="flex flex-wrap items-center gap-2">

              {/* NEW NOTIFICATION */}

              <button
                type="button"
                onClick={handleCompose}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                <Plus size={18} />

                New Notification
              </button>

              {/* REFRESH */}

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
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

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
        ) : groupedNotifications.length === 0 ? (

          /* ===================================================
             EMPTY STATE
          =================================================== */

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

            {/* 
              No extra New Notification button here.
              The main header button is ALWAYS available.
            */}
          </div>

        ) : (

          /* ===================================================
             NOTIFICATION LIST
          =================================================== */

          <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm">

            <div className="divide-y divide-gray-100">

              {groupedNotifications.map(
                (notification) => (
                  <div
                    key={
                      notification.batch_id ||
                      notification.id
                    }
                    className="group flex items-start gap-4 p-5 transition hover:bg-gray-50"
                  >

                    {/* =================================================
                        ICON
                    ================================================= */}

                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                      <Bell
                        size={19}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        handleView(notification)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      {/* TITLE */}

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-[var(--color-text)]">
                          {notification.title ||
                            "Notification"}
                        </h3>

                        <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                          SENT
                        </span>
                      </div>

                      {/* MESSAGE */}

                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-secondary)]">
                        {notification.message || ""}
                      </p>

                      {/* META */}

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-secondary)]">

                        {/* TYPE */}

                        {notification.notification_type_display && (
                          <>
                            <span>
                              {
                                notification.notification_type_display
                              }
                            </span>

                            <span>•</span>
                          </>
                        )}

                        {/* RECIPIENT TYPE */}

                        {notification.recipient_type && (
                          <>
                            <span>
                              To:{" "}
                              {formatRecipientType(
                                notification.recipient_type,
                              )}
                            </span>

                            <span>•</span>
                          </>
                        )}

                        {/* RECIPIENT COUNT */}

                        <span className="inline-flex items-center gap-1 font-medium">
                          <Users size={13} />

                          {notification.recipientCount}{" "}
                          {notification.recipientCount === 1
                            ? "recipient"
                            : "recipients"}
                        </span>

                        <span>•</span>

                        {/* DATE */}

                        <span>
                          {formatDate(
                            notification.created_at,
                          )}
                        </span>
                      </div>
                    </button>

                    {/* =================================================
                        RIGHT ACTIONS
                    ================================================= */}

                    <div className="flex shrink-0 items-center gap-1">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          handleView(notification)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[var(--color-primary)]"
                        title="View notification"
                      >
                        <ChevronRight size={20} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(notification)
                        }
                        disabled={
                          deletingId ===
                          notification.id
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete notification"
                      >
                        {deletingId ===
                        notification.id ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ),
              )}

            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          DELETE CONFIRMATION MODAL
      ======================================================= */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-[var(--color-card)] p-6 shadow-xl">

            <div className="flex items-start gap-4">

              {/* ICON */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2
                  size={21}
                  className="text-red-600"
                />
              </div>

              {/* CONTENT */}

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Delete notification?
                </h2>

                <p className="mt-1 text-sm text-[var(--color-secondary)]">
                  Are you sure you want to delete this
                  notification?
                </p>

                {deleteTarget.recipientCount > 1 && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    This will delete the notification
                    for all{" "}
                    {deleteTarget.recipientCount}{" "}
                    recipients.
                  </p>
                )}

                <p className="mt-3 truncate text-sm font-semibold text-[var(--color-text)]">
                  {deleteTarget.title ||
                    "Notification"}
                </p>
              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* =================================================
                MODAL ACTIONS
            ================================================= */}

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={!!deletingId}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              {/* DELETE */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={!!deletingId}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;