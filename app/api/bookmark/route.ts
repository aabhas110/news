import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function bodyArticleId(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { articleId?: string };
    return body.articleId;
  }
  const form = await request.formData();
  return String(form.get("articleId") ?? "");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { article: { include: { category: true } } }
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articleId = await bodyArticleId(request);
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    update: {},
    create: { userId: session.user.id, articleId }
  });
  return NextResponse.json({ bookmark });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articleId = await bodyArticleId(request);
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  await prisma.bookmark.deleteMany({ where: { userId: session.user.id, articleId } });
  return NextResponse.json({ ok: true });
}
