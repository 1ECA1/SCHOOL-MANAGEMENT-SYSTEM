import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTerm,
  getSchools,
  getSessions,
} from "../../../services/academicsService";

const TermDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState(null);
  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD TERM DETAILS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [termData, schoolData, sessionData] =
          await Promise.all([
            getTerm(id),
            getSchools(),
            getSessions(),
          ]);

        setTerm(termData);
        setSchools(schoolData);
        setSessions(sessionData);
      } catch (err) {
        console.error("Failed to load term:", err);
        setError("Failed to load term details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =====================================================
  // GET ACADEMIC SESSION
  // =====================================================

  const getSession = () => {
    if (!term) {
      return null;
    }

    return sessions.find(
      (session) =>
        Number(session.id) ===
        Number(term.academic_session),
    );
  };

  // =====================================================
  // GET SCHOOL
  // =====================================================

  const getSchool = () => {
    const session = getSession();

    if (!session) {
      return null;
    }

    return schools.find(
      (school) =>
        Number(school.id) === Number(session.school),
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  };

  const session = getSession();
  const school = getSchool();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading term details...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !term) {
    return (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/terms")}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Terms
          </button>

          <h1 className="text-2xl font-bold text-slate-800">
            Term Details
          </h1>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">
          {error || "Term not found."}
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/terms")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Terms
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {term.name}
            </h1>

            <p className="text-sm text-slate-500">
              Term details and information.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/terms/${term.id}/edit`)
            }
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
          >
            Edit Term
          </button>
        </div>
      </div>

      {/* =================================================
          TERM INFORMATION
      ================================================= */}

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Term Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* TERM NAME */}
          <div>
            <p className="text-sm text-slate-500">
              Term Name
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {term.name || "—"}
            </p>
          </div>

          {/* ACADEMIC SESSION */}
          <div>
            <p className="text-sm text-slate-500">
              Academic Session
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {session?.name || "—"}
            </p>
          </div>

          {/* SCHOOL */}
          <div>
            <p className="text-sm text-slate-500">
              School
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {school?.name || "—"}
            </p>
          </div>

          {/* START DATE */}
          <div>
            <p className="text-sm text-slate-500">
              Start Date
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {formatDate(term.start_date)}
            </p>
          </div>

          {/* END DATE */}
          <div>
            <p className="text-sm text-slate-500">
              End Date
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {formatDate(term.end_date)}
            </p>
          </div>

          {/* CURRENT STATUS */}
          <div>
            <p className="text-sm text-slate-500">
              Current Term
            </p>

            <div className="mt-2">
              {term.is_current ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  Current
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Not Current
                </span>
              )}
            </div>
          </div>

          {/* ACTIVE STATUS */}
          <div>
            <p className="text-sm text-slate-500">
              Status
            </p>

            <div className="mt-2">
              {term.is_active ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* CREATED DATE */}
          <div>
            <p className="text-sm text-slate-500">
              Created
            </p>

            <p className="mt-1 font-medium text-slate-800">
              {term.created_at
                ? new Date(
                    term.created_at,
                  ).toLocaleString("en-GB")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM ACTIONS
      ================================================= */}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => navigate("/admin/terms")}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to Terms
        </button>
      </div>
    </div>
  );
};

export default TermDetails;