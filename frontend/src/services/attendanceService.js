import api from "./api";

export const getAttendanceRecords = async ({
  classLevel,
  academicSession,
  term,
  date,
  subject,
} = {}) => {
  const params = {};
  if (classLevel) params.class_level = classLevel;
  if (academicSession) params.academic_session = academicSession;
  if (term) params.term = term;
  if (date) params.date = date;
  if (subject) params.subject = subject;

  const { data } = await api.get("/attendance/", { params });
  return data;
};

export const createAttendanceRecord = async (payload) => {
  const { data } = await api.post("/attendance/", payload);
  return data;
};

export const updateAttendanceRecord = async (id, payload) => {
  const { data } = await api.put(`/attendance/${id}/`, payload);
  return data;
};

// Marks attendance for a full class roster in one call.
// Creates new records for students not yet marked, updates existing ones.
export const bulkMarkAttendance = async (records, existingRecordsMap) => {
  const requests = records.map((record) => {
    const existingId = existingRecordsMap[record.student];
    if (existingId) {
      return updateAttendanceRecord(existingId, record);
    }
    return createAttendanceRecord(record);
  });

  return Promise.all(requests);
};
