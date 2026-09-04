// // import { Suspense } from "react";
// // import { Routes, Route } from "react-router-dom";
// // import AdminLayout from "../layouts/AdminLayout";
// // import ProtectedRoute from "./ProtectedRoute";
// // import RoleRoute from "./RoleRoute";
// // import { adminRoutes } from "./adminRoutes";

// // function AppRoutes() {
// //   return (
// //     <Routes>
// //       {/* ...public + auth routes... */}

// //       <Route
// //         path="/admin"
// //         element={
// //           <ProtectedRoute>
// //             <RoleRoute allowed={["admin"]}>
// //               <AdminLayout />
// //             </RoleRoute>
// //           </ProtectedRoute>
// //         }
// //       >
// //         {adminRoutes.map((route) => (
// //           <Route
// //             key={route.path || "index"}
// //             path={route.path}
// //             index={route.index}
// //             element={
// //               <Suspense fallback={<div className="p-6">Loading…</div>}>
// //                 {route.element}
// //               </Suspense>
// //             }
// //           />
// //         ))}
// //       </Route>
// //     </Routes>
// //   );
// // }

// // export default AppRoutes;

// import { Suspense } from "react";
// import { Routes, Route } from "react-router-dom";
// import PublicLayout from "../layouts/PublicLayout";
// import AdminLayout from "../layouts/AdminLayout";
// import Home from "../pages/public/Home";
// // import ProtectedRoute from "./ProtectedRoute";
// // import RoleRoute from "./RoleRoute";
// import { adminRoutes } from "./adminRoutes";

// function AppRoutes() {
//   return (
//     <Routes>
//       {/* =========================
//           PUBLIC WEBSITE
//       ========================= */}
//       <Route element={<PublicLayout />}>
//         <Route path="/" element={<Home />} />
//       </Route>

//       {/* =========================
//           ADMIN / ERP
//       ========================= */}
//       <Route
//         path="/admin"
//         element={
//           // Temporarily bypassed until AuthContext + login flow exist:
//           // <ProtectedRoute>
//           //   <RoleRoute allowed={["admin"]}>
//           <AdminLayout />
//           //   </RoleRoute>
//           // </ProtectedRoute>
//         }
//       >
//         {adminRoutes.map((route) => (
//           <Route
//             key={route.path || "index"}
//             path={route.path}
//             index={route.index}
//             element={
//               <Suspense fallback={<div className="p-6">Loading…</div>}>
//                 {route.element}
//               </Suspense>
//             }
//           />
//         ))}
//       </Route>
//     </Routes>
//   );
// }

// export default AppRoutes;

import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { adminRoutes } from "./adminRoutes";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["school_admin", "super_admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {adminRoutes.map((route) => (
          <Route
            key={route.path || "index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
