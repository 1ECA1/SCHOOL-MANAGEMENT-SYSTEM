import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import api from "../../../services/api";


// ============================================================
// ENDPOINTS
// ============================================================

const ENDPOINTS = {
  list: "/students/accounts/",
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


function getResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}


// ============================================================
// STATUS BADGE
// ============================================================

function AccountStatusBadge({ student }) {
  if (!student.has_account) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
        <UserX size={13} />
        No Account
      </span>
    );
  }

  if (student.account_is_active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <UserCheck size={13} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
      <UserX size={13} />
      Inactive
    </span>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

export default function StudentAccounts() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState("");

  const [totalCount, setTotalCount] = useState(0);


  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  const loadStudents = useCallback(
    async ({ showLoader = true } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (accountStatus) {
          params.account_status = accountStatus;
        }

        const response = await api.get(
          ENDPOINTS.list,
          {
            params,
          }
        );

        const data = response.data;

        const results = getResults(data);

        setStudents(results);

        setTotalCount(
          typeof data?.count === "number"
            ? data.count
            : results.length
        );
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, accountStatus]
  );


  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [loadStudents]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadStudents({
      showLoader: false,
    });
  };


  // ==========================================================
  // COUNTS
  // ==========================================================

  const activeCount = students.filter(
    (student) =>
      student.has_account &&
      student.account_is_active
  ).length;

  const inactiveCount = students.filter(
    (student) =>
      student.has_account &&
      !student.account_is_active
  ).length;

  const noAccountCount = students.filter(
    (student) =>
      !student.has_account
  ).length;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck size={23} />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Student Accounts
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage student login accounts and access.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="flex-1">

            <p className="text-sm font-medium text-red-800">
              Unable to load student accounts
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>

        </div>
      )}


      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Students
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total found
          </p>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {activeCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Login enabled
          </p>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {inactiveCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Login disabled
          </p>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            No Account
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-600">
            {noAccountCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ready to create
          </p>

        </div>

      </div>


      {/* ====================================================
          SEARCH / FILTER
      ==================================================== */}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, admission number, email or username..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

          </div>


          <select
            value={accountStatus}
            onChange={(event) =>
              setAccountStatus(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 lg:w-56"
          >
            <option value="">
              All Account Status
            </option>

            <option value="HAS_ACCOUNT">
              Has Account
            </option>

            <option value="NO_ACCOUNT">
              No Account
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


      {/* ====================================================
          TABLE
      ==================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-[1100px] w-full">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Class
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Username
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Account Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >

                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading student accounts...
                    </p>

                  </td>

                </tr>
              ) : students.length === 0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <GraduationCap size={27} />
                      </div>

                      <p className="mt-4 font-semibold text-slate-800">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or account status filter.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                students.map((student) => (

                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* STUDENT */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <GraduationCap size={19} />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-slate-900">
                            {student.full_name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.admission_number}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* CLASS */}

                    <td className="px-5 py-4">

                      <p className="text-sm font-medium text-slate-700">
                        {student.class_name || "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {student.academic_session_name || ""}
                      </p>

                    </td>


                    {/* CONTACT */}

                    <td className="px-5 py-4">

                      <div className="space-y-1">

                        {student.email && (
                          <div className="flex max-w-[230px] items-center gap-2">

                            <Mail
                              size={13}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate text-xs text-slate-600">
                              {student.email}
                            </span>

                          </div>
                        )}

                        {student.phone_number && (
                          <div className="flex items-center gap-2">

                            <Phone
                              size={13}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-xs text-slate-600">
                              {student.phone_number}
                            </span>

                          </div>
                        )}

                        {!student.email &&
                          !student.phone_number && (
                            <span className="text-xs text-slate-400">
                              No contact details
                            </span>
                          )}

                      </div>

                    </td>


                    {/* USERNAME */}

                    <td className="px-5 py-4">

                      {student.username ? (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700">
                          {student.username}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}

                    </td>


                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <AccountStatusBadge
                        student={student}
                      />

                    </td>


                    {/* VIEW */}

                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/student-management/student-accounts/${student.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800"
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}



// import { useCallback, useEffect, useMemo, useState } from "react";

// import {
//   AlertCircle,
//   CheckCircle2,
//   Clipboard,
//   Eye,
//   GraduationCap,
//   KeyRound,
//   Loader2,
//   Mail,
//   Phone,
//   Plus,
//   RefreshCw,
//   Search,
//   ShieldCheck,
//   UserCheck,
//   UserX,
//   X,
// } from "lucide-react";

// import api from "../../../services/api";


// // ============================================================
// // ENDPOINTS
// // ============================================================

// const ENDPOINTS = {
//   list: "/students/accounts/",
//   create: "/students/accounts/create/",

//   detail: (studentId) =>
//     `/students/accounts/${studentId}/`,

//   activate: (studentId) =>
//     `/students/accounts/${studentId}/activate/`,

//   deactivate: (studentId) =>
//     `/students/accounts/${studentId}/deactivate/`,

//   resetPassword: (studentId) =>
//     `/students/accounts/${studentId}/reset-password/`,
// };


// // ============================================================
// // HELPERS
// // ============================================================

// function getErrorMessage(error) {
//   const data = error?.response?.data;

//   if (!data) {
//     return (
//       error?.message ||
//       "Something went wrong. Please try again."
//     );
//   }

//   if (typeof data === "string") {
//     return data;
//   }

//   if (data.detail) {
//     return data.detail;
//   }

//   if (data.message) {
//     return data.message;
//   }

//   for (const key of Object.keys(data)) {
//     const value = data[key];

//     if (Array.isArray(value) && value.length > 0) {
//       return `${key}: ${value[0]}`;
//     }

//     if (typeof value === "string") {
//       return `${key}: ${value}`;
//     }
//   }

//   return "Something went wrong. Please try again.";
// }


// function getResults(data) {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data?.results)) {
//     return data.results;
//   }

//   return [];
// }


// function getTotalCount(data, fallbackLength) {
//   if (
//     typeof data?.count === "number"
//   ) {
//     return data.count;
//   }

//   return fallbackLength;
// }


// function formatDate(value) {
//   if (!value) {
//     return "—";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return date.toLocaleString();
// }


// // ============================================================
// // SMALL UI COMPONENTS
// // ============================================================

// function AccountStatusBadge({ student }) {
//   if (!student.has_account) {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
//         <UserX size={13} />
//         No Account
//       </span>
//     );
//   }

//   if (student.account_is_active) {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
//         <UserCheck size={13} />
//         Active
//       </span>
//     );
//   }

//   return (
//     <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
//       <UserX size={13} />
//       Inactive
//     </span>
//   );
// }


// function Modal({ children, onClose, title, subtitle }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

//         <div className="sticky top-0 flex items-start justify-between border-b bg-white px-5 py-4">
//           <div>
//             <h2 className="text-lg font-semibold text-slate-900">
//               {title}
//             </h2>

//             {subtitle && (
//               <p className="mt-1 text-sm text-slate-500">
//                 {subtitle}
//               </p>
//             )}
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-5">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }


// // ============================================================
// // CONFIRMATION DIALOG
// // ============================================================

// function ConfirmDialog({
//   title,
//   message,
//   confirmText,
//   danger = false,
//   loading = false,
//   onCancel,
//   onConfirm,
// }) {
//   return (
//     <Modal
//       title={title}
//       onClose={loading ? undefined : onCancel}
//     >
//       <div className="space-y-5">

//         <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
//           <AlertCircle
//             size={22}
//             className="mt-0.5 shrink-0 text-amber-500"
//           />

//           <p className="text-sm leading-6 text-slate-600">
//             {message}
//           </p>
//         </div>

//         <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//           <button
//             type="button"
//             disabled={loading}
//             onClick={onCancel}
//             className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             disabled={loading}
//             onClick={onConfirm}
//             className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
//               danger
//                 ? "bg-red-600 hover:bg-red-700"
//                 : "bg-slate-900 hover:bg-slate-800"
//             }`}
//           >
//             {loading && (
//               <Loader2
//                 size={16}
//                 className="animate-spin"
//               />
//             )}

//             {confirmText}
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }


// // ============================================================
// // CREATE ACCOUNT MODAL
// // ============================================================

// function CreateAccountModal({
//   student,
//   onClose,
//   onSuccess,
// }) {
//   const [email, setEmail] = useState(
//     student?.email || ""
//   );

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!student) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const payload = {
//         student: student.id,
//       };

//       if (email.trim()) {
//         payload.email = email.trim();
//       }

//       const response = await api.post(
//         ENDPOINTS.create,
//         payload
//       );

//       onSuccess(response.data);

//     } catch (err) {
//       setError(
//         getErrorMessage(err)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Create Student Account"
//       subtitle="The system will automatically generate a temporary password."
//       onClose={loading ? undefined : onClose}
//     >
//       <form
//         onSubmit={handleSubmit}
//         className="space-y-5"
//       >

//         {error && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//             <AlertCircle
//               size={18}
//               className="mt-0.5 shrink-0"
//             />

//             <span>{error}</span>
//           </div>
//         )}

//         {/* STUDENT */}

//         <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

//           <div className="flex items-center gap-3">

//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
//               <GraduationCap size={22} />
//             </div>

//             <div className="min-w-0">
//               <p className="truncate font-semibold text-slate-900">
//                 {student?.full_name}
//               </p>

//               <p className="mt-0.5 text-sm text-slate-500">
//                 {student?.admission_number}
//               </p>
//             </div>
//           </div>

//           <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">

//             <div>
//               <span className="text-slate-400">
//                 Class
//               </span>

//               <p className="font-medium text-slate-700">
//                 {student?.class_name || "—"}
//               </p>
//             </div>

//             <div>
//               <span className="text-slate-400">
//                 Session
//               </span>

//               <p className="font-medium text-slate-700">
//                 {student?.academic_session_name || "—"}
//               </p>
//             </div>

//           </div>
//         </div>

//         {/* EMAIL */}

//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-700">
//             Account Email
//           </label>

//           <div className="relative">

//             <Mail
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="email"
//               value={email}
//               onChange={(event) =>
//                 setEmail(event.target.value)
//               }
//               placeholder="student@example.com"
//               className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
//             />
//           </div>

//           <p className="mt-1.5 text-xs text-slate-500">
//             Leave this unchanged to use the student's existing
//             email. If the student has no email, the system will
//             generate a fallback email automatically.
//           </p>
//         </div>

//         {/* AUTOMATIC PASSWORD NOTICE */}

//         <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

//           <div className="flex items-start gap-3">

//             <ShieldCheck
//               size={20}
//               className="mt-0.5 shrink-0 text-blue-600"
//             />

//             <div>
//               <p className="text-sm font-semibold text-blue-900">
//                 Automatic password generation
//               </p>

//               <p className="mt-1 text-sm leading-5 text-blue-700">
//                 You do not need to enter a password. The system
//                 will generate a temporary password automatically
//                 after the account is created.
//               </p>
//             </div>

//           </div>
//         </div>

//         {/* BUTTONS */}

//         <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//           <button
//             type="button"
//             disabled={loading}
//             onClick={onClose}
//             className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={loading}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? (
//               <Loader2
//                 size={17}
//                 className="animate-spin"
//               />
//             ) : (
//               <Plus size={17} />
//             )}

//             {loading
//               ? "Creating Account..."
//               : "Create Account"}
//           </button>

//         </div>
//       </form>
//     </Modal>
//   );
// }


// // ============================================================
// // CREDENTIALS MODAL
// // ============================================================

// function CredentialsModal({
//   credentials,
//   student,
//   onClose,
// }) {
//   const [copied, setCopied] = useState(false);

//   const username =
//     credentials?.username || "";

//   const temporaryPassword =
//     credentials?.temporary_password || "";

//   const copyCredentials = async () => {
//     const text = [
//       `Student: ${student?.full_name || ""}`,
//       `Admission Number: ${student?.admission_number || ""}`,
//       `Username: ${username}`,
//       `Temporary Password: ${temporaryPassword}`,
//     ].join("\n");

//     try {
//       await navigator.clipboard.writeText(text);

//       setCopied(true);

//       setTimeout(() => {
//         setCopied(false);
//       }, 2000);

//     } catch {
//       setCopied(false);
//     }
//   };

//   return (
//     <Modal
//       title="Account Created Successfully"
//       subtitle="Save these credentials before closing this window."
//       onClose={onClose}
//     >
//       <div className="space-y-5">

//         <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

//           <CheckCircle2
//             size={22}
//             className="mt-0.5 shrink-0 text-emerald-600"
//           />

//           <div>
//             <p className="font-semibold text-emerald-900">
//               Student login account created
//             </p>

//             <p className="mt-1 text-sm leading-5 text-emerald-700">
//               The temporary password below will only be shown
//               here. Save or copy it before closing this window.
//             </p>
//           </div>

//         </div>

//         {/* STUDENT */}

//         <div className="rounded-xl bg-slate-50 p-4">

//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Student
//           </p>

//           <p className="mt-1 font-semibold text-slate-900">
//             {student?.full_name}
//           </p>

//           <p className="mt-0.5 text-sm text-slate-500">
//             {student?.admission_number}
//           </p>

//         </div>

//         {/* USERNAME */}

//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-600">
//             Username
//           </label>

//           <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">

//             <div className="flex-1 px-4 py-3 font-mono text-sm font-semibold text-slate-900">
//               {username}
//             </div>

//           </div>
//         </div>

//         {/* PASSWORD */}

//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-600">
//             Temporary Password
//           </label>

//           <div className="flex items-center rounded-xl border border-amber-200 bg-amber-50">

//             <KeyRound
//               size={18}
//               className="ml-3 shrink-0 text-amber-600"
//             />

//             <div className="flex-1 px-3 py-3 font-mono text-sm font-bold tracking-wide text-slate-900">
//               {temporaryPassword}
//             </div>

//           </div>
//         </div>

//         {/* COPY */}

//         <button
//           type="button"
//           onClick={copyCredentials}
//           className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
//         >
//           {copied ? (
//             <>
//               <CheckCircle2
//                 size={17}
//                 className="text-emerald-600"
//               />

//               Copied
//             </>
//           ) : (
//             <>
//               <Clipboard size={17} />

//               Copy Login Credentials
//             </>
//           )}
//         </button>

//         <button
//           type="button"
//           onClick={onClose}
//           className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
//         >
//           Done
//         </button>

//       </div>
//     </Modal>
//   );
// }


// // ============================================================
// // RESET PASSWORD MODAL
// // ============================================================

// function ResetPasswordModal({
//   student,
//   onClose,
//   onSuccess,
// }) {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] =
//     useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");

//     if (password.length < 8) {
//       setError(
//         "Password must contain at least 8 characters."
//       );
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError(
//         "Passwords do not match."
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       await api.post(
//         ENDPOINTS.resetPassword(student.id),
//         {
//           password,
//         }
//       );

//       onSuccess();

//     } catch (err) {
//       setError(
//         getErrorMessage(err)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Reset Student Password"
//       subtitle={`Set a new password for ${student.full_name}.`}
//       onClose={loading ? undefined : onClose}
//     >
//       <form
//         onSubmit={handleSubmit}
//         className="space-y-5"
//       >

//         {error && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//             <AlertCircle
//               size={18}
//               className="mt-0.5 shrink-0"
//             />

//             <span>{error}</span>
//           </div>
//         )}

//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-700">
//             New Password
//           </label>

//           <input
//             type="password"
//             value={password}
//             onChange={(event) =>
//               setPassword(event.target.value)
//             }
//             minLength={8}
//             autoComplete="new-password"
//             placeholder="Enter new password"
//             className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
//           />
//         </div>

//         <div>
//           <label className="mb-2 block text-sm font-medium text-slate-700">
//             Confirm Password
//           </label>

//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(event) =>
//               setConfirmPassword(
//                 event.target.value
//               )
//             }
//             minLength={8}
//             autoComplete="new-password"
//             placeholder="Confirm new password"
//             className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
//           />
//         </div>

//         <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//           <button
//             type="button"
//             disabled={loading}
//             onClick={onClose}
//             className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={loading}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading && (
//               <Loader2
//                 size={16}
//                 className="animate-spin"
//               />
//             )}

//             {loading
//               ? "Resetting..."
//               : "Reset Password"}
//           </button>

//         </div>
//       </form>
//     </Modal>
//   );
// }


// // ============================================================
// // DETAIL MODAL
// // ============================================================

// function DetailModal({
//   student,
//   loading,
//   onClose,
// }) {
//   return (
//     <Modal
//       title="Student Account Details"
//       subtitle="Student and login account information"
//       onClose={onClose}
//     >
//       {loading ? (
//         <div className="flex min-h-48 items-center justify-center">
//           <Loader2
//             size={28}
//             className="animate-spin text-slate-500"
//           />
//         </div>
//       ) : !student ? (
//         <div className="py-10 text-center text-sm text-slate-500">
//           Unable to load account details.
//         </div>
//       ) : (
//         <div className="space-y-5">

//           <div className="flex items-center gap-4">

//             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
//               <GraduationCap size={27} />
//             </div>

//             <div className="min-w-0 flex-1">

//               <h3 className="truncate text-lg font-semibold text-slate-900">
//                 {student.full_name}
//               </h3>

//               <p className="text-sm text-slate-500">
//                 {student.admission_number}
//               </p>

//             </div>

//             <AccountStatusBadge
//               student={student}
//             />

//           </div>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

//             <div className="rounded-xl border border-slate-200 p-4">
//               <p className="text-xs text-slate-400">
//                 Class
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {student.class_name || "—"}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 p-4">
//               <p className="text-xs text-slate-400">
//                 Academic Session
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {student.academic_session_name || "—"}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 p-4">
//               <p className="text-xs text-slate-400">
//                 Student Email
//               </p>

//               <p className="mt-1 break-all text-sm font-medium text-slate-800">
//                 {student.email || "—"}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 p-4">
//               <p className="text-xs text-slate-400">
//                 Phone
//               </p>

//               <p className="mt-1 text-sm font-medium text-slate-800">
//                 {student.phone_number || "—"}
//               </p>
//             </div>

//           </div>

//           <div className="rounded-xl border border-slate-200">

//             <div className="border-b border-slate-200 px-4 py-3">
//               <p className="text-sm font-semibold text-slate-800">
//                 Login Account
//               </p>
//             </div>

//             <div className="space-y-3 p-4">

//               <div className="flex items-center justify-between gap-4">
//                 <span className="text-sm text-slate-500">
//                   Username
//                 </span>

//                 <span className="font-mono text-sm font-medium text-slate-800">
//                   {student.username || "No account"}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between gap-4">
//                 <span className="text-sm text-slate-500">
//                   Account Email
//                 </span>

//                 <span className="break-all text-right text-sm font-medium text-slate-800">
//                   {student.account_email || "—"}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between gap-4">
//                 <span className="text-sm text-slate-500">
//                   Created
//                 </span>

//                 <span className="text-right text-sm font-medium text-slate-800">
//                   {formatDate(
//                     student.account_created_at
//                   )}
//                 </span>
//               </div>

//             </div>
//           </div>

//         </div>
//       )}
//     </Modal>
//   );
// }


// // ============================================================
// // MAIN PAGE
// // ============================================================

// export default function StudentAccounts() {

//   const [students, setStudents] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [accountStatus, setAccountStatus] =
//     useState("");

//   const [totalCount, setTotalCount] =
//     useState(0);

//   // ----------------------------------------------------------
//   // MODALS
//   // ----------------------------------------------------------

//   const [createStudent, setCreateStudent] =
//     useState(null);

//   const [credentials, setCredentials] =
//     useState(null);

//   const [credentialsStudent, setCredentialsStudent] =
//     useState(null);

//   const [detailStudent, setDetailStudent] =
//     useState(null);

//   const [detailLoading, setDetailLoading] =
//     useState(false);

//   const [resetStudent, setResetStudent] =
//     useState(null);

//   const [confirmAction, setConfirmAction] =
//     useState(null);

//   const [actionLoading, setActionLoading] =
//     useState(false);

//   const [successMessage, setSuccessMessage] =
//     useState("");


//   // ==========================================================
//   // LOAD STUDENTS
//   // ==========================================================

//   const loadStudents = useCallback(
//     async ({
//       showLoader = true,
//     } = {}) => {

//       if (showLoader) {
//         setLoading(true);
//       }

//       setError("");

//       try {
//         const params = {};

//         if (search.trim()) {
//           params.search = search.trim();
//         }

//         if (accountStatus) {
//           params.account_status =
//             accountStatus;
//         }

//         const response = await api.get(
//           ENDPOINTS.list,
//           {
//             params,
//           }
//         );

//         const data = response.data;

//         const results =
//           getResults(data);

//         setStudents(results);

//         setTotalCount(
//           getTotalCount(
//             data,
//             results.length
//           )
//         );

//       } catch (err) {

//         setError(
//           getErrorMessage(err)
//         );

//       } finally {

//         setLoading(false);
//         setRefreshing(false);
//       }

//     },
//     [
//       search,
//       accountStatus,
//     ]
//   );


//   // ==========================================================
//   // INITIAL LOAD / FILTER
//   // ==========================================================

//   useEffect(() => {

//     const timer = setTimeout(() => {
//       loadStudents();
//     }, 350);

//     return () => {
//       clearTimeout(timer);
//     };

//   }, [loadStudents]);


//   // ==========================================================
//   // REFRESH
//   // ==========================================================

//   const handleRefresh = async () => {

//     setRefreshing(true);

//     await loadStudents({
//       showLoader: false,
//     });
//   };


//   // ==========================================================
//   // CREATE ACCOUNT SUCCESS
//   // ==========================================================

//   const handleCreateSuccess = (
//     responseData
//   ) => {

//     setCreateStudent(null);

//     setCredentials(
//       responseData?.credentials || null
//     );

//     setCredentialsStudent(
//       createStudent
//     );

//     setSuccessMessage(
//       responseData?.message ||
//         "Student account created successfully."
//     );

//     loadStudents({
//       showLoader: false,
//     });
//   };


//   // ==========================================================
//   // VIEW DETAILS
//   // ==========================================================

//   const handleViewDetails = async (
//     student
//   ) => {

//     setDetailStudent(student);
//     setDetailLoading(true);

//     try {

//       const response = await api.get(
//         ENDPOINTS.detail(student.id)
//       );

//       setDetailStudent(
//         response.data
//       );

//     } catch (err) {

//       setError(
//         getErrorMessage(err)
//       );

//       setDetailStudent(null);

//     } finally {

//       setDetailLoading(false);
//     }
//   };


//   // ==========================================================
//   // ACTIVATE / DEACTIVATE
//   // ==========================================================

//   const executeAccountAction = async () => {

//     if (!confirmAction) {
//       return;
//     }

//     setActionLoading(true);
//     setError("");

//     try {

//       const endpoint =
//         confirmAction.type === "activate"
//           ? ENDPOINTS.activate(
//               confirmAction.student.id
//             )
//           : ENDPOINTS.deactivate(
//               confirmAction.student.id
//             );

//       const response = await api.post(
//         endpoint
//       );

//       setConfirmAction(null);

//       setSuccessMessage(
//         response.data?.message ||
//           "Account updated successfully."
//       );

//       await loadStudents({
//         showLoader: false,
//       });

//     } catch (err) {

//       setError(
//         getErrorMessage(err)
//       );

//     } finally {

//       setActionLoading(false);
//     }
//   };


//   // ==========================================================
//   // RESET PASSWORD SUCCESS
//   // ==========================================================

//   const handleResetSuccess = async () => {

//     setResetStudent(null);

//     setSuccessMessage(
//       "Student password reset successfully."
//     );

//     await loadStudents({
//       showLoader: false,
//     });
//   };


//   // ==========================================================
//   // STATS
//   // ==========================================================

//   const stats = useMemo(() => {

//     const hasAccount = students.filter(
//       (student) =>
//         student.has_account
//     ).length;

//     const active = students.filter(
//       (student) =>
//         student.has_account &&
//         student.account_is_active
//     ).length;

//     const inactive = students.filter(
//       (student) =>
//         student.has_account &&
//         !student.account_is_active
//     ).length;

//     const noAccount = students.filter(
//       (student) =>
//         !student.has_account
//     ).length;

//     return {
//       hasAccount,
//       active,
//       inactive,
//       noAccount,
//     };

//   }, [students]);


//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

//       {/* ====================================================
//           HEADER
//       ==================================================== */}

//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//         <div>

//           <div className="flex items-center gap-3">

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
//               <ShieldCheck size={23} />
//             </div>

//             <div>

//               <h1 className="text-2xl font-bold text-slate-900">
//                 Student Accounts
//               </h1>

//               <p className="mt-1 text-sm text-slate-500">
//                 Manage student login accounts and access.
//               </p>

//             </div>
//           </div>

//         </div>

//         <button
//           type="button"
//           onClick={handleRefresh}
//           disabled={refreshing}
//           className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <RefreshCw
//             size={17}
//             className={
//               refreshing
//                 ? "animate-spin"
//                 : ""
//             }
//           />

//           Refresh
//         </button>

//       </div>


//       {/* ====================================================
//           SUCCESS MESSAGE
//       ==================================================== */}

//       {successMessage && (
//         <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

//           <div className="flex items-start gap-3">

//             <CheckCircle2
//               size={19}
//               className="mt-0.5 shrink-0 text-emerald-600"
//             />

//             <p className="text-sm text-emerald-700">
//               {successMessage}
//             </p>

//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               setSuccessMessage("")
//             }
//             className="text-emerald-500 hover:text-emerald-700"
//           >
//             <X size={17} />
//           </button>

//         </div>
//       )}


//       {/* ====================================================
//           ERROR MESSAGE
//       ==================================================== */}

//       {error && (
//         <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">

//           <div className="flex items-start gap-3">

//             <AlertCircle
//               size={19}
//               className="mt-0.5 shrink-0 text-red-600"
//             />

//             <p className="text-sm text-red-700">
//               {error}
//             </p>

//           </div>

//           <button
//             type="button"
//             onClick={() => setError("")}
//             className="text-red-500 hover:text-red-700"
//           >
//             <X size={17} />
//           </button>

//         </div>
//       )}


//       {/* ====================================================
//           STAT CARDS
//       ==================================================== */}

//       <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Showing
//           </p>

//           <p className="mt-1 text-2xl font-bold text-slate-900">
//             {totalCount}
//           </p>

//           <p className="mt-1 text-xs text-slate-500">
//             Students
//           </p>

//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Active
//           </p>

//           <p className="mt-1 text-2xl font-bold text-emerald-600">
//             {stats.active}
//           </p>

//           <p className="mt-1 text-xs text-slate-500">
//             Login enabled
//           </p>

//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Inactive
//           </p>

//           <p className="mt-1 text-2xl font-bold text-red-600">
//             {stats.inactive}
//           </p>

//           <p className="mt-1 text-xs text-slate-500">
//             Login disabled
//           </p>

//         </div>

//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             No Account
//           </p>

//           <p className="mt-1 text-2xl font-bold text-slate-600">
//             {stats.noAccount}
//           </p>

//           <p className="mt-1 text-xs text-slate-500">
//             Ready to create
//           </p>

//         </div>

//       </div>


//       {/* ====================================================
//           SEARCH / FILTER
//       ==================================================== */}

//       <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//         <div className="flex flex-col gap-3 lg:flex-row">

//           <div className="relative flex-1">

//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="search"
//               value={search}
//               onChange={(event) =>
//                 setSearch(event.target.value)
//               }
//               placeholder="Search by name, admission number, email or username..."
//               className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
//             />

//           </div>

//           <select
//             value={accountStatus}
//             onChange={(event) =>
//               setAccountStatus(
//                 event.target.value
//               )
//             }
//             className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 lg:w-56"
//           >
//             <option value="">
//               All Account Status
//             </option>

//             <option value="HAS_ACCOUNT">
//               Has Account
//             </option>

//             <option value="NO_ACCOUNT">
//               No Account
//             </option>

//             <option value="ACTIVE">
//               Active
//             </option>

//             <option value="INACTIVE">
//               Inactive
//             </option>
//           </select>

//         </div>

//       </div>


//       {/* ====================================================
//           TABLE
//       ==================================================== */}

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//         <div className="overflow-x-auto">

//           <table className="min-w-[1050px] w-full">

//             <thead className="border-b border-slate-200 bg-slate-50">

//               <tr>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Student
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Class
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Contact
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Username
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Account
//                 </th>

//                 <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Actions
//                 </th>

//               </tr>

//             </thead>

//             <tbody className="divide-y divide-slate-100">

//               {loading ? (
//                 <tr>

//                   <td
//                     colSpan={6}
//                     className="px-5 py-16 text-center"
//                   >
//                     <div className="flex flex-col items-center justify-center">

//                       <Loader2
//                         size={30}
//                         className="animate-spin text-slate-400"
//                       />

//                       <p className="mt-3 text-sm text-slate-500">
//                         Loading student accounts...
//                       </p>

//                     </div>
//                   </td>

//                 </tr>
//               ) : students.length === 0 ? (
//                 <tr>

//                   <td
//                     colSpan={6}
//                     className="px-5 py-16 text-center"
//                   >

//                     <div className="mx-auto flex max-w-sm flex-col items-center">

//                       <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
//                         <GraduationCap size={27} />
//                       </div>

//                       <p className="mt-4 font-semibold text-slate-800">
//                         No students found
//                       </p>

//                       <p className="mt-1 text-sm text-slate-500">
//                         Try changing your search or account
//                         status filter.
//                       </p>

//                     </div>

//                   </td>

//                 </tr>
//               ) : (
//                 students.map((student) => (

//                   <tr
//                     key={student.id}
//                     className="transition hover:bg-slate-50"
//                   >

//                     {/* STUDENT */}

//                     <td className="px-5 py-4">

//                       <div className="flex items-center gap-3">

//                         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
//                           <GraduationCap size={19} />
//                         </div>

//                         <div className="min-w-0">

//                           <p className="truncate font-semibold text-slate-900">
//                             {student.full_name}
//                           </p>

//                           <p className="mt-0.5 text-xs text-slate-500">
//                             {student.admission_number}
//                           </p>

//                         </div>

//                       </div>

//                     </td>


//                     {/* CLASS */}

//                     <td className="px-5 py-4">

//                       <p className="text-sm font-medium text-slate-700">
//                         {student.class_name || "—"}
//                       </p>

//                       <p className="mt-0.5 text-xs text-slate-400">
//                         {student.academic_session_name || ""}
//                       </p>

//                     </td>


//                     {/* CONTACT */}

//                     <td className="px-5 py-4">

//                       <div className="space-y-1">

//                         {student.email && (
//                           <div className="flex max-w-[220px] items-center gap-2">

//                             <Mail
//                               size={13}
//                               className="shrink-0 text-slate-400"
//                             />

//                             <span className="truncate text-xs text-slate-600">
//                               {student.email}
//                             </span>

//                           </div>
//                         )}

//                         {student.phone_number && (
//                           <div className="flex items-center gap-2">

//                             <Phone
//                               size={13}
//                               className="shrink-0 text-slate-400"
//                             />

//                             <span className="text-xs text-slate-600">
//                               {student.phone_number}
//                             </span>

//                           </div>
//                         )}

//                         {!student.email &&
//                           !student.phone_number && (
//                             <span className="text-xs text-slate-400">
//                               No contact details
//                             </span>
//                           )}

//                       </div>

//                     </td>


//                     {/* USERNAME */}

//                     <td className="px-5 py-4">

//                       {student.username ? (
//                         <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700">
//                           {student.username}
//                         </span>
//                       ) : (
//                         <span className="text-sm text-slate-400">
//                           —
//                         </span>
//                       )}

//                     </td>


//                     {/* ACCOUNT */}

//                     <td className="px-5 py-4">

//                       <AccountStatusBadge
//                         student={student}
//                       />

//                     </td>


//                     {/* ACTIONS */}

//                     <td className="px-5 py-4">

//                       <div className="flex flex-wrap justify-end gap-2">

//                         {/* VIEW */}

//                         <button
//                           type="button"
//                           title="View account"
//                           onClick={() =>
//                             handleViewDetails(
//                               student
//                             )
//                           }
//                           className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
//                         >
//                           <Eye size={14} />
//                           View
//                         </button>


//                         {/* CREATE */}

//                         {!student.has_account && (
//                           <button
//                             type="button"
//                             title="Create account"
//                             onClick={() =>
//                               setCreateStudent(
//                                 student
//                               )
//                             }
//                             className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
//                           >
//                             <Plus size={14} />
//                             Create Account
//                           </button>
//                         )}


//                         {/* ACTIVATE */}

//                         {student.has_account &&
//                           !student.account_is_active && (
//                             <button
//                               type="button"
//                               title="Activate account"
//                               onClick={() =>
//                                 setConfirmAction({
//                                   type: "activate",
//                                   student,
//                                 })
//                               }
//                               className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
//                             >
//                               <UserCheck size={14} />
//                               Activate
//                             </button>
//                           )}


//                         {/* DEACTIVATE */}

//                         {student.has_account &&
//                           student.account_is_active && (
//                             <button
//                               type="button"
//                               title="Deactivate account"
//                               onClick={() =>
//                                 setConfirmAction({
//                                   type: "deactivate",
//                                   student,
//                                 })
//                               }
//                               className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
//                             >
//                               <UserX size={14} />
//                               Deactivate
//                             </button>
//                           )}


//                         {/* RESET PASSWORD */}

//                         {student.has_account && (
//                           <button
//                             type="button"
//                             title="Reset password"
//                             onClick={() =>
//                               setResetStudent(
//                                 student
//                               )
//                             }
//                             className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
//                           >
//                             <KeyRound size={14} />
//                             Reset
//                           </button>
//                         )}

//                       </div>

//                     </td>

//                   </tr>

//                 ))
//               )}

//             </tbody>

//           </table>

//         </div>

//       </div>


//       {/* ====================================================
//           CREATE ACCOUNT MODAL
//       ==================================================== */}

//       {createStudent && (
//         <CreateAccountModal
//           student={createStudent}
//           onClose={() =>
//             setCreateStudent(null)
//           }
//           onSuccess={
//             handleCreateSuccess
//           }
//         />
//       )}


//       {/* ====================================================
//           CREDENTIALS MODAL
//       ==================================================== */}

//       {credentials && (
//         <CredentialsModal
//           credentials={credentials}
//           student={credentialsStudent}
//           onClose={() => {
//             setCredentials(null);
//             setCredentialsStudent(null);
//           }}
//         />
//       )}


//       {/* ====================================================
//           DETAIL MODAL
//       ==================================================== */}

//       {detailStudent && (
//         <DetailModal
//           student={detailStudent}
//           loading={detailLoading}
//           onClose={() =>
//             setDetailStudent(null)
//           }
//         />
//       )}


//       {/* ====================================================
//           RESET PASSWORD MODAL
//       ==================================================== */}

//       {resetStudent && (
//         <ResetPasswordModal
//           student={resetStudent}
//           onClose={() =>
//             setResetStudent(null)
//           }
//           onSuccess={
//             handleResetSuccess
//           }
//         />
//       )}


//       {/* ====================================================
//           CONFIRM ACTIVATE / DEACTIVATE
//       ==================================================== */}

//       {confirmAction && (
//         <ConfirmDialog
//           title={
//             confirmAction.type === "activate"
//               ? "Activate Student Account"
//               : "Deactivate Student Account"
//           }
//           message={
//             confirmAction.type === "activate"
//               ? `Are you sure you want to activate the login account for ${confirmAction.student.full_name}? The student will be able to log in again.`
//               : `Are you sure you want to deactivate the login account for ${confirmAction.student.full_name}? The student's academic status will not be changed.`
//           }
//           confirmText={
//             confirmAction.type === "activate"
//               ? "Activate Account"
//               : "Deactivate Account"
//           }
//           danger={
//             confirmAction.type === "deactivate"
//           }
//           loading={actionLoading}
//           onCancel={() =>
//             setConfirmAction(null)
//           }
//           onConfirm={
//             executeAccountAction
//           }
//         />
//       )}

//     </div>
//   );
// }