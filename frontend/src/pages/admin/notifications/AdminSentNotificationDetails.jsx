import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

const AdminSentNotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/notifications/sent/${id}/`,
      );

      setNotification(data);
    } catch (err) {
      console.error(
        "Failed to load sent notification:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load notification. Please try again.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-[var(--color-card)]">

          <div className="flex items-center gap-3 text-[var(--color-secondary)]">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading notification...
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      <div className="mx-auto max-w-4xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/admin/notifications")
          }
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-card)]"
        >
          <ArrowLeft size={19} />
          Back to Notifications
        </button>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notification && (
          <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm">

            {/* HEADER */}

            <div className="border-b border-gray-100 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                  <Bell
                    size={24}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-xl font-bold text-[var(--color-text)]">
                      {notification.title ||
                        "Notification"}
                    </h1>

                    <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      SENT
                    </span>

                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--color-secondary)]">

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

                    <span>
                      {formatDate(
                        notification.created_at,
                      )}
                    </span>

                  </div>

                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="p-6">

              <div className="rounded-xl bg-[var(--color-background)] p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">
                  {notification.message}
                </p>

              </div>

              {/* SENDER */}

              {notification.sender_name && (
                <div className="mt-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                    Sent By
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {notification.sender_name}
                  </p>

                </div>
              )}

              {/* RECIPIENT */}

              {notification.recipient_name && (
                <div className="mt-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                    Recipient
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {notification.recipient_name}
                  </p>

                </div>
              )}

              {/* LINK */}

              {notification.link && (
                <div className="mt-6">

                  <a
                    href={notification.link}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <ExternalLink size={17} />
                    Open Link
                  </a>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSentNotificationDetails;