
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getSubjects,
  getDepartments,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../services/academicsService";

const EDUCATION_LEVELS = [
  { value: "PRIMARY", label: "Primary" },
  { value: "JSS", label: "Junior Secondary (JSS)" },
  { value: "SS", label: "Senior Secondary (SS)" },
];

const EDUCATION_LEVEL_LABELS = Object.fromEntries(
  EDUCATION_LEVELS.map(({ value, label }) => [value, label])
);

const EMPTY_FORM = {
  name: "",
  code: "",
  education_level: "PRIMARY",
  department: "",
  description: "",
  is_core: false,
  is_active: true,
};

function getList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function getDepartmentSchoolId(department) {
  const school = department?.school;

  if (school && typeof school === "object") {
    return school.id ?? school.pk ?? null;
  }

  return school ?? department?.school_id ?? null;
}

function getDepartmentId(department) {
  return department?.id ?? department?.pk;
}

function getDepartmentName(department) {
  return department?.name ?? department?.title ?? "Unnamed department";
}

function getSubjectDepartmentId(subject) {
  const department = subject?.department;

  if (department && typeof department === "object") {
    return String(department.id ?? department.pk ?? "");
  }

  return department == null ? "" : String(department);
}

function getSubjectEducationLevel(subject) {
  return subject?.education_level ?? subject?.educationLevel ?? "";
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(" ")
          : typeof messages === "string"
            ? messages
            : JSON.stringify(messages);

        return `${field === "non_field_errors" ? "Error" : field}: ${message}`;
      })
      .join("\n");
  }

  return error?.message || "Something went wrong. Please try again.";
}

export default function Subjects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [subjectsResponse, departmentsResponse] = await Promise.all([
        getSubjects(),
        getDepartments(),
      ]);

      setSubjects(getList(subjectsResponse));
      setDepartments(getList(departmentsResponse));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // The API scopes records to the logged-in School Admin.
  // Filter departments by school when the returned data provides school IDs.
  const schoolId = useMemo(() => {
    const subjectWithSchool = subjects.find(
      (subject) => subject.school != null || subject.school_id != null
    );

    if (!subjectWithSchool) return null;

    const school = subjectWithSchool.school;

    if (school && typeof school === "object") {
      return school.id ?? school.pk ?? null;
    }

    return school ?? subjectWithSchool.school_id ?? null;
  }, [subjects]);

  const availableDepartments = useMemo(() => {
    const activeDepartments = departments.filter(
      (department) => department.is_active !== false
    );

    if (schoolId == null) {
      return activeDepartments;
    }

    return activeDepartments.filter((department) => {
      const departmentSchoolId = getDepartmentSchoolId(department);

      return (
        departmentSchoolId == null ||
        String(departmentSchoolId) === String(schoolId)
      );
    });
  }, [departments, schoolId]);

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const name = String(subject.name ?? "").toLowerCase();
      const code = String(subject.code ?? "").toLowerCase();
      const description = String(subject.description ?? "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        code.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const level = getSubjectEducationLevel(subject);
      const matchesEducation = !educationFilter || level === educationFilter;

      const active = subject.is_active !== false;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesEducation && matchesStatus;
    });
  }, [subjects, search, educationFilter, statusFilter]);

  const activeCount = subjects.filter(
    (subject) => subject.is_active !== false
  ).length;

  const inactiveCount = subjects.length - activeCount;

  const openAddForm = useCallback(() => {
    setEditingSubject(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((subject) => {
    setEditingSubject(subject);

    setForm({
      name: subject.name ?? "",
      code: subject.code ?? "",
      education_level: getSubjectEducationLevel(subject) || "PRIMARY",
      department: getSubjectDepartmentId(subject),
      description: subject.description ?? "",
      is_core: Boolean(subject.is_core),
      is_active: subject.is_active !== false,
    });

    setFormError("");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    if (saving) return;

    setIsFormOpen(false);
    setEditingSubject(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  }, [saving]);

  // Open Edit when navigating back from the subject details page.
  useEffect(() => {
    const editSubjectId = location.state?.editSubjectId;

    if (editSubjectId == null || subjects.length === 0) return;

    const subject = subjects.find(
      (item) => String(item.id) === String(editSubjectId)
    );

    if (subject) {
      openEditForm(subject);
    }

    navigate("/school-admin/academics/subjects", {
      replace: true,
      state: {},
    });
  }, [location.state, subjects, openEditForm, navigate]);

  const handleEducationLevelChange = (value) => {
    setForm((current) => ({
      ...current,
      education_level: value,
      // Departments apply only to Senior Secondary subjects.
      department: value === "SS" ? current.department : "",
    }));

    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();

    if (!name) {
      setFormError("Please enter the subject name.");
      return;
    }

    if (!code) {
      setFormError("Please enter the subject code.");
      return;
    }

    if (!form.education_level) {
      setFormError("Please select an education level.");
      return;
    }

    const selectedDepartment = form.department
      ? availableDepartments.find(
          (department) =>
            String(getDepartmentId(department)) === String(form.department)
        )
      : null;

    if (
      form.education_level === "SS" &&
      form.department &&
      !selectedDepartment
    ) {
      setFormError(
        "The selected department is not available for this school. Please select a valid department."
      );
      return;
    }

    const payload = {
      name,
      code,
      education_level: form.education_level,
      department:
        form.education_level === "SS" && form.department
          ? Number(form.department)
          : null,
      description: form.description.trim(),
      is_core: Boolean(form.is_core),
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
        setSuccess("Subject updated successfully.");
      } else {
        await createSubject(payload);
        setSuccess("Subject created successfully.");
      }

      setIsFormOpen(false);
      setEditingSubject(null);
      setForm({ ...EMPTY_FORM });

      await loadData(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}" (${subject.code})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(subject.id);
    setError("");
    setSuccess("");

    try {
      await deleteSubject(subject.id);
      setSuccess(`"${subject.name}" was deleted successfully.`);

      setSubjects((current) =>
        current.filter((item) => item.id !== subject.id)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const getDepartmentLabel = (subject) => {
    const departmentId = getSubjectDepartmentId(subject);

    if (!departmentId) return "General";

    const department = departments.find(
      (item) => String(getDepartmentId(item)) === departmentId
    );

    return department ? getDepartmentName(department) : "Department assigned";
  };

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <BookOpen size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Subjects
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage subjects and their education levels and departments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadData(false)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Subject
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <CircleAlert size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1 whitespace-pre-line">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">{success}</div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Subjects
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {subjects.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Subjects
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inactive Subjects
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-500">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          <Filter size={17} />
          Search and Filter
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative min-w-0">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, code or description..."
              className="w-full min-w-0 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={educationFilter}
              onChange={(event) => setEducationFilter(event.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All Education Levels</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Subject list */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Subject List
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 size={21} className="animate-spin" />
            Loading subjects...
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
            <BookOpen size={35} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-700 dark:text-gray-200">
              No subjects found
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try changing your filters or add a new subject.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
                <tr>
                  {/* Always visible on mobile and desktop */}
                  <th className="w-full px-4 py-3.5 font-semibold sm:px-5 md:w-auto">
                    Subject
                  </th>

                  {/* Hidden on mobile */}
                  <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    Code
                  </th>
                  <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    Education Level
                  </th>
                  <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    Department
                  </th>
                  <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    Type
                  </th>
                  <th className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    Status
                  </th>

                  {/* View remains visible on mobile */}
                  <th className="w-16 px-3 py-3.5 text-right font-semibold sm:px-5 md:w-auto">
                    <span className="md:hidden">View</span>
                    <span className="hidden md:inline">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredSubjects.map((subject) => {
                  const level = getSubjectEducationLevel(subject);
                  const isActive = subject.is_active !== false;

                  return (
                    <tr
                      key={subject.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    >
                      {/* Subject name only on mobile */}
                      <td className="min-w-0 px-4 py-4 sm:px-5">
                        <div className="break-words font-medium text-gray-900 dark:text-white">
                          {subject.name}
                        </div>

                        {/* Description appears on desktop only */}
                        {subject.description && (
                          <div className="mt-1 hidden max-w-xs truncate text-xs text-gray-500 dark:text-gray-400 md:block">
                            {subject.description}
                          </div>
                        )}
                      </td>

                      <td className="hidden px-5 py-4 font-mono text-gray-600 dark:text-gray-300 md:table-cell">
                        {subject.code}
                      </td>

                      <td className="hidden px-5 py-4 text-gray-600 dark:text-gray-300 md:table-cell">
                        {EDUCATION_LEVEL_LABELS[level] || level || "Not set"}
                      </td>

                      <td className="hidden px-5 py-4 text-gray-600 dark:text-gray-300 md:table-cell">
                        {level === "SS" ? getDepartmentLabel(subject) : "—"}
                      </td>

                      <td className="hidden px-5 py-4 md:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            subject.is_core
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {subject.is_core ? "Core" : "Elective"}
                        </span>
                      </td>

                      <td className="hidden px-5 py-4 md:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-3 py-4 sm:px-5">
                        <div className="flex items-center justify-end gap-1">
                          {/* View: visible on every screen size */}
                          <button
                            type="button"
                            title="View subject"
                            aria-label={`View ${subject.name}`}
                            onClick={() =>
                              navigate(
                                `/school-admin/academics/subjects/${subject.id}`
                              )
                            }
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Edit: desktop only */}
                          <button
                            type="button"
                            title="Edit subject"
                            aria-label={`Edit ${subject.name}`}
                            onClick={() => openEditForm(subject)}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 md:inline-flex dark:hover:bg-blue-900/30"
                          >
                            <Edit size={17} />
                          </button>

                          {/* Delete: desktop only */}
                          <button
                            type="button"
                            title="Delete subject"
                            aria-label={`Delete ${subject.name}`}
                            disabled={deletingId === subject.id}
                            onClick={() => handleDelete(subject)}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 md:inline-flex dark:hover:bg-red-900/30"
                          >
                            {deletingId === subject.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Subject modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-form-title"
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-gray-900"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2
                  id="subject-form-title"
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {editingSubject ? "Edit Subject" : "Add Subject"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select the education level and, for SS, the department.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {formError && (
                <div className="flex items-start gap-2 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <CircleAlert size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="subject-name"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject-name"
                    type="text"
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Mathematics"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject-code"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject-code"
                    type="text"
                    required
                    maxLength={20}
                    value={form.code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. MTH101"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject-education-level"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject-education-level"
                  required
                  value={form.education_level}
                  onChange={(event) =>
                    handleEducationLevelChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
                >
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  This determines which education level the subject belongs to.
                </p>
              </div>

              {form.education_level === "SS" && (
                <div>
                  <label
                    htmlFor="subject-department"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Department
                  </label>
                  <select
                    id="subject-department"
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
                  >
                    <option value="">General / No department</option>
                    {availableDepartments.map((department) => (
                      <option
                        key={getDepartmentId(department)}
                        value={getDepartmentId(department)}
                      >
                        {getDepartmentName(department)}
                        {department.code ? ` (${department.code})` : ""}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Select Arts, Science, Technology, or another department
                    for a department-specific subject. Leave blank for a
                    general Senior Secondary subject.
                  </p>

                  {availableDepartments.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      No departments were returned by the departments API.
                      Check that departments have been created for this school
                      and that the API returns their school field.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="subject-description"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Description
                </label>
                <textarea
                  id="subject-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional description of the subject"
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_core}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_core: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                      Core Subject
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      Mark this as a core subject rather than an elective.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                      Active
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      Make this subject available for use.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={17} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingSubject
                      ? "Save Changes"
                      : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}