import type { NormalizedArticle } from "@/lib/news/types";

export function riskAndCredibility(article: NormalizedArticle, sourceScore = 0.7) {
  const text = `${article.title} ${article.description ?? ""}`.toLowerCase();
  const riskyTerms = ["shocking", "secret cure", "you won't believe", "miracle", "guaranteed"];
  const sensationalPenalty = riskyTerms.some((term) => text.includes(term)) ? 0.18 : 0;
  const missingPenalty = article.originalUrl && article.sourceName ? 0 : 0.2;
  const credibilityScore = Math.max(0.15, Math.min(0.98, sourceScore - sensationalPenalty - missingPenalty));

  return {
    credibilityScore,
    riskLabel: credibilityScore > 0.8 ? "Low risk" : credibilityScore > 0.55 ? "Review" : "High risk"
  };
}
