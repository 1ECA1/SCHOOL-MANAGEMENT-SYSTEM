import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudentResult,
  updateStudentResult,
} from "../../../services/resultsService";

function EditResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    ca_score: "",
    exam_score: "",
    is_published: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD RESULT
  // =====================================================

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getStudentResult(id);

        setResult(data);

        setFormData({
          ca_score: data.ca_score ?? "",
          exam_score: data.exam_score ?? "",
          is_published: Boolean(data.is_published),
        });
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load the result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const caScore =
    formData.ca_score === ""
      ? 0
      : Number(formData.ca_score);

  const examScore =
    formData.exam_score === ""
      ? 0
      : Number(formData.exam_score);

  const totalScore = caScore + examScore;

  const maximumScore = result
    ? Number(result.maximum_score ?? 100)
    : 100;

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.ca_score === "") {
      setError("Please enter the CA score.");
      return;
    }

    if (formData.exam_score === "") {
      setError("Please enter the examination score.");
      return;
    }

    if (caScore < 0) {
      setError("CA score cannot be negative.");
      return;
    }

    if (examScore < 0) {
      setError(
        "Examination score cannot be negative."
      );
      return;
    }

    if (totalScore > maximumScore) {
      setError(
        `The total score cannot be greater than ${maximumScore}.`
      );
      return;
    }

    try {
      setSaving(true);

      await updateStudentResult(id, {
  student: result.student,
  examination_subject: result.examination_subject,
  ca_score: formData.ca_score,
  exam_score: formData.exam_score,
  is_published: formData.is_published,
});

      setSuccess("Result updated successfully.");

      setTimeout(() => {
        navigate("/admin/results");
      }, 800);
    } catch (err) {
      console.error(err);

      const responseData = err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(responseData)
          .map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(" ")
              : String(message);

            return `${field}: ${text}`;
          })
          .join(" | ");

        setError(
          messages || "Failed to update the result."
        );
      } else {
        setError(
          "Failed to update the result."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Edit Result
        </h1>

        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!result) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Result not found."}
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/results")}
          className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Back to Results
        </button>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Edit Student Result
          </h1>

          <p className="text-gray-500 mt-1">
            Correct or update the student's scores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/results")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl bg-white border rounded-xl shadow-sm p-6"
      >
        {/* =================================================
            STUDENT INFORMATION
        ================================================== */}

        <div className="mb-6 rounded-lg bg-gray-50 border p-5">
          <h2 className="font-semibold mb-4">
            Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-500">
                Student
              </p>

              <p className="font-medium">
                {result.student_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Subject
              </p>

              <p className="font-medium">
                {result.subject_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Examination
              </p>

              <p className="font-medium">
                {result.examination_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Maximum Score
              </p>

              <p className="font-medium">
                {maximumScore}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            SCORES
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              CA Score
            </label>

            <input
              type="number"
              name="ca_score"
              value={formData.ca_score}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Examination Score
            </label>

            <input
              type="number"
              name="exam_score"
              value={formData.exam_score}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* =================================================
            TOTAL
        ================================================== */}

        <div className="mb-6 rounded-xl border bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                New Total Score
              </p>

              <p className="text-3xl font-bold">
                {totalScore.toFixed(2)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Maximum
              </p>

              <p className="text-xl font-semibold">
                {maximumScore.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            CURRENT GRADE
        ================================================== */}

        <div className="mb-6 rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Current Grade
              </p>

              <p className="font-semibold text-lg">
                {result.grade || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Current Remark
              </p>

              <p className="font-semibold">
                {result.remark || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Grade Point
              </p>

              <p className="font-semibold">
                {result.grade_point ?? "0.00"}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Grade, remark, and grade point are recalculated
            by the backend when the scores are updated.
          </p>
        </div>

        {/* =================================================
            PUBLISH
        ================================================== */}

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="text-sm">
              Publish this result
            </span>
          </label>
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Update Result"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/results")
            }
            className="px-5 py-2.5 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditResult;