import { ArticleCard } from "@/components/article-card";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const { articles } = await apiGet<{ articles: Array<any> }>("/api/news/trending");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-bold">Trending News</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
