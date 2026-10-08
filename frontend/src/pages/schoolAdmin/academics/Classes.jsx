import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Pencil,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  GraduationCap,
  Users,
  Building2,
  X,
} from "lucide-react";

import {
  getClassLevels,
  createClassLevel,
  updateClassLevel,
  deleteClassLevel,
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
  { value: "PRIMARY", label: "Primary" },
  { value: "JSS", label: "Junior Secondary (JSS)" },
  { value: "SS", label: "Senior Secondary (SS)" },
];

function Classes() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [educationFilter, setEducationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [classesData, departmentsData] = await Promise.all([
        getClassLevels(),
        getDepartments(),
      ]);

      /*
       * DRF may return either:
       *   [...]
       *
       * or:
       *   { results: [...] }
       *
       * Support both formats.
       */
      const normalizedClasses = Array.isArray(classesData)
        ? classesData
        : classesData?.results || [];

      const normalizedDepartments = Array.isArray(departmentsData)
        ? departmentsData
        : departmentsData?.results || [];

      setClasses(normalizedClasses);
      setDepartments(normalizedDepartments);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load classes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // DEPARTMENT HELPER
  // =========================================================

  const getDepartmentName = (departmentId) => {
    if (
      departmentId === null ||
      departmentId === undefined ||
      departmentId === ""
    ) {
      return "—";
    }

    const department = departments.find(
      (item) => Number(item.id) === Number(departmentId),
    );

    if (department) {
      return department.name;
    }

    return `Department #${departmentId}`;
  };

  // =========================================================
  // FILTERED CLASSES
  // =========================================================

  const filteredClasses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return classes.filter((item) => {
      const departmentName = getDepartmentName(item.department);

      const matchesSearch =
        !searchValue ||
        item.name?.toLowerCase().includes(searchValue) ||
        item.code?.toLowerCase().includes(searchValue) ||
        departmentName?.toLowerCase().includes(searchValue);

      const matchesEducation =
        educationFilter === "ALL" ||
        item.education_level === educationFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.is_active) ||
        (statusFilter === "INACTIVE" && !item.is_active);

      return (
        matchesSearch &&
        matchesEducation &&
        matchesStatus
      );
    });
  }, [
    classes,
    departments,
    search,
    educationFilter,
    statusFilter,
  ]);

  // =========================================================
  // FORM HELPERS
  // =========================================================

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingClass(null);
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingClass(item);

    setForm({
      name: item.name || "",
      code: item.code || "",
      education_level: item.education_level || "PRIMARY",
      department:
        item.department !== null &&
        item.department !== undefined
          ? String(item.department)
          : "",
      description: item.description || "",
      capacity: item.capacity ?? 40,
      is_active: item.is_active ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      /*
       * Primary and JSS classes cannot have departments.
       */
      if (
        name === "education_level" &&
        (value === "PRIMARY" || value === "JSS")
      ) {
        next.department = "";
      }

      return next;
    });
  };

  // =========================================================
  // VIEW CLASS
  // =========================================================

  const handleView = (item) => {
    navigate(`/school-admin/academics/classes/${item.id}`);
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Class name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Class code is required.");
      return;
    }

    if (!form.capacity || Number(form.capacity) < 1) {
      setError("Class capacity must be at least 1.");
      return;
    }

    if (
      form.education_level === "SS" &&
      !form.department
    ) {
      setError(
        "Senior Secondary classes must have a department.",
      );
      return;
    }

    if (
      form.education_level !== "SS" &&
      form.department
    ) {
      setError(
        "Primary and JSS classes cannot have a department.",
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      education_level: form.education_level,
      description: form.description.trim(),
      capacity: Number(form.capacity),
      is_active: form.is_active,
    };

    /*
     * The backend automatically handles the school.
     *
     * For SS, send the selected department ID.
     *
     * For Primary/JSS, explicitly send null.
     */
    if (form.education_level === "SS") {
      payload.department = Number(form.department);
    } else {
      payload.department = null;
    }

    try {
      setSaving(true);

      if (editingClass) {
        const updated = await updateClassLevel(
          editingClass.id,
          payload,
        );

        setClasses((current) =>
          current.map((item) =>
            item.id === editingClass.id
              ? updated
              : item,
          ),
        );

        setSuccess("Class updated successfully.");
      } else {
        const created = await createClassLevel(payload);

        setClasses((current) => [
          created,
          ...current,
        ]);

        setSuccess("Class created successfully.");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);

      const responseData = err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(responseData)
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            if (
              typeof message === "object" &&
              message !== null
            ) {
              return `${field}: ${JSON.stringify(message)}`;
            }

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages || "Unable to save the class.",
        );
      } else {
        setError("Unable to save the class.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteClassLevel(item.id);

      setClasses((current) =>
        current.filter(
          (classItem) => classItem.id !== item.id,
        ),
      );

      setSuccess("Class deleted successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this class. It may already be in use.",
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getEducationLabel = (value) => {
    const item = EDUCATION_LEVELS.find(
      (level) => level.value === value,
    );

    return item?.label || value;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Classes
              </h1>

              <p className="text-sm text-gray-500">
                Manage your school's class levels and
                departments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Class
          </button>
        </div>
      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-700 hover:text-green-900"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && !showModal && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {classes.length}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <GraduationCap size={22} />
            </div>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {
                  classes.filter(
                    (item) => item.is_active,
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* JSS */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                JSS Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {
                  classes.filter(
                    (item) =>
                      item.education_level === "JSS",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <GraduationCap size={22} />
            </div>
          </div>
        </div>

        {/* SS */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                SS Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {
                  classes.filter(
                    (item) =>
                      item.education_level === "SS",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
              <Building2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search class, code or department..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* EDUCATION */}
          <select
            value={educationFilter}
            onChange={(event) =>
              setEducationFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Education Levels
            </option>

            {EDUCATION_LEVELS.map((level) => (
              <option
                key={level.value}
                value={level.value}
              >
                {level.label}
              </option>
            ))}
          </select>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2
                size={22}
                className="animate-spin"
              />

              Loading classes...
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <GraduationCap
              size={42}
              className="text-gray-300"
            />

            <h3 className="mt-3 text-base font-semibold text-gray-800">
              No classes found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters, or
              create a new class.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* CLASS - ALWAYS VISIBLE */}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
                    Class
                  </th>

                  {/* CODE - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Code
                  </th>

                  {/* LEVEL - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Level
                  </th>

                  {/* DEPARTMENT - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Department
                  </th>

                  {/* STUDENTS - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Students
                  </th>

                  {/* CAPACITY - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Capacity
                  </th>

                  {/* STATUS - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Status
                  </th>

                  {/* ACTIONS */}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50"
                  >
                    {/* CLASS */}
                    <td className="px-4 py-4 md:px-5">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>

                        {/* Show code under class name only on mobile */}
                        {item.code && (
                          <div className="mt-1 text-xs font-medium text-gray-400 md:hidden">
                            {item.code}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* CODE */}
                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-600 md:table-cell">
                      {item.code}
                    </td>

                    {/* LEVEL */}
                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-600 md:table-cell">
                      {getEducationLabel(
                        item.education_level,
                      )}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-600 md:table-cell">
                      {getDepartmentName(
                        item.department,
                      )}
                    </td>

                    {/* STUDENTS */}
                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-600 md:table-cell">
                      {item.student_count ?? 0}
                    </td>

                    {/* CAPACITY */}
                    <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-600 md:table-cell">
                      {item.capacity ?? "—"}
                    </td>

                    {/* STATUS */}
                    <td className="hidden whitespace-nowrap px-5 py-4 md:table-cell">
                      {item.is_active ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="whitespace-nowrap px-4 py-4 md:px-5">
                      <div className="flex justify-end gap-2">
                        {/* VIEW - ALWAYS VISIBLE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleView(item)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View class"
                          aria-label="View class"
                        >
                          <Eye size={16} />
                        </button>

                        {/* EDIT - HIDDEN ON MOBILE */}
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 md:inline-flex"
                          title="Edit class"
                          aria-label="Edit class"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* DELETE - HIDDEN ON MOBILE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
                          title="Delete class"
                          aria-label="Delete class"
                        >
                          <Trash2 size={16} />
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

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingClass
                    ? "Edit Class"
                    : "Add Class"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure the class level and department.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* FORM ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* NAME + CODE */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Class Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. SS1 Arts"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CODE */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Class Code
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. SS1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* EDUCATION LEVEL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Education Level
                </label>

                <select
                  name="education_level"
                  value={form.education_level}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {EDUCATION_LEVELS.map((level) => (
                    <option
                      key={level.value}
                      value={level.value}
                    >
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* DEPARTMENT */}
              {form.education_level === "SS" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.is_active,
                      )
                      .map((department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Senior Secondary classes must belong
                    to a department.
                  </p>
                </div>
              )}

              {/* CAPACITY */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional class description..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ACTIVE */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-700">
                    Active class
                  </span>

                  <span className="block text-xs text-gray-500">
                    Allow this class to be used in the
                    school system.
                  </span>
                </span>
              </label>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingClass
                    ? "Update Class"
                    : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;