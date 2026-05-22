import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  cursor: z.string().optional()
});

export const articleCreateSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(1000).optional().nullable(),
  aiSummary: z.string().max(1200).optional().nullable(),
  contentSnippet: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sourceName: z.string().min(1).max(120),
  sourceUrl: z.string().url().optional().nullable(),
  originalUrl: z.string().url(),
  categoryId: z.string().optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  language: z.string().max(12).default("en"),
  publishedAt: z.coerce.date(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).default("NEUTRAL"),
  credibilityScore: z.number().min(0).max(1).default(0.7),
  trendingScore: z.number().min(0).default(0),
  keywords: z.array(z.string().min(1).max(60)).default([])
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional().nullable()
});

export const sourceSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url(),
  feedUrl: z.string().url().optional().nullable(),
  credibilityScore: z.number().min(0).max(1).default(0.75),
  isBlocked: z.boolean().default(false)
});

export function parseJson<T>(schema: z.Schema<T>, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { data: null, error: parsed.error.flatten() };
  }
  return { data: parsed.data, error: null };
}
