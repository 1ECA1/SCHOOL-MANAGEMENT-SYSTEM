
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTerm,
  getSessions,
} from "../../../services/academicsService";

const TermDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const termsPath = "/school-admin/academics/terms";

  // =====================================================
  // LOAD TERM DETAILS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [termData, sessionData] = await Promise.all([
          getTerm(id),
          getSessions(),
        ]);

        if (cancelled) return;

        setTerm(termData);

        const sessionList = Array.isArray(sessionData)
          ? sessionData
          : sessionData?.results ?? [];

        setSessions(sessionList);
      } catch (err) {
        console.error("Failed to load term:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load term details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================================
  // GET ACADEMIC SESSION
  // =====================================================

  const getSession = () => {
    if (!term) return null;

    const sessionId =
      typeof term.academic_session === "object"
        ? term.academic_session?.id
        : term.academic_session;

    return sessions.find(
      (session) => Number(session.id) === Number(sessionId)
    ) || (
      typeof term.academic_session === "object"
        ? term.academic_session
        : null
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const session = getSession();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-[var(--color-text)] opacity-70">
        <Loader2
          size={22}
          className="animate-spin text-[var(--color-primary)]"
        />
        <span className="text-sm">Loading term details...</span>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !term) {
    return (
      <div className="min-h-full bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(termsPath)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] opacity-75 transition hover:opacity-100"
          >
            <ArrowLeft size={18} />
            Back to Terms
          </button>

          <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
            Term Details
          </h1>

          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error || "Term not found."}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(termsPath)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] opacity-75 transition hover:opacity-100"
          >
            <ArrowLeft size={18} />
            Back to Terms
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
                {term.name || "Term Details"}
              </h1>

              <p className="mt-2 text-sm text-[var(--color-text)] opacity-70">
                Term details and information.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`${termsPath}/${term.id}/edit`)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <Pencil size={16} />
              Edit Term
            </button>
          </div>
        </div>

        {/* TERM INFORMATION */}

        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm sm:p-7">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
            Term Information
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {/* TERM NAME */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Term Name
              </p>

              <p className="mt-1 font-medium text-[var(--color-text)]">
                {term.name || "—"}
              </p>
            </div>

            {/* ACADEMIC SESSION */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Academic Session
              </p>

              <p className="mt-1 font-medium text-[var(--color-text)]">
                {session?.name || "—"}
              </p>
            </div>

            {/* START DATE */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Start Date
              </p>

              <p className="mt-1 font-medium text-[var(--color-text)]">
                {formatDate(term.start_date)}
              </p>
            </div>

            {/* END DATE */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                End Date
              </p>

              <p className="mt-1 font-medium text-[var(--color-text)]">
                {formatDate(term.end_date)}
              </p>
            </div>

            {/* CURRENT STATUS */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Current Term
              </p>

              <div className="mt-2">
                {term.is_current ? (
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Current
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Not Current
                  </span>
                )}
              </div>
            </div>

            {/* ACTIVE STATUS */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Status
              </p>

              <div className="mt-2">
                {term.is_active ? (
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* CREATED DATE */}

            <div>
              <p className="text-sm text-[var(--color-text)] opacity-65">
                Created
              </p>

              <p className="mt-1 font-medium text-[var(--color-text)]">
                {term.created_at
                  ? new Date(term.created_at).toLocaleString("en-GB")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate(termsPath)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-100"
          >
            <ArrowLeft size={17} />
            Back to Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermDetails;