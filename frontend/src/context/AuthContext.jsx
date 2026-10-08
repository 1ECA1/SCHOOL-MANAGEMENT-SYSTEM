// import { createContext, useContext, useState, useEffect } from "react";
// import * as authService from "../services/authService";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const token = localStorage.getItem("access_token");

//     if (storedUser && token) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (username, password) => {
//     const data = await authService.login(username, password);
//     localStorage.setItem("access_token", data.access);
//     localStorage.setItem("refresh_token", data.refresh);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     setUser(data.user);
//     return data.user;
//   };

//   const logout = () => {
//     authService.logout();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, login, logout, isAuthenticated: !!user }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// }






// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
// } from "react";

// import * as authService from "../services/authService";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ===================================================
//   // RESTORE LOGIN WHEN PAGE IS REFRESHED
//   // ===================================================

//   useEffect(() => {
//     const storedUser = sessionStorage.getItem("user");
//     const token = sessionStorage.getItem("access_token");

//     if (storedUser && token) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         sessionStorage.removeItem("user");
//         sessionStorage.removeItem("access_token");
//         sessionStorage.removeItem("refresh_token");
//       }
//     }

//     setLoading(false);
//   }, []);

//   // ===================================================
//   // LOGIN
//   // ===================================================

//   const login = async (username, password) => {
//     const data = await authService.login(
//       username,
//       password,
//     );

//     sessionStorage.setItem(
//       "access_token",
//       data.access,
//     );

//     sessionStorage.setItem(
//       "refresh_token",
//       data.refresh,
//     );

//     sessionStorage.setItem(
//       "user",
//       JSON.stringify(data.user),
//     );

//     setUser(data.user);

//     return data.user;
//   };

//   // ===================================================
//   // LOGOUT
//   // ===================================================

//   const logout = () => {
//     authService.logout();

//     setUser(null);
//   };

//   // ===================================================
//   // AUTH CONTEXT
//   // ===================================================

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // =====================================================
// // USE AUTH HOOK
// // =====================================================

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth must be used within AuthProvider",
//     );
//   }

//   return context;
// }


import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // RESTORE LOGIN WHEN PAGE IS REFRESHED
  // ===================================================

  useEffect(() => {
    const storedUser =
      sessionStorage.getItem("user");

    const accessToken =
      sessionStorage.getItem("access_token");

    const refreshToken =
      sessionStorage.getItem("refresh_token");

    if (
      storedUser &&
      accessToken &&
      refreshToken
    ) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Failed to restore authenticated user:",
          error,
        );

        sessionStorage.removeItem("user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      }
    }

    setLoading(false);
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (username, password) => {
    const data = await authService.login(
      username,
      password,
    );

    sessionStorage.setItem(
      "access_token",
      data.access,
    );

    sessionStorage.setItem(
      "refresh_token",
      data.refresh,
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(data.user),
    );

    setUser(data.user);

    return data.user;
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = async () => {
    try {
      // Tell Django about the logout first.
      await authService.logout();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error,
      );
    } finally {
      // Always clear the local session, even if
      // the backend logout request fails.
      sessionStorage.removeItem(
        "access_token",
      );

      sessionStorage.removeItem(
        "refresh_token",
      );

      sessionStorage.removeItem(
        "user",
      );

      setUser(null);
    }
  };

  // ===================================================
  // AUTH CONTEXT
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH HOOK
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }

  return context;
}