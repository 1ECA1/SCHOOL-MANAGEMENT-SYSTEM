import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Save,
  X,
} from "lucide-react";

import api from "../../../services/api";
import { createExamination } from "../../../services/examinationsService";

// =====================================================
// CONSTANTS
// =====================================================

const EXAMINATION_TYPES = [
  {
    value: "FIRST_CA",
    label: "First Continuous Assessment",
  },
  {
    value: "SECOND_CA",
    label: "Second Continuous Assessment",
  },
  {
    value: "MID_TERM",
    label: "Mid-Term Examination",
  },
  {
    value: "MOCK",
    label: "Mock Examination",
  },
  {
    value: "TERMINAL",
    label: "Terminal Examination",
  },
  {
    value: "PROMOTION",
    label: "Promotion Examination",
  },
  {
    value: "ENTRANCE",
    label: "Entrance Examination",
  },
];

// =====================================================
// HELPERS
// =====================================================

const getListData = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      } else if (value !== null && value !== undefined) {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return "Unable to complete the request.";
};

// =====================================================
// COMPONENT
// =====================================================

export default function AddExam() {
  const navigate = useNavigate();

  // ---------------------------------------------------
  // DATA
  // ---------------------------------------------------

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  const [loadingData, setLoadingData] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------
  // MESSAGES
  // ---------------------------------------------------

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------
  // FORM
  // ---------------------------------------------------

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    name: "",
    examination_type: "TERMINAL",
    start_date: "",
    end_date: "",
    description: "",
    is_published: false,
    is_active: true,
  });

  // ===================================================
  // LOAD INITIAL DATA
  // ===================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    setError("");

    try {
      const [sessionsResponse, termsResponse, classesResponse] =
        await Promise.all([
          api.get("/academics/sessions/"),
          api.get("/academics/terms/"),
          api.get("/academics/class-levels/"),
        ]);

      const sessionData = getListData(sessionsResponse.data);
      const termData = getListData(termsResponse.data);
      const classData = getListData(classesResponse.data);

      setSessions(sessionData);
      setTerms(termData);
      setClasses(classData);

      // -----------------------------------------------
      // CURRENT SESSION
      // -----------------------------------------------

      const currentSession =
        sessionData.find(
          (session) =>
            session.is_current === true ||
            session.current === true
        ) || sessionData[0];

      // -----------------------------------------------
      // CURRENT TERM
      // -----------------------------------------------

      let currentTerm = null;

      if (currentSession) {
        currentTerm =
          termData.find(
            (term) =>
              Number(term.academic_session) ===
                Number(currentSession.id) &&
              (term.is_current === true || term.current === true)
          ) ||
          termData.find(
            (term) =>
              Number(term.academic_session) ===
              Number(currentSession.id)
          );
      }

      // -----------------------------------------------
      // DEFAULT CLASS
      // -----------------------------------------------

      const firstClass = classData[0];

      setForm((previous) => ({
        ...previous,
        academic_session: currentSession
          ? String(currentSession.id)
          : "",
        term: currentTerm ? String(currentTerm.id) : "",
        class_level: firstClass ? String(firstClass.id) : "",
      }));
    } catch (err) {
      setError(
        getErrorMessage(err) ||
          "Unable to load examination setup data."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // ===================================================
  // FILTER TERMS BY SESSION
  // ===================================================

  const filteredTerms = useMemo(() => {
    if (!form.academic_session) {
      return [];
    }

    return terms.filter(
      (term) =>
        Number(term.academic_session) ===
        Number(form.academic_session)
    );
  }, [terms, form.academic_session]);

  // ===================================================
  // SESSION CHANGE
  // ===================================================

  const handleSessionChange = async (event) => {
    const sessionId = event.target.value;

    setError("");
    setSuccess("");

    setForm((previous) => ({
      ...previous,
      academic_session: sessionId,
      term: "",
    }));

    if (!sessionId) {
      return;
    }

    // -------------------------------------------------
    // Use already loaded terms first.
    // -------------------------------------------------

    const sessionTerms = terms.filter(
      (term) =>
        Number(term.academic_session) === Number(sessionId)
    );

    const currentTerm =
      sessionTerms.find(
        (term) =>
          term.is_current === true ||
          term.current === true
      ) || sessionTerms[0];

    if (currentTerm) {
      setForm((previous) => ({
        ...previous,
        academic_session: sessionId,
        term: String(currentTerm.id),
      }));

      return;
    }

    // -------------------------------------------------
    // Fallback: request terms for selected session.
    // -------------------------------------------------

    try {
      setLoadingTerms(true);

      const response = await api.get("/academics/terms/", {
        params: {
          academic_session: sessionId,
        },
      });

      const sessionSpecificTerms = getListData(response.data);

      if (sessionSpecificTerms.length > 0) {
        setTerms((previous) => {
          const existingIds = new Set(
            previous.map((term) => Number(term.id))
          );

          const newTerms = sessionSpecificTerms.filter(
            (term) => !existingIds.has(Number(term.id))
          );

          return [...previous, ...newTerms];
        });

        const currentTerm =
          sessionSpecificTerms.find(
            (term) =>
              term.is_current === true ||
              term.current === true
          ) || sessionSpecificTerms[0];

        setForm((previous) => ({
          ...previous,
          academic_session: sessionId,
          term: currentTerm
            ? String(currentTerm.id)
            : "",
        }));
      }
    } catch (err) {
      setError(
        getErrorMessage(err) ||
          "Unable to load terms for the selected session."
      );
    } finally {
      setLoadingTerms(false);
    }
  };

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    if (!form.academic_session) {
      return "Please select an academic session.";
    }

    if (!form.term) {
      return "Please select a term.";
    }

    if (!form.class_level) {
      return "Please select a class.";
    }

    if (!form.name.trim()) {
      return "Please enter the examination name.";
    }

    if (!form.examination_type) {
      return "Please select an examination type.";
    }

    if (!form.start_date) {
      return "Please select the examination start date.";
    }

    if (!form.end_date) {
      return "Please select the examination end date.";
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      return "The examination end date cannot be before the start date.";
    }

    const selectedTerm = terms.find(
      (term) => Number(term.id) === Number(form.term)
    );

    if (
      selectedTerm &&
      Number(selectedTerm.academic_session) !==
        Number(form.academic_session)
    ) {
      return "The selected term does not belong to the selected academic session.";
    }

    return "";
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        academic_session: Number(form.academic_session),
        term: Number(form.term),
        class_level: Number(form.class_level),
        name: form.name.trim(),
        examination_type: form.examination_type,
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description.trim(),
        is_published: form.is_published,
        is_active: form.is_active,
      };

      const createdExam = await createExamination(payload);

      setSuccess(
        "Examination created successfully."
      );

      // -------------------------------------------------
      // Give the success message a moment before
      // navigating to the examination details page.
      // -------------------------------------------------

      setTimeout(() => {
        if (createdExam?.id) {
          navigate(
            `/school-admin/examinations-results/exams/${createdExam.id}`
          );
        } else {
          navigate(
            "/school-admin/examinations-results/exams"
          );
        }
      }, 700);
    } catch (err) {
      setError(
        getErrorMessage(err) ||
          "Unable to create the examination."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate(
      "/school-admin/examinations-results/exams"
    );
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background text-text">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={34}
              className="animate-spin text-primary"
            />

            <p className="text-sm text-text/60">
              Loading examination setup...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="
                mt-1
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-card
                text-text
                transition
                hover:border-primary
                hover:text-primary
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-gray-700
              "
              title="Back to examinations"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <ClipboardList size={21} />
                </div>

                <h1 className="text-xl font-bold sm:text-2xl">
                  Create Examination
                </h1>
              </div>

              <p className="mt-1 text-sm text-text/60">
                Create an examination and define its
                schedule period.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-5
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
              dark:border-red-900/60
              dark:bg-red-950/30
              dark:text-red-300
            "
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-medium">
                Unable to create examination
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 opacity-70 transition hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div
            className="
              mb-5
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-3
              text-sm
              text-emerald-700
              dark:border-emerald-900/60
              dark:bg-emerald-950/30
              dark:text-emerald-300
            "
          >
            <CheckCircle2 size={19} />

            <span>{success}</span>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* =================================================
                MAIN FORM
            ================================================= */}

            <div className="space-y-6 lg:col-span-2">
              {/* -----------------------------------------------
                  BASIC INFORMATION
              ----------------------------------------------- */}

              <section
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-card
                  shadow-sm
                  dark:border-gray-700
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-gray-200
                    px-5
                    py-4
                    dark:border-gray-700
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-primary/10
                      text-primary
                    "
                  >
                    <FileText size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Examination Information
                    </h2>

                    <p className="text-xs text-text/50">
                      Enter the basic examination details.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  {/* Examination Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Examination Name
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. First Term Terminal Examination"
                      disabled={saving}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-background
                        px-4
                        py-3
                        text-sm
                        text-text
                        outline-none
                        transition
                        placeholder:text-text/40
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-gray-700
                      "
                    />
                  </div>

                  {/* Examination Type */}

                  <div>
                    <label
                      htmlFor="examination_type"
                      className="mb-2 block text-sm font-medium"
                    >
                      Examination Type
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      id="examination_type"
                      name="examination_type"
                      value={form.examination_type}
                      onChange={handleChange}
                      disabled={saving}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-background
                        px-4
                        py-3
                        text-sm
                        text-text
                        outline-none
                        transition
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-gray-700
                      "
                    >
                      {EXAMINATION_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Session / Term */}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="academic_session"
                        className="mb-2 block text-sm font-medium"
                      >
                        Academic Session
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        id="academic_session"
                        name="academic_session"
                        value={form.academic_session}
                        onChange={handleSessionChange}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-background
                          px-4
                          py-3
                          text-sm
                          text-text
                          outline-none
                          transition
                          focus:border-primary
                          focus:ring-2
                          focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          dark:border-gray-700
                        "
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
                            {session.is_current
                              ? " (Current)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="term"
                        className="mb-2 block text-sm font-medium"
                      >
                        Term
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          id="term"
                          name="term"
                          value={form.term}
                          onChange={handleChange}
                          disabled={
                            saving ||
                            !form.academic_session ||
                            loadingTerms
                          }
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-background
                            px-4
                            py-3
                            text-sm
                            text-text
                            outline-none
                            transition
                            focus:border-primary
                            focus:ring-2
                            focus:ring-primary/20
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            dark:border-gray-700
                          "
                        >
                          <option value="">
                            {loadingTerms
                              ? "Loading terms..."
                              : "Select term"}
                          </option>

                          {filteredTerms.map((term) => (
                            <option
                              key={term.id}
                              value={term.id}
                            >
                              {term.name}
                              {term.is_current
                                ? " (Current)"
                                : ""}
                            </option>
                          ))}
                        </select>

                        {loadingTerms && (
                          <Loader2
                            size={17}
                            className="
                              absolute
                              right-4
                              top-1/2
                              -translate-y-1/2
                              animate-spin
                              text-primary
                            "
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Class */}

                  <div>
                    <label
                      htmlFor="class_level"
                      className="mb-2 block text-sm font-medium"
                    >
                      Class
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <GraduationCap
                        size={18}
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-primary
                        "
                      />

                      <select
                        id="class_level"
                        name="class_level"
                        value={form.class_level}
                        onChange={handleChange}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-background
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-text
                          outline-none
                          transition
                          focus:border-primary
                          focus:ring-2
                          focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          dark:border-gray-700
                        "
                      >
                        <option value="">
                          Select class
                        </option>

                        {classes.map((classLevel) => (
                          <option
                            key={classLevel.id}
                            value={classLevel.id}
                          >
                            {classLevel.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* -----------------------------------------------
                  EXAMINATION PERIOD
              ----------------------------------------------- */}

              <section
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-card
                  shadow-sm
                  dark:border-gray-700
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-gray-200
                    px-5
                    py-4
                    dark:border-gray-700
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-secondary/10
                      text-secondary
                    "
                  >
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Examination Period
                    </h2>

                    <p className="text-xs text-text/50">
                      Define when the examination will take
                      place.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Start Date */}

                    <div>
                      <label
                        htmlFor="start_date"
                        className="mb-2 block text-sm font-medium"
                      >
                        Start Date
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={handleChange}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-background
                          px-4
                          py-3
                          text-sm
                          text-text
                          outline-none
                          transition
                          focus:border-primary
                          focus:ring-2
                          focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          dark:border-gray-700
                        "
                      />
                    </div>

                    {/* End Date */}

                    <div>
                      <label
                        htmlFor="end_date"
                        className="mb-2 block text-sm font-medium"
                      >
                        End Date
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={form.end_date}
                        onChange={handleChange}
                        min={form.start_date || undefined}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-background
                          px-4
                          py-3
                          text-sm
                          text-text
                          outline-none
                          transition
                          focus:border-primary
                          focus:ring-2
                          focus:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          dark:border-gray-700
                        "
                      />
                    </div>
                  </div>

                  {/* Description */}

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium"
                    >
                      Description
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Enter any additional information about this examination..."
                      disabled={saving}
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-gray-200
                        bg-background
                        px-4
                        py-3
                        text-sm
                        text-text
                        outline-none
                        transition
                        placeholder:text-text/40
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-gray-700
                      "
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                SETTINGS SIDEBAR
            ================================================= */}

            <div className="space-y-6">
              <section
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-card
                  shadow-sm
                  dark:border-gray-700
                "
              >
                <div
                  className="
                    border-b
                    border-gray-200
                    px-5
                    py-4
                    dark:border-gray-700
                  "
                >
                  <h2 className="font-semibold">
                    Examination Status
                  </h2>

                  <p className="mt-1 text-xs text-text/50">
                    Control the availability of this
                    examination.
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  {/* Active */}

                  <label
                    className="
                      flex
                      cursor-pointer
                      items-start
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      disabled={saving}
                      className="
                        mt-1
                        h-4
                        w-4
                        rounded
                        border-gray-300
                        text-primary
                        accent-[var(--color-primary)]
                        focus:ring-primary
                        dark:border-gray-600
                      "
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Active
                      </p>

                      <p className="mt-1 text-xs text-text/50">
                        Keep this examination active in the
                        system.
                      </p>
                    </div>
                  </label>

                  {/* Published */}

                  <label
                    className="
                      flex
                      cursor-pointer
                      items-start
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={form.is_published}
                      onChange={handleChange}
                      disabled={saving}
                      className="
                        mt-1
                        h-4
                        w-4
                        rounded
                        border-gray-300
                        text-primary
                        accent-[var(--color-primary)]
                        focus:ring-primary
                        dark:border-gray-600
                      "
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Published
                      </p>

                      <p className="mt-1 text-xs text-text/50">
                        Make the examination schedule visible
                        to permitted users.
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              {/* =================================================
                  INFORMATION CARD
              ================================================= */}

              <section
                className="
                  rounded-2xl
                  border
                  border-primary/20
                  bg-primary/5
                  p-5
                  dark:border-primary/30
                  dark:bg-primary/10
                "
              >
                <div className="flex gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-primary/10
                      text-primary
                    "
                  >
                    <ClipboardList size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      What happens next?
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-text/60">
                      After creating the examination, you
                      can add the individual subjects and
                      define their examination dates, times,
                      venues, maximum scores and pass marks.
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating Examination...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Examination
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-200
                    bg-card
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-text
                    transition
                    hover:border-primary
                    hover:text-primary
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-gray-700
                  "
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}