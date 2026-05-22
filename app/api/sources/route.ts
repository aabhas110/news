import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/api/rate-limit";
import { parseJson, sourceSchema } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const limited = rateLimit(request, "sources");
  if (limited) return limited;
  const sources = await prisma.source.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(sourceSchema, await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });
  const source = await prisma.source.create({ data });
  return NextResponse.json({ source }, { status: 201 });
}
