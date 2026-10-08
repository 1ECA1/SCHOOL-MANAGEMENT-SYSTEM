import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getClassLevels,
  getDepartments,
  deleteClassLevel,
  updateClassLevel,
} from "../../../services/academicsService";

const AllClasses = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------
  // Get department name from department ID
  // ---------------------------------------
  const getDepartmentName = (departmentId) => {
    if (!departmentId) {
      return "—";
    }

    const department = departments.find(
      (item) => Number(item.id) === Number(departmentId)
    );

    return department ? department.name : "—";
  };

  // ---------------------------------------
  // Delete class
  // ---------------------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteClassLevel(id);

      setClasses((prev) =>
        prev.filter((classLevel) => classLevel.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Failed to delete class.");
    }
  };

  // ---------------------------------------
  // Toggle class status
  // ---------------------------------------
  const handleToggleStatus = async (classLevel) => {
    try {
      const updatedClass = await updateClassLevel(classLevel.id, {
        school: Number(classLevel.school),
        name: classLevel.name,
        code: classLevel.code,
        description: classLevel.description || "",
        department: classLevel.department
          ? Number(classLevel.department)
          : null,
        capacity: Number(classLevel.capacity),
        is_active: !classLevel.is_active,
      });

      setClasses((prev) =>
        prev.map((item) =>
          item.id === classLevel.id ? updatedClass : item
        )
      );
    } catch (err) {
      console.error("Failed to update class status:", err);
      alert("Failed to update class status.");
    }
  };

  // ---------------------------------------
  // Load classes and departments
  // ---------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [classesData, departmentsData] = await Promise.all([
          getClassLevels(),
          getDepartments(),
        ]);

        setClasses(classesData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to load classes or departments:", err);
        setError("Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">
            All Classes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your school class levels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes/add")}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Class
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Loading classes...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* Number */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
                    #
                  </th>

                  {/* Class */}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:px-5">
                    Class Name
                  </th>

                  {/* Code */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
                    Code
                  </th>

                  {/* Department */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
                    Department
                  </th>

                  {/* Capacity */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
                    Capacity
                  </th>

                  {/* Status */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
                    Status
                  </th>

                  {/* Actions */}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:px-5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No classes found.
                    </td>
                  </tr>
                ) : (
                  classes.map((classLevel, index) => (
                    <tr key={classLevel.id}>
                      {/* Number */}
                      <td className="hidden px-5 py-4 text-sm text-gray-600 md:table-cell">
                        {index + 1}
                      </td>

                      {/* Class Name */}
                      <td className="px-4 py-4 md:px-5">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800">
                            {classLevel.name}
                          </p>

                          {/* Code shown only on mobile */}
                          {classLevel.code && (
                            <p className="mt-1 text-xs font-medium text-gray-400 md:hidden">
                              {classLevel.code}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="hidden px-5 py-4 text-sm text-gray-600 md:table-cell">
                        {classLevel.code}
                      </td>

                      {/* Department */}
                      <td className="hidden px-5 py-4 text-sm text-gray-600 md:table-cell">
                        {getDepartmentName(classLevel.department)}
                      </td>

                      {/* Capacity */}
                      <td className="hidden px-5 py-4 text-sm text-gray-600 md:table-cell">
                        {classLevel.capacity}
                      </td>

                      {/* Status */}
                      <td className="hidden px-5 py-4 md:table-cell">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(classLevel)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            classLevel.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {classLevel.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 md:px-5">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/classes/${classLevel.id}`
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                            title="View class"
                            aria-label="View class"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.514 7.756 7.466 5 12 5s8.486 2.756 9.938 6.652a1 1 0 0 1 0 .696C20.486 16.244 16.534 19 12 19s-8.486-2.756-9.938-6.652Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/classes/${classLevel.id}/edit`
                              )
                            }
                            className="hidden h-9 w-9 items-center justify-center rounded-lg text-yellow-600 transition hover:bg-yellow-50 md:inline-flex"
                            title="Edit class"
                            aria-label="Edit class"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(classLevel.id)
                            }
                            className="hidden h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 md:inline-flex"
                            title="Delete class"
                            aria-label="Delete class"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllClasses;