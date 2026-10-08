import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentParents } from "../../services/studentsService";

const API_BASE_URL = "http://127.0.0.1:8000";

const StudentParents = () => {
  const { user } = useAuth();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParents = async () => {
      if (!user?.student_id) {
        setError("No student profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getStudentParents(user.student_id);

        const parentList = Array.isArray(response)
          ? response
          : response?.results || [];

        setParents(parentList);
      } catch (err) {
        console.error("Failed to load parent information:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load parent or guardian information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadParents();
  }, [user?.student_id]);

  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const getInitials = (name) => {
    if (!name) return "PG";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatValue = (value) => {
    return value && String(value).trim() ? value : "Not provided";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />

                  <div className="space-y-2">
                    <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800 dark:text-red-300">
                  Unable to load parent information
                </h2>

                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-4-4h-1m-3 6H3v-2a4 4 0 014-4h4a4 4 0 014 4v2zm-2-10a4 4 0 11-8 0 4 4 0 018 0zm7 2a3 3 0 10-6 0"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Parent / Guardian
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  View your registered parent and guardian information.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            {parents.length}{" "}
            {parents.length === 1 ? "Parent / Guardian" : "Parents / Guardians"}
          </div>
        </div>

        {/* Empty State */}
        {parents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-[var(--color-card)] px-6 py-16 text-center shadow-sm dark:border-slate-700">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-4-4h-1m-3 6H3v-2a4 4 0 014-4h4a4 4 0 014 4v2zm-2-10a4 4 0 11-8 0 4 4 0 018 0zm7 2a3 3 0 10-6 0"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[var(--color-text)]">
              No Parent or Guardian Information
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              No parent or guardian information has been registered for your
              student profile yet. Please contact the school administration.
            </p>
          </div>
        ) : (
          /* Parent Cards */
          <div className="grid gap-6 lg:grid-cols-2">
            {parents.map((parent) => {
              const imageUrl = getImageUrl(
                parent.profile_image || parent.profileImage,
              );

              const name =
                parent.full_name ||
                parent.fullName ||
                "Parent / Guardian";

              const relationship =
                parent.relationship || "Parent / Guardian";

              return (
                <div
                  key={parent.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm transition-shadow hover:shadow-md dark:border-slate-700"
                >
                  {/* Card Header */}
                  <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="h-16 w-16 rounded-full object-cover ring-4 ring-[var(--color-primary)]/10"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white ring-4 ring-[var(--color-primary)]/10">
                          {getInitials(name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[var(--color-text)]">
                          {name}
                        </h2>

                        <span className="mt-1 inline-flex rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-secondary)]">
                          {relationship}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                    <InfoItem
                      icon="phone"
                      label="Phone"
                      value={formatValue(
                        parent.phone_number || parent.phone,
                      )}
                    />

                    <InfoItem
                      icon="email"
                      label="Email"
                      value={formatValue(parent.email)}
                    />

                    <InfoItem
                      icon="work"
                      label="Occupation"
                      value={formatValue(parent.occupation)}
                    />

                    <InfoItem
                      icon="emergency"
                      label="Emergency Contact"
                      value={formatValue(parent.emergency_contact)}
                    />

                    <div className="sm:col-span-2">
                      <InfoItem
                        icon="location"
                        label="Address"
                        value={formatValue(parent.address)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information Notice */}
        {parents.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
            <div className="mt-0.5 shrink-0 text-[var(--color-primary)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                />
              </svg>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              This information is provided by the school and is read-only from
              the student portal. Contact the school administration if any
              information needs to be updated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => {
  const icons = {
    phone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.087l-4.423-.98a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38 12.035 12.035 0 01-7.43-7.43 1.125 1.125 0 01.38-1.21l1.293-.97c.395-.296.565-.802.417-1.173l-.98-4.423A1.125 1.125 0 006.622 2.25H5.25A2.25 2.25 0 003 4.5v2.25z"
        />
      </svg>
    ),

    email: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-8.69 5.793a2.25 2.25 0 01-2.495 0L2.25 6.75"
        />
      </svg>
    ),

    work: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V14.15M16.5 6.75V5.25A2.25 2.25 0 0014.25 3h-4.5A2.25 2.25 0 007.5 5.25v1.5m-6 0h21v6.75a2.25 2.25 0 01-2.25 2.25H3.75a2.25 2.25 0 01-2.25-2.25V6.75z"
        />
      </svg>
    ),

    emergency: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0 3h.008v.008H12v-.008zM10.5 3.75h3L21 18.75H3L10.5 3.75z"
        />
      </svg>
    ),

    location: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icons[icon]}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[var(--color-text)]">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StudentParents;