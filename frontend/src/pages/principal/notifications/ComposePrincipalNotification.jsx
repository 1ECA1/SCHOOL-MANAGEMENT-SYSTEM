import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { sendNotification } from "../../../services/notificationsService";
import {
  getStudents,
  getParents,
} from "../../../services/studentsService";

const ComposePrincipalNotification = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);

  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    recipient_type: "ALL_ROLES",
    student_ids: [],
    parent_ids: [],
    notification_type: "GENERAL",
    title: "",
    message: "",
  });

  // =====================================================
  // LOAD STUDENTS AND PARENTS
  // =====================================================

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        setLoadingRecipients(true);
        setError("");

        const [studentsResponse, parentsResponse] =
          await Promise.all([
            getStudents(),
            getParents(),
          ]);

        const studentList = Array.isArray(studentsResponse)
          ? studentsResponse
          : Array.isArray(studentsResponse?.results)
            ? studentsResponse.results
            : [];

        const parentList = Array.isArray(parentsResponse)
          ? parentsResponse
          : Array.isArray(parentsResponse?.results)
            ? parentsResponse.results
            : [];

        setStudents(studentList);
        setParents(parentList);
      } catch (err) {
        console.error(
          "Failed to load notification recipients:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load recipients.",
        );
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadRecipients();
  }, []);

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SELECT STUDENT
  // =====================================================

  const toggleStudent = (studentId) => {
    setForm((current) => {
      const exists = current.student_ids.includes(studentId);

      return {
        ...current,
        student_ids: exists
          ? current.student_ids.filter(
              (id) => id !== studentId,
            )
          : [...current.student_ids, studentId],
      };
    });
  };

  // =====================================================
  // SELECT PARENT
  // =====================================================

  const toggleParent = (parentId) => {
    setForm((current) => {
      const exists = current.parent_ids.includes(parentId);

      return {
        ...current,
        parent_ids: exists
          ? current.parent_ids.filter(
              (id) => id !== parentId,
            )
          : [...current.parent_ids, parentId],
      };
    });
  };

  // =====================================================
  // SELECT ALL STUDENTS
  // =====================================================

  const selectAllStudents = () => {
    setForm((current) => ({
      ...current,
      student_ids: students.map(
        (student) => student.id,
      ),
    }));
  };

  // =====================================================
  // CLEAR STUDENTS
  // =====================================================

  const clearStudents = () => {
    setForm((current) => ({
      ...current,
      student_ids: [],
    }));
  };

  // =====================================================
  // SELECT ALL PARENTS
  // =====================================================

  const selectAllParents = () => {
    setForm((current) => ({
      ...current,
      parent_ids: parents.map(
        (parent) => parent.id,
      ),
    }));
  };

  // =====================================================
  // CLEAR PARENTS
  // =====================================================

  const clearParents = () => {
    setForm((current) => ({
      ...current,
      parent_ids: [],
    }));
  };

  // =====================================================
  // RECIPIENT LABEL
  // =====================================================

  const recipientDescription = useMemo(() => {
    switch (form.recipient_type) {
      case "ALL_ROLES":
        return "All active staff, teachers, students and parents in your school.";

      case "ALL_STUDENTS":
        return "All active students in your school.";

      case "STUDENTS":
        return `${form.student_ids.length} student(s) selected.`;

      case "ALL_PARENTS":
        return "All active parents/guardians in your school.";

      case "PARENTS":
        return `${form.parent_ids.length} parent(s) selected.`;

      case "ALL_TEACHERS":
        return "All active teachers in your school.";

      default:
        return "";
    }
  }, [
    form.recipient_type,
    form.student_ids.length,
    form.parent_ids.length,
  ]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title) {
      setError("Please enter a notification title.");
      return;
    }

    if (!message) {
      setError("Please enter a notification message.");
      return;
    }

    if (
      form.recipient_type === "STUDENTS" &&
      form.student_ids.length === 0
    ) {
      setError("Please select at least one student.");
      return;
    }

    if (
      form.recipient_type === "PARENTS" &&
      form.parent_ids.length === 0
    ) {
      setError("Please select at least one parent.");
      return;
    }

    try {
      setSending(true);

      const payload = {
        recipient_type: form.recipient_type,
        notification_type: form.notification_type,
        title,
        message,
      };

      if (form.recipient_type === "STUDENTS") {
        payload.recipient_ids = form.student_ids;
      }

      if (form.recipient_type === "PARENTS") {
        payload.recipient_ids = form.parent_ids;
      }

      const response = await sendNotification(payload);

      const recipientCount = Number(
        response?.recipient_count || 0,
      );

      setSuccess(
        recipientCount > 0
          ? `Notification sent successfully to ${recipientCount} recipient${
              recipientCount === 1 ? "" : "s"
            }.`
          : "Notification sent successfully.",
      );

      setForm({
        recipient_type: "ALL_ROLES",
        student_ids: [],
        parent_ids: [],
        notification_type: "GENERAL",
        title: "",
        message: "",
      });
    } catch (err) {
      console.error(
        "Failed to send notification:",
        err,
      );

      const responseData = err?.response?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData) {
        const firstError = Object.values(
          responseData,
        ).flat()?.[0];

        setError(
          firstError ||
            "Unable to send notification.",
        );
      } else {
        setError("Unable to send notification.");
      }
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate("/principal/notifications")
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm transition hover:opacity-80"
          title="Back to notifications"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-[var(--color-primary)]" />

            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Compose Notification
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            Send a notification to people in your school.
          </p>
        </div>
      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6"
      >
        {/* =================================================
            RECIPIENT
        ================================================= */}

        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Users className="h-5 w-5 text-[var(--color-primary)]" />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--color-text)]">
                Recipients
              </h2>

              <p className="text-xs text-[var(--color-text)]/60">
                Choose who should receive this notification.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Send to
          </label>

          <select
            name="recipient_type"
            value={form.recipient_type}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="ALL_ROLES">
              All Roles
            </option>

            <option value="ALL_STUDENTS">
              All Students
            </option>

            <option value="STUDENTS">
              Selected Students
            </option>

            <option value="ALL_PARENTS">
              All Parents / Guardians
            </option>

            <option value="PARENTS">
              Selected Parents / Guardians
            </option>

            <option value="ALL_TEACHERS">
              All Teachers
            </option>
          </select>

          <div className="mt-3 rounded-lg bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)]/70">
            {recipientDescription}
          </div>
        </div>

        {/* =================================================
            STUDENT SELECTION
        ================================================= */}

        {form.recipient_type === "STUDENTS" && (
          <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Select Students
                </h2>

                <p className="text-xs text-[var(--color-text)]/60">
                  Choose the students who should receive the notification.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearStudents}
                  className="rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
                >
                  Clear
                </button>
              </div>
            </div>

            {loadingRecipients ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : students.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-text)]/60">
                No students found.
              </p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {students.map((student) => {
                  const studentName =
                    student.full_name ||
                    student.name ||
                    `${student.first_name || ""} ${
                      student.last_name || ""
                    }`.trim() ||
                    student.username ||
                    `Student #${student.id}`;

                  return (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-background)] p-3 transition hover:bg-[var(--color-background)]"
                    >
                      <input
                        type="checkbox"
                        checked={form.student_ids.includes(
                          student.id,
                        )}
                        onChange={() =>
                          toggleStudent(student.id)
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-[var(--color-text)]">
                        {studentName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            PARENT SELECTION
        ================================================= */}

        {form.recipient_type === "PARENTS" && (
          <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Select Parents / Guardians
                </h2>

                <p className="text-xs text-[var(--color-text)]/60">
                  Choose the parents or guardians who should receive the notification.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllParents}
                  className="rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearParents}
                  className="rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
                >
                  Clear
                </button>
              </div>
            </div>

            {loadingRecipients ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : parents.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-text)]/60">
                No parents / guardians found.
              </p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {parents.map((parent) => {
                  const parentName =
                    parent.full_name ||
                    parent.name ||
                    `${parent.first_name || ""} ${
                      parent.last_name || ""
                    }`.trim() ||
                    parent.username ||
                    `Parent #${parent.id}`;

                  return (
                    <label
                      key={parent.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-background)] p-3 transition hover:bg-[var(--color-background)]"
                    >
                      <input
                        type="checkbox"
                        checked={form.parent_ids.includes(
                          parent.id,
                        )}
                        onChange={() =>
                          toggleParent(parent.id)
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-[var(--color-text)]">
                        {parentName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            NOTIFICATION DETAILS
        ================================================= */}

        <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-card)] p-5 shadow-sm">
          <h2 className="mb-5 font-semibold text-[var(--color-text)]">
            Notification Details
          </h2>

          <div className="space-y-5">
            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Notification Type
              </label>

              <select
                name="notification_type"
                value={form.notification_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
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

                <option value="EXAMINATION">
                  Examination
                </option>

                <option value="RESULT">
                  Result
                </option>

                <option value="FINANCE">
                  Finance
                </option>

                <option value="ATTENDANCE">
                  Attendance
                </option>

                <option value="ANNOUNCEMENT">
                  Announcement
                </option>

                <option value="SYSTEM">
                  System
                </option>
              </select>
            </div>

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter notification title"
                maxLength={255}
                className="w-full rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-primary)]"
              />
            </div>

            {/* MESSAGE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Message
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                placeholder="Write your notification message..."
                className="w-full resize-y rounded-lg border border-[var(--color-background)] bg-[var(--color-background)] px-3 py-3 text-sm leading-6 text-[var(--color-text)] outline-none placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/principal/notifications")
            }
            className="rounded-lg border border-[var(--color-card)] bg-[var(--color-card)] px-5 py-3 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:opacity-80"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />

                Send Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposePrincipalNotification;