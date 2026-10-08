import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getParent, getParentChildren } from "../../services/parentService";

export default function ParentDashboard() {
  const { user } = useAuth();

  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PARENT DATA
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
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

        const [parentData, childrenData] =
          await Promise.all([
            getParent(user.parent_id),
            getParentChildren(user.parent_id),
          ]);

        setParent(parentData);
        setChildren(childrenData);
      } catch (err) {
        console.error(
          "Failed to load parent dashboard:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.parent_id]);

  // =====================================================
  // IMAGE URL
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

    return `http://127.0.0.1:8000${image}`;
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part.charAt(0).toUpperCase()
        )
        .join("") || "S"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Parent Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const activeChildren = children.filter(
    (child) => child.status === "ACTIVE"
  );

  const currentSession =
    children.find(
      (child) => child.current_session
    )?.current_session || "—";

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="p-6">

      {/* =================================================
          WELCOME HEADER
      ================================================= */}

      <div className="mb-7">

        <h1 className="text-2xl font-bold text-gray-800">
          Parent Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back,{" "}
          {parent?.full_name ||
            user?.first_name ||
            "Parent"}
          .
        </p>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">

        {/* Total Children */}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                My Children
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {children.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
              👨‍👩‍👧‍👦
            </div>

          </div>
        </div>

        {/* Active Children */}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Active Children
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {activeChildren.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
              ✓
            </div>

          </div>
        </div>

        {/* Academic Session */}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Academic Session
              </p>

              <p className="text-xl font-bold text-gray-800 mt-2">
                {currentSession}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
              🏫
            </div>

          </div>
        </div>

        {/* Parent Status */}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Account Status
              </p>

              <p className="text-xl font-bold text-gray-800 mt-2">
                {user?.is_active
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
              👤
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          CHILDREN OVERVIEW
      ================================================= */}

      <div className="bg-white border border-gray-200 rounded-xl">

        <div className="p-5 border-b border-gray-100">

          <h2 className="text-lg font-semibold text-gray-800">
            Children Overview
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Current academic information for your children.
          </p>

        </div>

        {children.length === 0 ? (

          <div className="p-8 text-center">

            <div className="text-4xl mb-3">
              👨‍👩‍👧‍👦
            </div>

            <p className="text-gray-500">
              No children are currently linked to
              your account.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {children.map((child) => {

              const imageUrl =
                getImageUrl(
                  child.profile_image
                );

              return (
                <div
                  key={child.id}
                  className="p-5"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* Student */}

                    <div className="flex items-center gap-4">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={child.full_name}
                          className="w-14 h-14 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                          {getInitials(
                            child.full_name
                          )}
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {child.full_name ||
                            "Unnamed Student"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {child.admission_number ||
                            "—"}
                        </p>
                      </div>

                    </div>

                    {/* Academic Details */}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Class
                        </p>

                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {child.current_class ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Department
                        </p>

                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {child.department_name ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Term
                        </p>

                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {child.current_term ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Roll No.
                        </p>

                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {child.current_roll_number ??
                            "—"}
                        </p>
                      </div>

                    </div>

                    {/* Status */}

                    <div>

                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          child.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : child.status ===
                              "GRADUATED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
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

    </div>
  );
}