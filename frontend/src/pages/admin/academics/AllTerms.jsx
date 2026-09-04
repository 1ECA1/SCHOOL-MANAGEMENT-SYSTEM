import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTerms,
  deleteTerm,
  updateTerm,
  getSchools,
  getSessions,
} from "../../../services/academicsService";

const AllTerms = () => {
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return sessions.find((session) => Number(session.id) === Number(sessionId));
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

      setTerms((prev) => prev.filter((term) => term.id !== id));
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
        prev.map((item) => (item.id === term.id ? updatedTerm : item)),
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
      <div className="py-10 text-center text-slate-500">Loading terms...</div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Terms</h1>

          <p className="text-sm text-slate-500">Manage academic terms.</p>
        </div>

        <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Terms</h1>

          <p className="text-sm text-slate-500">Manage academic terms.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/terms/add")}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Add Term
        </button>
      </div>

      {/* TERMS TABLE */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {terms.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No terms found.</p>

            <button
              type="button"
              onClick={() => navigate("/admin/terms/add")}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Add your first term
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Term
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Academic Session
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    School
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {terms.map((term) => (
                  <tr key={term.id} className="hover:bg-slate-50">
                    {/* TERM */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{term.name}</p>
                    </td>

                    {/* ACADEMIC SESSION */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getSessionName(term.academic_session)}
                    </td>

                    {/* SCHOOL */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getSchoolName(term.academic_session)}
                    </td>

                    {/* START DATE */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {term.start_date || "—"}
                    </td>

                    {/* END DATE */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {term.end_date || "—"}
                    </td>

                    {/* CURRENT */}
                    <td className="px-6 py-4">
                      {term.is_current ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Current
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          No
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(term)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          term.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {term.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/terms/${term.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/terms/${term.id}/edit`)
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(term.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
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
        )}
      </div>
    </div>
  );
};

export default AllTerms;
