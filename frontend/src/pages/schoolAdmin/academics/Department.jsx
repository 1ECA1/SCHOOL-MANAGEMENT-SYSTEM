import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSchools,
} from "../../../services/academicsService";

const EMPTY_FORM = {
  name: "",
  code: "",
  school: "",
  head_name: "",
  description: "",
  is_active: true,
};

const Department = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isDetailsPage = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]);

  const [department, setDepartment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments();

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load departments:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SCHOOLS
  // =========================================================

  const loadSchools = async () => {
    try {
      const data = await getSchools();

      setSchools(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load schools:", err);
    }
  };

  // =========================================================
  // LOAD DEPARTMENT DETAILS
  // =========================================================

  const loadDepartment = async () => {
    if (!id) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError("");

      const data = await getDepartment(id);

      setDepartment(data);
    } catch (err) {
      console.error("Failed to load department:", err);

      setDetailsError(
        err.response?.data?.detail ||
          "Failed to load department."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (isDetailsPage) {
      loadDepartment();
    } else {
      loadDepartments();
      loadSchools();
    }
  }, [id]);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreate = () => {
    setEditingId(null);

    setForm(EMPTY_FORM);

    setShowForm(true);

    setError("");
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      code: item.code || "",
      school:
        item.school !== undefined && item.school !== null
          ? String(item.school)
          : "",
      head_name: item.head_name || "",
      description: item.description || "",
      is_active: Boolean(item.is_active),
    });

    setShowForm(true);

    setError("");
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // =========================================================
  // SAVE DEPARTMENT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Department code is required.");
      return;
    }

    if (!form.school) {
      setError("School is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        school: Number(form.school),
        head_name: form.head_name.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
      };

      if (editingId) {
        const updated = await updateDepartment(
          editingId,
          payload
        );

        setDepartments((previous) =>
          previous.map((item) =>
            item.id === editingId ? updated : item
          )
        );
      } else {
        const created = await createDepartment(payload);

        setDepartments((previous) => [
          ...previous,
          created,
        ]);
      }

      closeForm();
    } catch (err) {
      console.error("Failed to save department:", err);

      const responseData = err.response?.data;

      if (typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            "Failed to save department."
        );
      } else {
        setError("Failed to save department.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE DEPARTMENT
  // =========================================================

  const handleDelete = async (departmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDepartment(departmentId);

      setDepartments((previous) =>
        previous.filter(
          (item) => item.id !== departmentId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete department:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to delete department."
      );
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = async (item) => {
    try {
      const payload = {
        name: item.name,
        code: item.code,
        school: Number(item.school),
        head_name: item.head_name || "",
        description: item.description || "",
        is_active: !item.is_active,
      };

      const updated = await updateDepartment(
        item.id,
        payload
      );

      setDepartments((previous) =>
        previous.map((departmentItem) =>
          departmentItem.id === item.id
            ? updated
            : departmentItem
        )
      );
    } catch (err) {
      console.error(
        "Failed to update department status:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to update department status."
      );
    }
  };

  // =========================================================
  // SCHOOL NAME
  // =========================================================

  const getSchoolName = (schoolId) => {
    if (!schoolId) {
      return "—";
    }

    const school = schools.find(
      (item) =>
        Number(item.id) === Number(schoolId)
    );

    return school?.name || school?.school_name || "—";
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString();
  };

  // =========================================================
  // DETAILS PAGE
  // =========================================================

  if (isDetailsPage) {
    if (detailsLoading) {
      return (
        <div className="min-h-[300px] bg-[var(--color-background)] px-4 py-10 text-center text-slate-500 sm:px-6">
          Loading department...
        </div>
      );
    }

    if (detailsError || !department) {
      return (
        <div className="min-h-[300px] bg-[var(--color-background)] px-4 py-6 sm:px-6">
          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/academics/departments")
            }
            className="mb-4 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            ← Back to Departments
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {detailsError || "Department not found."}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/academics/departments")
          }
          className="mb-4 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
        >
          ← Back to Departments
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold sm:text-3xl">
              {department.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Department Code:{" "}
              <span className="font-medium">
                {department.code}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setForm({
                name: department.name || "",
                code: department.code || "",
                school:
                  department.school !== undefined &&
                  department.school !== null
                    ? String(department.school)
                    : "",
                head_name:
                  department.head_name || "",
                description:
                  department.description || "",
                is_active:
                  Boolean(department.is_active),
              });

              setEditingId(department.id);

              setShowForm(true);
            }}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            Edit Department
          </button>
        </div>

        {/* =================================================
            DETAILS CARD
        ================================================= */}

        <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:p-6 md:grid-cols-2">
            {/* Department Name */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Department Name
              </p>

              <p className="mt-1 break-words text-base font-medium">
                {department.name || "—"}
              </p>
            </div>

            {/* Code */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Code
              </p>

              <p className="mt-1 text-base font-medium">
                {department.code || "—"}
              </p>
            </div>

            {/* School */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                School
              </p>

              <p className="mt-1 break-words text-base font-medium">
                {department.school_name ||
                  department.school ||
                  "—"}
              </p>
            </div>

            {/* Head */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Head of Department
              </p>

              <p className="mt-1 break-words text-base font-medium">
                {department.head_name || "—"}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  department.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {department.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {/* Created */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 text-base">
                {formatDate(department.created_at)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-200 p-5 dark:border-slate-700 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </p>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
              {department.description ||
                "No description provided."}
            </p>
          </div>
        </div>

        {/* =================================================
            EDIT MODAL
        ================================================= */}

        {showForm && (
          <DepartmentFormModal
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            closeForm={closeForm}
            saving={saving}
            editingId={editingId}
            schools={schools}
          />
        )}
      </div>
    );
  }

  // =========================================================
  // LIST PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your school departments.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        >
          + Add Department
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="rounded-xl bg-[var(--color-card)] p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading departments...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    School
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Head
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {departments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  departments.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold">
                            {item.name}
                          </p>

                          {item.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.code}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.school_name ||
                          item.school ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.head_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(item)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/school-admin/academics/departments/${item.id}`
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800"
                            title="View department"
                            aria-label="View department"
                          >
                            <EyeIcon />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(item)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-50"
                            title="Edit department"
                            aria-label="Edit department"
                          >
                            <EditIcon />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                            title="Delete department"
                            aria-label="Delete department"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              MOBILE LIST
          ================================================= */}

          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">
            {departments.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No departments found.
              </div>
            ) : (
              departments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {item.code || "—"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/school-admin/academics/departments/${item.id}`
                      )
                    }
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800"
                    title="View department"
                    aria-label="View department"
                  >
                    <EyeIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showForm && (
        <DepartmentFormModal
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          closeForm={closeForm}
          saving={saving}
          editingId={editingId}
          schools={schools}
        />
      )}
    </div>
  );
};

// =========================================================
// DEPARTMENT FORM MODAL
// =========================================================

const DepartmentFormModal = ({
  form,
  handleChange,
  handleSubmit,
  closeForm,
  saving,
  editingId,
  schools,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl bg-[var(--color-card)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
          <div>
            <h2 className="text-lg font-bold">
              {editingId
                ? "Edit Department"
                : "Add Department"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {editingId
                ? "Update department information."
                : "Create a new department."}
            </p>
          </div>

          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="text-xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Department Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Art Department"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {/* Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Code
              </label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. ART"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {/* School */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                School
              </label>

              <select
                name="school"
                value={form.school}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="">
                  Select school
                </option>

                {schools.map((school) => (
                  <option
                    key={school.id}
                    value={school.id}
                  >
                    {school.name ||
                      school.school_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Head */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Head of Department
              </label>

              <input
                type="text"
                name="head_name"
                value={form.head_name}
                onChange={handleChange}
                placeholder="e.g. Mr Linuse"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe this department..."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />

                <span className="text-sm font-medium">
                  Active Department
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Department"
                : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================
// ICONS
// =========================================================

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.514 7.756 7.466 5 12 5s8.486 2.756 9.938 6.652a1 1 0 0 1 0 .696C20.486 16.244 16.534 19 12 19s-8.486-2.756-9.938-6.652Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

export default Department;