import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getStudents } from "../../services/studentsService";

const getListData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const emptyForm = {
  student: "",
  name: "",
  percentage: "",
  fixed_amount: "",
  scope: "ALL",
  fee_categories: [],
  invoices: [],
  reason: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

const formatMoney = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG");
};

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      } else {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      }
    });

    if (messages.length) {
      return messages.join(" | ");
    }
  }

  return fallback;
};

export default function AccountantScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [invoiceSearch, setInvoiceSearch] = useState("");

  // --------------------------------------------------
  // LOAD SCHOLARSHIPS
  // --------------------------------------------------

  const loadScholarships = async () => {
    try {
      setError("");

      const response = await api.get("/finance/scholarships/");

      setScholarships(getListData(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load scholarships."
        )
      );
    }
  };

  // --------------------------------------------------
  // LOAD FEE CATEGORIES
  // --------------------------------------------------

  const loadFeeCategories = async () => {
    try {
      const response = await api.get(
        "/finance/fee-categories/"
      );

      setFeeCategories(getListData(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load fee categories."
        )
      );
    }
  };

  // --------------------------------------------------
  // LOAD INVOICES
  // --------------------------------------------------

  const loadInvoices = async () => {
    try {
      const response = await api.get(
        "/finance/invoices/"
      );

      setInvoices(getListData(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load invoices."
        )
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        await Promise.all([
          loadScholarships(),
          loadFeeCategories(),
          loadInvoices(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------------------------
  // SEARCH STUDENTS
  // --------------------------------------------------

  useEffect(() => {
    const searchStudents = async () => {
      if (!studentSearch.trim()) {
        setStudents([]);
        return;
      }

      try {
        setStudentSearchLoading(true);

        const data = await getStudents(
          studentSearch.trim()
        );

        setStudents(getListData(data));
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Unable to search students."
          )
        );
      } finally {
        setStudentSearchLoading(false);
      }
    };

    const timer = setTimeout(searchStudents, 400);

    return () => clearTimeout(timer);
  }, [studentSearch]);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // OPEN CREATE MODAL
  // --------------------------------------------------

  const openCreateModal = () => {
    setEditingScholarship(null);
    setForm(emptyForm);
    setStudentSearch("");
    setInvoiceSearch("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (scholarship) => {
    setEditingScholarship(scholarship);

    setForm({
      student: scholarship.student || "",
      name: scholarship.name || "",
      percentage:
        scholarship.percentage !== null &&
        scholarship.percentage !== undefined
          ? scholarship.percentage
          : "",
      fixed_amount:
        scholarship.fixed_amount !== null &&
        scholarship.fixed_amount !== undefined
          ? scholarship.fixed_amount
          : "",
      scope: scholarship.scope || "ALL",
      fee_categories:
        scholarship.fee_categories || [],
      invoices:
        scholarship.invoices || [],
      reason: scholarship.reason || "",
      start_date: scholarship.start_date || "",
      end_date: scholarship.end_date || "",
      is_active:
        scholarship.is_active !== false,
    });

    setStudentSearch(
      scholarship.student_name ||
        scholarship.student_admission_number ||
        ""
    );

    setInvoiceSearch("");

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingScholarship(null);
    setForm(emptyForm);
    setStudentSearch("");
    setInvoiceSearch("");
  };

  // --------------------------------------------------
  // SELECT STUDENT
  // --------------------------------------------------

  const selectStudent = (student) => {
    setForm((previous) => ({
      ...previous,
      student: student.id,
      invoices: [],
    }));

    setStudentSearch(
      student.admission_number ||
        student.full_name ||
        student.name ||
        ""
    );

    setStudents([]);
  };

  // --------------------------------------------------
  // FILTER INVOICES FOR SELECTED STUDENT
  // --------------------------------------------------

  const studentInvoices = useMemo(() => {
    if (!form.student) {
      return [];
    }

    return invoices.filter((invoice) => {
      const invoiceStudentId =
        invoice.student ??
        invoice.student_id;

      return Number(invoiceStudentId) ===
        Number(form.student);
    });
  }, [invoices, form.student]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return studentInvoices;
    }

    return studentInvoices.filter((invoice) => {
      const invoiceNumber = String(
        invoice.invoice_number || ""
      ).toLowerCase();

      const feeCategory = String(
        invoice.fee_category_name || ""
      ).toLowerCase();

      const status = String(
        invoice.status || ""
      ).toLowerCase();

      return (
        invoiceNumber.includes(query) ||
        feeCategory.includes(query) ||
        status.includes(query)
      );
    });
  }, [studentInvoices, invoiceSearch]);

  // --------------------------------------------------
  // TOGGLE FEE CATEGORY
  // --------------------------------------------------

  const toggleFeeCategory = (categoryId) => {
    setForm((previous) => {
      const exists =
        previous.fee_categories.includes(
          categoryId
        );

      return {
        ...previous,
        fee_categories: exists
          ? previous.fee_categories.filter(
              (id) => id !== categoryId
            )
          : [
              ...previous.fee_categories,
              categoryId,
            ],
      };
    });
  };

  // --------------------------------------------------
  // TOGGLE INVOICE
  // --------------------------------------------------

  const toggleInvoice = (invoiceId) => {
    setForm((previous) => {
      const exists =
        previous.invoices.includes(invoiceId);

      return {
        ...previous,
        invoices: exists
          ? previous.invoices.filter(
              (id) => id !== invoiceId
            )
          : [
              ...previous.invoices,
              invoiceId,
            ],
      };
    });
  };

  // --------------------------------------------------
  // CHANGE SCOPE
  // --------------------------------------------------

  const handleScopeChange = (event) => {
    const scope = event.target.value;

    setForm((previous) => ({
      ...previous,
      scope,
      fee_categories: [],
      invoices: [],
    }));

    setInvoiceSearch("");
  };

  // --------------------------------------------------
  // SAVE SCHOLARSHIP
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.student) {
      setError("Please select a student.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter the scholarship name.");
      return;
    }

    const hasPercentage =
      form.percentage !== "" &&
      form.percentage !== null;

    const hasFixedAmount =
      form.fixed_amount !== "" &&
      form.fixed_amount !== null;

    if (!hasPercentage && !hasFixedAmount) {
      setError(
        "Enter either a percentage or a fixed amount."
      );
      return;
    }

    if (hasPercentage && hasFixedAmount) {
      setError(
        "Use either percentage or fixed amount, not both."
      );
      return;
    }

    if (
      hasPercentage &&
      (
        Number(form.percentage) < 0 ||
        Number(form.percentage) > 100
      )
    ) {
      setError(
        "Percentage must be between 0 and 100."
      );
      return;
    }

    if (
      hasFixedAmount &&
      Number(form.fixed_amount) < 0
    ) {
      setError(
        "Fixed amount cannot be negative."
      );
      return;
    }

    if (!form.start_date) {
      setError("Please select a start date.");
      return;
    }

    if (
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      form.scope === "FEE_CATEGORIES" &&
      form.fee_categories.length === 0
    ) {
      setError(
        "Select at least one fee category."
      );
      return;
    }

    if (
      form.scope === "INVOICES" &&
      form.invoices.length === 0
    ) {
      setError(
        "Select at least one invoice."
      );
      return;
    }

    const payload = {
      student: Number(form.student),
      name: form.name.trim(),
      percentage: hasPercentage
        ? form.percentage
        : null,
      fixed_amount: hasFixedAmount
        ? form.fixed_amount
        : null,
      scope: form.scope,
      fee_categories:
        form.scope === "FEE_CATEGORIES"
          ? form.fee_categories.map(Number)
          : [],
      invoices:
        form.scope === "INVOICES"
          ? form.invoices.map(Number)
          : [],
      reason: form.reason.trim(),
      start_date: form.start_date,
      end_date: form.end_date || null,
      is_active: form.is_active,
    };

    try {
      setSaving(true);

      if (editingScholarship) {
        await api.patch(
          `/finance/scholarships/${editingScholarship.id}/`,
          payload
        );

        setSuccess(
          "Scholarship updated successfully."
        );
      } else {
        await api.post(
          "/finance/scholarships/",
          payload
        );

        setSuccess(
          "Scholarship created successfully."
        );
      }

      await loadScholarships();

      closeModal();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save scholarship."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE SCHOLARSHIP
  // --------------------------------------------------

  const handleDelete = async (scholarship) => {
    const confirmed = window.confirm(
      `Delete scholarship "${scholarship.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/finance/scholarships/${scholarship.id}/`
      );

      setSuccess(
        "Scholarship deleted successfully."
      );

      await loadScholarships();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete scholarship."
        )
      );
    }
  };

  // --------------------------------------------------
  // APPLY SCHOLARSHIP
  // --------------------------------------------------

  const handleApply = async (scholarship) => {
    const confirmed = window.confirm(
      `Apply "${scholarship.name}" to the applicable existing invoices for this student?`
    );

    if (!confirmed) return;

    try {
      setApplyingId(scholarship.id);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/finance/scholarships/${scholarship.id}/apply/`
      );

      const data = response.data;

      setSuccess(
        data?.message ||
          "Scholarship applied successfully."
      );

      await Promise.all([
        loadScholarships(),
        loadInvoices(),
      ]);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to apply scholarship."
        )
      );
    } finally {
      setApplyingId(null);
    }
  };

  // --------------------------------------------------
  // FILTER SCHOLARSHIPS
  // --------------------------------------------------

  const filteredScholarships = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return scholarships;
    }

    return scholarships.filter((scholarship) => {
      return (
        String(
          scholarship.name || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          scholarship.student_name || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          scholarship.scope || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          scholarship.reason || ""
        )
          .toLowerCase()
          .includes(query)
      );
    });
  }, [scholarships, search]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const stats = useMemo(() => {
    const active = scholarships.filter(
      (item) => item.is_active
    ).length;

    const inactive =
      scholarships.length - active;

    const percentageCount =
      scholarships.filter(
        (item) =>
          item.percentage !== null &&
          item.percentage !== undefined
      ).length;

    const fixedCount =
      scholarships.filter(
        (item) =>
          item.fixed_amount !== null &&
          item.fixed_amount !== undefined
      ).length;

    return {
      total: scholarships.length,
      active,
      inactive,
      percentageCount,
      fixedCount,
    };
  }, [scholarships]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">
          Loading scholarships...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Scholarships
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage student scholarships and apply
            discounts to eligible invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Add Scholarship
        </button>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.total}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.active}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive
          </p>
          <p className="text-2xl font-bold text-gray-500 mt-1">
            {stats.inactive}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Percentage
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.percentageCount}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Fixed Amount
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.fixedCount}
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by scholarship name, student, scope or reason..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">
                  Student
                </th>

                <th className="text-left px-4 py-3">
                  Scholarship
                </th>

                <th className="text-left px-4 py-3">
                  Value
                </th>

                <th className="text-left px-4 py-3">
                  Scope
                </th>

                <th className="text-left px-4 py-3">
                  Start
                </th>

                <th className="text-left px-4 py-3">
                  End
                </th>

                <th className="text-left px-4 py-3">
                  Status
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredScholarships.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No scholarships found.
                  </td>
                </tr>
              ) : (
                filteredScholarships.map(
                  (scholarship) => (
                    <tr
                      key={scholarship.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {scholarship.student_name ||
                            "-"}
                        </div>

                        {scholarship.student_admission_number && (
                          <div className="text-xs text-gray-500 mt-1">
                            {
                              scholarship.student_admission_number
                            }
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {scholarship.name}
                        </div>

                        {scholarship.reason && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {scholarship.reason}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {scholarship.percentage !==
                          null &&
                        scholarship.percentage !==
                          undefined ? (
                          <span className="font-medium">
                            {scholarship.percentage}%
                          </span>
                        ) : (
                          <span className="font-medium">
                            ₦
                            {formatMoney(
                              scholarship.fixed_amount
                            )}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {scholarship.scope ===
                          "ALL"
                            ? "All Categories"
                            : scholarship.scope ===
                              "FEE_CATEGORIES"
                            ? "Selected Categories"
                            : "Specific Invoices"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(
                          scholarship.start_date
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(
                          scholarship.end_date
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {scholarship.is_active ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleApply(
                                scholarship
                              )
                            }
                            disabled={
                              applyingId ===
                              scholarship.id ||
                              !scholarship.is_active
                            }
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-medium"
                          >
                            {applyingId ===
                            scholarship.id
                              ? "Applying..."
                              : "Apply"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                scholarship
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                scholarship
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingScholarship
                    ? "Edit Scholarship"
                    : "Create Scholarship"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Configure the scholarship and
                  determine which invoices it applies
                  to.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              {/* STUDENT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student
                </label>

                <input
                  type="text"
                  value={studentSearch}
                  onChange={(event) => {
                    setStudentSearch(
                      event.target.value
                    );

                    if (
                      form.student &&
                      event.target.value !==
                        studentSearch
                    ) {
                      setForm((previous) => ({
                        ...previous,
                        student: "",
                        invoices: [],
                      }));
                    }
                  }}
                  placeholder="Search by admission number or student name..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

                {studentSearchLoading && (
                  <p className="text-xs text-gray-500 mt-2">
                    Searching students...
                  </p>
                )}

                {students.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() =>
                          selectStudent(student)
                        }
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">
                          {student.full_name ||
                            student.name ||
                            `${student.first_name || ""} ${student.last_name || ""}`}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          Admission Number:{" "}
                          {student.admission_number ||
                            "-"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {form.student && (
                  <div className="mt-2 text-sm text-green-600">
                    Student selected.
                  </div>
                )}
              </div>

              {/* NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Academic Excellence Scholarship"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* VALUE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage
                  </label>

                  <input
                    type="number"
                    name="percentage"
                    value={form.percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 25"
                    disabled={
                      form.fixed_amount !== ""
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if using a fixed
                    amount.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fixed Amount
                  </label>

                  <input
                    type="number"
                    name="fixed_amount"
                    value={form.fixed_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50000"
                    disabled={
                      form.percentage !== ""
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if using a percentage.
                  </p>
                </div>
              </div>

              {/* SCOPE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Scope
                </label>

                <select
                  value={form.scope}
                  onChange={handleScopeChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">
                    All Fee Categories
                  </option>

                  <option value="FEE_CATEGORIES">
                    Selected Fee Categories
                  </option>

                  <option value="INVOICES">
                    Specific Invoices
                  </option>
                </select>
              </div>

              {/* FEE CATEGORIES */}

              {form.scope ===
                "FEE_CATEGORIES" && (
                <div className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Fee Categories
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Select the fee categories that
                        this scholarship should cover.
                      </p>
                    </div>

                    <span className="text-xs text-gray-500">
                      {
                        form.fee_categories.length
                      }{" "}
                      selected
                    </span>
                  </div>

                  {feeCategories.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No fee categories found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {feeCategories.map(
                        (category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={form.fee_categories.includes(
                                category.id
                              )}
                              onChange={() =>
                                toggleFeeCategory(
                                  category.id
                                )
                              }
                              className="h-4 w-4"
                            />

                            <div>
                              <div className="font-medium text-gray-800">
                                {category.name}
                              </div>

                              {category.description && (
                                <div className="text-xs text-gray-500">
                                  {
                                    category.description
                                  }
                                </div>
                              )}
                            </div>
                          </label>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* INVOICES */}

              {form.scope === "INVOICES" && (
                <div className="border rounded-xl p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800">
                      Specific Invoices
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Select the invoices that this
                      scholarship should cover.
                    </p>
                  </div>

                  {!form.student ? (
                    <p className="text-sm text-gray-500">
                      Select a student first.
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={invoiceSearch}
                        onChange={(event) =>
                          setInvoiceSearch(
                            event.target.value
                          )
                        }
                        placeholder="Search invoice number, fee category or status..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="text-xs text-gray-500 mb-3">
                        {
                          form.invoices.length
                        }{" "}
                        invoice(s) selected
                      </div>

                      {filteredInvoices.length ===
                      0 ? (
                        <p className="text-sm text-gray-500">
                          No invoices found for this
                          student.
                        </p>
                      ) : (
                        <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
                          {filteredInvoices.map(
                            (invoice) => (
                              <label
                                key={invoice.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={form.invoices.includes(
                                    invoice.id
                                  )}
                                  onChange={() =>
                                    toggleInvoice(
                                      invoice.id
                                    )
                                  }
                                  className="h-4 w-4"
                                />

                                <div className="flex-1">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                                    <div className="font-medium text-gray-800">
                                      {
                                        invoice.invoice_number
                                      }
                                    </div>

                                    <div className="text-sm text-gray-700">
                                      Balance: ₦
                                      {formatMoney(
                                        invoice.balance
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-500 mt-1">
                                    {
                                      invoice.fee_category_name
                                    }{" "}
                                    •{" "}
                                    {
                                      invoice.status
                                    }
                                  </div>
                                </div>
                              </label>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* REASON */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Why is this scholarship being awarded?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ACTIVE */}

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-gray-700">
                  Scholarship is active
                </span>
              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-blue-300"
                >
                  {saving
                    ? "Saving..."
                    : editingScholarship
                    ? "Update Scholarship"
                    : "Create Scholarship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}