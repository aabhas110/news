import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { truncate } from "@/lib/utils";

type ArticleCardProps = {
  article: {
    title: string;
    slug: string;
    description: string | null;
    aiSummary: string | null;
    imageUrl: string | null;
    sourceName: string;
    publishedAt: Date | string;
    sentiment: string;
    credibilityScore: number;
    trendingScore: number;
    category?: { name: string; slug: string } | null;
  };
  featured?: boolean;
};

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
      <Link href={`/article/${article.slug}`} className={featured ? "grid gap-0 md:grid-cols-[1.15fr_0.85fr]" : "block"}>
        <div className={featured ? "relative min-h-80" : "relative aspect-[16/10]"}>
          {article.imageUrl ? (
            <Image src={article.imageUrl} alt="" fill className="object-cover transition duration-300 group-hover:scale-105" sizes={featured ? "60vw" : "33vw"} />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent/20 via-paper to-signal/20 dark:from-accent/20 dark:via-ink dark:to-signal/20" />
          )}
        </div>
        <div className="flex h-full flex-col p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-ink/55 dark:text-paper/55">
            <span>{article.category?.name ?? "News"}</span>
            <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
          </div>
          <h2 className={featured ? "font-serif text-3xl font-bold leading-tight" : "text-lg font-bold leading-snug"}>
            {article.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-paper/70">
            {truncate(article.aiSummary || article.description, featured ? 260 : 150)}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-ink/60 dark:text-paper/60">
            <span className="font-semibold text-ink dark:text-paper">{article.sourceName}</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {Math.round(article.credibilityScore * 100)}%
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {Math.round(article.trendingScore)}
            </span>
            <span>{article.sentiment}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
