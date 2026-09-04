// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getParents } from "../../../services/studentsService";

// const AllParents = () => {
//   const navigate = useNavigate();
//   const [parents, setParents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [expandedParent, setExpandedParent] = useState(null);

//   const loadParents = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await getParents();

//       setParents(Array.isArray(data) ? data : data?.results || []);
//     } catch (err) {
//       console.error("Failed to load parents:", err);

//       setError(
//         err.response?.data?.detail ||
//           "Unable to load parents/guardians. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadParents();
//   }, []);

//   const filteredParents = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) {
//       return parents;
//     }

//     return parents.filter((parent) => {
//       const parentMatches =
//         parent.full_name?.toLowerCase().includes(query) ||
//         parent.phone_number?.toLowerCase().includes(query) ||
//         parent.email?.toLowerCase().includes(query) ||
//         parent.relationship?.toLowerCase().includes(query) ||
//         parent.occupation?.toLowerCase().includes(query);

//       const studentMatches = parent.students?.some(
//         (student) =>
//           student.full_name?.toLowerCase().includes(query) ||
//           student.admission_number?.toLowerCase().includes(query),
//       );

//       return parentMatches || studentMatches;
//     });
//   }, [parents, search]);

//   const activeParents = parents.filter(
//     (parent) => parent.is_active !== false,
//   ).length;

//   const emergencyParents = parents.filter(
//     (parent) => parent.emergency_contact === true,
//   ).length;

//   const toggleStudents = (parentId) => {
//     setExpandedParent((current) =>
//       current === parentId ? null : parentId,
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* =====================================================
//           HEADER
//       ===================================================== */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Parents & Guardians
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             View and manage parents, guardians, and their assigned students.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadParents}
//           disabled={loading}
//           className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>

//       {/* =====================================================
//           STATISTICS
//       ===================================================== */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <p className="text-sm font-medium text-gray-500">
//             Total Parents
//           </p>

//           <p className="mt-2 text-3xl font-bold text-gray-900">
//             {parents.length}
//           </p>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <p className="text-sm font-medium text-gray-500">
//             Active Parents
//           </p>

//           <p className="mt-2 text-3xl font-bold text-gray-900">
//             {activeParents}
//           </p>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <p className="text-sm font-medium text-gray-500">
//             Emergency Contacts
//           </p>

//           <p className="mt-2 text-3xl font-bold text-gray-900">
//             {emergencyParents}
//           </p>
//         </div>
//       </div>

//       {/* =====================================================
//           SEARCH
//       ===================================================== */}
//       <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search parent, phone, email, student name or admission number..."
//           className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
//         />
//       </div>

//       {/* =====================================================
//           ERROR
//       ===================================================== */}
//       {error && (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}

//           <button
//             type="button"
//             onClick={loadParents}
//             className="ml-3 font-semibold underline"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       {/* =====================================================
//           TABLE
//       ===================================================== */}
//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
//         {loading ? (
//           <div className="flex min-h-[250px] items-center justify-center">
//             <p className="text-sm text-gray-500">
//               Loading parents and guardians...
//             </p>
//           </div>
//         ) : filteredParents.length === 0 ? (
//           <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
//             <div className="mb-3 text-4xl">👨‍👩‍👧</div>

//             <h3 className="text-lg font-semibold text-gray-900">
//               {search ? "No parents found" : "No parents yet"}
//             </h3>

//             <p className="mt-1 text-sm text-gray-500">
//               {search
//                 ? "Try changing your search terms."
//                 : "Parents added from student records will appear here."}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* =================================================
//                 DESKTOP
//             ================================================= */}
//             <div className="hidden overflow-x-auto md:block">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//                       Parent / Guardian
//                     </th>

//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//                       Relationship
//                     </th>

//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//                       Students
//                     </th>

//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//                       Contact
//                     </th>

//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
//   Actions
// </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-gray-200">
//                   {filteredParents.map((parent) => {
//                     const students = parent.students || [];
//                     const studentCount =
//                       parent.student_count ?? students.length;

//                     const isExpanded =
//                       expandedParent === parent.id;

//                     return (
//                      <tr
//                             key={parent.id}
//                             className="transition hover:bg-gray-50"
//                           >
//                         {/* Parent */}
//                         <td className="px-6 py-5">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
//                               {parent.full_name
//                                 ?.charAt(0)
//                                 ?.toUpperCase() || "P"}
//                             </div>

//                             <div>
//                               <p className="font-semibold text-gray-900">
//                                 {parent.full_name || "—"}
//                               </p>

//                               {parent.occupation && (
//                                 <p className="text-xs text-gray-500">
//                                   {parent.occupation}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Relationship */}
//                         <td className="px-6 py-5">
//                           <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
//                             {parent.relationship || "—"}
//                           </span>
//                         </td>

//                         {/* Students */}
//                         <td className="px-6 py-5">
//                           <div className="min-w-[280px]">
//                             <div className="flex items-center justify-between gap-3">
//                               <span className="text-sm font-semibold text-gray-900">
//                                 {studentCount}{" "}
//                                 {studentCount === 1
//                                   ? "Student"
//                                   : "Students"}
//                               </span>

//                               {studentCount > 0 && (
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     toggleStudents(parent.id)
//                                   }
//                                   className="text-xs font-semibold text-gray-600 underline hover:text-gray-900"
//                                 >
//                                   {isExpanded ? "Hide" : "View"}
//                                 </button>
//                               )}
//                             </div>

//                             {isExpanded && students.length > 0 && (
//                               <div className="mt-3 space-y-2">
//                                 {students.map((student) => (
//                                   <div
//                                     key={student.id}
//                                     className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
//                                   >
//                                     <p className="text-sm font-medium text-gray-900">
//                                       {student.full_name}
//                                     </p>

//                                     <p className="text-xs text-gray-500">
//                                       Admission No:{" "}
//                                       <span className="font-medium text-gray-700">
//                                         {student.admission_number || "—"}
//                                       </span>
//                                     </p>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         </td>

//                         {/* Contact */}
//                         <td className="px-6 py-5">
//                           <div className="space-y-1 text-sm">
//                             <p className="text-gray-700">
//                               {parent.phone_number || "—"}
//                             </p>

//                             <p className="max-w-[220px] truncate text-xs text-gray-500">
//                               {parent.email || "—"}
//                             </p>
//                           </div>
//                         </td>

//                         {/* Status */}
//                         <td className="px-6 py-5">
//                           <div className="flex flex-col gap-2">
//                             <span
//                               className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
//                                 parent.is_active === false
//                                   ? "bg-red-100 text-red-700"
//                                   : "bg-green-100 text-green-700"
//                               }`}
//                             >
//                               {parent.is_active === false
//                                 ? "Inactive"
//                                 : "Active"}
//                             </span>

//                             {parent.emergency_contact && (
//                               <span className="text-xs font-medium text-orange-600">
//                                 Emergency Contact
//                               </span>
//                             )}
//                           </div>

//                           {/* Actions */}
//                     {/* Actions */}
// <td className="px-6 py-5 align-top">
//   <button
//     type="button"
//     onClick={() => navigate(`/admin/parents/${parent.id}`)}
//     className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//   >
//     View
//   </button>
// </td> 
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* =================================================
//                 MOBILE
//             ================================================= */}
//             <div className="divide-y divide-gray-200 md:hidden">
//               {filteredParents.map((parent) => {
//                 const students = parent.students || [];
//                 const studentCount =
//                   parent.student_count ?? students.length;

//                 const isExpanded =
//                   expandedParent === parent.id;

//                 return (
//                   <div key={parent.id} className="p-4">
//                     {/* Parent Header */}
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
//                           {parent.full_name
//                             ?.charAt(0)
//                             ?.toUpperCase() || "P"}
//                         </div>

//                         <div>
//                           <h3 className="font-semibold text-gray-900">
//                             {parent.full_name || "—"}
//                           </h3>

//                           <p className="text-xs text-gray-500">
//                             {parent.relationship ||
//                               "Parent / Guardian"}
//                           </p>
//                         </div>
//                       </div>

//                       <span
//                         className={`rounded-full px-2.5 py-1 text-xs font-medium ${
//                           parent.is_active === false
//                             ? "bg-red-100 text-red-700"
//                             : "bg-green-100 text-green-700"
//                         }`}
//                       >
//                         {parent.is_active === false
//                           ? "Inactive"
//                           : "Active"}
//                       </span>
//                     </div>

//                     {/* Contact */}
//                     <div className="mt-4 space-y-1 text-sm">
//                       <p>
//                         <span className="font-medium text-gray-500">
//                           Phone:
//                         </span>{" "}
//                         {parent.phone_number || "—"}
//                       </p>

//                       <p>
//                         <span className="font-medium text-gray-500">
//                           Email:
//                         </span>{" "}
//                         {parent.email || "—"}
//                       </p>

//                       <p>
//                         <span className="font-medium text-gray-500">
//                           Occupation:
//                         </span>{" "}
//                         {parent.occupation || "—"}
//                       </p>
//                     </div>

//                     {/* Students */}
//                     <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-xs font-medium text-gray-500">
//                             Assigned Students
//                           </p>

//                           <p className="mt-1 text-sm font-semibold text-gray-900">
//                             {studentCount}{" "}
//                             {studentCount === 1
//                               ? "Student"
//                               : "Students"}
//                           </p>
//                         </div>

//                         {studentCount > 0 && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               toggleStudents(parent.id)
//                             }
//                             className="text-xs font-semibold text-gray-700 underline"
//                           >
//                             {isExpanded ? "Hide" : "View"}
//                           </button>
//                         )}
//                       </div>

//                       {isExpanded && students.length > 0 && (
//                         <div className="mt-3 space-y-2">
//                           {students.map((student) => (
//                             <div
//                               key={student.id}
//                               className="rounded-lg border border-gray-200 bg-white px-3 py-2"
//                             >
//                               <p className="text-sm font-medium text-gray-900">
//                                 {student.full_name}
//                               </p>

//                               <p className="text-xs text-gray-500">
//                                 Admission No:{" "}
//                                 <span className="font-medium text-gray-700">
//                                   {student.admission_number || "—"}
//                                 </span>
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => navigate(`/admin/parents/${parent.id}`)}
//                       className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//                     >
//                       View Parent Details
//                     </button>

//                     {parent.emergency_contact && (
//                       <p className="mt-3 text-xs font-semibold text-orange-600">
//                         Emergency Contact
//                       </p>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </div>

//       {/* =====================================================
//           RESULT COUNT
//       ===================================================== */}
//       {!loading && filteredParents.length > 0 && (
//         <p className="text-sm text-gray-500">
//           Showing {filteredParents.length} of {parents.length} parent
//           {parents.length === 1 ? "" : "s"}.
//         </p>
//       )}
//     </div>
//   );
// };

// export default AllParents;


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getParents } from "../../../services/studentsService";

const AllParents = () => {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadParents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getParents();

      setParents(
        Array.isArray(data) ? data : data?.results || [],
      );
    } catch (err) {
      console.error("Failed to load parents:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load parents/guardians. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredParents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return parents;
    }

    return parents.filter((parent) => {
      const parentMatches =
        parent.full_name?.toLowerCase().includes(query) ||
        parent.phone_number?.toLowerCase().includes(query) ||
        parent.email?.toLowerCase().includes(query) ||
        parent.relationship?.toLowerCase().includes(query) ||
        parent.occupation?.toLowerCase().includes(query);

      const studentMatches = parent.students?.some(
        (student) =>
          student.full_name?.toLowerCase().includes(query) ||
          student.admission_number
            ?.toLowerCase()
            .includes(query),
      );

      return parentMatches || studentMatches;
    });
  }, [parents, search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const activeParents = parents.filter(
    (parent) => parent.is_active !== false,
  ).length;

  const emergencyParents = parents.filter(
    (parent) => parent.emergency_contact === true,
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Parents & Guardians
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage parents, guardians, and their
            assigned students.
          </p>
        </div>

        <button
          type="button"
          onClick={loadParents}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Parents */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Parents
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {parents.length}
          </p>
        </div>

        {/* Active Parents */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Active Parents
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {activeParents}
          </p>
        </div>

        {/* Emergency Contacts */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Emergency Contacts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {emergencyParents}
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parent, phone, email, student name or admission number..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={loadParents}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          PARENTS TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading parents and guardians...
            </p>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 text-4xl">
              👨‍👩‍👧
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              {search
                ? "No parents found"
                : "No parents yet"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try changing your search terms."
                : "Parents added from student records will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                {/* TABLE HEADER */}

                <thead className="bg-gray-50">
                  <tr>
                    {/* Parent / Guardian */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Parent / Guardian
                    </th>

                    {/* Relationship */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Relationship
                    </th>

                    {/* Student */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Student
                    </th>

                    {/* Admission Number */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Admission No.
                    </th>

                    {/* Contact */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>

                    {/* Status */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    {/* Action */}

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody className="divide-y divide-gray-200">
                  {filteredParents.map((parent) => {
                    const students = parent.students || [];

                    /*
                     * Normally a parent may have one or more
                     * students. We display the first student in
                     * the main row.
                     *
                     * If there are multiple students, the
                     * additional students are shown underneath.
                     */

                    const firstStudent = students[0];

                    const remainingStudents =
                      students.slice(1);

                    return (
                      <tr
                        key={parent.id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* =================================================
                            PARENT / GUARDIAN
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                              {parent.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {parent.full_name || "—"}
                              </p>

                              {parent.occupation && (
                                <p className="text-xs text-gray-500">
                                  {parent.occupation}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* =================================================
                            RELATIONSHIP
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {parent.relationship || "—"}
                          </span>
                        </td>

                        {/* =================================================
                            STUDENT
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          {firstStudent ? (
                            <div>
                              <p className="font-medium text-gray-900">
                                {firstStudent.full_name || "—"}
                              </p>

                              {remainingStudents.length >
                                0 && (
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                  +{" "}
                                  {
                                    remainingStudents.length
                                  }{" "}
                                  more{" "}
                                  {remainingStudents.length ===
                                  1
                                    ? "student"
                                    : "students"}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No student
                            </span>
                          )}
                        </td>

                        {/* =================================================
                            ADMISSION NUMBER
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          {firstStudent ? (
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {firstStudent.admission_number ||
                                  "—"}
                              </p>

                              {remainingStudents.length >
                                0 && (
                                <p className="mt-1 text-xs text-gray-400">
                                  +{" "}
                                  {
                                    remainingStudents.length
                                  }{" "}
                                  more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>

                        {/* =================================================
                            CONTACT
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              {parent.phone_number || "—"}
                            </p>

                            <p className="max-w-[220px] truncate text-xs text-gray-500">
                              {parent.email || "—"}
                            </p>
                          </div>
                        </td>

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                                parent.is_active === false
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {parent.is_active === false
                                ? "Inactive"
                                : "Active"}
                            </span>

                            {parent.emergency_contact && (
                              <span className="text-xs font-medium text-orange-600">
                                Emergency Contact
                              </span>
                            )}
                          </div>
                        </td>

                        {/* =================================================
                            ACTION
                        ================================================= */}

                        <td className="px-6 py-5 align-middle">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/parents/${parent.id}`,
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE VIEW
            ================================================= */}

            <div className="divide-y divide-gray-200 md:hidden">
              {filteredParents.map((parent) => {
                const students = parent.students || [];

                return (
                  <div
                    key={parent.id}
                    className="p-4"
                  >
                    {/* Parent Header */}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                          {parent.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {parent.full_name || "—"}
                          </h3>

                          <p className="text-xs text-gray-500">
                            {parent.relationship ||
                              "Parent / Guardian"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          parent.is_active === false
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {parent.is_active === false
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </div>

                    {/* Student Information */}

                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Student
                      </p>

                      {students.length === 0 ? (
                        <p className="mt-1 text-sm text-gray-500">
                          No student assigned
                        </p>
                      ) : (
                        <div className="mt-2 space-y-3">
                          {students.map((student) => (
                            <div
                              key={student.id}
                              className="rounded-lg border border-gray-200 bg-white p-3"
                            >
                              <p className="text-sm font-semibold text-gray-900">
                                {student.full_name || "—"}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Admission No:{" "}
                                <span className="font-medium text-gray-700">
                                  {student.admission_number ||
                                    "—"}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact */}

                    <div className="mt-4 space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-gray-500">
                          Phone:
                        </span>{" "}
                        {parent.phone_number || "—"}
                      </p>

                      <p>
                        <span className="font-medium text-gray-500">
                          Email:
                        </span>{" "}
                        {parent.email || "—"}
                      </p>

                      <p>
                        <span className="font-medium text-gray-500">
                          Occupation:
                        </span>{" "}
                        {parent.occupation || "—"}
                      </p>
                    </div>

                    {/* Emergency Contact */}

                    {parent.emergency_contact && (
                      <p className="mt-3 text-xs font-semibold text-orange-600">
                        Emergency Contact
                      </p>
                    )}

                    {/* Action */}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/parents/${parent.id}`,
                        )
                      }
                      className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View Parent Details
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      {!loading && filteredParents.length > 0 && (
        <p className="text-sm text-gray-500">
          Showing {filteredParents.length} of {parents.length}{" "}
          parent{parents.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
};

export default AllParents;