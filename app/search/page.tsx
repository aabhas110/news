import { ArticleCard } from "@/components/article-card";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";
  const articles = q
    ? (await apiGet<{ articles: Array<any> }>(`/api/news/search?q=${encodeURIComponent(q)}`)).articles
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-bold">Search</h1>
      <form action="/search" className="flex max-w-2xl gap-2">
        <input name="q" defaultValue={q} placeholder="Search articles" className="min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5" />
        <button className="rounded-md bg-ink px-5 py-3 font-semibold text-paper dark:bg-paper dark:text-ink">Search</button>
      </form>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
