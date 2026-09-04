import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessions,
  deleteSession,
} from "../../../services/academicsService";

const AllAcademicSessions = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error(
        "Failed to load academic sessions:",
        err,
      );

      setError(
        "Failed to load academic sessions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic session?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSession(id);

      setSessions((prev) =>
        prev.filter(
          (session) => session.id !== id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete academic session:",
        err,
      );

      alert(
        "Failed to delete academic session.",
      );
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Academic Sessions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage academic sessions for your schools.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/academic/sessions/add",
            )
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Session
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow">
          Loading academic sessions...
        </div>
      ) : sessions.length === 0 ? (
        /* EMPTY STATE */
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <div className="mb-3 text-4xl">
            📚
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            No Academic Sessions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create your first academic session.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/academic/sessions/add",
              )
            }
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Session
          </button>
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Session
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    School
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    End Date
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {session.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        ID: {session.id}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {session.school_name ||
                        session.school ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {session.start_date || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {session.end_date || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic/sessions/${session.id}`,
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic/sessions/${session.id}/edit`,
                            )
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(session.id)
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
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

export default AllAcademicSessions;