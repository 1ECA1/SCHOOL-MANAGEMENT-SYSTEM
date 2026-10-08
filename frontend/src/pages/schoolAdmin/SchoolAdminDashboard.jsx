
import React, { useEffect, useState } from "react";
import schoolSuperAdminService from "../../services/schoolSuperAdminService";


// =====================================================
// HELPERS
// =====================================================

const formatMoney = (amount) => {
  const value = Number(amount || 0);

  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
}) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}
        >
          <span className="text-xl">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};


// =====================================================
// SECTION TITLE
// =====================================================

const SectionTitle = ({
  title,
  subtitle,
}) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};


// =====================================================
// DASHBOARD
// =====================================================

const SchoolAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await schoolSuperAdminService.getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Failed to load school admin dashboard:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load the school admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }


  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // ===================================================
  // SAFE DATA
  // ===================================================

  const school = dashboard?.school || {};

  const statistics =
    dashboard?.statistics || {};

  const finance =
    dashboard?.finance || {};

  const academic =
    dashboard?.academic || {};

  const activities =
  (dashboard?.recent_activities || []).slice(0, 5);

const notices =
  (dashboard?.notices || []).slice(0, 5);


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-full bg-[#f8fafc] p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-medium text-violet-600">
            {school.code || "School"}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">
            School Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome to your school management dashboard.
          </p>

          {school.name && (
            <p className="mt-2 text-sm font-medium text-gray-700">
              {school.name}
            </p>
          )}
        </div>


        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ↻ Refresh
        </button>

      </div>


      {/* =================================================
          PEOPLE OVERVIEW
      ================================================= */}

      <section className="mb-8">

        <SectionTitle
          title="People Overview"
          subtitle="Current people and enrollment information."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Students"
            value={statistics.students ?? 0}
            subtitle={`${statistics.active_students ?? 0} active`}
            icon="🎓"
            iconBg="bg-violet-100"
          />

          <StatCard
            title="Teachers"
            value={statistics.teachers ?? 0}
            subtitle={`${statistics.active_teachers ?? 0} active`}
            icon="👨‍🏫"
            iconBg="bg-blue-100"
          />

          <StatCard
            title="Parents / Guardians"
            value={statistics.parents ?? 0}
            subtitle={`${statistics.active_parents ?? 0} active`}
            icon="👨‍👩‍👧"
            iconBg="bg-cyan-100"
          />

          <StatCard
            title="Other Staff"
            value={statistics.staff ?? 0}
            subtitle={`${statistics.active_staff ?? 0} active`}
            icon="👥"
            iconBg="bg-amber-100"
          />

        </div>

      </section>


      {/* =================================================
          ACADEMIC OVERVIEW
      ================================================= */}

      <section className="mb-8">

        <SectionTitle
          title="Academic Overview"
          subtitle="Classes, subjects and current academic period."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Classes"
            value={statistics.classes ?? 0}
            subtitle={`${statistics.active_classes ?? 0} active`}
            icon="🏫"
            iconBg="bg-emerald-100"
          />

          <StatCard
            title="Subjects"
            value={statistics.subjects ?? 0}
            subtitle={`${statistics.active_subjects ?? 0} active`}
            icon="📚"
            iconBg="bg-pink-100"
          />


          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Session
            </p>

            <p className="mt-3 text-lg font-bold text-gray-800">
              {academic.current_session?.name || "Not set"}
            </p>

            {academic.current_session && (
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(
                  academic.current_session.start_date,
                )}{" "}
                –{" "}
                {formatDate(
                  academic.current_session.end_date,
                )}
              </p>
            )}
          </div>


          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Term
            </p>

            <p className="mt-3 text-lg font-bold text-gray-800">
              {academic.current_term?.name_display ||
                academic.current_term?.name ||
                "Not set"}
            </p>

            {academic.current_term && (
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(
                  academic.current_term.start_date,
                )}{" "}
                –{" "}
                {formatDate(
                  academic.current_term.end_date,
                )}
              </p>
            )}
          </div>

        </div>

      </section>


      {/* =================================================
          FINANCE
      ================================================= */}

      <section className="mb-8">

        <SectionTitle
          title="Finance Overview"
          subtitle="School-wide financial summary."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Invoiced
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {formatMoney(
                finance.total_invoiced,
              )}
            </p>
          </div>


          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Collected
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatMoney(
                finance.total_collected,
              )}
            </p>
          </div>


          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Outstanding
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatMoney(
                finance.total_outstanding,
              )}
            </p>
          </div>


          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {formatMoney(
                finance.total_expenses,
              )}
            </p>
          </div>

        </div>


        {/* COLLECTION RATE */}

        <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Fee Collection Rate
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {Number(
                  finance.collection_rate || 0,
                ).toFixed(2)}
                %
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Collected vs invoiced
            </div>

          </div>


          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{
                width: `${Math.min(
                  Number(
                    finance.collection_rate || 0,
                  ),
                  100,
                )}%`,
              }}
            />

          </div>

        </div>

      </section>


      {/* =================================================
          LOWER SECTION
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ===============================================
            RECENT ACTIVITIES
        =============================================== */}

        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">

            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent activity within your school.
            </p>

          </div>


          <div className="divide-y divide-gray-100">

            {activities.length === 0 ? (

              <div className="p-6 text-center text-sm text-gray-500">
                No recent activities.
              </div>

            ) : (

              activities.map((activity) => (

                <div
                  key={activity.id}
                  className="p-5"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm">
                      ✓
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-gray-800">
                        {activity.action_display ||
                          activity.action}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {activity.description ||
                          activity.object_repr ||
                          "Activity recorded."}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {activity.user_name || "System"}{" "}
                        •{" "}
                        {formatDate(
                          activity.created_at,
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>


        {/* ===============================================
            NOTIFICATIONS
        =============================================== */}

        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">

            <h2 className="text-lg font-semibold text-gray-800">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest school notifications.
            </p>

          </div>


          <div className="divide-y divide-gray-100">

            {notices.length === 0 ? (

              <div className="p-6 text-center">

                <div className="text-3xl">
                  🔔
                </div>

                <p className="mt-2 text-sm font-medium text-gray-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  You are all caught up.
                </p>

              </div>

            ) : (

              notices.map((notice) => (

                <div
                  key={notice.id}
                  className="p-5"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100">
                      🔔
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-gray-800">
                        {notice.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {notice.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(
                          notice.created_at,
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </div>

    </div>
  );
};

export default SchoolAdminDashboard;
