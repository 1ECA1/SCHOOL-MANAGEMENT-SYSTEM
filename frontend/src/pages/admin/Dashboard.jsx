function Dashboard() {
  const statistics = [
    {
      title: "Students",
      value: "2",
      icon: "👨‍🎓",
    },
    {
      title: "Teachers",
      value: "1",
      icon: "👨‍🏫",
    },
    {
      title: "Parents",
      value: "0",
      icon: "👨‍👩‍👧",
    },
    {
      title: "Total Earnings",
      value: "₦50,000",
      icon: "💰",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, School Admin. Here's what's happening in your school.
          </p>
        </div>

        <button
          type="button"
          className="w-fit rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90"
        >
          + Quick Action
        </button>
      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <div
            key={item.title}
            className="flex min-h-[120px] items-center gap-4 rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800"
          >
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-500/10">
              {item.icon}
            </div>

            {/* Information */}
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.title}
              </p>

              <h3 className="text-2xl font-bold text-[var(--color-text)]">
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          FINANCE + NOTICE BOARD
          ===================================================== */}
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Finance Card */}
        <div className="min-h-[300px] rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          {/* Header */}
          <div className="mb-5">
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Fees Collection & Expenses
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Financial overview
            </p>
          </div>

          {/* Chart */}
          <div className="flex h-[180px] items-end justify-evenly gap-5 border-b border-slate-200 px-3 dark:border-slate-700">
            {/* Collections */}
            <div className="flex h-full flex-col justify-end">
              <div className="relative h-[100%] w-10 rounded-t-lg bg-[var(--color-primary)] sm:w-14">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[var(--color-text)]">
                  ₦50K
                </span>
              </div>
            </div>

            {/* Fees */}
            <div className="flex h-full flex-col justify-end">
              <div className="relative h-[65%] w-10 rounded-t-lg bg-[var(--color-secondary)] sm:w-14">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[var(--color-text)]">
                  ₦30K
                </span>
              </div>
            </div>

            {/* Expenses */}
            <div className="flex h-full flex-col justify-end">
              <div className="relative h-[45%] w-10 rounded-t-lg bg-slate-400 sm:w-14">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-[var(--color-text)]">
                  ₦20K
                </span>
              </div>
            </div>
          </div>

          {/* Chart Labels */}
          <div className="flex justify-evenly pt-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Collections</span>
            <span>Fees</span>
            <span>Expenses</span>
          </div>
        </div>

        {/* Notice Board */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Notice Board
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Latest announcements
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="py-4">
              <strong className="block text-sm font-semibold text-[var(--color-text)]">
                Welcome to EduManageERP
              </strong>

              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                School administration system is ready.
              </span>
            </div>

            <div className="py-4">
              <strong className="block text-sm font-semibold text-[var(--color-text)]">
                Academic Session
              </strong>

              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                2026/2027 First Term
              </span>
            </div>

            <div className="py-4">
              <strong className="block text-sm font-semibold text-[var(--color-text)]">
                System Update
              </strong>

              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                All major modules are available.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTIVITIES + QUICK SUMMARY
          ===================================================== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Recent Activities
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Latest system activities
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* Activity 1 */}
            <div className="flex gap-3 py-4">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

              <div>
                <strong className="text-sm font-semibold text-[var(--color-text)]">
                  Student registered
                </strong>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  John David Okafor
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex gap-3 py-4">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

              <div>
                <strong className="text-sm font-semibold text-[var(--color-text)]">
                  Assignment graded
                </strong>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Mathematics — Score: 85
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="flex gap-3 py-4">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

              <div>
                <strong className="text-sm font-semibold text-[var(--color-text)]">
                  Payment received
                </strong>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ₦50,000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-800">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[var(--color-text)]">
              Quick Summary
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              School overview
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="flex items-center justify-between py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Attendance
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                100%
              </strong>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Assignment submission
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                50%
              </strong>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Finance collection
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                16.67%
              </strong>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Academic performance
              </span>

              <strong className="text-sm font-semibold text-[var(--color-text)]">
                82.5%
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
