import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  createSession,
  createTerm,
  deleteSession,
  deleteTerm,
  getSchools,
  getSessions,
  getTerms,
  setCurrentTerm,
  updateSession,
  updateTerm,
} from "../../../services/academicsService";

// =====================================================
// HELPERS
// =====================================================

const getList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getSchoolName = (school) =>
  school?.name ||
  school?.school_name ||
  `School ${school?.id ?? ""}`;

const getSessionName = (session) =>
  session?.name ||
  session?.session_name ||
  session?.title ||
  "Unnamed Session";

const getTermName = (term) =>
  term?.name ||
  term?.term_name ||
  term?.term_display ||
  term?.title ||
  "Unnamed Term";

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getSessionIdFromTerm = (term) =>
  term?.academic_session ||
  term?.academic_session_id ||
  term?.session ||
  term?.session_id ||
  "";

const getSessionDisplay = (term, sessions) => {
  const sessionId = getSessionIdFromTerm(term);

  const session = sessions.find(
    (item) => String(item.id) === String(sessionId),
  );

  if (session) {
    return getSessionName(session);
  }

  if (typeof sessionId === "object" && sessionId !== null) {
    return (
      sessionId?.name ||
      sessionId?.session_name ||
      sessionId?.title ||
      "—"
    );
  }

  return term?.academic_session_name || "—";
};

// =====================================================
// COMPONENT
// =====================================================

const AcademicSettings = () => {
  // ---------------------------------------------------
  // SCHOOL STATE
  // ---------------------------------------------------

  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);

  // ---------------------------------------------------
  // ACADEMIC DATA STATE
  // ---------------------------------------------------

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------
  // SESSION FORM
  // ---------------------------------------------------

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [sessionForm, setSessionForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const [savingSession, setSavingSession] = useState(false);

  // ---------------------------------------------------
  // TERM FORM
  // ---------------------------------------------------

  const [showTermForm, setShowTermForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);

  const [termForm, setTermForm] = useState({
    name: "",
    academic_session: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const [savingTerm, setSavingTerm] = useState(false);

  // ---------------------------------------------------
  // ACTION STATE
  // ---------------------------------------------------

  const [deletingId, setDeletingId] = useState(null);
  const [settingCurrentId, setSettingCurrentId] = useState(null);

  // ---------------------------------------------------
  // MESSAGES
  // ---------------------------------------------------

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // SELECTED SCHOOL
  // ===================================================

  const selectedSchool = useMemo(() => {
    return schools.find(
      (school) => String(school.id) === String(selectedSchoolId),
    );
  }, [schools, selectedSchoolId]);

  // ===================================================
  // SELECTED SESSION
  // ===================================================

  const selectedSession = useMemo(() => {
    return sessions.find(
      (session) =>
        String(session.id) === String(selectedSessionId),
    );
  }, [sessions, selectedSessionId]);

  // ===================================================
  // SELECTED SESSION TERMS
  // ===================================================

  const selectedSessionTerms = useMemo(() => {
    if (!selectedSessionId) {
      return [];
    }

    return terms.filter(
      (term) =>
        String(getSessionIdFromTerm(term)) ===
        String(selectedSessionId),
    );
  }, [terms, selectedSessionId]);

  // ===================================================
  // LOAD SCHOOLS
  // ===================================================

  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      setError("");

      const response = await getSchools();
      console.log("SCHOOLS API RESPONSE:", response);
      const schoolList = getList(response);

      setSchools(schoolList);

      if (schoolList.length === 0) {
        setSelectedSchoolId("");
        return;
      }

      setSelectedSchoolId((currentId) => {
        const stillExists = schoolList.some(
          (school) =>
            String(school.id) === String(currentId),
        );

        if (stillExists) {
          return currentId;
        }

        return String(schoolList[0].id);
      });
    } catch (err) {
      console.error("Failed to load schools:", err);

      setSchools([]);
      setSelectedSchoolId("");

      setError(
        err?.response?.data?.detail ||
          "Unable to load schools. Please try again.",
      );
    } finally {
      setLoadingSchools(false);
    }
  };

  // ===================================================
  // LOAD ACADEMIC DATA
  // ===================================================

  const loadAcademicData = async (schoolId = selectedSchoolId) => {
    if (!schoolId) {
      setSessions([]);
      setTerms([]);
      setSelectedSessionId("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [sessionsResponse, termsResponse] =
        await Promise.all([
          getSessions(schoolId),
          getTerms(schoolId),
        ]);

      const sessionList = getList(sessionsResponse);
      const termList = getList(termsResponse);

      setSessions(sessionList);
      setTerms(termList);

      // -------------------------------------------------
      // Preserve selected session if it still exists.
      // Otherwise select current session, then first one.
      // -------------------------------------------------

      setSelectedSessionId((currentId) => {
        const existingSession = sessionList.find(
          (session) =>
            String(session.id) === String(currentId),
        );

        if (existingSession) {
          return String(existingSession.id);
        }

        const currentSession = sessionList.find(
          (session) => session.is_current === true,
        );

        if (currentSession) {
          return String(currentSession.id);
        }

        return sessionList.length > 0
          ? String(sessionList[0].id)
          : "";
      });
    } catch (err) {
      console.error(
        "Failed to load academic data:",
        err,
      );

      setSessions([]);
      setTerms([]);
      setSelectedSessionId("");

      setError(
        err?.response?.data?.detail ||
          "Unable to load academic sessions and terms.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadSchools();
  }, []);

  // ===================================================
  // LOAD DATA WHEN SCHOOL CHANGES
  // ===================================================

  useEffect(() => {
    if (!selectedSchoolId) {
      setSessions([]);
      setTerms([]);
      setSelectedSessionId("");
      return;
    }

    setSelectedSessionId("");
    setSessions([]);
    setTerms([]);

    closeSessionForm();
    closeTermForm();

    loadAcademicData(selectedSchoolId);
  }, [selectedSchoolId]);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await loadSchools();

      if (selectedSchoolId) {
        await loadAcademicData(selectedSchoolId);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ===================================================
  // SCHOOL CHANGE
  // ===================================================

  const handleSchoolChange = (event) => {
    const value = event.target.value;

    setSelectedSchoolId(value);
    setError("");
    setSuccess("");
  };

  // ===================================================
  // SESSION FORM
  // ===================================================

  const resetSessionForm = () => {
    setSessionForm({
      name: "",
      start_date: "",
      end_date: "",
      is_current: false,
    });

    setEditingSession(null);
  };

  const openAddSession = () => {
    if (!selectedSchoolId) {
      setError("Please select a school first.");
      return;
    }

    setError("");
    setSuccess("");

    resetSessionForm();
    setShowSessionForm(true);
  };

  const openEditSession = (session) => {
    setError("");
    setSuccess("");

    setEditingSession(session);

    setSessionForm({
      name:
        session?.name ||
        session?.session_name ||
        session?.title ||
        "",
      start_date: session?.start_date || "",
      end_date: session?.end_date || "",
      is_current: Boolean(session?.is_current),
    });

    setShowSessionForm(true);
  };

  const closeSessionForm = () => {
    setShowSessionForm(false);
    setEditingSession(null);

    setSessionForm({
      name: "",
      start_date: "",
      end_date: "",
      is_current: false,
    });
  };

  const handleSessionChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setSessionForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSession = async (event) => {
    event.preventDefault();

    if (!selectedSchoolId) {
      setError("Please select a school first.");
      return;
    }

    if (!sessionForm.name.trim()) {
      setError("Please enter the academic session name.");
      return;
    }

    if (!sessionForm.start_date) {
      setError("Please select the session start date.");
      return;
    }

    if (!sessionForm.end_date) {
      setError("Please select the session end date.");
      return;
    }

    if (
      new Date(sessionForm.end_date) <
      new Date(sessionForm.start_date)
    ) {
      setError(
        "The session end date cannot be before the start date.",
      );
      return;
    }

    try {
      setSavingSession(true);
      setError("");
      setSuccess("");

      const payload = {
        school: Number(selectedSchoolId),
        name: sessionForm.name.trim(),
        start_date: sessionForm.start_date,
        end_date: sessionForm.end_date,
        is_current: sessionForm.is_current,
      };

      if (editingSession) {
        await updateSession(
          editingSession.id,
          payload,
        );

        setSuccess(
          "Academic session updated successfully.",
        );
      } else {
        await createSession(payload);

        setSuccess(
          "Academic session created successfully.",
        );
      }

      closeSessionForm();

      await loadAcademicData(selectedSchoolId);
    } catch (err) {
      console.error(
        "Failed to save academic session:",
        err,
      );

      const responseData = err?.response?.data;

      setError(
        responseData?.detail ||
          responseData?.school?.[0] ||
          responseData?.name?.[0] ||
          responseData?.start_date?.[0] ||
          responseData?.end_date?.[0] ||
          "Unable to save the academic session.",
      );
    } finally {
      setSavingSession(false);
    }
  };

  // ===================================================
  // DELETE SESSION
  // ===================================================

  const handleDeleteSession = async (session) => {
    if (!session?.id) {
      return;
    }

    const sessionName = getSessionName(session);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${sessionName}"? This may also affect terms connected to this session.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(`session-${session.id}`);
      setError("");
      setSuccess("");

      await deleteSession(session.id);

      setSuccess(
        "Academic session deleted successfully.",
      );

      if (
        String(selectedSessionId) ===
        String(session.id)
      ) {
        setSelectedSessionId("");
      }

      await loadAcademicData(selectedSchoolId);
    } catch (err) {
      console.error(
        "Failed to delete academic session:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete the academic session.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // TERM FORM
  // ===================================================

  const resetTermForm = () => {
    setTermForm({
      name: "",
      academic_session: selectedSessionId || "",
      start_date: "",
      end_date: "",
      is_current: false,
    });

    setEditingTerm(null);
  };

  const openAddTerm = () => {
    if (!selectedSchoolId) {
      setError("Please select a school first.");
      return;
    }

    if (!selectedSessionId) {
      setError("Please select an academic session first.");
      return;
    }

    setError("");
    setSuccess("");

    setEditingTerm(null);

    setTermForm({
      name: "",
      academic_session: selectedSessionId,
      start_date: "",
      end_date: "",
      is_current: false,
    });

    setShowTermForm(true);
  };

  const openEditTerm = (term) => {
    setError("");
    setSuccess("");

    const sessionId = getSessionIdFromTerm(term);

    setEditingTerm(term);

    setTermForm({
      name: getTermName(term),
      academic_session: sessionId
        ? String(sessionId)
        : selectedSessionId,
      start_date: term?.start_date || "",
      end_date: term?.end_date || "",
      is_current: Boolean(term?.is_current),
    });

    setShowTermForm(true);
  };

  const closeTermForm = () => {
    setShowTermForm(false);
    setEditingTerm(null);

    setTermForm({
      name: "",
      academic_session: selectedSessionId || "",
      start_date: "",
      end_date: "",
      is_current: false,
    });
  };

  const handleTermChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setTermForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveTerm = async (event) => {
    event.preventDefault();

    if (!selectedSchoolId) {
      setError("Please select a school first.");
      return;
    }

    if (!termForm.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!termForm.name.trim()) {
      setError("Please enter the term name.");
      return;
    }

    if (!termForm.start_date) {
      setError("Please select the term start date.");
      return;
    }

    if (!termForm.end_date) {
      setError("Please select the term end date.");
      return;
    }

    if (
      new Date(termForm.end_date) <
      new Date(termForm.start_date)
    ) {
      setError(
        "The term end date cannot be before the start date.",
      );
      return;
    }

    try {
      setSavingTerm(true);
      setError("");
      setSuccess("");

      // Terms belong to an academic session.
      // The selected session already determines the school.
      const payload = {
        academic_session: Number(
          termForm.academic_session,
        ),
        name: termForm.name.trim(),
        start_date: termForm.start_date,
        end_date: termForm.end_date,
        is_current: termForm.is_current,
      };

      if (editingTerm) {
        await updateTerm(editingTerm.id, payload);

        setSuccess(
          "Academic term updated successfully.",
        );
      } else {
        await createTerm(payload);

        setSuccess(
          "Academic term created successfully.",
        );
      }

      closeTermForm();

      await loadAcademicData(selectedSchoolId);
    } catch (err) {
      console.error(
        "Failed to save academic term:",
        err,
      );

      const responseData = err?.response?.data;

      setError(
        responseData?.detail ||
          responseData?.academic_session?.[0] ||
          responseData?.name?.[0] ||
          responseData?.start_date?.[0] ||
          responseData?.end_date?.[0] ||
          "Unable to save the academic term.",
      );
    } finally {
      setSavingTerm(false);
    }
  };

  // ===================================================
  // DELETE TERM
  // ===================================================

  const handleDeleteTerm = async (term) => {
    if (!term?.id) {
      return;
    }

    const termName = getTermName(term);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${termName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(`term-${term.id}`);
      setError("");
      setSuccess("");

      await deleteTerm(term.id);

      setSuccess(
        "Academic term deleted successfully.",
      );

      await loadAcademicData(selectedSchoolId);
    } catch (err) {
      console.error(
        "Failed to delete academic term:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete the academic term.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // SET CURRENT TERM
  // ===================================================

  const handleSetCurrentTerm = async (term) => {
    if (!term?.id) {
      return;
    }

    try {
      setSettingCurrentId(term.id);
      setError("");
      setSuccess("");

      await setCurrentTerm(term.id);

      setSuccess(
        `"${getTermName(term)}" is now the current term.`,
      );

      await loadAcademicData(selectedSchoolId);
    } catch (err) {
      console.error(
        "Failed to set current term:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to set the current term.",
      );
    } finally {
      setSettingCurrentId(null);
    }
  };

  // ===================================================
  // CLEAR MESSAGES
  // ===================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <CalendarDays size={22} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">
                  Academic Settings
                </h1>

                <p className="mt-1 text-sm text-[var(--color-text)]/60">
                  Manage academic sessions and terms
                  across your schools.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loadingSchools}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-card)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-text)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <span className="min-w-0 flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={clearMessages}
              className="shrink-0 rounded p-1 hover:bg-red-500/10"
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="min-w-0 flex-1">
              {success}
            </span>

            <button
              type="button"
              onClick={clearMessages}
              className="shrink-0 rounded p-1 hover:bg-green-500/10"
              aria-label="Close success message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            SCHOOL SELECTOR
        ================================================== */}

        <section className="rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold sm:text-lg">
              Select School
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text)]/60">
              Select the school whose academic sessions
              and terms you want to manage.
            </p>
          </div>

          {loadingSchools ? (
            <div className="flex min-h-12 items-center gap-2 text-sm text-[var(--color-text)]/60">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading schools...
            </div>
          ) : schools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-text)]/15 px-4 py-8 text-center">
              <p className="text-sm font-medium">
                No schools available
              </p>

              <p className="mt-1 text-xs text-[var(--color-text)]/60">
                Create a school before managing academic
                sessions and terms.
              </p>
            </div>
          ) : (
            <div className="relative max-w-2xl">
              <select
                value={selectedSchoolId}
                onChange={handleSchoolChange}
                className="h-12 w-full appearance-none rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 pr-11 text-sm outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="">
                  Select a school
                </option>

                {schools.map((school) => (
                  <option
                    key={school.id}
                    value={school.id}
                  >
                    {getSchoolName(school)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
              />
            </div>
          )}

          {selectedSchool && (
            <div className="mt-4 rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text)]/50">
                Selected School
              </p>

              <p className="mt-1 font-semibold">
                {getSchoolName(selectedSchool)}
              </p>

              <p className="mt-1 text-sm text-[var(--color-text)]/60">
                All sessions and terms below belong to
                the selected school.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            NO SCHOOL SELECTED
        ================================================== */}

        {!selectedSchoolId && !loadingSchools && (
          <div className="rounded-2xl border border-dashed border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-12 text-center">
            <CalendarDays
              size={36}
              className="mx-auto text-[var(--color-text)]/30"
            />

            <h2 className="mt-4 text-base font-semibold">
              Select a school to continue
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text)]/60">
              Academic sessions and terms are managed
              separately for each school.
            </p>
          </div>
        )}

        {/* =================================================
            ACADEMIC CONTENT
        ================================================== */}

        {selectedSchoolId && (
          <>
            {/* =============================================
                SESSIONS
            ============================================== */}

            <section className="rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)] shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[var(--color-text)]/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold sm:text-lg">
                    Academic Sessions
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text)]/60">
                    Create and manage academic sessions
                    for{" "}
                    <span className="font-medium">
                      {getSchoolName(selectedSchool)}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddSession}
                  disabled={!selectedSchoolId}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Session
                </button>
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/60">
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Loading academic data...
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto text-[var(--color-text)]/25"
                  />

                  <p className="mt-4 text-sm font-medium">
                    No academic sessions found
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text)]/55">
                    Add the first academic session for
                    this school.
                  </p>
                </div>
              ) : (
                <>
                  {/* -----------------------------------------
                      MOBILE
                  ------------------------------------------ */}

                  <div className="divide-y divide-[var(--color-text)]/10 sm:hidden">
                    {sessions.map((session) => {
                      const isSelected =
                        String(selectedSessionId) ===
                        String(session.id);

                      const isDeleting =
                        deletingId ===
                        `session-${session.id}`;

                      return (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between gap-3 px-4 py-4 ${
                            isSelected
                              ? "bg-[var(--color-primary)]/5"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSessionId(
                                String(session.id),
                              )
                            }
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-sm font-semibold">
                                {getSessionName(session)}
                              </p>

                              {session.is_current && (
                                <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                                  Current
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[var(--color-text)]/55">
                              {formatDate(
                                session.start_date,
                              )}{" "}
                              —{" "}
                              {formatDate(
                                session.end_date,
                              )}
                            </p>
                          </button>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditSession(
                                  session,
                                )
                              }
                              className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
                              title="Edit session"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSession(
                                  session,
                                )
                              }
                              disabled={isDeleting}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                              title="Delete session"
                            >
                              {isDeleting ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* -----------------------------------------
                      DESKTOP
                  ------------------------------------------ */}

                  <div className="hidden overflow-hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-text)]/10 text-xs uppercase tracking-wide text-[var(--color-text)]/50">
                            <th className="px-5 py-3 font-medium">
                              Session
                            </th>

                            <th className="px-5 py-3 font-medium">
                              Start Date
                            </th>

                            <th className="px-5 py-3 font-medium">
                              End Date
                            </th>

                            <th className="px-5 py-3 font-medium">
                              Status
                            </th>

                            <th className="px-5 py-3 text-right font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {sessions.map((session) => {
                            const isSelected =
                              String(
                                selectedSessionId,
                              ) ===
                              String(session.id);

                            const isDeleting =
                              deletingId ===
                              `session-${session.id}`;

                            return (
                              <tr
                                key={session.id}
                                onClick={() =>
                                  setSelectedSessionId(
                                    String(
                                      session.id,
                                    ),
                                  )
                                }
                                className={`cursor-pointer border-b border-[var(--color-text)]/10 transition last:border-b-0 hover:bg-[var(--color-text)]/5 ${
                                  isSelected
                                    ? "bg-[var(--color-primary)]/5"
                                    : ""
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                      {getSessionName(
                                        session,
                                      )}
                                    </span>

                                    {isSelected && (
                                      <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-[var(--color-text)]/70">
                                  {formatDate(
                                    session.start_date,
                                  )}
                                </td>

                                <td className="px-5 py-4 text-[var(--color-text)]/70">
                                  {formatDate(
                                    session.end_date,
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  {session.is_current ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                      <CheckCircle2
                                        size={13}
                                      />
                                      Current
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[var(--color-text)]/50">
                                      Not Current
                                    </span>
                                  )}
                                </td>

                                <td
                                  className="px-5 py-4"
                                  onClick={(event) =>
                                    event.stopPropagation()
                                  }
                                >
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditSession(
                                          session,
                                        )
                                      }
                                      className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
                                      title="Edit session"
                                    >
                                      <Edit3
                                        size={17}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteSession(
                                          session,
                                        )
                                      }
                                      disabled={
                                        isDeleting
                                      }
                                      className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                      title="Delete session"
                                    >
                                      {isDeleting ? (
                                        <Loader2
                                          size={17}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2
                                          size={17}
                                        />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* =============================================
                TERMS
            ============================================== */}

            <section className="rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)] shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[var(--color-text)]/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold sm:text-lg">
                    Academic Terms
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text)]/60">
                    Manage terms for the selected academic
                    session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddTerm}
                  disabled={
                    !selectedSchoolId ||
                    !selectedSessionId
                  }
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Term
                </button>
              </div>

              {/* ---------------------------------------------
                  SESSION SELECTOR
              ---------------------------------------------- */}

              <div className="border-b border-[var(--color-text)]/10 p-4 sm:p-5">
                <div className="max-w-xl">
                  <label className="mb-2 block text-sm font-medium">
                    Academic Session
                  </label>

                  <div className="relative">
                    <select
                      value={selectedSessionId}
                      onChange={(event) =>
                        setSelectedSessionId(
                          event.target.value,
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 pr-11 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    >
                      {sessions.length === 0 ? (
                        <option value="">
                          No sessions available
                        </option>
                      ) : (
                        sessions.map((session) => (
                          <option
                            key={session.id}
                            value={session.id}
                          >
                            {getSessionName(
                              session,
                            )}
                            {session.is_current
                              ? " — Current"
                              : ""}
                          </option>
                        ))
                      )}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
                    />
                  </div>
                </div>
              </div>

              {selectedSession ? (
                <div className="px-4 py-3 sm:px-5">
                  <div className="rounded-xl bg-[var(--color-background)] px-4 py-3">
                    <p className="text-xs text-[var(--color-text)]/50">
                      Viewing terms for
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {getSessionName(selectedSession)}
                    </p>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/60">
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Loading terms...
                  </div>
                </div>
              ) : !selectedSessionId ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm font-medium">
                    Select an academic session
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text)]/55">
                    Select a session above to view its
                    terms.
                  </p>
                </div>
              ) : selectedSessionTerms.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto text-[var(--color-text)]/25"
                  />

                  <p className="mt-4 text-sm font-medium">
                    No terms found
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text)]/55">
                    Add the first term for this academic
                    session.
                  </p>
                </div>
              ) : (
                <>
                  {/* -----------------------------------------
                      MOBILE
                  ------------------------------------------ */}

                  <div className="divide-y divide-[var(--color-text)]/10 sm:hidden">
                    {selectedSessionTerms.map(
                      (term) => {
                        const isDeleting =
                          deletingId ===
                          `term-${term.id}`;

                        const isSettingCurrent =
                          settingCurrentId ===
                          term.id;

                        return (
                          <div
                            key={term.id}
                            className="flex items-center justify-between gap-3 px-4 py-4"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-semibold">
                                  {getTermName(term)}
                                </p>

                                {term.is_current && (
                                  <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                                    Current
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-[var(--color-text)]/55">
                                {formatDate(
                                  term.start_date,
                                )}{" "}
                                —{" "}
                                {formatDate(
                                  term.end_date,
                                )}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              {!term.is_current && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetCurrentTerm(
                                      term,
                                    )
                                  }
                                  disabled={
                                    isSettingCurrent
                                  }
                                  className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 disabled:opacity-50 dark:text-green-400"
                                  title="Set current"
                                >
                                  {isSettingCurrent ? (
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2
                                      size={17}
                                    />
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditTerm(term)
                                }
                                className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5"
                                title="Edit term"
                              >
                                <Edit3 size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTerm(term)
                                }
                                disabled={isDeleting}
                                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                title="Delete term"
                              >
                                {isDeleting ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={17} />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* -----------------------------------------
                      DESKTOP
                  ------------------------------------------ */}

                  <div className="hidden overflow-hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[750px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-text)]/10 text-xs uppercase tracking-wide text-[var(--color-text)]/50">
                            <th className="px-5 py-3 font-medium">
                              Term
                            </th>

                            <th className="px-5 py-3 font-medium">
                              Session
                            </th>

                            <th className="px-5 py-3 font-medium">
                              Start Date
                            </th>

                            <th className="px-5 py-3 font-medium">
                              End Date
                            </th>

                            <th className="px-5 py-3 font-medium">
                              Status
                            </th>

                            <th className="px-5 py-3 text-right font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedSessionTerms.map(
                            (term) => {
                              const isDeleting =
                                deletingId ===
                                `term-${term.id}`;

                              const isSettingCurrent =
                                settingCurrentId ===
                                term.id;

                              return (
                                <tr
                                  key={term.id}
                                  className="border-b border-[var(--color-text)]/10 last:border-b-0"
                                >
                                  <td className="px-5 py-4">
                                    <span className="font-semibold">
                                      {getTermName(term)}
                                    </span>
                                  </td>

                                  <td className="px-5 py-4 text-[var(--color-text)]/70">
                                    {getSessionDisplay(
                                      term,
                                      sessions,
                                    )}
                                  </td>

                                  <td className="px-5 py-4 text-[var(--color-text)]/70">
                                    {formatDate(
                                      term.start_date,
                                    )}
                                  </td>

                                  <td className="px-5 py-4 text-[var(--color-text)]/70">
                                    {formatDate(
                                      term.end_date,
                                    )}
                                  </td>

                                  <td className="px-5 py-4">
                                    {term.is_current ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                        <CheckCircle2
                                          size={13}
                                        />
                                        Current
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[var(--color-text)]/50">
                                        Not Current
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-5 py-4">
                                    <div className="flex justify-end gap-1">
                                      {!term.is_current && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSetCurrentTerm(
                                              term,
                                            )
                                          }
                                          disabled={
                                            isSettingCurrent
                                          }
                                          className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 disabled:opacity-50 dark:text-green-400"
                                          title="Set current"
                                        >
                                          {isSettingCurrent ? (
                                            <Loader2
                                              size={17}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <CheckCircle2
                                              size={17}
                                            />
                                          )}
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditTerm(
                                            term,
                                          )
                                        }
                                        className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5"
                                        title="Edit term"
                                      >
                                        <Edit3
                                          size={17}
                                        />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteTerm(
                                            term,
                                          )
                                        }
                                        disabled={
                                          isDeleting
                                        }
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                        title="Delete term"
                                      >
                                        {isDeleting ? (
                                          <Loader2
                                            size={17}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Trash2
                                            size={17}
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>

      {/* ===================================================
          SESSION MODAL
      ==================================================== */}

      {showSessionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-text)]/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingSession
                    ? "Edit Academic Session"
                    : "Add Academic Session"}
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text)]/55">
                  {getSchoolName(selectedSchool)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSessionForm}
                className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSaveSession}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Session Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={sessionForm.name}
                  onChange={handleSessionChange}
                  placeholder="e.g. 2026/2027"
                  className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={sessionForm.start_date}
                    onChange={handleSessionChange}
                    className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={sessionForm.end_date}
                    onChange={handleSessionChange}
                    className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={sessionForm.is_current}
                  onChange={handleSessionChange}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Set as current session
                  </span>

                  <span className="mt-1 block text-xs text-[var(--color-text)]/55">
                    Mark this session as the school's
                    current academic session.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSessionForm}
                  disabled={savingSession}
                  className="min-h-11 rounded-xl border border-[var(--color-text)]/10 px-5 text-sm font-medium hover:bg-[var(--color-text)]/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSession}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingSession ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingSession
                        ? "Update Session"
                        : "Create Session"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          TERM MODAL
      ==================================================== */}

      {showTermForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-text)]/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingTerm
                    ? "Edit Academic Term"
                    : "Add Academic Term"}
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text)]/55">
                  {getSchoolName(selectedSchool)}
                  {selectedSession
                    ? ` • ${getSessionName(
                        selectedSession,
                      )}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTermForm}
                className="rounded-lg p-2 text-[var(--color-text)]/60 hover:bg-[var(--color-text)]/5"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSaveTerm}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Academic Session
                </label>

                <div className="relative">
                  <select
                    name="academic_session"
                    value={
                      termForm.academic_session
                    }
                    onChange={handleTermChange}
                    className="h-11 w-full appearance-none rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 pr-10 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">
                      Select session
                    </option>

                    {sessions.map((session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {getSessionName(session)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Term Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={termForm.name}
                  onChange={handleTermChange}
                  placeholder="e.g. FIRST, SECOND, THIRD"
                  className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={termForm.start_date}
                    onChange={handleTermChange}
                    className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={termForm.end_date}
                    onChange={handleTermChange}
                    className="h-11 w-full rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-background)] p-4">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={termForm.is_current}
                  onChange={handleTermChange}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Set as current term
                  </span>

                  <span className="mt-1 block text-xs text-[var(--color-text)]/55">
                    Mark this term as the current term.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTermForm}
                  disabled={savingTerm}
                  className="min-h-11 rounded-xl border border-[var(--color-text)]/10 px-5 text-sm font-medium hover:bg-[var(--color-text)]/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingTerm}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingTerm ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingTerm
                        ? "Update Term"
                        : "Create Term"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSettings;