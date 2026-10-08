import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function StudentNotificationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingRead, setMarkingRead] = useState(false);

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/notifications/${id}/`);

      setNotification(response.data);
    } catch (err) {
      console.error("Failed to load notification:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load this notification.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotification();
  }, [id]);

  const markAsRead = async () => {
    if (!notification || notification.is_read || markingRead) {
      return;
    }

    try {
      setMarkingRead(true);

      const response = await api.patch(
        `/notifications/${id}/`,
        {
          is_read: true,
        },
      );

      setNotification(response.data);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      /*
       * Do not prevent the user from reading the notification
       * if marking it as read fails.
       */
    } finally {
      setMarkingRead(false);
    }
  };

  useEffect(() => {
    if (notification && !notification.is_read) {
      markAsRead();
    }
  }, [notification]);

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  const handleBack = () => {
    navigate("/student/notifications");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--color-secondary)]">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Loading notification...
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
        <button
          type="button"
          onClick={handleBack}
          className="
            mb-6 inline-flex items-center gap-2
            rounded-xl px-3 py-2
            text-sm font-medium
            text-[var(--color-secondary)]
            transition
            hover:bg-[var(--color-card)]
            hover:text-[var(--color-text)]
          "
        >
          <ArrowLeft size={18} />

          Back to Notifications
        </button>

        <div className="rounded-2xl bg-[var(--color-card)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Bell
              size={25}
              className="text-red-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Notification not found
          </h2>

          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            {error || "This notification could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      {/* Back */}
      <button
        type="button"
        onClick={handleBack}
        className="
          mb-6 inline-flex items-center gap-2
          rounded-xl px-3 py-2
          text-sm font-medium
          text-[var(--color-secondary)]
          transition
          hover:bg-[var(--color-card)]
          hover:text-[var(--color-text)]
        "
      >
        <ArrowLeft size={18} />

        Back to Notifications
      </button>

      {/* Notification Card */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm">
        {/* Header */}
        <div className="border-b border-black/5 px-5 py-6 md:px-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <Bell
                size={23}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[var(--color-text)] md:text-2xl">
                    {notification.title || "Notification"}
                  </h1>

                  {notification.notification_type_display && (
                    <p className="mt-1 text-sm text-[var(--color-secondary)]">
                      {notification.notification_type_display}
                    </p>
                  )}
                </div>

                {notification.is_read ? (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 size={14} />
                    Read
                  </span>
                ) : (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    New
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--color-secondary)] sm:flex-row sm:flex-wrap sm:gap-x-5">
                <span>
                  From:{" "}
                  <strong className="font-semibold text-[var(--color-text)]">
                    School
                  </strong>
                </span>

                <span>
                  {formatDate(notification.created_at)}
                </span>

                {notification.read_at && (
                  <span>
                    Read: {formatDate(notification.read_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="px-5 py-7 md:px-8 md:py-9">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-[var(--color-text)]">
            {notification.message || "No message provided."}
          </p>
        </div>

        {/* Link */}
        {notification.link && (
          <div className="border-t border-black/5 px-5 py-5 md:px-8">
            <a
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-[var(--color-primary)]
                px-4 py-2.5
                text-sm font-semibold
                text-white
                transition
                hover:opacity-90
              "
            >
              Open Link
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Read status */}
        {markingRead && (
          <div className="border-t border-black/5 px-5 py-3 md:px-8">
            <div className="flex items-center gap-2 text-xs text-[var(--color-secondary)]">
              <Loader2
                size={14}
                className="animate-spin"
              />
              Marking notification as read...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentNotificationDetails;