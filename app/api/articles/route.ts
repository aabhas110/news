import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { articleCreateSchema, paginationSchema, parseJson } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export async function GET(request: Request) {
  const limited = rateLimit(request, "articles");
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const parsed = paginationSchema.safeParse(Object.fromEntries(searchParams));
  const { limit } = parsed.success ? parsed.data : { limit: 24 };
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: true, source: true }
  });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(articleCreateSchema, await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });

  const article = await prisma.article.create({
    data: {
      ...data,
      slug: `${makeSlug(data.title)}-${Date.now().toString(36)}`,
      categoryId: data.categoryId ?? undefined
    }
  });
  return NextResponse.json({ article }, { status: 201 });
}
