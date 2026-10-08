import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Lock,
  Search,
  Shield,
  Users,
} from "lucide-react";

const ROLE_PERMISSIONS = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description:
      "Full system access across all schools, users, modules and administrative functions.",
    level: "Full System Access",
    permissions: {
      Dashboard: "Full Access",
      People: "Full Access",
      Academics: "Full Access",
      "Student Management": "Full Access",
      Attendance: "Full Access",
      Assignments: "Full Access",
      "Examinations & Results": "Full Access",
      Finance: "Full Access",
      Notifications: "Full Access",
      "Reports & Audit": "Full Access",
      Settings: "Full Access",
    },
  },

  {
    role: "SCHOOL_ADMIN",
    label: "School Admin",
    description:
      "Full administrative access within the assigned school.",
    level: "Full School Access",
    permissions: {
      Dashboard: "Full Access",
      People: "Full Access",
      Academics: "Full Access",
      "Student Management": "Full Access",
      Attendance: "Full Access",
      Assignments: "Full Access",
      "Examinations & Results": "Full Access",
      Finance: "Full Access",
      Notifications: "Full Access",
      "Reports & Audit": "Full Access",
      Settings: "Full Access",
    },
  },

  {
    role: "PRINCIPAL",
    label: "Principal",
    description:
      "School leadership access with oversight of academic and administrative activities.",
    level: "Management Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "View",
      Attendance: "View",
      Assignments: "View",
      "Examinations & Results": "Full Access",
      Finance: "Read Only",
      Notifications: "Management Access",
      "Reports & Audit": "View",
      Settings: "View",
    },
  },

  {
    role: "TEACHER",
    label: "Teacher",
    description:
      "Access to assigned classes, subjects, assignments, attendance and results.",
    level: "Teaching Access",
    permissions: {
      Dashboard: "View",
      People: "Assigned Students",
      Academics: "Assigned Subjects",
      "Student Management": "Assigned Students",
      Attendance: "Assigned Classes",
      Assignments: "Full Access",
      "Examinations & Results": "Assigned Subjects",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "STUDENT",
    label: "Student",
    description:
      "Access to the student's own academic and school information.",
    level: "Student Access",
    permissions: {
      Dashboard: "View Own",
      People: "View Own Profile",
      Academics: "View Own",
      "Student Management": "View Own",
      Attendance: "View Own",
      Assignments: "View / Submit",
      "Examinations & Results": "View Own",
      Finance: "View Own",
      Notifications: "View",
      "Reports & Audit": "No Access",
      Settings: "View Profile",
    },
  },

  {
    role: "PARENT",
    label: "Parent / Guardian",
    description:
      "Access to information belonging to linked students.",
    level: "Parent Access",
    permissions: {
      Dashboard: "View",
      People: "View Linked Students",
      Academics: "View Linked Students",
      "Student Management": "View Linked Students",
      Attendance: "View Linked Students",
      Assignments: "View Linked Students",
      "Examinations & Results": "View Linked Students",
      Finance: "View Linked Students",
      Notifications: "View",
      "Reports & Audit": "No Access",
      Settings: "View Profile",
    },
  },

  {
    role: "ACCOUNTANT",
    label: "Finance Officer / Bursar",
    description:
      "Manages and monitors school financial operations.",
    level: "Finance Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "View",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "No Access",
      Finance: "Full Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "ADMISSION_OFFICER",
    label: "Admission Officer",
    description:
      "Manages student admission and admission-related records.",
    level: "Admissions Access",
    permissions: {
      Dashboard: "View",
      People: "Admission Access",
      Academics: "View",
      "Student Management": "Admission Access",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "No Access",
      Finance: "Limited Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "LIBRARIAN",
    label: "Librarian",
    description:
      "Manages library-related activities and records.",
    level: "Library Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "View",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "No Access",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "EXAM_OFFICER",
    label: "Exam / Assessment Officer",
    description:
      "Manages examinations, examination subjects and result processes.",
    level: "Examination Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "View",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "Full Access",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "COUNSELOR",
    label: "Guidance Counselor",
    description:
      "Access to student guidance and counseling activities.",
    level: "Counseling Access",
    permissions: {
      Dashboard: "View",
      People: "Student Access",
      Academics: "View",
      "Student Management": "Student Access",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "View",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "HOSTEL_MANAGER",
    label: "Hostel Manager",
    description:
      "Manages hostel and boarding-related activities.",
    level: "Hostel Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "Hostel Students",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "No Access",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },

  {
    role: "TRANSPORT_MANAGER",
    label: "Transport Manager",
    description:
      "Manages school transportation activities.",
    level: "Transport Access",
    permissions: {
      Dashboard: "View",
      People: "View",
      Academics: "View",
      "Student Management": "Transport Students",
      Attendance: "View",
      Assignments: "No Access",
      "Examinations & Results": "No Access",
      Finance: "No Access",
      Notifications: "View",
      "Reports & Audit": "View",
      Settings: "View Profile",
    },
  },
];

const getPermissionClasses = (permission) => {
  const normalized = permission.toLowerCase();

  if (
    normalized.includes("full") ||
    normalized.includes("management access")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized.includes("view") ||
    normalized.includes("assigned") ||
    normalized.includes("limited") ||
    normalized.includes("student access") ||
    normalized.includes("hostel") ||
    normalized.includes("transport") ||
    normalized.includes("admission") ||
    normalized.includes("linked") ||
    normalized.includes("own") ||
    normalized.includes("read only")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized.includes("no access")) {
    return "bg-gray-100 text-gray-500";
  }

  return "bg-amber-100 text-amber-700";
};

const UserPermissions = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(
    ROLE_PERMISSIONS[0].role
  );

  const filteredRoles = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return ROLE_PERMISSIONS;
    }

    return ROLE_PERMISSIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(value) ||
        item.role.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value)
    );
  }, [search]);

  const selectedRoleData =
    ROLE_PERMISSIONS.find(
      (item) => item.role === selectedRole
    ) || ROLE_PERMISSIONS[0];

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-3">
              <Shield
                size={24}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                User Permissions
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review system-wide access rights assigned to each
                user role.
              </p>
            </div>
          </div>
        </div>

        {/* SYSTEM-WIDE INFORMATION */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Lock
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-blue-900">
                System-wide role-based access control
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                The Super Admin can review the permissions assigned
                to every role across the EduManageERP system. These
                permissions describe the responsibilities and access
                level associated with each role.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm sm:p-5">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Search Roles
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by role name..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* SYSTEM ROLES */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Users size={19} className="text-gray-500" />

                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  System Roles
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Select a role to view its system access rights.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredRoles.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500">
                  No roles match your search.
                </div>
              ) : (
                filteredRoles.map((role) => {
                  const selected =
                    role.role === selectedRole;

                  return (
                    <button
                      key={role.role}
                      type="button"
                      onClick={() =>
                        setSelectedRole(role.role)
                      }
                      className={`w-full px-5 py-4 text-left transition ${
                        selected
                          ? "bg-[var(--color-primary)]/10"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              selected
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)]"
                            }`}
                          >
                            {role.label}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {role.level}
                          </p>
                        </div>

                        <ChevronDown
                          size={17}
                          className={`shrink-0 transition ${
                            selected
                              ? "rotate-[-90deg] text-[var(--color-primary)]"
                              : "rotate-[-90deg] text-gray-300"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* PERMISSION DETAILS */}
          <div className="min-w-0 xl:col-span-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
              <div className="border-b border-gray-200 px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 rounded-lg bg-[var(--color-primary)]/10 p-2.5">
                        <Shield
                          size={21}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
                          {selectedRoleData.label}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {selectedRoleData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                    {selectedRoleData.level}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {Object.entries(
                  selectedRoleData.permissions
                ).map(([module, permission]) => (
                  <div
                    key={module}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {module}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Access level for this module
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getPermissionClasses(
                          permission
                        )}`}
                      >
                        {permission !== "No Access" && (
                          <CheckCircle2 size={14} />
                        )}

                        <span>{permission}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PERMISSION SUMMARY */}
        <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Permission Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The selected role currently has access to{" "}
            {Object.keys(selectedRoleData.permissions).length}{" "}
            system modules.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Role"
              value={selectedRoleData.label}
            />

            <SummaryCard
              label="Modules"
              value={
                Object.keys(
                  selectedRoleData.permissions
                ).length
              }
            />

            <SummaryCard
              label="Access Type"
              value={selectedRoleData.level}
            />

            <SummaryCard
              label="Configuration"
              value="Role Based"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
    </p>

    <p className="mt-1 break-words text-base font-semibold text-[var(--color-text)]">
      {value}
    </p>
  </div>
);

export default UserPermissions;