import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const [sources, articles, topics] = await Promise.all([
    apiGet<{ sources: Array<any> }>("/api/sources").then((result) => result.sources),
    apiGet<{ articles: Array<any> }>("/api/articles?limit=12").then((result) => result.articles),
    apiGet<{ topics: Array<any> }>("/api/news/trending").then((result) => result.topics)
  ]);

  if (session?.user?.role !== "ADMIN") {
    return <div className="rounded-lg border border-line p-6 dark:border-white/10">Admin access required.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl font-bold">Admin Dashboard</h1>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-ink/60 dark:text-paper/60">Sources</p>
          <p className="mt-2 text-3xl font-bold">{sources.length}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-ink/60 dark:text-paper/60">Recent Articles</p>
          <p className="mt-2 text-3xl font-bold">{articles.length}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-ink/60 dark:text-paper/60">Trending Tags</p>
          <p className="mt-2 text-3xl font-bold">{topics.length}</p>
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-bold">Categories</h2>
        <form action="/api/admin/category" method="post" className="mt-4 flex gap-2">
          <input name="name" placeholder="New category" className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper dark:bg-paper dark:text-ink">Add</button>
        </form>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-bold">Trending Tags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <form key={topic.id} action="/api/admin/trending-topic" method="post">
              <input type="hidden" name="topicId" value={topic.id} />
              <button className="rounded-full border border-line px-3 py-1 text-sm font-semibold hover:border-signal hover:text-signal dark:border-white/10">
                #{topic.name}
              </button>
            </form>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-bold">Sources</h2>
        <div className="mt-4 divide-y divide-line dark:divide-white/10">
          {sources.map((source) => (
            <form key={source.id} action="/api/admin/source/block" method="post" className="flex items-center justify-between gap-4 py-3">
              <input type="hidden" name="sourceId" value={source.id} />
              <div>
                <p className="font-semibold">{source.name}</p>
                <p className="text-sm text-ink/60 dark:text-paper/60">{source.url}</p>
              </div>
              <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold dark:border-white/10">
                {source.isBlocked ? "Unblock" : "Block"}
              </button>
            </form>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-bold">Featured Articles</h2>
        <div className="mt-4 divide-y divide-line dark:divide-white/10">
          {articles.map((article) => (
            <form key={article.id} action="/api/admin/article/feature" method="post" className="flex items-center justify-between gap-4 py-3">
              <input type="hidden" name="articleId" value={article.id} />
              <p className="font-semibold">{article.title}</p>
              <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold dark:border-white/10">
                {article.isFeatured ? "Unfeature" : "Feature"}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
