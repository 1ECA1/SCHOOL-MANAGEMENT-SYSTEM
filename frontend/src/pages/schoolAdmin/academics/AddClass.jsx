import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  createClassLevel,
  getDepartments,
} from "../../../services/academicsService";

const EMPTY_FORM = {
  name: "",
  code: "",
  education_level: "PRIMARY",
  department: "",
  description: "",
  capacity: 40,
  is_active: true,
};

const EDUCATION_LEVELS = [
  {
    value: "PRIMARY",
    label: "Primary",
  },
  {
    value: "JSS",
    label: "Junior Secondary (JSS)",
  },
  {
    value: "SS",
    label: "Senior Secondary (SS)",
  },
];

function AddClass() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const data = await getDepartments();

        const normalizedDepartments = Array.isArray(data)
          ? data
          : data?.results || [];

        setDepartments(normalizedDepartments);
      } catch (err) {
        console.error(
          "Failed to load departments:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load departments. Please try again.",
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      /*
       * Primary and JSS classes cannot have departments.
       */
      if (
        name === "education_level" &&
        (value === "PRIMARY" ||
          value === "JSS")
      ) {
        next.department = "";
      }

      return next;
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // NAME
    // -------------------------------------------------------

    if (!form.name.trim()) {
      setError("Class name is required.");
      return;
    }

    // -------------------------------------------------------
    // CODE
    // -------------------------------------------------------

    if (!form.code.trim()) {
      setError("Class code is required.");
      return;
    }

    // -------------------------------------------------------
    // CAPACITY
    // -------------------------------------------------------

    if (
      form.capacity === "" ||
      Number(form.capacity) < 1
    ) {
      setError(
        "Class capacity must be at least 1.",
      );
      return;
    }

    // -------------------------------------------------------
    // SS DEPARTMENT
    // -------------------------------------------------------

    if (
      form.education_level === "SS" &&
      !form.department
    ) {
      setError(
        "Senior Secondary classes must have a department.",
      );
      return;
    }

    // -------------------------------------------------------
    // PRIMARY / JSS DEPARTMENT
    // -------------------------------------------------------

    if (
      form.education_level !== "SS" &&
      form.department
    ) {
      setError(
        "Primary and JSS classes cannot have a department.",
      );
      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      education_level:
        form.education_level,
      description:
        form.description.trim(),
      capacity: Number(form.capacity),
      is_active: form.is_active,
      department:
        form.education_level === "SS"
          ? Number(form.department)
          : null,
    };

    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    try {
      setSaving(true);

      await createClassLevel(payload);

      setSuccess(
        "Class created successfully.",
      );

      /*
       * Give the user a moment to see the
       * success message before returning.
       */
      setTimeout(() => {
        navigate(
          "/school-admin/academics/classes",
        );
      }, 800);
    } catch (err) {
      console.error(
        "Failed to create class:",
        err,
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData,
        )
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(
                ", ",
              )}`;
            }

            if (
              typeof message === "object" &&
              message !== null
            ) {
              return `${field}: ${JSON.stringify(
                message,
              )}`;
            }

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Unable to create the class.",
        );
      } else {
        setError(
          err?.message ||
            "Unable to create the class.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    if (saving) return;

    navigate(
      "/school-admin/academics/classes",
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <GraduationCap size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add Class
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new class level for your
              school.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBack}
          disabled={saving}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={17} />
          Back to Classes
        </button>
      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-medium">
              {success}
            </p>

            <p className="mt-0.5 text-green-600">
              Returning to the Classes page...
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-medium">
              Unable to create class
            </p>

            <p className="mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM CARD
      ====================================================== */}

      <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Class Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the basic information for the new
            class.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* =================================================
              NAME + CODE
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* CLASS NAME */}

            <div>
              <label
                htmlFor="class-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Class Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="class-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. SS1 Arts"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Enter the full name of the class.
              </p>
            </div>

            {/* CLASS CODE */}

            <div>
              <label
                htmlFor="class-code"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Class Code
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="class-code"
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SS1"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Use a short unique code for the class.
              </p>
            </div>
          </div>

          {/* =================================================
              EDUCATION LEVEL
          ================================================== */}

          <div>
            <label
              htmlFor="education-level"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Education Level
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              id="education-level"
              name="education_level"
              value={form.education_level}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            >
              {EDUCATION_LEVELS.map(
                (level) => (
                  <option
                    key={level.value}
                    value={level.value}
                  >
                    {level.label}
                  </option>
                ),
              )}
            </select>

            <p className="mt-1.5 text-xs text-gray-500">
              Select whether this is a Primary,
              JSS, or Senior Secondary class.
            </p>
          </div>

          {/* =================================================
              DEPARTMENT
          ================================================== */}

          {form.education_level ===
            "SS" && (
            <div>
              <label
                htmlFor="department"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Department
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                disabled={
                  saving ||
                  loadingDepartments
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingDepartments
                    ? "Loading departments..."
                    : "Select department"}
                </option>

                {departments
                  .filter(
                    (department) =>
                      department.is_active !==
                      false,
                  )
                  .map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {department.name}
                      </option>
                    ),
                  )}
              </select>

              <p className="mt-1.5 text-xs text-gray-500">
                Senior Secondary classes must
                belong to a department.
              </p>
            </div>
          )}

          {/* =================================================
              CAPACITY
          ================================================== */}

          <div className="max-w-md">
            <label
              htmlFor="capacity"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Class Capacity
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="capacity"
              type="number"
              name="capacity"
              min="1"
              value={form.capacity}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Maximum number of students allowed in
              this class.
            </p>
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
              placeholder="Optional description for this class..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Optional information about this class.
            </p>
          </div>

          {/* =================================================
              ACTIVE STATUS
          ================================================== */}

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              disabled={saving}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <span>
              <span className="block text-sm font-medium text-gray-700">
                Active class
              </span>

              <span className="mt-0.5 block text-xs text-gray-500">
                Allow this class to be used in the
                school system.
              </span>
            </span>
          </label>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingDepartments
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Creating Class..."
                : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClass;