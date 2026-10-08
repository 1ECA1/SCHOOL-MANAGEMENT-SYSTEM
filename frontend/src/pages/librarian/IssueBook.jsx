
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBooks, createLoan } from "../../services/libraryService";
import { getStudents } from "../../services/studentsService";
import { getTeachers } from "../../services/teachersService";

function IssueBook() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    book: "",
    borrower_type: "STUDENT",
    student: "",
    teacher: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    fine_amount: "0",
    notes: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [booksData, studentsData, teachersData] =
          await Promise.all([
            getBooks(),
            getStudents(),
            getTeachers(),
          ]);

        setBooks(Array.isArray(booksData) ? booksData : []);
        setStudents(
          Array.isArray(studentsData) ? studentsData : []
        );
        setTeachers(
          Array.isArray(teachersData) ? teachersData : []
        );
      } catch (err) {
        console.error("Failed to load issue-book data:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load books, students, or teachers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // AVAILABLE BOOKS
  // =====================================================

  const availableBooks = useMemo(() => {
    return books.filter(
      (book) =>
        book.is_active !== false &&
        Number(book.available_copies) > 0
    );
  }, [books]);

  // =====================================================
  // FORM HANDLER
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleBorrowerTypeChange = (type) => {
    setForm((current) => ({
      ...current,
      borrower_type: type,
      student: "",
      teacher: "",
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.book) {
      setError("Please select a book.");
      return;
    }

    if (form.borrower_type === "STUDENT" && !form.student) {
      setError("Please select a student.");
      return;
    }

    if (form.borrower_type === "TEACHER" && !form.teacher) {
      setError("Please select a teacher.");
      return;
    }

    if (!form.issue_date) {
      setError("Please select an issue date.");
      return;
    }

    if (!form.due_date) {
      setError("Please select a due date.");
      return;
    }

    if (form.due_date < form.issue_date) {
      setError("Due date cannot be earlier than the issue date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        book: Number(form.book),
        issue_date: form.issue_date,
        due_date: form.due_date,
        fine_amount: form.fine_amount || "0",
        notes: form.notes.trim(),
      };

      if (form.borrower_type === "STUDENT") {
        payload.student = Number(form.student);
      } else {
        payload.teacher = Number(form.teacher);
      }

      await createLoan(payload);

      setSuccess("Book issued successfully.");

      setForm({
        book: "",
        borrower_type: "STUDENT",
        student: "",
        teacher: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: "",
        fine_amount: "0",
        notes: "",
      });
    } catch (err) {
      console.error("Failed to issue book:", err);

      const data = err.response?.data;

      let message = "Unable to issue this book.";

      if (data?.detail) {
        message = data.detail;
      } else if (data?.error) {
        message = data.error;
      } else if (data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${text}`;
          })
          .join(" ");
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-text/10 bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-text/60">
              Loading library data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/librarian/borrowing")
            }
            className="mb-4 text-sm font-medium text-text/60 transition hover:text-text"
          >
            ← Back to Transactions
          </button>

          <p className="mb-1 text-sm font-semibold text-primary">
            Library
          </p>

          <h1 className="text-2xl font-bold text-text">
            Issue Book
          </h1>

          <p className="mt-1 text-sm text-text/60">
            Issue a library book to a student or teacher.
          </p>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-text/10 bg-card shadow-sm"
        >
          <div className="border-b border-text/10 px-6 py-5">
            <h2 className="text-lg font-semibold text-text">
              Borrowing Information
            </h2>

            <p className="mt-1 text-sm text-text/60">
              Select the book and borrower details below.
            </p>
          </div>

          <div className="space-y-6 p-6">

            {/* BOOK */}

            <div>
              <label
                htmlFor="book"
                className="mb-2 block text-sm font-medium text-text"
              >
                Book{" "}
                <span className="text-primary">*</span>
              </label>

              <select
                id="book"
                name="book"
                value={form.book}
                onChange={handleChange}
                className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              >
                <option value="">
                  Select a book
                </option>

                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.available_copies} available
                  </option>
                ))}
              </select>

              {availableBooks.length === 0 && (
                <p className="mt-2 text-xs text-primary">
                  No books are currently available for borrowing.
                </p>
              )}
            </div>

            {/* BORROWER TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Borrower Type{" "}
                <span className="text-primary">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleBorrowerTypeChange("STUDENT")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.borrower_type === "STUDENT"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-text/10 bg-card text-text/70 hover:bg-background"
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleBorrowerTypeChange("TEACHER")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.borrower_type === "TEACHER"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-text/10 bg-card text-text/70 hover:bg-background"
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {/* STUDENT */}

            {form.borrower_type === "STUDENT" && (
              <div>
                <label
                  htmlFor="student"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Student{" "}
                  <span className="text-primary">*</span>
                </label>

                <select
                  id="student"
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select a student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.full_name ||
                        student.name ||
                        `Student #${student.id}`}
                      {student.admission_number
                        ? ` — ${student.admission_number}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* TEACHER */}

            {form.borrower_type === "TEACHER" && (
              <div>
                <label
                  htmlFor="teacher"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Teacher{" "}
                  <span className="text-primary">*</span>
                </label>

                <select
                  id="teacher"
                  name="teacher"
                  value={form.teacher}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select a teacher
                  </option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.full_name ||
                        `${teacher.first_name || ""} ${
                          teacher.last_name || ""
                        }`.trim() ||
                        teacher.name ||
                        `Teacher #${teacher.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* DATES */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="issue_date"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Issue Date{" "}
                  <span className="text-primary">*</span>
                </label>

                <input
                  id="issue_date"
                  type="date"
                  name="issue_date"
                  value={form.issue_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="due_date"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Due Date{" "}
                  <span className="text-primary">*</span>
                </label>

                <input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  min={form.issue_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>

            </div>

            {/* FINE */}

            <div>
              <label
                htmlFor="fine_amount"
                className="mb-2 block text-sm font-medium text-text"
              >
                Fine Amount
              </label>

              <input
                id="fine_amount"
                type="number"
                name="fine_amount"
                value={form.fine_amount}
                min="0"
                step="0.01"
                onChange={handleChange}
                placeholder="0.00"
                className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              />

              <p className="mt-1 text-xs text-text/40">
                Leave as 0 if no fine applies.
              </p>
            </div>

            {/* NOTES */}

            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-text"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Optional notes about this transaction..."
                className="w-full resize-none rounded-xl border border-text/10 bg-background px-4 py-3 text-sm text-text outline-none placeholder:text-text/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-text/10 px-6 py-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate("/librarian/borrowing")
              }
              className="rounded-xl border border-text/10 bg-card px-5 py-3 text-sm font-semibold text-text/70 transition hover:bg-background"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                availableBooks.length === 0
              }
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Issuing Book..."
                : "Issue Book"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueBook;
