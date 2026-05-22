import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const articleId = isJson
    ? String(((await request.json()) as { articleId?: string }).articleId ?? "")
    : String((await request.formData()).get("articleId") ?? "");
  const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  await prisma.article.update({ where: { id: articleId }, data: { isFeatured: !article.isFeatured } });
  if (isJson) return NextResponse.json({ ok: true, isFeatured: !article.isFeatured });
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
