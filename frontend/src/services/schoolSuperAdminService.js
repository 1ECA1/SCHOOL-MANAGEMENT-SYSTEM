
import api from "./api";

// =====================================================
// SCHOOL SUPER ADMIN API
// =====================================================

const BASE_URL = "/school-super-admin";

// =====================================================
// GET SCHOOL ADMIN DASHBOARD
// =====================================================

const getDashboard = async () => {
  const response = await api.get(
    `${BASE_URL}/school-admin/dashboard/`,
  );

  return response.data;
};

// =====================================================
// GET ALL SCHOOL USERS
// =====================================================

const getUsers = async () => {
  const response = await api.get(
    `${BASE_URL}/users/`,
  );

  return response.data;
};

// =====================================================
// GET SINGLE SCHOOL USER
// =====================================================

const getUser = async (userId) => {
  const response = await api.get(
    `${BASE_URL}/users/${userId}/`,
  );

  return response.data;
};

// =====================================================
// CREATE SCHOOL USER
// =====================================================

const createUser = async (userData) => {
  const response = await api.post(
    `${BASE_URL}/users/create/`,
    userData,
  );

  return response.data;
};

// =====================================================
// UPDATE SCHOOL USER
// =====================================================

const updateUser = async (userId, userData) => {
  const response = await api.patch(
    `${BASE_URL}/users/${userId}/`,
    userData,
  );

  return response.data;
};

// =====================================================
// DELETE / DEACTIVATE USER
// =====================================================

const deleteUser = async (userId) => {
  const response = await api.delete(
    `${BASE_URL}/users/${userId}/`,
  );

  return response.data;
};

// =====================================================
// EXPORT SERVICE
// =====================================================

const schoolSuperAdminService = {
  getDashboard,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

export default schoolSuperAdminService;
