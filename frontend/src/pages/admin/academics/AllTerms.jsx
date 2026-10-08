// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getTerms,
//   deleteTerm,
//   updateTerm,
//   getSchools,
//   getSessions,
//   setCurrentTerm,
// } from "../../../services/academicsService";

// const AllTerms = () => {
//   const navigate = useNavigate();

//   const [terms, setTerms] = useState([]);
//   const [schools, setSchools] = useState([]);
//   const [sessions, setSessions] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [settingCurrent, setSettingCurrent] = useState(null);

//   // =====================================================
//   // LOAD DATA
//   // =====================================================

//   const loadTerms = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [termData, schoolData, sessionData] = await Promise.all([
//         getTerms(),
//         getSchools(),
//         getSessions(),
//       ]);

//       setTerms(termData);
//       setSchools(schoolData);
//       setSessions(sessionData);
//     } catch (err) {
//       console.error("Failed to load terms:", err);
//       setError("Failed to load terms.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTerms();
//   }, []);

//   // =====================================================
//   // GET ACADEMIC SESSION
//   // =====================================================

//   const getSession = (sessionId) => {
//     return sessions.find(
//       (session) => Number(session.id) === Number(sessionId),
//     );
//   };

//   // =====================================================
//   // GET SESSION NAME
//   // =====================================================

//   const getSessionName = (sessionId) => {
//     const session = getSession(sessionId);

//     return session?.name || "—";
//   };

//   // =====================================================
//   // GET SCHOOL NAME THROUGH SESSION
//   // =====================================================

//   const getSchoolName = (sessionId) => {
//     const session = getSession(sessionId);

//     if (!session) {
//       return "—";
//     }

//     const school = schools.find(
//       (school) => Number(school.id) === Number(session.school),
//     );

//     return school?.name || "—";
//   };

//   // =====================================================
//   // SET CURRENT TERM
//   // =====================================================

//   const handleSetCurrent = async (term) => {
//     const confirmed = window.confirm(
//       `Set ${term.name} as the current term for ${getSessionName(
//         term.academic_session,
//       )}?`,
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setSettingCurrent(term.id);

//       await setCurrentTerm(term.id);

//       /*
//        * Update the local state immediately.
//        *
//        * Only terms belonging to the same academic session
//        * should lose their current status.
//        */
//       setTerms((prev) =>
//         prev.map((item) => {
//           if (
//             Number(item.academic_session) ===
//             Number(term.academic_session)
//           ) {
//             return {
//               ...item,
//               is_current: item.id === term.id,
//             };
//           }

//           return item;
//         }),
//       );
//     } catch (err) {
//       console.error("Failed to set current term:", err);

//       alert(
//         err?.response?.data?.detail ||
//           err?.response?.data?.message ||
//           "Failed to set current term.",
//       );
//     } finally {
//       setSettingCurrent(null);
//     }
//   };

//   // =====================================================
//   // DELETE TERM
//   // =====================================================

//   const handleDelete = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this term?",
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await deleteTerm(id);

//       setTerms((prev) =>
//         prev.filter((term) => term.id !== id),
//       );
//     } catch (err) {
//       console.error("Failed to delete term:", err);
//       alert("Failed to delete term.");
//     }
//   };

//   // =====================================================
//   // TOGGLE ACTIVE / INACTIVE
//   // =====================================================

//   const handleToggleStatus = async (term) => {
//     try {
//       const updatedTerm = await updateTerm(term.id, {
//         academic_session: Number(term.academic_session),
//         name: term.name,
//         start_date: term.start_date,
//         end_date: term.end_date,
//         is_current: term.is_current,
//         is_active: !term.is_active,
//       });

//       setTerms((prev) =>
//         prev.map((item) =>
//           item.id === term.id ? updatedTerm : item,
//         ),
//       );
//     } catch (err) {
//       console.error("Failed to update term status:", err);
//       alert("Failed to update term status.");
//     }
//   };

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading) {
//     return (
//       <div className="py-10 text-center text-slate-500">
//         Loading terms...
//       </div>
//     );
//   }

//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {
//     return (
//       <div>
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-slate-800">
//             Terms
//           </h1>

//           <p className="text-sm text-slate-500">
//             Manage academic terms.
//           </p>
//         </div>

//         <div className="rounded-xl bg-red-50 p-5 text-red-700">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // PAGE
//   // =====================================================

//   return (
//     <div>
//       {/* HEADER */}
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">
//             Terms
//           </h1>

//           <p className="text-sm text-slate-500">
//             Manage academic terms.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate("/admin/terms/add")}
//           className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
//         >
//           + Add Term
//         </button>
//       </div>

//       {/* TERMS TABLE */}
//       <div className="overflow-hidden rounded-xl bg-white shadow">
//         {terms.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-slate-500">
//               No terms found.
//             </p>

//             <button
//               type="button"
//               onClick={() => navigate("/admin/terms/add")}
//               className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
//             >
//               Add your first term
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Term
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Academic Session
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     School
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Start Date
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     End Date
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Current
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
//                 {terms.map((term) => (
//                   <tr
//                     key={term.id}
//                     className="hover:bg-slate-50"
//                   >
//                     {/* TERM */}
//                     <td className="px-6 py-4">
//                       <p className="font-medium text-slate-800">
//                         {term.name}
//                       </p>
//                     </td>

//                     {/* ACADEMIC SESSION */}
//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {getSessionName(
//                         term.academic_session,
//                       )}
//                     </td>

//                     {/* SCHOOL */}
//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {getSchoolName(
//                         term.academic_session,
//                       )}
//                     </td>

//                     {/* START DATE */}
//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {term.start_date || "—"}
//                     </td>

//                     {/* END DATE */}
//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       {term.end_date || "—"}
//                     </td>

//                     {/* CURRENT */}
//                     <td className="px-6 py-4">
//                       {term.is_current ? (
//                         <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
//                           Current
//                         </span>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleSetCurrent(term)
//                           }
//                           disabled={
//                             settingCurrent === term.id
//                           }
//                           className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                           {settingCurrent === term.id
//                             ? "Setting..."
//                             : "Set Current"}
//                         </button>
//                       )}
//                     </td>

//                     {/* STATUS */}
//                     <td className="px-6 py-4">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleToggleStatus(term)
//                         }
//                         className={`rounded-full px-3 py-1 text-xs font-medium ${
//                           term.is_active
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-red-100 text-red-700 hover:bg-red-200"
//                         }`}
//                       >
//                         {term.is_active
//                           ? "Active"
//                           : "Inactive"}
//                       </button>
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/terms/${term.id}`,
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
//                               `/admin/terms/${term.id}/edit`,
//                             )
//                           }
//                           className="text-sm font-medium text-green-600 hover:text-green-800"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDelete(term.id)
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

// export default AllTerms;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTerms,
  deleteTerm,
  updateTerm,
  getSchools,
  getSessions,
  setCurrentTerm,
} from "../../../services/academicsService";

const AllTerms = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [settingCurrent, setSettingCurrent] = useState(null);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadTerms = async () => {
    try {
      setLoading(true);
      setError("");

      const [termData, schoolData, sessionData] = await Promise.all([
        getTerms(),
        getSchools(),
        getSessions(),
      ]);

      setTerms(termData);
      setSchools(schoolData);
      setSessions(sessionData);
    } catch (err) {
      console.error("Failed to load terms:", err);
      setError("Failed to load terms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  // =====================================================
  // GET ACADEMIC SESSION
  // =====================================================

  const getSession = (sessionId) => {
    return sessions.find(
      (session) => Number(session.id) === Number(sessionId),
    );
  };

  // =====================================================
  // GET SESSION NAME
  // =====================================================

  const getSessionName = (sessionId) => {
    const session = getSession(sessionId);

    return session?.name || "—";
  };

  // =====================================================
  // GET SCHOOL NAME THROUGH SESSION
  // =====================================================

  const getSchoolName = (sessionId) => {
    const session = getSession(sessionId);

    if (!session) {
      return "—";
    }

    const school = schools.find(
      (school) => Number(school.id) === Number(session.school),
    );

    return school?.name || "—";
  };

  // =====================================================
  // SET CURRENT TERM
  // =====================================================

  const handleSetCurrent = async (term) => {
    const confirmed = window.confirm(
      `Set ${term.name} as the current term for ${getSessionName(
        term.academic_session,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSettingCurrent(term.id);

      await setCurrentTerm(term.id);

      /*
       * Update the local state immediately.
       *
       * Only terms belonging to the same academic session
       * should lose their current status.
       */
      setTerms((prev) =>
        prev.map((item) => {
          if (
            Number(item.academic_session) ===
            Number(term.academic_session)
          ) {
            return {
              ...item,
              is_current: item.id === term.id,
            };
          }

          return item;
        }),
      );
    } catch (err) {
      console.error("Failed to set current term:", err);

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to set current term.",
      );
    } finally {
      setSettingCurrent(null);
    }
  };

  // =====================================================
  // DELETE TERM
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this term?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTerm(id);

      setTerms((prev) =>
        prev.filter((term) => term.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete term:", err);
      alert("Failed to delete term.");
    }
  };

  // =====================================================
  // TOGGLE ACTIVE / INACTIVE
  // =====================================================

  const handleToggleStatus = async (term) => {
    try {
      const updatedTerm = await updateTerm(term.id, {
        academic_session: Number(term.academic_session),
        name: term.name,
        start_date: term.start_date,
        end_date: term.end_date,
        is_current: term.is_current,
        is_active: !term.is_active,
      });

      setTerms((prev) =>
        prev.map((item) =>
          item.id === term.id ? updatedTerm : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update term status:", err);
      alert("Failed to update term status.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading terms...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Terms
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage academic terms.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">
            Terms
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage academic terms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/terms/add")}
          className="w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        >
          + Add Term
        </button>
      </div>

      {/* TERMS TABLE */}
      <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
        {terms.length === 0 ? (
          <div className="p-8 text-center sm:p-10">
            <p className="text-slate-500 dark:text-slate-400">
              No terms found.
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/terms/add")}
              className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
            >
              Add your first term
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Term
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Academic Session
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      School
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Start Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      End Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Current
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {terms.map((term) => (
                    <tr
                      key={term.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      {/* TERM */}
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {term.name}
                        </p>
                      </td>

                      {/* ACADEMIC SESSION */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {getSessionName(
                          term.academic_session,
                        )}
                      </td>

                      {/* SCHOOL */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {getSchoolName(
                          term.academic_session,
                        )}
                      </td>

                      {/* START DATE */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {term.start_date || "—"}
                      </td>

                      {/* END DATE */}
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {term.end_date || "—"}
                      </td>

                      {/* CURRENT */}
                      <td className="px-6 py-4">
                        {term.is_current ? (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetCurrent(term)
                            }
                            disabled={
                              settingCurrent === term.id
                            }
                            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {settingCurrent === term.id
                              ? "Setting..."
                              : "Set Current"}
                          </button>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(term)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            term.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          }`}
                        >
                          {term.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/terms/${term.id}`,
                              )
                            }
                            className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/terms/${term.id}/edit`,
                              )
                            }
                            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(term.id)
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE
            ================================================== */}

            <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
              {terms.map((term) => (
                <div
                  key={term.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {term.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {getSessionName(
                        term.academic_session,
                      )}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span>
                        {term.start_date || "—"}
                      </span>

                      <span>—</span>

                      <span>
                        {term.end_date || "—"}
                      </span>

                      {term.is_current && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Current
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          term.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {term.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/terms/${term.id}`,
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                    title="View term"
                    aria-label="View term"
                  >
                    View
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

export default AllTerms;

