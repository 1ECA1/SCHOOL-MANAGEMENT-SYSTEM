// import api from "./api";

// export const login = async (username, password) => {
//   const { data } = await api.post("/login/", { username, password });
//   return data; // { message, refresh, access, user }
// };

// export const register = async (payload) => {
//   const { data } = await api.post("/register/", payload);
//   return data;
// };

// export const getProfile = async () => {
//   const { data } = await api.get("/profile/");
//   return data;
// };

// export const logout = () => {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("user");
// };
import api from "./api";

// =====================================================
// LOGIN
// =====================================================

export const login = async (username, password) => {
  const { data } = await api.post("/login/", {
    username,
    password,
  });

  return data;
};

// =====================================================
// REGISTER
// =====================================================

export const register = async (payload) => {
  const { data } = await api.post(
    "/register/",
    payload,
  );

  return data;
};

// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async () => {
  const { data } = await api.get("/profile/");

  return data;
};

// =====================================================
// LOGOUT
// =====================================================

export const logout = async () => {
  const { data } = await api.post("/logout/");

  return data;
};