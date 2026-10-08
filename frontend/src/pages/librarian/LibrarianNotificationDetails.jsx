import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function LibrarianNotificationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/notifications/${id}/`);

      setNotification(data);

      // Mark unread notification as read
      if (data && !data.is_read) {
        try {
          const { data: updatedNotification } = await api.patch(
            `/notifications/${id}/`,
            {
              is_read: true,
            }
          );

          setNotification(updatedNotification);
        } catch (markReadError) {
          console.error(
            "Failed to mark notification as read:",
            markReadError
          );
        }
      }
    } catch (err) {
      console.error("Failed to load notification:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load notification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadNotification();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-2 text-[var(--color-secondary)]">
            <Loader2 className="animate-spin" size={20} />
            Loading notification...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/librarian/notifications")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Notifications
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/librarian/notifications")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Notifications
          </button>

          <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-8 text-center shadow-sm">
            <Bell
              size={32}
              className="mx-auto mb-3 text-[var(--color-secondary)]"
            />

            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Notification not found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/librarian/notifications")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Notifications
        </button>

        {/* Notification Card */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] shadow-sm">
          {/* Header */}
          <div className="border-b border-[var(--color-background)] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                <Bell
                  size={23}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                  {notification.title || "Notification"}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--color-secondary)]">
                  <span>
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
            </div>
          </div>

          {/* Message */}
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-secondary)]">
              <CheckCircle2 size={17} />
              From: School
            </div>

            <div className="whitespace-pre-wrap text-base leading-7 text-[var(--color-text)]">
              {notification.message}
            </div>

            {/* Optional Link */}
            {notification.link && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      notification.link.startsWith("http://") ||
                      notification.link.startsWith("https://")
                    ) {
                      window.location.href = notification.link;
                    } else {
                      navigate(notification.link);
                    }
                  }}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Open Related Page
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--color-background)] px-5 py-4 sm:px-6">
            <p className="text-xs text-[var(--color-secondary)]">
              {notification.is_read
                ? `Read ${
                    notification.read_at
                      ? `on ${formatDate(notification.read_at)}`
                      : ""
                  }`
                : "Unread"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibrarianNotificationDetails;