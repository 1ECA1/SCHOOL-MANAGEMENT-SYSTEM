import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSession,
  updateSession,
  getSchools,
} from "../../../services/academicsService";

const EditAcademicSession = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [session, schoolData] = await Promise.all([
          getSession(id),
          getSchools(),
        ]);

        setSchools(schoolData);

        setFormData({
          school: session.school || "",
          name: session.name || "",
          start_date: session.start_date || "",
          end_date: session.end_date || "",
          is_current: session.is_current ?? false,
          is_active: session.is_active ?? true,
        });
      } catch (err) {
        console.error(
          "Failed to load academic session:",
          err,
        );

        setError(
          "Failed to load academic session.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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
      setError(
        "Please enter the academic session name.",
      );
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
      setSaving(true);

      await updateSession(id, {
        school: Number(formData.school),
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate(
        `/admin/academic/sessions/${id}`,
      );
    } catch (err) {
      console.error(
        "Failed to update academic session:",
        err,
      );

      const responseData = err?.response?.data;

      const message =
        responseData?.name?.[0] ||
        responseData?.detail ||
        "Failed to update academic session.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow">
          Loading academic session...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/academic/sessions/${id}`,
            )
          }
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Session Details
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          Edit Academic Session
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the academic session information.
        </p>
      </div>

      {error && (
        <div className="mb-6 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select school
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
              maxLength={50}
              placeholder="Example: 2026/2027"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
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

          {/* Current Session */}
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
              navigate(
                `/admin/academic/sessions/${id}`,
              )
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAcademicSession;