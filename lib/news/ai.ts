import OpenAI from "openai";
import { Sentiment } from "@prisma/client";
import { categoryNames } from "@/lib/categories";
import type { NormalizedArticle } from "@/lib/news/types";
import { truncate } from "@/lib/utils";

const aiDisabled = process.env.AI_DISABLED === "true" || process.env.CI === "true" || process.env.NODE_ENV === "test";
const client = !aiDisabled && process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function fallbackCategory(text: string) {
  const haystack = text.toLowerCase();
  const map = [
    ["Sports", ["cricket", "football", "tennis", "match", "league", "score"]],
    ["Business", ["market", "stocks", "economy", "company", "startup", "bank"]],
    ["Technology", ["ai", "tech", "software", "chip", "cyber", "app"]],
    ["Health", ["health", "doctor", "disease", "hospital", "vaccine"]],
    ["Politics", ["election", "minister", "parliament", "party", "policy"]],
    ["Entertainment", ["film", "movie", "actor", "music", "streaming"]],
    ["Science", ["space", "research", "climate", "scientists", "study"]],
    ["Education", ["school", "university", "exam", "students", "college"]],
    ["India News", ["india", "delhi", "mumbai", "bengaluru", "supreme court"]],
    ["World News", ["global", "world", "united states", "china", "europe"]]
  ] as const;

  return map.find(([, words]) => words.some((word) => haystack.includes(word)))?.[0] ?? "Top Headlines";
}

function fallbackKeywords(text: string) {
  const stop = new Set(["with", "from", "that", "this", "have", "will", "after", "over", "into", "about"]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stop.has(word))
    .slice(0, 8);
}

export async function enrichWithAI(article: NormalizedArticle) {
  const text = [article.title, article.description, article.contentSnippet].filter(Boolean).join("\n");

  if (!client) {
    return {
      categoryName: fallbackCategory(text),
      aiSummary: truncate(article.description || article.contentSnippet || article.title, 240),
      keywords: fallbackKeywords(text),
      sentiment: Sentiment.NEUTRAL
    };
  }

  let parsed: {
    categoryName?: string;
    summary?: string;
    keywords?: string[];
    sentiment?: string;
  } = {};

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Analyze news metadata. Return compact JSON with categoryName, summary, keywords, sentiment. Use only the provided text. Summary must be three short lines or fewer."
        },
        {
          role: "user",
          content: JSON.stringify({ allowedCategories: categoryNames, article: text })
        }
      ]
    });
    parsed = JSON.parse(response.choices[0]?.message.content || "{}");
  } catch {
    parsed = {};
  }

  const sentiment =
    parsed.sentiment?.toUpperCase() === "POSITIVE"
      ? Sentiment.POSITIVE
      : parsed.sentiment?.toUpperCase() === "NEGATIVE"
        ? Sentiment.NEGATIVE
        : Sentiment.NEUTRAL;

  return {
    categoryName: categoryNames.includes(parsed.categoryName || "") ? parsed.categoryName! : fallbackCategory(text),
    aiSummary: truncate(parsed.summary || article.description || article.title, 320),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : fallbackKeywords(text),
    sentiment
  };
}
