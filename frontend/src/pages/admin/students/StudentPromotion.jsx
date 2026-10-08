import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";

export default function StudentPromotion() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetchPromotionEligibility();
  }, [studentId]);

  const fetchPromotionEligibility = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/students/enrollments/${studentId}/promotion/`
      );

      setData(response.data);
    } catch (err) {
      console.error("Promotion eligibility error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load promotion information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePromotion = async () => {
    if (!data) return;

    if (
      data.requires_promotion &&
      data.target_classes?.length > 1 &&
      !selectedClass
    ) {
      setError("Please select a target class.");
      return;
    }

    try {
      setPromoting(true);
      setError("");
      setSuccess("");

      const payload = {
        student_id: Number(studentId),
      };

      if (data.requires_promotion && selectedClass) {
        payload.target_class_id = Number(selectedClass);
      }

      const response = await api.post(
        "/students/enrollments/promote/",
        payload
      );

      setSuccess(response.data.detail);

      await fetchPromotionEligibility();
    } catch (err) {
      console.error("Promotion error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to promote student."
      );
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading promotion information...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isGraduation = data.requires_graduation;
  const isPromotion = data.requires_promotion;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Promotion
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review eligibility and promote the student to the next
            academic level.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* Student information */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Student Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Student
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {data.student?.name ||
                data.current_enrollment?.student_name ||
                "Student"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current Session
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {data.current_enrollment?.session || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current Term
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {data.current_enrollment?.term || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current Class
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {data.current_enrollment?.class || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isGraduation
                ? "bg-purple-100 text-purple-600"
                : isPromotion
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isGraduation ? "🎓" : isPromotion ? "↑" : "✓"}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isGraduation
                ? "Eligible for Graduation"
                : isPromotion
                ? "Eligible for Promotion"
                : "Promotion Status"}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {data.detail}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Promotion */}
      {isPromotion && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Target Class
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose the class the student will enter in the next
            academic session.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Target Class
            </label>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 md:max-w-lg"
            >
              <option value="">
                Select target class
              </option>

              {data.target_classes?.map((classItem) => (
                <option
                  key={classItem.id}
                  value={classItem.id}
                >
                  {classItem.name}
                  {classItem.department
                    ? ` — ${classItem.department}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Target class cards */}
          {data.target_classes?.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.target_classes.map((classItem) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() =>
                    setSelectedClass(String(classItem.id))
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    String(selectedClass) ===
                    String(classItem.id)
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                      : "border-gray-200 bg-white hover:border-violet-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    {classItem.name}
                  </p>

                  {classItem.department && (
                    <p className="mt-1 text-sm text-gray-500">
                      {classItem.department}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-400">
                    Capacity: {classItem.capacity}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handlePromotion}
              disabled={
                promoting ||
                (data.target_classes?.length > 1 &&
                  !selectedClass)
              }
              className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {promoting
                ? "Promoting..."
                : "Promote Student"}
            </button>
          </div>
        </div>
      )}

      {/* Graduation */}
      {isGraduation && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Graduation
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            This student has completed SS3 and can be graduated.
          </p>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handlePromotion}
              disabled={promoting}
              className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {promoting
                ? "Graduating..."
                : "Graduate Student"}
            </button>
          </div>
        </div>
      )}

      {/* Not eligible */}
      {!isPromotion && !isGraduation && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-600">
            {data.detail ||
              "This student is not currently eligible for promotion."}
          </p>
        </div>
      )}
    </div>
  );
}