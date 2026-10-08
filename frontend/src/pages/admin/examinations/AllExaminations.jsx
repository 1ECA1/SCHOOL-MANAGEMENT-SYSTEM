import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExaminations,
  deleteExamination,
} from "../../../services/examinationsService";

const AllExaminations = () => {
  const navigate = useNavigate();

  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExaminations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getExaminations();

      setExaminations(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
        "Failed to load examinations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this examination?"
    );

    if (!confirmed) return;

    try {
      await deleteExamination(id);

      setExaminations((prev) =>
        prev.filter((exam) => exam.id !== id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.detail ||
        "Failed to delete examination."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const getStatus = (exam) => {
    if (!exam.is_active) {
      return "Inactive";
    }

    if (exam.is_published) {
      return "Published";
    }

    return "Draft";
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading examinations...</p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Examinations
          </h1>

          <p className="text-gray-500 mt-1">
            Manage school examinations and examination schedules.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/examinations/add")
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Examination
        </button>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}


      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Examination
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Type
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Class
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Session
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Term
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Dates
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y">

              {examinations.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No examinations found.
                  </td>

                </tr>

              ) : (

                examinations.map((exam) => (

                  <tr
                    key={exam.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">

                      <div className="font-medium text-gray-800">
                        {exam.name}
                      </div>

                      {exam.school_name && (
                        <div className="text-sm text-gray-500">
                          {exam.school_name}
                        </div>
                      )}

                    </td>


                    <td className="px-6 py-4 text-sm">
                      {exam.examination_type_display ||
                        exam.examination_type ||
                        "—"}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {exam.class_level_name || "—"}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {exam.academic_session_name || "—"}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {exam.term_name || "—"}
                    </td>


                    <td className="px-6 py-4 text-sm">

                      <div>
                        {formatDate(exam.start_date)}
                      </div>

                      <div className="text-gray-400">
                        to {formatDate(exam.end_date)}
                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          !exam.is_active
                            ? "bg-gray-100 text-gray-600"
                            : exam.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {getStatus(exam)}
                      </span>

                    </td>


                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                           navigate(`/admin/examinations/${exam.id}`)
                            
                          }
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/examinations/${exam.id}/edit`
                            )
                          }
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(exam.id)
                          }
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AllExaminations;