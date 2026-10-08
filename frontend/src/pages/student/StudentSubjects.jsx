// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   getStudentSubjects,
//   selectOptionalSubject,
//   removeOptionalSubject,
// } from "../../services/studentsService";


// // =========================================================
// // HELPERS
// // =========================================================

// const getInitials = (name = "") => {
//   return name
//     .trim()
//     .split(/\s+/)
//     .slice(0, 2)
//     .map((word) => word.charAt(0).toUpperCase())
//     .join("");
// };


// // =========================================================
// // STAT CARD
// // =========================================================

// const StatCard = ({
//   title,
//   value,
//   description,
//   icon,
// }) => {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-500">
//             {title}
//           </p>

//           <p className="mt-2 text-3xl font-bold text-slate-900">
//             {value}
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             {description}
//           </p>
//         </div>

//         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// };


// // =========================================================
// // SUBJECT CARD
// // =========================================================

// const SubjectCard = ({
//   subject,
//   type,
//   onRemove,
//   removing,
// }) => {
//   const isOptional = type === "optional";

//   return (
//     <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
//       <div className="flex items-start justify-between gap-4">

//         <div className="flex min-w-0 items-center gap-4">

//           {/* Subject icon */}
//           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
//             {subject.name?.charAt(0)?.toUpperCase() || "S"}
//           </div>

//           <div className="min-w-0">
//             <h3 className="truncate text-base font-bold text-slate-900">
//               {subject.name}
//             </h3>

//             <p className="mt-1 text-sm text-slate-500">
//               Code:{" "}
//               <span className="font-semibold text-slate-700">
//                 {subject.code || "—"}
//               </span>
//             </p>
//           </div>
//         </div>

//         {/* Type */}
//         <span
//           className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
//             isOptional
//               ? "bg-amber-50 text-amber-700"
//               : "bg-blue-50 text-blue-700"
//           }`}
//         >
//           {isOptional ? "Optional" : "Compulsory"}
//         </span>
//       </div>

//       <div className="mt-5 grid grid-cols-2 gap-3">

//         <div className="rounded-xl bg-slate-50 p-3">
//           <p className="text-xs text-slate-400">
//             Education Level
//           </p>

//           <p className="mt-1 text-sm font-semibold text-slate-700">
//             {subject.education_level || "—"}
//           </p>
//         </div>

//         <div className="rounded-xl bg-slate-50 p-3">
//           <p className="text-xs text-slate-400">
//             Department
//           </p>

//           <p className="mt-1 text-sm font-semibold text-slate-700">
//             {subject.department_name || "General"}
//           </p>
//         </div>

//       </div>

//       {isOptional && onRemove && (
//         <button
//           type="button"
//           onClick={() => onRemove(subject)}
//           disabled={removing}
//           className="mt-4 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {removing
//             ? "Removing..."
//             : "Remove Subject"}
//         </button>
//       )}
//     </div>
//   );
// };


// // =========================================================
// // SUBJECT SECTION
// // =========================================================

// const SubjectSection = ({
//   title,
//   subtitle,
//   subjects,
//   type,
//   onRemove,
//   removingId,
// }) => {
//   if (!subjects || subjects.length === 0) {
//     return null;
//   }

//   return (
//     <section>

//       <div className="mb-4">
//         <h2 className="text-lg font-bold text-slate-900">
//           {title}
//         </h2>

//         <p className="mt-1 text-sm text-slate-500">
//           {subtitle}
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//         {subjects.map((subject) => (
//           <SubjectCard
//             key={subject.class_subject_id}
//             subject={subject}
//             type={type}
//             onRemove={onRemove}
//             removing={
//               removingId === subject.subject_id
//             }
//           />
//         ))}
//       </div>

//     </section>
//   );
// };


// // =========================================================
// // STUDENT SUBJECTS
// // =========================================================

// const StudentSubjects = () => {
//   const { user } = useAuth();

//   const studentId =
//     user?.student_id ||
//     user?.student?.id ||
//     user?.profile?.student_id ||
//     user?.profile?.id;

//   const [data, setData] = useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [selectingId, setSelectingId] =
//     useState(null);

//   const [removingId, setRemovingId] =
//     useState(null);

//   const [message, setMessage] =
//     useState("");

//   // =======================================================
//   // LOAD SUBJECTS
//   // =======================================================

//   const loadSubjects = async () => {
//     if (!studentId) {
//       setError(
//         "Student profile could not be identified."
//       );

//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response =
//         await getStudentSubjects(
//           studentId
//         );

//       setData(response);
//     } catch (err) {
//       console.error(
//         "Failed to load student subjects:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           "Unable to load your subjects."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSubjects();
//   }, [studentId]);

//   // =======================================================
//   // SELECT OPTIONAL SUBJECT
//   // =======================================================

//   const handleSelectSubject = async (
//     subject
//   ) => {
//     if (!studentId) return;

//     try {
//       setSelectingId(
//         subject.subject_id
//       );

//       setMessage("");
//       setError("");

//       await selectOptionalSubject(
//         studentId,
//         subject.subject_id
//       );

//       setMessage(
//         `${subject.name} has been added to your subjects.`
//       );

//       await loadSubjects();
//     } catch (err) {
//       console.error(
//         "Failed to select subject:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           "Unable to select this subject."
//       );
//     } finally {
//       setSelectingId(null);
//     }
//   };

//   // =======================================================
//   // REMOVE OPTIONAL SUBJECT
//   // =======================================================

//   const handleRemoveSubject = async (
//     subject
//   ) => {
//     if (!studentId) return;

//     const confirmed = window.confirm(
//       `Remove ${subject.name} from your selected subjects?`
//     );

//     if (!confirmed) return;

//     try {
//       setRemovingId(
//         subject.subject_id
//       );

//       setMessage("");
//       setError("");

//       await removeOptionalSubject(
//         studentId,
//         subject.subject_id
//       );

//       setMessage(
//         `${subject.name} has been removed.`
//       );

//       await loadSubjects();
//     } catch (err) {
//       console.error(
//         "Failed to remove subject:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           "Unable to remove this subject."
//       );
//     } finally {
//       setRemovingId(null);
//     }
//   };

//   // =======================================================
//   // COUNTS
//   // =======================================================

//   const counts = useMemo(() => {
//     if (!data) {
//       return {
//         compulsory: 0,
//         selected: 0,
//         available: 0,
//         total: 0,
//       };
//     }

//     const compulsory =
//       (data.general_compulsory?.length || 0) +
//       (data.department_compulsory?.length || 0);

//     const selected =
//       data.selected_optional?.length || 0;

//     const available =
//       data.available_optional?.length || 0;

//     return {
//       compulsory,
//       selected,
//       available,
//       total:
//         compulsory +
//         selected,
//     };
//   }, [data]);

//   // =======================================================
//   // LOADING
//   // =======================================================

//   if (loading) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <div className="text-center">

//           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

//           <p className="mt-4 text-sm text-slate-500">
//             Loading your subjects...
//           </p>

//         </div>
//       </div>
//     );
//   }

//   // =======================================================
//   // ERROR
//   // =======================================================

//   if (error && !data) {
//     return (
//       <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
//         <h2 className="font-bold text-red-800">
//           Unable to load subjects
//         </h2>

//         <p className="mt-2 text-sm text-red-600">
//           {error}
//         </p>

//         <button
//           type="button"
//           onClick={loadSubjects}
//           className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!data) {
//     return null;
//   }

//   const student =
//     data.student || {};

//   const enrollment =
//     data.enrollment || {};

//   const optionalSelection =
//     data.optional_selection || {};

//   return (
//     <div className="space-y-6">

//       {/* ================================================= */}
//       {/* PAGE HEADER */}
//       {/* ================================================= */}

//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">
//             My Subjects
//           </h1>

//           <p className="mt-1 text-sm text-slate-500">
//             View the subjects assigned to your
//             current class and term.
//           </p>
//         </div>

//         <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">

//           <p className="text-xs font-medium text-blue-500">
//             Current Academic Period
//           </p>

//           <p className="mt-1 font-bold text-blue-900">
//             {enrollment.session_name || "—"}
//           </p>

//           <p className="text-sm text-blue-700">
//             {enrollment.term_name || "—"}
//           </p>

//         </div>

//       </div>


//       {/* ================================================= */}
//       {/* STUDENT / CLASS INFORMATION */}
//       {/* ================================================= */}

//       <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//         <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

//           <div className="flex items-center gap-4">

//             <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
//               {getInitials(
//                 student.full_name
//               )}
//             </div>

//             <div>
//               <h2 className="font-bold text-slate-900">
//                 {student.full_name || "Student"}
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Admission No:{" "}
//                 <span className="font-semibold text-slate-700">
//                   {student.admission_number || "—"}
//                 </span>
//               </p>
//             </div>

//           </div>


//           <div className="flex flex-wrap gap-3">

//             <div className="rounded-xl bg-slate-50 px-4 py-3">
//               <p className="text-xs text-slate-400">
//                 Class
//               </p>

//               <p className="mt-1 text-sm font-bold text-slate-800">
//                 {enrollment.class_name || "—"}
//               </p>
//             </div>

//             <div className="rounded-xl bg-slate-50 px-4 py-3">
//               <p className="text-xs text-slate-400">
//                 Department
//               </p>

//               <p className="mt-1 text-sm font-bold text-slate-800">
//                 {student.department_name ||
//                   "General"}
//               </p>
//             </div>

//           </div>

//         </div>

//       </div>


//       {/* ================================================= */}
//       {/* MESSAGES */}
//       {/* ================================================= */}

//       {message && (
//         <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
//           {error}
//         </div>
//       )}


//       {/* ================================================= */}
//       {/* STATISTICS */}
//       {/* ================================================= */}

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

//         <StatCard
//           title="Total Subjects"
//           value={counts.total}
//           description="Subjects you currently take"
//           icon="📚"
//         />

//         <StatCard
//           title="Compulsory"
//           value={counts.compulsory}
//           description="Required subjects"
//           icon="✓"
//         />

//         <StatCard
//           title="Selected Optional"
//           value={counts.selected}
//           description="Optional subjects selected"
//           icon="⭐"
//         />

//         <StatCard
//           title="Available Optional"
//           value={counts.available}
//           description="Optional subjects available"
//           icon="➕"
//         />

//       </div>


//       {/* ================================================= */}
//       {/* GENERAL COMPULSORY */}
//       {/* ================================================= */}

//       <SubjectSection
//         title="General Compulsory Subjects"
//         subtitle="These subjects are compulsory for students in your class."
//         subjects={
//           data.general_compulsory
//         }
//         type="compulsory"
//       />


//       {/* ================================================= */}
//       {/* DEPARTMENT COMPULSORY */}
//       {/* ================================================= */}

//       <SubjectSection
//         title="Department Compulsory Subjects"
//         subtitle={
//           student.department_name
//             ? `Compulsory subjects for ${student.department_name}.`
//             : "Compulsory subjects assigned to your department."
//         }
//         subjects={
//           data.department_compulsory
//         }
//         type="compulsory"
//       />


//       {/* ================================================= */}
//       {/* SELECTED OPTIONAL */}
//       {/* ================================================= */}

//       <SubjectSection
//         title="My Selected Optional Subjects"
//         subtitle="Optional subjects you have selected."
//         subjects={
//           data.selected_optional
//         }
//         type="optional"
//         onRemove={
//           optionalSelection.can_change
//             ? handleRemoveSubject
//             : undefined
//         }
//         removingId={removingId}
//       />


//       {/* ================================================= */}
//       {/* OPTIONAL SUBJECTS */}
//       {/* ================================================= */}

//       {data.available_optional?.length > 0 && (
//         <section>

//           <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 Available Optional Subjects
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Choose from the optional subjects available
//                 for your class.
//               </p>
//             </div>

//             <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm">

//               <span className="text-slate-500">
//                 Selection:
//               </span>{" "}

//               <span className="font-bold text-slate-800">
//                 {optionalSelection.selected_count || 0}
//               </span>

//               {" / "}

//               <span className="font-bold text-slate-800">
//                 {optionalSelection.max_optional_subjects || 0}
//               </span>

//             </div>

//           </div>


//           {!optionalSelection.can_select && (
//             <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">

//               {optionalSelection.status ===
//                 "CLOSED" &&
//                 "Optional subject selection is currently closed."}

//               {optionalSelection.status ===
//                 "NOT_STARTED" &&
//                 "Optional subject selection has not started yet."}

//               {optionalSelection.status ===
//                 "DISABLED" &&
//                 "Optional subject selection is currently disabled."}

//               {optionalSelection.status ===
//                 "NOT_CONFIGURED" &&
//                 "Optional subject selection has not been configured."}

//             </div>
//           )}


//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

//             {data.available_optional.map(
//               (subject) => (
//                 <div
//                   key={
//                     subject.class_subject_id
//                   }
//                   className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//                 >

//                   <div className="flex items-start justify-between gap-4">

//                     <div className="flex items-center gap-3">

//                       <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 font-bold text-amber-600">
//                         {subject.name
//                           ?.charAt(0)
//                           ?.toUpperCase() ||
//                           "S"}
//                       </div>

//                       <div>
//                         <h3 className="font-bold text-slate-900">
//                           {subject.name}
//                         </h3>

//                         <p className="mt-1 text-xs text-slate-500">
//                           {subject.code || "No code"}
//                         </p>
//                       </div>

//                     </div>

//                     <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
//                       Optional
//                     </span>

//                   </div>


//                   <div className="mt-4">

//                     <p className="text-xs text-slate-400">
//                       Department
//                     </p>

//                     <p className="mt-1 text-sm font-semibold text-slate-700">
//                       {subject.department_name ||
//                         "General"}
//                     </p>

//                   </div>


//                   <button
//                     type="button"
//                     disabled={
//                       !optionalSelection.can_select ||
//                       selectingId ===
//                         subject.subject_id
//                     }
//                     onClick={() =>
//                       handleSelectSubject(
//                         subject
//                       )
//                     }
//                     className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
//                   >
//                     {selectingId ===
//                     subject.subject_id
//                       ? "Selecting..."
//                       : "Select Subject"}
//                   </button>

//                 </div>
//               )
//             )}

//           </div>

//         </section>
//       )}


//       {/* ================================================= */}
//       {/* EMPTY STATE */}
//       {/* ================================================= */}

//       {counts.total === 0 &&
//         counts.available === 0 && (
//           <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

//             <div className="text-4xl">
//               📚
//             </div>

//             <h2 className="mt-4 text-lg font-bold text-slate-900">
//               No subjects assigned yet
//             </h2>

//             <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
//               There are currently no active subjects
//               assigned to your current class and
//               academic period.
//             </p>

//           </div>
//         )}

//     </div>
//   );
// };

// export default StudentSubjects;



import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getStudentSubjects,
  selectOptionalSubject,
  removeOptionalSubject,
} from "../../services/studentsService";

// =========================================================
// HELPERS
// =========================================================

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUBJECT CARD
// =========================================================

const SubjectCard = ({
  subject,
  type,
  onRemove,
  removing,
}) => {
  const isOptional = type === "optional";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-center gap-4">

          {/* Subject icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
            {subject.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {subject.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Code:{" "}
              <span className="font-semibold text-slate-700">
                {subject.code || "—"}
              </span>
            </p>
          </div>
        </div>

        {/* Type */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isOptional
              ? "bg-amber-50 text-amber-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {isOptional ? "Optional" : "Compulsory"}
        </span>
      </div>

      {/* ================================================= */}
      {/* SUBJECT INFORMATION */}
      {/* ================================================= */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        {/* Education Level */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Education Level
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {subject.education_level || "—"}
          </p>
        </div>

        {/* Subject Teacher */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Subject Teacher
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {subject.teacher_name || "Not Assigned"}
          </p>
        </div>

        {/* Department */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            Department
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {subject.department_name || "General"}
          </p>
        </div>

      </div>

      {isOptional && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(subject)}
          disabled={removing}
          className="mt-4 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {removing
            ? "Removing..."
            : "Remove Subject"}
        </button>
      )}
    </div>
  );
};

// =========================================================
// SUBJECT SECTION
// =========================================================

const SubjectSection = ({
  title,
  subtitle,
  subjects,
  type,
  onRemove,
  removingId,
}) => {
  if (!subjects || subjects.length === 0) {
    return null;
  }

  return (
    <section>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.class_subject_id}
            subject={subject}
            type={type}
            onRemove={onRemove}
            removing={
              removingId === subject.subject_id
            }
          />
        ))}
      </div>

    </section>
  );
};

// =========================================================
// STUDENT SUBJECTS
// =========================================================

const StudentSubjects = () => {
  const { user } = useAuth();

  const studentId =
    user?.student_id ||
    user?.student?.id ||
    user?.profile?.student_id ||
    user?.profile?.id;

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectingId, setSelectingId] =
    useState(null);

  const [removingId, setRemovingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  // =======================================================
  // LOAD SUBJECTS
  // =======================================================

  const loadSubjects = async () => {
    if (!studentId) {
      setError(
        "Student profile could not be identified."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getStudentSubjects(
          studentId
        );

      setData(response);
    } catch (err) {
      console.error(
        "Failed to load student subjects:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load your subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [studentId]);

  // =======================================================
  // SELECT OPTIONAL SUBJECT
  // =======================================================

  const handleSelectSubject = async (
    subject
  ) => {
    if (!studentId) return;

    try {
      setSelectingId(
        subject.subject_id
      );

      setMessage("");
      setError("");

      await selectOptionalSubject(
        studentId,
        subject.subject_id
      );

      setMessage(
        `${subject.name} has been added to your subjects.`
      );

      await loadSubjects();
    } catch (err) {
      console.error(
        "Failed to select subject:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to select this subject."
      );
    } finally {
      setSelectingId(null);
    }
  };

  // =======================================================
  // REMOVE OPTIONAL SUBJECT
  // =======================================================

  const handleRemoveSubject = async (
    subject
  ) => {
    if (!studentId) return;

    const confirmed = window.confirm(
      `Remove ${subject.name} from your selected subjects?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(
        subject.subject_id
      );

      setMessage("");
      setError("");

      await removeOptionalSubject(
        studentId,
        subject.subject_id
      );

      setMessage(
        `${subject.name} has been removed.`
      );

      await loadSubjects();
    } catch (err) {
      console.error(
        "Failed to remove subject:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to remove this subject."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =======================================================
  // COUNTS
  // =======================================================

  const counts = useMemo(() => {
    if (!data) {
      return {
        compulsory: 0,
        selected: 0,
        available: 0,
        total: 0,
      };
    }

    const compulsory =
      (data.general_compulsory?.length || 0) +
      (data.department_compulsory?.length || 0);

    const selected =
      data.selected_optional?.length || 0;

    const available =
      data.available_optional?.length || 0;

    return {
      compulsory,
      selected,
      available,
      total:
        compulsory +
        selected,
    };
  }, [data]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your subjects...
          </p>

        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-bold text-red-800">
          Unable to load subjects
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadSubjects}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const student =
    data.student || {};

  const enrollment =
    data.enrollment || {};

  const optionalSelection =
    data.optional_selection || {};

  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Subjects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View the subjects assigned to your
            current class and term.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">

          <p className="text-xs font-medium text-blue-500">
            Current Academic Period
          </p>

          <p className="mt-1 font-bold text-blue-900">
            {enrollment.session_name || "—"}
          </p>

          <p className="text-sm text-blue-700">
            {enrollment.term_name || "—"}
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* STUDENT / CLASS INFORMATION */}
      {/* ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {getInitials(
                student.full_name
              )}
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                {student.full_name || "Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Admission No:{" "}
                <span className="font-semibold text-slate-700">
                  {student.admission_number || "—"}
                </span>
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">
                Class
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {enrollment.class_name || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">
                Department
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {student.department_name ||
                  "General"}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* MESSAGES */}
      {/* ================================================= */}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Subjects"
          value={counts.total}
          description="Subjects you currently take"
          icon="📚"
        />

        <StatCard
          title="Compulsory"
          value={counts.compulsory}
          description="Required subjects"
          icon="✓"
        />

        <StatCard
          title="Selected Optional"
          value={counts.selected}
          description="Optional subjects selected"
          icon="⭐"
        />

        <StatCard
          title="Available Optional"
          value={counts.available}
          description="Optional subjects available"
          icon="➕"
        />

      </div>

      {/* ================================================= */}
      {/* GENERAL COMPULSORY */}
      {/* ================================================= */}

      <SubjectSection
        title="General Compulsory Subjects"
        subtitle="These subjects are compulsory for students in your class."
        subjects={
          data.general_compulsory
        }
        type="compulsory"
      />

      {/* ================================================= */}
      {/* DEPARTMENT COMPULSORY */}
      {/* ================================================= */}

      <SubjectSection
        title="Department Compulsory Subjects"
        subtitle={
          student.department_name
            ? `Compulsory subjects for ${student.department_name}.`
            : "Compulsory subjects assigned to your department."
        }
        subjects={
          data.department_compulsory
        }
        type="compulsory"
      />

      {/* ================================================= */}
      {/* SELECTED OPTIONAL */}
      {/* ================================================= */}

      <SubjectSection
        title="My Selected Optional Subjects"
        subtitle="Optional subjects you have selected."
        subjects={
          data.selected_optional
        }
        type="optional"
        onRemove={
          optionalSelection.can_change
            ? handleRemoveSubject
            : undefined
        }
        removingId={removingId}
      />

      {/* ================================================= */}
      {/* OPTIONAL SUBJECTS */}
      {/* ================================================= */}

      {data.available_optional?.length > 0 && (
        <section>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Available Optional Subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose from the optional subjects available
                for your class.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm">

              <span className="text-slate-500">
                Selection:
              </span>{" "}

              <span className="font-bold text-slate-800">
                {optionalSelection.selected_count || 0}
              </span>

              {" / "}

              <span className="font-bold text-slate-800">
                {optionalSelection.max_optional_subjects || 0}
              </span>

            </div>

          </div>

          {!optionalSelection.can_select && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">

              {optionalSelection.status ===
                "CLOSED" &&
                "Optional subject selection is currently closed."}

              {optionalSelection.status ===
                "NOT_STARTED" &&
                "Optional subject selection has not started yet."}

              {optionalSelection.status ===
                "DISABLED" &&
                "Optional subject selection is currently disabled."}

              {optionalSelection.status ===
                "NOT_CONFIGURED" &&
                "Optional subject selection has not been configured."}

            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

            {data.available_optional.map(
              (subject) => (
                <div
                  key={
                    subject.class_subject_id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 font-bold text-amber-600">
                        {subject.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "S"}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {subject.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {subject.code || "No code"}
                        </p>
                      </div>

                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Optional
                    </span>

                  </div>

                  {/* Optional Subject Teacher */}
                  <div className="mt-4">

                    <p className="text-xs text-slate-400">
                      Subject Teacher
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {subject.teacher_name ||
                        "Not Assigned"}
                    </p>

                  </div>

                  {/* Optional Subject Department */}
                  <div className="mt-4">

                    <p className="text-xs text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {subject.department_name ||
                        "General"}
                    </p>

                  </div>

                  <button
                    type="button"
                    disabled={
                      !optionalSelection.can_select ||
                      selectingId ===
                        subject.subject_id
                    }
                    onClick={() =>
                      handleSelectSubject(
                        subject
                      )
                    }
                    className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {selectingId ===
                    subject.subject_id
                      ? "Selecting..."
                      : "Select Subject"}
                  </button>

                </div>
              )
            )}

          </div>

        </section>
      )}

      {/* ================================================= */}
      {/* EMPTY STATE */}
      {/* ================================================= */}

      {counts.total === 0 &&
        counts.available === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <div className="text-4xl">
              📚
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No subjects assigned yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no active subjects
              assigned to your current class and
              academic period.
            </p>

          </div>
        )}

    </div>
  );
};

export default StudentSubjects;

