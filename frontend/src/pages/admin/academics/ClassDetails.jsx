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
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Loading class details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="mt-4 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  if (!classLevel) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Class not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Class Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View information about this class level.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Classes
        </button>
      </div>

      <div className="max-w-3xl rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-800">
            {classLevel.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Class Code: {classLevel.code}
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Class Name</p>
            <p className="mt-1 font-medium text-gray-800">
              {classLevel.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Class Code</p>
            <p className="mt-1 font-medium text-gray-800">
              {classLevel.code}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="mt-1 font-medium text-gray-800">
              {getDepartmentName()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="mt-1 font-medium text-gray-800">
              {classLevel.capacity}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                classLevel.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {classLevel.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Description</p>

            <p className="mt-1 text-gray-800">
              {classLevel.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 px-6 py-5">
          <button
            type="button"
            onClick={() => navigate(`/admin/classes/${id}/edit`)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Class
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/classes")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;