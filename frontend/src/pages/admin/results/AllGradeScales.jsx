import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGradeScales,
  deleteGradeScale,
} from "../../../services/resultsService";

function AllGradeScales() {
  const navigate = useNavigate();

  const [gradeScales, setGradeScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadGradeScales = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getGradeScales();

      setGradeScales(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load grade scales."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradeScales();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this grade scale?"
    );

    if (!confirmed) return;

    try {
      await deleteGradeScale(id);

      setGradeScales((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to delete grade scale."
      );
    }
  };

  const filteredGradeScales = gradeScales.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      String(item.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.grade || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.remark || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Grade Scales
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage the grading system used for student results.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/results/grade-scales/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Add Grade Scale
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <input
          type="text"
          placeholder="Search by grade, remark or scale name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Loading grade scales...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Name
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Score Range
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Grade
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Remark
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Grade Point
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredGradeScales.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No grade scales found.
                    </td>
                  </tr>
                ) : (
                  filteredGradeScales.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {item.name || "Standard Grade Scale"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {item.minimum_score} -{" "}
                        {item.maximum_score}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center min-w-10 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {item.grade}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {item.remark || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {item.grade_point}
                      </td>

                      <td className="px-5 py-4">
                        {item.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/results/grade-scales/${item.id}/edit`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
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
      )}
    </div>
  );
}

export default AllGradeScales;