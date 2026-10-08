
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getClassLevels,
  getSubjects,
  createClassSubject,
} from "../../../services/academicsService";

const ASSIGNMENT_TYPES = [
  {
    value: "GENERAL_COMPULSORY",
    label: "General Compulsory",
    description: "A compulsory subject for the whole class.",
  },
  {
    value: "DEPARTMENT_COMPULSORY",
    label: "Department Compulsory",
    description: "A compulsory subject belonging to the class department.",
  },
  {
    value: "OPTIONAL",
    label: "Optional",
    description: "An optional subject available for the class.",
  },
];

function getList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

function AddClassSubject() {
  const navigate = useNavigate();

  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    class_level: "",
    subject: "",
    assignment_type: "GENERAL_COMPULSORY",
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [classLevelsData, subjectsData] = await Promise.all([
          getClassLevels(),
          getSubjects(),
        ]);

        setClassLevels(getList(classLevelsData));
        setSubjects(getList(subjectsData));
      } catch (err) {
        console.error("Failed to load class-subject form data:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load the class-subject form data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedClass = useMemo(() => {
    return classLevels.find(
      (item) => String(item.id) === String(formData.class_level),
    );
  }, [classLevels, formData.class_level]);

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (item) => String(item.id) === String(formData.subject),
    );
  }, [subjects, formData.subject]);

  const educationLevel = selectedClass?.education_level || "";

  const classDepartmentId =
    selectedClass?.department_id ||
    selectedClass?.department?.id ||
    selectedClass?.department?.pk ||
    null;

  const classDepartmentName =
    selectedClass?.department_name ||
    selectedClass?.department?.name ||
    "";

  const filteredSubjects = useMemo(() => {
    if (!educationLevel) {
      return [];
    }

    let availableSubjects = subjects.filter(
      (subject) => subject.education_level === educationLevel,
    );

    /*
     * Primary and JSS subjects must not belong to a department.
     */
    if (educationLevel === "PRIMARY" || educationLevel === "JSS") {
      availableSubjects = availableSubjects.filter(
        (subject) =>
          !(
            subject.department_id ||
            subject.department?.id ||
            subject.department?.pk
          ),
      );
    }

    /*
     * SS:
     *
     * GENERAL_COMPULSORY:
     *   only subjects without a department.
     *
     * DEPARTMENT_COMPULSORY:
     *   only subjects belonging to the selected class department.
     *
     * OPTIONAL:
     *   all SS subjects are allowed by the current model rules.
     */
    if (
      educationLevel === "SS" &&
      formData.assignment_type === "GENERAL_COMPULSORY"
    ) {
      availableSubjects = availableSubjects.filter(
        (subject) =>
          !(
            subject.department_id ||
            subject.department?.id ||
            subject.department?.pk
          ),
      );
    }

    if (
      educationLevel === "SS" &&
      formData.assignment_type === "DEPARTMENT_COMPULSORY"
    ) {
      availableSubjects = availableSubjects.filter((subject) => {
        const subjectDepartmentId =
          subject.department_id ||
          subject.department?.id ||
          subject.department?.pk ||
          null;

        return (
          classDepartmentId &&
          subjectDepartmentId &&
          String(subjectDepartmentId) === String(classDepartmentId)
        );
      });
    }

    return availableSubjects;
  }, [
    subjects,
    educationLevel,
    formData.assignment_type,
    classDepartmentId,
  ]);

  useEffect(() => {
    /*
     * If the currently selected subject is no longer valid after
     * changing the class or assignment type, clear it.
     */
    if (
      formData.subject &&
      !filteredSubjects.some(
        (subject) => String(subject.id) === String(formData.subject),
      )
    ) {
      setFormData((current) => ({
        ...current,
        subject: "",
      }));
    }
  }, [filteredSubjects, formData.subject]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.class_level) {
      errors.class_level = "Please select a class.";
    }

    if (!formData.subject) {
      errors.subject = "Please select a subject.";
    }

    if (!formData.assignment_type) {
      errors.assignment_type = "Please select an assignment type.";
    }

    if (selectedClass && selectedSubject) {
      if (
        selectedClass.education_level !== selectedSubject.education_level
      ) {
        errors.subject =
          "The subject education level must match the class education level.";
      }

      const subjectDepartmentId =
        selectedSubject.department_id ||
        selectedSubject.department?.id ||
        selectedSubject.department?.pk ||
        null;

      /*
       * PRIMARY / JSS
       */
      if (
        selectedClass.education_level === "PRIMARY" ||
        selectedClass.education_level === "JSS"
      ) {
        if (subjectDepartmentId) {
          errors.subject =
            "Primary and JSS subjects cannot belong to a department.";
        }

        if (formData.assignment_type === "DEPARTMENT_COMPULSORY") {
          errors.assignment_type =
            "Department compulsory subjects are only available for SS classes.";
        }
      }

      /*
       * SS
       */
      if (selectedClass.education_level === "SS") {
        if (formData.assignment_type === "GENERAL_COMPULSORY") {
          if (subjectDepartmentId) {
            errors.subject =
              "This subject belongs to a department and cannot be used as a General Compulsory subject.";
          }
        }

        if (formData.assignment_type === "DEPARTMENT_COMPULSORY") {
          if (!classDepartmentId) {
            errors.class_level =
              "The selected SS class must have a department.";
          } else if (!subjectDepartmentId) {
            errors.subject =
              "A Department Compulsory subject must belong to a department.";
          } else if (
            String(classDepartmentId) !== String(subjectDepartmentId)
          ) {
            errors.subject =
              "The subject must belong to the same department as the selected class.";
          }
        }
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        class_level: Number(formData.class_level),
        subject: Number(formData.subject),
        assignment_type: formData.assignment_type,

        /*
         * Legacy field.
         * Compulsory assignments remain core.
         * Optional assignments are not core.
         */
        is_core: formData.assignment_type !== "OPTIONAL",

        is_active: formData.is_active,
      };

      await createClassSubject(payload);

      navigate("/school-admin/academics/class-subjects");
    } catch (err) {
      console.error("Failed to create class-subject assignment:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const backendErrors = {};

        Object.entries(responseData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            backendErrors[key] = value.join(" ");
          } else if (typeof value === "string") {
            backendErrors[key] = value;
          } else {
            backendErrors[key] = String(value);
          }
        });

        setFieldErrors(backendErrors);

        if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.non_field_errors) {
          setError(
            Array.isArray(responseData.non_field_errors)
              ? responseData.non_field_errors.join(" ")
              : String(responseData.non_field_errors),
          );
        } else {
          setError("Please correct the errors below.");
        }
      } else {
        setError("Failed to assign the subject to the class.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/school-admin/academics/class-subjects");
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)] dark:border-slate-700"
              role="status"
              aria-label="Loading"
            />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading class subjects...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          <button
            type="button"
            onClick={handleCancel}
            className="transition hover:text-[var(--color-primary)]"
          >
            Academic
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={handleCancel}
            className="transition hover:text-[var(--color-primary)]"
          >
            Class Subjects
          </button>

          <span>/</span>

          <span className="text-[var(--color-primary)]">
            Assign Subject
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Assign Subject
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Assign a subject to a class and define how the subject should be
          treated.
        </p>
      </div>

      {/* Global Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          <p className="font-semibold">Unable to assign subject</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700/70">
          {/* Form Header */}
          <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700/70 sm:px-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Subject Assignment Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select the class, subject, and assignment type.
            </p>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            {/* Class */}
            <div>
              <label
                htmlFor="class_level"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Class <span className="text-red-500">*</span>
              </label>

              <select
                id="class_level"
                name="class_level"
                value={formData.class_level}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 focus:ring-[var(--color-primary)] ${
                  fieldErrors.class_level
                    ? "border-red-400 focus:ring-red-400"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                <option value="">Select class</option>

                {classLevels.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                    disabled={classLevel.is_active === false}
                  >
                    {classLevel.name}
                    {classLevel.education_level
                      ? ` — ${classLevel.education_level}`
                      : ""}
                    {classLevel.department_name
                      ? ` — ${classLevel.department_name}`
                      : classLevel.department?.name
                        ? ` — ${classLevel.department.name}`
                        : ""}
                    {classLevel.is_active === false
                      ? " (Inactive)"
                      : ""}
                  </option>
                ))}
              </select>

              {fieldErrors.class_level && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.class_level}
                </p>
              )}

              {selectedClass && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {selectedClass.education_level || "—"}
                    </span>

                    {classDepartmentName && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Department: {classDepartmentName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Assignment Type <span className="text-red-500">*</span>
              </label>

              <div className="grid gap-3 md:grid-cols-3">
                {ASSIGNMENT_TYPES.map((type) => {
                  const selected =
                    formData.assignment_type === type.value;

                  const disabled =
                    !selectedClass ||
                    (type.value === "DEPARTMENT_COMPULSORY" &&
                      selectedClass.education_level !== "SS");

                  return (
                    <label
                      key={type.value}
                      className={`relative flex cursor-pointer rounded-xl border p-4 transition ${
                        disabled
                          ? "cursor-not-allowed opacity-50"
                          : selected
                            ? "border-[var(--color-primary)] bg-blue-50/70 dark:bg-blue-950/20"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="assignment_type"
                        value={type.value}
                        checked={selected}
                        onChange={handleChange}
                        disabled={disabled}
                        className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                      />

                      <div className="ml-3">
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {type.label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {fieldErrors.assignment_type && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.assignment_type}
                </p>
              )}

              {!selectedClass && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Select a class first to choose the available assignment
                  types.
                </p>
              )}

              {selectedClass?.education_level === "PRIMARY" && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Primary classes can use General Compulsory or Optional
                  subjects.
                </p>
              )}

              {selectedClass?.education_level === "JSS" && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  JSS classes can use General Compulsory or Optional
                  subjects.
                </p>
              )}

              {selectedClass?.education_level === "SS" && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  SS classes can use General Compulsory, Department
                  Compulsory, or Optional subjects.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Subject <span className="text-red-500">*</span>
              </label>

              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={!selectedClass}
                className={`w-full rounded-lg border bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 ${
                  fieldErrors.subject
                    ? "border-red-400 focus:ring-red-400"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                <option value="">
                  {!selectedClass
                    ? "Select a class first"
                    : filteredSubjects.length === 0
                      ? "No matching subjects available"
                      : "Select subject"}
                </option>

                {filteredSubjects.map((subject) => {
                  const departmentName =
                    subject.department_name ||
                    subject.department?.name ||
                    "";

                  return (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                      {subject.code ? ` (${subject.code})` : ""}
                      {departmentName ? ` — ${departmentName}` : ""}
                    </option>
                  );
                })}
              </select>

              {fieldErrors.subject && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.subject}
                </p>
              )}

              {selectedClass && filteredSubjects.length === 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  No subjects match this class and assignment type. Check
                  your subjects and department configuration.
                </p>
              )}

              {selectedSubject && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedSubject.code && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Code: {selectedSubject.code}
                      </span>
                    )}

                    {selectedSubject.department_name ||
                    selectedSubject.department?.name ? (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Department:{" "}
                        {selectedSubject.department_name ||
                          selectedSubject.department.name}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        No Department
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--color-primary)]"
                />

                <span>
                  <span className="block text-sm font-semibold text-[var(--color-text)]">
                    Active Assignment
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Active assignments are available for normal academic
                    use. You can deactivate this assignment later.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700/70 dark:bg-slate-800/40 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !formData.class_level ||
                !formData.subject ||
                filteredSubjects.length === 0
              }
              className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900 sm:w-auto"
            >
              {saving ? "Assigning Subject..." : "Assign Subject"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddClassSubject;
