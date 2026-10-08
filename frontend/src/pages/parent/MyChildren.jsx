
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getParentChildren } from "../../services/parentService";

export default function MyChildren() {
  const { user } = useAuth();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChildren = async () => {
      if (!user?.parent_id) {
        setError(
          "No parent profile is linked to this account."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getParentChildren(
          user.parent_id
        );

        setChildren(data);
      } catch (err) {
        console.error(
          "Failed to load children:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load your children."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [user?.parent_id]);

  // =====================================================
  // PROFILE IMAGE HELPER
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-background p-6">
        <h1 className="mb-2 text-2xl font-bold text-text">
          My Children
        </h1>

        <p className="text-text/60">
          Loading children...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="rounded-xl border border-primary/20 bg-card p-6">
          <p className="text-primary">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-background p-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">
          My Children
        </h1>

        <p className="mt-1 text-text/60">
          View the students linked to your parent account.
        </p>
      </div>

      {/* =================================================
          CHILDREN COUNT
      ================================================= */}

      <div className="mb-6 rounded-xl border border-text/10 bg-card p-5">
        <p className="text-sm text-text/60">
          Total Children
        </p>

        <p className="mt-1 text-3xl font-bold text-primary">
          {children.length}
        </p>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {children.length === 0 ? (
        <div className="rounded-xl border border-text/10 bg-card p-8 text-center">
          <div className="mb-3 text-4xl">
            👨‍👩‍👧‍👦
          </div>

          <h2 className="text-lg font-semibold text-text">
            No Children Found
          </h2>

          <p className="mt-1 text-text/60">
            No students are currently linked to your
            parent account.
          </p>
        </div>
      ) : (

        /* =================================================
           CHILDREN
        ================================================= */

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {children.map((child) => {

            const imageUrl = getImageUrl(
              child.profile_image
            );

            const initials =
              child.full_name
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((name) =>
                  name.charAt(0).toUpperCase()
                )
                .join("") || "S";

            return (
              <div
                key={child.id}
                className="rounded-xl border border-text/10 bg-card p-5 transition hover:shadow-sm"
              >

                {/* =========================================
                    STUDENT HEADER
                ========================================= */}

                <div className="mb-6 flex items-center gap-4">

                  {/* Profile Image */}

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={child.full_name}
                      className="h-16 w-16 rounded-full border border-text/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {initials}
                    </div>
                  )}

                  {/* Name */}

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-text">
                      {child.full_name ||
                        "Unnamed Student"}
                    </h2>

                    <p className="mt-1 text-sm text-text/60">
                      {child.admission_number || "—"}
                    </p>
                  </div>
                </div>

                {/* =========================================
                    CURRENT ACADEMIC INFORMATION
                ========================================= */}

                <div className="space-y-3 border-t border-text/10 pt-4">

                  {/* Current Class */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Current Class
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.current_class || "—"}
                    </span>
                  </div>

                  {/* Department */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Department
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.department_name || "—"}
                    </span>
                  </div>

                  {/* Academic Session */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Academic Session
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.current_session || "—"}
                    </span>
                  </div>

                  {/* Current Term */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Current Term
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.current_term || "—"}
                    </span>
                  </div>

                  {/* Roll Number */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Roll Number
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.current_roll_number ?? "—"}
                    </span>
                  </div>

                  {/* Admission Number */}

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-text/60">
                      Admission Number
                    </span>

                    <span className="text-right text-sm font-medium text-text">
                      {child.admission_number || "—"}
                    </span>
                  </div>

                  {/* Status */}

                  <div className="flex items-center justify-between gap-4 pt-2">

                    <span className="text-sm text-text/60">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        child.status === "ACTIVE"
                          ? "bg-secondary/10 text-secondary"
                          : child.status === "GRADUATED"
                          ? "bg-primary/10 text-primary"
                          : "bg-background text-text/60"
                      }`}
                    >
                      {child.status || "—"}
                    </span>

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
