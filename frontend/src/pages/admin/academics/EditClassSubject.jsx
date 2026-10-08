import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getClassSubject,
  updateClassSubject,
  getClassLevels,
  getSubjects,
  getDepartments,
} from "../../../services/academicsService";

const ASSIGNMENT_TYPES = [
  { value: "GENERAL_COMPULSORY", label: "General Compulsory" },
  { value: "DEPARTMENT_COMPULSORY", label: "Department Compulsory" },
  { value: "OPTIONAL", label: "Optional" },
];

function EditClassSubject() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    class_level: "",
    subject: "",
    assignment_type: "GENERAL_COMPULSORY",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  /*
   * Load all required data
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          classSubjectData,
          classLevelsData,
          subjectsData,
          departmentsData,
        ] = await Promise.all([
          getClassSubject(id),
          getClassLevels(),
          getSubjects(),
          getDepartments(),
        ]);

        const classLevelsList = Array.isArray(classLevelsData)
          ? classLevelsData
          : classLevelsData.results || [];

        const subjectsList = Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData.results || [];

        const departmentsList = Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData.results || [];

        setClassLevels(classLevelsList);
        setSubjects(subjectsList);
        setDepartments(departmentsList);

        setFormData({
          class_level: classSubjectData.class_level
            ? String(
                typeof classSubjectData.class_level === "object"
                  ? classSubjectData.class_level.id
                  : classSubjectData.class_level,
              )
            : "",

          subject: classSubjectData.subject
            ? String(
                typeof classSubjectData.subject === "object"
                  ? classSubjectData.subject.id
                  : classSubjectData.subject,
              )
            : "",

          assignment_type:
            classSubjectData.assignment_type || "GENERAL_COMPULSORY",

          is_active: Boolean(classSubjectData.is_active),
        });
      } catch (err) {
        console.error("Failed to load class subject:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load class subject assignment.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /*
   * Selected class / subject
   */
  const selectedClass = useMemo(() => {
    return classLevels.find(
      (item) => Number(item.id) === Number(formData.class_level),
    );
  }, [classLevels, formData.class_level]);

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (item) => Number(item.id) === Number(formData.subject),
    );
  }, [subjects, formData.subject]);

  const educationLevel =
    selectedClass?.education_level ||
    selectedSubject?.education_level ||
    "";

  const isSeniorSecondary = educationLevel === "SS";

  /*
   * Subjects available for selected class
   */
  const filteredSubjects = useMemo(() => {
    if (!selectedClass) return [];

    return subjects.filter(
      (subject) =>
        Number(subject.school) === Number(selectedClass.school) &&
        subject.education_level === selectedClass.education_level,
    );
  }, [subjects, selectedClass]);

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "—";

    const department = departments.find(
      (item) => Number(item.id) === Number(departmentId),
    );

    return department ? department.name : "—";
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;

    setFormData((current) => ({
      ...current,
      class_level: classId,
      subject: "",
    }));

    setFieldErrors({});
  };

  const handleSubjectChange = (event) => {
    setFormData((current) => ({
      ...current,
      subject: event.target.value,
    }));

    setFieldErrors({});
  };

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    const errors = {};

    if (!formData.class_level) {
      errors.class_level = "Please select a class.";
    }

    if (!formData.subject) {
      errors.subject = "Please select a subject.";
    }

    if (formData.class_level && formData.subject) {
      const classItem = classLevels.find(
        (item) => Number(item.id) === Number(formData.class_level),
      );

      const subjectItem = subjects.find(
        (item) => Number(item.id) === Number(formData.subject),
      );

      if (classItem && subjectItem) {
        if (Number(classItem.school) !== Number(subjectItem.school)) {
          errors.subject =
            "The selected subject does not belong to the same school as the class.";
        }

        if (classItem.education_level !== subjectItem.education_level) {
          errors.subject =
            "The selected subject must belong to the same education level as the class.";
        }

        if (classItem.education_level === "SS") {
          if (formData.assignment_type === "GENERAL_COMPULSORY") {
            if (subjectItem.department) {
              errors.subject =
                "General Compulsory subjects cannot belong to a department.";
            }
          }

          if (formData.assignment_type === "DEPARTMENT_COMPULSORY") {
            if (!classItem.department) {
              errors.class_level =
                "The selected Senior Secondary class must have a department.";
            }

            if (!subjectItem.department) {
              errors.subject =
                "A Department Compulsory subject must belong to a department.";
            }

            if (
              classItem.department &&
              subjectItem.department &&
              Number(classItem.department) !== Number(subjectItem.department)
            ) {
              errors.subject =
                "The subject department must match the class department.";
            }
          }
        } else if (formData.assignment_type === "DEPARTMENT_COMPULSORY") {
          errors.assignment_type =
            "Department Compulsory is only available for Senior Secondary classes.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        class_level: Number(formData.class_level),
        subject: Number(formData.subject),
        assignment_type: formData.assignment_type,
        is_active: formData.is_active,
      };

      await updateClassSubject(id, payload);

      navigate("/admin/academic/class-subjects");
    } catch (err) {
      console.error("Failed to update class subject:", err);

      const backendErrors = err.response?.data;

      if (
        backendErrors &&
        typeof backendErrors === "object" &&
        !backendErrors.detail
      ) {
        setFieldErrors(backendErrors);
      } else {
        setError(
          backendErrors?.detail ||
            "Failed to update class subject assignment.",
        );
      }
    } finally {
      setSaving(false);
    }
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
              Loading class subject...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate("/admin/academic/class-subjects")}
            className="transition hover:text-[var(--color-primary)]"
          >
            Class Subjects
          </button>

          <span>/</span>

          <span className="text-[var(--color-primary)]">Edit</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Edit Class Subject
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Update the subject assignment for this class.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/academic/class-subjects")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* General Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold dark:bg-red-900/50">
            !
          </div>

          <div>
            <p className="font-semibold">Unable to update class subject</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main Form */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700/70">
            {/* Assignment Details */}
            <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700/70 sm:px-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Assignment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select the class and subject you want to associate.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    onChange={handleClassChange}
                    aria-invalid={Boolean(fieldErrors.class_level)}
                    className={`w-full rounded-lg border bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 ${
                      fieldErrors.class_level
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 dark:border-slate-600"
                    }`}
                  >
                    <option value="">Select class</option>

                    {classLevels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.class_level && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {Array.isArray(fieldErrors.class_level)
                        ? fieldErrors.class_level.join(" ")
                        : fieldErrors.class_level}
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
                    onChange={handleSubjectChange}
                    disabled={!selectedClass}
                    aria-invalid={Boolean(fieldErrors.subject)}
                    className={`w-full rounded-lg border bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                      fieldErrors.subject
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 dark:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                    }`}
                  >
                    <option value="">
                      {selectedClass ? "Select subject" : "Select a class first"}
                    </option>

                    {filteredSubjects.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.code ? ` (${item.code})` : ""}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.subject && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {Array.isArray(fieldErrors.subject)
                        ? fieldErrors.subject.join(" ")
                        : fieldErrors.subject}
                    </p>
                  )}

                  {selectedClass && filteredSubjects.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      No subjects are available for this class education level.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Senior Secondary Options */}
            {isSeniorSecondary && (
              <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700/70 sm:px-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm dark:bg-purple-900/30">
                      🎓
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-text)]">
                        Senior Secondary Options
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Configure department for this Senior Secondary subject.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Department
                  </label>

                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[var(--color-text)] dark:border-slate-700 dark:bg-slate-800/60">
                    {selectedClass?.department ? (
                      getDepartmentName(selectedClass.department)
                    ) : selectedSubject?.department ? (
                      getDepartmentName(selectedSubject.department)
                    ) : (
                      <span className="text-slate-400">No department</span>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    The department is determined by the selected class and subject.
                  </p>
                </div>
              </div>
            )}

            {/* Assignment Settings */}
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Assignment Settings
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure how this subject behaves for the class.
                </p>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="assignment_type"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Assignment Type <span className="text-red-500">*</span>
                </label>

                <select
                  id="assignment_type"
                  name="assignment_type"
                  value={formData.assignment_type}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.assignment_type)}
                  className={`w-full rounded-lg border bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 ${
                    fieldErrors.assignment_type
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 dark:border-slate-600"
                  }`}
                >
                  {ASSIGNMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {fieldErrors.assignment_type && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {Array.isArray(fieldErrors.assignment_type)
                      ? fieldErrors.assignment_type.join(" ")
                      : fieldErrors.assignment_type}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  General Compulsory applies to everyone in the class. Department
                  Compulsory applies only within the class's department (Senior
                  Secondary only). Optional subjects can be freely chosen.
                </p>
              </div>

              {/* Active */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  formData.is_active
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    Active Assignment
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Keep this subject assignment active for the class.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700/70 dark:bg-slate-800/30 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => navigate("/admin/academic/class-subjects")}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-[var(--color-card)] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Preview / Information */}
          <div className="space-y-6">
            {/* Assignment Preview */}
            <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700/70">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Assignment Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review the assignment before saving.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Class
                  </p>

                  <p className="mt-1 font-semibold text-[var(--color-text)]">
                    {selectedClass?.name || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Education Level
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-text)]">
                    {educationLevel || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Subject
                  </p>

                  <p className="mt-1 font-semibold text-[var(--color-text)]">
                    {selectedSubject?.name || "Not selected"}
                  </p>

                  {selectedSubject?.code && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Code: {selectedSubject.code}
                    </p>
                  )}
                </div>

                {isSeniorSecondary && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Department
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {selectedClass?.department
                        ? getDepartmentName(selectedClass.department)
                        : selectedSubject?.department
                          ? getDepartmentName(selectedSubject.department)
                          : "—"}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Assignment Type
                  </p>

                  <div className="mt-2">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {
                        ASSIGNMENT_TYPES.find(
                          (type) => type.value === formData.assignment_type,
                        )?.label
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Status
                  </p>

                  <div className="mt-2">
                    {formData.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm dark:bg-blue-900/40">
                  ℹ
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                    Assignment Rules
                  </h3>

                  <ul className="mt-2 space-y-2 text-xs leading-5 text-blue-800 dark:text-blue-300">
                    <li>• Class and subject must belong to the same school.</li>
                    <li>
                      • Class and subject must have the same education level.
                    </li>
                    <li>
                      • General Compulsory subjects cannot belong to a department.
                    </li>
                    <li>
                      • Department Compulsory subjects must match the class
                      department and are only available for Senior Secondary.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditClassSubject;