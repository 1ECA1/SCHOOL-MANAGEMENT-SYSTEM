import api from "./api";

// =====================================================
// EXAMINATIONS
// =====================================================

// Get all examinations
export const getExaminations = async () => {
  const response = await api.get("/examinations/");
  return response.data;
};

// Get a single examination
export const getExamination = async (id) => {
  const response = await api.get(`/examinations/${id}/`);
  return response.data;
};

// Create examination
export const createExamination = async (data) => {
  const response = await api.post("/examinations/", data);
  return response.data;
};

// Update examination
export const updateExamination = async (id, data) => {
  const response = await api.put(
    `/examinations/${id}/`,
    data,
  );

  return response.data;
};

// Partial update examination
export const patchExamination = async (id, data) => {
  const response = await api.patch(
    `/examinations/${id}/`,
    data,
  );

  return response.data;
};

// Delete examination
export const deleteExamination = async (id) => {
  const response = await api.delete(
    `/examinations/${id}/`,
  );

  return response.data;
};


// =====================================================
// EXAMINATION SUBJECTS
// =====================================================

// Get all examination subjects
export const getExaminationSubjects = async () => {
  const response = await api.get(
    "/examinations/subjects/",
  );

  return response.data;
};

// Get one examination subject
export const getExaminationSubject = async (id) => {
  const response = await api.get(
    `/examinations/subjects/${id}/`,
  );

  return response.data;
};

// Add subject to examination
export const createExaminationSubject = async (data) => {
  const response = await api.post(
    "/examinations/subjects/",
    data,
  );

  return response.data;
};

// Update examination subject
export const updateExaminationSubject = async (
  id,
  data,
) => {
  const response = await api.put(
    `/examinations/subjects/${id}/`,
    data,
  );

  return response.data;
};

// Partial update examination subject
export const patchExaminationSubject = async (
  id,
  data,
) => {
  const response = await api.patch(
    `/examinations/subjects/${id}/`,
    data,
  );

  return response.data;
};

// Delete examination subject
export const deleteExaminationSubject = async (id) => {
  const response = await api.delete(
    `/examinations/subjects/${id}/`,
  );

  return response.data;
};