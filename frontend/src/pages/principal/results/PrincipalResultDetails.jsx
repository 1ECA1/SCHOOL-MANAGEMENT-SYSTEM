import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  Pencil,
  XCircle,
} from "lucide-react";

import {
  getStudentResult,
  getStudentResults,
  getReportCards,
} from "../../../services/resultsService";

import {
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ==========================================================
// HELPERS
// ==========================================================

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getId(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return String(value.id ?? value.pk ?? "");
  }
  return String(value);
}

function formatScore(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/\.?0+$/, "");
}

// ==========================================================
// COMPONENT
// ==========================================================

export default function PrincipalResultDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedResult, setSelectedResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          resultResponse,
          resultsResponse,
          reportCardsResponse,
          examinationsResponse,
          examinationSubjectsResponse,
          sessionsResponse,
          termsResponse,
          classLevelsResponse,
        ] = await Promise.all([
          getStudentResult(id),
          getStudentResults(),
          getReportCards(),
          getExaminations(),
          getExaminationSubjects(),
          getSessions(),
          getTerms(),
          getClassLevels(),
        ]);

        if (!mounted) return;

        setSelectedResult(resultResponse?.data ?? resultResponse);
        setAllResults(extractList(resultsResponse));
        setReportCards(extractList(reportCardsResponse));
        setExaminations(extractList(examinationsResponse));
        setExaminationSubjects(
          extractList(examinationSubjectsResponse)
        );
        setSessions(extractList(sessionsResponse));
        setTerms(extractList(termsResponse));
        setClassLevels(extractList(classLevelsResponse));
      } catch (err) {
        console.error("Failed to load result details:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load result details."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // LOOKUP MAPS
  // ==========================================================

  const examinationMap = useMemo(() => {
    const map = {};

    examinations.forEach((item) => {
      map[getId(item)] = item;
    });

    return map;
  }, [examinations]);

  const examinationSubjectMap = useMemo(() => {
    const map = {};

    examinationSubjects.forEach((item) => {
      map[getId(item)] = item;
    });

    return map;
  }, [examinationSubjects]);

  const sessionMap = useMemo(() => {
    const map = {};

    sessions.forEach((item) => {
      map[getId(item)] = item;
    });

    return map;
  }, [sessions]);

  const termMap = useMemo(() => {
    const map = {};

    terms.forEach((item) => {
      map[getId(item)] = item;
    });

    return map;
  }, [terms]);

  const classMap = useMemo(() => {
    const map = {};

    classLevels.forEach((item) => {
      map[getId(item)] = item;
    });

    return map;
  }, [classLevels]);

  // ==========================================================
  // RESULT CONTEXT
  // ==========================================================

  const context = useMemo(() => {
    if (!selectedResult) {
      return {
        studentId: "",
        studentName: "Student",
        admissionNumber: "—",
        examinationId: "",
        examinationName: "—",
        sessionId: "",
        sessionName: "—",
        termId: "",
        termName: "—",
        classId: "",
        className: "—",
      };
    }

    const student =
      selectedResult.student_detail ||
      selectedResult.student ||
      {};

    const examinationId = getId(
      selectedResult.examination ||
        selectedResult.examination_id
    );

    const sessionId = getId(
      selectedResult.academic_session ||
        selectedResult.session ||
        selectedResult.academic_session_id
    );

    const termId = getId(
      selectedResult.term ||
        selectedResult.term_id
    );

    const classId = getId(
      selectedResult.class_level ||
        selectedResult.class_level_id
    );

    const examination =
      examinationMap[examinationId] ||
      selectedResult.examination_detail ||
      {};

    const session =
      sessionMap[sessionId] ||
      selectedResult.academic_session_detail ||
      {};

    const term =
      termMap[termId] ||
      selectedResult.term_detail ||
      {};

    const classLevel =
      classMap[classId] ||
      selectedResult.class_level_detail ||
      {};

    const studentName =
      student.full_name ||
      student.name ||
      [
        student.first_name,
        student.middle_name,
        student.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      selectedResult.student_name ||
      "Student";

    return {
      studentId: getId(
        selectedResult.student ||
          selectedResult.student_id
      ),

      studentName,

      admissionNumber:
        student.admission_number ||
        selectedResult.admission_number ||
        "—",

      examinationId,

      examinationName:
        examination.name ||
        examination.title ||
        selectedResult.examination_name ||
        "—",

      sessionId,

      sessionName:
        session.name ||
        session.session_name ||
        selectedResult.session_name ||
        "—",

      termId,

      termName:
        term.name ||
        term.term_name ||
        selectedResult.term_name ||
        "—",

      classId,

      className:
        classLevel.name ||
        classLevel.class_name ||
        selectedResult.class_name ||
        "—",
    };
  }, [
    selectedResult,
    examinationMap,
    sessionMap,
    termMap,
    classMap,
  ]);

  // ==========================================================
  // STUDENT RESULTS
  // ==========================================================

  const studentResults = useMemo(() => {
    if (!selectedResult) return [];

    const targetStudentId = context.studentId;
    const targetExaminationId = context.examinationId;
    const targetSessionId = context.sessionId;
    const targetTermId = context.termId;
    const targetClassId = context.classId;

    return allResults
      .filter((result) => {
        const resultStudentId = getId(
          result.student || result.student_id
        );

        const resultExaminationId = getId(
          result.examination ||
            result.examination_id
        );

        const resultSessionId = getId(
          result.academic_session ||
            result.session ||
            result.academic_session_id
        );

        const resultTermId = getId(
          result.term || result.term_id
        );

        const resultClassId = getId(
          result.class_level ||
            result.class_level_id
        );

        if (
          targetStudentId &&
          resultStudentId !== targetStudentId
        ) {
          return false;
        }

        if (
          targetExaminationId &&
          resultExaminationId !== targetExaminationId
        ) {
          return false;
        }

        if (
          targetSessionId &&
          resultSessionId !== targetSessionId
        ) {
          return false;
        }

        if (
          targetTermId &&
          resultTermId !== targetTermId
        ) {
          return false;
        }

        if (
          targetClassId &&
          resultClassId !== targetClassId
        ) {
          return false;
        }

        return true;
      })
      .map((result) => {
        const examinationSubjectId = getId(
          result.examination_subject ||
            result.examination_subject_id
        );

        const examinationSubject =
          examinationSubjectMap[examinationSubjectId] ||
          result.examination_subject_detail ||
          {};

        const subject =
          examinationSubject.subject_detail ||
          examinationSubject.subject ||
          result.subject_detail ||
          result.subject ||
          {};

        return {
          ...result,
          _subjectName:
            subject.name ||
            subject.subject_name ||
            result.subject_name ||
            examinationSubject.subject_name ||
            "Unknown Subject",
        };
      });
  }, [
    selectedResult,
    allResults,
    context,
    examinationSubjectMap,
  ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const totalScore = studentResults.reduce(
      (total, result) => {
        const score =
          Number(
            result.total_score ??
              result.score ??
              result.final_score ??
              0
          ) || 0;

        return total + score;
      },
      0
    );

    const average =
      studentResults.length > 0
        ? totalScore / studentResults.length
        : 0;

    const publishedCount = studentResults.filter(
      (result) =>
        result.is_published === true ||
        result.status === "PUBLISHED"
    ).length;

    return {
      totalSubjects: studentResults.length,
      totalScore,
      average,
      publishedCount,
    };
  }, [studentResults]);

  // ==========================================================
  // REPORT CARD
  // ==========================================================

  const matchingReportCard = useMemo(() => {
    if (!selectedResult) return null;

    return (
      reportCards.find((reportCard) => {
        const reportStudentId = getId(
          reportCard.student ||
            reportCard.student_id
        );

        const reportSessionId = getId(
          reportCard.academic_session ||
            reportCard.session ||
            reportCard.academic_session_id
        );

        const reportTermId = getId(
          reportCard.term ||
            reportCard.term_id
        );

        const reportClassId = getId(
          reportCard.class_level ||
            reportCard.class_level_id
        );

        return (
          reportStudentId === context.studentId &&
          reportSessionId === context.sessionId &&
          reportTermId === context.termId &&
          reportClassId === context.classId
        );
      }) || null
    );
  }, [
    reportCards,
    selectedResult,
    context,
  ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-70">
          <Loader2
            size={22}
            className="animate-spin"
          />
          <span>Loading result details...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !selectedResult) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-[var(--color-card)] p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
              <XCircle size={28} />
            </div>

            <h2 className="text-xl font-bold">
              Unable to Load Result
            </h2>

            <p className="mt-2 text-sm opacity-70">
              {error || "The requested result could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/principal/results")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={16} />
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ==================================================
            TOP ACTIONS
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/principal/results")}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            Back to Results
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/principal/results/${id}/edit`)
            }
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Pencil size={16} />
            Edit Result
          </button>
        </div>

        {/* ==================================================
            HEADER CARD
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">

          <div className="border-b border-black/5 p-5 dark:border-white/10 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <FileText size={24} />
                </div>

                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">
                    Student Result
                  </h1>

                  <p className="mt-1 text-sm opacity-60">
                    {context.examinationName}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--color-background)] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide opacity-50">
                  Student
                </p>

                <p className="mt-1 font-semibold">
                  {context.studentName}
                </p>

                <p className="text-sm opacity-60">
                  {context.admissionNumber}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <InfoItem
              label="Class"
              value={context.className}
            />

            <InfoItem
              label="Academic Session"
              value={context.sessionName}
            />

            <InfoItem
              label="Term"
              value={context.termName}
            />

            <InfoItem
              label="Examination"
              value={context.examinationName}
            />
          </div>
        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <SummaryCard
            icon={<FileText size={20} />}
            label="Subjects"
            value={summary.totalSubjects}
          />

          <SummaryCard
            icon={<CheckCircle size={20} />}
            label="Total Score"
            value={formatScore(summary.totalScore)}
          />

          <SummaryCard
            icon={<CheckCircle size={20} />}
            label="Average"
            value={formatScore(summary.average)}
          />

          <SummaryCard
            icon={<CheckCircle size={20} />}
            label="Published"
            value={`${summary.publishedCount}/${summary.totalSubjects}`}
          />
        </div>

        {/* ==================================================
            SUBJECT RESULTS
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">

          <div className="border-b border-black/5 p-5 dark:border-white/10">
            <h2 className="text-lg font-bold">
              Subject Results
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Detailed scores for each subject.
            </p>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-background)]">
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="px-5 py-4 font-semibold">
                    #
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Subject
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    CA
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Exam
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Total
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {studentResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center opacity-60"
                    >
                      No subject results found.
                    </td>
                  </tr>
                ) : (
                  studentResults.map((result, index) => {
                    const ca =
                      Number(
                        result.ca_score ??
                          result.continuous_assessment ??
                          result.ca ??
                          0
                      ) || 0;

                    const exam =
                      Number(
                        result.exam_score ??
                          result.examination_score ??
                          result.exam ??
                          0
                      ) || 0;

                    const total =
                      Number(
                        result.total_score ??
                          result.score ??
                          result.final_score ??
                          ca + exam
                      ) || 0;

                    const isPublished =
                      result.is_published === true ||
                      result.status === "PUBLISHED";

                    return (
                      <tr
                        key={result.id || index}
                        className="border-b border-black/5 last:border-0 dark:border-white/10"
                      >
                        <td className="px-5 py-4 opacity-60">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {result._subjectName}
                        </td>

                        <td className="px-5 py-4">
                          {formatScore(ca)}
                        </td>

                        <td className="px-5 py-4">
                          {formatScore(exam)}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {formatScore(total)}
                        </td>

                        <td className="px-5 py-4">
                          {isPublished ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                              <CheckCircle size={13} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                              <XCircle size={13} />
                              Unpublished
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="space-y-3 p-4 md:hidden">
            {studentResults.length === 0 ? (
              <div className="py-10 text-center text-sm opacity-60">
                No subject results found.
              </div>
            ) : (
              studentResults.map((result, index) => {
                const ca =
                  Number(
                    result.ca_score ??
                      result.continuous_assessment ??
                      result.ca ??
                      0
                  ) || 0;

                const exam =
                  Number(
                    result.exam_score ??
                      result.examination_score ??
                      result.exam ??
                      0
                  ) || 0;

                const total =
                  Number(
                    result.total_score ??
                      result.score ??
                      result.final_score ??
                      ca + exam
                  ) || 0;

                const isPublished =
                  result.is_published === true ||
                  result.status === "PUBLISHED";

                return (
                  <div
                    key={result.id || index}
                    className="rounded-xl border border-black/5 bg-[var(--color-background)] p-4 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs opacity-50">
                          Subject {index + 1}
                        </p>

                        <h3 className="mt-1 font-bold">
                          {result._subjectName}
                        </h3>
                      </div>

                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                          <CheckCircle size={12} />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <XCircle size={12} />
                          Unpublished
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <ScoreBox
                        label="CA"
                        value={formatScore(ca)}
                      />

                      <ScoreBox
                        label="Exam"
                        value={formatScore(exam)}
                      />

                      <ScoreBox
                        label="Total"
                        value={formatScore(total)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================
            REPORT CARD
        ================================================== */}

        {matchingReportCard && (
          <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">

            <div className="border-b border-black/5 p-5 dark:border-white/10">
              <h2 className="text-lg font-bold">
                Overall Performance
              </h2>

              <p className="mt-1 text-sm opacity-60">
                Report card summary for this student.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Position"
                value={
                  matchingReportCard.position ??
                  matchingReportCard.class_position ??
                  "—"
                }
              />

              <InfoItem
                label="Average"
                value={
                  matchingReportCard.average ??
                  matchingReportCard.average_score ??
                  "—"
                }
              />

              <InfoItem
                label="Grade"
                value={
                  matchingReportCard.grade ??
                  "—"
                }
              />

              <InfoItem
                label="Class Average"
                value={
                  matchingReportCard.class_average ??
                  "—"
                }
              />
            </div>

            {(matchingReportCard.comments ||
              matchingReportCard.teacher_comment ||
              matchingReportCard.principal_comment) && (
              <div className="border-t border-black/5 p-5 dark:border-white/10">
                <div className="space-y-4">

                  {matchingReportCard.comments && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                        Comments
                      </p>

                      <p className="mt-1 text-sm">
                        {matchingReportCard.comments}
                      </p>
                    </div>
                  )}

                  {matchingReportCard.teacher_comment && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                        Teacher Comment
                      </p>

                      <p className="mt-1 text-sm">
                        {matchingReportCard.teacher_comment}
                      </p>
                    </div>
                  )}

                  {matchingReportCard.principal_comment && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                        Principal Comment
                      </p>

                      <p className="mt-1 text-sm">
                        {matchingReportCard.principal_comment}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================================
// INFO ITEM
// ==========================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}

// ==========================================================
// SUMMARY CARD
// ==========================================================

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-4 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {icon}
        </div>

        <p className="text-2xl font-bold">
          {value}
        </p>
      </div>

      <p className="mt-3 text-sm opacity-60">
        {label}
      </p>
    </div>
  );
}

// ==========================================================
// SCORE BOX
// ==========================================================

function ScoreBox({ label, value }) {
  return (
    <div className="rounded-lg border border-black/5 bg-[var(--color-card)] p-3 text-center dark:border-white/10">
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-50">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}