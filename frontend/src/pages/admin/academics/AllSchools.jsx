import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSchools,
  deleteSchool,
  updateSchool,
} from "../../../services/academicsService";

const AllSchools = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSchools();
      setSchools(data);
    } catch (err) {
      console.error("Failed to load schools:", err);
      setError("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this school?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSchool(id);

      setSchools((prev) => prev.filter((school) => school.id !== id));
    } catch (err) {
      console.error("Failed to delete school:", err);
      alert("Failed to delete school.");
    }
  };

  const handleToggleStatus = async (school) => {
    try {
      const updatedSchool = await updateSchool(school.id, {
        name: school.name,
        code: school.code,
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        website: school.website || "",
        principal_name: school.principal_name || "",
        established_year: school.established_year || null,
        is_active: !school.is_active,
      });

      setSchools((prev) =>
        prev.map((item) => (item.id === school.id ? updatedSchool : item)),
      );
    } catch (err) {
      console.error("Failed to update school status:", err);

      alert("Failed to update school status.");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">Loading schools...</div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Schools</h1>

          <p className="text-sm text-slate-500">Manage schools.</p>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schools</h1>

          <p className="text-sm text-slate-500">Manage schools.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/academic/schools/add")}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add School
        </button>
      </div>

      {/* SCHOOL LIST */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {schools.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No schools found.</p>

            <button
              type="button"
              onClick={() => navigate("/admin/academic/schools/add")}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first school
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    School
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Principal
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
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50">
                    {/* SCHOOL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {school.logo ? (
                            <img
                              src={school.logo}
                              alt={`${school.name} logo`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">
                              🏫
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-gray-800">
                            {school.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            ID: {school.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CODE */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {school.code || "—"}
                    </td>

                    {/* PHONE */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {school.phone || "—"}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {school.email || "—"}
                    </td>

                    {/* PRINCIPAL */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {school.principal_name || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(school)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          school.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {school.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/academic/schools/${school.id}`)
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic/schools/${school.id}/edit`,
                            )
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(school.id)}
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

export default AllSchools;
