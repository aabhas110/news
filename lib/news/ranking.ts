import { dateScore } from "@/lib/utils";

export function scoreArticle(input: {
  publishedAt: Date;
  credibilityScore: number;
  keywordCount: number;
  hasImage: boolean;
}) {
  const freshness = dateScore(input.publishedAt) * 55;
  const credibility = input.credibilityScore * 30;
  const richness = Math.min(input.keywordCount, 8) * 1.5 + (input.hasImage ? 3 : 0);
  return Number((freshness + credibility + richness).toFixed(2));
}
