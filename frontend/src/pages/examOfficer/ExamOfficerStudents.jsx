function ExamOfficerStudents() {
  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary">
          EXAMINATION OFFICE
        </p>

        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Students
        </h1>

        <p className="mt-2 text-sm text-text/60">
          View students and their academic assessment information.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm dark:border-white/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
          ♙
        </div>

        <h2 className="mt-5 text-lg font-bold">
          Student Assessment Records
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-text/60">
          Student examination records and assessment information will
          appear here.
        </p>
      </div>
    </div>
  );
}

export default ExamOfficerStudents;