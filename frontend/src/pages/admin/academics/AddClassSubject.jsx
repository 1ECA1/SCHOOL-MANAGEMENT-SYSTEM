import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getClassLevels,
  getSubjects,
  getDepartments,
  createClassSubject,
} from "../../../services/academicsService";

const ALL_ASSIGNMENT_TYPES = [
  {
    value: "GENERAL_COMPULSORY",
    label: "General Compulsory",
    description:
      "Applies to every student in the selected class.",
  },
  {
    value: "DEPARTMENT_COMPULSORY",
    label: "Department Compulsory",
    description:
      "Applies to students in the class department. Senior Secondary only.",
  },
  {
    value: "OPTIONAL",
    label: "Optional",
    description:
      "An optional subject that can be offered to eligible students.",
  },
];

const AddClassSubject = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [classes, setClasses] = useState([]);
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

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [classesData, subjectsData, departmentsData] =
          await Promise.all([
            getClassLevels(),
            getSubjects(),
            getDepartments(),
          ]);

        setClasses(
          Array.isArray(classesData)
            ? classesData
            : classesData?.results || [],
        );

        setSubjects(
          Array.isArray(subjectsData)
            ? subjectsData
            : subjectsData?.results || [],
        );

        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData?.results || [],
        );
      } catch (err) {
        console.error(
          "Failed to load class subject data:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            "Failed to load classes, subjects, or departments.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // SELECTED CLASS
  // =====================================================

  const selectedClass = useMemo(() => {
    return classes.find(
      (item) =>
        Number(item.id) ===
        Number(formData.class_level),
    );
  }, [classes, formData.class_level]);

  // =====================================================
  // SELECTED SUBJECT
  // =====================================================

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (item) =>
        Number(item.id) ===
        Number(formData.subject),
    );
  }, [subjects, formData.subject]);

  // =====================================================
  // EDUCATION LEVEL
  // =====================================================

  const educationLevel =
    selectedClass?.education_level ||
    selectedSubject?.education_level ||
    "";

  const isSeniorSecondary =
    educationLevel === "SS";

  // =====================================================
  // EDUCATION LEVEL LABEL
  // =====================================================

  const getEducationLevelLabel = (level) => {
    switch (level) {
      case "PRIMARY":
        return "Primary";

      case "JSS":
        return "Junior Secondary";

      case "SS":
        return "Senior Secondary";

      default:
        return level || "—";
    }
  };

  // =====================================================
  // AVAILABLE ASSIGNMENT TYPES
  // =====================================================

  const availableAssignmentTypes = useMemo(() => {
    if (!selectedClass) {
      return ALL_ASSIGNMENT_TYPES;
    }

    if (selectedClass.education_level === "SS") {
      return ALL_ASSIGNMENT_TYPES;
    }

    return ALL_ASSIGNMENT_TYPES.filter(
      (type) =>
        type.value !== "DEPARTMENT_COMPULSORY",
    );
  }, [selectedClass]);

  // =====================================================
  // AVAILABLE SUBJECTS
  // =====================================================

  const availableSubjects = useMemo(() => {
    if (!selectedClass) {
      return [];
    }

    return subjects.filter((subject) => {
      const sameSchool =
        Number(subject.school) ===
        Number(selectedClass.school);

      const sameEducationLevel =
        subject.education_level ===
        selectedClass.education_level;

      return (
        sameSchool &&
        sameEducationLevel
      );
    });
  }, [subjects, selectedClass]);

  // =====================================================
  // DEPARTMENT NAME
  // =====================================================

  const getDepartmentName = (departmentId) => {
    if (!departmentId) {
      return "";
    }

    const department = departments.find(
      (item) =>
        Number(item.id) ===
        Number(departmentId),
    );

    return department?.name || "";
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    // ---------------------------------------------------
    // CLASS CHANGE
    // ---------------------------------------------------

    if (name === "class_level") {
      const newClass = classes.find(
        (item) =>
          Number(item.id) === Number(value),
      );

      setFormData((previous) => ({
        ...previous,
        class_level: value,
        subject: "",
        assignment_type:
          newClass?.education_level === "SS"
            ? previous.assignment_type
            : previous.assignment_type ===
                "DEPARTMENT_COMPULSORY"
              ? "GENERAL_COMPULSORY"
              : previous.assignment_type,
      }));

      return;
    }

    // ---------------------------------------------------
    // SUBJECT CHANGE
    // ---------------------------------------------------

    if (name === "subject") {
      setFormData((previous) => ({
        ...previous,
        subject: value,
      }));

      return;
    }

    // ---------------------------------------------------
    // ASSIGNMENT TYPE CHANGE
    // ---------------------------------------------------

    if (name === "assignment_type") {
      setFormData((previous) => ({
        ...previous,
        assignment_type: value,
      }));

      return;
    }

    // ---------------------------------------------------
    // OTHER FIELDS
    // ---------------------------------------------------

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.class_level) {
      errors.class_level =
        "Please select a class.";
    }

    if (!formData.subject) {
      errors.subject =
        "Please select a subject.";
    }

    if (!formData.assignment_type) {
      errors.assignment_type =
        "Please select an assignment type.";
    }

    if (
      formData.class_level &&
      formData.subject
    ) {
      const classItem = classes.find(
        (item) =>
          Number(item.id) ===
          Number(formData.class_level),
      );

      const subjectItem = subjects.find(
        (item) =>
          Number(item.id) ===
          Number(formData.subject),
      );

      if (classItem && subjectItem) {
        // SAME SCHOOL

        if (
          Number(classItem.school) !==
          Number(subjectItem.school)
        ) {
          errors.subject =
            "The selected subject does not belong to the same school as the class.";
        }

        // SAME EDUCATION LEVEL

        if (
          classItem.education_level !==
          subjectItem.education_level
        ) {
          errors.subject =
            "The selected subject must have the same education level as the class.";
        }

        // PRIMARY / JSS

        if (
          classItem.education_level !== "SS" &&
          formData.assignment_type ===
            "DEPARTMENT_COMPULSORY"
        ) {
          errors.assignment_type =
            "Department Compulsory is only available for Senior Secondary classes.";
        }

        // SENIOR SECONDARY

        if (
          classItem.education_level === "SS"
        ) {
          // GENERAL COMPULSORY

          if (
            formData.assignment_type ===
            "GENERAL_COMPULSORY"
          ) {
            if (subjectItem.department) {
              errors.subject =
                "General Compulsory subjects cannot belong to a department.";
            }
          }

          // DEPARTMENT COMPULSORY

          if (
            formData.assignment_type ===
            "DEPARTMENT_COMPULSORY"
          ) {
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
              Number(classItem.department) !==
                Number(subjectItem.department)
            ) {
              errors.subject =
                "The selected subject must belong to the same department as the class.";
            }
          }

          // OPTIONAL

          if (
            formData.assignment_type ===
            "OPTIONAL"
          ) {
            // No department restriction.
          }
        }
      }
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        class_level: Number(
          formData.class_level,
        ),
        subject: Number(
          formData.subject,
        ),
        assignment_type:
          formData.assignment_type,
        is_active: formData.is_active,
      };

      await createClassSubject(payload);

      navigate(
        "/admin/academic/class-subjects",
      );
    } catch (err) {
      console.error(
        "Failed to create class subject:",
        err,
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const errors = {};

        Object.entries(responseData).forEach(
          ([key, value]) => {
            errors[key] = Array.isArray(
              value,
            )
              ? value.join(" ")
              : String(value);
          },
        );

        setFieldErrors(errors);
      }

      let message =
        "Failed to assign subject to class.";

      if (responseData?.detail) {
        message = responseData.detail;
      } else if (
        responseData?.non_field_errors
      ) {
        message = Array.isArray(
          responseData.non_field_errors,
        )
          ? responseData.non_field_errors.join(
              " ",
            )
          : responseData.non_field_errors;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />

            <p className="mt-4 text-sm text-[var(--color-text)]/60">
              Loading classes and subjects...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full w-full bg-[var(--color-background)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="w-full">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-base">
                📚
              </span>

              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Academic Setup
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Assign Subject to Class
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text)]/60 sm:text-base">
              Connect a subject to a specific
              class and configure how it is
              offered.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/academic/class-subjects",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-background)] dark:border-white/10"
          >
            <span>←</span>
            Back to Class Subjects
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <span className="mt-0.5 text-lg">
              ⚠
            </span>

            <div>
              <p className="font-semibold">
                Unable to assign subject
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================== */}

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">

          {/* =================================================
              FORM
          ================================================== */}

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[var(--color-card)] shadow-sm dark:border-white/10">

              {/* FORM HEADER */}

              <div className="border-b border-black/10 px-5 py-5 dark:border-white/10 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-lg text-[var(--color-primary)]">
                    🎓
                  </div>

                  <div>
                    <h2 className="text-base font-bold">
                      Assignment Details
                    </h2>

                    <p className="text-xs text-[var(--color-text)]/55">
                      Select the class and subject
                      you want to connect.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6"
              >

                {/* CLASS */}

                <div className="mb-6">
                  <label
                    htmlFor="class_level"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Class
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="class_level"
                    name="class_level"
                    value={
                      formData.class_level
                    }
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                      fieldErrors.class_level
                        ? "border-red-500"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    <option value="">
                      Select a class
                    </option>

                    {classes.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}

                        {item.department
                          ? ` — ${getDepartmentName(
                              item.department,
                            )}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.class_level && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {fieldErrors.class_level}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-[var(--color-text)]/55">
                    Choose the class that will
                    receive this subject.
                  </p>
                </div>

                {/* CLASS INFORMATION */}

                {selectedClass && (
                  <div className="mb-6 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">
                        🏫
                      </span>

                      <h3 className="text-sm font-bold">
                        Selected Class
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Class
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedClass.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Education Level
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {getEducationLevelLabel(
                            selectedClass.education_level,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedClass.department
                            ? getDepartmentName(
                                selectedClass.department,
                              )
                            : "No department"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBJECT */}

                <div className="mb-6">
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Subject
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={
                      formData.subject
                    }
                    onChange={handleChange}
                    disabled={!selectedClass}
                    className={`w-full rounded-xl border bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldErrors.subject
                        ? "border-red-500"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    <option value="">
                      {!selectedClass
                        ? "Select a class first"
                        : availableSubjects.length ===
                            0
                          ? "No compatible subjects available"
                          : "Select a subject"}
                    </option>

                    {availableSubjects.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name} (
                          {item.code})

                          {item.department
                            ? ` — ${getDepartmentName(
                                item.department,
                              )}`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  {fieldErrors.subject && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {fieldErrors.subject}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-[var(--color-text)]/55">
                    Only subjects belonging to
                    the same school and education
                    level are shown.
                  </p>
                </div>

                {/* SUBJECT INFORMATION */}

                {selectedSubject && (
                  <div className="mb-6 rounded-xl border border-black/10 bg-[var(--color-background)] p-4 dark:border-white/10">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">
                        📖
                      </span>

                      <h3 className="text-sm font-bold">
                        Selected Subject
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Subject
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedSubject.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Code
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedSubject.code}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Level
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {getEducationLevelLabel(
                            selectedSubject.education_level,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedSubject.department
                            ? getDepartmentName(
                                selectedSubject.department,
                              )
                            : "No department"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ASSIGNMENT TYPE */}

                <div className="mb-6">
                  <label
                    htmlFor="assignment_type"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Assignment Type
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="assignment_type"
                    name="assignment_type"
                    value={
                      formData.assignment_type
                    }
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
                      fieldErrors.assignment_type
                        ? "border-red-500"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    {availableAssignmentTypes.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ),
                    )}
                  </select>

                  {fieldErrors.assignment_type && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {
                        fieldErrors.assignment_type
                      }
                    </p>
                  )}

                  {formData.assignment_type && (
                    <div className="mt-3 rounded-lg bg-[var(--color-background)] px-3 py-2.5">
                      <p className="text-xs text-[var(--color-text)]/65">
                        {
                          ALL_ASSIGNMENT_TYPES.find(
                            (type) =>
                              type.value ===
                              formData.assignment_type,
                          )?.description
                        }
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[var(--color-text)]/55">
                    {selectedClass?.education_level ===
                    "SS"
                      ? "All three assignment types are available for Senior Secondary."
                      : selectedClass
                        ? "Primary and Junior Secondary classes support General Compulsory and Optional subjects."
                        : "Select a class to see the appropriate assignment types."}
                  </p>
                </div>

                {/* ACTIVE */}

                <div className="mb-6">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 p-4 transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 dark:border-white/10">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />

                    <span>
                      <span className="block text-sm font-semibold">
                        Active Assignment
                      </span>

                      <span className="mt-1 block text-xs text-[var(--color-text)]/55">
                        Keep this subject assignment
                        active for the class.
                      </span>
                    </span>
                  </label>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      navigate(
                        "/admin/academic/class-subjects",
                      )
                    }
                    className="rounded-xl border border-black/10 bg-[var(--color-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Assign Subject
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-6">

            {/* SUMMARY */}

            <div className="rounded-2xl border border-black/10 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  📋
                </div>

                <div>
                  <h3 className="text-sm font-bold">
                    Assignment Summary
                  </h3>

                  <p className="text-xs text-[var(--color-text)]/55">
                    Current selection
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                {/* CLASS */}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]/40">
                    Class
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedClass?.name ||
                      "Not selected"}
                  </p>
                </div>

                {/* SUBJECT */}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]/40">
                    Subject
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedSubject?.name ||
                      "Not selected"}
                  </p>
                </div>

                {/* LEVEL */}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]/40">
                    Education Level
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {educationLevel
                      ? getEducationLevelLabel(
                          educationLevel,
                        )
                      : "Not selected"}
                  </p>
                </div>

                {/* CLASS DEPARTMENT */}

                {isSeniorSecondary && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]/40">
                      Class Department
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {selectedClass?.department
                        ? getDepartmentName(
                            selectedClass.department,
                          )
                        : "Not assigned"}
                    </p>
                  </div>
                )}

                {/* SUBJECT DEPARTMENT */}

                {selectedSubject &&
                  isSeniorSecondary && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text)]/40">
                        Subject Department
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {selectedSubject.department
                          ? getDepartmentName(
                              selectedSubject.department,
                            )
                          : "No department"}
                      </p>
                    </div>
                  )}

                {/* ASSIGNMENT */}

                <div className="border-t border-black/10 pt-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--color-text)]/55">
                      Assignment Type
                    </span>

                    <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
                      {
                        ALL_ASSIGNMENT_TYPES.find(
                          (type) =>
                            type.value ===
                            formData.assignment_type,
                        )?.label
                      }
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text)]/55">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        formData.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {formData.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RULES */}

            <div className="rounded-2xl border border-black/10 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                  💡
                </div>

                <div>
                  <h3 className="text-sm font-bold">
                    Assignment Rules
                  </h3>

                  <p className="text-xs text-[var(--color-text)]/55">
                    How assignments work
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-5 text-[var(--color-text)]/60">

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    The class and subject must
                    belong to the same school.
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    The education level of the
                    class and subject must match.
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    Primary and JSS classes cannot
                    use Department Compulsory.
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    General Compulsory subjects
                    cannot belong to a department.
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    Department Compulsory subjects
                    must match the class department
                    and are only available for Senior
                    Secondary.
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="text-[var(--color-primary)]">
                    ✓
                  </span>

                  <span>
                    Optional subjects can be offered
                    without a department restriction.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClassSubject;