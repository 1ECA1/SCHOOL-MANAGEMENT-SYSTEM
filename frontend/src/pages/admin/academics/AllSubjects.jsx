// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getSubjects,
//   deleteSubject,
//   updateSubject,
//   getSchools,
//   getDepartments,
// } from "../../../services/academicsService";

// const AllSubjects = () => {
//   const navigate = useNavigate();

//   const [subjects, setSubjects] = useState([]);
//   const [schools, setSchools] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // --------------------------------------------------
//   // Load subjects
//   // --------------------------------------------------

//   const loadSubjects = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [
//         subjectData,
//         schoolData,
//         departmentData,
//       ] = await Promise.all([
//         getSubjects(),
//         getSchools(),
//         getDepartments(),
//       ]);

//       setSubjects(subjectData);
//       setSchools(schoolData);
//       setDepartments(departmentData);
//     } catch (err) {
//       console.error(
//         "Failed to load subjects:",
//         err
//       );

//       setError("Failed to load subjects.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSubjects();
//   }, []);

//   // --------------------------------------------------
//   // Delete subject
//   // --------------------------------------------------

//   const handleDelete = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this subject?"
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await deleteSubject(id);

//       setSubjects((prev) =>
//         prev.filter(
//           (subject) => subject.id !== id
//         )
//       );
//     } catch (err) {
//       console.error(
//         "Failed to delete subject:",
//         err
//       );

//       alert("Failed to delete subject.");
//     }
//   };

//   // --------------------------------------------------
//   // Toggle status
//   // --------------------------------------------------

//   const handleToggleStatus = async (subject) => {
//     try {
//       const updatedSubject =
//         await updateSubject(subject.id, {
//           school: Number(subject.school),

//           education_level:
//             subject.education_level,

//           department:
//             subject.education_level === "SS" &&
//             subject.department
//               ? Number(subject.department)
//               : null,

//           name: subject.name,

//           code: subject.code,

//           description:
//             subject.description || "",

//           is_core: subject.is_core,

//           is_active: !subject.is_active,
//         });

//       setSubjects((prev) =>
//         prev.map((item) =>
//           item.id === subject.id
//             ? updatedSubject
//             : item
//         )
//       );
//     } catch (err) {
//       console.error(
//         "Failed to update subject status:",
//         err
//       );

//       alert(
//         "Failed to update subject status."
//       );
//     }
//   };

//   // --------------------------------------------------
//   // School name
//   // --------------------------------------------------

//   const getSchoolName = (schoolId) => {
//     return (
//       schools.find(
//         (school) =>
//           Number(school.id) === Number(schoolId)
//       )?.name || "—"
//     );
//   };

//   // --------------------------------------------------
//   // Department name
//   // --------------------------------------------------

//   const getDepartmentName = (departmentId) => {
//     if (!departmentId) {
//       return "—";
//     }

//     return (
//       departments.find(
//         (department) =>
//           Number(department.id) ===
//           Number(departmentId)
//       )?.name || "—"
//     );
//   };

//   // --------------------------------------------------
//   // Education level name
//   // --------------------------------------------------

//   const getEducationLevelName = (level) => {
//     switch (level) {
//       case "PRIMARY":
//         return "Primary";

//       case "JSS":
//         return "JSS";

//       case "SS":
//         return "Senior Secondary";

//       default:
//         return "—";
//     }
//   };

//   // --------------------------------------------------
//   // Loading
//   // --------------------------------------------------

//   if (loading) {
//     return (
//       <div className="py-10 text-center text-slate-500">
//         Loading subjects...
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // Error
//   // --------------------------------------------------

//   if (error) {
//     return (
//       <div>
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold">
//             Subjects
//           </h1>
//         </div>

//         <div className="rounded-xl bg-red-50 p-5 text-red-700">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // Page
//   // --------------------------------------------------

//   return (
//     <div>
//       {/* Header */}

//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">
//             Subjects
//           </h1>

//           <p className="text-sm text-slate-500">
//             Manage school subjects.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             navigate("/admin/subjects/add")
//           }
//           className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
//         >
//           + Add Subject
//         </button>
//       </div>

//       {/* Subjects Table */}

//       <div className="overflow-hidden rounded-xl bg-white shadow">
//         {subjects.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-slate-500">
//               No subjects found.
//             </p>

//             <button
//               type="button"
//               onClick={() =>
//                 navigate("/admin/subjects/add")
//               }
//               className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
//             >
//               Add your first subject
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Subject
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Code
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Level
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     School
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Department
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Type
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
//                 {subjects.map((subject) => (
//                   <tr
//                     key={subject.id}
//                     className="hover:bg-slate-50"
//                   >
//                     {/* Subject */}

//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-slate-800">
//                           {subject.name}
//                         </p>

//                         {subject.description && (
//                           <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
//                             {subject.description}
//                           </p>
//                         )}
//                       </div>
//                     </td>

//                     {/* Code */}

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {subject.code}
//                     </td>

//                     {/* Education Level */}

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {getEducationLevelName(
//                         subject.education_level
//                       )}
//                     </td>

//                     {/* School */}

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {getSchoolName(
//                         subject.school
//                       )}
//                     </td>

//                     {/* Department */}

//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {subject.education_level ===
//                       "SS"
//                         ? getDepartmentName(
//                             subject.department
//                           )
//                         : "—"}
//                     </td>

//                     {/* Type */}

//                     <td className="px-6 py-4">
//                       {subject.is_core ? (
//                         <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
//                           Core
//                         </span>
//                       ) : (
//                         <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
//                           Elective
//                         </span>
//                       )}
//                     </td>

//                     {/* Status */}

//                     <td className="px-6 py-4">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleToggleStatus(
//                             subject
//                           )
//                         }
//                         className={`rounded-full px-3 py-1 text-xs font-medium ${
//                           subject.is_active
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-red-100 text-red-700 hover:bg-red-200"
//                         }`}
//                       >
//                         {subject.is_active
//                           ? "Active"
//                           : "Inactive"}
//                       </button>
//                     </td>

//                     {/* Actions */}

//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/subjects/${subject.id}`
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
//                               `/admin/subjects/${subject.id}/edit`
//                             )
//                           }
//                           className="text-sm font-medium text-green-600 hover:text-green-800"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDelete(
//                               subject.id
//                             )
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

// export default AllSubjects;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSubjects,
  deleteSubject,
  updateSubject,
  getSchools,
  getDepartments,
} from "../../../services/academicsService";

const AllSubjects = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load subjects
  // --------------------------------------------------

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        subjectData,
        schoolData,
        departmentData,
      ] = await Promise.all([
        getSubjects(),
        getSchools(),
        getDepartments(),
      ]);

      setSubjects(subjectData);
      setSchools(schoolData);
      setDepartments(departmentData);
    } catch (err) {
      console.error(
        "Failed to load subjects:",
        err,
      );

      setError("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // --------------------------------------------------
  // Delete subject
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubject(id);

      setSubjects((prev) =>
        prev.filter(
          (subject) => subject.id !== id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete subject:",
        err,
      );

      alert("Failed to delete subject.");
    }
  };

  // --------------------------------------------------
  // Toggle status
  // --------------------------------------------------

  const handleToggleStatus = async (subject) => {
    try {
      const updatedSubject =
        await updateSubject(subject.id, {
          school: Number(subject.school),

          education_level:
            subject.education_level,

          department:
            subject.education_level === "SS" &&
            subject.department
              ? Number(subject.department)
              : null,

          name: subject.name,

          code: subject.code,

          description:
            subject.description || "",

          is_core: subject.is_core,

          is_active: !subject.is_active,
        });

      setSubjects((prev) =>
        prev.map((item) =>
          item.id === subject.id
            ? updatedSubject
            : item,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to update subject status:",
        err,
      );

      alert(
        "Failed to update subject status.",
      );
    }
  };

  // --------------------------------------------------
  // School name
  // --------------------------------------------------

  const getSchoolName = (schoolId) => {
    return (
      schools.find(
        (school) =>
          Number(school.id) === Number(schoolId),
      )?.name || "—"
    );
  };

  // --------------------------------------------------
  // Department name
  // --------------------------------------------------

  const getDepartmentName = (departmentId) => {
    if (!departmentId) {
      return "—";
    }

    return (
      departments.find(
        (department) =>
          Number(department.id) ===
          Number(departmentId),
      )?.name || "—"
    );
  };

  // --------------------------------------------------
  // Education level name
  // --------------------------------------------------

  const getEducationLevelName = (level) => {
    switch (level) {
      case "PRIMARY":
        return "Primary";

      case "JSS":
        return "JSS";

      case "SS":
        return "Senior Secondary";

      default:
        return "—";
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading subjects...
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Subjects
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Subjects
          </h1>

          <p className="text-sm text-slate-500">
            Manage school subjects.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/subjects/add")
          }
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add Subject
        </button>
      </div>

      {/* Subjects Table */}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        {subjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">
              No subjects found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/subjects/add")
              }
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first subject
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {/* SUBJECT - ALWAYS VISIBLE */}
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:px-6">
                    Subject
                  </th>

                  {/* CODE - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Code
                  </th>

                  {/* LEVEL - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Level
                  </th>

                  {/* SCHOOL - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    School
                  </th>

                  {/* DEPARTMENT - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Department
                  </th>

                  {/* TYPE - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Type
                  </th>

                  {/* STATUS - HIDDEN ON MOBILE */}
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Status
                  </th>

                  {/* ACTIONS */}
                  <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {subjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-slate-50"
                  >
                    {/* SUBJECT */}
                    <td className="px-4 py-4 md:px-6">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">
                          {subject.name}
                        </p>

                        {subject.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {subject.description}
                          </p>
                        )}

                        {/* CODE SHOWN UNDER SUBJECT ONLY ON MOBILE */}
                        {subject.code && (
                          <p className="mt-1 text-xs font-medium text-slate-400 md:hidden">
                            {subject.code}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* CODE */}
                    <td className="hidden px-6 py-4 text-sm text-slate-600 md:table-cell">
                      {subject.code}
                    </td>

                    {/* EDUCATION LEVEL */}
                    <td className="hidden px-6 py-4 text-sm text-slate-600 md:table-cell">
                      {getEducationLevelName(
                        subject.education_level,
                      )}
                    </td>

                    {/* SCHOOL */}
                    <td className="hidden px-6 py-4 text-sm text-slate-600 md:table-cell">
                      {getSchoolName(
                        subject.school,
                      )}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="hidden px-6 py-4 text-sm text-slate-600 md:table-cell">
                      {subject.education_level ===
                      "SS"
                        ? getDepartmentName(
                            subject.department,
                          )
                        : "—"}
                    </td>

                    {/* TYPE */}
                    <td className="hidden px-6 py-4 md:table-cell">
                      {subject.is_core ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Core
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Elective
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="hidden px-6 py-4 md:table-cell">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            subject,
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          subject.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {subject.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex justify-end gap-2">
                        {/* VIEW - ALWAYS VISIBLE */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/subjects/${subject.id}`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View subject"
                          aria-label="View subject"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="2.75"
                            />
                          </svg>
                        </button>

                        {/* EDIT - HIDDEN ON MOBILE */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/subjects/${subject.id}/edit`,
                            )
                          }
                          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600 md:inline-flex"
                          title="Edit subject"
                          aria-label="Edit subject"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 5.25l3 3"
                            />
                          </svg>
                        </button>

                        {/* DELETE - HIDDEN ON MOBILE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              subject.id,
                            )
                          }
                          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:inline-flex"
                          title="Delete subject"
                          aria-label="Delete subject"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6.75h16.5"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 6.75V4.5h6v2.25"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18.75 6.75l-.75 13.5H6l-.75-13.5"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 10.5v6"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 10.5v6"
                            />
                          </svg>
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
};

export default AllSubjects;