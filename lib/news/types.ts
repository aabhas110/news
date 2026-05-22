import type { Sentiment } from "@prisma/client";

export type NormalizedArticle = {
  title: string;
  description?: string | null;
  contentSnippet?: string | null;
  imageUrl?: string | null;
  sourceName: string;
  sourceUrl?: string | null;
  originalUrl: string;
  country?: string | null;
  language?: string;
  publishedAt: Date;
};

export type EnrichedArticle = NormalizedArticle & {
  categoryName: string;
  aiSummary: string;
  keywords: string[];
  sentiment: Sentiment;
  credibilityScore: number;
  riskLabel: string;
  duplicateKey: string;
  trendingScore: number;
};
