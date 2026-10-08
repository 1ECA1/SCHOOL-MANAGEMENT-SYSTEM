
import api from "./api";

// =====================================================
// ATTENDANCE RECORDS
// =====================================================

export const getAttendance = async (params = {}) => {
  const { data } = await api.get("/attendance/", {
    params,
  });

  return data;
};

export const getAttendanceRecord = async (id) => {
  const { data } = await api.get(`/attendance/${id}/`);
  return data;
};

export const createAttendance = async (attendanceData) => {
  const { data } = await api.post(
    "/attendance/",
    attendanceData,
  );

  return data;
};

export const updateAttendance = async (
  id,
  attendanceData,
) => {
  const { data } = await api.patch(
    `/attendance/${id}/`,
    attendanceData,
  );

  return data;
};

export const deleteAttendance = async (id) => {
  await api.delete(`/attendance/${id}/`);
};

// =====================================================
// ATTENDANCE SUMMARY
// =====================================================

export const getAttendanceSummary = async (
  studentId,
  academicSessionId,
  termId,
  classLevelId,
) => {
  const { data } = await api.get(
    `/attendance/summary/${studentId}/${academicSessionId}/${termId}/${classLevelId}/`,
  );

  return data;
};


export const getAttendanceSettings = async () => {
  const { data } = await api.get("/attendance/settings/");
  return data;
};

export const getAttendanceSetting = async (id) => {
  const { data } = await api.get(`/attendance/settings/${id}/`);
  return data;
};

export const createAttendanceSetting = async (settingData) => {
  const { data } = await api.post(
    "/attendance/settings/",
    settingData
  );
  return data;
};

export const updateAttendanceSetting = async (
  id,
  settingData
) => {
  const { data } = await api.patch(
    `/attendance/settings/${id}/`,
    settingData
  );
  return data;
};

export const deleteAttendanceSetting = async (id) => {
  const { data } = await api.delete(
    `/attendance/settings/${id}/`
  );
  return data;
};