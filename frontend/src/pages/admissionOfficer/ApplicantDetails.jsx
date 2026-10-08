import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  GraduationCap,
  Users,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  UserPlus,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  Share2,
  Send,
  Link,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";
const WEBSITE_URL = window.location.origin;

function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showAdmissionSuccessModal, setShowAdmissionSuccessModal] =
    useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const [status, setStatus] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");

  const [admissionResult, setAdmissionResult] = useState(null);

  const [copiedField, setCopiedField] = useState("");

  const getToken = () => {
    return (
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const getErrorMessage = (data, fallback) => {
    if (!data) {
      return fallback;
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

    const messages = [];

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string") {
            messages.push(item);
          }
        });
      } else if (typeof value === "string") {
        messages.push(value);
      }
    });

    return messages.length ? messages.join(" ") : fallback;
  };

  const fetchApplicant = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/admissions/applicants/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to load applicant."));
      }

      setApplicant(data);

      setStatus(data.status || "");
      setReviewNote(data.review_note || "");
    } catch (err) {
      console.error("Applicant details error:", err);

      setError(err.message || "Unable to load applicant details.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchApplicant();
  }, [id]);

  const clearSuccessAfterDelay = (duration = 4000) => {
    setTimeout(() => {
      setSuccess("");
    }, duration);
  };

  const updateStatus = async () => {
    if (!status) {
      setError("Please select an application status.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/admissions/applicants/${id}/status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            status,
            review_note: reviewNote.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to update applicant status."),
        );
      }

      const updatedApplicant = data?.applicant || data;

      if (
        updatedApplicant &&
        typeof updatedApplicant === "object" &&
        updatedApplicant.id
      ) {
        setApplicant(updatedApplicant);

        setStatus(updatedApplicant.status || status);

        setReviewNote(updatedApplicant.review_note || reviewNote);
      }

      setShowStatusModal(false);

      setSuccess("Applicant status updated successfully.");

      clearSuccessAfterDelay();

      await fetchApplicant(false);
    } catch (err) {
      console.error("Status update error:", err);

      setError(err.message || "Failed to update applicant status.");
    } finally {
      setActionLoading(false);
    }
  };

  const admitApplicant = async () => {
    if (applicant.status !== "ACCEPTED") {
      setError("Only an accepted applicant can be admitted.");
      return;
    }

    if (!admissionNumber.trim()) {
      setError("Please enter an admission number.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/admissions/applicants/${id}/admit/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            admission_number: admissionNumber.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to admit applicant."));
      }

      const admittedApplicant = data?.applicant;

      if (admittedApplicant && typeof admittedApplicant === "object") {
        setApplicant(admittedApplicant);

        setStatus(admittedApplicant.status || "ACCEPTED");

        setReviewNote(admittedApplicant.review_note || "");
      }

      /*
       * IMPORTANT:
       * Save the complete admission response before
       * refreshing the applicant.
       *
       * Student and parent passwords are returned only
       * during the admission request.
       */
      setAdmissionResult(data);

      setShowAdmitModal(false);
      setAdmissionNumber("");

      setShowAdmissionSuccessModal(true);

      await fetchApplicant(false);
    } catch (err) {
      console.error("Admission error:", err);

      setError(err.message || "Failed to admit applicant.");
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = () => {
    setError("");
    setSuccess("");

    setStatus(applicant.status || "PENDING");

    setReviewNote(applicant.review_note || "");

    setShowStatusModal(true);
  };

  const openAdmitModal = () => {
    setError("");
    setSuccess("");
    setAdmissionNumber("");

    setShowAdmitModal(true);
  };

  const closeStatusModal = () => {
    if (!actionLoading) {
      setShowStatusModal(false);
    }
  };

  const closeAdmitModal = () => {
    if (!actionLoading) {
      setShowAdmitModal(false);
    }
  };

  const closeAdmissionSuccessModal = () => {
    setShowAdmissionSuccessModal(false);
    setShowShareOptions(false);
    setAdmissionResult(null);
    setCopiedField("");
  };

  const copyToClipboard = async (value, field) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch (err) {
      console.error("Clipboard error:", err);

      setError("Unable to copy to clipboard. Please copy the value manually.");
    }
  };

  /*
   * Build all credentials into one message.
   */
  const buildCredentialsMessage = () => {
    const student = admissionResult?.student;
    const studentCredentials = admissionResult?.credentials;

    const parent = admissionResult?.parent;
    const parentCredentials = parent?.login_credentials;

    const studentName =
      student?.full_name || applicant?.admitted_student_name || applicantName;

    const admissionNo =
      student?.admission_number ||
      applicant?.admitted_student_admission_number ||
      "—";

    let message = `EduManageERP Admission & Login Credentials

Dear Parent/Guardian,

Your child, ${studentName}, has been successfully admitted into EduManageERP.

STUDENT INFORMATION
-------------------
Student Name: ${studentName}
Admission Number: ${admissionNo}
Class: ${student?.class_name || "—"}
Term: ${student?.term_name || "—"}

STUDENT LOGIN
-------------
Username: ${studentCredentials?.username || "—"}
Password: ${studentCredentials?.password || "—"}

LOGIN WEBSITE
-------------
${WEBSITE_URL}
`;

    if (parent && parentCredentials) {
      message += `

PARENT/GUARDIAN INFORMATION
----------------------------
Name: ${parent.full_name || "—"}
Phone: ${parent.phone_number || "—"}
Email: ${parent.email || "—"}

PARENT LOGIN
------------
Username: ${parentCredentials.username || "—"}
Password: ${parentCredentials.password || "—"}

PARENT LOGIN WEBSITE
--------------------
${WEBSITE_URL}
`;
    }

    message += `

IMPORTANT
---------
Please keep these login credentials secure.
Do not share usernames or passwords with unauthorized persons.

The website above can be used to access the EduManageERP login page.

Regards,
EduManageERP
`;

    return message;
  };

  /*
   * Share credentials through email.
   */
  const shareCredentialsByEmail = () => {
    if (!admissionResult) {
      setError("Admission credentials are not available.");
      return;
    }

    const parentEmail =
      admissionResult?.parent?.email || applicant?.guardian_email || "";

    const studentName =
      admissionResult?.student?.full_name ||
      applicant?.admitted_student_name ||
      applicantName;

    const subject = `EduManageERP Login Credentials - ${studentName}`;

    const body = buildCredentialsMessage();

    const mailto =
      `mailto:${parentEmail}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    setShowShareOptions(false);
  };

  /*
   * Copy everything into one clipboard message.
   */
  const copyAllCredentials = async () => {
    const message = buildCredentialsMessage();

    try {
      await navigator.clipboard.writeText(message);

      setCopiedField("all-credentials");

      setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch (err) {
      console.error("Copy all credentials error:", err);

      setError("Unable to copy credentials. Please try again.");
    }
  };

  /*
   * Copy only the website address.
   */
  const copyWebsite = () => {
    copyToClipboard(WEBSITE_URL, "website-url");
  };

  const getStatusClasses = (value) => {
    switch (value) {
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

      case "UNDER_REVIEW":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      case "WITHDRAWN":
        return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300";

      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    }
  };

  const getStatusIcon = (value) => {
    switch (value) {
      case "ACCEPTED":
        return <CheckCircle2 size={16} />;

      case "UNDER_REVIEW":
        return <Clock3 size={16} />;

      case "REJECTED":
        return <XCircle size={16} />;

      case "WITHDRAWN":
        return <RotateCcw size={16} />;

      default:
        return <FileText size={16} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return value;
  };

  const applicantName =
    applicant?.full_name ||
    `${applicant?.first_name || ""} ${applicant?.last_name || ""}`.trim() ||
    "Applicant";

  const admittedStudent = admissionResult?.student;

  const studentCredentials = admissionResult?.credentials;

  const admittedParent = admissionResult?.parent;

  const parentCredentials = admittedParent?.login_credentials;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={24}
            className="animate-spin text-[var(--color-primary)]"
          />

          <span className="text-sm font-medium">
            Loading applicant details...
          </span>
        </div>
      </div>
    );
  }

  if (error && !applicant) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/admission-officer/applicants")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[var(--color-primary)] dark:text-slate-300"
        >
          <ArrowLeft size={18} />
          Back to Applicants
        </button>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />

          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
            Unable to Load Applicant
          </h2>

          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => fetchApplicant()}
            className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          PRINT STYLES
      ====================================================== */}
      <style>{`
        .print-only-credentials {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html,
          body {
            width: 100%;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-only-credentials,
          .print-only-credentials * {
            visibility: visible !important;
          }

          .print-only-credentials {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 281mm !important;
            max-height: 281mm !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-sizing: border-box !important;
          }

          .print-only-credentials,
          .print-only-credentials * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-no-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/admission-officer/applicants")}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[var(--color-primary)] dark:border-slate-700 dark:bg-[var(--color-card)] dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Back to applicants"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              Applicant Details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {applicantName}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Application No:{" "}
              <span className="font-semibold">
                {displayValue(applicant.application_number)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/admission-officer/applicants/${applicant.id}/edit`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Edit Application
          </button>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
              applicant.status,
            )}`}
          >
            {getStatusIcon(applicant.status)}

            <span>
              {displayValue(applicant.status_display || applicant.status)}
            </span>
          </div>

          {!applicant.admitted_student && (
            <button
              type="button"
              onClick={openStatusModal}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <ClipboardCheck size={18} />
              Review Application
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto shrink-0 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto shrink-0 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================
          ADMISSION ACTION
      ====================================================== */}
      {applicant.status === "ACCEPTED" && !applicant.admitted_student && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <UserPlus size={20} />
                </div>

                <h2 className="font-bold text-emerald-800 dark:text-emerald-300">
                  Applicant Accepted
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                This applicant has been accepted. Admit the applicant to create
                the student record and first-term enrollment.
              </p>
            </div>

            <button
              type="button"
              onClick={openAdmitModal}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <UserPlus size={18} />
              Admit Applicant
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ALREADY ADMITTED
      ====================================================== */}
      {applicant.admitted_student && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <GraduationCap size={20} />
                </div>

                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Student Created
                </p>
              </div>

              <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">
                {displayValue(applicant.admitted_student_name)}
                {" • "}
                {displayValue(applicant.admitted_student_admission_number)}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <CheckCircle2 size={18} />
              Admitted
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN INFORMATION
      ====================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
          <SectionHeader icon={User} title="Personal Information" />

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="First Name" value={applicant.first_name} />

            <InfoItem label="Middle Name" value={applicant.middle_name} />

            <InfoItem label="Last Name" value={applicant.last_name} />

            <InfoItem
              label="Date of Birth"
              value={formatDate(applicant.date_of_birth)}
              icon={CalendarDays}
            />

            <InfoItem
              label="Gender"
              value={
                applicant.gender === "MALE"
                  ? "Male"
                  : applicant.gender === "FEMALE"
                    ? "Female"
                    : applicant.gender
              }
            />

            <InfoItem
              label="Phone Number"
              value={applicant.phone_number}
              icon={Phone}
            />

            <InfoItem
              label="Email Address"
              value={applicant.email}
              icon={Mail}
            />

            <InfoItem
              label="Previous School"
              value={applicant.previous_school}
              icon={GraduationCap}
            />

            <InfoItem
              label="Application Date"
              value={formatDate(
                applicant.application_date || applicant.created_at,
              )}
              icon={CalendarDays}
            />

            <div className="sm:col-span-2 lg:col-span-3">
              <InfoItem
                label="Address"
                value={applicant.address}
                icon={MapPin}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <SectionHeader icon={FileText} title="Application" />

          <div className="mt-6 space-y-5">
            <InfoItem
              label="Application Number"
              value={applicant.application_number}
            />

            <InfoItem
              label="Source"
              value={
                applicant.application_source_display ||
                applicant.application_source
              }
            />

            <InfoItem label="School" value={applicant.school_name} />

            <InfoItem
              label="Academic Session"
              value={applicant.session_name || applicant.academic_session_name}
            />

            <InfoItem
              label="Class"
              value={applicant.class_level_name || applicant.class_name}
            />

            <InfoItem label="Department" value={applicant.department_name} />

            <InfoItem
              label="Status"
              value={applicant.status_display || applicant.status}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
          <SectionHeader icon={Users} title="Guardian Information" />

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem
              label="Guardian Name"
              value={applicant.guardian_name}
              icon={User}
            />

            <InfoItem
              label="Guardian Phone"
              value={applicant.guardian_phone}
              icon={Phone}
            />

            <InfoItem
              label="Guardian Email"
              value={applicant.guardian_email}
              icon={Mail}
            />

            <InfoItem
              label="Guardian Address"
              value={applicant.guardian_address}
              icon={MapPin}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <SectionHeader icon={ClipboardCheck} title="Review" />

          <div className="mt-6 space-y-5">
            <InfoItem
              label="Reviewed By"
              value={
                applicant.reviewed_by_name || applicant.reviewed_by_username
              }
            />

            <InfoItem
              label="Reviewed At"
              value={formatDate(applicant.reviewed_at)}
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Review Note
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                {displayValue(applicant.review_note)}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          STATUS MODAL
      ====================================================== */}
      {showStatusModal && (
        <Modal title="Review Application" onClose={closeStatusModal}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Application Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/30"
              >
                <option value="PENDING">Pending</option>

                <option value="UNDER_REVIEW">Under Review</option>

                <option value="ACCEPTED">Accepted</option>

                <option value="REJECTED">Rejected</option>

                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Review Note
              </label>

              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                disabled={actionLoading}
                rows={4}
                placeholder="Enter a note about this application..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/30"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                disabled={actionLoading}
                onClick={closeStatusModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={updateStatus}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================
          ADMIT MODAL
      ====================================================== */}
      {showAdmitModal && (
        <Modal title="Admit Applicant" onClose={closeAdmitModal}>
          <div className="space-y-5">
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-semibold">Ready for Admission</p>

                  <p className="mt-1 leading-6">
                    You are about to admit{" "}
                    <span className="font-semibold">{applicantName}</span>. This
                    will create the student record, first-term enrollment, and
                    parent/guardian account.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Admission Number
              </label>

              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                disabled={actionLoading}
                placeholder="e.g. EDU/2026/0003"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/30"
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                The admission number must be unique.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <strong>Important:</strong> Admission creates the student account,
              enrollment, parent/guardian record, and parent login account when
              required. Make sure the application information has been reviewed
              before continuing.
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                disabled={actionLoading}
                onClick={closeAdmitModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading || !admissionNumber.trim()}
                onClick={admitApplicant}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <UserPlus size={17} />
                )}

                {actionLoading ? "Admitting..." : "Admit Applicant"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================
          ADMISSION SUCCESS MODAL
      ====================================================== */}
      {showAdmissionSuccessModal && admissionResult && (
        <>
          <AdmissionSuccessModal
            applicant={applicant}
            applicantName={applicantName}
            student={admittedStudent}
            studentCredentials={studentCredentials}
            parent={admittedParent}
            parentCredentials={parentCredentials}
            copiedField={copiedField}
            onCopy={copyToClipboard}
            onCopyWebsite={copyWebsite}
            onShare={() => setShowShareOptions(true)}
            onClose={closeAdmissionSuccessModal}
          />

          {/* =================================================
                DEDICATED ONE-PAGE PRINT DOCUMENT
            ================================================== */}
          <PrintableAdmissionCredentials
            applicant={applicant}
            applicantName={applicantName}
            student={admittedStudent}
            studentCredentials={studentCredentials}
            parent={admittedParent}
            parentCredentials={parentCredentials}
          />
        </>
      )}

      {/* =====================================================
          SHARE OPTIONS
      ====================================================== */}
      {showShareOptions && admissionResult && (
        <ShareOptionsModal
          parent={admittedParent}
          guardianEmail={applicant?.guardian_email}
          onEmail={shareCredentialsByEmail}
          onCopyAll={copyAllCredentials}
          copiedField={copiedField}
          onClose={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   ADMISSION SUCCESS MODAL
========================================================= */

function AdmissionSuccessModal({
  applicant,
  applicantName,
  student,
  studentCredentials,
  parent,
  parentCredentials,
  copiedField,
  onCopy,
  onCopyWebsite,
  onShare,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-[var(--color-card)]">
        {/* Success Header */}
        <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={30} />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Admission Successful
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {applicantName} has been successfully admitted into the school.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* Student Summary */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <GraduationCap size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                  Student Created
                </p>

                <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-300">
                  {displayModalValue(
                    student?.full_name || applicant?.admitted_student_name,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <CredentialInfo
                label="Admission Number"
                value={
                  student?.admission_number ||
                  applicant?.admitted_student_admission_number
                }
                field="student-admission"
                copiedField={copiedField}
                onCopy={onCopy}
              />

              <CredentialInfo
                label="Class"
                value={student?.class_name}
                field="student-class"
                copiedField={copiedField}
                onCopy={onCopy}
              />

              <CredentialInfo
                label="Term"
                value={student?.term_name}
                field="student-term"
                copiedField={copiedField}
                onCopy={onCopy}
              />
            </div>
          </div>

          {/* Website */}
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Link size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
                  EduManageERP Login Website
                </h3>

                <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  Use this website address to access the EduManageERP login
                  page.
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-indigo-200 bg-white p-2 dark:border-indigo-500/20 dark:bg-slate-900">
                  <a
                    href={WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 break-all px-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    {WEBSITE_URL}
                  </a>

                  <button
                    type="button"
                    onClick={onCopyWebsite}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"
                    title="Copy website address"
                  >
                    {copiedField === "website-url" ? (
                      <Check size={17} className="text-emerald-500" />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student Login */}
          <CredentialSection
            icon={GraduationCap}
            title="Student Login Credentials"
            description="Give these credentials to the newly admitted student."
            username={studentCredentials?.username}
            password={studentCredentials?.password}
            usernameField="student-username"
            passwordField="student-password"
            copiedField={copiedField}
            onCopy={onCopy}
          />

          {/* Parent Account */}
          {parent && (
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-500/20 dark:bg-cyan-500/10">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <Users size={22} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-cyan-800 dark:text-cyan-300">
                    Parent / Guardian Created
                  </p>

                  <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">
                    {displayModalValue(parent.full_name)}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-cyan-600/70 dark:text-cyan-300/70">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                        {displayModalValue(parent.phone_number)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-cyan-600/70 dark:text-cyan-300/70">
                        Email
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                        {displayModalValue(parent.email)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parent Login Credentials */}
          {parentCredentials && (
            <CredentialSection
              icon={Users}
              title="Parent Login Credentials"
              description="Give these credentials to the parent or guardian."
              username={parentCredentials.username}
              password={parentCredentials.password}
              usernameField="parent-username"
              passwordField="parent-password"
              copiedField={copiedField}
              onCopy={onCopy}
            />
          )}

          {/* Warning */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Important — Save These Credentials
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-300">
                  The generated passwords are displayed only during admission.
                  Make sure the student and parent/guardian credentials are
                  saved or securely delivered before closing this window.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FileText size={17} />
              Print Credentials
            </button>

            <button
              type="button"
              onClick={onShare}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Share2 size={17} />
              Share Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DEDICATED ONE-PAGE PRINT COMPONENT
========================================================= */

function PrintableAdmissionCredentials({
  applicant,
  applicantName,
  student,
  studentCredentials,
  parent,
  parentCredentials,
}) {
  const admissionNo =
    student?.admission_number ||
    applicant?.admitted_student_admission_number ||
    "—";

  const studentName =
    student?.full_name || applicant?.admitted_student_name || applicantName;

  return (
    <div className="print-only-credentials">
      <div
        style={{
          width: "100%",
          height: "281mm",
          maxHeight: "281mm",
          boxSizing: "border-box",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#111827",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "2px solid #1d4ed8",
            paddingBottom: "7mm",
            marginBottom: "6mm",
          }}
          className="print-no-break"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1d4ed8",
                  marginBottom: "3px",
                }}
              >
                EduManageERP
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                School Management System
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                ADMISSION SUCCESS
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "10px",
                  color: "#64748b",
                }}
              >
                Login Credentials
              </div>
            </div>
          </div>
        </div>

        {/* Student Admission Information */}
        <div
          style={{
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            borderRadius: "8px",
            padding: "5mm",
            marginBottom: "5mm",
          }}
          className="print-no-break"
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1e3a8a",
              marginBottom: "4mm",
            }}
          >
            Student Information
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
              gap: "4mm",
            }}
          >
            <PrintField label="Student Name" value={studentName} />

            <PrintField label="Admission Number" value={admissionNo} />

            <PrintField label="Class" value={student?.class_name || "—"} />

            <PrintField label="Term" value={student?.term_name || "—"} />
          </div>
        </div>

        {/* Login Website */}
        <div
          style={{
            border: "1px solid #c7d2fe",
            background: "#eef2ff",
            borderRadius: "8px",
            padding: "4mm",
            marginBottom: "5mm",
          }}
          className="print-no-break"
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#3730a3",
              marginBottom: "2mm",
            }}
          >
            EduManageERP Login Website
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#1d4ed8",
              wordBreak: "break-all",
            }}
          >
            {WEBSITE_URL}
          </div>
        </div>

        {/* Student Credentials */}
        <PrintCredentialBox
          title="Student Login Credentials"
          username={studentCredentials?.username || "—"}
          password={studentCredentials?.password || "—"}
          background="#f8fafc"
          border="#cbd5e1"
          titleColor="#1e3a8a"
        />

        {/* Parent Credentials */}
        {parentCredentials && (
          <>
            <div
              style={{
                height: "4mm",
              }}
            />

            <PrintCredentialBox
              title="Parent / Guardian Login Credentials"
              username={parentCredentials.username || "—"}
              password={parentCredentials.password || "—"}
              background="#ecfeff"
              border="#a5f3fc"
              titleColor="#155e75"
            />

            <div
              style={{
                marginTop: "4mm",
                border: "1px solid #a5f3fc",
                background: "#ecfeff",
                borderRadius: "8px",
                padding: "4mm",
              }}
              className="print-no-break"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1.5fr",
                  gap: "4mm",
                }}
              >
                <PrintField
                  label="Parent / Guardian"
                  value={parent?.full_name || "—"}
                />

                <PrintField label="Phone" value={parent?.phone_number || "—"} />

                <PrintField label="Email" value={parent?.email || "—"} />
              </div>
            </div>
          </>
        )}

        {/* Security Warning */}
        <div
          style={{
            marginTop: "5mm",
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            borderRadius: "8px",
            padding: "4mm",
          }}
          className="print-no-break"
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#92400e",
              marginBottom: "1.5mm",
            }}
          >
            IMPORTANT
          </div>

          <div
            style={{
              fontSize: "9.5px",
              lineHeight: "1.45",
              color: "#92400e",
            }}
          >
            Keep these credentials secure. The generated passwords are displayed
            only during admission. Do not share login credentials with
            unauthorized persons.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "7mm",
            paddingTop: "4mm",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="print-no-break"
        >
          <div
            style={{
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            EduManageERP
          </div>

          <div
            style={{
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            Admission No: {admissionNo}
          </div>

          <div
            style={{
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            {new Date().toLocaleDateString("en-US")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRINT FIELD
========================================================= */

function PrintField({ label, value }) {
  return (
    <div
      style={{
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "8px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#64748b",
          marginBottom: "1.5mm",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "10.5px",
          fontWeight: "700",
          color: "#111827",
          wordBreak: "break-word",
        }}
      >
        {displayModalValue(value)}
      </div>
    </div>
  );
}

/* =========================================================
   PRINT CREDENTIAL BOX
========================================================= */

function PrintCredentialBox({
  title,
  username,
  password,
  background,
  border,
  titleColor,
}) {
  return (
    <div
      style={{
        border: `1px solid ${border}`,
        background,
        borderRadius: "8px",
        padding: "5mm",
      }}
      className="print-no-break"
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: "700",
          color: titleColor,
          marginBottom: "4mm",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5mm",
        }}
      >
        <div
          style={{
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            borderRadius: "6px",
            padding: "3mm",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748b",
              marginBottom: "1.5mm",
            }}
          >
            Username
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#111827",
              wordBreak: "break-all",
            }}
          >
            {displayModalValue(username)}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            borderRadius: "6px",
            padding: "3mm",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#64748b",
              marginBottom: "1.5mm",
            }}
          >
            Password
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#111827",
              wordBreak: "break-all",
            }}
          >
            {displayModalValue(password)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARE OPTIONS MODAL
========================================================= */

function ShareOptionsModal({
  parent,
  guardianEmail,
  onEmail,
  onCopyAll,
  copiedField,
  onClose,
}) {
  const email = parent?.email || guardianEmail || "";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[var(--color-card)]">
        <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
            <Share2 size={21} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Share Credentials
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Choose how you want to share the admission login information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 p-6">
          <button
            type="button"
            onClick={onEmail}
            className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
              <Send size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Share by Email
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {email
                  ? `Send to ${email}`
                  : "No guardian email provided. Your email app will open without a recipient."}
              </p>
            </div>

            <ArrowLeft
              size={18}
              className="rotate-180 text-slate-400 transition group-hover:text-[var(--color-primary)]"
            />
          </button>

          <button
            type="button"
            onClick={onCopyAll}
            className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {copiedField === "all-credentials" ? (
                <Check size={21} />
              ) : (
                <Copy size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Copy All Credentials
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Copy student, parent and website information to the clipboard.
              </p>
            </div>

            {copiedField === "all-credentials" && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Copied
              </span>
            )}
          </button>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                Credentials contain passwords. Only send them to the intended
                student or parent/guardian.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CREDENTIAL SECTION
========================================================= */

function CredentialSection({
  icon: Icon,
  title,
  description,
  username,
  password,
  usernameField,
  passwordField,
  copiedField,
  onCopy,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[var(--color-primary)] dark:bg-slate-800 dark:text-blue-400">
          <Icon size={21} />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CredentialInput
          label="Username"
          value={username}
          icon={User}
          field={usernameField}
          copiedField={copiedField}
          onCopy={onCopy}
        />

        <CredentialInput
          label="Password"
          value={password}
          icon={KeyRound}
          field={passwordField}
          copiedField={copiedField}
          onCopy={onCopy}
        />
      </div>
    </div>
  );
}

/* =========================================================
   CREDENTIAL INPUT
========================================================= */

function CredentialInput({
  label,
  value,
  icon: Icon,
  field,
  copiedField,
  onCopy,
}) {
  const copied = copiedField === field;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <Icon size={16} />
        </div>

        <span className="min-w-0 flex-1 break-all px-1 text-sm font-bold text-slate-800 dark:text-slate-100">
          {displayModalValue(value)}
        </span>

        <button
          type="button"
          onClick={() => onCopy(value, field)}
          disabled={!value}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-900"
          title={`Copy ${label}`}
        >
          {copied ? (
            <Check size={17} className="text-emerald-500" />
          ) : (
            <Copy size={17} />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CREDENTIAL INFO
========================================================= */

function CredentialInfo({ label, value, field, copiedField, onCopy }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-blue-500 dark:text-blue-300">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <p className="break-words text-sm font-bold text-blue-900 dark:text-blue-100">
          {displayModalValue(value)}
        </p>

        {value && (
          <button
            type="button"
            onClick={() => onCopy(value, field)}
            className="shrink-0 text-blue-500 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
            title={`Copy ${label}`}
          >
            {copiedField === field ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function displayModalValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-base font-bold">{title}</h2>

        <div className="mt-1 h-1 w-8 rounded-full bg-[var(--color-primary)]" />
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {Icon && <Icon size={13} />}
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[var(--color-card)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-bold">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default ApplicantDetails;
