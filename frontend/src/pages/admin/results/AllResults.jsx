import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentResults,
  deleteStudentResult,
} from "../../../services/resultsService";

const AllResults = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentResults();

      setResults(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load student results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const filteredResults = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return results;
    }

    return results.filter((result) =>
      [
        result.student_name,
        result.subject_name,
        result.examination_name,
        result.grade,
        result.remark,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
    );
  }, [results, search]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this result?"
    );

    if (!confirmed) return;

    try {
      await deleteStudentResult(id);

      setResults((current) =>
        current.filter(
          (result) => result.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to delete result."
      );
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Results
          </h1>

          <p className="text-gray-500 mt-1">
            Manage student examination results
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/results/add")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Enter Result
        </button>

      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">

        <input
          type="text"
          placeholder="Search student, subject, examination..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full md:w-96 border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-10 text-center text-gray-500">
          Loading results...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-10 text-center">

          <div className="text-4xl mb-3">
            📊
          </div>

          <h2 className="text-lg font-semibold text-gray-700">
            No results found
          </h2>

          <p className="text-gray-500 mt-1">
            Enter a student's result to get started.
          </p>

        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Student
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Examination
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Subject
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                    CA
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                    Exam
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                    Total
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                    Grade
                  </th>

                  <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredResults.map((result) => (

                  <tr
                    key={result.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {result.student_name || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {result.examination_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {result.subject_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {result.ca_score}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {result.exam_score}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold">
                      {result.total_score}
                    </td>

                    <td className="px-5 py-4 text-center">

                      <span className="font-semibold">
                        {result.grade || "—"}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-center">

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          result.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {result.is_published
                          ? "Published"
                          : "Draft"}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/results/${result.id}/edit`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(result.id)
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

export default AllResults;