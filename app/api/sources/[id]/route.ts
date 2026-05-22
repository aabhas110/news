import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { parseJson, sourceSchema } from "@/lib/api/validation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const source = await prisma.source.findFirst({ where: { OR: [{ id: params.id }, { name: params.id }] } });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ source });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = parseJson(sourceSchema.partial(), await request.json());
  if (error || !data) return NextResponse.json({ error }, { status: 400 });
  const source = await prisma.source.update({ where: { id: params.id }, data });
  return NextResponse.json({ source });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.source.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
