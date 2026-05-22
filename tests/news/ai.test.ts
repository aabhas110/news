import { describe, expect, it } from "vitest";
import { enrichWithAI } from "@/lib/news/ai";

describe("AI enrichment fallback", () => {
  it("summarizes and classifies without paid AI calls in tests", async () => {
    const result = await enrichWithAI({
      title: "AI chip startup raises new funding",
      description: "A technology startup raised funding for a new chip platform.",
      contentSnippet: null,
      imageUrl: null,
      sourceName: "Test Source",
      sourceUrl: "https://example.com",
      originalUrl: "https://example.com/story",
      language: "en",
      publishedAt: new Date()
    });

    expect(result.categoryName).toBe("Business");
    expect(result.aiSummary.length).toBeGreaterThan(10);
    expect(result.keywords.length).toBeGreaterThan(0);
  });
});
