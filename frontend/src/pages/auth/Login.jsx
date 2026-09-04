// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const panelRef = useRef(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleMouseMove = (e) => {
//     const panel = panelRef.current;
//     if (!panel) return;
//     const rect = panel.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     panel.style.setProperty("--spot-x", x + "px");
//     panel.style.setProperty("--spot-y", y + "px");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const user = await login(form.username, form.password);
//       const role = user.role ? user.role.toLowerCase() : "";

//       if (role === "school_admin" || role === "super_admin") {
//         navigate("/admin");
//       } else if (role === "teacher") {
//         navigate("/teacher");
//       } else if (role === "student") {
//         navigate("/student");
//       } else {
//         navigate("/");
//       }
//     } catch (err) {
//       const message =
//         err.response &&
//         err.response.data &&
//         err.response.data.non_field_errors &&
//         err.response.data.non_field_errors[0];
//       setError(message || "Login failed. Check your credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen w-full overflow-hidden bg-[var(--color-background)]">
//       {/* =========================================
//           LEFT — BRAND / MOUSE-FOLLOW SPOTLIGHT
//       ========================================== */}
//       <div
//         ref={panelRef}
//         onMouseMove={handleMouseMove}
//         className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex"
//         style={{
//           "--spot-x": "50%",
//           "--spot-y": "50%",
//           background:
//             "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 60%, #0f172a 100%)",
//         }}
//       >
//         {/* Mouse-follow spotlight */}
//         <div
//           className="pointer-events-none absolute inset-0 transition-opacity duration-300"
//           style={{
//             background:
//               "radial-gradient(600px circle at var(--spot-x) var(--spot-y), rgba(255,255,255,0.18), transparent 60%)",
//           }}
//         />

//         {/* Floating animated circles */}
//         <div className="pointer-events-none absolute inset-0">
//           <span className="absolute left-[8%] top-[15%] h-24 w-24 rounded-full border border-white/20 animate-[float1_9s_ease-in-out_infinite]"></span>
//           <span className="absolute left-[70%] top-[10%] h-3 w-3 rounded-full bg-white/50 animate-[float2_7s_ease-in-out_infinite]"></span>
//           <span className="absolute left-[20%] top-[70%] h-3 w-3 rounded-full bg-white/40 animate-[float3_11s_ease-in-out_infinite]"></span>
//           <span className="absolute left-[80%] top-[65%] h-40 w-40 rounded-full border border-white/10 animate-[float2_13s_ease-in-out_infinite]"></span>
//           <span className="absolute left-[45%] top-[85%] h-2 w-2 rounded-full bg-white/60 animate-[float1_6s_ease-in-out_infinite]"></span>
//           <span className="absolute -left-10 top-[40%] h-64 w-64 rounded-full border border-white/10 animate-[float3_16s_ease-in-out_infinite]"></span>
//           <span className="absolute right-[-6%] top-[5%] h-56 w-56 rounded-full bg-white/5 animate-[float1_14s_ease-in-out_infinite]"></span>
//         </div>

//         <div className="relative z-10 flex flex-col items-center px-10 text-center text-white">
//           <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 text-5xl font-extrabold shadow-2xl shadow-black/20 backdrop-blur-sm ring-1 ring-white/20">
//             E
//           </div>

//           <h1 className="text-3xl font-extrabold tracking-tight">
//             EduManageERP
//           </h1>
//           <p className="mt-1 text-sm font-medium text-white/70">
//             Excellence • Innovation • Leadership
//           </p>

//           <p className="mt-8 max-w-xs text-lg font-medium leading-snug text-white/90">
//             Structure, Clarity, Excellence
//           </p>
//           <p className="mt-2 max-w-sm text-sm text-white/60">
//             One platform for students, teachers, and administrators.
//           </p>
//         </div>

//         <style>
//           {`
//             @keyframes float1 {
//               0%, 100% { transform: translate(0, 0); }
//               50% { transform: translate(15px, -25px); }
//             }
//             @keyframes float2 {
//               0%, 100% { transform: translate(0, 0); }
//               50% { transform: translate(-20px, 20px); }
//             }
//             @keyframes float3 {
//               0%, 100% { transform: translate(0, 0) scale(1); }
//               50% { transform: translate(10px, 15px) scale(1.05); }
//             }
//           `}
//         </style>
//       </div>

//       {/* =========================================
//           RIGHT — LOGIN FORM
//       ========================================== */}
//       <div className="flex w-full items-center justify-center bg-[var(--color-card)] px-6 py-12 lg:w-1/2">
//         <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-[var(--color-card)] p-12 shadow-sm dark:border-slate-800">
//           {/* Logo — matches reference styling */}
//           <div className="mb-10 flex items-center gap-5">
//             <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] text-3xl font-bold text-white shadow-md">
//               E
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
//                 EduManageERP
//               </h1>
//               <p className="text-base font-medium text-slate-500 dark:text-slate-400">
//                 Excellence • Innovation • Leadership
//               </p>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-[var(--color-text)]">
//             Welcome back
//           </h2>
//           <p className="mt-1 mb-8 text-sm text-slate-500 dark:text-slate-400">
//             Login to your account below
//           </p>

//           {error && (
//             <div className="mb-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="relative">
//               <input
//                 name="username"
//                 value={form.username}
//                 onChange={handleChange}
//                 required
//                 autoComplete="username"
//                 placeholder="Username or Email"
//                 className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-4 py-3.5 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[#1d4ed8] dark:border-slate-700"
//               />
//               <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
//                 👤
//               </span>
//             </div>

//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//                 autoComplete="current-password"
//                 placeholder="Password"
//                 className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-4 py-3.5 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[#1d4ed8] dark:border-slate-700"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 aria-label="Toggle password visibility"
//               >
//                 {showPassword ? "🙈" : "👁"}
//               </button>
//             </div>

//             <div className="flex items-center justify-end pt-1">
//               <a
//                 href="#"
//                 className="text-xs font-medium text-[#1d4ed8] hover:underline"
//               >
//                 Forgot password?
//               </a>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-lg bg-[#1d4ed8] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
//             >
//               {loading ? "Signing in…" : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const panelRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMouseMove = (e) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    panel.style.setProperty("--spot-x", x + "px");
    panel.style.setProperty("--spot-y", y + "px");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      const role = user.role ? user.role.toLowerCase() : "";

      if (role === "school_admin" || role === "super_admin") {
        navigate("/admin");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else if (role === "student") {
        navigate("/student");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message =
        err.response &&
        err.response.data &&
        err.response.data.non_field_errors &&
        err.response.data.non_field_errors[0];
      setError(message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-background)] p-4 sm:p-6 lg:p-10">
      <div className="flex w-full max-w-8xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-card)] shadow-xl lg:flex-row dark:border-slate-800">
        {/* =========================================
            BRAND / MOUSE-FOLLOW SPOTLIGHT
            Mobile: compact top banner (always visible)
            Desktop: full-height left panel
        ========================================== */}
        <div
          ref={panelRef}
          onMouseMove={handleMouseMove}
          className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden sm:h-56 lg:h-auto lg:w-1/2"
          style={{
            "--spot-x": "50%",
            "--spot-y": "50%",
            background:
              "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 60%, #0f172a 100%)",
          }}
        >
          {/* Mouse-follow spotlight */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(600px circle at var(--spot-x) var(--spot-y), rgba(255,255,255,0.18), transparent 60%)",
            }}
          />

          {/* Floating animated circles */}
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-[8%] top-[15%] h-16 w-16 rounded-full border border-white/20 animate-[float1_9s_ease-in-out_infinite] lg:h-24 lg:w-24"></span>
            <span className="absolute left-[70%] top-[10%] h-3 w-3 rounded-full bg-white/50 animate-[float2_7s_ease-in-out_infinite]"></span>
            <span className="absolute left-[20%] top-[70%] h-3 w-3 rounded-full bg-white/40 animate-[float3_11s_ease-in-out_infinite]"></span>
            <span className="absolute left-[80%] top-[65%] h-24 w-24 rounded-full border border-white/10 animate-[float2_13s_ease-in-out_infinite] lg:h-40 lg:w-40"></span>
            <span className="absolute left-[45%] top-[85%] h-2 w-2 rounded-full bg-white/60 animate-[float1_6s_ease-in-out_infinite]"></span>
            <span className="absolute -left-10 top-[40%] h-40 w-40 rounded-full border border-white/10 animate-[float3_16s_ease-in-out_infinite] lg:h-64 lg:w-64"></span>
            <span className="absolute right-[-6%] top-[5%] h-32 w-32 rounded-full bg-white/5 animate-[float1_14s_ease-in-out_infinite] lg:h-56 lg:w-56"></span>
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center text-white lg:px-10">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold shadow-2xl shadow-black/20 backdrop-blur-sm ring-1 ring-white/20 sm:h-16 sm:w-16 sm:text-3xl lg:mb-6 lg:h-24 lg:w-24 lg:text-5xl">
              E
            </div>

            <h1 className="text-lg font-extrabold tracking-tight sm:text-xl lg:text-3xl">
              EduManageERP
            </h1>
            <p className="mt-1 text-xs font-medium text-white/70 sm:text-sm">
              Excellence • Innovation • Leadership
            </p>

            <p className="mt-4 hidden max-w-xs text-lg font-medium leading-snug text-white/90 lg:block">
              Structure, Clarity, Excellence
            </p>
            <p className="mt-2 hidden max-w-sm text-sm text-white/60 lg:block">
              One platform for students, teachers, and administrators.
            </p>
          </div>

          <style>
            {`
              @keyframes float1 {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(15px, -25px); }
              }
              @keyframes float2 {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(-20px, 20px); }
              }
              @keyframes float3 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(10px, 15px) scale(1.05); }
              }
            `}
          </style>
        </div>

        {/* =========================================
            LOGIN FORM
        ========================================== */}
        <div className="flex w-full items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:w-1/2 lg:px-14">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              Welcome back
            </h2>
            <p className="mt-1 mb-8 text-sm text-slate-500 dark:text-slate-400">
              Login to your account below
            </p>

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  placeholder="Username or Email"
                  className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-4 py-3.5 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[#1d4ed8] dark:border-slate-700"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  👤
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-4 py-3.5 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[#1d4ed8] dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              <div className="flex items-center justify-end pt-1">
                <a
                  href="#"
                  className="text-xs font-medium text-[#1d4ed8] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#1d4ed8] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
