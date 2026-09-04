import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDepartments,
  deleteDepartment,
  updateDepartment,
} from "../../../services/academicsService";

const AllDepartments = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDepartment(id);

      setDepartments((prev) =>
        prev.filter((department) => department.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete department:", err);
      alert("Failed to delete department.");
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      const updatedDepartment = await updateDepartment(
        department.id,
        {
          school: Number(department.school),
          name: department.name,
          code: department.code,
          description: department.description || "",
          head_name: department.head_name || "",
          is_active: !department.is_active,
        },
      );

      setDepartments((prev) =>
        prev.map((item) =>
          item.id === department.id
            ? updatedDepartment
            : item,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to update department status:",
        err,
      );

      alert("Failed to update department status.");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading departments...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Departments
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Departments
          </h1>

          <p className="text-sm text-slate-500">
            Manage school departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/departments/add")}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add Department
        </button>
      </div>

      {/* Department Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {departments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">
              No departments found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/departments/add")
              }
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first department
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Head
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {department.name}
                        </p>

                        {department.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {department.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {department.code}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {department.head_name || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(department)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          department.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {department.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/departments/${department.id}`,
                            )
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/departments/${department.id}/edit`,
                            )
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(department.id)
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
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

export default AllDepartments;