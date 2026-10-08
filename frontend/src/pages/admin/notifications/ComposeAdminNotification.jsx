import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Loader2,
  Send,
  Users,
  School,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

const ComposeAdminNotification = () => {
  const navigate = useNavigate();

  const [recipientType, setRecipientType] = useState("ALL_ROLES");
  const [notificationType, setNotificationType] = useState("GENERAL");

  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD SCHOOLS
  // ============================================================

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoadingSchools(true);
        setError("");

        const { data } = await api.get("/academics/schools/");

        const schoolList = Array.isArray(data)
          ? data
          : data?.results || [];

        setSchools(schoolList);
      } catch (err) {
        console.error(
          "Failed to load schools:",
          err?.response?.data || err,
        );

        setError(
          err?.response?.data?.detail ||
            "Failed to load schools. Please refresh and try again.",
        );
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, []);

  // ============================================================
  // RECIPIENT TYPE CHANGE
  // ============================================================

  const handleRecipientTypeChange = (event) => {
    const value = event.target.value;

    setRecipientType(value);

    // Clear school when it is no longer needed.
    if (value !== "SCHOOL") {
      setSchoolId("");
    }

    setError("");
    setSuccess("");
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const submitNotification = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a notification title.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a notification message.");
      return;
    }

    // ----------------------------------------------------------
    // SINGLE SCHOOL VALIDATION
    // ----------------------------------------------------------

    if (recipientType === "SCHOOL" && !schoolId) {
      setError("Please select a school.");
      return;
    }

    try {
      setSending(true);

      const payload = {
        recipient_type: recipientType,
        notification_type: notificationType,
        title: title.trim(),
        message: message.trim(),
        link: link.trim(),
      };

      // --------------------------------------------------------
      // ADD SCHOOL ID ONLY FOR SINGLE SCHOOL
      // --------------------------------------------------------

      if (recipientType === "SCHOOL") {
        payload.school_id = Number(schoolId);
      }

      console.log(
        "Sending notification payload:",
        payload,
      );

      const response = await api.post(
        "/notifications/send/",
        payload,
      );

      console.log(
        "Notification send response:",
        response.data,
      );

      const recipientCount =
        response?.data?.recipient_count;

      setSuccess(
        recipientCount !== undefined
          ? `Notification sent successfully to ${recipientCount} recipient${
              recipientCount === 1 ? "" : "s"
            }.`
          : response?.data?.detail ||
              "Notification sent successfully.",
      );

      setTitle("");
      setMessage("");
      setLink("");
      setSchoolId("");

      setTimeout(() => {
        navigate("/admin/notifications");
      }, 1000);
    } catch (err) {
      console.error(
        "Failed to send notification:",
        err?.response?.data || err,
      );

      const responseData = err?.response?.data;

      let errorMessage =
        "Failed to send notification. Please check the details and try again.";

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (responseData?.detail) {
        errorMessage = responseData.detail;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = [];

        Object.entries(responseData).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              messages.push(
                `${field}: ${value.join(", ")}`,
              );
            } else if (typeof value === "string") {
              messages.push(
                `${field}: ${value}`,
              );
            } else {
              messages.push(
                `${field}: ${JSON.stringify(value)}`,
              );
            }
          },
        );

        if (messages.length > 0) {
          errorMessage = messages.join(" | ");
        }
      }

      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      <div className="mx-auto max-w-4xl">

        {/* ======================================================
            BACK BUTTON
        ====================================================== */}

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

        {/* ======================================================
            CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-sm">

          {/* HEADER */}

          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                <Bell
                  size={24}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-[var(--color-text)]">
                  Compose Notification
                </h1>

                <p className="mt-1 text-sm text-[var(--color-secondary)]">
                  Send a notification to users across
                  schools, roles, or a specific school.
                </p>
              </div>

            </div>
          </div>

          <form
            onSubmit={submitNotification}
            className="p-6"
          >

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* ==================================================
                SEND TO
            ================================================== */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Send To
              </label>

              <div className="relative">

                <Users
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={recipientType}
                  onChange={
                    handleRecipientTypeChange
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-[var(--color-card)] py-3 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >

                  <option value="ALL_ROLES">
                    All Roles
                  </option>

                  <option value="ALL_SCHOOLS">
                    All Schools
                  </option>

                  <option value="SCHOOL">
                    Single School
                  </option>

                  <option value="ALL_STUDENTS">
                    All Students
                  </option>

                  <option value="ALL_PARENTS">
                    All Parents / Guardians
                  </option>

                  <option value="ALL_TEACHERS">
                    All Teachers
                  </option>

                </select>

              </div>
            </div>

            {/* ==================================================
                SCHOOL SELECTOR
                Only appears for SINGLE SCHOOL
            ================================================== */}

            {recipientType === "SCHOOL" && (
              <div className="mb-5">

                <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                  Select School
                </label>

                <div className="relative">

                  <School
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    value={schoolId}
                    onChange={(event) =>
                      setSchoolId(
                        event.target.value,
                      )
                    }
                    disabled={loadingSchools}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-[var(--color-card)] py-3 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      {loadingSchools
                        ? "Loading schools..."
                        : "Select a school"}
                    </option>

                    {schools.map((school) => (
                      <option
                        key={school.id}
                        value={school.id}
                      >
                        {school.name}
                      </option>
                    ))}

                  </select>

                </div>

                {!loadingSchools &&
                  schools.length === 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      No schools were found.
                    </p>
                  )}

              </div>
            )}

            {/* ==================================================
                NOTIFICATION TYPE
            ================================================== */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Notification Type
              </label>

              <select
                value={notificationType}
                onChange={(event) =>
                  setNotificationType(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >

                <option value="GENERAL">
                  General
                </option>

                <option value="ANNOUNCEMENT">
                  Announcement
                </option>

                <option value="ACADEMIC">
                  Academic
                </option>

                <option value="ASSIGNMENT">
                  Assignment
                </option>

                <option value="EXAMINATION">
                  Examination
                </option>

                <option value="FINANCE">
                  Finance
                </option>

                <option value="ATTENDANCE">
                  Attendance
                </option>

              </select>

            </div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Notification Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter notification title"
                maxLength={255}
                className="w-full rounded-xl border border-gray-200 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-gray-400 focus:border-[var(--color-primary)]"
              />

            </div>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Message
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Write your notification message..."
                rows={7}
                className="w-full resize-none rounded-xl border border-gray-200 bg-[var(--color-card)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-gray-400 focus:border-[var(--color-primary)]"
              />

            </div>

            {/* ==================================================
                LINK
            ================================================== */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Link{" "}
                <span className="font-normal text-[var(--color-secondary)]">
                  (Optional)
                </span>
              </label>

              <input
                type="text"
                value={link}
                onChange={(event) =>
                  setLink(event.target.value)
                }
                placeholder="Optional link"
                maxLength={500}
                className="w-full rounded-xl border border-gray-200 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-gray-400 focus:border-[var(--color-primary)]"
              />

            </div>

            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/notifications")
                }
                disabled={sending}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  sending ||
                  loadingSchools ||
                  (recipientType === "SCHOOL" &&
                    !schoolId)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {sending ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Notification
                  </>
                )}

              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ComposeAdminNotification;