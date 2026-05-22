import Link from "next/link";

export function Sidebar({
  topics,
  latest
}: {
  topics: Array<{ name: string; slug: string; score: number }>;
  latest: Array<{ title: string; slug: string; sourceName: string }>;
}) {
  return (
    <aside className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-bold uppercase tracking-normal text-ink/60 dark:text-paper/60">Trending Topics</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/search?q=${encodeURIComponent(topic.name)}`} className="rounded-full bg-paper px-3 py-1 text-sm font-semibold hover:bg-accent hover:text-white dark:bg-white/10">
              #{topic.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-bold uppercase tracking-normal text-ink/60 dark:text-paper/60">Latest</h2>
        <div className="mt-4 divide-y divide-line dark:divide-white/10">
          {latest.map((article) => (
            <Link key={article.slug} href={`/article/${article.slug}`} className="block py-3">
              <h3 className="text-sm font-semibold leading-5 hover:text-accent">{article.title}</h3>
              <p className="mt-1 text-xs text-ink/55 dark:text-paper/55">{article.sourceName}</p>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
