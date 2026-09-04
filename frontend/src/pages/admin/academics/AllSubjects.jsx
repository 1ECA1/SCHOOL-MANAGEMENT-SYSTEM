import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubjects,
  deleteSubject,
  updateSubject,
  getSchools,
  getDepartments,
} from "../../../services/academicsService";

const AllSubjects = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const [subjectData, schoolData, departmentData] =
        await Promise.all([
          getSubjects(),
          getSchools(),
          getDepartments(),
        ]);

      setSubjects(subjectData);
      setSchools(schoolData);
      setDepartments(departmentData);
    } catch (err) {
      console.error("Failed to load subjects:", err);
      setError("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubject(id);

      setSubjects((prev) =>
        prev.filter((subject) => subject.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert("Failed to delete subject.");
    }
  };

  const handleToggleStatus = async (subject) => {
    try {
      const updatedSubject = await updateSubject(subject.id, {
        school: Number(subject.school),
        department: subject.department
          ? Number(subject.department)
          : null,
        name: subject.name,
        code: subject.code,
        description: subject.description || "",
        credit_units: Number(subject.credit_units),
        is_core: subject.is_core,
        is_active: !subject.is_active,
      });

      setSubjects((prev) =>
        prev.map((item) =>
          item.id === subject.id ? updatedSubject : item,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to update subject status:",
        err,
      );

      alert("Failed to update subject status.");
    }
  };

  const getSchoolName = (schoolId) => {
    return (
      schools.find((school) => school.id === schoolId)?.name ||
      "—"
    );
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) {
      return "—";
    }

    return (
      departments.find(
        (department) => department.id === departmentId,
      )?.name || "—"
    );
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading subjects...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Subjects</h1>
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
          <h1 className="text-2xl font-bold">Subjects</h1>

          <p className="text-sm text-slate-500">
            Manage school subjects.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/subjects/add")
          }
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add Subject
        </button>
      </div>

      {/* Subjects Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {subjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">
              No subjects found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/subjects/add")
              }
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first subject
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    School
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
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
                {subjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {subject.name}
                        </p>

                        {subject.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {subject.code}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getSchoolName(subject.school)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getDepartmentName(subject.department)}
                    </td>

                    <td className="px-6 py-4">
                      {subject.is_core ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Core
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Elective
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(subject)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          subject.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {subject.is_active
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
                              `/admin/subjects/${subject.id}`,
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
                              `/admin/subjects/${subject.id}/edit`,
                            )
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(subject.id)
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

export default AllSubjects;