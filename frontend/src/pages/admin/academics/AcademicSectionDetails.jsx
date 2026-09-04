import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAcademicSection, getSchools, } from "../../../services/academicsService";

const AcademicSectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
const loadSection = async () => {
  try {
    setLoading(true);
    setError("");

    const [sectionData, schoolData] = await Promise.all([
      getAcademicSection(id),
      getSchools(),
    ]);

    setSection(sectionData);
    setSchools(schoolData);
  } catch (err) {
    console.error(
      "Failed to load academic section:",
      err,
    );

    setError("Failed to load academic section.");
  } finally {
    setLoading(false);
  }
};

    loadSection();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading academic section...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Academic Section
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-slate-500">
          Academic section not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {section.name}
          </h1>

          <p className="text-sm text-slate-500">
            Academic section details
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/academic-sections/${section.id}/edit`,
            )
          }
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          Edit Academic Section
        </button>
      </div>

      {/* Details */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Section Name
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {section.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Code
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {section.code}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              School
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {schools.find((school) => school.id === section.school)?.name ||
            "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>

            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                section.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {section.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {section.description || "No description provided."}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {section.created_at
                ? new Date(section.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {section.updated_at
                ? new Date(section.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Back */}
      <button
        type="button"
        onClick={() =>
          navigate("/admin/academic-sections")
        }
        className="mt-5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Academic Sections
      </button>
    </div>
  );
};

export default AcademicSectionDetails;