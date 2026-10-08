// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getDepartments,
//   deleteDepartment,
//   updateDepartment,
// } from "../../../services/academicsService";

// const AllDepartments = () => {
//   const navigate = useNavigate();

//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadDepartments = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await getDepartments();
//       setDepartments(data);
//     } catch (err) {
//       console.error("Failed to load departments:", err);
//       setError("Failed to load departments.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDepartments();
//   }, []);

//   const handleDelete = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this department?",
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await deleteDepartment(id);

//       setDepartments((prev) =>
//         prev.filter((department) => department.id !== id),
//       );
//     } catch (err) {
//       console.error("Failed to delete department:", err);
//       alert("Failed to delete department.");
//     }
//   };

//   const handleToggleStatus = async (department) => {
//     try {
//       const updatedDepartment = await updateDepartment(
//         department.id,
//         {
//           school: Number(department.school),
//           name: department.name,
//           code: department.code,
//           description: department.description || "",
//           head_name: department.head_name || "",
//           is_active: !department.is_active,
//         },
//       );

//       setDepartments((prev) =>
//         prev.map((item) =>
//           item.id === department.id
//             ? updatedDepartment
//             : item,
//         ),
//       );
//     } catch (err) {
//       console.error(
//         "Failed to update department status:",
//         err,
//       );

//       alert("Failed to update department status.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="py-10 text-center text-slate-500">
//         Loading departments...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div>
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold">
//             Departments
//           </h1>
//         </div>

//         <div className="rounded-xl bg-red-50 p-5 text-red-700">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">
//             Departments
//           </h1>

//           <p className="text-sm text-slate-500">
//             Manage school departments.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate("/admin/departments/add")}
//           className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
//         >
//           + Add Department
//         </button>
//       </div>

//       {/* Department Table */}
//       <div className="overflow-hidden rounded-xl bg-white shadow">
//         {departments.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-slate-500">
//               No departments found.
//             </p>

//             <button
//               type="button"
//               onClick={() =>
//                 navigate("/admin/departments/add")
//               }
//               className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
//             >
//               Add your first department
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Department
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Code
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Head
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Status
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {departments.map((department) => (
//                   <tr
//                     key={department.id}
//                     className="hover:bg-slate-50"
//                   >
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-slate-800">
//                           {department.name}
//                         </p>

//                         {department.description && (
//                           <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
//                             {department.description}
//                           </p>
//                         )}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {department.code}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {department.head_name || "—"}
//                     </td>

//                     <td className="px-6 py-4">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleToggleStatus(department)
//                         }
//                         className={`rounded-full px-3 py-1 text-xs font-medium ${
//                           department.is_active
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-red-100 text-red-700 hover:bg-red-200"
//                         }`}
//                       >
//                         {department.is_active
//                           ? "Active"
//                           : "Inactive"}
//                       </button>
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/departments/${department.id}`,
//                             )
//                           }
//                           className="text-sm font-medium text-blue-600 hover:text-blue-800"
//                         >
//                           View
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/departments/${department.id}/edit`,
//                             )
//                           }
//                           className="text-sm font-medium text-green-600 hover:text-green-800"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDelete(department.id)
//                           }
//                           className="text-sm font-medium text-red-600 hover:text-red-800"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllDepartments;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDepartments,
  deleteDepartment,
  updateDepartment,
} from "../../../services/academicsService";

const AllDepartments = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // =========================================================
  // DELETE DEPARTMENT
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDepartment(id);

      setDepartments((prev) =>
        prev.filter((department) => department.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete department:", err);

      alert("Failed to delete department.");
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = async (department) => {
    try {
      const updatedDepartment = await updateDepartment(
        department.id,
        {
          school: Number(department.school),
          name: department.name,
          code: department.code,
          description: department.description || "",
          head_name: department.head_name || "",
          is_active: !department.is_active,
        },
      );

      setDepartments((prev) =>
        prev.map((item) =>
          item.id === department.id
            ? updatedDepartment
            : item,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to update department status:",
        err,
      );

      alert("Failed to update department status.");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
        <p className="text-sm text-slate-500">
          Loading departments...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-[300px] bg-[var(--color-background)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage school departments.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage school departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/departments/add")
          }
          className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow transition hover:opacity-90 sm:w-auto"
        >
          + Add Department
        </button>
      </div>

      {/* =====================================================
          DEPARTMENT CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
        {departments.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No departments found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/departments/add")
              }
              className="mt-4 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
            >
              Add your first department
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {/* Department */}
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Department
                    </th>

                    {/* Code */}
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Code
                    </th>

                    {/* Head */}
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Head
                    </th>

                    {/* Status */}
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    {/* Actions */}
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {departments.map((department) => (
                    <tr
                      key={department.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      {/* Department */}
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {department.name}
                          </p>

                          {department.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                              {department.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {department.code}
                      </td>

                      {/* Head */}
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {department.head_name || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              department,
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            department.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {department.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/departments/${department.id}`,
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                            title="View department"
                            aria-label="View department"
                          >
                            <EyeIcon />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/departments/${department.id}/edit`,
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Edit department"
                            aria-label="Edit department"
                          >
                            <EditIcon />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                department.id,
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete department"
                            aria-label="Delete department"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE LIST
            ================================================= */}

            <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between gap-4 px-4 py-4"
                >
                  {/* Department information */}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {department.name}
                    </p>

                    {department.code && (
                      <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                        {department.code}
                      </p>
                    )}
                  </div>

                  {/* View only */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/departments/${department.id}`,
                      )
                    }
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                    title="View department"
                    aria-label="View department"
                  >
                    <EyeIcon />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// =========================================================
// EYE ICON
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

// =========================================================
// EDIT ICON
// =========================================================

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

// =========================================================
// DELETE ICON
// =========================================================

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

export default AllDepartments;