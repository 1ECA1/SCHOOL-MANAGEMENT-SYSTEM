import api from "./api";

// ============================================================
// GRADE SCALES
// ============================================================

export const getGradeScales = async () => {
  const { data } = await api.get("/results/grade-scales/");
  return data;
};

export const getGradeScale = async (id) => {
  const { data } = await api.get(`/results/grade-scales/${id}/`);
  return data;
};

export const createGradeScale = async (data) => {
  const response = await api.post("/results/grade-scales/", data);
  return response.data;
};

export const updateGradeScale = async (id, data) => {
  const response = await api.put(`/results/grade-scales/${id}/`, data);
  return response.data;
};

export const deleteGradeScale = async (id) => {
  const response = await api.delete(`/results/grade-scales/${id}/`);
  return response.data;
};


// ============================================================
// STUDENT RESULTS
// ============================================================

export const getStudentResults = async () => {
  const { data } = await api.get("/results/student-results/");
  return data;
};

export const getStudentResult = async (id) => {
  const { data } = await api.get(
    `/results/student-results/${id}/`
  );

  return data;
};

export const createStudentResult = async (resultData) => {
  const { data } = await api.post(
    "/results/student-results/",
    resultData
  );

  return data;
};

export const updateStudentResult = async (id, resultData) => {
  const response = await api.patch(`/results/student-results/${id}/`, resultData);
  return response.data;
};

export const deleteStudentResult = async (id) => {
  const { data } = await api.delete(
    `/results/student-results/${id}/`
  );

  return data;
};


// ============================================================
// REPORT CARDS
// ============================================================

export const getReportCards = async () => {
  const { data } = await api.get(
    "/results/report-cards/"
  );

  return data;
};

export const getReportCard = async (id) => {
  const { data } = await api.get(
    `/results/report-cards/${id}/`
  );

  return data;
};

export const createReportCard = async (data) => {
  const response = await api.post(
    "/results/report-cards/",
    data
  );

  return response.data;
};

export const updateReportCard = async (id, data) => {
  const response = await api.patch(
    `/results/report-cards/${id}/`,
    data
  );

  return response.data;
};

export const deleteReportCard = async (id) => {
  const response = await api.delete(
    `/results/report-cards/${id}/`
  );

  return response.data;
};

// ============================================================
// LOGGED-IN STUDENT REPORT CARDS
// ============================================================

export const getMyReportCards = async () => {
  const { data } = await api.get(
    "/results/my-report-cards/"
  );

  return data;
};

export const getMyReportCard = async (id) => {
  const { data } = await api.get(
    `/results/my-report-cards/${id}/`
  );

  return data;
};