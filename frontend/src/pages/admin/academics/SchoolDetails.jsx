import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSchool } from "../../../services/academicsService";

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchool = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSchool(id);
      setSchool(data);
    } catch (err) {
      console.error("Failed to load school:", err);
      setError("Failed to load school details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading school...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            School Details
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-slate-500">
          School not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            School Details
          </h1>

          <p className="text-sm text-slate-500">
            View school information.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/academic/schools/${school.id}/edit`)
            }
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
          >
            Edit School
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic/schools")
            }
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* School Profile */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {school.logo ? (
            <img
              src={school.logo}
              alt={school.name}
              className="h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-4xl">
              🏫
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {school.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              School Code: {school.code || "—"}
            </p>

            <div className="mt-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  school.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {school.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Address
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.address || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phone
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.phone || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Website
            </p>

            {school.website ? (
              <a
                href={school.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm text-blue-600 hover:text-blue-800"
              >
                {school.website}
              </a>
            ) : (
              <p className="mt-1 text-sm text-slate-800">
                —
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Principal
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.principal_name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Established Year
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.established_year || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              School ID
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.id}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </p>

            <p className="mt-1 text-sm text-slate-800">
              {school.created_at
                ? new Date(school.created_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;