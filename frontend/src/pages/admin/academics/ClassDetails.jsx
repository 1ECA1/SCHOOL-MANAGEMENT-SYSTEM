import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClassLevel,
  getDepartments,
} from "../../../services/academicsService";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classLevel, setClassLevel] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const [classData, departmentsData] = await Promise.all([
          getClassLevel(id),
          getDepartments(),
        ]);

        setClassLevel(classData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to load class:", err);
        setError("Failed to load class details.");
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, [id]);

  const getDepartmentName = () => {
    if (!classLevel?.department) {
      return "No department";
    }

    const department = departments.find(
      (item) => item.id === classLevel.department,
    );

    return department ? department.name : "Unknown department";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
          <p className="text-gray-700 dark:text-gray-200">
            Loading class details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="mt-4 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  if (!classLevel) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
          <p className="text-gray-700 dark:text-gray-200">
            Class not found.
          </p>
        </div>
      </div>
    );
  }

  const students = Array.isArray(classLevel.students)
    ? classLevel.students
    : [];

  const studentCount =
    typeof classLevel.student_count === "number"
      ? classLevel.student_count
      : students.length;

  const capacity = Number(classLevel.capacity || 0);

  const availableSpaces = Math.max(
    capacity - studentCount,
    0,
  );

  return (
    <div className="w-full p-4 sm:p-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Class Details
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View information about this class level.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="w-fit rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back to Classes
        </button>
      </div>

      {/* =====================================================
          CLASS INFORMATION CARD
      ====================================================== */}
      <div className="mb-6 w-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* CARD HEADER */}
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {classLevel.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Class Code: {classLevel.code}
            </p>
          </div>

          {/* TOTAL STUDENTS */}
          <div className="flex items-center gap-4 rounded-xl bg-blue-50 px-5 py-3 dark:bg-blue-900/20">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Total Students
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {studentCount}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            CLASS DETAILS GRID
        ================================================== */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2 xl:grid-cols-3">
          {/* CLASS NAME */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Class Name
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {classLevel.name}
            </p>
          </div>

          {/* CLASS CODE */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Class Code
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {classLevel.code}
            </p>
          </div>

          {/* EDUCATION LEVEL */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Education Level
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {classLevel.education_level || "—"}
            </p>
          </div>

          {/* DEPARTMENT */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Department
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {getDepartmentName()}
            </p>
          </div>

          {/* CAPACITY */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Capacity
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {capacity}
            </p>
          </div>

          {/* AVAILABLE SPACES */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available Spaces
            </p>

            <p className="mt-1 font-medium text-gray-800 dark:text-gray-100">
              {availableSpaces}
            </p>
          </div>

          {/* STATUS */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                classLevel.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {classLevel.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2 xl:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Description
            </p>

            <p className="mt-1 text-gray-800 dark:text-gray-100">
              {classLevel.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}
        <div className="flex flex-wrap gap-3 border-t border-gray-200 px-6 py-5 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(`/admin/classes/${id}/edit`)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Edit Class
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/classes")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* =====================================================
          STUDENTS CARD
      ====================================================== */}
      <div className="w-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* STUDENTS HEADER */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Students in this Class
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Students currently enrolled in {classLevel.name}.
            </p>
          </div>

          <div className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            {studentCount}{" "}
            {studentCount === 1 ? "Student" : "Students"}
          </div>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================== */}
        {students.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg
                className="h-7 w-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-800 dark:text-white">
              No students enrolled
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There are currently no students enrolled in this class.
            </p>
          </div>
        ) : (
          /* =================================================
             STUDENTS TABLE
          ================================================== */
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="w-32 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Roll No.
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Student Name
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Admission No.
                  </th>

                  <th
                    scope="col"
                    className="w-40 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr
                    key={
                      student.enrollment_id ||
                      student.student_id
                    }
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    {/* ROLL NUMBER */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">
                      {student.roll_number ?? "—"}
                    </td>

                    {/* STUDENT NAME */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {student.full_name || "—"}
                      </p>
                    </td>

                    {/* ADMISSION NUMBER */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {student.admission_number || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {student.status || "—"}
                      </span>
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

export default ClassDetails;