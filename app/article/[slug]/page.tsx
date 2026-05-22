import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { BookmarkButton } from "@/components/bookmark-button";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { article } = await apiGet<{ article: any }>(`/api/articles/${params.slug}`);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-ink/60 dark:text-paper/60">
        <Link href={`/category/${article.category?.slug ?? "top-headlines"}`} className="text-accent">
          {article.category?.name ?? "News"}
        </Link>
        <span>{article.sourceName}</span>
        <span>{format(new Date(article.publishedAt), "PPP p")}</span>
      </div>
      <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <BookmarkButton articleId={article.id} />
        <a href={article.originalUrl} target="_blank" rel="noreferrer" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent dark:bg-paper dark:text-ink">
          Read original
        </a>
      </div>
      {article.imageUrl ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image src={article.imageUrl} alt="" fill className="object-cover" priority />
        </div>
      ) : null}
      <section className="mt-8 rounded-lg border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-bold uppercase tracking-normal text-accent">AI summary</h2>
        <p className="mt-3 whitespace-pre-line text-lg leading-8">{article.aiSummary || article.description}</p>
      </section>
      <section className="prose prose-lg mt-8 max-w-none dark:prose-invert">
        <p>{article.description}</p>
        <p>{article.contentSnippet}</p>
        <p>
          This page shows a summary and snippet only. NewsForge preserves copyright by linking readers to the original
          publisher for the complete report.
        </p>
      </section>
      <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-line p-4 dark:border-white/10">Sentiment: {article.sentiment}</div>
        <div className="rounded-lg border border-line p-4 dark:border-white/10">Credibility: {Math.round(article.credibilityScore * 100)}%</div>
        <div className="rounded-lg border border-line p-4 dark:border-white/10">Risk: {article.riskLabel ?? "Review"}</div>
      </div>
    </article>
  );
}
