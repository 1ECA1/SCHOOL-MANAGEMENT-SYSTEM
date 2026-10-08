
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudentResults,
  deleteStudentResult,
} from "../../services/resultsService";

const AllResults = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentResults();

      setResults(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load student results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const filteredResults = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return results;
    }

    return results.filter((result) =>
      [
        result.student_name,
        result.subject_name,
        result.examination_name,
        result.grade,
        result.remark,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(value)
        ),
    );
  }, [results, search]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this result?",
    );

    if (!confirmed) return;

    try {
      await deleteStudentResult(id);

      setResults((current) =>
        current.filter((result) => result.id !== id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to delete result."
      );
    }
  };

  return (
    <div className="min-h-full bg-background p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Results
          </h1>

          <p className="mt-1 text-text/60">
            Manage student examination results
          </p>
        </div>

        <button
          onClick={() => navigate("add")}
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:opacity-90"
        >
          + Enter Result
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-6 rounded-xl border border-text/10 bg-card p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search student, subject, examination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-text/10 bg-background px-4 py-2.5 text-text outline-none placeholder:text-text/40 focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-96"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-primary">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-xl border border-text/10 bg-card p-10 text-center text-text/60 shadow-sm">
          Loading results...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="rounded-xl border border-text/10 bg-card p-10 text-center shadow-sm">
          <div className="mb-3 text-4xl">📊</div>

          <h2 className="text-lg font-semibold text-text">
            No results found
          </h2>

          <p className="mt-1 text-text/60">
            Enter a student's result to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-text/10 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-text/10 bg-background">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-text/60">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-text/60">
                    Examination
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-text/60">
                    Subject
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-text/60">
                    CA
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-text/60">
                    Exam
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-text/60">
                    Total
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-text/60">
                    Grade
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold text-text/60">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-text/60">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-text/10">
                {filteredResults.map((result) => (
                  <tr
                    key={result.id}
                    className="transition hover:bg-background"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-text">
                        {result.student_name || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-text/70">
                      {result.examination_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-text/70">
                      {result.subject_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-center text-text">
                      {result.ca_score}
                    </td>

                    <td className="px-5 py-4 text-center text-text">
                      {result.exam_score}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold text-text">
                      {result.total_score}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-text">
                        {result.grade || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          result.is_published
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {result.is_published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`${result.id}/edit`)
                          }
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/20"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(result.id)
                          }
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/20"
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
        </div>
      )}
    </div>
  );
};

export default AllResults;
