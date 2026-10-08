import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  UserCircle,
  Receipt,
  CreditCard,
  FileText,
  Wallet,
  Tags,
  BadgeDollarSign,
  BarChart3,
  Bell,
  LogOut,
  X,
} from "lucide-react";

function AccountantSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [expensesOpen, setExpensesOpen] = useState(
    window.location.pathname.startsWith("/accountant/expenses") ||
      window.location.pathname.startsWith(
        "/accountant/expense-categories",
      ),
  );

  const menuItems = [
    {
      name: "Dashboard",
      path: "/accountant",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      path: "/accountant/profile",
      icon: UserCircle,
    },
    {
      name: "Fee Categories",
      path: "/accountant/fee-categories",
      icon: Tags,
    },
    {
      name: "Fee Structures",
      path: "/accountant/fee-structures",
      icon: BadgeDollarSign,
    },
    {
      name: "Invoices",
      path: "/accountant/invoices",
      icon: Receipt,
    },
    {
      name: "Payments",
      path: "/accountant/payments",
      icon: CreditCard,
    },
    {
      name: "Scholarships",
      path: "/accountant/scholarships",
      icon: Wallet,
    },
    {
      name: "Notifications",
      path: "/accountant/notifications",
      icon: Bell,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col
        bg-[var(--color-sidebar)] text-white shadow-xl
        transition-transform duration-300
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-xl font-bold">
              ₦
            </div>

            <div>
              <h1 className="text-lg font-bold">EduManageERP</h1>
              <p className="text-xs text-slate-400">
                Accountant Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] font-semibold">
              {user?.first_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {user?.first_name || "Accountant"}{" "}
                {user?.last_name || ""}
              </p>

              <p className="truncate text-xs text-slate-400">
                Finance Officer
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Finance Management
          </p>

          <div className="space-y-1">
            {/* Main menu items */}
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/accountant"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} className="shrink-0" />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Expenses Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => setExpensesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <FileText size={19} className="shrink-0" />

                  <span>Expenses</span>
                </div>
              </button>

              {/* Expenses submenu */}
              {expensesOpen && (
                <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                  <NavLink
                    to="/accountant/expenses"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    Expenses
                  </NavLink>

                  <NavLink
                    to="/accountant/expense-categories"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    Expense Categories
                  </NavLink>
                </div>
              )}
            </div>

            {/* Financial Reports */}
            <NavLink
              to="/accountant/reports"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <BarChart3 size={19} className="shrink-0" />

              <span>Financial Reports</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AccountantSidebar;