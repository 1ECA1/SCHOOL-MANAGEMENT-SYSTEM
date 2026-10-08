import api from "./api";

const BASE_URL = "/assignments/";
const STUDENT_ASSIGNMENTS_URL =
  "/assignments/student/";

const SUBMISSIONS_URL =
  "/assignments/submissions/";

const STUDENT_SUBMISSIONS_URL =
  "/assignments/student/submissions/";

// ============================================================
// ASSIGNMENTS SERVICE
// ============================================================

const assignmentsService = {

  // ==========================================================
  // ADMIN / TEACHER ASSIGNMENTS
  // ==========================================================

  // ----------------------------------------------------------
  // Get all assignments
  // ----------------------------------------------------------

  getAll: async (params = {}) => {
    const { data } = await api.get(
      BASE_URL,
      {
        params,
      }
    );

    return data;
  },

  // ----------------------------------------------------------
  // Get one assignment
  // ----------------------------------------------------------

  getById: async (id) => {
    const { data } = await api.get(
      `${BASE_URL}${id}/`
    );

    return data;
  },

  // ----------------------------------------------------------
  // Create assignment
  // ----------------------------------------------------------

  create: async (payload) => {

    // FormData
    if (payload instanceof FormData) {
      const { data } = await api.post(
        BASE_URL,
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Object containing file
    if (
      payload?.attachment instanceof File
    ) {
      const formData = new FormData();

      Object.entries(payload).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            formData.append(
              key,
              value
            );
          }
        }
      );

      const { data } = await api.post(
        BASE_URL,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Normal JSON
    const { data } = await api.post(
      BASE_URL,
      payload
    );

    return data;
  },

  // ----------------------------------------------------------
  // Update assignment
  // ----------------------------------------------------------

  update: async (id, payload) => {

    // FormData
    if (payload instanceof FormData) {
      const { data } = await api.patch(
        `${BASE_URL}${id}/`,
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Normal JSON
    const { data } = await api.patch(
      `${BASE_URL}${id}/`,
      payload
    );

    return data;
  },

  // ----------------------------------------------------------
  // Delete assignment
  // ----------------------------------------------------------

  remove: async (id) => {
    await api.delete(
      `${BASE_URL}${id}/`
    );
  },


  // ==========================================================
  // STUDENT ASSIGNMENTS
  // ==========================================================

  // ----------------------------------------------------------
  // Get assignments for logged-in student
  //
  // GET:
  // /api/assignments/student/
  //
  // The backend automatically determines the student
  // from the authenticated user's student_id.
  // ----------------------------------------------------------

  getStudentAssignments: async () => {
    const { data } = await api.get(
      STUDENT_ASSIGNMENTS_URL
    );

    return data;
  },

  // ----------------------------------------------------------
  // Get one assignment for logged-in student
  //
  // GET:
  // /api/assignments/student/<id>/
  // ----------------------------------------------------------

  getStudentAssignmentById: async (id) => {
    const { data } = await api.get(
      `${STUDENT_ASSIGNMENTS_URL}${id}/`
    );

    return data;
  },


  // ==========================================================
  // SUBMISSIONS (ADMIN / TEACHER)
  //
  // These hit /api/assignments/submissions/, which is
  // restricted to SUPER_ADMIN / TEACHER via
  // IsAssignmentManager. Students will get 403 here.
  // ==========================================================

  // ----------------------------------------------------------
  // Get submissions
  //
  // Example:
  //
  // getSubmissions()
  //
  // or:
  //
  // getSubmissions({ assignment: 1 })
  // ----------------------------------------------------------

  getSubmissions: async (params = {}) => {
    const { data } = await api.get(
      SUBMISSIONS_URL,
      {
        params,
      }
    );

    return data;
  },

  // ----------------------------------------------------------
  // Get one submission
  // ----------------------------------------------------------

  getSubmissionById: async (id) => {
    const { data } = await api.get(
      `${SUBMISSIONS_URL}${id}/`
    );

    return data;
  },

  // ----------------------------------------------------------
  // Update submission (admin/teacher — e.g. grading)
  // ----------------------------------------------------------

  updateSubmission: async (
    id,
    payload
  ) => {

    // FormData
    if (payload instanceof FormData) {
      const { data } = await api.patch(
        `${SUBMISSIONS_URL}${id}/`,
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Normal JSON
    const { data } = await api.patch(
      `${SUBMISSIONS_URL}${id}/`,
      payload
    );

    return data;
  },

  // ----------------------------------------------------------
  // Delete submission
  // ----------------------------------------------------------

  deleteSubmission: async (id) => {
    await api.delete(
      `${SUBMISSIONS_URL}${id}/`
    );
  },


  // ==========================================================
  // STUDENT SUBMISSIONS
  //
  // These hit /api/assignments/student/submissions/, which
  // is the correct endpoint for a logged-in student to
  // create/view/update their own submissions.
  // ==========================================================

  // ----------------------------------------------------------
  // Get logged-in student's submissions
  // ----------------------------------------------------------

  getMySubmissions: async (params = {}) => {
    const { data } = await api.get(
      STUDENT_SUBMISSIONS_URL,
      {
        params,
      }
    );

    return data;
  },

  // ----------------------------------------------------------
  // Get one of the logged-in student's submissions
  // ----------------------------------------------------------

  getMySubmissionById: async (id) => {
    const { data } = await api.get(
      `${STUDENT_SUBMISSIONS_URL}${id}/`
    );

    return data;
  },

  // ----------------------------------------------------------
  // Create submission (student)
  // ----------------------------------------------------------

  createSubmission: async (payload) => {

    // FormData
    if (payload instanceof FormData) {
      const { data } = await api.post(
        STUDENT_SUBMISSIONS_URL,
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Object containing submission file
    if (
      payload?.submission_file instanceof File
    ) {
      const formData = new FormData();

      Object.entries(payload).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            formData.append(
              key,
              value
            );
          }
        }
      );

      const { data } = await api.post(
        STUDENT_SUBMISSIONS_URL,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Normal JSON
    const { data } = await api.post(
      STUDENT_SUBMISSIONS_URL,
      payload
    );

    return data;
  },

  // ----------------------------------------------------------
  // Update submission (student — resubmission)
  // ----------------------------------------------------------

  updateMySubmission: async (
    id,
    payload
  ) => {

    // FormData
    if (payload instanceof FormData) {
      const { data } = await api.patch(
        `${STUDENT_SUBMISSIONS_URL}${id}/`,
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return data;
    }

    // Normal JSON
    const { data } = await api.patch(
      `${STUDENT_SUBMISSIONS_URL}${id}/`,
      payload
    );

    return data;
  },
};

export default assignmentsService;