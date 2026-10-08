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
      const teachersData = Array.isArray(
        teachersResponse.data
      )
        ? teachersResponse.data
        : teachersResponse.data?.results || [];

      setTeachers(teachersData);

      // Class Levels
      const classLevelsData = Array.isArray(
        classLevelsResponse.data
      )
        ? classLevelsResponse.data
        : classLevelsResponse.data?.results || [];

      setClassLevels(classLevelsData);

      // Academic Sessions
      const sessionsData = Array.isArray(
        sessionsResponse.data
      )
        ? sessionsResponse.data
        : sessionsResponse.data?.results || [];

      setAcademicSessions(sessionsData);

      // Class Teacher Assignments
      const assignmentsData = Array.isArray(
        assignmentsResponse.data
      )
        ? assignmentsResponse.data
        : assignmentsResponse.data?.results || [];

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
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
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

      await api.post(
        "/teachers/assign-class/",
        {
          teacher: Number(formData.teacher),
          class_level: Number(
            formData.class_level
          ),
          academic_session: Number(
            formData.academic_session
          ),
          is_active: formData.is_active,
        }
      );

      setSuccess(
        "Class teacher assigned successfully."
      );

      // Keep the current teacher selected
      // because this page is opened from a teacher.
      setFormData({
        teacher: id || "",
        class_level: "",
        academic_session: "",
        is_active: true,
      });

      // Refresh assignments
      await fetchData();
    } catch (error) {
      console.error(
        "Error assigning class teacher:",
        error
      );

      const data = error.response?.data;

      let errorMessage =
        "Failed to assign class teacher.";

      if (
        typeof data === "object" &&
        data !== null
      ) {
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
  // REMOVE ASSIGNMENT
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

      setAssignments(
        (previousAssignments) =>
          previousAssignments.filter(
            (assignment) =>
              assignment.id !== assignmentId
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
      (item) =>
        Number(item.id) === Number(teacherId)
    );

    return teacher
      ? teacher.full_name
      : "Unknown Teacher";
  };

  // ==========================================
  // GET CLASS NAME
  // ==========================================
  const getClassName = (classId) => {
    const classLevel = classLevels.find(
      (item) =>
        Number(item.id) === Number(classId)
    );

    return classLevel
      ? classLevel.name
      : "Unknown Class";
  };

  // ==========================================
  // GET SESSION NAME
  // ==========================================
  const getSessionName = (sessionId) => {
    const session = academicSessions.find(
      (item) =>
        Number(item.id) === Number(sessionId)
    );

    return session
      ? session.name
      : "Unknown Session";
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400">
          Loading class teachers...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="p-4 md:p-6">

      {/* ======================================
          HEADER
      ====================================== */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Assign Class Teacher
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Assign teachers to classes for an academic session.
          </p>
        </div>

        <Link
          to="/school-admin/people/teachers"
          className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Back to Teachers
        </Link>

      </div>

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* ======================================
          ASSIGNMENT FORM
      ====================================== */}
      <div className="mb-8 rounded-xl bg-white p-5 shadow dark:bg-slate-900 md:p-6">

        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
          Assign New Class Teacher
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >

          {/* TEACHER */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Teacher *
            </label>

            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">
                Select Teacher
              </option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
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
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Class *
            </label>

            <select
              name="class_level"
              value={formData.class_level}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">
                Select Class
              </option>

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
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Academic Session *
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">
                Select Academic Session
              </option>

              {academicSessions.map((session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
                  {session.name}
                  {session.is_current
                    ? " (Current)"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIVE */}
          <div className="flex items-center gap-3">

            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />

            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Active class teacher assignment
            </label>

          </div>

          {/* SUBMIT BUTTON */}
          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
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
      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-slate-900">

        <div className="border-b border-gray-200 p-5 dark:border-slate-800">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Class Teacher Assignments
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Teachers currently assigned to classes.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {assignments.length}
            </span>

          </div>

        </div>

        {/* NO ASSIGNMENTS */}
        {assignments.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-slate-400">
            <p className="text-sm">
              No class teacher assignments found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-gray-50 dark:bg-slate-950">

                <tr>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-300">
                    Teacher
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-300">
                    Class
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-300">
                    Academic Session
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-600 dark:text-slate-300">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-t border-gray-100 dark:border-slate-800"
                  >

                    {/* TEACHER */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                      {getTeacherName(
                        assignment.teacher
                      )}
                    </td>

                    {/* CLASS */}
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {getClassName(
                        assignment.class_level
                      )}
                    </td>

                    {/* SESSION */}
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-400">
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
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}

                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            assignment.id
                          )
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
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