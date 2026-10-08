import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

import { sendNotification } from "../../../services/notificationsService";
import {
  getMyTeacherClasses,
  getMyTeacherSubjects,
} from "../../../services/teachersService";


// ============================================================
// COMPOSE TEACHER NOTIFICATION
// ============================================================

export default function ComposeTeacherNotification() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    recipient_type: "CLASS",
    class_level_id: "",
    subject_id: "",
    notification_type: "GENERAL",
    title: "",
    message: "",
    link: "",
  });

  // ==========================================================
  // LOAD TEACHER ASSIGNMENTS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadAssignments = async () => {
      setLoading(true);
      setError("");

      try {
        const [classData, subjectData] = await Promise.all([
          getMyTeacherClasses(),
          getMyTeacherSubjects(),
        ]);

        if (!mounted) return;

        const classResults = Array.isArray(classData)
          ? classData
          : classData?.results || [];

        const subjectResults = Array.isArray(subjectData)
          ? subjectData
          : subjectData?.results || [];

        setClasses(classResults);
        setSubjects(subjectResults);
      } catch (err) {
        console.error(
          "Failed to load teacher notification assignments:",
          err,
        );

        if (!mounted) return;

        setClasses([]);
        setSubjects([]);

        setError(
          err?.response?.data?.detail ||
            "Unable to load your assigned classes and subjects.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAssignments();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // CLASS OPTIONS
  //
  // Backend:
  // ClassTeacherSerializer
  //
  // {
  //   id: 10,
  //   class_level: 29,
  //   class_level_name: "SS2 SCIENCE"
  // }
  //
  // IMPORTANT:
  // item.id is the ClassTeacher assignment ID.
  // item.class_level is the actual ClassLevel ID.
  // ==========================================================

  const classOptions = useMemo(() => {
    return classes
      .filter((item) => item?.is_active !== false)
      .map((item) => ({
        id: item.class_level,
        name:
          item.class_level_name ||
          `Class ${item.class_level}`,
        assignmentId: item.id,
        sessionName: item.academic_session_name,
        sessionId: item.academic_session,
      }))
      .filter((item) => item.id);
  }, [classes]);

  // ==========================================================
  // SUBJECT OPTIONS
  //
  // Backend:
  // TeacherSubjectSerializer
  //
  // {
  //   id: 25,
  //   subject: 40,
  //   subject_name: "Litrature-in-English-3",
  //   class_level: 45,
  //   class_level_name: "SS3 ART"
  // }
  //
  // IMPORTANT:
  // item.id is the TeacherSubject assignment ID.
  // item.subject is the actual Subject ID.
  // ==========================================================

  const subjectOptions = useMemo(() => {
    return subjects
      .map((item) => ({
        id: item.subject,
        name:
          item.subject_name ||
          `Subject ${item.subject}`,
        assignmentId: item.id,
        classLevelId: item.class_level,
        classLevelName: item.class_level_name,
      }))
      .filter((item) => item.id);
  }, [subjects]);

  // ==========================================================
  // FORM HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // RECIPIENT TYPE
  // ==========================================================

  const handleRecipientTypeChange = (type) => {
    setForm((previous) => ({
      ...previous,
      recipient_type: type,
      class_level_id: "",
      subject_id: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const message = form.message.trim();
    const link = form.link.trim();

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!title) {
      setError("Please enter a notification title.");
      return;
    }

    if (!message) {
      setError("Please enter a notification message.");
      return;
    }

    // --------------------------------------------------------
    // CLASS VALIDATION
    // --------------------------------------------------------

    if (
      form.recipient_type === "CLASS" &&
      !form.class_level_id
    ) {
      setError("Please select a class.");
      return;
    }

    // --------------------------------------------------------
    // SUBJECT VALIDATION
    // --------------------------------------------------------

    if (
      form.recipient_type === "SUBJECT" &&
      !form.subject_id
    ) {
      setError("Please select a subject.");
      return;
    }

    // --------------------------------------------------------
    // PAYLOAD
    // --------------------------------------------------------

    const payload = {
      notification_type: form.notification_type,
      title,
      message,
      recipient_type: form.recipient_type,
    };

    if (link) {
      payload.link = link;
    }

    if (form.recipient_type === "CLASS") {
      payload.class_level_id = Number(
        form.class_level_id,
      );
    }

    if (form.recipient_type === "SUBJECT") {
      payload.subject_id = Number(
        form.subject_id,
      );
    }

    // --------------------------------------------------------
    // SEND
    // --------------------------------------------------------

    try {
      setSending(true);

      await sendNotification(payload);

      setSuccess(
        "Notification sent successfully.",
      );

      setForm((previous) => ({
        ...previous,
        title: "",
        message: "",
        link: "",
        class_level_id: "",
        subject_id: "",
      }));
    } catch (err) {
      console.error(
        "Failed to send teacher notification:",
        err,
      );

      const responseData = err?.response?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.class_level_id) {
        setError(
          Array.isArray(responseData.class_level_id)
            ? responseData.class_level_id[0]
            : responseData.class_level_id,
        );
      } else if (responseData?.subject_id) {
        setError(
          Array.isArray(responseData.subject_id)
            ? responseData.subject_id[0]
            : responseData.subject_id,
        );
      } else {
        setError(
          "Unable to send notification. Please try again.",
        );
      }
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    window.history.back();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] text-[var(--color-text)] transition hover:opacity-80"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Bell
                size={22}
                className="text-[var(--color-primary)]"
              />

              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Compose Notification
              </h1>
            </div>

            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              Send a notification to students in your assigned
              class or subject group.
            </p>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-[var(--color-card)] bg-[var(--color-card)]">
            <div className="flex items-center gap-3 text-[var(--color-secondary)]">
              <Loader2
                size={22}
                className="animate-spin"
              />
              <span>
                Loading your assigned classes and subjects...
              </span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6"
          >
            {/* ==================================================
                RECIPIENT
            ================================================== */}

            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-[var(--color-text)]">
                Send To
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* CLASS */}

                <button
                  type="button"
                  onClick={() =>
                    handleRecipientTypeChange("CLASS")
                  }
                  className={`rounded-lg border px-4 py-4 text-left transition ${
                    form.recipient_type === "CLASS"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-background)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-[var(--color-text)]">
                    Entire Class
                  </div>

                  <div className="mt-1 text-xs text-[var(--color-secondary)]">
                    Send to students in a class you are assigned
                    as class teacher.
                  </div>
                </button>

                {/* SUBJECT */}

                <button
                  type="button"
                  onClick={() =>
                    handleRecipientTypeChange("SUBJECT")
                  }
                  className={`rounded-lg border px-4 py-4 text-left transition ${
                    form.recipient_type === "SUBJECT"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-background)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-[var(--color-text)]">
                    Subject Group
                  </div>

                  <div className="mt-1 text-xs text-[var(--color-secondary)]">
                    Send to students taking a subject you teach.
                  </div>
                </button>
              </div>
            </div>

            {/* ==================================================
                CLASS SELECTOR
            ================================================== */}

            {form.recipient_type === "CLASS" && (
              <div className="mb-5">
                <label
                  htmlFor="class_level_id"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Class
                </label>

                <select
                  id="class_level_id"
                  name="class_level_id"
                  value={form.class_level_id}
                  onChange={handleChange}
                  disabled={sending}
                  className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">
                    {classOptions.length
                      ? "Select a class"
                      : "No assigned class found"}
                  </option>

                  {classOptions.map((item) => (
                    <option
                      key={`${item.id}-${item.assignmentId}`}
                      value={item.id}
                    >
                      {item.name}
                      {item.sessionName
                        ? ` — ${item.sessionName}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ==================================================
                SUBJECT SELECTOR
            ================================================== */}

            {form.recipient_type === "SUBJECT" && (
              <div className="mb-5">
                <label
                  htmlFor="subject_id"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Subject
                </label>

                <select
                  id="subject_id"
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  disabled={sending}
                  className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">
                    {subjectOptions.length
                      ? "Select a subject"
                      : "No assigned subject found"}
                  </option>

                  {subjectOptions.map((item) => (
                    <option
                      key={`${item.id}-${item.assignmentId}`}
                      value={item.id}
                    >
                      {item.name}
                      {item.classLevelName
                        ? ` — ${item.classLevelName}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ==================================================
                NOTIFICATION TYPE
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="notification_type"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Notification Type
              </label>

              <select
                id="notification_type"
                name="notification_type"
                value={form.notification_type}
                onChange={handleChange}
                disabled={sending}
                className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="GENERAL">
                  General
                </option>

                <option value="ACADEMIC">
                  Academic
                </option>

                <option value="ASSIGNMENT">
                  Assignment
                </option>

                <option value="EXAM">
                  Examination
                </option>

                <option value="ATTENDANCE">
                  Attendance
                </option>

                <option value="FINANCE">
                  Finance
                </option>

                <option value="ANNOUNCEMENT">
                  Announcement
                </option>
              </select>
            </div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                disabled={sending}
                maxLength={255}
                placeholder="Enter notification title"
                className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                disabled={sending}
                rows={6}
                placeholder="Write your notification message..."
                className="w-full resize-y rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>

            {/* ==================================================
                OPTIONAL LINK
            ================================================== */}

            <div className="mb-6">
              <label
                htmlFor="link"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Link
                <span className="ml-1 font-normal text-[var(--color-secondary)]">
                  (Optional)
                </span>
              </label>

              <input
                id="link"
                name="link"
                type="text"
                value={form.link}
                onChange={handleChange}
                disabled={sending}
                maxLength={500}
                placeholder="/teacher/assignments"
                className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={handleBack}
                disabled={sending}
                className="rounded-lg border border-[var(--color-background)] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={sending || loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}