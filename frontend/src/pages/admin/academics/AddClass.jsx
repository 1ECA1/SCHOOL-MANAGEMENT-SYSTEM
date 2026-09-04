import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createClassLevel,
  getDepartments,
  getSchools,
} from "../../../services/academicsService";

const AddClass = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    description: "",
    department: "",
    capacity: 40,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [schoolsData, departmentsData] = await Promise.all([
          getSchools(),
          getDepartments(),
        ]);

        setSchools(schoolsData);
        setDepartments(departmentsData);

        // Automatically select the first school if there is only one.
        if (schoolsData.length === 1) {
          setFormData((prev) => ({
            ...prev,
            school: schoolsData[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load form data:", err);
        setError("Failed to load schools and departments.");
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        school: Number(formData.school),
        capacity: Number(formData.capacity),
        department: formData.department
          ? Number(formData.department)
          : null,
      };

      await createClassLevel(payload);

      navigate("/admin/classes");
    } catch (err) {
      console.error("Failed to create class:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          typeof responseData === "object"
            ? Object.values(responseData).flat().join(" ")
            : "Failed to create class.",
        );
      } else {
        setError("Failed to create class.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          Loading form...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Add Class
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new class level for your school.
        </p>
      </div>

      <div className="max-w-3xl rounded-lg bg-white p-6 shadow">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* School */}
          <div>
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select school</option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: JSS 1"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="Example: JSS1"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Department
            </label>

            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">No department</option>

              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Capacity
            </label>

            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Optional class description"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Class"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/classes")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
              
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClass;