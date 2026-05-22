import { describe, expect, it } from "vitest";
import { duplicateKey, similarity } from "@/lib/news/dedupe";

describe("article deduplication", () => {
  it("detects similar titles", () => {
    expect(similarity("India wins cricket final after late drama", "India wins cricket final in late drama")).toBeGreaterThan(0.65);
  });

  it("creates stable duplicate keys", () => {
    expect(duplicateKey("Markets rally as technology stocks rise sharply")).toContain("markets-rally");
  });
});
