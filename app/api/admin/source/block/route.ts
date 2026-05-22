import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const sourceId = isJson
    ? String(((await request.json()) as { sourceId?: string }).sourceId ?? "")
    : String((await request.formData()).get("sourceId") ?? "");
  const source = await prisma.source.findUniqueOrThrow({ where: { id: sourceId } });
  await prisma.source.update({ where: { id: sourceId }, data: { isBlocked: !source.isBlocked } });
  if (isJson) return NextResponse.json({ ok: true, isBlocked: !source.isBlocked });
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
