import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const limited = rateLimit(request, "news-search");
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ articles: [] });

  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { aiSummary: { contains: q, mode: "insensitive" } },
        { sourceName: { contains: q, mode: "insensitive" } }
      ]
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { category: true }
  });
  return NextResponse.json({ articles });
}
