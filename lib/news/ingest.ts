import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enrichWithAI } from "@/lib/news/ai";
import { riskAndCredibility } from "@/lib/news/credibility";
import { duplicateKey } from "@/lib/news/dedupe";
import { fetchGNews, fetchGuardian, fetchNewsApi, fetchNyTimes, fetchRssSource } from "@/lib/news/fetchers";
import { scoreArticle } from "@/lib/news/ranking";
import { makeSlug } from "@/lib/utils";

export async function fetchAllNews() {
  const sources = await prisma.source.findMany({ where: { isBlocked: false } });
  const rssArticles = await Promise.all(
    sources.filter((source) => source.feedUrl).map((source) => fetchRssSource({
      name: source.name,
      url: source.url,
      feedUrl: source.feedUrl!,
      credibilityScore: source.credibilityScore
    }))
  );
  const apiArticles = await Promise.all([fetchNewsApi(), fetchGNews(), fetchGuardian(), fetchNyTimes()]);
  return [...rssArticles.flat(), ...apiArticles.flat()];
}

async function upsertTrendingTopics(keywords: string[], articleId: string, score: number) {
  for (const keyword of keywords.slice(0, 5)) {
    const slug = makeSlug(keyword);
    if (!slug) continue;
    await prisma.trendingTopic.upsert({
      where: { slug },
      update: {
        score: { increment: score / 100 },
        articleIds: { push: articleId }
      },
      create: {
        name: keyword,
        slug,
        score: score / 100,
        articleIds: [articleId]
      }
    });
  }
}

export async function ingestNews() {
  const log = await prisma.fetchLog.create({ data: { status: "RUNNING" } });
  let stored = 0;
  let articles: Awaited<ReturnType<typeof fetchAllNews>> = [];

  try {
    articles = await fetchAllNews();

    for (const article of articles) {
      const source = await prisma.source.findUnique({ where: { name: article.sourceName } });
      if (source?.isBlocked) continue;

      const key = duplicateKey(article.title);
      const existing = await prisma.article.findFirst({
        where: {
          OR: [{ originalUrl: article.originalUrl }, { duplicateKey: key }]
        },
        select: { id: true }
      });
      if (existing) continue;

      const ai = await enrichWithAI(article);
      const category = await prisma.category.upsert({
        where: { name: ai.categoryName },
        update: {},
        create: { name: ai.categoryName, slug: makeSlug(ai.categoryName) }
      });
      const credibility = riskAndCredibility(article, source?.credibilityScore ?? 0.72);
      const trendingScore = scoreArticle({
        publishedAt: article.publishedAt,
        credibilityScore: credibility.credibilityScore,
        keywordCount: ai.keywords.length,
        hasImage: Boolean(article.imageUrl)
      });

      const data: Prisma.ArticleCreateInput = {
        title: article.title,
        slug: `${makeSlug(article.title)}-${Date.now().toString(36)}`,
        description: article.description,
        aiSummary: ai.aiSummary,
        contentSnippet: article.contentSnippet,
        imageUrl: article.imageUrl,
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl,
        originalUrl: article.originalUrl,
        country: article.country,
        language: article.language ?? "en",
        publishedAt: article.publishedAt,
        sentiment: ai.sentiment,
        credibilityScore: credibility.credibilityScore,
        riskLabel: credibility.riskLabel,
        trendingScore,
        keywords: ai.keywords,
        duplicateKey: key,
        category: { connect: { id: category.id } },
        ...(source ? { source: { connect: { id: source.id } } } : {})
      };

      const created = await prisma.article.create({ data });
      await upsertTrendingTopics(ai.keywords, created.id, trendingScore);
      stored += 1;
    }

    await prisma.fetchLog.update({
      where: { id: log.id },
      data: { status: "SUCCESS", fetched: articles.length, stored, endedAt: new Date() }
    });
    return { fetched: articles.length, stored };
  } catch (error) {
    await prisma.fetchLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        fetched: articles.length,
        stored,
        message: error instanceof Error ? error.message : "Unknown error",
        endedAt: new Date()
      }
    });
    throw error;
  }
}
