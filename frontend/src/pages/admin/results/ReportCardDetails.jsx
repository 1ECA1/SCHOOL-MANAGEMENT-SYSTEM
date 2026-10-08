// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   getReportCard,
//   deleteReportCard,
// } from "../../../services/resultsService";

// const ReportCardDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [reportCard, setReportCard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     loadReportCard();
//   }, [id]);

//   const loadReportCard = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await getReportCard(id);
//       setReportCard(data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load report card."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this report card?"
//     );

//     if (!confirmed) return;

//     try {
//       await deleteReportCard(id);
//       navigate("/admin/results/report-cards");
//     } catch (err) {
//       console.error(err);

//       alert(
//         err?.response?.data?.detail ||
//           "Failed to delete report card."
//       );
//     }
//   };

//   const formatScore = (value) => {
//     if (value === null || value === undefined) {
//       return "0";
//     }

//     return Number(value).toFixed(2);
//   };

//   const getPositionText = () => {
//     if (!reportCard?.position) {
//       return "—";
//     }

//     const position = reportCard.position;

//     if (position % 10 === 1 && position % 100 !== 11) {
//       return `${position}st`;
//     }

//     if (position % 10 === 2 && position % 100 !== 12) {
//       return `${position}nd`;
//     }

//     if (position % 10 === 3 && position % 100 !== 13) {
//       return `${position}rd`;
//     }

//     return `${position}th`;
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//           <p className="text-gray-500">
//             Loading report card...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow-sm p-8">
//           <p className="text-red-600 mb-4">{error}</p>

//           <button
//             onClick={() =>
//               navigate("/admin/results/report-cards")
//             }
//             className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//           >
//             Back to Report Cards
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!reportCard) {
//     return (
//       <div className="p-6">
//         <p className="text-gray-500">
//           Report card not found.
//         </p>
//       </div>
//     );
//   }

//   const results = reportCard.results || [];

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Report Card
//           </h1>

//           <p className="text-gray-500 mt-1">
//             View student's complete academic performance
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() =>
//               navigate(
//                 `/admin/results/report-cards/${id}/edit`
//               )
//             }
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Edit
//           </button>

//           <button
//             onClick={handleDelete}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Delete
//           </button>

//           <button
//             onClick={() =>
//               navigate("/admin/results/report-cards")
//             }
//             className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//           >
//             Back
//           </button>
//         </div>
//       </div>

//       {/* Student Information */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-lg font-semibold text-gray-800">
//             Student Information
//           </h2>
//         </div>

//         <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div>
//             <p className="text-sm text-gray-500">
//               Student
//             </p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {reportCard.student_name || "—"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">
//               Class
//             </p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {reportCard.class_name || "—"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">
//               Academic Session
//             </p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {reportCard.session_name || "—"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">
//               Term
//             </p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {reportCard.term_name || "—"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Performance Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//         <div className="bg-white rounded-xl shadow-sm border p-5">
//           <p className="text-sm text-gray-500">
//             Total Score
//           </p>

//           <p className="text-2xl font-bold text-gray-800 mt-2">
//             {formatScore(reportCard.total_score)}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-5">
//           <p className="text-sm text-gray-500">
//             Average
//           </p>

//           <p className="text-2xl font-bold text-blue-600 mt-2">
//             {formatScore(reportCard.average_score)}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-5">
//           <p className="text-sm text-gray-500">
//             Overall Grade
//           </p>

//           <p className="text-2xl font-bold text-green-600 mt-2">
//             {reportCard.overall_grade || "—"}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-5">
//           <p className="text-sm text-gray-500">
//             Position
//           </p>

//           <p className="text-2xl font-bold text-purple-600 mt-2">
//             {getPositionText()}
//           </p>

//           {reportCard.total_students > 0 && (
//             <p className="text-xs text-gray-500 mt-1">
//               Out of {reportCard.total_students} students
//             </p>
//           )}
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-5">
//           <p className="text-sm text-gray-500">
//             Attendance
//           </p>

//           <p className="text-2xl font-bold text-orange-600 mt-2">
//             {formatScore(reportCard.attendance_percentage)}%
//           </p>
//         </div>
//       </div>

//       {/* Subject Results */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-lg font-semibold text-gray-800">
//             Subject Results
//           </h2>
//         </div>

//         {results.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             No subject results have been entered for this
//             report card.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                     #
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                     Subject
//                   </th>

//                   <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                     CA
//                   </th>

//                   <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                     Exam
//                   </th>

//                   <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                     Total
//                   </th>

//                   <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                     Grade
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
//                     Remark
//                   </th>

//                   <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
//                     Point
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {results.map((result, index) => (
//                   <tr
//                     key={result.id || index}
//                     className="hover:bg-gray-50"
//                   >
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {index + 1}
//                     </td>

//                     <td className="px-6 py-4">
//                       <p className="font-medium text-gray-800">
//                         {result.subject_name || "—"}
//                       </p>

//                       {result.examination_name && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           {result.examination_name}
//                         </p>
//                       )}
//                     </td>

//                     <td className="px-6 py-4 text-center text-sm text-gray-700">
//                       {formatScore(result.ca_score)}
//                     </td>

//                     <td className="px-6 py-4 text-center text-sm text-gray-700">
//                       {formatScore(result.exam_score)}
//                     </td>

//                     <td className="px-6 py-4 text-center font-semibold text-gray-800">
//                       {formatScore(result.total_score)}
//                     </td>

//                     <td className="px-6 py-4 text-center">
//                       <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
//                         {result.grade || "—"}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {result.remark || "—"}
//                     </td>

//                     <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
//                       {formatScore(result.grade_point)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Comments */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border">
//           <div className="px-6 py-4 border-b">
//             <h2 className="font-semibold text-gray-800">
//               Class Teacher's Comment
//             </h2>
//           </div>

//           <div className="p-6">
//             <p className="text-gray-700 whitespace-pre-wrap">
//               {reportCard.teacher_comment ||
//                 "No teacher comment provided."}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border">
//           <div className="px-6 py-4 border-b">
//             <h2 className="font-semibold text-gray-800">
//               Principal's Comment
//             </h2>
//           </div>

//           <div className="p-6">
//             <p className="text-gray-700 whitespace-pre-wrap">
//               {reportCard.principal_comment ||
//                 "No principal comment provided."}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Final Status */}
//       <div className="bg-white rounded-xl shadow-sm border">
//         <div className="px-6 py-4 border-b">
//           <h2 className="font-semibold text-gray-800">
//             Final Status
//           </h2>
//         </div>

//         <div className="p-6 flex flex-wrap gap-4">
//           <div>
//             <span className="text-sm text-gray-500">
//               Promotion:
//             </span>

//             <span
//               className={`ml-2 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
//                 reportCard.promoted
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-700"
//               }`}
//             >
//               {reportCard.promoted
//                 ? "Promoted"
//                 : "Not Promoted"}
//             </span>
//           </div>

//           <div>
//             <span className="text-sm text-gray-500">
//               Publication:
//             </span>

//             <span
//               className={`ml-2 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
//                 reportCard.is_published
//                   ? "bg-green-100 text-green-700"
//                   : "bg-yellow-100 text-yellow-700"
//               }`}
//             >
//               {reportCard.is_published
//                 ? "Published"
//                 : "Not Published"}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportCardDetails;



import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getReportCard } from "../../../services/resultsService";


const ReportCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportCard();
  }, [id]);

  const loadReportCard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReportCard(id);

      setReportCard(data);
    } catch (err) {
      console.error("Failed to load report card:", err);

      setError(
        err?.response?.data?.detail ||
        "Unable to load this report card."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  const formatScore = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "0.00";
    }

    return Number(score).toFixed(2);
  };


  const formatNumber = (number) => {
    if (
      number === null ||
      number === undefined ||
      number === ""
    ) {
      return "0";
    }

    return Number(number).toLocaleString();
  };


  const handlePrint = () => {
    window.print();
  };


  const handleBack = () => {
    navigate("/admin/results/report-cards");
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700 mx-auto mb-4" />

          <p className="text-gray-600">
            Loading report card...
          </p>
        </div>
      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !reportCard) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">

          <div className="text-center">

            <div className="text-red-500 text-4xl mb-4">
              ⚠
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Unable to Load Report Card
            </h2>

            <p className="text-gray-600 mb-6">
              {error || "Report card not found."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Back to Report Cards
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // DATA
  // ==========================================================

  const {
    student_name,
    student_admission_number,
    student_date_of_birth,
    student_profile_image,

    school_name,
    school_logo,
    school_phone,
    school_address,
    school_email,
    school_website,

    session_name,
    term_name,

    class_name,
    department_name,

    total_score,
    average_score,
    overall_grade,

    position,
    total_students,

    class_average,
    class_highest_score,
    class_lowest_score,

    attendance_days,
    school_days_opened,
    attendance_percentage,

    teacher_comment,
    principal_comment,

    results = [],
  } = reportCard;


  return (
    <>
{/* ======================================================
    SCREEN CONTROLS
======================================================= */}

<div
  className="print:hidden"
  style={{ background: "var(--color-background)", padding: "12px 24px" }}
>
  <div className="max-w-7xl mx-auto">

    <div className="flex items-center justify-between">

      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Report Card
        </h1>

        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--color-text)", opacity: 0.6 }}
        >
          {student_name} — {session_name} — {term_name}
        </p>
      </div>

      <div className="flex gap-3">

        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:opacity-80"
          style={{
            background: "var(--color-card)",
            color: "var(--color-text)",
            borderColor: "var(--color-text)",
            borderOpacity: 0.15,
          }}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "var(--color-primary)" }}
        >
          🖨 Print Result
        </button>

      </div>

    </div>

  </div>

</div>


      {/* ======================================================
          PRINT PAGE
      ======================================================= */}

      <div className="report-page bg-white text-gray-900">

        {/* ====================================================
            SCHOOL HEADER
        ===================================================== */}

        <section className="school-header">

          {/* LEFT: LOGO + SCHOOL NAME */}

          <div className="school-header-left">

            {school_logo ? (
              <img
                src={school_logo}
                alt={school_name || "School Logo"}
                className="school-logo"
              />
            ) : null}

            <h1 className="school-name">
              {school_name || "School Name"}
            </h1>

          </div>


          {/* CENTER: SCHOOL DETAILS */}

          <div className="school-header-center">

            {school_phone && (
              <div>
                <strong>Phone:</strong>{" "}
                {school_phone}
              </div>
            )}

            {school_address && (
              <div>
                <strong>Address:</strong>{" "}
                {school_address}
              </div>
            )}

            {school_email && (
              <div>
                <strong>Email:</strong>{" "}
                {school_email}
              </div>
            )}

            {school_website && (
              <div>
                <strong>Website:</strong>{" "}
                {school_website}
              </div>
            )}

          </div>


          {/* RIGHT: STUDENT PHOTO */}

          <div className="student-photo-wrapper">

            {student_profile_image ? (
              <img
                src={student_profile_image}
                alt={student_name}
                className="student-photo"
              />
            ) : null}

          </div>

        </section>


        {/* ====================================================
            DOCUMENT TITLE
        ===================================================== */}

        <div className="document-title">

          <h2>
            STUDENT ACADEMIC REPORT
          </h2>

          <p>
            {session_name} Academic Session
          </p>

        </div>


        {/* ====================================================
            STUDENT INFORMATION
        ===================================================== */}

        <section className="information-section">

          <div className="section-heading">
            STUDENT INFORMATION
          </div>

          <div className="information-grid">

            <InfoItem
              label="Student Name"
              value={student_name}
            />

            <InfoItem
              label="Admission Number"
              value={student_admission_number}
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(student_date_of_birth)}
            />

            <InfoItem
              label="Academic Session"
              value={session_name}
            />

            <InfoItem
              label="School Term"
              value={term_name}
            />

            <InfoItem
              label="Class"
              value={class_name}
            />

            <InfoItem
              label="Department"
              value={department_name}
            />

            <InfoItem
              label="Attendance"
              value={`${formatNumber(attendance_days)} / ${formatNumber(
                school_days_opened
              )}`}
            />

            <InfoItem
              label="School Opened"
              value={formatNumber(school_days_opened)}
            />

            <InfoItem
              label="Average Score"
              value={formatScore(average_score)}
            />

            <InfoItem
              label="Total Score"
              value={formatScore(total_score)}
            />

            <InfoItem
              label="Overall Grade"
              value={overall_grade || "—"}
            />

            <InfoItem
              label="Position"
              value={`${formatNumber(position)} / ${formatNumber(
                total_students
              )}`}
            />

            <InfoItem
              label="Class Average"
              value={formatScore(class_average)}
            />

            <InfoItem
              label="Class Highest Score"
              value={formatScore(class_highest_score)}
            />

            <InfoItem
              label="Class Lowest Score"
              value={formatScore(class_lowest_score)}
            />

          </div>

        </section>


        {/* ====================================================
            ATTENDANCE SUMMARY
        ===================================================== */}

        <section className="attendance-section">

          <div className="section-heading">
            ATTENDANCE SUMMARY
          </div>

          <div className="attendance-grid">

            <div className="attendance-box">
              <span className="attendance-label">
                School Opened
              </span>

              <strong>
                {formatNumber(school_days_opened)}
              </strong>
            </div>

            <div className="attendance-box">
              <span className="attendance-label">
                Days Attended
              </span>

              <strong>
                {formatNumber(attendance_days)}
              </strong>
            </div>

            <div className="attendance-box">
              <span className="attendance-label">
                Attendance Percentage
              </span>

              <strong>
                {formatScore(attendance_percentage)}%
              </strong>
            </div>

          </div>

        </section>


        {/* ====================================================
            ACADEMIC PERFORMANCE
        ===================================================== */}

        <section className="performance-section">

          <div className="section-heading">
            ACADEMIC PERFORMANCE
          </div>

          <table className="performance-table">

            <thead>
              <tr>
                <th className="subject-column">
                  SUBJECT
                </th>

                <th>
                  CA
                </th>

                <th>
                  EXAM
                </th>

                <th>
                  TOTAL
                </th>

                <th>
                  GRADE
                </th>

                <th>
                  REMARK
                </th>

                <th>
                  GRADE POINT
                </th>
              </tr>
            </thead>

            <tbody>

              {results.length > 0 ? (
                results.map((result) => (
                  <tr key={result.id}>

                    <td className="subject-name">
                      {result.subject_name || "—"}
                    </td>

                    <td>
                      {formatScore(result.ca_score)}
                    </td>

                    <td>
                      {formatScore(result.exam_score)}
                    </td>

                    <td>
                      {formatScore(result.total_score)}
                    </td>

                    <td className="grade-cell">
                      {result.grade || "—"}
                    </td>

                    <td>
                      {result.remark || "—"}
                    </td>

                    <td>
                      {formatScore(result.grade_point)}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="no-results"
                  >
                    No academic results available.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </section>


        {/* ====================================================
            PERFORMANCE SUMMARY
        ===================================================== */}

        <section className="summary-section">

          <div className="section-heading">
            PERFORMANCE SUMMARY
          </div>

          <div className="summary-grid">

            <SummaryItem
              label="Total Score"
              value={formatScore(total_score)}
            />

            <SummaryItem
              label="Average Score"
              value={formatScore(average_score)}
            />

            <SummaryItem
              label="Overall Grade"
              value={overall_grade || "—"}
            />

            <SummaryItem
              label="Position"
              value={`${formatNumber(position)} / ${formatNumber(
                total_students
              )}`}
            />

            <SummaryItem
              label="Class Average"
              value={formatScore(class_average)}
            />

            <SummaryItem
              label="Class Highest"
              value={formatScore(class_highest_score)}
            />

            <SummaryItem
              label="Class Lowest"
              value={formatScore(class_lowest_score)}
            />

            <SummaryItem
              label="Attendance"
              value={`${formatNumber(
                attendance_days
              )} / ${formatNumber(school_days_opened)}`}
            />

          </div>

        </section>


        {/* ====================================================
            TEACHER COMMENT
        ===================================================== */}

        <section className="comment-section">

          <div className="section-heading">
            CLASS TEACHER'S COMMENT
          </div>

          <div className="comment-box">
            {teacher_comment || ""}
          </div>

        </section>


        {/* ====================================================
            PRINCIPAL COMMENT
        ===================================================== */}

        <section className="comment-section">

          <div className="section-heading">
            PRINCIPAL'S COMMENT
          </div>

          <div className="comment-box">
            {principal_comment || ""}
          </div>

        </section>


        {/* ====================================================
            MANUAL SKILLS / BEHAVIOUR
        ===================================================== */}

        <section className="manual-section">

          <div className="section-heading">
            SKILLS, CONDUCT AND BEHAVIOUR
          </div>

          <table className="manual-table">

            <thead>

              <tr>
                <th>
                  AREA
                </th>

                <th>
                  EXCELLENT
                </th>

                <th>
                  GOOD
                </th>

                <th>
                  FAIR
                </th>

                <th>
                  NEEDS IMPROVEMENT
                </th>
              </tr>

            </thead>

            <tbody>

              {[
                "Punctuality",
                "Attendance",
                "Neatness",
                "Class Participation",
                "Relationship with Others",
                "Leadership",
                "Responsibility",
                "Discipline",
                "Respect",
                "Homework",
              ].map((item) => (
                <tr key={item}>

                  <td>
                    {item}
                  </td>

                  <td>
                    <span className="tick-box" />
                  </td>

                  <td>
                    <span className="tick-box" />
                  </td>

                  <td>
                    <span className="tick-box" />
                  </td>

                  <td>
                    <span className="tick-box" />
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </section>


        {/* ====================================================
            SIGNATURES
        ===================================================== */}

        <section className="signature-section">

          <div className="signature-box">

            <div className="signature-line" />

            <strong>
              Class Teacher
            </strong>

            <span>
              Signature / Date
            </span>

          </div>


          <div className="signature-box">

            <div className="signature-line" />

            <strong>
              Head Teacher / Principal
            </strong>

            <span>
              Signature / Date
            </span>

          </div>


          <div className="signature-box">

            <div className="signature-line" />

            <strong>
              Parent / Guardian
            </strong>

            <span>
              Signature / Date
            </span>

          </div>

        </section>


        {/* ====================================================
            FOOTER
        ===================================================== */}

        <footer className="report-footer">

          <div>
            {school_name}
          </div>

          <div>
            {session_name} • {term_name}
          </div>

          <div>
            Academic Report
          </div>

        </footer>

      </div>


      {/* ======================================================
          PRINT CSS
      ======================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .report-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 12mm;
          font-family: Arial, Helvetica, sans-serif;
          background: white;
          font-size: 10px;
        }


        /* ================================================
           SCHOOL HEADER
        ================================================= */

        .school-header {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 12px;
          align-items: center;
          border-bottom: 2px solid #111827;
          padding-bottom: 10px;
        }


        .school-header-left {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }


        .school-logo {
          width: 75px;
          height: 75px;
          object-fit: contain;
          display: block;
          margin-bottom: 5px;
        }


        .school-name {
          font-size: 17px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
        }


        .school-header-center {
          text-align: center;
          font-size: 10px;
          line-height: 1.7;
          padding: 0 8px;
        }


        .student-photo-wrapper {
          width: 90px;
          height: 105px;
          justify-self: end;
          border: 1px solid #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }


        .student-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }


        /* ================================================
           TITLE
        ================================================= */

        .document-title {
          text-align: center;
          margin: 10px 0 12px;
        }


        .document-title h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }


        .document-title p {
          margin: 3px 0 0;
          font-size: 10px;
        }


        /* ================================================
           SECTION HEADING
        ================================================= */

        .section-heading {
          background: #111827;
          color: white;
          font-weight: 800;
          font-size: 10px;
          padding: 6px 8px;
          letter-spacing: 0.3px;
        }


        /* ================================================
           INFORMATION
        ================================================= */

        .information-section {
          margin-bottom: 10px;
        }


        .information-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-left: 1px solid #9ca3af;
          border-top: 1px solid #9ca3af;
        }


        .info-item {
          min-height: 42px;
          padding: 6px 7px;
          border-right: 1px solid #9ca3af;
          border-bottom: 1px solid #9ca3af;
        }


        .info-label {
          display: block;
          font-size: 8px;
          color: #4b5563;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 3px;
        }


        .info-value {
          display: block;
          font-size: 10px;
          font-weight: 700;
          word-break: break-word;
        }


        /* ================================================
           ATTENDANCE
        ================================================= */

        .attendance-section {
          margin-bottom: 10px;
        }


        .attendance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding-top: 6px;
        }


        .attendance-box {
          border: 1px solid #9ca3af;
          padding: 7px;
          text-align: center;
        }


        .attendance-label {
          display: block;
          font-size: 8px;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          margin-bottom: 3px;
        }


        .attendance-box strong {
          font-size: 13px;
        }


        /* ================================================
           PERFORMANCE TABLE
        ================================================= */

        .performance-section {
          margin-bottom: 10px;
        }


        .performance-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
        }


        .performance-table th,
        .performance-table td {
          border: 1px solid #9ca3af;
          padding: 5px 5px;
          text-align: center;
          vertical-align: middle;
        }


        .performance-table th {
          background: #f3f4f6;
          font-size: 8px;
          font-weight: 800;
        }


        .performance-table td {
          font-size: 9px;
        }


        .performance-table .subject-column {
          width: 27%;
        }


        .performance-table .subject-name {
          text-align: left;
          font-weight: 700;
        }


        .grade-cell {
          font-weight: 800;
        }


        .no-results {
          padding: 15px !important;
          text-align: center !important;
          color: #6b7280;
        }


        /* ================================================
           SUMMARY
        ================================================= */

        .summary-section {
          margin-bottom: 10px;
        }


        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-left: 1px solid #9ca3af;
          border-top: 1px solid #9ca3af;
        }


        .summary-item {
          border-right: 1px solid #9ca3af;
          border-bottom: 1px solid #9ca3af;
          padding: 7px;
          text-align: center;
        }


        .summary-label {
          display: block;
          font-size: 8px;
          color: #4b5563;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 3px;
        }


        .summary-value {
          display: block;
          font-size: 12px;
          font-weight: 800;
        }


        /* ================================================
           COMMENTS
        ================================================= */

        .comment-section {
          margin-bottom: 10px;
        }


        .comment-box {
          min-height: 40px;
          border: 1px solid #9ca3af;
          padding: 8px;
          font-size: 10px;
          line-height: 1.5;
        }


        /* ================================================
           MANUAL SKILLS
        ================================================= */

        .manual-section {
          margin-top: 10px;
          margin-bottom: 12px;
        }


        .manual-table {
          width: 100%;
          border-collapse: collapse;
        }


        .manual-table th,
        .manual-table td {
          border: 1px solid #9ca3af;
          padding: 5px;
          text-align: center;
          font-size: 8px;
        }


        .manual-table th {
          background: #f3f4f6;
          font-weight: 800;
        }


        .manual-table td:first-child {
          text-align: left;
          font-weight: 700;
          width: 35%;
        }


        .tick-box {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 1px solid #111827;
        }


        /* ================================================
           SIGNATURES
        ================================================= */

        .signature-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 22px;
          margin-bottom: 20px;
        }


        .signature-box {
          text-align: center;
          font-size: 8px;
        }


        .signature-line {
          height: 24px;
          border-bottom: 1px solid #111827;
          margin-bottom: 5px;
        }


        .signature-box strong {
          display: block;
          font-size: 9px;
        }


        .signature-box span {
          display: block;
          margin-top: 2px;
          color: #4b5563;
        }


        /* ================================================
           FOOTER
        ================================================= */

        .report-footer {
          border-top: 1px solid #9ca3af;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          color: #4b5563;
        }


        /* ================================================
           SCREEN
        ================================================= */

        @media screen {

          .report-page {
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.12);
            margin-bottom: 40px;
          }

        }


        /* ================================================
           PRINT
        ================================================= */

        @media print {

          @page {
            size: A4;
            margin: 0;
          }


          html,
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white !important;
          }


          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }


          .report-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 10mm;
            box-shadow: none;
          }


          .school-header {
            break-inside: avoid;
            page-break-inside: avoid;
          }


          .information-section,
          .attendance-section,
          .performance-section,
          .summary-section,
          .comment-section,
          .manual-section,
          .signature-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }


          .performance-table {
            break-inside: auto;
          }


          .performance-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }


          .report-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

        }

      `}</style>
    </>
  );
};


// ==========================================================
// INFO ITEM
// ==========================================================

const InfoItem = ({ label, value }) => {
  return (
    <div className="info-item">

      <span className="info-label">
        {label}
      </span>

      <span className="info-value">
        {value || "—"}
      </span>

    </div>
  );
};


// ==========================================================
// SUMMARY ITEM
// ==========================================================

const SummaryItem = ({ label, value }) => {
  return (
    <div className="summary-item">

      <span className="summary-label">
        {label}
      </span>

      <span className="summary-value">
        {value || "—"}
      </span>

    </div>
  );
};


export default ReportCardDetails;