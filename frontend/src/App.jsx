// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import PublicLayout from "./layouts/PublicLayout";
// import AdminLayout from "./layouts/AdminLayout";

// import Home from "./pages/public/Home";
// import Dashboard from "./pages/admin/Dashboard";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* =========================
//             PUBLIC WEBSITE
//         ========================= */}
//         <Route element={<PublicLayout />}>
//           <Route path="/" element={<Home />} />
//         </Route>

//         {/* =========================
//             ADMIN / ERP
//         ========================= */}
//         <Route path="/admin" element={<AdminLayout />}>
//           <Route index element={<Dashboard />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
