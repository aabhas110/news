import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue(null)
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "article_1",
          title: "Dynamic story",
          slug: "dynamic-story",
          sourceName: "Test Source",
          publishedAt: new Date().toISOString()
        }
      ])
    }
  }
}));

describe("/api/news", () => {
  it("serves articles from the backend", async () => {
    const { GET } = await import("@/app/api/news/route");
    const response = await GET(new Request("http://localhost/api/news?limit=10"));
    await expect(response.json()).resolves.toMatchObject({
      articles: [{ title: "Dynamic story" }]
    });
  });
});
