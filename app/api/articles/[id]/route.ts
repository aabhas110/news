import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { articleUpdateSchema, parseJson } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const limited = rateLimit(request, "article");
  if (limited) return limited;
  const article = await prisma.article.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { category: true, source: true }
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(articleUpdateSchema, await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });
  const article = await prisma.article.update({ where: { id: params.id }, data });
  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
