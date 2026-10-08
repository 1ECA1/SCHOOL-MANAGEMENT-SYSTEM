import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import api from "../../../services/api";


// ============================================================
// ENDPOINTS
// ============================================================

const ENDPOINTS = {
  detail: (studentId) =>
    `/students/accounts/${studentId}/`,

  create: "/students/accounts/create/",

  activate: (studentId) =>
    `/students/accounts/${studentId}/activate/`,

  deactivate: (studentId) =>
    `/students/accounts/${studentId}/deactivate/`,

  resetPassword: (studentId) =>
    `/students/accounts/${studentId}/reset-password/`,
};


// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
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

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (Array.isArray(value) && value.length) {
      return `${key}: ${value[0]}`;
    }

    if (typeof value === "string") {
      return `${key}: ${value}`;
    }
  }

  return "Something went wrong. Please try again.";
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}


// ============================================================
// STATUS BADGE
// ============================================================

function AccountStatusBadge({ student }) {
  if (!student?.has_account) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
        <UserX size={15} />
        No Account
      </span>
    );
  }

  if (student.account_is_active) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
        <UserCheck size={15} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
      <UserX size={15} />
      Inactive
    </span>
  );
}


// ============================================================
// CREATE ACCOUNT MODAL
// ============================================================

function CreateAccountModal({
  student,
  loading,
  error,
  email,
  setEmail,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Create Student Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The system will automatically generate the temporary password.
          </p>

        </div>


        <form
          onSubmit={onSubmit}
          className="space-y-5 p-5"
        >

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Student
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {student.full_name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {student.admission_number}
            </p>

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="student@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              If left unchanged, the student's existing email will
              be used. If no email exists, the backend will generate
              a fallback email automatically.
            </p>

          </div>


          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

            <div className="flex items-start gap-3">

              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>

                <p className="text-sm font-semibold text-blue-900">
                  Automatic password generation
                </p>

                <p className="mt-1 text-sm leading-5 text-blue-700">
                  You do not enter a password here. EduManage will
                  automatically generate a temporary password after
                  the account is created.
                </p>

              </div>

            </div>

          </div>


          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus size={17} />
              )}

              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// ============================================================
// RESET PASSWORD MODAL
// ============================================================

function ResetPasswordModal({
  loading,
  error,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Reset Student Password
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Set a new password for this student account.
          </p>

        </div>


        <form
          onSubmit={onSubmit}
          className="space-y-5 p-5"
        >

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

          </div>


          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >

              {loading && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Resetting..."
                : "Reset Password"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// ============================================================
// CREDENTIALS MODAL
// ============================================================

function CredentialsModal({
  credentials,
  student,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  const copyCredentials = async () => {
    const text = [
      `Student: ${student.full_name}`,
      `Admission Number: ${student.admission_number}`,
      `Username: ${credentials.username}`,
      `Temporary Password: ${credentials.temporary_password}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Account Created Successfully
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Save these credentials before closing this window.
          </p>

        </div>


        <div className="space-y-5 p-5">

          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>

              <p className="text-sm font-semibold text-emerald-900">
                Student account created
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                The temporary password is shown below.
                Save it before closing.
              </p>

            </div>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
              Student
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {student.full_name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {student.admission_number}
            </p>

          </div>


          <div>

            <p className="mb-2 text-sm font-medium text-slate-600">
              Username
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-900">
              {credentials.username}
            </div>

          </div>


          <div>

            <p className="mb-2 text-sm font-medium text-slate-600">
              Temporary Password
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-mono text-sm font-bold tracking-wide text-slate-900">
              {credentials.temporary_password}
            </div>

          </div>


          <button
            type="button"
            onClick={copyCredentials}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? (
              <>
                <CheckCircle2
                  size={17}
                  className="text-emerald-600"
                />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={17} />
                Copy Credentials
              </>
            )}
          </button>


          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Done
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// MAIN DETAILS PAGE
// ============================================================

export default function StudentAccountDetails() {
  const navigate = useNavigate();

  const { studentId } = useParams();

  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");


  // ==========================================================
  // MODALS
  // ==========================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showResetModal, setShowResetModal] =
    useState(false);

  const [credentials, setCredentials] =
    useState(null);


  // ==========================================================
  // CREATE FORM
  // ==========================================================

  const [createEmail, setCreateEmail] =
    useState("");

  const [createError, setCreateError] =
    useState("");

  const [createLoading, setCreateLoading] =
    useState(false);


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resetError, setResetError] =
    useState("");

  const [resetLoading, setResetLoading] =
    useState(false);


  // ==========================================================
  // LOAD STUDENT
  // ==========================================================

  const loadStudent = useCallback(
    async () => {
      if (!studentId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/students/accounts/${studentId}/`
        );

        setStudent(response.data);

      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    },
    [studentId]
  );


  useEffect(() => {
    loadStudent();
  }, [loadStudent]);


  // ==========================================================
  // OPEN CREATE
  // ==========================================================

  const openCreateAccount = () => {
    setCreateError("");

    setCreateEmail(
      student?.email || ""
    );

    setShowCreateModal(true);
  };


  // ==========================================================
  // CREATE ACCOUNT
  // ==========================================================

  const handleCreateAccount = async (
    event
  ) => {
    event.preventDefault();

    if (!student) {
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const payload = {
        student: student.id,
      };

      if (createEmail.trim()) {
        payload.email =
          createEmail.trim();
      }

      const response = await api.post(
        ENDPOINTS.create,
        payload
      );

      setShowCreateModal(false);

      setCredentials(
        response.data?.credentials
      );

      setSuccessMessage(
        response.data?.message ||
          "Student account created successfully."
      );

      await loadStudent();

    } catch (err) {
      setCreateError(
        getErrorMessage(err)
      );
    } finally {
      setCreateLoading(false);
    }
  };


  // ==========================================================
  // ACTIVATE / DEACTIVATE
  // ==========================================================

  const handleAccountStatusChange = async () => {
    if (!student?.has_account) {
      return;
    }

    const action = student.account_is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      student.account_is_active
        ? `Are you sure you want to deactivate ${student.full_name}'s login account?`
        : `Are you sure you want to activate ${student.full_name}'s login account?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const endpoint =
        action === "activate"
          ? ENDPOINTS.activate(
              student.id
            )
          : ENDPOINTS.deactivate(
              student.id
            );

      const response = await api.post(
        endpoint
      );

      setSuccessMessage(
        response.data?.message ||
          "Account status updated successfully."
      );

      await loadStudent();

    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const openResetPassword = () => {
    setPassword("");
    setConfirmPassword("");
    setResetError("");

    setShowResetModal(true);
  };


  const handleResetPassword = async (
    event
  ) => {
    event.preventDefault();

    setResetError("");

    if (password.length < 8) {
      setResetError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (password !== confirmPassword) {
      setResetError(
        "Passwords do not match."
      );

      return;
    }

    setResetLoading(true);

    try {
      const response = await api.post(
        ENDPOINTS.resetPassword(
          student.id
        ),
        {
          password,
        }
      );

      setShowResetModal(false);

      setPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        response.data?.message ||
          "Student password reset successfully."
      );

    } catch (err) {
      setResetError(
        getErrorMessage(err)
      );
    } finally {
      setResetLoading(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">

        <div className="text-center">

          <Loader2
            size={34}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading student account...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/school-admin/student-management/student-accounts"
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Student Accounts
        </button>


        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to load student account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The requested student account could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/student-management/student-accounts"
              )
            }
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to Student Accounts
          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ====================================================
          BACK
      ==================================================== */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/school-admin/student-management/student-accounts"
          )
        }
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Student Accounts
      </button>


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <GraduationCap size={31} />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              {student.full_name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Admission Number:{" "}
              <span className="font-medium text-slate-700">
                {student.admission_number}
              </span>
            </p>

          </div>

        </div>


        <AccountStatusBadge
          student={student}
        />

      </div>


      {/* ====================================================
          SUCCESS
      ==================================================== */}

      {successMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="flex-1">

            <p className="text-sm font-medium text-emerald-800">
              {successMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-emerald-600"
          >
            ×
          </button>

        </div>
      )}


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="flex-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-600"
          >
            ×
          </button>

        </div>
      )}


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ==================================================
            LEFT
        ================================================== */}

        <div className="space-y-6 xl:col-span-2">

          {/* ==================================================
              STUDENT INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="font-semibold text-slate-900">
                Student Information
              </h2>

            </div>


            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">

              <div>
                <p className="text-xs text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {student.full_name}
                </p>
              </div>


              <div>
                <p className="text-xs text-slate-400">
                  Admission Number
                </p>

                <p className="mt-1 font-mono text-sm font-medium text-slate-800">
                  {student.admission_number}
                </p>
              </div>


              <div>
                <p className="text-xs text-slate-400">
                  Class
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {student.class_name || "—"}
                </p>
              </div>


              <div>
                <p className="text-xs text-slate-400">
                  Academic Session
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {student.academic_session_name ||
                    "—"}
                </p>
              </div>


              <div>

                <div className="flex items-center gap-2">

                  <Mail
                    size={15}
                    className="text-slate-400"
                  />

                  <p className="text-xs text-slate-400">
                    Student Email
                  </p>

                </div>

                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {student.email || "—"}
                </p>

              </div>


              <div>

                <div className="flex items-center gap-2">

                  <Phone
                    size={15}
                    className="text-slate-400"
                  />

                  <p className="text-xs text-slate-400">
                    Phone
                  </p>

                </div>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {student.phone_number || "—"}
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="font-semibold text-slate-900">
                Login Account
              </h2>

            </div>


            {!student.has_account ? (

              <div className="p-5">

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <UserX size={22} />
                    </div>

                    <div>

                      <h3 className="font-semibold text-amber-900">
                        No Login Account
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        This student does not currently have a
                        login account. You can create one using
                        the button below.
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={openCreateAccount}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    <Plus size={17} />
                    Create Account
                  </button>

                </div>

              </div>

            ) : (

              <div className="p-5">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Username
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                      {student.username}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Account Email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {student.account_email || "—"}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Account Created
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(
                        student.account_created_at
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Account Status
                    </p>

                    <div className="mt-2">
                      <AccountStatusBadge
                        student={student}
                      />
                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            RIGHT ACTION PANEL
        ================================================== */}

        <div className="xl:col-span-1">

          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ShieldCheck size={20} />
                </div>

                <div>

                  <h2 className="font-semibold text-slate-900">
                    Account Actions
                  </h2>

                  <p className="text-xs text-slate-500">
                    Manage student login access
                  </p>

                </div>

              </div>

            </div>


            <div className="space-y-3 p-5">

              {/* ============================================
                  CREATE
              ============================================ */}

              {!student.has_account && (
                <button
                  type="button"
                  onClick={openCreateAccount}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Plus size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      Create Account
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Generate a login account automatically
                    </p>

                  </div>

                </button>
              )}


              {/* ============================================
                  ACTIVATE / DEACTIVATE
              ============================================ */}

              {student.has_account && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={
                    handleAccountStatusChange
                  }
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    student.account_is_active
                      ? "border-red-200 hover:bg-red-50"
                      : "border-emerald-200 hover:bg-emerald-50"
                  }`}
                >

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      student.account_is_active
                        ? "bg-red-100 text-red-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >

                    {actionLoading ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : student.account_is_active ? (
                      <UserX size={19} />
                    ) : (
                      <UserCheck size={19} />
                    )}

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      {student.account_is_active
                        ? "Deactivate Account"
                        : "Activate Account"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {student.account_is_active
                        ? "Prevent the student from logging in"
                        : "Allow the student to log in"}
                    </p>

                  </div>

                </button>
              )}


              {/* ============================================
                  RESET PASSWORD
              ============================================ */}

              {student.has_account && (
                <button
                  type="button"
                  onClick={openResetPassword}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <KeyRound size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      Reset Password
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Set a new password for this account
                    </p>

                  </div>

                </button>
              )}


              {/* ============================================
                  INFORMATION
              ============================================ */}

              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Activating or deactivating the account only
                    changes the student's login access. It does
                    not change the student's academic status.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          CREATE MODAL
      ==================================================== */}

      {showCreateModal && (
        <CreateAccountModal
          student={student}
          loading={createLoading}
          error={createError}
          email={createEmail}
          setEmail={setCreateEmail}
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={handleCreateAccount}
        />
      )}


      {/* ====================================================
          RESET MODAL
      ==================================================== */}

      {showResetModal && (
        <ResetPasswordModal
          loading={resetLoading}
          error={resetError}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={
            setConfirmPassword
          }
          onClose={() =>
            setShowResetModal(false)
          }
          onSubmit={handleResetPassword}
        />
      )}


      {/* ====================================================
          CREDENTIALS
      ==================================================== */}

      {credentials && (
        <CredentialsModal
          credentials={credentials}
          student={student}
          onClose={() =>
            setCredentials(null)
          }
        />
      )}

    </div>
  );
}