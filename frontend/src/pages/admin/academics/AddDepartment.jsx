import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDepartment,
  getSchools,
} from "../../../services/academicsService";

const AddDepartment = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    description: "",
    head_name: "",
    is_active: true,
  });

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        console.error("Failed to load schools:", err);
        setError("Failed to load schools.");
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
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
    setError("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    try {
      setSaving(true);

      await createDepartment({
        school: Number(formData.school),
        name: formData.name,
        code: formData.code,
        description: formData.description,
        head_name: formData.head_name,
        is_active: formData.is_active,
      });

      navigate("/admin/departments");
    } catch (err) {
      console.error("Failed to create department:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          Object.values(responseData).flat().join(" ") ||
            "Failed to create department.",
        );
      } else {
        setError("Failed to create department.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/departments")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Departments
        </button>

        <h1 className="text-2xl font-bold">Add Department</h1>

        <p className="text-sm text-slate-500">
          Create a new school department.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              School
            </label>

            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loadingSchools}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">
                {loadingSchools
                  ? "Loading schools..."
                  : "Select school"}
              </option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name + Code */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Example: Science Department"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department Code
              </label>

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Example: SCI"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 uppercase outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Head */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Head of Department
            </label>

            <input
              type="text"
              name="head_name"
              value={formData.head_name}
              onChange={handleChange}
              placeholder="Enter head of department"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter department description"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <label className="text-sm font-medium text-slate-700">
              Active Department
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 border-t pt-5">
            <button
              type="button"
              onClick={() => navigate("/admin/departments")}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;