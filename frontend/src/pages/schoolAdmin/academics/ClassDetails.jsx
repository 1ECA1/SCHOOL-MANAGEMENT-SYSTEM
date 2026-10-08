import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Users,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getClassLevel,
  getDepartments,
} from "../../../services/academicsService";

const EDUCATION_LEVEL_LABELS = {
  PRIMARY: "Primary",
  JSS: "Junior Secondary (JSS)",
  SS: "Senior Secondary (SS)",
};

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classLevel, setClassLevel] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD CLASS
  // =========================================================

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const [classData, departmentsData] = await Promise.all([
          getClassLevel(id),
          getDepartments(),
        ]);

        const normalizedDepartments = Array.isArray(
          departmentsData,
        )
          ? departmentsData
          : departmentsData?.results || [];

        setClassLevel(classData);
        setDepartments(normalizedDepartments);
      } catch (err) {
        console.error("Failed to load class:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load class details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, [id]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getDepartmentName = () => {
    if (
      classLevel?.department === null ||
      classLevel?.department === undefined ||
      classLevel?.department === ""
    ) {
      return "No department";
    }

    const department = departments.find(
      (item) =>
        Number(item.id) === Number(classLevel.department),
    );

    return department
      ? department.name
      : "Unknown department";
  };

  const getEducationLevel = () => {
    return (
      EDUCATION_LEVEL_LABELS[classLevel?.education_level] ||
      classLevel?.education_level ||
      "—"
    );
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <span>Loading class details...</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <h2 className="font-semibold">
                Unable to load class
              </h2>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/academics/classes")
          }
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={17} />
          Back to Classes
        </button>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!classLevel) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <GraduationCap
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            Class not found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The requested class could not be found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/academics/classes")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // CLASS DATA
  // =========================================================

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

  const isFull =
    capacity > 0 && studentCount >= capacity;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Class Details
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View information about this class level.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/academics/classes")
          }
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={17} />
          Back to Classes
        </button>
      </div>

      {/* =====================================================
          CLASS INFORMATION CARD
      ====================================================== */}

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* CARD HEADER */}

        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {classLevel.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Class Code: {classLevel.code}
            </p>
          </div>

          {/* TOTAL STUDENTS */}

          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-5 py-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Users size={20} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Total Students
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-700">
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
            <p className="text-sm text-gray-500">
              Class Name
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {classLevel.name}
            </p>
          </div>

          {/* CLASS CODE */}

          <div>
            <p className="text-sm text-gray-500">
              Class Code
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {classLevel.code}
            </p>
          </div>

          {/* EDUCATION LEVEL */}

          <div>
            <p className="text-sm text-gray-500">
              Education Level
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {getEducationLevel()}
            </p>
          </div>

          {/* DEPARTMENT */}

          <div>
            <p className="text-sm text-gray-500">
              Department
            </p>

            <div className="mt-1 flex items-center gap-2">
              {classLevel.department && (
                <Building2
                  size={16}
                  className="text-gray-400"
                />
              )}

              <p className="font-medium text-gray-900">
                {getDepartmentName()}
              </p>
            </div>
          </div>

          {/* CAPACITY */}

          <div>
            <p className="text-sm text-gray-500">
              Capacity
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {capacity}
            </p>
          </div>

          {/* AVAILABLE SPACES */}

          <div>
            <p className="text-sm text-gray-500">
              Available Spaces
            </p>

            <p
              className={`mt-1 font-medium ${
                isFull
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {availableSpaces}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                classLevel.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {classLevel.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          {/* DESCRIPTION */}

          <div className="md:col-span-2 xl:col-span-2">
            <p className="text-sm text-gray-500">
              Description
            </p>

            <p className="mt-1 text-gray-900">
              {classLevel.description ||
                "No description provided."}
            </p>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className="flex flex-wrap gap-3 border-t border-gray-200 px-6 py-5">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/school-admin/academics/classes/${id}/edit`,
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Pencil size={17} />
            Edit Class
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/academics/classes")
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>
      </div>

      {/* =====================================================
          STUDENTS CARD
      ====================================================== */}

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* STUDENTS HEADER */}

        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Students in this Class
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Students currently enrolled in{" "}
              {classLevel.name}.
            </p>
          </div>

          <div className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            {studentCount}{" "}
            {studentCount === 1
              ? "Student"
              : "Students"}
          </div>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {students.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Users
                size={28}
                className="text-gray-400"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-800">
              No students enrolled
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no students enrolled
              in this class.
            </p>
          </div>
        ) : (
          /* =================================================
             STUDENTS TABLE
          ================================================== */

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="w-32 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Roll No.
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Student Name
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Admission No.
                  </th>

                  <th
                    scope="col"
                    className="w-40 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr
                    key={
                      student.enrollment_id ||
                      student.student_id
                    }
                    className="transition hover:bg-gray-50"
                  >
                    {/* ROLL NUMBER */}

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800">
                      {student.roll_number ?? "—"}
                    </td>

                    {/* STUDENT NAME */}

                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {student.full_name || "—"}
                      </p>
                    </td>

                    {/* ADMISSION NUMBER */}

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {student.admission_number || "—"}
                    </td>

                    {/* STATUS */}

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
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