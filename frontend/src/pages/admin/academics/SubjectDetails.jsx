import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSubject,
  getSchools,
  getDepartments,
} from "../../../services/academicsService";

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [subjectData, schoolData, departmentData] =
          await Promise.all([
            getSubject(id),
            getSchools(),
            getDepartments(),
          ]);

        setSubject(subjectData);
        setSchools(schoolData);
        setDepartments(departmentData);
      } catch (err) {
        console.error("Failed to load subject:", err);
        setError("Failed to load subject.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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
        Loading subject...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Subject</h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-slate-500">
          Subject not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {subject.name}
          </h1>

          <p className="text-sm text-slate-500">
            Subject details
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/admin/subjects/${subject.id}/edit`)
          }
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          Edit Subject
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject Name
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {subject.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject Code
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {subject.code}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              School
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {getSchoolName(subject.school)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Department
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {getDepartmentName(subject.department)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Credit Units
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {subject.credit_units}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject Type
            </p>

            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                subject.is_core
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {subject.is_core ? "Core" : "Elective"}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>

            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                subject.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {subject.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {subject.description || "No description provided."}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {subject.created_at
                ? new Date(subject.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {subject.updated_at
                ? new Date(subject.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/admin/subjects")}
        className="mt-5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Subjects
      </button>
    </div>
  );
};

export default SubjectDetails;