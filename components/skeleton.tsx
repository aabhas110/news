export function ArticleSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-line bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="aspect-[16/10] rounded-md bg-ink/10 dark:bg-paper/10" />
      <div className="mt-4 h-4 w-2/3 rounded bg-ink/10 dark:bg-paper/10" />
      <div className="mt-3 h-3 w-full rounded bg-ink/10 dark:bg-paper/10" />
      <div className="mt-2 h-3 w-5/6 rounded bg-ink/10 dark:bg-paper/10" />
    </div>
  );
}
