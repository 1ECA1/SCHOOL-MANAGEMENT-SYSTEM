import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";

const STATUS_ORDER = {
  ACTIVE: 1,
  ON_LEAVE: 2,
  SUSPENDED: 3,
  RESIGNED: 4,
  RETIRED: 5,
};

const STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "ON_LEAVE",
    label: "On Leave",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
  },
  {
    value: "RESIGNED",
    label: "Resigned",
  },
  {
    value: "RETIRED",
    label: "Retired",
  },
];

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Delete state
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status state
  const [statusTeacher, setStatusTeacher] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/teachers/");

      // Support both normal array response and paginated response
      const teacherData = Array.isArray(data)
        ? data
        : data.results || [];

      setTeachers(teacherData);
    } catch (error) {
      console.error("Error fetching teachers:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch teachers.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH + STATUS SORTING
  // =====================================================

  const filteredTeachers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    const filtered = teachers.filter((teacher) => {
      return (
        teacher.full_name?.toLowerCase().includes(searchText) ||
        teacher.employee_id?.toLowerCase().includes(searchText) ||
        teacher.email?.toLowerCase().includes(searchText) ||
        teacher.department_name
          ?.toLowerCase()
          .includes(searchText) ||
        teacher.phone_number
          ?.toLowerCase()
          .includes(searchText)
      );
    });

    return [...filtered].sort((a, b) => {
      const statusA = String(
        a.employment_status || "ACTIVE",
      ).toUpperCase();

      const statusB = String(
        b.employment_status || "ACTIVE",
      ).toUpperCase();

      const orderA = STATUS_ORDER[statusA] ?? 99;
      const orderB = STATUS_ORDER[statusB] ?? 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return String(a.full_name || "").localeCompare(
        String(b.full_name || ""),
      );
    });
  }, [teachers, search]);

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

      case "ON_LEAVE":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

      case "SUSPENDED":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

      case "RESIGNED":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

      case "RETIRED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const handleDeleteTeacher = async () => {
    if (!deleteTeacher) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/teachers/${deleteTeacher.id}/`);

      setTeachers((currentTeachers) =>
        currentTeachers.filter(
          (teacher) => teacher.id !== deleteTeacher.id,
        ),
      );

      setDeleteTeacher(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete teacher.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // OPEN STATUS MODAL
  // =====================================================

  const openStatusModal = (teacher) => {
    setStatusTeacher(teacher);
    setNewStatus(
      teacher.employment_status || "ACTIVE",
    );
    setError("");
  };

  // =====================================================
  // CHANGE STATUS
  // =====================================================

  const handleChangeStatus = async () => {
    if (!statusTeacher || !newStatus) {
      return;
    }

    try {
      setChangingStatus(true);
      setError("");

      const { data } = await api.patch(
        `/teachers/${statusTeacher.id}/`,
        {
          employment_status: newStatus,
        },
      );

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) =>
          teacher.id === statusTeacher.id
            ? {
                ...teacher,
                ...data,
                employment_status: newStatus,
              }
            : teacher,
        ),
      );

      setStatusTeacher(null);
      setNewStatus("");
    } catch (error) {
      console.error(
        "Error changing teacher status:",
        error,
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.employment_status?.[0] ||
          error.response?.data?.message ||
          "Failed to change teacher status.",
      );
    } finally {
      setChangingStatus(false);
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getProfileImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Teachers
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage teachers and their academic assignments
          </p>
        </div>

        <Link
          to="/admin/teachers/add"
          className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center font-medium text-white transition hover:opacity-90"
        >
          + Add Teacher
        </Link>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, employee ID, email, phone or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-3 text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
        />
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4 font-bold text-red-500 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          TEACHERS TABLE
      ================================================= */}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            Loading teachers...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            No teachers found.
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[var(--color-background)]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Teacher
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Employee ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Department
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTeachers.map((teacher) => {
                const status =
                  teacher.employment_status || "ACTIVE";

                const imageUrl = getProfileImageUrl(
                  teacher.profile_image,
                );

                return (
                  <tr
                    key={teacher.id}
                    className="border-t border-slate-100 transition hover:bg-[var(--color-background)] dark:border-slate-700"
                  >
                    {/* =================================================
                        TEACHER
                    ================================================= */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={teacher.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)]">
                            {teacher.first_name?.charAt(0)}
                            {teacher.last_name?.charAt(0)}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-[var(--color-text)]">
                            {teacher.full_name}
                          </p>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {teacher.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* =================================================
                        EMPLOYEE ID
                    ================================================= */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {teacher.employee_id}
                    </td>

                    {/* =================================================
                        DEPARTMENT
                    ================================================= */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {teacher.department_name || "Not assigned"}
                    </td>

                    {/* =================================================
                        CONTACT
                    ================================================= */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {teacher.phone_number || "Not available"}
                    </td>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          openStatusModal(teacher)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${getStatusStyle(
                          status,
                        )}`}
                        title="Change teacher status"
                      >
                        {status.replace("_", " ")}
                      </button>
                    </td>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {/* VIEW */}

                        <Link
                          to={`/admin/teachers/${teacher.id}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          View
                        </Link>

                        {/* EDIT */}

                        <Link
                          to={`/admin/teachers/${teacher.id}/edit`}
                          className="rounded-lg bg-[var(--color-primary)]/10 px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
                        >
                          Edit
                        </Link>

                        {/* SUBJECTS */}

                        <Link
                          to={`/admin/teachers/${teacher.id}/subjects`}
                          className="rounded-lg bg-[var(--color-secondary)]/10 px-3 py-2 text-sm font-medium text-cyan-700 transition hover:bg-[var(--color-secondary)]/20 dark:text-cyan-300"
                        >
                          Subjects
                        </Link>

                        {/* CLASS */}

                        <Link
                          to={`/admin/teachers/${teacher.id}/class`}
                          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                        >
                          Class
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTeacher(teacher)
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* =================================================
          COUNT
      ================================================= */}

      {!loading && (
        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredTeachers.length} teacher(s)
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 text-[var(--color-text)] shadow-xl dark:border-slate-700">
            <h2 className="mb-2 text-xl font-bold">
              Delete Teacher
            </h2>

            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete{" "}
              <strong className="text-[var(--color-text)]">
                {deleteTeacher.full_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTeacher(null)
                }
                disabled={deleting}
                className="rounded-lg border border-slate-200 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTeacher}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          STATUS MODAL
      ================================================= */}

      {statusTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 text-[var(--color-text)] shadow-xl dark:border-slate-700">
            <h2 className="mb-2 text-xl font-bold">
              Change Teacher Status
            </h2>

            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
              Change employment status for{" "}
              <strong className="text-[var(--color-text)]">
                {statusTeacher.full_name}
              </strong>
              .
            </p>

            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Employment Status
            </label>

            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value)
              }
              className="mb-6 w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusTeacher(null);
                  setNewStatus("");
                }}
                disabled={changingStatus}
                className="rounded-lg border border-slate-200 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleChangeStatus}
                disabled={changingStatus}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingStatus
                  ? "Saving..."
                  : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;