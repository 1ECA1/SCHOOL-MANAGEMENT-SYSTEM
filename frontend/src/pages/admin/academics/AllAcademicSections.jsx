import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAcademicSections,
  deleteAcademicSection,
  updateAcademicSection, getSchools
} from "../../../services/academicsService";

const AllAcademicSections = () => {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadSections = async () => {
  try {
    setLoading(true);
    setError("");

    const [sectionData, schoolData] = await Promise.all([
      getAcademicSections(),
      getSchools(),
    ]);

    setSections(sectionData);
    setSchools(schoolData);
  } catch (err) {
    console.error(
      "Failed to load academic sections:",
      err,
    );

    setError("Failed to load academic sections.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadSections();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic section?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAcademicSection(id);

      setSections((prev) =>
        prev.filter((section) => section.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete academic section:", err);
      alert("Failed to delete academic section.");
    }
  };

  const handleToggleStatus = async (section) => {
    try {
      const updatedSection = await updateAcademicSection(
        section.id,
        {
          school: Number(section.school),
          name: section.name,
          code: section.code,
          description: section.description || "",
          is_active: !section.is_active,
        },
      );

      setSections((prev) =>
        prev.map((item) =>
          item.id === section.id ? updatedSection : item,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to update academic section status:",
        err,
      );

      alert("Failed to update academic section status.");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading academic sections...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Academic Sections
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Academic Sections
          </h1>

          <p className="text-sm text-slate-500">
            Manage academic sections.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic-sections/add")
          }
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add Academic Section
        </button>
      </div>

      {/* Academic Sections Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {sections.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">
              No academic sections found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/academic-sections/add")
              }
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first academic section
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Section
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    School
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sections.map((section) => (
                  <tr
                    key={section.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {section.name}
                        </p>

                        {section.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {section.code}
                    </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
  {schools.find((school) => school.id === section.school)?.name ||
    "—"}
</td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(section)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          section.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {section.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic-sections/${section.id}`,
                            )
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic-sections/${section.id}/edit`,
                            )
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(section.id)
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-800"
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
        )}
      </div>
    </div>
  );
};

export default AllAcademicSections;