import { lazy } from "react";

const AdmissionOfficerDashboard = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerDashboard"
    )
);

const AdmissionOfficerApplicants = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerApplicants"
    )
);

const ApplicantDetails = lazy(
  () =>
    import(
      "../pages/admissionOfficer/ApplicantDetails"
    )
);

const AdmissionOfficerStudents = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerStudents"
    )
);

const StudentDetails = lazy(
  () =>
    import(
      "../pages/admissionOfficer/StudentDetails"
    )
);

const AdmissionOfficerEnrollment = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerEnrollment"
    )
);

const AdmissionOfficerPromotion = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerPromotion"
    )
);

const AdmissionOfficerProfile = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerProfile"
    )
);

const AdmissionOfficerSettings = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerSettings"
    )
);

const RegisterWalkInApplicant = lazy(
  () =>
    import(
      "../pages/admissionOfficer/RegisterWalkInApplicant"
    )
);

const ApplicantEdit = lazy(
  () =>
    import(
      "../pages/admissionOfficer/ApplicantEdit"
    )
);

// =====================================================
// NOTIFICATIONS
// =====================================================

const AdmissionOfficerNotifications = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerNotifications"
    )
);

const AdmissionOfficerNotificationDetails = lazy(
  () =>
    import(
      "../pages/admissionOfficer/AdmissionOfficerNotificationDetails"
    )
);

// =====================================================
// ROUTES
// =====================================================

export const admissionOfficerRoutes = [
  {
    index: true,
    element: <AdmissionOfficerDashboard />,
  },

  // ===================================================
  // APPLICANTS
  // ===================================================

  {
    path: "applicants",
    element: <AdmissionOfficerApplicants />,
  },

  {
    path: "applicants/register",
    element: <RegisterWalkInApplicant />,
  },

  {
    path: "applicants/:id",
    element: <ApplicantDetails />,
  },

  {
    path: "applicants/:id/edit",
    element: <ApplicantEdit />,
  },

  // ===================================================
  // STUDENTS
  // ===================================================

  {
    path: "students",
    element: <AdmissionOfficerStudents />,
  },

  {
    path: "students/:id",
    element: <StudentDetails />,
  },

  // ===================================================
  // STUDENT MANAGEMENT
  // ===================================================

  {
    path: "enrollment",
    element: <AdmissionOfficerEnrollment />,
  },

  {
    path: "promotion",
    element: <AdmissionOfficerPromotion />,
  },

  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  {
    path: "notifications",
    element: <AdmissionOfficerNotifications />,
  },

  {
    path: "notifications/:id",
    element: <AdmissionOfficerNotificationDetails />,
  },

  // ===================================================
  // PROFILE
  // ===================================================

  {
    path: "profile",
    element: <AdmissionOfficerProfile />,
  },

  // ===================================================
  // SETTINGS
  // ===================================================

  {
    path: "settings",
    element: <AdmissionOfficerSettings />,
  },
];