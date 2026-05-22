import { NextResponse } from "next/server";
import { ingestNews } from "@/lib/news/ingest";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await ingestNews();
  return NextResponse.json(result);
}
