import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") ?? 24), 60);
  const session = await getServerSession(authOptions);
  const preferences = session?.user?.id
    ? await prisma.userPreference.findMany({
        where: { userId: session.user.id },
        select: { categoryId: true }
      })
    : [];
  const categoryIds = preferences.map((preference) => preference.categoryId);
  const articles = await prisma.article.findMany({
    where: categoryIds.length ? { categoryId: { in: categoryIds } } : undefined,
    orderBy: [{ trendingScore: "desc" }, { publishedAt: "desc" }],
    take,
    include: { category: true }
  });
  return NextResponse.json({ articles });
}
