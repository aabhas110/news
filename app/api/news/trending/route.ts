import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const limited = rateLimit(request, "news-trending");
  if (limited) return limited;
  const [articles, topics] = await Promise.all([
    prisma.article.findMany({
      orderBy: [{ trendingScore: "desc" }, { publishedAt: "desc" }],
      take: 50,
      include: { category: true }
    }),
    prisma.trendingTopic.findMany({ orderBy: { score: "desc" }, take: 25 })
  ]);

  return NextResponse.json({ articles, topics });
}
