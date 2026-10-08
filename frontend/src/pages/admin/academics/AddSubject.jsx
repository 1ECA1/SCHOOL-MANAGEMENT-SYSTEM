import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createSubject,
  getSchools,
  getDepartments,
} from "../../../services/academicsService";

const AddSubject = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    education_level: "PRIMARY",
    department: "",
    name: "",
    code: "",
    description: "",
    is_core: false,
    is_active: true,
  });

  // =====================================================
  // LOAD SCHOOLS AND DEPARTMENTS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [schoolData, departmentData] = await Promise.all([
          getSchools(),
          getDepartments(),
        ]);

        setSchools(schoolData);
        setDepartments(departmentData);
      } catch (err) {
        console.error("Failed to load subject data:", err);

        setError("Failed to load schools and departments.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // EDUCATION LEVEL
  // =====================================================

  const isSeniorSecondary = formData.education_level === "SS";

  // =====================================================
  // HANDLE FORM CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Primary and JSS subjects cannot have a department.
      if (name === "education_level" && value !== "SS") {
        updated.department = "";
      }

      return updated;
    });
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    if (!formData.education_level) {
      setError("Please select an education level.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the subject name.");
      return;
    }

    if (!formData.code.trim()) {
      setError("Please enter the subject code.");
      return;
    }

    // ---------------------------------------------------
    // PRIMARY / JSS DEPARTMENT VALIDATION
    // ---------------------------------------------------
    //
    // Primary and JSS subjects cannot belong to a
    // Senior Secondary department.
    //

    if (!isSeniorSecondary && formData.department) {
      setError(
        "Primary and JSS subjects cannot have a department.",
      );
      return;
    }

    // ---------------------------------------------------
    // CREATE SUBJECT
    // ---------------------------------------------------

    try {
      setSaving(true);

      const payload = {
        school: Number(formData.school),

        education_level: formData.education_level,

        name: formData.name.trim(),

        code: formData.code.trim(),

        description: formData.description.trim(),

        is_core: formData.is_core,

        is_active: formData.is_active,

        // Department is optional.
        //
        // Senior Secondary:
        // department may contain an ID or be null.
        //
        // Primary/JSS:
        // department is always null.
        department:
          isSeniorSecondary && formData.department
            ? Number(formData.department)
            : null,
      };

      console.log("Creating subject:", payload);

      await createSubject(payload);

      // Return to All Subjects
      navigate("/admin/subjects");
    } catch (err) {
      console.error("Failed to create subject:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        const messages = Object.values(responseData)
          .flat()
          .join(" ");

        setError(messages || "Failed to create subject.");
      } else {
        setError("Failed to create subject.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // FILTER DEPARTMENTS BY SCHOOL
  // =====================================================

  const filteredDepartments = departments.filter(
    (department) =>
      !formData.school ||
      Number(department.school) === Number(formData.school),
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingData) {
    return (
      <div className="py-10 text-center text-slate-500 dark:text-slate-400">
        Loading subject form...
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Add Subject
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create a new school subject.
        </p>
      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow dark:bg-slate-900"
      >
        <div className="grid gap-6 md:grid-cols-2">

          {/* =================================================
              SCHOOL
          ================================================= */}

          <div>
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select school</option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              EDUCATION LEVEL
          ================================================= */}

          <div>
            <label
              htmlFor="education_level"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Education Level
            </label>

            <select
              id="education_level"
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="PRIMARY">
                Primary
              </option>

              <option value="JSS">
                JSS
              </option>

              <option value="SS">
                Senior Secondary
              </option>
            </select>
          </div>

          {/* =================================================
              DEPARTMENT
              SS ONLY - OPTIONAL
          ================================================= */}

          {isSeniorSecondary && (
            <div>
              <label
                htmlFor="department"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Department
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">
                  No department
                </option>

                {filteredDepartments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Department is optional. Use it when this
                subject is specific to a Senior Secondary
                department.
              </p>
            </div>
          )}

          {/* =================================================
              SUBJECT NAME
          ================================================= */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Subject Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: Mathematics"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* =================================================
              SUBJECT CODE
          ================================================= */}

          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Subject Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: MTH"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm uppercase text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="flex flex-col justify-center gap-4">

            {/* Core Subject */}

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_core"
                checked={formData.is_core}
                onChange={handleChange}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Core Subject
              </span>
            </label>

            {/* Active */}

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Active
              </span>
            </label>

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              placeholder="Enter a description for this subject..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">

          {/* Cancel */}

          <button
            type="button"
            onClick={() => navigate("/admin/subjects")}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          {/* Create */}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Subject"}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddSubject;