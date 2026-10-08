import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExamination,
  getExaminationSubjects,
  deleteExaminationSubject,
} from "../../../services/examinationsService";

const ExaminationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EXAMINATION
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [examinationData, subjectsData] =
        await Promise.all([
          getExamination(id),
          getExaminationSubjects(),
        ]);

      setExamination(examinationData);

      const subjectList = Array.isArray(subjectsData)
        ? subjectsData
        : subjectsData?.results || [];

      // Only show subjects belonging to this examination
      setSubjects(
        subjectList.filter(
          (item) =>
            String(item.examination) === String(id)
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load examination."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // =====================================================
  // DELETE SUBJECT
  // =====================================================

  const handleDeleteSubject = async (subjectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this subject from the examination?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(subjectId);
      setError("");

      await deleteExaminationSubject(subjectId);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to remove examination subject."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-gray-600">
            Loading examination...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!examination) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-red-600">
            {error || "Examination not found."}
          </p>

          <button
            onClick={() =>
              navigate("/admin/examinations")
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Examinations
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Examination Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View examination information and manage subjects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              navigate("/admin/examinations")
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            onClick={() =>
              navigate(
                `/admin/examinations/${id}/edit`
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Examination
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EXAMINATION INFORMATION */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {examination.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Examination information
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              examination.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {examination.is_active
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* SCHOOL */}
          <InfoItem
            label="School"
            value={examination.school_name || "—"}
          />

          {/* SESSION */}
          <InfoItem
            label="Academic Session"
            value={
              examination.academic_session_name || "—"
            }
          />

          {/* TERM */}
          <InfoItem
            label="Term"
            value={examination.term_name || "—"}
          />

          {/* CLASS */}
          <InfoItem
            label="Class"
            value={examination.class_level_name || "—"}
          />

          {/* TYPE */}
          <InfoItem
            label="Examination Type"
            value={
              examination.examination_type_display ||
              examination.examination_type ||
              "—"
            }
          />

          {/* START DATE */}
          <InfoItem
            label="Start Date"
            value={formatDate(examination.start_date)}
          />

          {/* END DATE */}
          <InfoItem
            label="End Date"
            value={formatDate(examination.end_date)}
          />

          {/* PUBLISHED */}
          <InfoItem
            label="Published"
            value={
              examination.is_published
                ? "Yes"
                : "No"
            }
          />
        </div>

        {examination.description && (
          <div className="mt-5 border-t pt-5">
            <p className="mb-1 text-sm font-medium text-gray-500">
              Description
            </p>

            <p className="text-sm text-gray-700">
              {examination.description}
            </p>
          </div>
        )}
      </div>

      {/* SUBJECTS */}
      <div className="rounded-xl bg-white shadow">
        <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Examination Subjects
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {subjects.length} subject
              {subjects.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/admin/examinations/${id}/subjects/add`
              )
            }
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Add Subject
          </button>
        </div>

        {/* EMPTY */}
        {subjects.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mb-3 text-4xl">📚</div>

            <h3 className="text-lg font-semibold text-gray-700">
              No subjects added
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add subjects to create the examination timetable.
            </p>

            <button
              onClick={() =>
                navigate(
                  `/admin/examinations/${id}/subjects/add`
                )
              }
              className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Time
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Max Score
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pass Mark
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Venue
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {item.subject_name || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.subject_code || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.examination_date)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTime(item.start_time)}{" "}
                      -{" "}
                      {formatTime(item.end_time)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.maximum_score}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.pass_mark}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.venue || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/examinations/${id}/subjects/${item.id}/edit`
                            )
                          }
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteSubject(item.id)
                          }
                          disabled={
                            deleting === item.id
                          }
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deleting === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// INFO ITEM
// =====================================================

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-700">
        {value}
      </p>
    </div>
  );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  const [hours, minutes] = time.split(":");

  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

export default ExaminationDetails;