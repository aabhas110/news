import { getServerSession } from "next-auth";
import { ArticleCard } from "@/components/article-card";
import { Sidebar } from "@/components/sidebar";
import { authOptions } from "@/lib/auth";
import { categories } from "@/lib/categories";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await getServerSession(authOptions);
  const [{ articles }, trending] = await Promise.all([
    apiGet<{ articles: Array<any> }>("/api/news?limit=12"),
    apiGet<{ articles: Array<any>; topics: Array<{ name: string; slug: string; score: number }> }>("/api/news/trending")
  ]);
  const featured = articles[0] ?? null;
  const latest = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6)
    .map((article) => ({ title: article.title, slug: article.slug, sourceName: article.sourceName }));

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-signal">Breaking now</p>
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">Latest stories, compressed with context.</h1>
            </div>
          </div>
          {featured ? (
            <ArticleCard article={featured} featured />
          ) : (
            <div className="rounded-lg border border-dashed border-line p-8 text-center dark:border-white/10">
              Run the news fetch job to populate fresh stories.
            </div>
          )}
        </div>
        <Sidebar topics={trending.topics} latest={latest} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trending News</h2>
          <a href="/trending" className="text-sm font-semibold text-accent">View all</a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <a key={category.slug} href={`/category/${category.slug}`} className="rounded-lg border border-line bg-white p-5 font-semibold hover:border-accent hover:text-accent dark:border-white/10 dark:bg-white/5">
            {category.name}
          </a>
        ))}
      </section>
    </div>
  );
}
