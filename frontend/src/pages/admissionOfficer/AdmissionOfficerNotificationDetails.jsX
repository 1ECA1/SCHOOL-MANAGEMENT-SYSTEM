import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

const AdmissionOfficerNotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/notifications/${id}/`);

      setNotification(data);

      // Automatically mark unread notification as read.
      if (data && !data.is_read) {
        const { data: updatedNotification } = await api.patch(
          `/notifications/${id}/`,
          {
            is_read: true,
          }
        );

        setNotification(updatedNotification);
      }
    } catch (err) {
      console.error(
        "Failed to load admission officer notification:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load notification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotification();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* TOP BAR */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/admission-officer/notifications")
            }
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:opacity-90"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-xl border border-[var(--color-card)] bg-[var(--color-card)]">
            <div className="flex items-center gap-3 text-[var(--color-secondary)]">
              <Loader2 size={22} className="animate-spin" />
              <span>Loading notification...</span>
            </div>
          </div>
        ) : notification ? (
          <div className="rounded-2xl border border-[var(--color-card)] bg-[var(--color-card)] shadow-sm">
            {/* HEADER */}
            <div className="border-b border-[var(--color-background)] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                  <Bell
                    size={23}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                    {notification.title || "Notification"}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-secondary)]">
                    {notification.notification_type_display && (
                      <span className="font-medium text-[var(--color-primary)]">
                        {notification.notification_type_display}
                      </span>
                    )}

                    <span>
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGE */}
            <div className="p-5 sm:p-6">
              <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)] sm:text-base">
                {notification.message}
              </div>

              {/* LINK */}
              {notification.link && (
                <div className="mt-6">
                  <a
                    href={notification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <ExternalLink size={17} />
                    Open Link
                  </a>
                </div>
              )}

              {/* STATUS */}
              <div className="mt-8 border-t border-[var(--color-background)] pt-4">
                <span className="text-xs text-[var(--color-secondary)]">
                  Status:{" "}
                  <span className="font-medium text-[var(--color-text)]">
                    {notification.is_read ? "Read" : "Unread"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-8 text-center">
            <p className="text-sm text-[var(--color-secondary)]">
              Notification not found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionOfficerNotificationDetails;