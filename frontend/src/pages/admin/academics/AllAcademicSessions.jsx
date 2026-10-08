// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getSessions,
//   deleteSession,
// } from "../../../services/academicsService";

// const AllAcademicSessions = () => {
//   const navigate = useNavigate();

//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadSessions = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await getSessions();
//       setSessions(data);
//     } catch (err) {
//       console.error(
//         "Failed to load academic sessions:",
//         err,
//       );

//       setError(
//         "Failed to load academic sessions.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSessions();
//   }, []);

//   const handleDelete = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this academic session?",
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await deleteSession(id);

//       setSessions((prev) =>
//         prev.filter(
//           (session) => session.id !== id,
//         ),
//       );
//     } catch (err) {
//       console.error(
//         "Failed to delete academic session:",
//         err,
//       );

//       alert(
//         "Failed to delete academic session.",
//       );
//     }
//   };

//   return (
//     <div className="p-6">
//       {/* HEADER */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Academic Sessions
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage academic sessions for your schools.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             navigate(
//               "/admin/academic/sessions/add",
//             )
//           }
//           className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//         >
//           + Add Session
//         </button>
//       </div>

//       {/* ERROR */}
//       {error && (
//         <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* LOADING */}
//       {loading ? (
//         <div className="rounded-xl bg-white p-6 shadow">
//           Loading academic sessions...
//         </div>
//       ) : sessions.length === 0 ? (
//         /* EMPTY STATE */
//         <div className="rounded-xl bg-white p-10 text-center shadow">
//           <div className="mb-3 text-4xl">
//             📚
//           </div>

//           <h2 className="text-lg font-semibold text-gray-800">
//             No Academic Sessions
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             Create your first academic session.
//           </p>

//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/admin/academic/sessions/add",
//               )
//             }
//             className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//           >
//             + Add Session
//           </button>
//         </div>
//       ) : (
//         /* TABLE */
//         <div className="overflow-hidden rounded-xl bg-white shadow">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Session
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     School
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Start Date
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     End Date
//                   </th>

//                   <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {sessions.map((session) => (
//                   <tr
//                     key={session.id}
//                     className="hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4">
//                       <div className="font-semibold text-gray-800">
//                         {session.name}
//                       </div>

//                       <div className="text-xs text-gray-500">
//                         ID: {session.id}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {session.school_name ||
//                         session.school ||
//                         "—"}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {session.start_date || "—"}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {session.end_date || "—"}
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex justify-end gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/academic/sessions/${session.id}`,
//                             )
//                           }
//                           className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
//                         >
//                           View
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(
//                               `/admin/academic/sessions/${session.id}/edit`,
//                             )
//                           }
//                           className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDelete(session.id)
//                           }
//                           className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
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
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllAcademicSessions;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSessions,
  deleteSession,
} from "../../../services/academicsService";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";


const AllAcademicSessions = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* ============================================================
     LOAD SESSIONS
  ============================================================ */

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSessions();

      setSessions(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load academic sessions:",
        err,
      );

      setError(
        "Failed to load academic sessions.",
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSessions();
  }, []);


  /* ============================================================
     DELETE SESSION
  ============================================================ */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic session?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSession(id);

      setSessions((prev) =>
        prev.filter(
          (session) => session.id !== id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete academic session:",
        err,
      );

      alert(
        "Failed to delete academic session.",
      );
    }
  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading academic sessions...
        </div>
      </div>
    );
  }


  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Academic Sessions
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage academic sessions for your schools.
              </p>
            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/academic/sessions/add",
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Session
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">

          <div className="flex items-start gap-3">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadSessions}
                className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-400"
              >
                Try again
              </button>
            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {sessions.length === 0 ? (

        <div className="rounded-xl bg-[var(--color-card)] p-8 text-center shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700 sm:p-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
            <CalendarDays className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No Academic Sessions
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first academic session.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/academic/sessions/add",
              )
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Session
          </button>

        </div>

      ) : (

        /* ====================================================
           SESSION TABLE
        ==================================================== */

        <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="hidden overflow-x-auto md:block">

            <table className="min-w-full">

              <thead className="bg-slate-50 dark:bg-slate-800/60">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Session
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    School
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Start Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    End Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

                {sessions.map((session) => (

                  <tr
                    key={session.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >

                    {/* SESSION */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
                          <CalendarDays className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold">
                            {session.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ID: {session.id}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* SCHOOL */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {session.school_name ||
                        session.school ||
                        "—"}
                    </td>


                    {/* START DATE */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {session.start_date ||
                        "—"}
                    </td>


                    {/* END DATE */}

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {session.end_date ||
                        "—"}
                    </td>


                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-1">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic/sessions/${session.id}`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-primary)] transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View session"
                          aria-label="View session"
                        >
                          <Eye className="h-4 w-4" />
                        </button>


                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/academic/sessions/${session.id}/edit`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Edit session"
                          aria-label="Edit session"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              session.id,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete session"
                          aria-label="Delete session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* ==================================================
              MOBILE LIST
          ================================================== */}

          <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">

            {sessions.map((session) => (

              <div
                key={session.id}
                className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >

                {/* SESSION NAME */}

                <div className="min-w-0">

                  <p className="truncate font-semibold">
                    {session.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    ID: {session.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {session.start_date ||
                      "—"}{" "}
                    —{" "}
                    {session.end_date ||
                      "—"}
                  </p>

                </div>


                {/* VIEW ONLY */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/academic/sessions/${session.id}`,
                    )
                  }
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                  title="View session"
                  aria-label="View session"
                >
                  <Eye className="h-4 w-4" />
                </button>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
};

export default AllAcademicSessions;