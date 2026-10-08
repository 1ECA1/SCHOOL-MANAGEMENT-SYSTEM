

// import { useEffect, useMemo, useState } from "react";
// import {
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// import {
//   Search,
//   Plus,
//   Pencil,
//   Eye,
//   Trash2,
//   RefreshCw,
//   Loader2,
//   AlertCircle,
//   BookOpen,
//   X,
//   CheckCircle2,
// } from "lucide-react";

// import {
//   getSubjects,
//   createSubject,
//   updateSubject,
//   deleteSubject,
// } from "../../../services/academicsService";


// const EMPTY_FORM = {
//   name: "",
//   code: "",
//   description: "",
//   is_active: true,
// };


// const EDUCATION_LEVEL_LABELS = {
//   PRIMARY: "Primary",
//   JSS: "Junior Secondary (JSS)",
//   SS: "Senior Secondary (SS)",
// };


// const normalizeList = (data) => {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data?.results)) {
//     return data.results;
//   }

//   return [];
// };


// function Subjects() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [subjects, setSubjects] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [educationLevelFilter, setEducationLevelFilter] =
//     useState("ALL");
//   const [statusFilter, setStatusFilter] = useState("ALL");

//   const [editingSubject, setEditingSubject] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   const [form, setForm] = useState(EMPTY_FORM);
//   const [formError, setFormError] = useState("");

//   const [saving, setSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);


//   // ============================================================
//   // LOAD SUBJECTS
//   // ============================================================

//   const loadSubjects = async (showRefreshLoader = false) => {
//     try {
//       if (showRefreshLoader) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       setError("");

//       const response = await getSubjects();

//       setSubjects(normalizeList(response));
//     } catch (err) {
//       console.error("Failed to load subjects:", err);

//       setError(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to load subjects. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };


//   useEffect(() => {
//     loadSubjects();
//   }, []);


//   // ============================================================
//   // FORM HELPERS
//   // ============================================================

//   const openAddForm = () => {
//     setEditingSubject(null);

//     setForm({
//       ...EMPTY_FORM,
//     });

//     setFormError("");
//     setSuccessMessage("");
//     setShowForm(true);
//   };


//   const openEditForm = (subject) => {
//     setEditingSubject(subject);

//     setForm({
//       name: subject.name || "",
//       code: subject.code || "",
//       description: subject.description || "",
//       is_active:
//         typeof subject.is_active === "boolean"
//           ? subject.is_active
//           : true,
//     });

//     setFormError("");
//     setSuccessMessage("");
//     setShowForm(true);
//   };


//   const closeForm = () => {
//     if (saving) {
//       return;
//     }

//     setShowForm(false);
//     setEditingSubject(null);
//     setForm(EMPTY_FORM);
//     setFormError("");
//   };


//   // ============================================================
//   // OPEN EDIT FORM FROM SUBJECT DETAILS PAGE
//   // ============================================================
//   //
//   // SubjectDetails.jsx navigates back here with:
//   //
//   // navigate("/school-admin/academics/subjects", {
//   //   state: {
//   //     editSubjectId: subject.id,
//   //   },
//   // });
//   //
//   // This effect detects that ID after subjects have loaded,
//   // finds the subject, and automatically opens the edit form.
//   //
//   // The router state is then cleared so refreshing this page
//   // does not automatically reopen the form.
//   // ============================================================

//   useEffect(() => {
//     const editSubjectId =
//       location.state?.editSubjectId;

//     if (!editSubjectId || subjects.length === 0) {
//       return;
//     }

//     const subjectToEdit = subjects.find(
//       (subject) =>
//         String(subject.id) === String(editSubjectId),
//     );

//     if (!subjectToEdit) {
//       return;
//     }

//     setEditingSubject(subjectToEdit);

//     setForm({
//       name: subjectToEdit.name || "",
//       code: subjectToEdit.code || "",
//       description:
//         subjectToEdit.description || "",
//       is_active:
//         typeof subjectToEdit.is_active === "boolean"
//           ? subjectToEdit.is_active
//           : true,
//     });

//     setFormError("");
//     setSuccessMessage("");
//     setShowForm(true);

//     // Clear router state so a page refresh does not
//     // reopen the edit form.
//     navigate(
//       "/school-admin/academics/subjects",
//       {
//         replace: true,
//         state: {},
//       },
//     );
//   }, [
//     subjects,
//     location.state,
//     navigate,
//   ]);


//   // ============================================================
//   // FORM INPUT
//   // ============================================================

//   const handleFormChange = (event) => {
//     const { name, value, type, checked } =
//       event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : value,
//     }));

//     setFormError("");
//     setSuccessMessage("");
//   };


//   // ============================================================
//   // SAVE SUBJECT
//   // ============================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setFormError("");
//     setSuccessMessage("");

//     const name = form.name.trim();
//     const code = form.code.trim();
//     const description = form.description.trim();

//     if (!name) {
//       setFormError(
//         "Subject name is required.",
//       );
//       return;
//     }

//     if (!code) {
//       setFormError(
//         "Subject code is required.",
//       );
//       return;
//     }

//     const payload = {
//       name,
//       code,
//       description,
//       is_active: form.is_active,
//     };

//     try {
//       setSaving(true);

//       if (editingSubject) {
//         const updatedSubject =
//           await updateSubject(
//             editingSubject.id,
//             payload,
//           );

//         setSubjects((previous) =>
//           previous.map((subject) =>
//             subject.id === editingSubject.id
//               ? updatedSubject
//               : subject,
//           ),
//         );

//         setSuccessMessage(
//           "Subject updated successfully.",
//         );
//       } else {
//         const createdSubject =
//           await createSubject(payload);

//         setSubjects((previous) => [
//           createdSubject,
//           ...previous,
//         ]);

//         setSuccessMessage(
//           "Subject created successfully.",
//         );
//       }

//       setShowForm(false);
//       setEditingSubject(null);
//       setForm(EMPTY_FORM);

//       await loadSubjects(true);
//     } catch (err) {
//       console.error(
//         "Failed to save subject:",
//         err,
//       );

//       const responseData =
//         err?.response?.data;

//       let message =
//         responseData?.detail ||
//         responseData?.message ||
//         "Failed to save subject. Please try again.";

//       if (
//         typeof responseData === "object" &&
//         responseData !== null
//       ) {
//         if (responseData.name) {
//           message = Array.isArray(
//             responseData.name,
//           )
//             ? responseData.name[0]
//             : responseData.name;
//         } else if (responseData.code) {
//           message = Array.isArray(
//             responseData.code,
//           )
//             ? responseData.code[0]
//             : responseData.code;
//         }
//       }

//       setFormError(message);
//     } finally {
//       setSaving(false);
//     }
//   };


//   // ============================================================
//   // DELETE SUBJECT
//   // ============================================================

//   const handleDelete = async (subject) => {
//     const confirmed = window.confirm(
//       `Are you sure you want to delete "${subject.name}"?`,
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setDeletingId(subject.id);
//       setError("");
//       setSuccessMessage("");

//       await deleteSubject(subject.id);

//       setSubjects((previous) =>
//         previous.filter(
//           (item) => item.id !== subject.id,
//         ),
//       );

//       setSuccessMessage(
//         "Subject deleted successfully.",
//       );
//     } catch (err) {
//       console.error(
//         "Failed to delete subject:",
//         err,
//       );

//       setError(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to delete subject. The subject may already be assigned to a class.",
//       );
//     } finally {
//       setDeletingId(null);
//     }
//   };


//   // ============================================================
//   // FILTERED SUBJECTS
//   // ============================================================

//   const filteredSubjects = useMemo(() => {
//     const search = searchTerm
//       .trim()
//       .toLowerCase();

//     return subjects.filter((subject) => {
//       const matchesSearch =
//         !search ||
//         subject.name
//           ?.toLowerCase()
//           .includes(search) ||
//         subject.code
//           ?.toLowerCase()
//           .includes(search) ||
//         subject.description
//           ?.toLowerCase()
//           .includes(search);

//       const educationLevel =
//         subject.education_level ||
//         subject.educationLevel ||
//         "";

//       const matchesEducationLevel =
//         educationLevelFilter === "ALL" ||
//         educationLevel ===
//           educationLevelFilter;

//       const matchesStatus =
//         statusFilter === "ALL" ||
//         (statusFilter === "ACTIVE" &&
//           subject.is_active === true) ||
//         (statusFilter === "INACTIVE" &&
//           subject.is_active === false);

//       return (
//         matchesSearch &&
//         matchesEducationLevel &&
//         matchesStatus
//       );
//     });
//   }, [
//     subjects,
//     searchTerm,
//     educationLevelFilter,
//     statusFilter,
//   ]);


//   // ============================================================
//   // SUMMARY
//   // ============================================================

//   const totalSubjects = subjects.length;

//   const activeSubjects = subjects.filter(
//     (subject) =>
//       subject.is_active === true,
//   ).length;

//   const inactiveSubjects =
//     subjects.filter(
//       (subject) =>
//         subject.is_active === false,
//     ).length;


//   // ============================================================
//   // EDUCATION LEVEL
//   // ============================================================

//   const getEducationLevelLabel = (
//     subject,
//   ) => {
//     const level =
//       subject.education_level ||
//       subject.educationLevel;

//     return (
//       EDUCATION_LEVEL_LABELS[level] ||
//       level ||
//       "—"
//     );
//   };


//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="flex min-h-[500px] items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

//           <p className="text-sm text-gray-500">
//             Loading subjects...
//           </p>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="space-y-6 p-6">
//       {/* ======================================================
//           PAGE HEADER
//       ====================================================== */}

//       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
//               <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Subjects
//               </h1>

//               <p className="mt-1 text-sm text-gray-500">
//                 Manage subjects offered by your
//                 school.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             type="button"
//             onClick={() => loadSubjects(true)}
//             disabled={refreshing}
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw
//               className={`h-4 w-4 ${
//                 refreshing
//                   ? "animate-spin"
//                   : ""
//               }`}
//             />

//             Refresh
//           </button>

//           <button
//             type="button"
//             onClick={openAddForm}
//             className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
//           >
//             <Plus className="h-4 w-4" />

//             Add Subject
//           </button>
//         </div>
//       </div>


//       {/* ======================================================
//           SUCCESS MESSAGE
//       ====================================================== */}

//       {successMessage && (
//         <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//           <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

//           <div className="flex-1">
//             {successMessage}
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               setSuccessMessage("")
//             }
//             className="text-green-600 hover:text-green-800"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}


//       {/* ======================================================
//           ERROR MESSAGE
//       ====================================================== */}

//       {error && (
//         <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//           <div className="flex-1">
//             {error}
//           </div>

//           <button
//             type="button"
//             onClick={() => setError("")}
//             className="text-red-600 hover:text-red-800"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}


//       {/* ======================================================
//           SUMMARY CARDS
//       ====================================================== */}

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 Total Subjects
//               </p>

//               <p className="mt-2 text-3xl font-bold text-gray-900">
//                 {totalSubjects}
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
//               <BookOpen className="h-5 w-5 text-blue-600" />
//             </div>
//           </div>
//         </div>


//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 Active Subjects
//               </p>

//               <p className="mt-2 text-3xl font-bold text-gray-900">
//                 {activeSubjects}
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
//               <CheckCircle2 className="h-5 w-5 text-green-600" />
//             </div>
//           </div>
//         </div>


//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 Inactive Subjects
//               </p>

//               <p className="mt-2 text-3xl font-bold text-gray-900">
//                 {inactiveSubjects}
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
//               <AlertCircle className="h-5 w-5 text-gray-500" />
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* ======================================================
//           FILTERS
//       ====================================================== */}

//       <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//           {/* Search */}

//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(event) =>
//                 setSearchTerm(
//                   event.target.value,
//                 )
//               }
//               placeholder="Search subjects..."
//               className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
//             />
//           </div>


//           {/* Education Level */}

//           <select
//             value={educationLevelFilter}
//             onChange={(event) =>
//               setEducationLevelFilter(
//                 event.target.value,
//               )
//             }
//             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
//           >
//             <option value="ALL">
//               All Education Levels
//             </option>

//             <option value="PRIMARY">
//               Primary
//             </option>

//             <option value="JSS">
//               Junior Secondary (JSS)
//             </option>

//             <option value="SS">
//               Senior Secondary (SS)
//             </option>
//           </select>


//           {/* Status */}

//           <select
//             value={statusFilter}
//             onChange={(event) =>
//               setStatusFilter(
//                 event.target.value,
//               )
//             }
//             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
//           >
//             <option value="ALL">
//               All Statuses
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


//       {/* ======================================================
//           SUBJECT TABLE
//       ====================================================== */}

//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
//         <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">
//               Subject List
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Showing{" "}
//               {filteredSubjects.length}{" "}
//               of {subjects.length} subjects
//             </p>
//           </div>
//         </div>


//         {filteredSubjects.length === 0 ? (
//           <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
//             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
//               <BookOpen className="h-7 w-7 text-gray-400" />
//             </div>

//             <h3 className="mt-4 text-base font-semibold text-gray-900">
//               No subjects found
//             </h3>

//             <p className="mt-1 max-w-md text-sm text-gray-500">
//               {subjects.length === 0
//                 ? "No subjects have been created yet."
//                 : "Try changing your search or filters."}
//             </p>

//             {subjects.length === 0 && (
//               <button
//                 type="button"
//                 onClick={openAddForm}
//                 className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
//               >
//                 <Plus className="h-4 w-4" />

//                 Add Subject
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Subject
//                   </th>

//                   <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Code
//                   </th>

//                   <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Education Level
//                   </th>

//                   <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Status
//                   </th>

//                   <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>


//               <tbody className="divide-y divide-gray-200 bg-white">
//                 {filteredSubjects.map(
//                   (subject) => (
//                     <tr
//                       key={subject.id}
//                       className="transition hover:bg-gray-50"
//                     >
//                       {/* Subject */}

//                       <td className="whitespace-nowrap px-5 py-4">
//                         <div>
//                           <p className="font-medium text-gray-900">
//                             {subject.name}
//                           </p>

//                           {subject.description && (
//                             <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
//                               {
//                                 subject.description
//                               }
//                             </p>
//                           )}
//                         </div>
//                       </td>


//                       {/* Code */}

//                       <td className="whitespace-nowrap px-5 py-4">
//                         <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
//                           {subject.code ||
//                             "—"}
//                         </span>
//                       </td>


//                       {/* Education Level */}

//                       <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
//                         {getEducationLevelLabel(
//                           subject,
//                         )}
//                       </td>


//                       {/* Status */}

//                       <td className="whitespace-nowrap px-5 py-4">
//                         {subject.is_active ? (
//                           <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
//                             <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

//                             Active
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
//                             <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

//                             Inactive
//                           </span>
//                         )}
//                       </td>


//                       {/* Actions */}

//                       <td className="whitespace-nowrap px-5 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           {/* View */}

//                           <button
//                             type="button"
//                             onClick={() =>
//                               navigate(
//                                 `/school-admin/academics/subjects/${subject.id}`,
//                               )
//                             }
//                             title="View subject"
//                             className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </button>


//                           {/* Edit */}

//                           <button
//                             type="button"
//                             onClick={() =>
//                               openEditForm(
//                                 subject,
//                               )
//                             }
//                             title="Edit subject"
//                             className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </button>


//                           {/* Delete */}

//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleDelete(
//                                 subject,
//                               )
//                             }
//                             disabled={
//                               deletingId ===
//                               subject.id
//                             }
//                             title="Delete subject"
//                             className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             {deletingId ===
//                             subject.id ? (
//                               <Loader2 className="h-4 w-4 animate-spin" />
//                             ) : (
//                               <Trash2 className="h-4 w-4" />
//                             )}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ),
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>


//       {/* ======================================================
//           ADD / EDIT SUBJECT MODAL
//       ====================================================== */}

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
//             {/* Modal Header */}

//             <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {editingSubject
//                     ? "Edit Subject"
//                     : "Add Subject"}
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   {editingSubject
//                     ? "Update the subject information below."
//                     : "Create a new subject for your school."}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeForm}
//                 disabled={saving}
//                 className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>


//             {/* Modal Body */}

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5 px-6 py-6"
//             >
//               {formError && (
//                 <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                   <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//                   <div>
//                     {formError}
//                   </div>
//                 </div>
//               )}


//               {/* Subject Name */}

//               <div>
//                 <label
//                   htmlFor="subject-name"
//                   className="mb-2 block text-sm font-medium text-gray-700"
//                 >
//                   Subject Name
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <input
//                   id="subject-name"
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleFormChange}
//                   placeholder="e.g. Mathematics"
//                   disabled={saving}
//                   className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
//                 />
//               </div>


//               {/* Subject Code */}

//               <div>
//                 <label
//                   htmlFor="subject-code"
//                   className="mb-2 block text-sm font-medium text-gray-700"
//                 >
//                   Subject Code
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <input
//                   id="subject-code"
//                   type="text"
//                   name="code"
//                   value={form.code}
//                   onChange={handleFormChange}
//                   placeholder="e.g. MATH"
//                   disabled={saving}
//                   className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
//                 />
//               </div>


//               {/* Description */}

//               <div>
//                 <label
//                   htmlFor="subject-description"
//                   className="mb-2 block text-sm font-medium text-gray-700"
//                 >
//                   Description
//                 </label>

//                 <textarea
//                   id="subject-description"
//                   name="description"
//                   value={form.description}
//                   onChange={handleFormChange}
//                   placeholder="Enter a short description of the subject..."
//                   rows={4}
//                   disabled={saving}
//                   className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
//                 />
//               </div>


//               {/* Active */}

//               <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
//                 <input
//                   type="checkbox"
//                   name="is_active"
//                   checked={form.is_active}
//                   onChange={handleFormChange}
//                   disabled={saving}
//                   className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
//                 />

//                 <div>
//                   <p className="text-sm font-medium text-gray-900">
//                     Active Subject
//                   </p>

//                   <p className="mt-0.5 text-xs text-gray-500">
//                     Active subjects can be assigned to
//                     classes and used in academic
//                     activities.
//                   </p>
//                 </div>
//               </label>


//               {/* Actions */}

//               <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
//                 <button
//                   type="button"
//                   onClick={closeForm}
//                   disabled={saving}
//                   className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {saving && (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   )}

//                   {saving
//                     ? "Saving..."
//                     : editingSubject
//                       ? "Update Subject"
//                       : "Create Subject"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Subjects;


import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Search,
  Plus,
  Pencil,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  BookOpen,
  X,
  CheckCircle2,
} from "lucide-react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../services/academicsService";


const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  is_active: true,
};


const EDUCATION_LEVEL_LABELS = {
  PRIMARY: "Primary",
  JSS: "Junior Secondary (JSS)",
  SS: "Senior Secondary (SS)",
};


const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


function Subjects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [educationLevelFilter, setEducationLevelFilter] =
    useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingSubject, setEditingSubject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  // ============================================================
  // LOAD SUBJECTS
  // ============================================================

  const loadSubjects = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getSubjects();

      setSubjects(normalizeList(response));
    } catch (err) {
      console.error("Failed to load subjects:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load subjects. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadSubjects();
  }, []);


  // ============================================================
  // FORM HELPERS
  // ============================================================

  const openAddForm = () => {
    setEditingSubject(null);

    setForm({
      ...EMPTY_FORM,
    });

    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };


  const openEditForm = (subject) => {
    setEditingSubject(subject);

    setForm({
      name: subject.name || "",
      code: subject.code || "",
      description: subject.description || "",
      is_active:
        typeof subject.is_active === "boolean"
          ? subject.is_active
          : true,
    });

    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };


  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingSubject(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };


  // ============================================================
  // OPEN EDIT FORM FROM SUBJECT DETAILS PAGE
  // ============================================================

  useEffect(() => {
    const editSubjectId =
      location.state?.editSubjectId;

    if (!editSubjectId || subjects.length === 0) {
      return;
    }

    const subjectToEdit = subjects.find(
      (subject) =>
        String(subject.id) ===
        String(editSubjectId),
    );

    if (!subjectToEdit) {
      return;
    }

    setEditingSubject(subjectToEdit);

    setForm({
      name: subjectToEdit.name || "",
      code: subjectToEdit.code || "",
      description:
        subjectToEdit.description || "",
      is_active:
        typeof subjectToEdit.is_active ===
        "boolean"
          ? subjectToEdit.is_active
          : true,
    });

    setFormError("");
    setSuccessMessage("");
    setShowForm(true);

    // Clear router state so refreshing the page
    // does not reopen the edit form.
    navigate(
      "/school-admin/academics/subjects",
      {
        replace: true,
        state: {},
      },
    );
  }, [
    subjects,
    location.state,
    navigate,
  ]);


  // ============================================================
  // FORM INPUT
  // ============================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");
    setSuccessMessage("");
  };


  // ============================================================
  // SAVE SUBJECT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const name = form.name.trim();
    const code = form.code.trim();
    const description =
      form.description.trim();

    if (!name) {
      setFormError(
        "Subject name is required.",
      );
      return;
    }

    if (!code) {
      setFormError(
        "Subject code is required.",
      );
      return;
    }

    const payload = {
      name,
      code,
      description,
      is_active: form.is_active,
    };

    try {
      setSaving(true);

      if (editingSubject) {
        const updatedSubject =
          await updateSubject(
            editingSubject.id,
            payload,
          );

        setSubjects((previous) =>
          previous.map((subject) =>
            subject.id ===
            editingSubject.id
              ? updatedSubject
              : subject,
          ),
        );

        setSuccessMessage(
          "Subject updated successfully.",
        );
      } else {
        const createdSubject =
          await createSubject(payload);

        setSubjects((previous) => [
          createdSubject,
          ...previous,
        ]);

        setSuccessMessage(
          "Subject created successfully.",
        );
      }

      setShowForm(false);
      setEditingSubject(null);
      setForm(EMPTY_FORM);

      await loadSubjects(true);
    } catch (err) {
      console.error(
        "Failed to save subject:",
        err,
      );

      const responseData =
        err?.response?.data;

      let message =
        responseData?.detail ||
        responseData?.message ||
        "Failed to save subject. Please try again.";

      if (
        typeof responseData ===
          "object" &&
        responseData !== null
      ) {
        if (responseData.name) {
          message = Array.isArray(
            responseData.name,
          )
            ? responseData.name[0]
            : responseData.name;
        } else if (
          responseData.code
        ) {
          message = Array.isArray(
            responseData.code,
          )
            ? responseData.code[0]
            : responseData.code;
        }
      }

      setFormError(message);
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // DELETE SUBJECT
  // ============================================================

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(subject.id);
      setError("");
      setSuccessMessage("");

      await deleteSubject(subject.id);

      setSubjects((previous) =>
        previous.filter(
          (item) =>
            item.id !== subject.id,
        ),
      );

      setSuccessMessage(
        "Subject deleted successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to delete subject:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete subject. The subject may already be assigned to a class.",
      );
    } finally {
      setDeletingId(null);
    }
  };


  // ============================================================
  // FILTERED SUBJECTS
  // ============================================================

  const filteredSubjects = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        !search ||
        subject.name
          ?.toLowerCase()
          .includes(search) ||
        subject.code
          ?.toLowerCase()
          .includes(search) ||
        subject.description
          ?.toLowerCase()
          .includes(search);

      const educationLevel =
        subject.education_level ||
        subject.educationLevel ||
        "";

      const matchesEducationLevel =
        educationLevelFilter ===
          "ALL" ||
        educationLevel ===
          educationLevelFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          subject.is_active === true) ||
        (statusFilter === "INACTIVE" &&
          subject.is_active === false);

      return (
        matchesSearch &&
        matchesEducationLevel &&
        matchesStatus
      );
    });
  }, [
    subjects,
    searchTerm,
    educationLevelFilter,
    statusFilter,
  ]);


  // ============================================================
  // SUMMARY
  // ============================================================

  const totalSubjects = subjects.length;

  const activeSubjects =
    subjects.filter(
      (subject) =>
        subject.is_active === true,
    ).length;

  const inactiveSubjects =
    subjects.filter(
      (subject) =>
        subject.is_active === false,
    ).length;


  // ============================================================
  // EDUCATION LEVEL
  // ============================================================

  const getEducationLevelLabel = (
    subject,
  ) => {
    const level =
      subject.education_level ||
      subject.educationLevel;

    return (
      EDUCATION_LEVEL_LABELS[level] ||
      level ||
      "—"
    );
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

          <p className="text-sm text-gray-500">
            Loading subjects...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-6">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subjects
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage subjects offered by
                your school.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              loadSubjects(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />

            Add Subject
          </button>
        </div>
      </div>


      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {successMessage}
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Subjects
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalSubjects}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Subjects
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeSubjects}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Subjects
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {inactiveSubjects}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
              <AlertCircle className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search subjects..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>


          {/* Education Level */}

          <select
            value={educationLevelFilter}
            onChange={(event) =>
              setEducationLevelFilter(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="ALL">
              All Education Levels
            </option>

            <option value="PRIMARY">
              Primary
            </option>

            <option value="JSS">
              Junior Secondary (JSS)
            </option>

            <option value="SS">
              Senior Secondary (SS)
            </option>
          </select>


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
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


      {/* ======================================================
          SUBJECT TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subject List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing{" "}
              {filteredSubjects.length}{" "}
              of {subjects.length} subjects
            </p>
          </div>
        </div>


        {filteredSubjects.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No subjects found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {subjects.length === 0
                ? "No subjects have been created yet."
                : "Try changing your search or filters."}
            </p>

            {subjects.length === 0 && (
              <button
                type="button"
                onClick={openAddForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />

                Add Subject
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* SUBJECT - ALWAYS VISIBLE */}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
                    Subject
                  </th>

                  {/* CODE - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Code
                  </th>

                  {/* EDUCATION LEVEL - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Education Level
                  </th>

                  {/* STATUS - HIDDEN ON MOBILE */}
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    Status
                  </th>

                  {/* ACTIONS - VIEW ONLY ON MOBILE */}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
                    Actions
                  </th>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSubjects.map(
                  (subject) => (
                    <tr
                      key={subject.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* ==================================================
                          SUBJECT
                      ================================================== */}

                      <td className="px-4 py-4 md:px-5">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {subject.name}
                          </p>

                          {/* Description */}
                          {subject.description && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500 md:max-w-xs">
                              {
                                subject.description
                              }
                            </p>
                          )}

                          {/* Code shown underneath subject on mobile */}
                          {subject.code && (
                            <p className="mt-1 text-xs font-medium text-gray-400 md:hidden">
                              {subject.code}
                            </p>
                          )}
                        </div>
                      </td>


                      {/* ==================================================
                          CODE
                          Hidden on mobile
                      ================================================== */}

                      <td className="hidden whitespace-nowrap px-5 py-4 md:table-cell">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {subject.code ||
                            "—"}
                        </span>
                      </td>


                      {/* ==================================================
                          EDUCATION LEVEL
                          Hidden on mobile
                      ================================================== */}

                      <td className="hidden whitespace-nowrap px-5 py-4 text-sm text-gray-700 md:table-cell">
                        {getEducationLevelLabel(
                          subject,
                        )}
                      </td>


                      {/* ==================================================
                          STATUS
                          Hidden on mobile
                      ================================================== */}

                      <td className="hidden whitespace-nowrap px-5 py-4 md:table-cell">
                        {subject.is_active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

                            Inactive
                          </span>
                        )}
                      </td>


                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-4 md:px-5">
                        <div className="flex items-center justify-end gap-2">
                          {/* ==========================================
                              VIEW
                              Visible on ALL screen sizes
                          ========================================== */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/school-admin/academics/subjects/${subject.id}`,
                              )
                            }
                            title="View subject"
                            aria-label="View subject"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>


                          {/* ==========================================
                              EDIT
                              Hidden on mobile
                          ========================================== */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                subject,
                              )
                            }
                            title="Edit subject"
                            aria-label="Edit subject"
                            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 md:inline-flex"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>


                          {/* ==========================================
                              DELETE
                              Hidden on mobile
                          ========================================== */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                subject,
                              )
                            }
                            disabled={
                              deletingId ===
                              subject.id
                            }
                            title="Delete subject"
                            aria-label="Delete subject"
                            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
                          >
                            {deletingId ===
                            subject.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* ======================================================
          ADD / EDIT SUBJECT MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSubject
                    ? "Edit Subject"
                    : "Add Subject"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingSubject
                    ? "Update the subject information below."
                    : "Create a new subject for your school."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >
              {formError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    {formError}
                  </div>
                </div>
              )}


              {/* Subject Name */}

              <div>
                <label
                  htmlFor="subject-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="subject-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Mathematics"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>


              {/* Subject Code */}

              <div>
                <label
                  htmlFor="subject-code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject Code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="subject-code"
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleFormChange}
                  placeholder="e.g. MATH"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>


              {/* Description */}

              <div>
                <label
                  htmlFor="subject-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="subject-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Enter a short description of the subject..."
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>


              {/* Active */}

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleFormChange}
                  disabled={saving}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Active Subject
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Active subjects can be assigned
                    to classes and used in academic
                    activities.
                  </p>
                </div>
              </label>


              {/* Actions */}

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingSubject
                      ? "Update Subject"
                      : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;