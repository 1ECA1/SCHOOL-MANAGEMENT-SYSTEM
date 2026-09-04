function ComingSoon({ title }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[var(--color-card)] p-10 text-center dark:border-slate-700">
      <div className="mb-3 text-4xl">🚧</div>
      <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        This module is under construction.
      </p>
    </div>
  );
}

export default ComingSoon;
