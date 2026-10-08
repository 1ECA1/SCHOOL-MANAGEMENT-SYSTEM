import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://127.0.0.1:8000";

// =====================================================
// SMALL COMPONENTS
// =====================================================

function StatCard({ title, value, subtitle, icon, iconBg }) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-text/60">{title}</p>

          <h3 className="text-3xl font-bold tracking-tight text-text">
            {value}
          </h3>

          <p className="mt-2 text-xs text-text/40">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-text">{title}</h2>

        {subtitle && <p className="mt-1 text-sm text-text/60">{subtitle}</p>}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// =====================================================
// RECENT EXAMINATION ACTIVITY
// =====================================================

function RecentActivity({ examinations, onViewAll }) {
  const recentExaminations = [...examinations]
    .sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Recent Examination Activity"
        subtitle="Latest activities from the examination office"
        action="View All"
        onAction={onViewAll}
      />

      <div className="space-y-4">
        {recentExaminations.length === 0 ? (
          <div className="rounded-2xl border border-text/10 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
              📝
            </div>

            <p className="mt-3 text-sm font-semibold text-text">
              No examinations yet
            </p>

            <p className="mt-1 text-xs text-text/50">
              Create an examination to see recent activity here.
            </p>
          </div>
        ) : (
          recentExaminations.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center gap-4 rounded-2xl border border-text/10 p-3 transition hover:bg-primary/5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                📝
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">
                  {exam.name || "Examination"}
                </p>

                <p className="truncate text-xs text-text/60">
                  {exam.class_level_name || "Class not specified"}
                  {" • "}
                  {exam.term_name || "Term not specified"}
                </p>
              </div>

              <span className="shrink-0 text-[11px] text-text/40">
                {exam.start_date || "No date"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =====================================================
// EXAMINATION STATUS
// =====================================================

function ExaminationStatus({ examinations }) {
  const today = new Date();

  const scheduled = examinations.filter((exam) => {
    if (!exam.start_date) return false;

    return new Date(exam.start_date) > today;
  }).length;

  const ongoing = examinations.filter((exam) => {
    if (!exam.start_date || !exam.end_date) {
      return false;
    }

    const start = new Date(exam.start_date);
    const end = new Date(exam.end_date);

    return start <= today && today <= end;
  }).length;

  const completed = examinations.filter((exam) => {
    if (!exam.end_date) return false;

    return new Date(exam.end_date) < today;
  }).length;

  const total = examinations.length || 1;

  const statistics = [
    {
      label: "Scheduled",
      value: scheduled,
      percentage: (scheduled / total) * 100,
    },
    {
      label: "Ongoing",
      value: ongoing,
      percentage: (ongoing / total) * 100,
    },
    {
      label: "Completed",
      value: completed,
      percentage: (completed / total) * 100,
    },
  ];

  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Examination Status"
        subtitle="Current examination activities"
      />

      <div className="space-y-5">
        {statistics.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text/70">
                {item.label}
              </span>

              <span className="text-sm font-bold text-text">{item.value}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-text/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// RESULT PROCESSING
// =====================================================

function ResultProcessing({ resultCount }) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Result Processing"
        subtitle="Student result processing overview"
      />

      <div className="rounded-2xl bg-primary/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          📊
        </div>

        <p className="mt-3 text-sm font-semibold text-text">
          {resultCount} result
          {resultCount === 1 ? "" : "s"} recorded
        </p>

        <p className="mt-1 text-xs leading-5 text-text/50">
          Result entry, verification, approval, and processing will be connected
          here.
        </p>
      </div>
    </div>
  );
}

// =====================================================
// QUICK ACTIONS
// =====================================================

function QuickActions({ navigate }) {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <SectionHeader
        title="Quick Actions"
        subtitle="Common examination office tasks"
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/exam-officer/examinations")}
          className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary hover:bg-primary/5"
        >
          <span className="text-xl">📝</span>

          <p className="mt-2 text-sm font-semibold text-text">Examinations</p>

          <p className="mt-1 text-[11px] text-text/40">Manage examinations</p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/exam-officer/results")}
          className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary hover:bg-primary/5"
        >
          <span className="text-xl">📊</span>

          <p className="mt-2 text-sm font-semibold text-text">Results</p>

          <p className="mt-1 text-[11px] text-text/40">
            Enter and manage results
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/exam-officer/students")}
          className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary hover:bg-primary/5"
        >
          <span className="text-xl">👥</span>

          <p className="mt-2 text-sm font-semibold text-text">Students</p>

          <p className="mt-1 text-[11px] text-text/40">
            View assessment students
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/exam-officer/report-cards")}
          className="rounded-2xl border border-text/10 p-4 text-left transition hover:border-primary hover:bg-primary/5"
        >
          <span className="text-xl">📄</span>

          <p className="mt-2 text-sm font-semibold text-text">Report Cards</p>

          <p className="mt-1 text-[11px] text-text/40">Generate report cards</p>
        </button>
      </div>
    </div>
  );
}

// =====================================================
// EXAMINATION NOTICE
// =====================================================

function ExaminationNotice() {
  return (
    <div className="rounded-3xl border border-text/10 bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-lg">
          📢
        </div>

        <div>
          <h2 className="text-lg font-bold text-text">Examination Notice</h2>

          <p className="text-xs text-text/40">Important information</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-text/70">
        Examination schedules, result submission deadlines, assessment updates,
        and other important examination notices will appear here.
      </p>
    </div>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

function ExamOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [examinations, setExaminations] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [reportCardCount, setReportCardCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const examOfficerName = useMemo(() => {
    return (
      user?.first_name || user?.firstName || user?.username || "Exam Officer"
    );
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("access_token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // ============================================
        // FETCH EXAMINATIONS
        // ============================================

        const examinationResponse = await fetch(
          `${API_BASE_URL}/api/examinations/`,
          {
            headers,
          },
        );

        if (!examinationResponse.ok) {
          throw new Error("Failed to load examinations.");
        }

        const examinationData = await examinationResponse.json();

        setExaminations(
          Array.isArray(examinationData)
            ? examinationData
            : examinationData.results || [],
        );

        // ============================================
        // FETCH STUDENTS
        // ============================================

        const studentResponse = await fetch(`${API_BASE_URL}/api/students/`, {
          headers,
        });

        if (!studentResponse.ok) {
          throw new Error("Failed to load students.");
        }

        const studentData = await studentResponse.json();

        if (Array.isArray(studentData)) {
          setStudentCount(studentData.length);
        } else {
          setStudentCount(
            studentData.count ?? studentData.results?.length ?? 0,
          );
        }

        // ============================================
        // FETCH REPORT CARDS
        // ============================================

        const reportCardResponse = await fetch(
          `${API_BASE_URL}/api/results/report-cards/`,
          {
            headers,
          },
        );

        if (!reportCardResponse.ok) {
          throw new Error("Failed to load report cards.");
        }

        const reportCardData = await reportCardResponse.json();

        if (Array.isArray(reportCardData)) {
          setReportCardCount(reportCardData.length);
        } else {
          setReportCardCount(
            reportCardData.count ?? reportCardData.results?.length ?? 0,
          );
        }

        // ============================================
        // FETCH RESULTS
        // ============================================

        const resultResponse = await fetch(
          `${API_BASE_URL}/api/results/student-results/`,
          {
            headers,
          },
        );

        if (!resultResponse.ok) {
          throw new Error("Failed to load student results.");
        }

        const resultData = await resultResponse.json();

        if (Array.isArray(resultData)) {
          setResultCount(resultData.length);
        } else {
          setResultCount(resultData.count ?? resultData.results?.length ?? 0);
        }
      } catch (error) {
        console.error("Failed to load Exam Officer dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const totalExaminations = examinations.length;
  const totalStudents = studentCount;
  const totalResults = resultCount;
  const totalReportCards = reportCardCount;

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            WELCOME BANNER
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-white/70">
                Examination Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {examOfficerName}! 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage examinations, process student results, prepare report
                cards, and maintain accurate academic assessment records for
                your school.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/exam-officer/examinations")}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-white/90"
            >
              + Create Examination
            </button>
          </div>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Examinations"
            value={loading ? "..." : totalExaminations}
            subtitle="Scheduled examinations"
            icon="📝"
            iconBg="bg-primary/10"
          />

          <StatCard
            title="Results"
            value={loading ? "..." : totalResults}
            subtitle="Results processed"
            icon="📊"
            iconBg="bg-secondary/10"
          />

          <StatCard
            title="Report Cards"
            value={loading ? "..." : totalReportCards}
            subtitle="Generated report cards"
            icon="📄"
            iconBg="bg-primary/10"
          />

          <StatCard
            title="Students"
            value={loading ? "..." : totalStudents}
            subtitle="Students under assessment"
            icon="👥"
            iconBg="bg-secondary/10"
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT / MAIN */}

          <div className="space-y-6 xl:col-span-2">
            <RecentActivity
              examinations={examinations}
              onViewAll={() => navigate("/exam-officer/examinations")}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ExaminationStatus examinations={examinations} />

              <ResultProcessing resultCount={totalResults} />
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            <QuickActions navigate={navigate} />

            <ExaminationNotice />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamOfficerDashboard;
