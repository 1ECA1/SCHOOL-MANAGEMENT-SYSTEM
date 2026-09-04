import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession } from "../../../services/academicsService";

const AcademicSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSession(id);

        setSession(data);
      } catch (err) {
        console.error(
          "Failed to load academic session:",
          err,
        );

        setError(
          "Failed to load academic session.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow">
          Loading academic session...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic/sessions")
          }
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          ← Back to Sessions
        </button>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic/sessions")
          }
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Academic Sessions
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {session.name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Academic Session Details
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/academic/sessions/${session.id}/edit`,
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Session
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Session Information */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Session Information
          </h2>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Session Name
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {session.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                School
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {session.school_name ||
                  session.school ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Start Date
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {session.start_date || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                End Date
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {session.end_date || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Status
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">
                Current Session
              </span>

              {session.is_current ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Current
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  Not Current
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">
                Active
              </span>

              {session.is_active ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Inactive
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Session ID
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {session.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Created At
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {session.created_at
                  ? new Date(
                      session.created_at,
                    ).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicSessionDetails;