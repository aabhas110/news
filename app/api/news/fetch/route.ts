import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { ingestNews } from "@/lib/news/ingest";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const token = request.headers.get("authorization");
  const cronAllowed = process.env.CRON_SECRET && token === `Bearer ${process.env.CRON_SECRET}`;
  if (session?.user?.role !== "ADMIN" && !cronAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await ingestNews();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return POST(request);
}
