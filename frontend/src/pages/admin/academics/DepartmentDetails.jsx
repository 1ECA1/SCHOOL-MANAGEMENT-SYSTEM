import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDepartment } from "../../../services/academicsService";

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDepartment = async () => {
      try {
        const data = await getDepartment(id);
        setDepartment(data);
      } catch (err) {
        console.error("Failed to load department:", err);
        setError("Failed to load department.");
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading department...
      </div>
    );
  }

  if (error || !department) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/departments")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Departments
        </button>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error || "Department not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/departments")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Departments
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {department.name}
            </h1>

            <p className="text-sm text-slate-500">
              Department Code: {department.code}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/departments/${department.id}/edit`)
            }
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Edit Department
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Department Name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Department Name
            </p>

            <p className="mt-1 text-base font-medium text-slate-800">
              {department.name}
            </p>
          </div>

          {/* Code */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Code
            </p>

            <p className="mt-1 text-base font-medium text-slate-800">
              {department.code}
            </p>
          </div>

          {/* School */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              School
            </p>

            <p className="mt-1 text-base font-medium text-slate-800">
              {department.school_name || department.school || "—"}
            </p>
          </div>

          {/* Head */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Head of Department
            </p>

            <p className="mt-1 text-base font-medium text-slate-800">
              {department.head_name || "—"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                department.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {department.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Created */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created
            </p>

            <p className="mt-1 text-base text-slate-700">
              {department.created_at
                ? new Date(department.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 border-t pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {department.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;