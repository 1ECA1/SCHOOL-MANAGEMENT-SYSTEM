import { useAuth } from "../../context/AuthContext";

function PrincipalProfile() {
  const { user } = useAuth();

  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Principal";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Principal Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          My Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Profile Image */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              fullName.charAt(0).toUpperCase()
            )}
          </div>

          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Principal
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Username
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user?.username || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Email
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user?.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Phone
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user?.phone_number || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Role
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user?.role_display || "Principal"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrincipalProfile;
