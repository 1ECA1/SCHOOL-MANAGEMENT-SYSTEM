import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getReportCard,
  updateReportCard,
} from "../../../services/resultsService";

function EditReportCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student: "",
    academic_session: "",
    term: "",
    class_level: "",
    attendance_percentage: "",
    teacher_comment: "",
    principal_comment: "",
    promoted: false,
    is_published: false,
  });

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReportCard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getReportCard(id);

        setReportCard(data);

        setFormData({
          student: data.student || "",
          academic_session: data.academic_session || "",
          term: data.term || "",
          class_level: data.class_level || "",
          attendance_percentage: data.attendance_percentage ?? "",
          teacher_comment: data.teacher_comment || "",
          principal_comment: data.principal_comment || "",
          promoted: Boolean(data.promoted),
          is_published: Boolean(data.is_published),
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load report card."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReportCard();
  }, [id]);

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

    if (
      formData.attendance_percentage !== "" &&
      (
        Number(formData.attendance_percentage) < 0 ||
        Number(formData.attendance_percentage) > 100
      )
    ) {
      setError(
        "Attendance percentage must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);

     await updateReportCard(id, {
  student: Number(formData.student),
  academic_session: Number(formData.academic_session),
  term: Number(formData.term),
  class_level: Number(formData.class_level),

  attendance_percentage:
    formData.attendance_percentage === ""
      ? 0
      : Number(formData.attendance_percentage),

  teacher_comment:
    formData.teacher_comment.trim(),

  principal_comment:
    formData.principal_comment.trim(),

  promoted: formData.promoted,

  is_published: formData.is_published,
});

      navigate(`/admin/results/report-cards/${id}`);
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

        setError(
          messages || "Failed to update report card."
        );
      } else {
        setError("Failed to update report card.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Loading report card...
        </div>
      </div>
    );
  }

  if (!reportCard) {
    return (
      <div className="p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center text-red-600">
          Report card not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Report Card
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update the student's report card information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/admin/results/report-cards/${id}`)
          }
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

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 max-w-4xl"
      >
        {/* Academic Information */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Academic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>

            <input
              type="text"
              value={
                reportCard.student_name ||
                `Student #${reportCard.student}`
              }
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Admission Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Number
            </label>

            <input
              type="text"
              value={
                reportCard.student_admission_number || "—"
              }
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Academic Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Session
            </label>

            <input
              type="text"
              value={reportCard.session_name || "—"}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>

            <input
              type="text"
              value={reportCard.term_name || "—"}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>

            <input
              type="text"
              value={reportCard.class_name || "—"}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>

            <input
              type="text"
              value={reportCard.department_name || "—"}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        {/* Attendance */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Attendance
          </h2>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Percentage
            </label>

            <input
              type="number"
              name="attendance_percentage"
              value={formData.attendance_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-gray-500 mt-1">
              Enter a value between 0 and 100.
            </p>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Comments
          </h2>

          <div className="space-y-5">
            {/* Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher Comment
              </label>

              <textarea
                name="teacher_comment"
                value={formData.teacher_comment}
                onChange={handleChange}
                rows="4"
                placeholder="Enter teacher's comment..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Principal Comment
              </label>

              <textarea
                name="principal_comment"
                value={formData.principal_comment}
                onChange={handleChange}
                rows="4"
                placeholder="Enter principal's comment..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Report Status
          </h2>

          <div className="space-y-4">
            {/* Promoted */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="promoted"
                checked={formData.promoted}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Student promoted
              </span>
            </label>

            {/* Published */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Publish report card
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/results/report-cards/${id}`)
            }
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditReportCard;