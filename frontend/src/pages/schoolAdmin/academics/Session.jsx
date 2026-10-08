import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../../../services/academicsService";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";


/* ============================================================
   HELPERS
============================================================ */

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


/* ============================================================
   EMPTY FORM
============================================================ */

const EMPTY_FORM = {
  name: "",
  start_date: "",
  end_date: "",
  is_active: true,
};


/* ============================================================
   SESSION
   LIST + DETAILS + ADD + EDIT
============================================================ */

const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const path = location.pathname;

  const isAddPage = path.endsWith("/add");
  const isEditPage = path.endsWith("/edit");

  const isDetailsPage =
    Boolean(id) &&
    !isAddPage &&
    !isEditPage;

  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedSession, setSelectedSession] =
    useState(null);


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
        "Failed to load sessions:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load academic sessions."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSessions();
  }, []);


  /* ============================================================
     FIND SELECTED SESSION
  ============================================================ */

  useEffect(() => {
    if (!id || sessions.length === 0) {
      setSelectedSession(null);
      return;
    }

    const found = sessions.find(
      (session) =>
        String(session.id) === String(id)
    );

    setSelectedSession(found || null);
  }, [id, sessions]);


  /* ============================================================
     LOAD EDIT DATA
  ============================================================ */

  useEffect(() => {
    if (
      !isEditPage ||
      !selectedSession
    ) {
      return;
    }

    setForm({
      name: selectedSession.name || "",

      start_date:
        selectedSession.start_date
          ? selectedSession.start_date.substring(
              0,
              10
            )
          : "",

      end_date:
        selectedSession.end_date
          ? selectedSession.end_date.substring(
              0,
              10
            )
          : "",

      is_active:
        selectedSession.is_active !== false,
    });

    setFormError("");
  }, [
    isEditPage,
    selectedSession,
  ]);


  /* ============================================================
     FILTER
  ============================================================ */

  const filteredSessions = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return sessions;
    }

    return sessions.filter(
      (session) =>
        String(session.name || "")
          .toLowerCase()
          .includes(value) ||
        String(session.start_date || "")
          .toLowerCase()
          .includes(value) ||
        String(session.end_date || "")
          .toLowerCase()
          .includes(value)
    );
  }, [sessions, search]);


  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  /* ============================================================
     VALIDATE
  ============================================================ */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Session name is required.";
    }

    if (!form.start_date) {
      return "Start date is required.";
    }

    if (!form.end_date) {
      return "End date is required.";
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      return (
        "End date cannot be before the start date."
      );
    }

    return "";
  };


  /* ============================================================
     CREATE / UPDATE
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active,
      };

      if (isEditPage && id) {
        const updated =
          await updateSession(
            id,
            payload
          );

        setSessions((prev) =>
          prev.map((session) =>
            String(session.id) ===
            String(id)
              ? updated
              : session
          )
        );

        navigate(
          `/school-admin/academics/sessions/${id}`
        );
      } else {
        const created =
          await createSession(payload);

        setSessions((prev) => [
          created,
          ...prev,
        ]);

        navigate(
          `/school-admin/academics/sessions/${created.id}`
        );
      }
    } catch (err) {
      console.error(
        "Failed to save session:",
        err
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        if (responseData.detail) {
          setFormError(
            responseData.detail
          );
        } else {
          const firstError =
            Object.values(
              responseData
            )[0];

          if (Array.isArray(firstError)) {
            setFormError(
              firstError[0]
            );
          } else {
            setFormError(
              "Failed to save academic session."
            );
          }
        }
      } else {
        setFormError(
          "Failed to save academic session."
        );
      }
    } finally {
      setSaving(false);
    }
  };


  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (session) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${session.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSession(
        session.id
      );

      setSessions((prev) =>
        prev.filter(
          (item) =>
            item.id !== session.id
        )
      );

      if (isDetailsPage) {
        navigate(
          "/school-admin/academics/sessions"
        );
      }
    } catch (err) {
      console.error(
        "Failed to delete session:",
        err
      );

      alert(
        err?.response?.data?.detail ||
          "Failed to delete academic session."
      );
    }
  };


  /* ============================================================
     TOGGLE STATUS
  ============================================================ */

  const handleToggleStatus = async (
    session
  ) => {
    try {
      const updated =
        await updateSession(
          session.id,
          {
            name: session.name,
            start_date:
              session.start_date,
            end_date:
              session.end_date,
            is_active:
              !session.is_active,
          }
        );

      setSessions((prev) =>
        prev.map((item) =>
          item.id === session.id
            ? updated
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update session status:",
        err
      );

      alert(
        err?.response?.data?.detail ||
          "Failed to update session status."
      );
    }
  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading academic sessions...
        </div>
      </div>
    );
  }


  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <h2 className="font-semibold text-red-700 dark:text-red-400">
                Unable to load sessions
              </h2>

              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadSessions}
                className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /* ============================================================
     ADD / EDIT PAGE
  ============================================================ */

  if (
    isAddPage ||
    isEditPage
  ) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/sessions"
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </button>

          <h1 className="text-2xl font-bold">
            {isEditPage
              ? "Edit Academic Session"
              : "Add Academic Session"}
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEditPage
              ? "Update the academic session information."
              : "Create a new academic session."}
          </p>
        </div>


        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7"
          >

            {formError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <span>
                  {formError}
                </span>
              </div>
            )}


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* SESSION NAME */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Session Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. 2026/2027"
                  className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:focus:ring-blue-900/30"
                />
              </div>


              {/* START DATE */}

              <div>
                <label
                  htmlFor="start_date"
                  className="mb-2 block text-sm font-medium"
                >
                  Start Date
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:focus:ring-blue-900/30"
                />
              </div>


              {/* END DATE */}

              <div>
                <label
                  htmlFor="end_date"
                  className="mb-2 block text-sm font-medium"
                >
                  End Date
                </label>

                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:focus:ring-blue-900/30"
                />
              </div>


              {/* ACTIVE */}

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />

                  <span className="text-sm font-medium">
                    Active session
                  </span>
                </label>

                <p className="mt-1 pl-7 text-xs text-slate-500 dark:text-slate-400">
                  Mark this session as active if
                  it is currently being used by
                  the school.
                </p>
              </div>

            </div>


            {/* ACTIONS */}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    isEditPage && id
                      ? `/school-admin/academics/sessions/${id}`
                      : "/school-admin/academics/sessions"
                  )
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
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

                {isEditPage
                  ? "Update Session"
                  : "Create Session"}
              </button>

            </div>

          </form>

        </div>
      </div>
    );
  }


  /* ============================================================
     DETAILS PAGE
  ============================================================ */

  if (isDetailsPage) {

    if (!selectedSession) {
      return (
        <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/sessions"
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </button>

          <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center dark:border-slate-700">

            <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-3 text-lg font-semibold">
              Session not found
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The academic session could not be
              found.
            </p>

          </div>

        </div>
      );
    }


    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">

        {/* HEADER */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/sessions"
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </button>


          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <CalendarDays className="h-7 w-7 text-[var(--color-primary)]" />

                <h1 className="text-2xl font-bold">
                  {selectedSession.name}
                </h1>

              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Academic Session Details
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/school-admin/academics/sessions/${selectedSession.id}/edit`
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>


              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedSession
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

            </div>

          </div>

        </div>


        {/* STATUS */}

        <div className="mb-6 rounded-xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current Status
              </p>

              <div className="mt-2 flex items-center gap-2">

                {selectedSession.is_active ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                    <span className="font-semibold text-green-700 dark:text-green-400">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />

                    <span className="font-semibold text-red-700 dark:text-red-400">
                      Inactive
                    </span>
                  </>
                )}

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                handleToggleStatus(
                  selectedSession
                )
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedSession.is_active
                  ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
              {selectedSession.is_active
                ? "Deactivate Session"
                : "Activate Session"}
            </button>

          </div>

        </div>


        {/* DETAILS */}

        <div className="rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="font-semibold">
              Session Information
            </h2>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2">

            <div className="border-b border-slate-200 p-5 dark:border-slate-700 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Session Name
              </p>

              <p className="mt-2 font-medium">
                {selectedSession.name}
              </p>
            </div>


            <div className="border-b border-slate-200 p-5 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status
              </p>

              <p className="mt-2 font-medium">
                {selectedSession.is_active
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>


            <div className="border-b border-slate-200 p-5 dark:border-slate-700 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Start Date
              </p>

              <p className="mt-2 font-medium">
                {formatDate(
                  selectedSession.start_date
                )}
              </p>
            </div>


            <div className="border-b border-slate-200 p-5 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                End Date
              </p>

              <p className="mt-2 font-medium">
                {formatDate(
                  selectedSession.end_date
                )}
              </p>
            </div>

          </div>

        </div>

      </div>
    );
  }


  /* ============================================================
     LIST PAGE
  ============================================================ */

  const activeCount =
    sessions.filter(
      (session) =>
        session.is_active
    ).length;

  const inactiveCount =
    sessions.length -
    activeCount;


  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-5 text-[var(--color-text)] sm:px-6 sm:py-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Academic Sessions
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage academic sessions for your school.
          </p>
        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/school-admin/academics/sessions/add"
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Session
        </button>

      </div>


      {/* SUMMARY */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Sessions
          </p>

          <p className="mt-2 text-2xl font-bold">
            {sessions.length}
          </p>

        </div>


        <div className="rounded-xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeCount}
          </p>

        </div>


        <div className="rounded-xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-500">
            {inactiveCount}
          </p>

        </div>

      </div>


      {/* SEARCH */}

      <div className="mb-4 rounded-xl bg-[var(--color-card)] p-4 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search sessions..."
            className="w-full rounded-lg border border-slate-300 bg-[var(--color-card)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:focus:ring-blue-900/30"
          />

        </div>

      </div>


      {/* LIST */}

      <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">

        {filteredSessions.length === 0 ? (

          <div className="p-10 text-center">

            <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "No sessions match your search."
                : "No academic sessions found."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/school-admin/academics/sessions/add"
                  )
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
              >
                <Plus className="h-4 w-4" />
                Add your first session
              </button>
            )}

          </div>

        ) : (

          <>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">

              <table className="min-w-full">

                <thead className="bg-slate-50 dark:bg-slate-800/60">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Session
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Start Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      End Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

                  {filteredSessions.map(
                    (session) => (

                      <tr
                        key={session.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] dark:bg-blue-900/20">
                              <CalendarDays className="h-4 w-4" />
                            </div>

                            <div>

                              <p className="font-medium">
                                {session.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Academic Session
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            session.start_date
                          )}
                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            session.end_date
                          )}
                        </td>


                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                session
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              session.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {session.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>


                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/academics/sessions/${session.id}`
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-primary)] transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="View session"
                              aria-label="View session"
                            >
                              <Eye className="h-4 w-4" />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/academics/sessions/${session.id}/edit`
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Edit session"
                              aria-label="Edit session"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  session
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

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* MOBILE */}

            <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">

              {filteredSessions.map(
                (session) => (

                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-4 px-4 py-4"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-medium">
                        {session.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(
                          session.start_date
                        )}{" "}
                        —{" "}
                        {formatDate(
                          session.end_date
                        )}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/school-admin/academics/sessions/${session.id}`
                        )
                      }
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-[var(--color-primary)] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-800"
                      title="View session"
                      aria-label="View session"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                  </div>

                )
              )}

            </div>

          </>

        )}

      </div>

    </div>
  );
};

export default Session;