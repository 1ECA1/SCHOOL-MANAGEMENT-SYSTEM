import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGradeScale } from "../../../services/resultsService";

function AddGradeScale() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Standard Grade Scale",
    minimum_score: "",
    maximum_score: "",
    grade: "",
    remark: "",
    grade_point: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const minimum = Number(formData.minimum_score);
    const maximum = Number(formData.maximum_score);
    const gradePoint = Number(formData.grade_point);

    if (
      formData.minimum_score === "" ||
      formData.maximum_score === "" ||
      formData.grade_point === ""
    ) {
      setError("Please fill in all score and grade point fields.");
      return;
    }

    if (minimum < 0) {
      setError("Minimum score cannot be less than 0.");
      return;
    }

    if (maximum < minimum) {
      setError(
        "Maximum score must be greater than or equal to minimum score."
      );
      return;
    }

    if (gradePoint < 0) {
      setError("Grade point cannot be negative.");
      return;
    }

    if (!formData.grade.trim()) {
      setError("Please enter a grade.");
      return;
    }

    if (!formData.remark.trim()) {
      setError("Please enter a remark.");
      return;
    }

    try {
      setLoading(true);

      await createGradeScale({
        name: formData.name.trim() || "Standard Grade Scale",
        minimum_score: minimum,
        maximum_score: maximum,
        grade: formData.grade.trim().toUpperCase(),
        remark: formData.remark.trim(),
        grade_point: gradePoint,
        is_active: formData.is_active,
      });

      navigate("/admin/results/grade-scales");
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(messages || "Failed to create grade scale.");
      } else {
        setError("Failed to create grade scale.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add Grade Scale
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create a grading range for student results.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/results/grade-scales")}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 max-w-3xl"
      >
        {/* Scale Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Scale Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Standard Grade Scale"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Score Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Score
            </label>

            <input
              type="number"
              name="minimum_score"
              value={formData.minimum_score}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 70"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Score
            </label>

            <input
              type="number"
              name="maximum_score"
              value={formData.maximum_score}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 100"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grade and Point */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>

            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              maxLength="5"
              placeholder="e.g. A"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 uppercase outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Point
            </label>

            <input
              type="number"
              name="grade_point"
              value={formData.grade_point}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Remark */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remark
          </label>

          <input
            type="text"
            name="remark"
            value={formData.remark}
            onChange={handleChange}
            placeholder="e.g. Excellent"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Active */}
        <div className="mb-6">
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />

            <span className="text-sm font-medium text-gray-700">
              Active Grade Scale
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            {loading ? "Saving..." : "Save Grade Scale"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/results/grade-scales")}
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddGradeScale;