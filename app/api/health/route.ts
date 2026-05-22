import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "ok",
      uptime: process.uptime(),
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
