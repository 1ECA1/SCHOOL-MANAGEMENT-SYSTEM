import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Topbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const displayName =
    user?.first_name ||
    user?.username ||
    "User";

  const roleLabel =
    user?.role_display ||
    user?.role ||
    "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200 bg-[var(--color-card)] px-4 sm:px-7 dark:border-slate-800">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-xl text-[var(--color-text)] transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div>
          <h1 className="m-0 text-base font-bold text-[var(--color-text)] sm:text-lg">
            Welcome to EduManageERP
          </h1>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            School Management System
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Search */}
        <div className="hidden h-10 w-44 items-center gap-2 rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 sm:flex lg:w-56 dark:border-slate-700">

          <span className="text-lg text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search here..."
            aria-label="Search"
            className="w-full border-0 bg-transparent text-xs text-[var(--color-text)] outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-base transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          🔔

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--color-card)]" />
        </button>

        {/* Messages */}
        <button
          type="button"
          aria-label="Messages"
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-[var(--color-card)] text-base transition hover:bg-slate-100 sm:flex dark:border-slate-700 dark:hover:bg-slate-800"
        >
          💬
        </button>

        {/* =================================================
            USER PROFILE
        ================================================== */}
        <div
          className="relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >

            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-white">
              {initial}
            </div>

            {/* Name + Role */}
            <div className="hidden text-left lg:block">

              <strong className="block text-xs font-semibold text-[var(--color-text)]">
                {displayName}
              </strong>

              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {roleLabel}
              </span>

            </div>

            <span className="hidden text-xs text-slate-400 lg:block">
              ▾
            </span>
          </button>

          {/* =================================================
              DROPDOWN
          ================================================== */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-48 overflow-hidden rounded-lg border border-slate-200 bg-[var(--color-card)] shadow-lg dark:border-slate-800">

              {/* User Info */}
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">

                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {displayName}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </p>

              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                ⏻ Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;