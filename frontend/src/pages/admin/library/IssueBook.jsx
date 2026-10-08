import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
getBooks,
createLoan,
} from "../../../services/libraryService";

import { getStudents } from "../../../services/studentsService";
import { getTeachers } from "../../../services/teachersService";

function IssueBook() {
const navigate = useNavigate();

const [books, setBooks] = useState([]);
const [students, setStudents] = useState([]);
const [teachers, setTeachers] = useState([]);

const [loading, setLoading] = useState(true);
const [searchingStudents, setSearchingStudents] = useState(false);
const [searchingTeachers, setSearchingTeachers] = useState(false);
const [saving, setSaving] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [borrowerType, setBorrowerType] = useState("student");

const [studentSearch, setStudentSearch] = useState("");
const [teacherSearch, setTeacherSearch] = useState("");

const [selectedStudent, setSelectedStudent] = useState(null);
const [selectedTeacher, setSelectedTeacher] = useState(null);

const [form, setForm] = useState({
book: "",
student: "",
teacher: "",
issue_date: new Date().toISOString().split("T")[0],
due_date: "",
notes: "",
});

// =====================================================
// LOAD BOOKS
// =====================================================

useEffect(() => {
const loadBooks = async () => {
try {
setLoading(true);
setError("");


    const booksData = await getBooks();

    setBooks(
      Array.isArray(booksData)
        ? booksData
        : booksData?.results || [],
    );
  } catch (err) {
    console.error("Failed to load books:", err);

    setError(
      err?.response?.data?.detail ||
        "Unable to load library books.",
    );
  } finally {
    setLoading(false);
  }
};

loadBooks();


}, []);

// =====================================================
// SEARCH STUDENTS
// =====================================================

useEffect(() => {
if (borrowerType !== "student") {
return;
}


const searchStudents = async () => {
  const search = studentSearch.trim();

  if (!search) {
    setStudents([]);
    return;
  }

  try {
    setSearchingStudents(true);
    setError("");

    const studentsData = await getStudents(search);

    const results = Array.isArray(studentsData)
      ? studentsData
      : studentsData?.results || [];

    setStudents(results);
  } catch (err) {
    console.error("Failed to search students:", err);

    setStudents([]);

    setError(
      err?.response?.data?.detail ||
        "Unable to search students.",
    );
  } finally {
    setSearchingStudents(false);
  }
};

const timer = setTimeout(searchStudents, 350);

return () => clearTimeout(timer);


}, [studentSearch, borrowerType]);

// =====================================================
// SEARCH TEACHERS
// =====================================================

useEffect(() => {
if (borrowerType !== "teacher") {
return;
}


const searchTeachers = async () => {
  const search = teacherSearch.trim();

  if (!search) {
    setTeachers([]);
    return;
  }

  try {
    setSearchingTeachers(true);
    setError("");

    const teachersData = await getTeachers({
      search,
    });

    const results = Array.isArray(teachersData)
      ? teachersData
      : teachersData?.results || [];

    // Only show active teachers
    const activeTeachers = results.filter(
      (teacher) =>
        !teacher.employment_status ||
        teacher.employment_status === "ACTIVE",
    );

    setTeachers(activeTeachers);
  } catch (err) {
    console.error("Failed to search teachers:", err);

    setTeachers([]);

    setError(
      err?.response?.data?.detail ||
        "Unable to search teachers.",
    );
  } finally {
    setSearchingTeachers(false);
  }
};

const timer = setTimeout(searchTeachers, 350);

return () => clearTimeout(timer);


}, [teacherSearch, borrowerType]);

// =====================================================
// AVAILABLE BOOKS
// =====================================================

const availableBooks = useMemo(() => {
return books.filter(
(book) =>
book.is_active &&
Number(book.available_copies) > 0,
);
}, [books]);

// =====================================================
// SELECTED BOOK
// =====================================================

const selectedBook = useMemo(() => {
return books.find(
(book) =>
String(book.id) === String(form.book),
);
}, [books, form.book]);

// =====================================================
// CHANGE BORROWER TYPE
// =====================================================

const handleBorrowerTypeChange = (type) => {
setBorrowerType(type);


setForm((previous) => ({
  ...previous,
  student: "",
  teacher: "",
}));

setStudentSearch("");
setTeacherSearch("");

setSelectedStudent(null);
setSelectedTeacher(null);

setStudents([]);
setTeachers([]);

setError("");


};

// =====================================================
// FORM CHANGE
// =====================================================

const handleChange = (event) => {
const { name, value } = event.target;


setForm((previous) => ({
  ...previous,
  [name]: value,
}));

setError("");


};

// =====================================================
// SELECT STUDENT
// =====================================================

const handleSelectStudent = (student) => {
setSelectedStudent(student);


setForm((previous) => ({
  ...previous,
  student: student.id,
}));

setStudentSearch(
  student.full_name ||
    `${student.first_name || ""} ${
      student.last_name || ""
    }`.trim(),
);

setStudents([]);
setError("");


};

// =====================================================
// CLEAR STUDENT
// =====================================================

const handleClearStudent = () => {
setSelectedStudent(null);


setForm((previous) => ({
  ...previous,
  student: "",
}));

setStudentSearch("");
setStudents([]);
setError("");


};

// =====================================================
// SELECT TEACHER
// =====================================================

const handleSelectTeacher = (teacher) => {
setSelectedTeacher(teacher);


setForm((previous) => ({
  ...previous,
  teacher: teacher.id,
}));

setTeacherSearch(
  teacher.full_name ||
    `${teacher.first_name || ""} ${
      teacher.middle_name || ""
    } ${
      teacher.last_name || ""
    }`.trim(),
);

setTeachers([]);
setError("");


};

// =====================================================
// CLEAR TEACHER
// =====================================================

const handleClearTeacher = () => {
setSelectedTeacher(null);


setForm((previous) => ({
  ...previous,
  teacher: "",
}));

setTeacherSearch("");
setTeachers([]);
setError("");


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

if (!selectedBook) {
  setError("Selected book was not found.");
  return;
}

if (
  Number(selectedBook.available_copies) <= 0
) {
  setError(
    "This book currently has no available copies.",
  );
  return;
}

if (
  borrowerType === "student" &&
  !form.student
) {
  setError(
    "Please search for and select a student.",
  );
  return;
}

if (
  borrowerType === "teacher" &&
  !form.teacher
) {
  setError(
    "Please search for and select a teacher.",
  );
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
  setError(
    "Due date cannot be before the issue date.",
  );
  return;
}

try {
  setSaving(true);

  const loanData = {
    book: Number(form.book),
    issue_date: form.issue_date,
    due_date: form.due_date,
    notes: form.notes.trim(),
  };

  if (borrowerType === "student") {
    loanData.student = Number(form.student);
  } else {
    loanData.teacher = Number(form.teacher);
  }

  const createdLoan = await createLoan(loanData);

  console.log("Loan created:", createdLoan);

  setSuccess(
    `"${selectedBook.title}" has been issued successfully.`,
  );

  setForm({
    book: "",
    student: "",
    teacher: "",
    issue_date: new Date()
      .toISOString()
      .split("T")[0],
    due_date: "",
    notes: "",
  });

  setStudentSearch("");
  setTeacherSearch("");

  setSelectedStudent(null);
  setSelectedTeacher(null);

  setStudents([]);
  setTeachers([]);

  setTimeout(() => {
    navigate("/admin/library/loans");
  }, 900);
} catch (err) {
  console.error(
    "Failed to issue book:",
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
        const text = Array.isArray(message)
          ? message.join(", ")
          : typeof message === "object"
            ? JSON.stringify(message)
            : message;

        return `${field}: ${text}`;
      })
      .join(" ");

    setError(
      messages ||
        "Failed to issue book.",
    );
  } else {
    setError("Failed to issue book.");
  }
} finally {
  setSaving(false);
}


};

// =====================================================
// LOADING
// =====================================================

if (loading) {
return ( <div className="p-6"> <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center text-sm text-slate-500 dark:border-slate-800">
Loading library information... </div> </div>
);
}

// =====================================================
// RENDER
// =====================================================

return ( <div className="mx-auto w-full max-w-4xl">
{/* HEADER */}


  <div className="mb-6">
    <Link
      to="/admin/library/loans"
      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
    >
      ← Back to Loans
    </Link>

    <h1 className="mt-3 text-2xl font-bold text-[var(--color-text)]">
      Issue / Borrow Book
    </h1>

    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Issue a library book to a student or teacher.
    </p>
  </div>

  {/* ERROR */}

  {error && (
    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
      {error}
    </div>
  )}

  {/* SUCCESS */}

  {success && (
    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
      {success}
    </div>
  )}

  <form
    onSubmit={handleSubmit}
    className="space-y-6"
  >
    {/* =================================================
        BOOK
    ================================================= */}

    <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
      <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
        Book
      </h2>

      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
        Select Book *
      </label>

      <select
        name="book"
        value={form.book}
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
      >
        <option value="">
          Select available book
        </option>

        {availableBooks.map((book) => (
          <option
            key={book.id}
            value={book.id}
          >
            {book.title} —{" "}
            {book.available_copies} available
          </option>
        ))}
      </select>

      {availableBooks.length === 0 && (
        <p className="mt-2 text-sm text-red-500">
          There are currently no available books.
        </p>
      )}

      {selectedBook && (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--color-text)]">
                {selectedBook.title}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Author:{" "}
                {selectedBook.author_name || "—"}
              </p>

              {selectedBook.category_name && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Category:{" "}
                  {selectedBook.category_name}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Available
              </p>

              <p className="text-xl font-bold text-green-600">
                {selectedBook.available_copies}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* =================================================
        BORROWER
    ================================================= */}

    <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
      <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
        Borrower
      </h2>

      {/* BORROWER TYPE */}

      <div className="mb-5 flex gap-3">
        <button
          type="button"
          onClick={() =>
            handleBorrowerTypeChange("student")
          }
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            borrowerType === "student"
              ? "bg-[var(--color-primary)] text-white"
              : "border border-slate-200 text-[var(--color-text)] dark:border-slate-700"
          }`}
        >
          Student
        </button>

        <button
          type="button"
          onClick={() =>
            handleBorrowerTypeChange("teacher")
          }
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            borrowerType === "teacher"
              ? "bg-[var(--color-primary)] text-white"
              : "border border-slate-200 text-[var(--color-text)] dark:border-slate-700"
          }`}
        >
          Teacher
        </button>
      </div>

      {/* =================================================
          STUDENT
      ================================================= */}

      {borrowerType === "student" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Search Student *
          </label>

          <div className="relative">
            <input
              type="text"
              value={studentSearch}
              onChange={(event) => {
                setStudentSearch(
                  event.target.value,
                );

                if (selectedStudent) {
                  setSelectedStudent(null);

                  setForm((previous) => ({
                    ...previous,
                    student: "",
                  }));
                }
              }}
              placeholder="Search by admission number, name or class..."
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            />

            {searchingStudents && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-primary)]" />
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter an admission number, student's name,
            or class name.
          </p>

          {students.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() =>
                    handleSelectStudent(
                      student,
                    )
                  }
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {student.full_name ||
                          `${student.first_name || ""} ${
                            student.middle_name || ""
                          } ${
                            student.last_name || ""
                          }`.trim()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Admission No:{" "}
                        {student.admission_number ||
                          "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Class
                      </p>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {student.current_class_name ||
                          student.class_name ||
                          student.current_class ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchingStudents &&
            studentSearch.trim() &&
            students.length === 0 &&
            !selectedStudent && (
              <div className="mt-3 rounded-lg border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
                No students found matching{" "}
                <span className="font-semibold">
                  "{studentSearch}"
                </span>
                .
              </div>
            )}

          {selectedStudent && (
            <div className="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected Student
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                    {selectedStudent.full_name ||
                      `${selectedStudent.first_name || ""} ${
                        selectedStudent.middle_name || ""
                      } ${
                        selectedStudent.last_name || ""
                      }`.trim()}
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      <span className="font-medium">
                        Admission No:
                      </span>{" "}
                      {selectedStudent.admission_number ||
                        "—"}
                    </p>

                    <p>
                      <span className="font-medium">
                        Class:
                      </span>{" "}
                      {selectedStudent.current_class_name ||
                        selectedStudent.class_name ||
                        selectedStudent.current_class ||
                        "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleClearStudent
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================
           TEACHER
        ================================================= */

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Search Teacher *
          </label>

          <div className="relative">
            <input
              type="text"
              value={teacherSearch}
              onChange={(event) => {
                setTeacherSearch(
                  event.target.value,
                );

                if (selectedTeacher) {
                  setSelectedTeacher(null);

                  setForm((previous) => ({
                    ...previous,
                    teacher: "",
                  }));
                }
              }}
              placeholder="Search by employee ID or teacher name..."
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            />

            {searchingTeachers && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-primary)]" />
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter the employee ID or teacher's name.
          </p>

          {/* TEACHER SEARCH RESULTS */}

          {teachers.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() =>
                    handleSelectTeacher(
                      teacher,
                    )
                  }
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {teacher.full_name ||
                          `${teacher.first_name || ""} ${
                            teacher.middle_name || ""
                          } ${
                            teacher.last_name || ""
                          }`.trim()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Employee ID:{" "}
                        {teacher.employee_id || "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Department
                      </p>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {teacher.department_name ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* NO TEACHERS */}

          {!searchingTeachers &&
            teacherSearch.trim() &&
            teachers.length === 0 &&
            !selectedTeacher && (
              <div className="mt-3 rounded-lg border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
                No teachers found matching{" "}
                <span className="font-semibold">
                  "{teacherSearch}"
                </span>
                .
              </div>
            )}

          {/* SELECTED TEACHER */}

          {selectedTeacher && (
            <div className="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected Teacher
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                    {selectedTeacher.full_name}
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      <span className="font-medium">
                        Employee ID:
                      </span>{" "}
                      {selectedTeacher.employee_id ||
                        "—"}
                    </p>

                    <p>
                      <span className="font-medium">
                        Department:
                      </span>{" "}
                      {selectedTeacher.department_name ||
                        "—"}
                    </p>

                    <p>
                      <span className="font-medium">
                        Specialization:
                      </span>{" "}
                      {selectedTeacher.specialization ||
                        "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleClearTeacher
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* =================================================
        DATES
    ================================================= */}

    <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
      <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
        Loan Period
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Issue Date *
          </label>

          <input
            type="date"
            name="issue_date"
            value={form.issue_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Due Date *
          </label>

          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            min={form.issue_date}
            className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
          />
        </div>
      </div>
    </div>

    {/* =================================================
        NOTES
    ================================================= */}

    <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
        Notes
      </label>

      <textarea
        name="notes"
        value={form.notes}
        onChange={handleChange}
        rows={4}
        placeholder="Optional notes..."
        className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
      />
    </div>

    {/* =================================================
        ACTIONS
    ================================================= */}

    <div className="flex justify-end gap-3">
      <Link
        to="/admin/library/loans"
        className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Cancel
      </Link>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Issuing..." : "Issue Book"}
      </button>
    </div>
  </form>
</div>


);
}

export default IssueBook;
