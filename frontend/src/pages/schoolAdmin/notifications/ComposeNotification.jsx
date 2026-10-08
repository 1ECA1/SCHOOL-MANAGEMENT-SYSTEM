import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Send,
  Users,
  X,
} from "lucide-react";

import { sendNotification } from "../../../services/notificationsService";
import { getStudents, getParents } from "../../../services/studentsService";
import { getTeachers } from "../../../services/teachersService";

// =====================================================
// NOTIFICATION TYPES
// =====================================================

const NOTIFICATION_TYPES = [
  {
    value: "GENERAL",
    label: "General",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
  },
  {
    value: "RESULT",
    label: "Result",
  },
  {
    value: "FINANCE",
    label: "Finance",
  },
  {
    value: "EXAMINATION",
    label: "Examination",
  },
  {
    value: "ANNOUNCEMENT",
    label: "Announcement",
  },
  {
    value: "HOSTEL",
    label: "Hostel",
  },
  {
    value: "TRANSPORT",
    label: "Transport",
  },
  {
    value: "MESSAGE",
    label: "Message",
  },
];

// =====================================================
// RECIPIENT TYPES
// =====================================================

const RECIPIENT_TYPES = [
  {
    value: "ALL_ROLES",
    label: "All Roles",
    description:
      "Send to all active users in the school, including students, parents/guardians, teachers, principal, and other staff.",
    group: "All",
  },
  {
    value: "ALL_STUDENTS",
    label: "All Students",
    description: "Send to all active students in this school.",
    group: "Students",
  },
  {
    value: "STUDENTS",
    label: "Selected Students",
    description: "Choose specific students.",
    group: "Students",
  },
  {
    value: "ALL_PARENTS",
    label: "All Parents / Guardians",
    description: "Send to all active parents and guardians.",
    group: "Parents",
  },
  {
    value: "PARENTS",
    label: "Selected Parents / Guardians",
    description: "Choose specific parents or guardians.",
    group: "Parents",
  },
  {
    value: "ALL_TEACHERS",
    label: "All Teachers",
    description: "Send to all active teachers.",
    group: "Teachers",
  },
  {
    value: "TEACHERS",
    label: "Selected Teachers",
    description: "Choose specific teachers.",
    group: "Teachers",
  },
];

// =====================================================
// HELPERS
// =====================================================

const getListData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getStudentName = (student) => {
  return (
    student.full_name ||
    student.name ||
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.username ||
    `Student #${student.id}`
  );
};

const getParentName = (parent) => {
  return (
    parent.full_name ||
    parent.name ||
    `${parent.first_name || ""} ${parent.last_name || ""}`.trim() ||
    parent.username ||
    `Parent #${parent.id}`
  );
};

const getTeacherName = (teacher) => {
  return (
    teacher.full_name ||
    teacher.name ||
    `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
    teacher.username ||
    `Teacher #${teacher.id}`
  );
};

// =====================================================
// COMPONENT
// =====================================================

export default function ComposeNotification() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    notification_type: "GENERAL",
    title: "",
    message: "",
    link: "",
    recipient_type: "ALL_STUDENTS",
  });

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedParentIds, setSelectedParentIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [recipientSearch, setRecipientSearch] = useState("");

  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // LOAD RECIPIENT DATA WHEN REQUIRED
  // ===================================================

  useEffect(() => {
    const loadRecipients = async () => {
      setError("");

      try {
        setLoadingRecipients(true);

        // -----------------------------------------------
        // STUDENTS
        // -----------------------------------------------

        if (
          (form.recipient_type === "STUDENTS" ||
            form.recipient_type === "ALL_ROLES") &&
          students.length === 0
        ) {
          const data = await getStudents();
          setStudents(getListData(data));
        }

        // -----------------------------------------------
        // PARENTS
        // -----------------------------------------------

        if (
          (form.recipient_type === "PARENTS" ||
            form.recipient_type === "ALL_ROLES") &&
          parents.length === 0
        ) {
          const data = await getParents();
          setParents(getListData(data));
        }

        // -----------------------------------------------
        // TEACHERS
        // -----------------------------------------------

        if (
          (form.recipient_type === "TEACHERS" ||
            form.recipient_type === "ALL_ROLES") &&
          teachers.length === 0
        ) {
          const data = await getTeachers();
          setTeachers(getListData(data));
        }
      } catch (err) {
        console.error(
          "Failed to load notification recipients:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load recipients. Please try again.",
        );
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadRecipients();
  }, [
    form.recipient_type,
    students.length,
    parents.length,
    teachers.length,
  ]);

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // SELECT RECIPIENT
  // ===================================================

  const toggleRecipient = (id, type) => {
    if (type === "STUDENTS") {
      setSelectedStudentIds((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      );
    }

    if (type === "PARENTS") {
      setSelectedParentIds((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      );
    }

    if (type === "TEACHERS") {
      setSelectedTeacherIds((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      );
    }
  };

  // ===================================================
  // SELECT ALL
  // ===================================================

  const selectAllRecipients = () => {
    if (form.recipient_type === "STUDENTS") {
      setSelectedStudentIds(
        students.map((student) => student.id),
      );
    }

    if (form.recipient_type === "PARENTS") {
      setSelectedParentIds(
        parents.map((parent) => parent.id),
      );
    }

    if (form.recipient_type === "TEACHERS") {
      setSelectedTeacherIds(
        teachers.map((teacher) => teacher.id),
      );
    }
  };

  // ===================================================
  // CLEAR ALL
  // ===================================================

  const clearAllRecipients = () => {
    if (form.recipient_type === "STUDENTS") {
      setSelectedStudentIds([]);
    }

    if (form.recipient_type === "PARENTS") {
      setSelectedParentIds([]);
    }

    if (form.recipient_type === "TEACHERS") {
      setSelectedTeacherIds([]);
    }
  };

  // ===================================================
  // CURRENT SELECTED COUNT
  // ===================================================

  const selectedCount = useMemo(() => {
    if (form.recipient_type === "ALL_ROLES") {
      return null;
    }

    if (form.recipient_type === "STUDENTS") {
      return selectedStudentIds.length;
    }

    if (form.recipient_type === "PARENTS") {
      return selectedParentIds.length;
    }

    if (form.recipient_type === "TEACHERS") {
      return selectedTeacherIds.length;
    }

    return null;
  }, [
    form.recipient_type,
    selectedStudentIds,
    selectedParentIds,
    selectedTeacherIds,
  ]);

  // ===================================================
  // RESET SELECTED IDS WHEN RECIPIENT TYPE CHANGES
  // ===================================================

  useEffect(() => {
    setSelectedStudentIds([]);
    setSelectedParentIds([]);
    setSelectedTeacherIds([]);
    setRecipientSearch("");
  }, [form.recipient_type]);

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    if (!form.notification_type) {
      return "Please select a notification type.";
    }

    if (!form.title.trim()) {
      return "Please enter a notification title.";
    }

    if (!form.message.trim()) {
      return "Please enter the notification message.";
    }

    if (!form.recipient_type) {
      return "Please select the recipients.";
    }

    if (
      form.recipient_type === "STUDENTS" &&
      selectedStudentIds.length === 0
    ) {
      return "Please select at least one student.";
    }

    if (
      form.recipient_type === "PARENTS" &&
      selectedParentIds.length === 0
    ) {
      return "Please select at least one parent or guardian.";
    }

    if (
      form.recipient_type === "TEACHERS" &&
      selectedTeacherIds.length === 0
    ) {
      return "Please select at least one teacher.";
    }

    return "";
  };

  // ===================================================
  // SEND
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const basePayload = {
      notification_type: form.notification_type,
      title: form.title.trim(),
      message: form.message.trim(),
      link: form.link.trim(),
    };

    try {
      setSending(true);

      let recipientCount = 0;

      // =================================================
      // ALL ROLES
      // =================================================
      //
      // IMPORTANT:
      // The backend now has a real ALL_ROLES recipient type.
      //
      // This is ONE request.
      //
      // The backend determines every active user belonging
      // to the current school, including:
      //
      // - School Admin
      // - Principal
      // - Teachers
      // - Students
      // - Parents / Guardians
      // - Accountant / Finance Officer
      // - Librarian
      // - Admission Officer
      // - Exam Officer
      // - Counselor
      // - Hostel Manager
      // - Transport Manager
      // - Other school-linked staff
      //
      // =================================================

      if (form.recipient_type === "ALL_ROLES") {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "ALL_ROLES",
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // ALL STUDENTS
      // =================================================

      else if (
        form.recipient_type === "ALL_STUDENTS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "ALL_STUDENTS",
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // ALL PARENTS
      // =================================================

      else if (
        form.recipient_type === "ALL_PARENTS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "ALL_PARENTS",
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // ALL TEACHERS
      // =================================================

      else if (
        form.recipient_type === "ALL_TEACHERS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "ALL_TEACHERS",
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // SELECTED STUDENTS
      // =================================================

      else if (
        form.recipient_type === "STUDENTS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "STUDENTS",
          student_ids: selectedStudentIds,
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // SELECTED PARENTS
      // =================================================

      else if (
        form.recipient_type === "PARENTS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "PARENTS",
          parent_ids: selectedParentIds,
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // SELECTED TEACHERS
      // =================================================

      else if (
        form.recipient_type === "TEACHERS"
      ) {
        const response = await sendNotification({
          ...basePayload,
          recipient_type: "TEACHERS",
          teacher_ids: selectedTeacherIds,
        });

        recipientCount = Number(
          response?.recipient_count || 0,
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        `Notification sent successfully to ${recipientCount} recipient${
          recipientCount === 1 ? "" : "s"
        }.`,
      );

      // Reset message content.
      setForm((current) => ({
        ...current,
        title: "",
        message: "",
        link: "",
      }));

      setSelectedStudentIds([]);
      setSelectedParentIds([]);
      setSelectedTeacherIds([]);
      setRecipientSearch("");
    } catch (err) {
      console.error(
        "Failed to send notification:",
        err,
      );

      const backendError = err?.response?.data;

      if (backendError?.detail) {
        setError(backendError.detail);
      } else if (backendError) {
        setError(
          Object.values(backendError)
            .flat()
            .join(" "),
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

  // ===================================================
  // RECIPIENT DATA FOR CURRENT TYPE
  // ===================================================

  const currentRecipients =
    form.recipient_type === "STUDENTS"
      ? students
      : form.recipient_type === "PARENTS"
        ? parents
        : form.recipient_type === "TEACHERS"
          ? teachers
          : [];

  // ===================================================
  // SEARCH FILTER
  // ===================================================

  const filteredRecipients = useMemo(() => {
    const query = recipientSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return currentRecipients;
    }

    return currentRecipients.filter(
      (recipient) => {
        let name = "";

        if (
          form.recipient_type ===
          "STUDENTS"
        ) {
          name = getStudentName(recipient);
        }

        if (
          form.recipient_type ===
          "PARENTS"
        ) {
          name = getParentName(recipient);
        }

        if (
          form.recipient_type ===
          "TEACHERS"
        ) {
          name = getTeacherName(recipient);
        }

        const searchableValues = [
          name,
          recipient.first_name,
          recipient.last_name,
          recipient.full_name,
          recipient.name,
          recipient.username,
          recipient.email,
          recipient.phone,
          recipient.phone_number,
          recipient.admission_number,
          recipient.admission_no,
          recipient.employee_number,
          recipient.employee_no,
          recipient.student_number,
          recipient.student_id,
          recipient.parent_number,
          recipient.guardian_number,
          recipient.id,
        ];

        return searchableValues.some(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value)
              .toLowerCase()
              .includes(query),
        );
      },
    );
  }, [
    currentRecipients,
    recipientSearch,
    form.recipient_type,
  ]);

  const currentSelectedIds =
    form.recipient_type === "STUDENTS"
      ? selectedStudentIds
      : form.recipient_type === "PARENTS"
        ? selectedParentIds
        : selectedTeacherIds;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            {/* BACK BUTTON */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/notifications",
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[var(--color-card)] text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)] dark:border-white/10"
              title="Back to Notifications"
              aria-label="Back to Notifications"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Compose Notification
                </h1>

                <p className="text-sm opacity-70">
                  Send announcements and updates to
                  members of your school.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* SUCCESS */}
        {/* ============================================= */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-4">

            <CheckCircle2
              className="mt-0.5 shrink-0 text-[var(--color-secondary)]"
              size={20}
            />

            <div className="flex-1">
              <p className="font-semibold">
                Notification sent
              </p>

              <p className="mt-1 text-sm opacity-75">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="opacity-60 transition hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-[var(--color-primary)] bg-[var(--color-card)] p-4">

            <p className="font-semibold text-[var(--color-primary)]">
              Unable to continue
            </p>

            <p className="mt-1 text-sm opacity-75">
              {error}
            </p>
          </div>
        )}

        {/* ============================================= */}
        {/* FORM */}
        {/* ============================================= */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ========================================= */}
            {/* LEFT / MAIN */}
            {/* ========================================= */}

            <div className="space-y-6 lg:col-span-2">

              {/* MESSAGE DETAILS */}

              <section className="rounded-2xl border border-black/10 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">

                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    Notification Details
                  </h2>

                  <p className="mt-1 text-sm opacity-65">
                    Enter the content that recipients
                    will receive.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* Notification Type */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Notification Type
                    </label>

                    <div className="relative">
                      <select
                        name="notification_type"
                        value={
                          form.notification_type
                        }
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 pr-10 outline-none transition focus:border-[var(--color-primary)] dark:border-white/10"
                      >
                        {NOTIFICATION_TYPES.map(
                          (type) => (
                            <option
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
                      />
                    </div>
                  </div>

                  {/* Title */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter notification title"
                      maxLength={255}
                      className="w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 outline-none transition placeholder:opacity-40 focus:border-[var(--color-primary)] dark:border-white/10"
                    />
                  </div>

                  {/* Message */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your notification message..."
                      rows={7}
                      className="w-full resize-y rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 outline-none transition placeholder:opacity-40 focus:border-[var(--color-primary)] dark:border-white/10"
                    />

                    <div className="mt-2 flex justify-end text-xs opacity-50">
                      {form.message.length} characters
                    </div>
                  </div>

                  {/* Optional Link */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Link{" "}
                      <span className="font-normal opacity-50">
                        (Optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      name="link"
                      value={form.link}
                      onChange={handleChange}
                      placeholder="/school-admin/..."
                      maxLength={500}
                      className="w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 outline-none transition placeholder:opacity-40 focus:border-[var(--color-primary)] dark:border-white/10"
                    />

                    <p className="mt-2 text-xs opacity-50">
                      If supplied, the notification can
                      use this link to take the recipient
                      to a relevant page.
                    </p>
                  </div>
                </div>
              </section>

              {/* ======================================= */}
              {/* RECIPIENT SELECTION */}
              {/* ======================================= */}

              <section className="rounded-2xl border border-black/10 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">

                <div className="mb-5 flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Users size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Recipients
                    </h2>

                    <p className="mt-1 text-sm opacity-65">
                      Choose who should receive this
                      notification.
                    </p>
                  </div>
                </div>

                {/* Recipient type */}

                <div className="space-y-3">

                  {RECIPIENT_TYPES.map(
                    (recipient) => {
                      const selected =
                        form.recipient_type ===
                        recipient.value;

                      return (
                        <label
                          key={recipient.value}
                          className={`block cursor-pointer rounded-xl border p-4 transition ${
                            selected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                              : "border-black/10 hover:border-[var(--color-primary)]/40 dark:border-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">

                            <input
                              type="radio"
                              name="recipient_type"
                              value={
                                recipient.value
                              }
                              checked={selected}
                              onChange={
                                handleChange
                              }
                              className="mt-1 accent-[var(--color-primary)]"
                            />

                            <div>
                              <p className="font-medium">
                                {
                                  recipient.label
                                }
                              </p>

                              <p className="mt-1 text-sm opacity-60">
                                {
                                  recipient.description
                                }
                              </p>
                            </div>

                          </div>
                        </label>
                      );
                    },
                  )}
                </div>

                {/* ===================================== */}
                {/* SELECTED RECIPIENTS */}
                {/* ===================================== */}

                {[
                  "STUDENTS",
                  "PARENTS",
                  "TEACHERS",
                ].includes(
                  form.recipient_type,
                ) && (
                  <div className="mt-6 border-t border-black/10 pt-6 dark:border-white/10">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h3 className="font-semibold">
                          Select Recipients
                        </h3>

                        <p className="mt-1 text-sm opacity-60">
                          {selectedCount} selected
                        </p>
                      </div>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={
                            selectAllRecipients
                          }
                          disabled={
                            loadingRecipients ||
                            currentRecipients.length ===
                              0
                          }
                          className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                        >
                          Select All
                        </button>

                        <button
                          type="button"
                          onClick={
                            clearAllRecipients
                          }
                          disabled={
                            currentSelectedIds.length ===
                            0
                          }
                          className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                        >
                          Clear
                        </button>

                      </div>
                    </div>

                    {/* SEARCH */}

                    <div className="mb-4">

                      <label className="mb-2 block text-sm font-medium">
                        Search{" "}
                        {form.recipient_type ===
                        "STUDENTS"
                          ? "Students"
                          : form.recipient_type ===
                              "PARENTS"
                            ? "Parents / Guardians"
                            : "Teachers"}
                      </label>

                      <div className="relative">

                        <input
                          type="search"
                          value={
                            recipientSearch
                          }
                          onChange={(event) =>
                            setRecipientSearch(
                              event.target
                                .value,
                            )
                          }
                          placeholder={
                            form.recipient_type ===
                            "STUDENTS"
                              ? "Search by name, admission number, email, phone..."
                              : form.recipient_type ===
                                  "TEACHERS"
                                ? "Search by name, employee number, email, phone..."
                                : "Search by name, email, phone, username..."
                          }
                          className="w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-4 py-3 outline-none transition placeholder:opacity-40 focus:border-[var(--color-primary)] dark:border-white/10"
                        />

                        {recipientSearch && (
                          <button
                            type="button"
                            onClick={() =>
                              setRecipientSearch(
                                "",
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-50 transition hover:bg-[var(--color-primary)]/10 hover:opacity-100"
                            aria-label="Clear recipient search"
                          >
                            <X size={17} />
                          </button>
                        )}

                      </div>

                      {!loadingRecipients &&
                        recipientSearch.trim() && (
                          <p className="mt-2 text-xs opacity-60">
                            {
                              filteredRecipients.length
                            }{" "}
                            matching recipient
                            {filteredRecipients.length ===
                            1
                              ? ""
                              : "s"}{" "}
                            found
                          </p>
                        )}
                    </div>

                    {/* Loading */}

                    {loadingRecipients && (
                      <div className="flex items-center justify-center rounded-xl border border-black/10 bg-[var(--color-background)] p-8 dark:border-white/10">

                        <div className="flex items-center gap-3 text-sm opacity-70">

                          <Loader2
                            size={20}
                            className="animate-spin text-[var(--color-primary)]"
                          />

                          Loading recipients...
                        </div>
                      </div>
                    )}

                    {/* Empty */}

                    {!loadingRecipients &&
                      currentRecipients.length ===
                        0 && (
                        <div className="rounded-xl border border-black/10 bg-[var(--color-background)] p-8 text-center dark:border-white/10">

                          <Users
                            size={28}
                            className="mx-auto mb-3 opacity-40"
                          />

                          <p className="font-medium">
                            No recipients found
                          </p>

                          <p className="mt-1 text-sm opacity-60">
                            There are no available
                            recipients to select.
                          </p>
                        </div>
                      )}

                    {/* No search matches */}

                    {!loadingRecipients &&
                      currentRecipients.length >
                        0 &&
                      filteredRecipients.length ===
                        0 && (
                        <div className="rounded-xl border border-black/10 bg-[var(--color-background)] p-8 text-center dark:border-white/10">

                          <Users
                            size={28}
                            className="mx-auto mb-3 opacity-40"
                          />

                          <p className="font-medium">
                            No matching recipients
                          </p>

                          <p className="mt-1 text-sm opacity-60">
                            Try another name, admission
                            number, employee number,
                            email, or phone number.
                          </p>
                        </div>
                      )}

                    {/* Recipient list */}

                    {!loadingRecipients &&
                      filteredRecipients.length >
                        0 && (
                        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">

                          {filteredRecipients.map(
                            (recipient) => {
                              const id =
                                recipient.id;

                              const checked =
                                currentSelectedIds.includes(
                                  id,
                                );

                              let name = "";

                              if (
                                form.recipient_type ===
                                "STUDENTS"
                              ) {
                                name =
                                  getStudentName(
                                    recipient,
                                  );
                              }

                              if (
                                form.recipient_type ===
                                "PARENTS"
                              ) {
                                name =
                                  getParentName(
                                    recipient,
                                  );
                              }

                              if (
                                form.recipient_type ===
                                "TEACHERS"
                              ) {
                                name =
                                  getTeacherName(
                                    recipient,
                                  );
                              }

                              return (
                                <label
                                  key={id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                    checked
                                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                      : "border-black/10 hover:border-[var(--color-primary)]/30 dark:border-white/10"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      toggleRecipient(
                                        id,
                                        form.recipient_type,
                                      )
                                    }
                                    className="h-4 w-4 accent-[var(--color-primary)]"
                                  />

                                  <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium">
                                      {name}
                                    </p>

                                    {recipient.admission_number && (
                                      <p className="mt-0.5 text-xs opacity-50">
                                        {
                                          recipient.admission_number
                                        }
                                      </p>
                                    )}

                                    {recipient.employee_number && (
                                      <p className="mt-0.5 text-xs opacity-50">
                                        {
                                          recipient.employee_number
                                        }
                                      </p>
                                    )}

                                    {recipient.email && (
                                      <p className="mt-0.5 truncate text-xs opacity-50">
                                        {
                                          recipient.email
                                        }
                                      </p>
                                    )}

                                  </div>
                                </label>
                              );
                            },
                          )}

                        </div>
                      )}

                  </div>
                )}
              </section>
            </div>

            {/* ========================================= */}
            {/* RIGHT / SUMMARY */}
            {/* ========================================= */}

            <div className="lg:col-span-1">

              <div className="sticky top-6 rounded-2xl border border-black/10 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">

                <h2 className="text-lg font-semibold">
                  Notification Summary
                </h2>

                <div className="mt-5 space-y-4">

                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-50">
                      Type
                    </p>

                    <p className="mt-1 font-medium">
                      {
                        NOTIFICATION_TYPES.find(
                          (item) =>
                            item.value ===
                            form.notification_type,
                        )?.label
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-50">
                      Recipients
                    </p>

                    <p className="mt-1 font-medium">
                      {
                        RECIPIENT_TYPES.find(
                          (item) =>
                            item.value ===
                            form.recipient_type,
                        )?.label
                      }
                    </p>

                    {form.recipient_type ===
                      "ALL_ROLES" && (
                      <p className="mt-1 text-sm opacity-60">
                        All active users in the school,
                        including students,
                        parents/guardians, teachers,
                        principal, and other staff.
                      </p>
                    )}

                    {selectedCount !== null && (
                      <p className="mt-1 text-sm opacity-60">
                        {selectedCount} selected
                      </p>
                    )}
                  </div>

                  <div className="border-t border-black/10 pt-4 dark:border-white/10">

                    <p className="text-xs uppercase tracking-wide opacity-50">
                      Title
                    </p>

                    <p className="mt-1 break-words text-sm">
                      {form.title || (
                        <span className="opacity-40">
                          No title entered
                        </span>
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide opacity-50">
                      Message
                    </p>

                    <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm opacity-80">
                      {form.message || (
                        <span className="opacity-40">
                          No message entered
                        </span>
                      )}
                    </p>

                  </div>

                </div>

                {/* SEND */}

                <button
                  type="submit"
                  disabled={
                    sending ||
                    loadingRecipients
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={19} />

                      Send Notification
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}