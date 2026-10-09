import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit3,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../../../services/attendanceService";

import {
  getStudents,
  getEnrollments,
} from "../../../services/studentsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
  getSubjects,
} from "../../../services/academicsService";

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_OPTIONS = [
  {
    value: "PRESENT",
    label: "Present",
  },
  {
    value: "ABSENT",
    label: "Absent",
  },
  {
    value: "LATE",
    label: "Late",
  },
  {
    value: "EXCUSED",
    label: "Excused",
  },
];

const EMPTY_FORM = {
  student: "",
  academic_session: "",
  term: "",
  class_level: "",
  subject: "",
  date: new Date().toISOString().slice(0, 10),
  status: "PRESENT",
  check_in_time: "",
  check_out_time: "",
  remarks: "",
};

// ============================================================
// HELPERS
// ============================================================

const unwrapList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getStudentName = (student) => {
  if (!student) return "";

  return (
    student.full_name ||
    student.name ||
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.admission_number ||
    `Student #${student.id}`
  );
};

const getClassName = (item) => {
  if (!item) return "";

  return (
    item.class_name ||
    item.class_level_name ||
    item.class_level?.name ||
    item.class_level ||
    ""
  );
};

const getSessionName = (item) => {
  if (!item) return "";

  return (
    item.academic_session_name ||
    item.session_name ||
    item.academic_session?.name ||
    item.academic_session ||
    ""
  );
};

const getTermName = (item) => {
  if (!item) return "";

  return (
    item.term_name ||
    item.term?.name ||
    item.term ||
    ""
  );
};

const getSubjectName = (item) => {
  if (!item) return "";

  return (
    item.subject_name ||
    item.subject?.name ||
    item.subject ||
    "General"
  );
};

const getStatusLabel = (record) => {
  if (record?.status_display) {
    return record.status_display;
  }

  const found = STATUS_OPTIONS.find(
    (item) => item.value === record?.status,
  );

  return found?.label || record?.status || "";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "—";

  const parts = time.split(":");

  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "ABSENT":
      return "bg-red-50 text-red-700 border-red-200";

    case "LATE":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "EXCUSED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const extractErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const value = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${value}`;
      })
      .join(" | ");
  }

  return "Something went wrong.";
};

// ============================================================
// COMPONENT
// ============================================================

export default function Attendance() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showFilters, setShowFilters] = useState(true);

  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [filters, setFilters] = useState({
    student: "",
    class_level: "",
    academic_session: "",
    term: "",
    subject: "",
    status: "",
    date: "",
    date_from: "",
    date_to: "",
  });

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState(EMPTY_FORM);

  // ==========================================================
  // LOAD SELECT OPTIONS
  // ==========================================================

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError("");

    try {
      const [
        studentsResponse,
        sessionsResponse,
        termsResponse,
        classesResponse,
        subjectsResponse,
      ] = await Promise.all([
        getStudents(),
        getSessions(),
        getTerms(),
        getClassLevels(),
        getSubjects(),
      ]);

      setStudents(unwrapList(studentsResponse));
      setSessions(unwrapList(sessionsResponse));
      setTerms(unwrapList(termsResponse));
      setClassLevels(unwrapList(classesResponse));
      setSubjects(unwrapList(subjectsResponse));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingOptions(false);
    }
  };

  // ==========================================================
  // LOAD ENROLLMENTS
  // ==========================================================

  const loadEnrollments = async () => {
    try {
      const params = {};

      if (form.class_level) {
        params.classLevel = form.class_level;
      }

      if (form.academic_session) {
        params.academicSession = form.academic_session;
      }

      if (form.term) {
        params.term = form.term;
      }

      const response = await getEnrollments(params);

      setEnrollments(unwrapList(response));
    } catch (err) {
      setEnrollments([]);
    }
  };

  // ==========================================================
  // LOAD ATTENDANCE
  // ==========================================================

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });

      const response = await getAttendance(params);

      setAttendance(unwrapList(response));
    } catch (err) {
      setError(extractErrorMessage(err));
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [
    filters.student,
    filters.class_level,
    filters.academic_session,
    filters.term,
    filters.subject,
    filters.status,
    filters.date,
    filters.date_from,
    filters.date_to,
  ]);

  // ==========================================================
  // LOAD ENROLLMENTS WHEN FORM CONTEXT CHANGES
  // ==========================================================

  useEffect(() => {
    if (
      form.class_level ||
      form.academic_session ||
      form.term
    ) {
      loadEnrollments();
    } else {
      setEnrollments([]);
    }
  }, [
    form.class_level,
    form.academic_session,
    form.term,
  ]);

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  const filteredAttendance = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return attendance;
    }

    return attendance.filter((record) => {
      const studentName =
        record.student_name ||
        getStudentName(
          students.find(
            (student) =>
              String(student.id) === String(record.student),
          ),
        );

      const admissionNumber =
        record.admission_number ||
        record.student_admission_number ||
        "";

      const className =
        record.class_name ||
        record.class_level_name ||
        "";

      const subjectName = getSubjectName(record);

      return [
        studentName,
        admissionNumber,
        className,
        subjectName,
        record.status,
        record.status_display,
        record.remarks,
      ]
        .filter(Boolean)
        .some((item) =>
          String(item).toLowerCase().includes(value),
        );
    });
  }, [attendance, search, students]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const statistics = useMemo(() => {
    const total = filteredAttendance.length;

    const present = filteredAttendance.filter(
      (item) => item.status === "PRESENT",
    ).length;

    const absent = filteredAttendance.filter(
      (item) => item.status === "ABSENT",
    ).length;

    const late = filteredAttendance.filter(
      (item) => item.status === "LATE",
    ).length;

    const excused = filteredAttendance.filter(
      (item) => item.status === "EXCUSED",
    ).length;

    return {
      total,
      present,
      absent,
      late,
      excused,
    };
  }, [filteredAttendance]);

  // ==========================================================
  // FORM HELPERS
  // ==========================================================

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateFilter = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // STUDENT CHANGE
  // ==========================================================

  const handleStudentChange = (studentId) => {
    const selectedEnrollment = enrollments.find(
      (enrollment) =>
        String(enrollment.student) === String(studentId),
    );

    setForm((previous) => ({
      ...previous,
      student: studentId,

      class_level:
        selectedEnrollment?.class_level ||
        previous.class_level,

      academic_session:
        selectedEnrollment?.academic_session ||
        previous.academic_session,

      term:
        selectedEnrollment?.term ||
        previous.term,
    }));
  };

  // ==========================================================
  // OPEN CREATE
  // ==========================================================

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,

      academic_session:
        filters.academic_session ||
        sessions[0]?.id ||
        "",

      term:
        filters.term ||
        terms[0]?.id ||
        "",

      class_level:
        filters.class_level ||
        "",

      student:
        filters.student ||
        "",

      subject:
        filters.subject ||
        "",

      status: "PRESENT",

      date:
        filters.date ||
        new Date().toISOString().slice(0, 10),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEditModal = (record) => {
    setEditingId(record.id);

    setForm({
      student: record.student || "",
      academic_session:
        record.academic_session || "",
      term: record.term || "",
      class_level:
        record.class_level || "",
      subject:
        record.subject || "",
      date:
        record.date ||
        new Date().toISOString().slice(0, 10),
      status:
        record.status || "PRESENT",
      check_in_time:
        record.check_in_time || "",
      check_out_time:
        record.check_out_time || "",
      remarks:
        record.remarks || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.student) {
        throw new Error("Please select a student.");
      }

      if (!form.academic_session) {
        throw new Error("Please select an academic session.");
      }

      if (!form.term) {
        throw new Error("Please select a term.");
      }

      if (!form.class_level) {
        throw new Error("Please select a class.");
      }

      if (!form.date) {
        throw new Error("Please select an attendance date.");
      }

      const payload = {
        student: Number(form.student),
        academic_session: Number(form.academic_session),
        term: Number(form.term),
        class_level: Number(form.class_level),
        date: form.date,
        status: form.status,
        remarks: form.remarks || "",
      };

      if (form.subject) {
        payload.subject = Number(form.subject);
      } else {
        payload.subject = null;
      }

      if (form.check_in_time) {
        payload.check_in_time = form.check_in_time;
      } else {
        payload.check_in_time = null;
      }

      if (form.check_out_time) {
        payload.check_out_time = form.check_out_time;
      } else {
        payload.check_out_time = null;
      }

      if (editingId) {
        await updateAttendance(editingId, payload);
        setSuccess("Attendance record updated successfully.");
      } else {
        await createAttendance(payload);
        setSuccess("Attendance record created successfully.");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error && !err.response
          ? err.message
          : extractErrorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (record) => {
    const studentName =
      record.student_name ||
      getStudentName(
        students.find(
          (student) =>
            String(student.id) === String(record.student),
        ),
      ) ||
      "this student";

    const confirmed = window.confirm(
      `Delete attendance for ${studentName} on ${formatDate(
        record.date,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteAttendance(record.id);

      setSuccess("Attendance record deleted successfully.");

      await loadAttendance();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");

    setFilters({
      student: "",
      class_level: "",
      academic_session: "",
      term: "",
      subject: "",
      status: "",
      date: "",
      date_from: "",
      date_to: "",
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
              <UserCheck className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attendance
              </h1>

              <p className="text-sm text-gray-500">
                Manage student attendance records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAttendance}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />

            Mark Attendance
          </button>
        </div>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {success}
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Records"
          value={statistics.total}
          iconClass="bg-indigo-100 text-indigo-600"
        />

        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Present"
          value={statistics.present}
          iconClass="bg-emerald-100 text-emerald-600"
        />

        <StatCard
          icon={<X className="h-5 w-5" />}
          label="Absent"
          value={statistics.absent}
          iconClass="bg-red-100 text-red-600"
        />

        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Late"
          value={statistics.late}
          iconClass="bg-amber-100 text-amber-600"
        />

        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Excused"
          value={statistics.excused}
          iconClass="bg-blue-100 text-blue-600"
        />
      </div>

      {/* ======================================================
          SEARCH + FILTER TOGGLE
      ====================================================== */}

      <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student, admission number, class or subject..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />

            Filters

            <ChevronDown
              className={`h-4 w-4 transition ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            Clear
          </button>
        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        {showFilters && (
          <div className="border-t border-gray-100 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Academic Session"
                value={filters.academic_session}
                onChange={(value) =>
                  updateFilter("academic_session", value)
                }
                options={sessions}
                placeholder="All sessions"
                getLabel={(item) =>
                  item.name ||
                  item.session_name ||
                  `Session ${item.id}`
                }
              />

              <FilterSelect
                label="Term"
                value={filters.term}
                onChange={(value) =>
                  updateFilter("term", value)
                }
                options={terms}
                placeholder="All terms"
                getLabel={(item) =>
                  item.name ||
                  item.term_name ||
                  `Term ${item.id}`
                }
              />

              <FilterSelect
                label="Class"
                value={filters.class_level}
                onChange={(value) =>
                  updateFilter("class_level", value)
                }
                options={classLevels}
                placeholder="All classes"
                getLabel={(item) =>
                  item.name ||
                  item.class_name ||
                  `Class ${item.id}`
                }
              />

              <FilterSelect
                label="Subject"
                value={filters.subject}
                onChange={(value) =>
                  updateFilter("subject", value)
                }
                options={subjects}
                placeholder="All subjects"
                getLabel={(item) =>
                  item.name ||
                  item.subject_name ||
                  `Subject ${item.id}`
                }
              />

              <FilterSelect
                label="Student"
                value={filters.student}
                onChange={(value) =>
                  updateFilter("student", value)
                }
                options={students}
                placeholder="All students"
                getLabel={(item) =>
                  `${getStudentName(item)}${
                    item.admission_number
                      ? ` — ${item.admission_number}`
                      : ""
                  }`
                }
              />

              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) =>
                  updateFilter("status", value)
                }
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                getValue={(item) => item.value}
                getLabel={(item) => item.label}
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Exact Date
                </label>

                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) =>
                    updateFilter("date", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  From Date
                </label>

                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(event) =>
                    updateFilter(
                      "date_from",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  To Date
                </label>

                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(event) =>
                    updateFilter(
                      "date_to",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Attendance Records
            </h2>

            <p className="text-xs text-gray-500">
              {filteredAttendance.length} record
              {filteredAttendance.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

              <span className="text-sm">
                Loading attendance...
              </span>
            </div>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <CalendarDays className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="font-semibold text-gray-900">
              No attendance records found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              No attendance records match the current filters.
              Try changing the filters or mark a new attendance
              record.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />

              Mark Attendance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
           
<div className="overflow-x-auto">
  <table className="w-full table-fixed md:table-auto">
    <thead className="bg-gray-50">
      <tr className="border-b border-gray-200 text-left">
        <th className="w-[52%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:w-auto md:px-4">
          Student
        </th>

        <th className="w-[23%] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:w-auto md:px-4">
          <span className="md:hidden">Status</span>
          <span className="hidden md:inline">Class</span>
        </th>

        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
          Subject
        </th>

        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
          Session / Term
        </th>

        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
          Date
        </th>

        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
          Status
        </th>

        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
          Check In
        </th>

        <th className="w-[25%] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 md:w-auto md:px-4">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {filteredAttendance.map((record) => {
        const student =
          record.student_name ||
          getStudentName(
            students.find(
              (item) =>
                String(item.id) === String(record.student),
            ),
          ) ||
          `Student #${record.student}`;

        const className =
          record.class_name ||
          record.class_level_name ||
          getClassName(record) ||
          "—";

        return (
          <tr
            key={record.id}
            className="transition hover:bg-gray-50"
          >
            {/* Student */}
            <td className="break-words px-3 py-4 md:px-4">
              <div className="break-words text-sm font-medium text-gray-900">
                {student}
              </div>

              {(record.admission_number ||
                record.student_admission_number) && (
                <div className="mt-0.5 break-all text-xs text-gray-500">
                  {record.admission_number ||
                    record.student_admission_number}
                </div>
              )}

              {/* Additional class details on desktop */}
              <div className="mt-1 hidden text-xs text-gray-500 md:block">
                {className}
              </div>
            </td>

            {/* Mobile: Status | Desktop: Class */}
            <td className="px-2 py-4 md:px-4">
              <span className="md:hidden">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold ${getStatusClasses(
                    record.status,
                  )}`}
                >
                  {getStatusLabel(record)}
                </span>
              </span>

              <span className="hidden text-sm text-gray-700 md:inline">
                {className}
              </span>
            </td>

            {/* Subject: desktop only */}
            <td className="hidden px-4 py-4 text-sm text-gray-700 md:table-cell">
              {getSubjectName(record)}
            </td>

            {/* Session / Term: desktop only */}
            <td className="hidden px-4 py-4 md:table-cell">
              <div className="text-sm text-gray-800">
                {getSessionName(record)}
              </div>

              <div className="text-xs text-gray-500">
                {getTermName(record)}
              </div>
            </td>

            {/* Date: desktop only */}
            <td className="hidden px-4 py-4 text-sm text-gray-700 md:table-cell">
              {formatDate(record.date)}
            </td>

            {/* Status: desktop only */}
            <td className="hidden px-4 py-4 md:table-cell">
              <span
                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                  record.status,
                )}`}
              >
                {getStatusLabel(record)}
              </span>
            </td>

            {/* Check In: desktop only */}
            <td className="hidden px-4 py-4 text-sm text-gray-600 md:table-cell">
              {formatTime(record.check_in_time)}
            </td>

            {/* Actions */}
            <td className="px-2 py-4 md:px-4">
              <div className="flex items-center justify-end gap-1.5 md:gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(record)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  title="Edit attendance"
                  aria-label={`Edit attendance for ${student}`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(record)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Delete attendance"
                  aria-label={`Delete attendance for ${student}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


          </div>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId
                    ? "Edit Attendance"
                    : "Mark Attendance"}
                </h2>

                <p className="text-sm text-gray-500">
                  {editingId
                    ? "Update the attendance record."
                    : "Record attendance for a student."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(95vh-140px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                {/* Student */}

                <FormField
                  label="Student"
                  required
                >
                  <select
                    value={form.student}
                    onChange={(event) =>
                      handleStudentChange(
                        event.target.value,
                      )
                    }
                    disabled={loadingOptions || saving}
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map((student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {getStudentName(student)}
                        {student.admission_number
                          ? ` — ${student.admission_number}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Session */}

                <FormField
                  label="Academic Session"
                  required
                >
                  <select
                    value={form.academic_session}
                    onChange={(event) =>
                      updateForm(
                        "academic_session",
                        event.target.value,
                      )
                    }
                    disabled={loadingOptions || saving}
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select session
                    </option>

                    {sessions.map((session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {session.name ||
                          session.session_name ||
                          `Session ${session.id}`}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Term */}

                <FormField label="Term" required>
                  <select
                    value={form.term}
                    onChange={(event) =>
                      updateForm(
                        "term",
                        event.target.value,
                      )
                    }
                    disabled={loadingOptions || saving}
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select term
                    </option>

                    {terms.map((term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.name ||
                          term.term_name ||
                          `Term ${term.id}`}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Class */}

                <FormField label="Class" required>
                  <select
                    value={form.class_level}
                    onChange={(event) =>
                      updateForm(
                        "class_level",
                        event.target.value,
                      )
                    }
                    disabled={loadingOptions || saving}
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select class
                    </option>

                    {classLevels.map((classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name ||
                          classLevel.class_name ||
                          `Class ${classLevel.id}`}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Subject */}

                <FormField label="Subject">
                  <select
                    value={form.subject}
                    onChange={(event) =>
                      updateForm(
                        "subject",
                        event.target.value,
                      )
                    }
                    disabled={loadingOptions || saving}
                    className="form-select"
                  >
                    <option value="">
                      General / Class Attendance
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name ||
                          subject.subject_name ||
                          `Subject ${subject.id}`}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Leave blank for general class attendance.
                  </p>
                </FormField>

                {/* Date */}

                <FormField label="Date" required>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      updateForm(
                        "date",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    className="form-input"
                    required
                  />
                </FormField>

                {/* Status */}

                <FormField label="Status" required>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    className="form-select"
                    required
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Check in */}

                <FormField label="Check-in Time">
                  <input
                    type="time"
                    value={form.check_in_time}
                    onChange={(event) =>
                      updateForm(
                        "check_in_time",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    className="form-input"
                  />
                </FormField>

                {/* Check out */}

                <FormField label="Check-out Time">
                  <input
                    type="time"
                    value={form.check_out_time}
                    onChange={(event) =>
                      updateForm(
                        "check_out_time",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    className="form-input"
                  />
                </FormField>

                {/* Remarks */}

                <div className="md:col-span-2">
                  <FormField label="Remarks">
                    <textarea
                      value={form.remarks}
                      onChange={(event) =>
                        updateForm(
                          "remarks",
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      rows={4}
                      placeholder="Optional attendance remarks..."
                      className="form-textarea"
                    />
                  </FormField>
                </div>
              </div>

              {/* Modal footer */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loadingOptions}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Attendance"
                      : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          LOCAL FORM STYLES
      ====================================================== */}

      <style>{`
        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgb(224 231 255);
        }

        .form-input:disabled,
        .form-select:disabled,
        .form-textarea:disabled {
          background: rgb(249 250 251);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  getValue = (item) => item.id,
  getLabel = (item) => item.name,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((item) => (
          <option
            key={getValue(item)}
            value={getValue(item)}
          >
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}



