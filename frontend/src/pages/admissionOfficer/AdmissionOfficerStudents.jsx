import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function AdmissionOfficerStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const getToken = () =>
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken");

  const fetchStudents = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/students/`, {
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load students.");
      }

      /*
       * DRF may return either:
       *
       * [...]
       *
       * or:
       *
       * {
       *   count: 10,
       *   results: [...]
       * }
       */
      const results = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setStudents(results);
    } catch (err) {
      console.error("Admission Officer students error:", err);

      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName =
        student.full_name ||
        [student.first_name, student.middle_name, student.last_name]
          .filter(Boolean)
          .join(" ");

      const matchesSearch =
        !query ||
        fullName.toLowerCase().includes(query) ||
        String(student.admission_number || "")
          .toLowerCase()
          .includes(query) ||
        String(student.email || "")
          .toLowerCase()
          .includes(query) ||
        String(student.phone_number || "")
          .toLowerCase()
          .includes(query);

      const studentStatus = String(student.status || "").toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" || studentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => String(student.status).toUpperCase() === "ACTIVE",
  ).length;

  const graduatedStudents = students.filter(
    (student) => String(student.status).toUpperCase() === "GRADUATED",
  ).length;

  const inactiveStudents = students.filter((student) =>
    ["SUSPENDED", "WITHDRAWN", "TRANSFERRED"].includes(
      String(student.status).toUpperCase(),
    ),
  ).length;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStudentName = (student) => {
    if (student.full_name) {
      return student.full_name;
    }

    return [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(" ");
  };

  const getClassName = (student) => {
    return (
      student.class_level_name ||
      student.class_name ||
      student.current_class_name ||
      student.current_enrollment?.class_level_name ||
      student.current_enrollment?.class_name ||
      "—"
    );
  };

  const getDepartmentName = (student) => {
    return student.department_name || student.department?.name || "—";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClasses = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

      case "GRADUATED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

      case "SUSPENDED":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      case "TRANSFERRED":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";

      case "WITHDRAWN":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Admission Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage students in your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchStudents(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[var(--color-card)] dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {refreshing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Unable to load students</p>

            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />

        <StatCard
          title="Active Students"
          value={activeStudents}
          icon={UserCheck}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />

        <StatCard
          title="Graduated"
          value={graduatedStudents}
          icon={GraduationCap}
          iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
        />

        <StatCard
          title="Other Status"
          value={inactiveStudents}
          icon={UserX}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, admission number, email or phone..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:ring-blue-900/30"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">All Students</option>

              <option value="ACTIVE">Active</option>

              <option value="GRADUATED">Graduated</option>

              <option value="TRANSFERRED">Transferred</option>

              <option value="SUSPENDED">Suspended</option>

              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2
                size={24}
                className="animate-spin text-[var(--color-primary)]"
              />

              <span className="text-sm font-medium">Loading students...</span>
            </div>
          </div>
        ) : paginatedStudents.length === 0 ? (
          <EmptyState
            hasFilters={Boolean(search.trim()) || statusFilter !== "ALL"}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admission No.
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Gender
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      getStudentName={getStudentName}
                      getClassName={getClassName}
                      getDepartmentName={getDepartmentName}
                      getStatusLabel={getStatusLabel}
                      getStatusClasses={getStatusClasses}
                      formatDate={formatDate}
                      onView={() =>
                        navigate(`/admission-officer/students/${student.id}`)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
              {paginatedStudents.map((student) => (
                <MobileStudentCard
                  key={student.id}
                  student={student}
                  getStudentName={getStudentName}
                  getClassName={getClassName}
                  getDepartmentName={getDepartmentName}
                  getStatusLabel={getStatusLabel}
                  getStatusClasses={getStatusClasses}
                  formatDate={formatDate}
                  onView={() =>
                    navigate(`/admission-officer/students/${student.id}`)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {Math.min(currentPage * pageSize, filteredStudents.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredStudents.length}
                </span>{" "}
                students
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] px-3 text-sm font-semibold text-white">
                  {currentPage}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function StudentRow({
  student,
  getStudentName,
  getClassName,
  getDepartmentName,
  getStatusLabel,
  getStatusClasses,
  formatDate,
  onView,
}) {
  return (
    <tr className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <StudentAvatar student={student} getStudentName={getStudentName} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {getStudentName(student) || "Unnamed Student"}
            </p>

            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {student.email ||
                student.phone_number ||
                "No contact information"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        {student.admission_number || "—"}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
        {getClassName(student)}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
        {getDepartmentName(student)}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
        {student.gender
          ? student.gender === "MALE"
            ? "Male"
            : student.gender === "FEMALE"
              ? "Female"
              : student.gender
          : "—"}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
            student.status,
          )}`}
        >
          {getStatusLabel(student.status)}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
        >
          <Eye size={17} />
          View
        </button>
      </td>
    </tr>
  );
}

function MobileStudentCard({
  student,
  getStudentName,
  getClassName,
  getDepartmentName,
  getStatusLabel,
  getStatusClasses,
  formatDate,
  onView,
}) {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <StudentAvatar student={student} getStudentName={getStudentName} />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {getStudentName(student) || "Unnamed Student"}
            </p>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {student.admission_number || "No admission number"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
            student.status,
          )}`}
        >
          {getStatusLabel(student.status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <MobileInfo label="Class" value={getClassName(student)} />

        <MobileInfo label="Department" value={getDepartmentName(student)} />

        <MobileInfo
          label="Gender"
          value={
            student.gender === "MALE"
              ? "Male"
              : student.gender === "FEMALE"
                ? "Female"
                : student.gender || "—"
          }
        />

        <MobileInfo
          label="Admission Date"
          value={formatDate(student.admission_date)}
        />
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Eye size={17} />
        View Student
      </button>
    </div>
  );
}

function StudentAvatar({ student, getStudentName }) {
  const name = getStudentName(student) || "Student";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const image = student.profile_image || student.user?.profile_image;

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`
    : null;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
      {initials || "ST"}
    </div>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Users size={30} />
      </div>

      <h3 className="mt-5 text-lg font-bold">No Students Found</h3>

      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {hasFilters
          ? "No students match your current search or filter."
          : "There are no students available for this school yet."}
      </p>
    </div>
  );
}

export default AdmissionOfficerStudents;
