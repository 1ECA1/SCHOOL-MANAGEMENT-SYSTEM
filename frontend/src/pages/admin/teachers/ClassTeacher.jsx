import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../services/api";

const ClassTeacher = () => {
  const { id } = useParams();

  const [teachers, setTeachers] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    teacher: "",
    class_level: "",
    academic_session: "",
    is_active: true,
  });

  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      setFormData((previousData) => ({
        ...previousData,
        teacher: id,
      }));
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teachersResponse,
        classLevelsResponse,
        sessionsResponse,
        assignmentsResponse,
      ] = await Promise.all([
        api.get("/teachers/"),
        api.get("/academics/class-levels/"),
        api.get("/academics/sessions/"),
        api.get("/teachers/assign-class/"),
      ]);

      // Teachers
      const teachersData = Array.isArray(teachersResponse.data)
        ? teachersResponse.data
        : teachersResponse.data.results || [];

      setTeachers(teachersData);

      // Class Levels
      const classLevelsData = Array.isArray(
        classLevelsResponse.data
      )
        ? classLevelsResponse.data
        : classLevelsResponse.data.results || [];

      setClassLevels(classLevelsData);

      // Academic Sessions
      const sessionsData = Array.isArray(sessionsResponse.data)
        ? sessionsResponse.data
        : sessionsResponse.data.results || [];

      setAcademicSessions(sessionsData);

      // Class Teacher Assignments
      const assignmentsData = Array.isArray(
        assignmentsResponse.data
      )
        ? assignmentsResponse.data
        : assignmentsResponse.data.results || [];

      setAssignments(assignmentsData);
    } catch (error) {
      console.error(
        "Error loading class teacher data:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load class teacher data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // ASSIGN CLASS TEACHER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post("/teachers/assign-class/", {
        teacher: Number(formData.teacher),
        class_level: Number(formData.class_level),
        academic_session: Number(formData.academic_session),
        is_active: formData.is_active,
      });

      setSuccess("Class teacher assigned successfully.");

      setFormData({
        teacher: "",
        class_level: "",
        academic_session: "",
        is_active: true,
      });

      await fetchData();
    } catch (error) {
      console.error(
        "Error assigning class teacher:",
        error
      );

      const data = error.response?.data;

      let errorMessage = "Failed to assign class teacher.";

      if (typeof data === "object" && data !== null) {
        errorMessage = Object.entries(data)
          .map(([key, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : value;

            return `${key}: ${message}`;
          })
          .join(", ");
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // REMOVE / DEACTIVATE ASSIGNMENT
  // ==========================================
  const handleDelete = async (assignmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this class teacher assignment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/teachers/assign-class/${assignmentId}/`
      );

      setAssignments((previousAssignments) =>
        previousAssignments.filter(
          (assignment) => assignment.id !== assignmentId
        )
      );

      setSuccess(
        "Class teacher assignment removed successfully."
      );
    } catch (error) {
      console.error(
        "Error removing class teacher:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to remove class teacher assignment."
      );
    }
  };

  // ==========================================
  // GET TEACHER NAME
  // ==========================================
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(
      (item) => Number(item.id) === Number(teacherId)
    );

    return teacher ? teacher.full_name : "Unknown Teacher";
  };

  // ==========================================
  // GET CLASS NAME
  // ==========================================
  const getClassName = (classId) => {
    const classLevel = classLevels.find(
      (item) => Number(item.id) === Number(classId)
    );

    return classLevel ? classLevel.name : "Unknown Class";
  };

  // ==========================================
  // GET SESSION NAME
  // ==========================================
  const getSessionName = (sessionId) => {
    const session = academicSessions.find(
      (item) => Number(item.id) === Number(sessionId)
    );

    return session ? session.name : "Unknown Session";
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading class teachers...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] md:p-6">
      {/* ======================================
          HEADER
      ====================================== */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Assign Class Teacher
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Assign teachers to classes for an academic session.
          </p>
        </div>

        <Link
          to="/admin/teachers"
          className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:border-slate-700"
        >
          ← Back to Teachers
        </Link>
      </div>

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}
      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* ======================================
          ASSIGNMENT FORM
      ====================================== */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700 md:p-6">
        <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
          Assign New Class Teacher
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* TEACHER */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Teacher *
            </label>

            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
            >
              <option value="">Select Teacher</option>

              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                  {teacher.employee_id
                    ? ` (${teacher.employee_id})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* CLASS LEVEL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Class *
            </label>

            <select
              name="class_level"
              value={formData.class_level}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
            >
              <option value="">Select Class</option>

              {classLevels.map((classLevel) => (
                <option
                  key={classLevel.id}
                  value={classLevel.id}
                >
                  {classLevel.name}
                </option>
              ))}
            </select>
          </div>

          {/* ACADEMIC SESSION */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Academic Session *
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-slate-700"
            >
              <option value="">
                Select Academic Session
              </option>

              {academicSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                  {session.is_current ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIVE */}
          <div className="flex items-center gap-3 md:pt-8">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 accent-[var(--color-primary)]"
            />

            <label
              htmlFor="is_active"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Active class teacher assignment
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {submitting
                ? "Assigning..."
                : "Assign Class Teacher"}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================
          EXISTING ASSIGNMENTS
      ====================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
        <div className="border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Class Teacher Assignments
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Teachers currently assigned to classes.
              </p>
            </div>

            <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
              {assignments.length}
            </span>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">
              No class teacher assignments found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-background)]">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Teacher
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Class
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Academic Session
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-t border-slate-100 dark:border-slate-700"
                  >
                    {/* TEACHER */}
                    <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                      {getTeacherName(assignment.teacher)}
                    </td>

                    {/* CLASS */}
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {getClassName(assignment.class_level)}
                    </td>

                    {/* SESSION */}
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {getSessionName(
                        assignment.academic_session
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {assignment.is_active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(assignment.id)
                        }
                        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassTeacher;