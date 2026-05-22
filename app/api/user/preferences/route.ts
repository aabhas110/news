import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const preferences = await prisma.userPreference.findMany({
    where: { userId: session.user.id },
    include: { category: true }
  });
  return NextResponse.json({ preferences });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const categorySlugs = isJson
    ? ((await request.json()) as { categories?: string[] }).categories ?? []
    : (await request.formData()).getAll("categories").map(String);

  const categories = await prisma.category.findMany({ where: { slug: { in: categorySlugs } } });
  await prisma.userPreference.deleteMany({ where: { userId: session.user.id } });
  await prisma.userPreference.createMany({
    data: categories.map((category) => ({
      userId: session.user.id,
      categoryId: category.id,
      weight: 1
    })),
    skipDuplicates: true
  });

  if (isJson) return NextResponse.json({ ok: true, categories: categorySlugs });
  return NextResponse.redirect(new URL("/profile", request.url), { status: 303 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.userPreference.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
