import { describe, expect, it } from "vitest";
import { scoreArticle } from "@/lib/news/ranking";

describe("category mapping and ranking", () => {
  it("scores credible fresh stories higher than weak stories", () => {
    const strong = scoreArticle({ publishedAt: new Date(), credibilityScore: 0.9, keywordCount: 8, hasImage: true });
    const weak = scoreArticle({ publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), credibilityScore: 0.3, keywordCount: 1, hasImage: false });
    expect(strong).toBeGreaterThan(weak);
  });
});
