import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const topicId = isJson
    ? String(((await request.json()) as { topicId?: string }).topicId ?? "")
    : String((await request.formData()).get("topicId") ?? "");
  if (!topicId) {
    if (isJson) return NextResponse.json({ error: "topicId required" }, { status: 400 });
    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  }

  await prisma.trendingTopic.delete({ where: { id: topicId } });
  if (isJson) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
