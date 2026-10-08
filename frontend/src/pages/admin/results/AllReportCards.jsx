import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getReportCards,
  deleteReportCard,
} from "../../../services/resultsService";

function AllReportCards() {
  const navigate = useNavigate();

  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadReportCards = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReportCards();

      setReportCards(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load report cards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportCards();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report card?"
    );

    if (!confirmed) return;

    try {
      await deleteReportCard(id);

      setReportCards((prev) =>
        prev.filter((card) => card.id !== id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to delete report card."
      );
    }
  };

  const filteredReportCards = reportCards.filter((card) => {
    const searchText = search.toLowerCase();

    return (
      String(card.student_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(card.session_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(card.term_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(card.class_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(card.overall_grade || "")
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
            Report Cards
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View and manage student report cards.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/results/report-cards/add")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Create Report Card
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <input
          type="text"
          placeholder="Search student, class, session, term or grade..."
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
          Loading report cards...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Student
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Class
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Session
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Term
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Average
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Grade
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                    Position
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
                {filteredReportCards.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No report cards found.
                    </td>
                  </tr>
                ) : (
                  filteredReportCards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {card.student_name || "—"}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-5 py-4 text-gray-700">
                        {card.class_name || "—"}
                      </td>

                      {/* Session */}
                      <td className="px-5 py-4 text-gray-700">
                        {card.session_name || "—"}
                      </td>

                      {/* Term */}
                      <td className="px-5 py-4 text-gray-700">
                        {card.term_name || "—"}
                      </td>

                      {/* Average */}
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {card.average_score ?? "0.00"}
                      </td>

                      {/* Grade */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center min-w-10 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {card.overall_grade || "—"}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4 text-gray-700">
                        {card.position
                          ? `${card.position} / ${
                              card.total_students || "—"
                            }`
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {card.is_published ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/results/report-cards/${card.id}`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/results/report-cards/${card.id}/edit`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(card.id)
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

export default AllReportCards;