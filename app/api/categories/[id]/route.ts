import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { categorySchema, parseJson } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const category = await prisma.category.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { _count: { select: { articles: true } } }
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(categorySchema.partial(), await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });
  const category = await prisma.category.update({
    where: { id: params.id },
    data: { ...data, ...(data.name ? { slug: makeSlug(data.name) } : {}) }
  });
  return NextResponse.json({ category });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
