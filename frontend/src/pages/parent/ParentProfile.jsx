
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getParent } from "../../services/parentService";

export default function ParentProfile() {
  const { user } = useAuth();

  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParent = async () => {
      if (!user?.parent_id) {
        setError("No parent profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getParent(user.parent_id);

        setParent(data);
      } catch (err) {
        console.error("Failed to load parent profile:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load your parent profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadParent();
  }, [user?.parent_id]);

  if (loading) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="bg-card rounded-xl border border-text/10 p-6">
          <p className="text-text/60">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="bg-card rounded-xl border border-primary/20 p-6">
          <p className="text-primary">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!parent) {
    return null;
  }

  const profileImage = parent.profile_image
    ? parent.profile_image.startsWith("http")
      ? parent.profile_image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${parent.profile_image}`
    : null;

  const initials = parent.full_name
    ? parent.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name.charAt(0).toUpperCase())
        .join("")
    : "P";

  return (
    <div className="min-h-full bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">
          My Profile
        </h1>

        <p className="text-text/60 mt-1">
          View your parent and account information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-text/10 p-6 mb-6">
        <div className="flex items-center gap-5">
          {profileImage ? (
            <img
              src={profileImage}
              alt={parent.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-background"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center text-2xl font-bold text-text">
              {initials}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-text">
              {parent.full_name}
            </h2>

            <p className="text-text/60 mt-1">
              {parent.relationship || "Parent / Guardian"}
            </p>

            <p className="text-sm text-text/50 mt-1">
              Parent ID: {parent.id}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-xl border border-text/10 p-6 mb-6">
        <h2 className="text-lg font-semibold text-text mb-5">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="Full Name"
            value={parent.full_name}
          />

          <InfoItem
            label="Relationship"
            value={parent.relationship}
          />

          <InfoItem
            label="Phone Number"
            value={parent.phone_number}
          />

          <InfoItem
            label="Email"
            value={parent.email}
          />

          <InfoItem
            label="Occupation"
            value={parent.occupation}
          />

          <InfoItem
            label="Emergency Contact"
            value={
              parent.emergency_contact
                ? "Yes"
                : "No"
            }
          />

          <div className="md:col-span-2">
            <InfoItem
              label="Address"
              value={parent.address}
            />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-card rounded-xl border border-text/10 p-6">
        <h2 className="text-lg font-semibold text-text mb-5">
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="Username"
            value={user?.username}
          />

          <InfoItem
            label="Account Role"
            value={user?.role_display}
          />

          <InfoItem
            label="Account Status"
            value={
              user?.is_active
                ? "Active"
                : "Inactive"
            }
          />

          <InfoItem
            label="Parent Profile ID"
            value={user?.parent_id}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-text/60">
        {label}
      </p>

      <p className="font-medium text-text mt-1">
        {value || "—"}
      </p>
    </div>
  );
}

