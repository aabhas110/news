import { headers } from "next/headers";

export function appBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const cookie = headers().get("cookie") ?? "";
  const response = await fetch(`${appBaseUrl()}${path}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }
  return response.json() as Promise<T>;
}
