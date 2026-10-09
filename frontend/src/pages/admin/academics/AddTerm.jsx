// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   createTerm,
//   getSchools,
//   getSessions,
// } from "../../../services/academicsService";

// const AddTerm = () => {
//   const navigate = useNavigate();

//   const [schools, setSchools] = useState([]);
//   const [sessions, setSessions] = useState([]);

//   const [formData, setFormData] = useState({
//     school: "",
//     academic_session: "",
//     name: "",
//     start_date: "",
//     end_date: "",
//     is_current: false,
//     is_active: true,
//   });

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   // ============================================================
//   // LOAD DATA
//   // ============================================================

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const [schoolData, sessionData] = await Promise.all([
//           getSchools(),
//           getSessions(),
//         ]);

//         setSchools(schoolData);
//         setSessions(sessionData);
//       } catch (err) {
//         console.error("Failed to load term data:", err);
//         setError("Failed to load schools and academic sessions.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   // ============================================================
//   // HANDLE INPUT CHANGES
//   // ============================================================

//   const handleChange = (event) => {
//     const { name, value, type, checked } = event.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ============================================================
//   // SUBMIT
//   // ============================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       setSaving(true);
//       setError("");

//       await createTerm({
//         school: Number(formData.school),
//         academic_session: Number(formData.academic_session),
//         name: formData.name,
//         start_date: formData.start_date,
//         end_date: formData.end_date,
//         is_current: formData.is_current,
//         is_active: formData.is_active,
//       });

//       navigate("/admin/terms");
//     } catch (err) {
//       console.error("Failed to create term:", err);

//       const backendError = err.response?.data;

//       if (backendError) {
//         setError(
//           typeof backendError === "object"
//             ? Object.values(backendError).flat().join(" ")
//             : String(backendError),
//         );
//       } else {
//         setError("Failed to create term.");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ============================================================
//   // LOADING STATE
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
//         <p className="text-sm text-[var(--color-text)]/60">
//           Loading...
//         </p>
//       </div>
//     );
//   }

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-6">
//         <button
//           type="button"
//           onClick={() => navigate("/admin/terms")}
//           className="mb-3 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
//         >
//           ← Back to Terms
//         </button>

//         <h1 className="text-2xl font-bold text-[var(--color-text)]">
//           Add Term
//         </h1>

//         <p className="mt-1 text-sm text-[var(--color-text)]/60">
//           Create a new academic term.
//         </p>
//       </div>

//       {/* ======================================================
//           ERROR
//       ====================================================== */}

//       {error && (
//         <div className="mb-6 max-w-3xl rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
//           {error}
//         </div>
//       )}

//       {/* ======================================================
//           FORM
//       ====================================================== */}

//       <form
//         onSubmit={handleSubmit}
//         className="max-w-3xl rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-6 shadow-sm"
//       >
//         <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//           {/* ==================================================
//               SCHOOL
//           ================================================== */}

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//               School
//             </label>

//             <select
//               name="school"
//               value={formData.school}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
//             >
//               <option value="">Select school</option>

//               {schools.map((school) => (
//                 <option key={school.id} value={school.id}>
//                   {school.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* ==================================================
//               ACADEMIC SESSION
//           ================================================== */}

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//               Academic Session
//             </label>

//             <select
//               name="academic_session"
//               value={formData.academic_session}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
//             >
//               <option value="">Select academic session</option>

//               {sessions.map((session) => (
//                 <option key={session.id} value={session.id}>
//                   {session.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* ==================================================
//               TERM NAME
//           ================================================== */}

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//               Term Name
//             </label>

//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="e.g. FIRST"
//               required
//               className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
//             />
//           </div>

//           {/* ==================================================
//               START DATE
//           ================================================== */}

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//               Start Date
//             </label>

//             <input
//               type="date"
//               name="start_date"
//               value={formData.start_date}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
//             />
//           </div>

//           {/* ==================================================
//               END DATE
//           ================================================== */}

//           <div>
//             <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//               End Date
//             </label>

//             <input
//               type="date"
//               name="end_date"
//               value={formData.end_date}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
//             />
//           </div>
//         </div>

//         {/* ======================================================
//             CURRENT TERM
//         ====================================================== */}

//         <div className="mt-6 flex items-center gap-3">
//           <input
//             type="checkbox"
//             id="is_current"
//             name="is_current"
//             checked={formData.is_current}
//             onChange={handleChange}
//             className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
//           />

//           <label
//             htmlFor="is_current"
//             className="cursor-pointer text-sm font-medium text-[var(--color-text)]"
//           >
//             Set as current term
//           </label>
//         </div>

//         {/* ======================================================
//             ACTIVE
//         ====================================================== */}

//         <div className="mt-4 flex items-center gap-3">
//           <input
//             type="checkbox"
//             id="is_active"
//             name="is_active"
//             checked={formData.is_active}
//             onChange={handleChange}
//             className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
//           />

//           <label
//             htmlFor="is_active"
//             className="cursor-pointer text-sm font-medium text-[var(--color-text)]"
//           >
//             Active
//           </label>
//         </div>

//         {/* ======================================================
//             BUTTONS
//         ====================================================== */}

//         <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-text)]/10 pt-5 sm:flex-row">
//           <button
//             type="submit"
//             disabled={saving}
//             className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {saving ? "Saving..." : "Save Term"}
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate("/admin/terms")}
//             className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddTerm;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createTerm,
  getSchools,
  getSessions,
  getTerms,
} from "../../../services/academicsService";

const TERM_OPTIONS = [
  { value: "FIRST", label: "First Term" },
  { value: "SECOND", label: "Second Term" },
  { value: "THIRD", label: "Third Term" },
];

const normalizeTermName = (value) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  const aliases = {
    FIRST: "FIRST",
    "FIRST TERM": "FIRST",
    SECOND: "SECOND",
    "SECOND TERM": "SECOND",
    THIRD: "THIRD",
    "THIRD TERM": "THIRD",
  };

  return aliases[normalized] || "";
};

const getList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const getSessionId = (term) => {
  const session = term?.academic_session;

  if (session && typeof session === "object") {
    return session.id;
  }

  return session;
};

const getErrorMessage = (err) => {
  const data = err?.response?.data;

  if (!data) {
    return err?.message || "Failed to create term. Please try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(" ")
        : typeof messages === "object" && messages !== null
          ? JSON.stringify(messages)
          : String(messages);

      return `${field === "non_field_errors" ? "Error" : field}: ${message}`;
    })
    .join(" ");
};

const AddTerm = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [existingTerms, setExistingTerms] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    name: "SECOND",
    start_date: "2027-05-12",
    end_date: "2027-09-12",
    is_current: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [checkingTerms, setCheckingTerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load schools.
  useEffect(() => {
    let cancelled = false;

    const loadSchools = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSchools();

        if (!cancelled) {
          setSchools(getList(response));
        }
      } catch (err) {
        console.error("Failed to load schools:", err);

        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSchools();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load sessions belonging to the selected school.
  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      setSessions([]);
      setExistingTerms([]);

      if (!formData.school) {
        setLoadingSessions(false);
        return;
      }

      try {
        setLoadingSessions(true);

        const response = await getSessions(
          Number(formData.school),
        );

        if (!cancelled) {
          const sessionList = getList(response);
          setSessions(sessionList);

          // If there is only one session named 2027/2028,
          // select it automatically. Otherwise, let the user choose.
          const matchingSessions = sessionList.filter(
            (session) =>
              String(session.name).trim() === "2027/2028",
          );

          if (matchingSessions.length === 1) {
            setFormData((previous) => ({
              ...previous,
              academic_session:
                previous.academic_session ||
                String(matchingSessions[0].id),
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load academic sessions:", err);

        if (!cancelled) {
          setError(
            "Could not load academic sessions for this school. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      }
    };

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, [formData.school]);

  // Load terms when the academic session changes.
  useEffect(() => {
    let cancelled = false;

    const loadExistingTerms = async () => {
      setExistingTerms([]);
      setSuccess("");

      if (!formData.school || !formData.academic_session) {
        setCheckingTerms(false);
        return;
      }

      try {
        setCheckingTerms(true);

        const response = await getTerms(Number(formData.school));

        if (!cancelled) {
          const termList = getList(response);

          setExistingTerms(
            termList.filter(
              (term) =>
                Number(getSessionId(term)) ===
                Number(formData.academic_session),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to check existing terms:", err);

        if (!cancelled) {
          setExistingTerms([]);
          setError(
            "Could not verify existing terms. The backend will still enforce duplicate-term protection when you save.",
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingTerms(false);
        }
      }
    };

    loadExistingTerms();

    return () => {
      cancelled = true;
    };
  }, [formData.school, formData.academic_session]);

  const selectedSession = sessions.find(
    (session) =>
      Number(session.id) === Number(formData.academic_session),
  );

  const normalizedName = normalizeTermName(formData.name);

  const duplicateTerm = existingTerms.find(
    (term) =>
      normalizeTermName(term.name) === normalizedName &&
      Number(getSessionId(term)) ===
        Number(formData.academic_session),
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setError("");
    setSuccess("");

    setFormData((previous) => {
      if (name === "school") {
        return {
          ...previous,
          school: value,
          academic_session: "",
        };
      }

      return {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const termName = normalizeTermName(formData.name);

    if (!termName) {
      setError(
        "Choose a valid term: FIRST, SECOND, or THIRD.",
      );
      return;
    }

    if (!formData.school || !formData.academic_session) {
      setError("Please select a school and academic session.");
      return;
    }

    if (!selectedSession) {
      setError(
        "The selected session could not be verified. Please select the session again.",
      );
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Please enter both term dates.");
      return;
    }

    if (formData.end_date <= formData.start_date) {
      setError("The end date must be after the start date.");
      return;
    }

    if (checkingTerms) {
      setError(
        "Please wait while existing terms are checked.",
      );
      return;
    }

    if (duplicateTerm) {
      setError(
        `${termName} already exists for ${selectedSession.name}. ` +
          `Existing term ID: ${duplicateTerm.id}. ` +
          "Open the Terms page and edit the existing record instead of creating another one.",
      );
      return;
    }

    try {
      setSaving(true);

      await createTerm({
        academic_session: Number(formData.academic_session),
        name: termName,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate("/admin/terms");
    } catch (err) {
      console.error("Failed to create term:", err);

      const message = getErrorMessage(err);
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("unique set") ||
        (
          lowerMessage.includes("academic_session") &&
          lowerMessage.includes("name")
        )
      ) {
        setError(
          `${termName} already exists for ${selectedSession.name}. ` +
            "The server rejected the duplicate. Refresh the Terms page and edit the existing term. " +
            "If it is not listed, the existing record may be outside the terms currently returned by the API.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p className="text-sm opacity-70">Loading schools...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/terms")}
          className="mb-3 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
        >
          ← Back to Terms
        </button>

        <h1 className="text-2xl font-bold">Add Term</h1>

        <p className="mt-1 text-sm opacity-70">
          Create a new academic term.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 max-w-3xl break-words rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
        >
          <p>{error}</p>

          {(duplicateTerm ||
            error.toLowerCase().includes("already exists") ||
            error.toLowerCase().includes("duplicate")) && (
            <button
              type="button"
              onClick={() => navigate("/admin/terms")}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Open Terms page
            </button>
          )}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 max-w-3xl rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Select school</option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="academic_session"
              className="mb-2 block text-sm font-medium"
            >
              Academic Session
            </label>

            <select
              id="academic_session"
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              disabled={!formData.school || loadingSessions}
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
            >
              <option value="">
                {loadingSessions
                  ? "Loading sessions..."
                  : "Select academic session"}
              </option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>

            {formData.school &&
              !loadingSessions &&
              sessions.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No academic sessions were found for this school.
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Term Name
            </label>

            <select
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)]"
            >
              {TERM_OPTIONS.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="start_date"
              className="mb-2 block text-sm font-medium"
            >
              Start Date
            </label>

            <input
              id="start_date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="mb-2 block text-sm font-medium"
            >
              End Date
            </label>

            <input
              id="end_date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || undefined}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {formData.academic_session && (
          <div className="mt-5 rounded-lg border border-[var(--color-text)]/10 p-4 text-sm">
            <p className="font-medium">
              Existing terms for {selectedSession?.name || "selected session"}
            </p>

            {checkingTerms ? (
              <p className="mt-2 opacity-70">
                Checking existing terms...
              </p>
            ) : existingTerms.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {existingTerms.map((term) => (
                  <li key={term.id} className="flex flex-wrap gap-2">
                    <span>{term.name}</span>
                    <span className="opacity-60">
                      ({term.start_date || "No start date"} –{" "}
                      {term.end_date || "No end date"})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/terms/${term.id}/edit`)
                      }
                      className="font-medium text-[var(--color-primary)] underline"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 opacity-70">
                No matching-session terms were returned by the API.
              </p>
            )}

            {duplicateTerm && (
              <p className="mt-3 font-medium text-red-600 dark:text-red-400">
                {normalizeTermName(duplicateTerm.name)} already exists.
                Edit the existing term instead.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_current"
            name="is_current"
            checked={formData.is_current}
            onChange={handleChange}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />

          <label htmlFor="is_current" className="text-sm font-medium">
            Set as current term
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />

          <label htmlFor="is_active" className="text-sm font-medium">
            Active
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-text)]/10 pt-5 sm:flex-row">
          <button
            type="submit"
            disabled={
              saving ||
              loadingSessions ||
              checkingTerms ||
              Boolean(duplicateTerm)
            }
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : checkingTerms ? "Checking terms..." : "Save Term"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/terms")}
            disabled={saving}
            className="rounded-lg border border-[var(--color-text)]/15 px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--color-background)] disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTerm;