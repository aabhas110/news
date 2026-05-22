import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const name = isJson
    ? String(((await request.json()) as { name?: string }).name ?? "").trim()
    : String((await request.formData()).get("name") ?? "").trim();
  if (!name) {
    if (isJson) return NextResponse.json({ error: "name required" }, { status: 400 });
    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  }
  const category = await prisma.category.upsert({
    where: { slug: makeSlug(name) },
    update: { name },
    create: { name, slug: makeSlug(name) }
  });
  if (isJson) return NextResponse.json({ category });
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
