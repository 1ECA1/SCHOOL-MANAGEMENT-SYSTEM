import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  X,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
} from "lucide-react";
import api from "../../services/api";

function AccountantExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    expense_category: "",
    academic_session: "",
    term: "",
    title: "",
    amount: "",
    payment_method: "CASH",
    status: "PENDING",
    expense_date: new Date().toISOString().split("T")[0],
    paid_to: "",
    reference: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) {
      return "Something went wrong. Please try again.";
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
      const messages = Object.entries(data)
        .map(([field, value]) => {
          if (Array.isArray(value)) {
            return `${field}: ${value.join(", ")}`;
          }

          if (typeof value === "object" && value !== null) {
            return `${field}: ${JSON.stringify(value)}`;
          }

          return `${field}: ${value}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Something went wrong. Please try again.";
  };

  const getArrayData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const loadData = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        expensesResponse,
        categoriesResponse,
        sessionsResponse,
        termsResponse,
      ] = await Promise.all([
        api.get("/finance/expenses/"),
        api.get("/finance/expense-categories/"),
        api.get("/academics/sessions/"),
        api.get("/academics/terms/"),
      ]);

      setExpenses(getArrayData(expensesResponse.data));
      setCategories(getArrayData(categoriesResponse.data));
      setSessions(getArrayData(sessionsResponse.data));
      setTerms(getArrayData(termsResponse.data));
    } catch (err) {
      console.error("Failed to load expense data:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      expense_category: "",
      academic_session: "",
      term: "",
      title: "",
      amount: "",
      payment_method: "CASH",
      status: "PENDING",
      expense_date: new Date().toISOString().split("T")[0],
      paid_to: "",
      reference: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setError("");
    setSuccess("");

    setForm({
      expense_category: "",
      academic_session: "",
      term: "",
      title: "",
      amount: "",
      payment_method: "CASH",
      status: "PENDING",
      expense_date: new Date().toISOString().split("T")[0],
      paid_to: "",
      reference: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (expense) => {
    setError("");
    setSuccess("");

    setForm({
      expense_category: expense.expense_category || "",
      academic_session: expense.academic_session || "",
      term: expense.term || "",
      title: expense.title || "",
      amount: expense.amount || "",
      payment_method: expense.payment_method || "CASH",
      status: expense.status || "PENDING",
      expense_date: expense.expense_date || "",
      paid_to: expense.paid_to || "",
      reference: expense.reference || "",
      description: expense.description || "",
    });

    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.expense_category) {
      setError("Please select an expense category.");
      return;
    }

    if (!form.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    if (!form.title.trim()) {
      setError("Expense title is required.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Expense amount must be greater than zero.");
      return;
    }

    if (!form.expense_date) {
      setError("Expense date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        expense_category: Number(form.expense_category),
        academic_session: Number(form.academic_session),
        term: Number(form.term),
        title: form.title.trim(),
        amount: form.amount,
        payment_method: form.payment_method,
        status: form.status,
        expense_date: form.expense_date,
        paid_to: form.paid_to.trim(),
        reference: form.reference.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        await api.patch(
          `/finance/expenses/${editingId}/`,
          payload
        );

        setSuccess("Expense updated successfully.");
      } else {
        await api.post(
          "/finance/expenses/",
          payload
        );

        setSuccess("Expense created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Failed to save expense:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (amount) => {
    const number = Number(amount || 0);

    return `₦${number.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 size={14} />
          Paid
        </span>
      );
    }

    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={14} />
          Cancelled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock3 size={14} />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <FileText size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Expenses
            </h1>

            <p className="text-sm text-slate-500">
              Record and manage school expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />

            Add Expense
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />
          <p>{success}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Edit Expense" : "Add Expense"}
              </h2>

              <p className="text-sm text-slate-500">
                Enter the expense information below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense Category
                </label>

                <select
                  name="expense_category"
                  value={form.expense_category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        category.is_active !== false
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Session */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Academic Session
                </label>

                <select
                  name="academic_session"
                  value={form.academic_session}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">
                    Select session
                  </option>

                  {sessions.map((session) => (
                    <option
                      key={session.id}
                      value={session.id}
                    >
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Term
                </label>

                <select
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">
                    Select term
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Electricity Bill"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                  <option value="CARD">Card</option>
                  <option value="POS">POS</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              {/* Expense Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense Date
                </label>

                <input
                  type="date"
                  name="expense_date"
                  value={form.expense_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>

              {/* Paid To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Paid To
                </label>

                <input
                  type="text"
                  name="paid_to"
                  value={form.paid_to}
                  onChange={handleChange}
                  placeholder="Person or company"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reference
                </label>

                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  placeholder="Receipt / transaction reference"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Optional expense description..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Expense"
                    : "Create Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">
            Expense Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {expenses.length}{" "}
            {expenses.length === 1
              ? "expense"
              : "expenses"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-[var(--color-primary)]"
            />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileText size={26} />
            </div>

            <h3 className="font-semibold text-slate-700">
              No expenses recorded
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first expense to get started.
            </p>

            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expense
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {expense.title}
                      </div>

                      {expense.paid_to && (
                        <div className="mt-1 text-xs text-slate-500">
                          Paid to: {expense.paid_to}
                        </div>
                      )}

                      {expense.reference && (
                        <div className="mt-1 text-xs text-slate-400">
                          Ref: {expense.reference}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {expense.expense_category_name ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {formatAmount(expense.amount)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {expense.payment_method_display ||
                        expense.payment_method ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(expense.expense_date)}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(expense.status)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(expense)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
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
    </div>
  );
}

export default AccountantExpenses;