import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { category: string } }) {
  const limited = rateLimit(request, "news-category");
  if (limited) return limited;
  const articles = await prisma.article.findMany({
    where: { category: { slug: params.category } },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { category: true }
  });
  return NextResponse.json({ articles });
}
