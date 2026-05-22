import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { categories } from "@/lib/categories";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryMeta = categories.find((category) => category.slug === params.category);
  if (!categoryMeta) notFound();

  const { articles } = await apiGet<{ articles: Array<any> }>(`/api/news/category/${params.category}`);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-normal text-accent">Category</p>
        <h1 className="font-serif text-4xl font-bold">{categoryMeta.name}</h1>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
