
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

import api from "../../../services/api";

const emptySessionForm = {
  name: "",
  start_date: "",
  end_date: "",
  is_current: false,
  is_active: true,
};

const emptyTermForm = {
  academic_session: "",
  name: "FIRST",
  start_date: "",
  end_date: "",
  is_current: false,
  is_active: true,
};

const AcademicSettings = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [sessionForm, setSessionForm] = useState(
    emptySessionForm,
  );

  const [termForm, setTermForm] = useState(
    emptyTermForm,
  );

  const [editingSession, setEditingSession] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);

  const [showSessionForm, setShowSessionForm] =
    useState(false);

  const [showTermForm, setShowTermForm] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingSession, setSavingSession] =
    useState(false);
  const [savingTerm, setSavingTerm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingCurrentId, setSettingCurrentId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;

    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const value = data[firstKey];

      if (Array.isArray(value)) {
        return value.join(" ");
      }

      if (typeof value === "string") {
        return value;
      }

      if (value) {
        return JSON.stringify(value);
      }
    }

    return fallback;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString();
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadAcademicData = async () => {
    try {
      setLoading(true);
      clearMessages();

      const [sessionsResponse, termsResponse] =
        await Promise.all([
          api.get("/academics/sessions/"),
          api.get("/academics/terms/"),
        ]);

      const sessionData = Array.isArray(
        sessionsResponse.data,
      )
        ? sessionsResponse.data
        : sessionsResponse.data?.results || [];

      const termData = Array.isArray(
        termsResponse.data,
      )
        ? termsResponse.data
        : termsResponse.data?.results || [];

      setSessions(sessionData);
      setTerms(termData);

      // Prefer the current session.
      const currentSession = sessionData.find(
        (session) => session.is_current,
      );

      if (currentSession) {
        setSelectedSessionId(
          String(currentSession.id),
        );
      } else if (sessionData.length > 0) {
        setSelectedSessionId(
          String(sessionData[0].id),
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load academic settings.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicData();
  }, []);

  // ============================================================
  // SELECTED SESSION
  // ============================================================

  const selectedSession = useMemo(() => {
    return sessions.find(
      (session) =>
        String(session.id) ===
        String(selectedSessionId),
    );
  }, [sessions, selectedSessionId]);

  const selectedSessionTerms = useMemo(() => {
    return terms.filter(
      (term) =>
        String(term.academic_session) ===
        String(selectedSessionId),
    );
  }, [terms, selectedSessionId]);

  // ============================================================
  // SESSION FORM
  // ============================================================

  const openCreateSession = () => {
    clearMessages();
    setEditingSession(null);
    setSessionForm(emptySessionForm);
    setShowSessionForm(true);
  };

  const openEditSession = (session) => {
    clearMessages();

    setEditingSession(session);

    setSessionForm({
      name: session.name || "",
      start_date: session.start_date || "",
      end_date: session.end_date || "",
      is_current: Boolean(session.is_current),
      is_active: Boolean(session.is_active),
    });

    setShowSessionForm(true);
  };

  const closeSessionForm = () => {
    if (savingSession) {
      return;
    }

    setShowSessionForm(false);
    setEditingSession(null);
    setSessionForm(emptySessionForm);
  };

  const handleSessionChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setSessionForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSession = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!sessionForm.name.trim()) {
      setError("Academic session name is required.");
      return;
    }

    if (!sessionForm.start_date) {
      setError("Session start date is required.");
      return;
    }

    if (!sessionForm.end_date) {
      setError("Session end date is required.");
      return;
    }

    if (
      sessionForm.end_date <
      sessionForm.start_date
    ) {
      setError(
        "Session end date cannot be before the start date.",
      );
      return;
    }

    try {
      setSavingSession(true);

      const payload = {
        name: sessionForm.name.trim(),
        start_date: sessionForm.start_date,
        end_date: sessionForm.end_date,
        is_current: sessionForm.is_current,
        is_active: sessionForm.is_active,
      };

      if (editingSession) {
        const response = await api.patch(
          `/academics/sessions/${editingSession.id}/`,
          payload,
        );

        setSessions((previous) =>
          previous.map((session) =>
            session.id === editingSession.id
              ? response.data
              : session,
          ),
        );

        setSelectedSessionId(
          String(response.data.id),
        );

        setSuccess(
          "Academic session updated successfully.",
        );
      } else {
        const response = await api.post(
          "/academics/sessions/",
          payload,
        );

        setSessions((previous) => [
          ...previous,
          response.data,
        ]);

        setSelectedSessionId(
          String(response.data.id),
        );

        setSuccess(
          "Academic session created successfully.",
        );
      }

      setShowSessionForm(false);
      setEditingSession(null);
      setSessionForm(emptySessionForm);

      // Refresh because current-session state may have
      // changed on the backend.
      await loadAcademicData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save academic session.",
        ),
      );
    } finally {
      setSavingSession(false);
    }
  };

  // ============================================================
  // DELETE SESSION
  // ============================================================

  const deleteSession = async (session) => {
    clearMessages();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${session.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(`session-${session.id}`);

      await api.delete(
        `/academics/sessions/${session.id}/`,
      );

      const remainingSessions = sessions.filter(
        (item) => item.id !== session.id,
      );

      setSessions(remainingSessions);

      if (
        String(selectedSessionId) ===
        String(session.id)
      ) {
        const replacement =
          remainingSessions.find(
            (item) => item.is_current,
          ) ||
          remainingSessions[0];

        setSelectedSessionId(
          replacement
            ? String(replacement.id)
            : "",
        );
      }

      setSuccess(
        "Academic session deleted successfully.",
      );

      await loadAcademicData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete academic session.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // TERM FORM
  // ============================================================

  const openCreateTerm = () => {
    clearMessages();
    setEditingTerm(null);

    setTermForm({
      ...emptyTermForm,
      academic_session:
        selectedSessionId || "",
    });

    setShowTermForm(true);
  };

  const openEditTerm = (term) => {
    clearMessages();

    setEditingTerm(term);

    setTermForm({
      academic_session:
        term.academic_session || "",
      name: term.name || "FIRST",
      start_date: term.start_date || "",
      end_date: term.end_date || "",
      is_current: Boolean(term.is_current),
      is_active: Boolean(term.is_active),
    });

    setShowTermForm(true);
  };

  const closeTermForm = () => {
    if (savingTerm) {
      return;
    }

    setShowTermForm(false);
    setEditingTerm(null);
    setTermForm(emptyTermForm);
  };

  const handleTermChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setTermForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveTerm = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!termForm.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!termForm.name) {
      setError("Please select a term.");
      return;
    }

    if (!termForm.start_date) {
      setError("Term start date is required.");
      return;
    }

    if (!termForm.end_date) {
      setError("Term end date is required.");
      return;
    }

    if (
      termForm.end_date <
      termForm.start_date
    ) {
      setError(
        "Term end date cannot be before the start date.",
      );
      return;
    }

    try {
      setSavingTerm(true);

      const payload = {
        academic_session:
          Number(termForm.academic_session),
        name: termForm.name,
        start_date: termForm.start_date,
        end_date: termForm.end_date,
        is_current: termForm.is_current,
        is_active: termForm.is_active,
      };

      if (editingTerm) {
        const response = await api.patch(
          `/academics/terms/${editingTerm.id}/`,
          payload,
        );

        setTerms((previous) =>
          previous.map((term) =>
            term.id === editingTerm.id
              ? response.data
              : term,
          ),
        );

        setSuccess(
          "Term updated successfully.",
        );
      } else {
        const response = await api.post(
          "/academics/terms/",
          payload,
        );

        setTerms((previous) => [
          ...previous,
          response.data,
        ]);

        setSuccess(
          "Term created successfully.",
        );
      }

      setShowTermForm(false);
      setEditingTerm(null);
      setTermForm(emptyTermForm);

      await loadAcademicData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save term.",
        ),
      );
    } finally {
      setSavingTerm(false);
    }
  };

  // ============================================================
  // DELETE TERM
  // ============================================================

  const deleteTerm = async (term) => {
    clearMessages();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${term.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(`term-${term.id}`);

      await api.delete(
        `/academics/terms/${term.id}/`,
      );

      setTerms((previous) =>
        previous.filter(
          (item) => item.id !== term.id,
        ),
      );

      setSuccess("Term deleted successfully.");

      await loadAcademicData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete term.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // SET CURRENT TERM
  // ============================================================

  const setCurrentTerm = async (term) => {
    clearMessages();

    try {
      setSettingCurrentId(term.id);

      const response = await api.post(
        `/academics/terms/${term.id}/set-current/`,
      );

      setSuccess(
        response.data?.message ||
          "Current term updated successfully.",
      );

      await loadAcademicData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to set current term.",
        ),
      );
    } finally {
      setSettingCurrentId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <CalendarDays size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Academic Settings
                </h1>

                <p className="mt-1 text-sm text-[var(--color-text)]/60">
                  Manage academic sessions and terms for
                  your school.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAcademicData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            <X size={18} className="mt-0.5 shrink-0" />

            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">{success}</div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)]">
            <div className="flex flex-col items-center gap-3 text-sm text-[var(--color-text)]/60">
              <Loader2
                size={28}
                className="animate-spin text-[var(--color-primary)]"
              />
              Loading academic settings...
            </div>
          </div>
        ) : (
          <>
            {/* SESSION SECTION */}
            <section className="rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)] shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[var(--color-text)]/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Academic Sessions
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text)]/60">
                    Create and manage academic years for
                    your school.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateSession}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Add Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--color-text)]/60">
                  No academic sessions have been created
                  yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[var(--color-text)]/10 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Session
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Start
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          End
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sessions.map((session) => (
                        <tr
                          key={session.id}
                          onClick={() =>
                            setSelectedSessionId(
                              String(session.id),
                            )
                          }
                          className={`cursor-pointer border-b border-[var(--color-text)]/5 transition last:border-0 hover:bg-[var(--color-primary)]/5 ${
                            String(
                              selectedSessionId,
                            ) === String(session.id)
                              ? "bg-[var(--color-primary)]/5"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                <CalendarDays
                                  size={17}
                                />
                              </div>

                              <div>
                                <div className="font-medium text-[var(--color-text)]">
                                  {session.name}
                                </div>

                                {session.is_current && (
                                  <div className="mt-0.5 text-xs font-medium text-green-600">
                                    Current session
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                            {formatDate(
                              session.start_date,
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                            {formatDate(
                              session.end_date,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {session.is_active ? (
                              <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-[var(--color-text)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-text)]/60">
                                Inactive
                              </span>
                            )}
                          </td>

                          <td
                            className="px-5 py-4"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditSession(
                                    session,
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-text)]/10 text-[var(--color-text)]/70 transition hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]"
                                title="Edit session"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteSession(
                                    session,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  `session-${session.id}`
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                                title="Delete session"
                              >
                                {deletingId ===
                                `session-${session.id}` ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* TERM SECTION */}
            <section className="rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-card)] shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[var(--color-text)]/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Terms
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text)]/60">
                    Manage terms for the selected academic
                    session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateTerm}
                  disabled={!selectedSessionId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add Term
                </button>
              </div>

              <div className="border-b border-[var(--color-text)]/10 p-5">
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Academic Session
                </label>

                <div className="relative max-w-md">
                  <select
                    value={selectedSessionId}
                    onChange={(event) =>
                      setSelectedSessionId(
                        event.target.value,
                      )
                    }
                    className="w-full appearance-none rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 pr-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
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
                          {session.name}
                          {session.is_current
                            ? " — Current"
                            : ""}
                        </option>
                      ))
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
                  />
                </div>
              </div>

              {!selectedSession ? (
                <div className="p-8 text-center text-sm text-[var(--color-text)]/60">
                  Select an academic session to view its
                  terms.
                </div>
              ) : selectedSessionTerms.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <CalendarDays size={22} />
                  </div>

                  <p className="text-sm text-[var(--color-text)]/60">
                    No terms have been created for{" "}
                    <span className="font-medium text-[var(--color-text)]">
                      {selectedSession.name}
                    </span>
                    .
                  </p>

                  <button
                    type="button"
                    onClick={openCreateTerm}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Plus size={17} />
                    Add First Term
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[var(--color-text)]/10 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Term
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Start
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          End
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/50">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedSessionTerms.map(
                        (term) => (
                          <tr
                            key={term.id}
                            className="border-b border-[var(--color-text)]/5 last:border-0"
                          >
                            <td className="px-5 py-4">
                              <div className="font-medium text-[var(--color-text)]">
                                {term.name}
                              </div>

                              {term.is_current && (
                                <div className="mt-0.5 text-xs font-medium text-green-600">
                                  Current term
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                              {formatDate(
                                term.start_date,
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                              {formatDate(
                                term.end_date,
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {term.is_active ? (
                                  <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-full bg-[var(--color-text)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-text)]/60">
                                    Inactive
                                  </span>
                                )}

                                {term.is_current && (
                                  <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                                    Current
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                {!term.is_current && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCurrentTerm(
                                        term,
                                      )
                                    }
                                    disabled={
                                      settingCurrentId ===
                                      term.id
                                    }
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-green-500/20 px-3 text-xs font-medium text-green-600 transition hover:bg-green-500/10 disabled:opacity-50"
                                  >
                                    {settingCurrentId ===
                                    term.id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2
                                        size={14}
                                      />
                                    )}
                                    Set Current
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditTerm(
                                      term,
                                    )
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-text)]/10 text-[var(--color-text)]/70 transition hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]"
                                  title="Edit term"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTerm(term)
                                  }
                                  disabled={
                                    deletingId ===
                                    `term-${term.id}`
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                                  title="Delete term"
                                >
                                  {deletingId ===
                                  `term-${term.id}` ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={16} />
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
            </section>
          </>
        )}

        {/* ======================================================
            SESSION MODAL
        ====================================================== */}

        {showSessionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--color-text)]/10 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {editingSession
                      ? "Edit Academic Session"
                      : "Add Academic Session"}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--color-text)]/60">
                    Configure the academic year dates and
                    status.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSessionForm}
                  disabled={savingSession}
                  className="rounded-lg p-2 text-[var(--color-text)]/60 transition hover:bg-[var(--color-text)]/5"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={saveSession}
                className="space-y-5 p-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Session Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={sessionForm.name}
                    onChange={handleSessionChange}
                    placeholder="e.g. 2027/2028"
                    className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={
                        sessionForm.start_date
                      }
                      onChange={handleSessionChange}
                      className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={sessionForm.end_date}
                      onChange={handleSessionChange}
                      className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-[var(--color-text)]/10 p-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">
                        Current Session
                      </div>

                      <div className="mt-0.5 text-xs text-[var(--color-text)]/60">
                        Make this the school's current
                        academic session.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      name="is_current"
                      checked={
                        sessionForm.is_current
                      }
                      onChange={handleSessionChange}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">
                        Active
                      </div>

                      <div className="mt-0.5 text-xs text-[var(--color-text)]/60">
                        Allow this session to be used
                        throughout the system.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        sessionForm.is_active
                      }
                      onChange={handleSessionChange}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[var(--color-text)]/10 pt-4">
                  <button
                    type="button"
                    onClick={closeSessionForm}
                    disabled={savingSession}
                    className="rounded-lg border border-[var(--color-text)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-text)]/70 transition hover:bg-[var(--color-text)]/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingSession}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingSession ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {editingSession
                      ? "Update Session"
                      : "Save Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================
            TERM MODAL
        ====================================================== */}

        {showTermForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--color-text)]/10 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {editingTerm
                      ? "Edit Term"
                      : "Add Term"}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--color-text)]/60">
                    Configure the term for an academic
                    session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeTermForm}
                  disabled={savingTerm}
                  className="rounded-lg p-2 text-[var(--color-text)]/60 transition hover:bg-[var(--color-text)]/5"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={saveTerm}
                className="space-y-5 p-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Academic Session
                  </label>

                  <div className="relative">
                    <select
                      name="academic_session"
                      value={
                        termForm.academic_session
                      }
                      onChange={handleTermChange}
                      className="w-full appearance-none rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 pr-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    >
                      <option value="">
                        Select session
                      </option>

                      {sessions.map((session) => (
                        <option
                          key={session.id}
                          value={session.id}
                        >
                          {session.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Term
                  </label>

                  <div className="relative">
                    <select
                      name="name"
                      value={termForm.name}
                      onChange={handleTermChange}
                      className="w-full appearance-none rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 pr-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    >
                      <option value="FIRST">
                        First Term
                      </option>

                      <option value="SECOND">
                        Second Term
                      </option>

                      <option value="THIRD">
                        Third Term
                      </option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={termForm.start_date}
                      onChange={handleTermChange}
                      className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={termForm.end_date}
                      onChange={handleTermChange}
                      className="w-full rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-[var(--color-text)]/10 p-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">
                        Current Term
                      </div>

                      <div className="mt-0.5 text-xs text-[var(--color-text)]/60">
                        Make this the current term for
                        the selected session.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      name="is_current"
                      checked={
                        termForm.is_current
                      }
                      onChange={handleTermChange}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">
                        Active
                      </div>

                      <div className="mt-0.5 text-xs text-[var(--color-text)]/60">
                        Keep this term active.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        termForm.is_active
                      }
                      onChange={handleTermChange}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[var(--color-text)]/10 pt-4">
                  <button
                    type="button"
                    onClick={closeTermForm}
                    disabled={savingTerm}
                    className="rounded-lg border border-[var(--color-text)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-text)]/70 transition hover:bg-[var(--color-text)]/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingTerm}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTerm ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {editingTerm
                      ? "Update Term"
                      : "Save Term"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicSettings;
