import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Edit3,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle2,
  CircleAlert,
  BookOpen,
  MapPin,
  Eye,
  RefreshCw,
} from "lucide-react";

import {
  getExaminations,
  createExamination,
  updateExamination,
  deleteExamination,
  getExaminationSubjects,
  createExaminationSubject,
  updateExaminationSubject,
  deleteExaminationSubject,
} from "../../services/examinationApi";

import {
  getSessions,
  getTerms,
  getClassLevels,
  getClassSubjects,
} from "../../services/academicsService";

function ExamOfficerExaminations() {
  // =====================================================
  // DATA
  // =====================================================

  const [examinations, setExaminations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [examinationSubjects, setExaminationSubjects] = useState([]);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedExamination, setSelectedExamination] = useState(null);

  const [showExaminationModal, setShowExaminationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [editingExamination, setEditingExamination] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const [savingExamination, setSavingExamination] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // EXAMINATION FORM
  // =====================================================

  const emptyExaminationForm = {
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
  };

  const [examinationForm, setExaminationForm] = useState(
    emptyExaminationForm
  );

  // =====================================================
  // SUBJECT FORM
  // =====================================================

  const emptySubjectForm = {
    examination: "",
    subject: "",
    examination_date: "",
    start_time: "",
    end_time: "",
    maximum_score: 100,
    pass_mark: 40,
    venue: "",
  };

  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        examinationsData,
        sessionsData,
        termsData,
        classLevelsData,
        classSubjectsData,
        examinationSubjectsData,
      ] = await Promise.all([
        getExaminations(),
        getSessions(),
        getTerms(),
        getClassLevels(),
        getClassSubjects(),
        getExaminationSubjects(),
      ]);

      setExaminations(Array.isArray(examinationsData) ? examinationsData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setTerms(Array.isArray(termsData) ? termsData : []);
      setClassLevels(
        Array.isArray(classLevelsData) ? classLevelsData : []
      );
      setClassSubjects(
        Array.isArray(classSubjectsData) ? classSubjectsData : []
      );
      setExaminationSubjects(
        Array.isArray(examinationSubjectsData)
          ? examinationSubjectsData
          : []
      );
    } catch (err) {
      console.error("Failed to load examination data:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load examination data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  // =====================================================
  // FILTER EXAMINATIONS
  // =====================================================

  const filteredExaminations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !normalizedSearch ||
        exam.name?.toLowerCase().includes(normalizedSearch) ||
        exam.class_level_name?.toLowerCase().includes(normalizedSearch) ||
        exam.term_name?.toLowerCase().includes(normalizedSearch) ||
        exam.academic_session_name
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && exam.is_published) ||
        (statusFilter === "DRAFT" && !exam.is_published) ||
        (statusFilter === "ACTIVE" && exam.is_active) ||
        (statusFilter === "INACTIVE" && !exam.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [examinations, search, statusFilter]);

  // =====================================================
  // GET SUBJECTS FOR SELECTED EXAMINATION
  // =====================================================

  const selectedExaminationSubjects = useMemo(() => {
    if (!selectedExamination) {
      return [];
    }

    return examinationSubjects.filter(
      (item) =>
        Number(item.examination) === Number(selectedExamination.id)
    );
  }, [selectedExamination, examinationSubjects]);

  // =====================================================
  // GET CLASS SUBJECTS AVAILABLE FOR SELECTED EXAM
  // =====================================================

  const availableClassSubjects = useMemo(() => {
    if (!subjectForm.examination) {
      return [];
    }

    const examination = examinations.find(
      (item) =>
        Number(item.id) === Number(subjectForm.examination)
    );

    if (!examination) {
      return [];
    }

    const alreadyAddedSubjectIds = examinationSubjects
      .filter(
        (item) =>
          Number(item.examination) === Number(examination.id) &&
          Number(item.id) !== Number(editingSubject?.id)
      )
      .map((item) => Number(item.subject));

    return classSubjects.filter((item) => {
      const matchesClass =
        Number(item.class_level) === Number(examination.class_level);

      const isActive = item.is_active !== false;

      const subjectId = Number(item.subject);

      const notAlreadyAdded =
        !alreadyAddedSubjectIds.includes(subjectId);

      return matchesClass && isActive && notAlreadyAdded;
    });
  }, [
    subjectForm.examination,
    examinations,
    classSubjects,
    examinationSubjects,
    editingSubject,
  ]);

  // =====================================================
  // EXAMINATION FORM HANDLER
  // =====================================================

  const handleExaminationChange = (event) => {
    const { name, value, type, checked } = event.target;

    setExaminationForm((previous) => {
      if (name === "academic_session") {
        return {
          ...previous,
          academic_session: value,
          term: "",
        };
      }

      return {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  // =====================================================
  // SUBJECT FORM HANDLER
  // =====================================================

  const handleSubjectChange = (event) => {
    const { name, value } = event.target;

    setSubjectForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN CREATE EXAMINATION
  // =====================================================

  const openCreateExamination = () => {
    setEditingExamination(null);

    const currentSession =
      sessions.find((session) => session.is_current) || sessions[0];

    const currentTerm = currentSession
      ? terms.find(
          (term) =>
            Number(term.academic_session) === Number(currentSession.id) &&
            term.is_current
        )
      : null;

    setExaminationForm({
      ...emptyExaminationForm,
      academic_session: currentSession?.id || "",
      term: currentTerm?.id || "",
    });

    setError("");
    setShowExaminationModal(true);
  };

  // =====================================================
  // OPEN EDIT EXAMINATION
  // =====================================================

  const openEditExamination = (exam) => {
    setEditingExamination(exam);

    setExaminationForm({
      academic_session: exam.academic_session || "",
      term: exam.term || "",
      class_level: exam.class_level || "",
      name: exam.name || "",
      examination_type: exam.examination_type || "TERMINAL",
      start_date: exam.start_date || "",
      end_date: exam.end_date || "",
      description: exam.description || "",
      is_published: Boolean(exam.is_published),
      is_active: exam.is_active !== false,
    });

    setError("");
    setShowExaminationModal(true);
  };

  // =====================================================
  // SAVE EXAMINATION
  // =====================================================

  const handleSaveExamination = async (event) => {
    event.preventDefault();

    try {
      setSavingExamination(true);
      setError("");

      const payload = {
        academic_session: Number(examinationForm.academic_session),
        term: Number(examinationForm.term),
        class_level: Number(examinationForm.class_level),
        name: examinationForm.name.trim(),
        examination_type: examinationForm.examination_type,
        start_date: examinationForm.start_date,
        end_date: examinationForm.end_date,
        description: examinationForm.description.trim(),
        is_published: examinationForm.is_published,
        is_active: examinationForm.is_active,
      };

      if (editingExamination) {
        await updateExamination(editingExamination.id, payload);

        setSuccess("Examination updated successfully.");
      } else {
        await createExamination(payload);

        setSuccess("Examination created successfully.");
      }

      setShowExaminationModal(false);
      setEditingExamination(null);
      setExaminationForm(emptyExaminationForm);

      await loadData(true);
    } catch (err) {
      console.error("Failed to save examination:", err);

      const responseData = err?.response?.data;

      if (typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            responseData?.detail ||
            responseData?.message ||
            "Failed to save examination."
        );
      } else {
        setError("Failed to save examination.");
      }
    } finally {
      setSavingExamination(false);
    }
  };

  // =====================================================
  // DELETE EXAMINATION
  // =====================================================

  const handleDeleteExamination = async (exam) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${exam.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(exam.id);
      setError("");

      await deleteExamination(exam.id);

      if (
        selectedExamination &&
        Number(selectedExamination.id) === Number(exam.id)
      ) {
        setSelectedExamination(null);
        setShowDetailsModal(false);
      }

      setSuccess("Examination deleted successfully.");

      await loadData(true);
    } catch (err) {
      console.error("Failed to delete examination:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete examination."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // OPEN DETAILS
  // =====================================================

  const openDetails = (exam) => {
    setSelectedExamination(exam);
    setShowDetailsModal(true);
  };

  // =====================================================
  // OPEN ADD SUBJECT
  // =====================================================

  const openAddSubject = (exam) => {
    setEditingSubject(null);

    setSelectedExamination(exam);

    setSubjectForm({
      ...emptySubjectForm,
      examination: exam.id,
      examination_date: exam.start_date || "",
    });

    setError("");
    setShowSubjectModal(true);
  };

  // =====================================================
  // OPEN EDIT SUBJECT
  // =====================================================

  const openEditSubject = (subject) => {
    setEditingSubject(subject);

    setSubjectForm({
      examination: subject.examination || "",
      subject: subject.subject || "",
      examination_date: subject.examination_date || "",
      start_time: subject.start_time || "",
      end_time: subject.end_time || "",
      maximum_score: subject.maximum_score ?? 100,
      pass_mark: subject.pass_mark ?? 40,
      venue: subject.venue || "",
    });

    setError("");
    setShowSubjectModal(true);
  };

  // =====================================================
  // SAVE EXAMINATION SUBJECT
  // =====================================================

  const handleSaveSubject = async (event) => {
    event.preventDefault();

    try {
      setSavingSubject(true);
      setError("");

      const payload = {
        examination: Number(subjectForm.examination),
        subject: Number(subjectForm.subject),
        examination_date: subjectForm.examination_date,
        start_time: subjectForm.start_time,
        end_time: subjectForm.end_time,
        maximum_score: Number(subjectForm.maximum_score),
        pass_mark: Number(subjectForm.pass_mark),
        venue: subjectForm.venue.trim(),
      };

      if (editingSubject) {
        await updateExaminationSubject(
          editingSubject.id,
          payload
        );

        setSuccess("Examination subject updated successfully.");
      } else {
        await createExaminationSubject(payload);

        setSuccess("Subject added to examination successfully.");
      }

      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm(emptySubjectForm);

      await loadData(true);
    } catch (err) {
      console.error(
        "Failed to save examination subject:",
        err
      );

      const responseData = err?.response?.data;

      if (typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            responseData?.detail ||
            responseData?.message ||
            "Failed to save examination subject."
        );
      } else {
        setError("Failed to save examination subject.");
      }
    } finally {
      setSavingSubject(false);
    }
  };

  // =====================================================
  // DELETE EXAMINATION SUBJECT
  // =====================================================

  const handleDeleteSubject = async (subject) => {
    const confirmed = window.confirm(
      `Remove "${subject.subject_name}" from this examination?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingSubjectId(subject.id);
      setError("");

      await deleteExaminationSubject(subject.id);

      setSuccess("Examination subject removed successfully.");

      await loadData(true);
    } catch (err) {
      console.error(
        "Failed to delete examination subject:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete examination subject."
      );
    } finally {
      setDeletingSubjectId(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    const [hour, minute] = time.split(":");

    const date = new Date();

    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">
            EXAMINATION OFFICE
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Examinations
          </h1>

          <p className="mt-2 text-sm text-text/60">
            Create and manage school examinations and assessment
            periods.
          </p>
        </div>

        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-text/10 bg-card shadow-sm">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />

            <p className="mt-4 text-sm text-text/60">
              Loading examinations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">
            EXAMINATION OFFICE
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Examinations
          </h1>

          <p className="mt-2 text-sm text-text/60">
            Create and manage school examinations and assessment
            periods.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-text/10 bg-card px-4 py-3 text-sm font-semibold transition hover:bg-text/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateExamination}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Examination
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Something went wrong</p>

            <p className="mt-1">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto rounded-lg p-1 hover:bg-emerald-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text/60">
                Total Examinations
              </p>

              <p className="mt-2 text-3xl font-bold">
                {examinations.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text/60">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  examinations.filter(
                    (exam) => exam.is_active
                  ).length
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text/60">
                Published
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  examinations.filter(
                    (exam) => exam.is_published
                  ).length
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text/60">
                Examination Subjects
              </p>

              <p className="mt-2 text-3xl font-bold">
                {examinationSubjects.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-3xl border border-text/10 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text/40" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search examinations, classes, sessions..."
              className="w-full rounded-xl border border-text/10 bg-background py-3 pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text/50" />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXAMINATIONS */}
      {filteredExaminations.length === 0 ? (
        <div className="rounded-3xl border border-text/10 bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <FileText className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-lg font-bold">
            No examinations found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text/60">
            There are no examinations matching your current
            search or filter.
          </p>

          <button
            type="button"
            onClick={openCreateExamination}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Create Examination
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExaminations.map((exam) => {
            const examSubjectCount =
              examinationSubjects.filter(
                (item) =>
                  Number(item.examination) ===
                  Number(exam.id)
              ).length;

            return (
              <div
                key={exam.id}
                className="rounded-3xl border border-text/10 bg-card p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-bold">
                          {exam.name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            exam.is_published
                              ? "bg-secondary/10 text-secondary"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {exam.is_published
                            ? "Published"
                            : "Draft"}
                        </span>

                        {!exam.is_active && (
                          <span className="rounded-full bg-text/10 px-3 py-1 text-xs font-semibold text-text/60">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text/60">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />

                          {formatDate(exam.start_date)}
                          {" - "}
                          {formatDate(exam.end_date)}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />

                          {exam.class_level_name || "—"}
                        </span>

                        <span>
                          {exam.academic_session_name || "—"}
                        </span>

                        <span>
                          {exam.term_name || "—"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text/50">
                        <span>
                          Type:{" "}
                          <strong className="text-text/70">
                            {exam.examination_type_display ||
                              exam.examination_type}
                          </strong>
                        </span>

                        <span>
                          Subjects:{" "}
                          <strong className="text-text/70">
                            {examSubjectCount}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      onClick={() => openDetails(exam)}
                      className="inline-flex items-center gap-2 rounded-xl border border-text/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-text/5"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditExamination(exam)}
                      className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteExamination(exam)
                      }
                      disabled={deletingId === exam.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />

                      {deletingId === exam.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          EXAMINATION CREATE / EDIT MODAL
          ===================================================== */}

      {showExaminationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-text/10 bg-card shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-text/10 bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  {editingExamination
                    ? "Edit Examination"
                    : "Create Examination"}
                </h2>

                <p className="mt-1 text-sm text-text/60">
                  Configure the examination period and class.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowExaminationModal(false)
                }
                className="rounded-xl p-2 text-text/50 transition hover:bg-text/5 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveExamination}
              className="space-y-6 p-5 sm:p-6"
            >
              {/* SESSION / TERM */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Academic Session
                  </label>

                  <select
                    name="academic_session"
                    value={examinationForm.academic_session}
                    onChange={handleExaminationChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {sessions.map((session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {session.name}
                        {session.is_current
                          ? " — Current"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Term
                  </label>

                  <select
                    name="term"
                    value={examinationForm.term}
                    onChange={handleExaminationChange}
                    required
                    disabled={
                      !examinationForm.academic_session
                    }
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Select term
                    </option>

                    {terms
                      .filter(
                        (term) =>
                          Number(term.academic_session) ===
                          Number(
                            examinationForm.academic_session
                          )
                      )
                      .map((term) => (
                        <option
                          key={term.id}
                          value={term.id}
                        >
                          {term.name}
                          {term.is_current
                            ? " — Current"
                            : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* CLASS / TYPE */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Class
                  </label>

                  <select
                    name="class_level"
                    value={examinationForm.class_level}
                    onChange={handleExaminationChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Select class
                    </option>

                    {classLevels.map((classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Examination Type
                  </label>

                  <select
                    name="examination_type"
                    value={examinationForm.examination_type}
                    onChange={handleExaminationChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="FIRST_CA">
                      First Continuous Assessment
                    </option>

                    <option value="SECOND_CA">
                      Second Continuous Assessment
                    </option>

                    <option value="MID_TERM">
                      Mid-Term Examination
                    </option>

                    <option value="MOCK">
                      Mock Examination
                    </option>

                    <option value="TERMINAL">
                      Terminal Examination
                    </option>

                    <option value="PROMOTION">
                      Promotion Examination
                    </option>

                    <option value="ENTRANCE">
                      Entrance Examination
                    </option>
                  </select>
                </div>
              </div>

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Examination Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={examinationForm.name}
                  onChange={handleExaminationChange}
                  required
                  placeholder="e.g. First Term Examination"
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* DATES */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={examinationForm.start_date}
                    onChange={handleExaminationChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={examinationForm.end_date}
                    onChange={handleExaminationChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={examinationForm.description}
                  onChange={handleExaminationChange}
                  rows={4}
                  placeholder="Optional examination description..."
                  className="w-full resize-none rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* STATUS */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-text/10 bg-background p-4">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={examinationForm.is_published}
                    onChange={handleExaminationChange}
                    className="h-4 w-4 accent-primary"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Publish Examination
                    </p>

                    <p className="mt-1 text-xs text-text/50">
                      Make the examination available as
                      published.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-text/10 bg-background p-4">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={examinationForm.is_active}
                    onChange={handleExaminationChange}
                    className="h-4 w-4 accent-primary"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Active Examination
                    </p>

                    <p className="mt-1 text-xs text-text/50">
                      Keep this examination active.
                    </p>
                  </div>
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-text/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowExaminationModal(false)
                  }
                  className="rounded-xl border border-text/10 px-5 py-3 text-sm font-semibold transition hover:bg-text/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingExamination}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingExamination && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {savingExamination
                    ? "Saving..."
                    : editingExamination
                    ? "Update Examination"
                    : "Create Examination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
          ===================================================== */}

      {showDetailsModal && selectedExamination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-text/10 bg-card shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-text/10 bg-card p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Examination Details
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedExamination.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-xl p-2 text-text/50 hover:bg-text/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* EXAM INFO */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-text/10 bg-background p-4">
                  <p className="text-xs text-text/50">
                    Academic Session
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedExamination.academic_session_name ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-text/10 bg-background p-4">
                  <p className="text-xs text-text/50">
                    Term
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedExamination.term_name || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-text/10 bg-background p-4">
                  <p className="text-xs text-text/50">
                    Class
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedExamination.class_level_name ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-text/10 bg-background p-4">
                  <p className="text-xs text-text/50">
                    Type
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedExamination.examination_type_display ||
                      selectedExamination.examination_type ||
                      "—"}
                  </p>
                </div>
              </div>

              {/* DATE / DESCRIPTION */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-text/10 bg-background p-5">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />

                    <div>
                      <p className="text-xs text-text/50">
                        Examination Period
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(
                          selectedExamination.start_date
                        )}
                        {" - "}
                        {formatDate(
                          selectedExamination.end_date
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-text/10 bg-background p-5">
                  <p className="text-xs text-text/50">
                    Description
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text/70">
                    {selectedExamination.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              {/* SUBJECTS HEADER */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    Examination Subjects
                  </h3>

                  <p className="mt-1 text-sm text-text/60">
                    Subjects scheduled for this examination.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAddSubject(selectedExamination)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Subject
                </button>
              </div>

              {/* SUBJECTS */}
              {selectedExaminationSubjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-text/20 bg-background p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-text/30" />

                  <p className="mt-3 text-sm font-semibold">
                    No subjects added yet
                  </p>

                  <p className="mt-1 text-sm text-text/50">
                    Add subjects assigned to this class.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExaminationSubjects.map(
                    (subject) => (
                      <div
                        key={subject.id}
                        className="rounded-2xl border border-text/10 bg-background p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold">
                                {subject.subject_name ||
                                  "Subject"}
                              </h4>

                              {subject.subject_code && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                  {subject.subject_code}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text/60">
                              <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />

                                {formatDate(
                                  subject.examination_date
                                )}
                              </span>

                              <span className="inline-flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />

                                {formatTime(
                                  subject.start_time
                                )}
                                {" - "}
                                {formatTime(
                                  subject.end_time
                                )}
                              </span>

                              {subject.venue && (
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />

                                  {subject.venue}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 text-xs text-text/50">
                              Maximum Score:{" "}
                              <strong className="text-text/70">
                                {subject.maximum_score}
                              </strong>

                              {" • "}

                              Pass Mark:{" "}
                              <strong className="text-text/70">
                                {subject.pass_mark}
                              </strong>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditSubject(subject)
                              }
                              className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-primary hover:bg-primary/10"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSubject(subject)
                              }
                              disabled={
                                deletingSubjectId ===
                                subject.id
                              }
                              className="rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-600 hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* CLOSE */}
              <div className="flex justify-end border-t border-text/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-xl border border-text/10 px-5 py-3 text-sm font-semibold hover:bg-text/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUBJECT MODAL
          ===================================================== */}

      {showSubjectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-text/10 bg-card shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-text/10 bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  {editingSubject
                    ? "Edit Examination Subject"
                    : "Add Examination Subject"}
                </h2>

                <p className="mt-1 text-sm text-text/60">
                  Configure the subject examination schedule.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="rounded-xl p-2 text-text/50 hover:bg-text/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveSubject}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* EXAMINATION */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Examination
                </label>

                <select
                  name="examination"
                  value={subjectForm.examination}
                  onChange={handleSubjectChange}
                  disabled={Boolean(editingSubject)}
                  required
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">
                    Select examination
                  </option>

                  {examinations.map((exam) => (
                    <option
                      key={exam.id}
                      value={exam.id}
                    >
                      {exam.name} —{" "}
                      {exam.class_level_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUBJECT */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Subject
                </label>

                <select
                  name="subject"
                  value={subjectForm.subject}
                  onChange={handleSubjectChange}
                  required
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">
                    Select subject
                  </option>

                  {availableClassSubjects.map(
                    (classSubject) => (
                      <option
                        key={classSubject.id}
                        value={classSubject.subject}
                      >
                        {classSubject.subject_name ||
                          `Subject #${classSubject.subject}`}
                      </option>
                    )
                  )}
                </select>

                {subjectForm.examination &&
                  availableClassSubjects.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      No active subjects assigned to this
                      class are available. Assign subjects to
                      the class first.
                    </p>
                  )}
              </div>

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Examination Date
                </label>

                <input
                  type="date"
                  name="examination_date"
                  value={subjectForm.examination_date}
                  onChange={handleSubjectChange}
                  required
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* TIME */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="start_time"
                    value={subjectForm.start_time}
                    onChange={handleSubjectChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="end_time"
                    value={subjectForm.end_time}
                    onChange={handleSubjectChange}
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* SCORES */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    name="maximum_score"
                    value={subjectForm.maximum_score}
                    onChange={handleSubjectChange}
                    min="1"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Pass Mark
                  </label>

                  <input
                    type="number"
                    name="pass_mark"
                    value={subjectForm.pass_mark}
                    onChange={handleSubjectChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* VENUE */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Venue
                </label>

                <input
                  type="text"
                  name="venue"
                  value={subjectForm.venue}
                  onChange={handleSubjectChange}
                  placeholder="e.g. JSS 1 Examination Hall"
                  className="w-full rounded-xl border border-text/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-text/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowSubjectModal(false)
                  }
                  className="rounded-xl border border-text/10 px-5 py-3 text-sm font-semibold hover:bg-text/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSubject}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingSubject && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {savingSubject
                    ? "Saving..."
                    : editingSubject
                    ? "Update Subject"
                    : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamOfficerExaminations;