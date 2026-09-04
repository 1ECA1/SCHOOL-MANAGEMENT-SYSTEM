import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createSession,
  getSchools,
} from "../../../services/academicsService";

const AddAcademicSession = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoadingSchools(true);

        const data = await getSchools();

        setSchools(data);
      } catch (err) {
        console.error(
          "Failed to load schools:",
          err,
        );

        setError(
          "Failed to load schools.",
        );
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
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the academic session name.");
      return;
    }

    if (!formData.start_date) {
      setError("Please select the start date.");
      return;
    }

    if (!formData.end_date) {
      setError("Please select the end date.");
      return;
    }

    if (formData.end_date <= formData.start_date) {
      setError(
        "End date must be after the start date.",
      );
      return;
    }

    try {
      setLoading(true);

      await createSession({
        school: Number(formData.school),
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate("/admin/academic/sessions");
    } catch (err) {
      console.error(
        "Failed to create academic session:",
        err,
      );

      const message =
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        "Failed to create academic session.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic/sessions")
          }
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Academic Sessions
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          Add Academic Session
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new academic session for a school.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl bg-white p-6 shadow"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* School */}
          <div className="md:col-span-2">
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
              disabled={loadingSchools}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {loadingSchools
                  ? "Loading schools..."
                  : "Select school"}
              </option>

              {schools.map((school) => (
                <option
                  key={school.id}
                  value={school.id}
                >
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Academic Session Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: 2026/2027"
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Example: 2026/2027
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="start_date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>

            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end_date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              End Date
            </label>

            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Current */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span>
                <span className="block text-sm font-medium text-gray-700">
                  Current Academic Session
                </span>

                <span className="block text-xs text-gray-500">
                  Mark this session as the current session.
                </span>
              </span>
            </label>
          </div>

          {/* Active */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span>
                <span className="block text-sm font-medium text-gray-700">
                  Active
                </span>

                <span className="block text-xs text-gray-500">
                  Keep this academic session active.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic/sessions")
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || loadingSchools}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAcademicSession;