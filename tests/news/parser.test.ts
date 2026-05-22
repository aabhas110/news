import { describe, expect, it } from "vitest";
import { normalizeRssItems } from "@/lib/news/fetchers";

describe("RSS parser", () => {
  it("normalizes RSS items", () => {
    const articles = normalizeRssItems(
      { name: "BBC News", url: "https://www.bbc.com/news" },
      [{ title: "Story title", link: "https://example.com/story", contentSnippet: "Snippet", isoDate: "2026-05-22T00:00:00.000Z" }]
    );

    expect(articles).toHaveLength(1);
    expect(articles[0].sourceName).toBe("BBC News");
    expect(articles[0].publishedAt).toBeInstanceOf(Date);
  });
});
