import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

function getImageUrl(image) {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `http://127.0.0.1:8000${image}`;
}

function LibrarianProfile() {
  const { user } = useAuth();

  const profileImage = useMemo(
    () => getImageUrl(user?.profile_image),
    [user?.profile_image],
  );

  const fullName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    "Librarian";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="m-0 text-2xl font-bold text-[var(--color-text)]">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View your librarian account and profile information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
        {/* Cover */}
        <div className="h-32 bg-[var(--color-primary)] sm:h-40" />

        <div className="px-5 pb-6 sm:px-8">
          {/* Profile Image */}
          <div className="-mt-14 flex flex-col sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="h-28 w-28 rounded-2xl border-4 border-[var(--color-card)] object-cover shadow-lg sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-[var(--color-card)] bg-[var(--color-primary)] text-3xl font-bold text-white shadow-lg sm:h-32 sm:w-32">
                  {initials || "L"}
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0">
              <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                Librarian
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="mt-5">
            <h2 className="m-0 text-xl font-bold text-[var(--color-text)]">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email || "No email address"}
            </p>
          </div>

          {/* Information */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProfileItem
              label="Username"
              value={user?.username}
            />

            <ProfileItem
              label="Email"
              value={user?.email}
            />

            <ProfileItem
              label="First Name"
              value={user?.first_name}
            />

            <ProfileItem
              label="Last Name"
              value={user?.last_name}
            />

            <ProfileItem
              label="Phone"
              value={user?.phone}
            />

            <ProfileItem
              label="Role"
              value="Librarian"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--color-background)] p-4 dark:border-slate-700">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-2 m-0 text-sm font-semibold text-[var(--color-text)]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default LibrarianProfile;