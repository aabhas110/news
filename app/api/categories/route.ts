import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";
import { categorySchema, parseJson } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export async function GET(request: Request) {
  const limited = rateLimit(request, "categories");
  if (limited) return limited;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { articles: true } } } });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(categorySchema, await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });
  const category = await prisma.category.create({ data: { ...data, slug: makeSlug(data.name) } });
  return NextResponse.json({ category }, { status: 201 });
}
