import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createClassLevel,
  getDepartments,
  getSchools,
} from "../../../services/academicsService";

const AddClass = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    education_level: "",
    description: "",
    department: "",
    capacity: 40,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SCHOOLS AND DEPARTMENTS
  // =====================================================

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [schoolsData, departmentsData] = await Promise.all([
          getSchools(),
          getDepartments(),
        ]);

        setSchools(schoolsData);
        setDepartments(departmentsData);

        // Automatically select the first school
        // if there is only one school.
        if (schoolsData.length === 1) {
          setFormData((prev) => ({
            ...prev,
            school: schoolsData[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load form data:", err);
        setError("Failed to load schools and departments.");
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  // =====================================================
  // HANDLE FORM CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Primary and JSS do not use departments.
      if (
        name === "education_level" &&
        (value === "PRIMARY" || value === "JSS")
      ) {
        updatedData.department = "";
      }

      return updatedData;
    });
  };

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Department is only applicable to Senior Secondary.
      const department =
        formData.education_level === "SS" && formData.department
          ? Number(formData.department)
          : null;

      const payload = {
        school: Number(formData.school),
        name: formData.name,
        code: formData.code,
        education_level: formData.education_level,
        description: formData.description,
        department,
        capacity: Number(formData.capacity),
        is_active: formData.is_active,
      };

      await createClassLevel(payload);

      navigate("/admin/classes");
    } catch (err) {
      console.error("Failed to create class:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          typeof responseData === "object"
            ? Object.values(responseData).flat().join(" ")
            : "Failed to create class.",
        );
      } else {
        setError("Failed to create class.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loadingData) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6 text-[var(--color-text)]">
        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-gray-700">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)] dark:border-gray-700 dark:border-t-[var(--color-primary)]" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading form...
          </p>
        </div>
      </div>
    );
  }

  const showDepartment = formData.education_level === "SS";

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6 text-[var(--color-text)]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Add Class
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new class level for your school.
        </p>
      </div>

      {/* =====================================================
          FORM CARD
      ===================================================== */}

      <div className="max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
        {/* Card Header */}

        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Class Information
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the details for the new class level.
          </p>
        </div>

        {/* Form */}

        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <div className="mt-0.5 shrink-0">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0Zm-7-4a1 1 0 10-2 0v4a1 1 0 102 0V6Zm-1 8a1 1 0 100-2 1 1 0 000 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* =====================================================
                SCHOOL
            ===================================================== */}

            <div>
              <label
                htmlFor="school"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                School
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600"
              >
                <option value="">Select school</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =====================================================
                EDUCATION LEVEL
            ===================================================== */}

            <div>
              <label
                htmlFor="education_level"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Education Level
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="education_level"
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600"
              >
                <option value="">Select education level</option>
                <option value="PRIMARY">Primary</option>
                <option value="JSS">JSS</option>
                <option value="SS">Senior Secondary</option>
              </select>

              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Department is only used for Senior Secondary classes.
              </p>
            </div>

            {/* =====================================================
                CLASS NAME
            ===================================================== */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Class Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: JSS 1"
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-gray-400 transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:placeholder:text-gray-500"
              />
            </div>

            {/* =====================================================
                CLASS CODE
            ===================================================== */}

            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Class Code
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                placeholder="Example: JSS1"
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm uppercase text-[var(--color-text)] outline-none placeholder:normal-case placeholder:text-gray-400 transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:placeholder:text-gray-500"
              />
            </div>

            {/* =====================================================
                DEPARTMENT
            ===================================================== */}

            {showDepartment && (
              <div className="rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 p-4">
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                >
                  Department
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600"
                >
                  <option value="">Select department</option>

                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Senior Secondary classes must belong to a department.
                </p>
              </div>
            )}

            {/* =====================================================
                CAPACITY
            ===================================================== */}

            <div>
              <label
                htmlFor="capacity"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Capacity
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600"
              />

              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Maximum number of students allowed in this class.
              </p>
            </div>

            {/* =====================================================
                DESCRIPTION
            ===================================================== */}

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Optional class description"
                className="w-full resize-y rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-gray-400 transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:placeholder:text-gray-500"
              />
            </div>

            {/* =====================================================
                STATUS
            ===================================================== */}

            <div className="rounded-lg border border-gray-200 bg-[var(--color-background)] p-4 dark:border-gray-700">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] dark:border-gray-600"
                />

                <span>
                  <span className="block text-sm font-medium text-[var(--color-text)]">
                    Active Class
                  </span>

                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Students can be enrolled in this class when active.
                  </span>
                </span>
              </label>
            </div>

            {/* =====================================================
                BUTTONS
            ===================================================== */}

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[var(--color-card)]"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/classes")}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-[var(--color-card)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClass;