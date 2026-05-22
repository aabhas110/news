import Parser from "rss-parser";
import type { NormalizedArticle } from "@/lib/news/types";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"]
    ]
  }
});

type FeedSource = {
  name: string;
  url: string;
  feedUrl: string;
  credibilityScore: number;
};

export const defaultFeeds: FeedSource[] = [
  {
    name: "BBC News",
    url: "https://www.bbc.com/news",
    feedUrl: "https://feeds.bbci.co.uk/news/rss.xml",
    credibilityScore: 0.9
  },
  {
    name: "The Guardian",
    url: "https://www.theguardian.com/international",
    feedUrl: "https://www.theguardian.com/world/rss",
    credibilityScore: 0.88
  },
  {
    name: "ESPN",
    url: "https://www.espn.com",
    feedUrl: "https://www.espn.com/espn/rss/news",
    credibilityScore: 0.82
  }
];

function itemImage(item: Parser.Item & Record<string, unknown>) {
  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  return mediaContent?.$?.url ?? mediaThumbnail?.$?.url ?? null;
}

export function normalizeRssItems(source: Pick<FeedSource, "name" | "url">, items: Parser.Item[]) {
  return items
    .filter((item) => item.title && item.link)
    .map((item) => {
      const extended = item as Parser.Item & { summary?: string } & Record<string, unknown>;
      return {
        title: item.title!,
        description: item.contentSnippet ?? extended.summary ?? null,
        contentSnippet: item.contentSnippet ?? null,
        imageUrl: itemImage(extended),
        sourceName: source.name,
        sourceUrl: source.url,
        originalUrl: item.link!,
        language: "en",
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date()
      };
    });
}

export async function fetchRssSource(source: FeedSource): Promise<NormalizedArticle[]> {
  const feed = await parser.parseURL(source.feedUrl);
  return normalizeRssItems(source, feed.items);
}

export async function fetchNewsApi(): Promise<NormalizedArticle[]> {
  if (!process.env.NEWS_API_KEY) return [];
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("apiKey", process.env.NEWS_API_KEY);
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    articles?: Array<{
      title?: string;
      description?: string;
      content?: string;
      url?: string;
      urlToImage?: string;
      publishedAt?: string;
      source?: { name?: string };
    }>;
  };
  return (data.articles ?? [])
    .filter((article) => article.title && article.url)
    .map((article) => ({
      title: article.title!,
      description: article.description ?? null,
      contentSnippet: article.content ?? null,
      imageUrl: article.urlToImage ?? null,
      sourceName: article.source?.name ?? "NewsAPI",
      sourceUrl: null,
      originalUrl: article.url!,
      language: "en",
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date()
    }));
}

export async function fetchGNews(): Promise<NormalizedArticle[]> {
  if (!process.env.GNEWS_API_KEY) return [];
  const url = new URL("https://gnews.io/api/v4/top-headlines");
  url.searchParams.set("lang", "en");
  url.searchParams.set("max", "50");
  url.searchParams.set("apikey", process.env.GNEWS_API_KEY);
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    articles?: Array<{
      title?: string;
      description?: string;
      url?: string;
      image?: string;
      publishedAt?: string;
      source?: { name?: string; url?: string };
    }>;
  };
  return (data.articles ?? [])
    .filter((article) => article.title && article.url)
    .map((article) => ({
      title: article.title!,
      description: article.description ?? null,
      contentSnippet: article.description ?? null,
      imageUrl: article.image ?? null,
      sourceName: article.source?.name ?? "GNews",
      sourceUrl: article.source?.url ?? null,
      originalUrl: article.url!,
      language: "en",
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date()
    }));
}

export async function fetchGuardian(): Promise<NormalizedArticle[]> {
  if (!process.env.GUARDIAN_API_KEY) return [];
  const url = new URL("https://content.guardianapis.com/search");
  url.searchParams.set("api-key", process.env.GUARDIAN_API_KEY);
  url.searchParams.set("show-fields", "trailText,thumbnail");
  url.searchParams.set("page-size", "50");
  url.searchParams.set("order-by", "newest");
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    response?: {
      results?: Array<{
        webTitle?: string;
        webUrl?: string;
        webPublicationDate?: string;
        fields?: { trailText?: string; thumbnail?: string };
      }>;
    };
  };
  return (data.response?.results ?? [])
    .filter((article) => article.webTitle && article.webUrl)
    .map((article) => ({
      title: article.webTitle!,
      description: article.fields?.trailText ?? null,
      contentSnippet: article.fields?.trailText ?? null,
      imageUrl: article.fields?.thumbnail ?? null,
      sourceName: "The Guardian",
      sourceUrl: "https://www.theguardian.com",
      originalUrl: article.webUrl!,
      language: "en",
      publishedAt: article.webPublicationDate ? new Date(article.webPublicationDate) : new Date()
    }));
}

export async function fetchNyTimes(): Promise<NormalizedArticle[]> {
  if (!process.env.NYTIMES_API_KEY) return [];
  const url = new URL("https://api.nytimes.com/svc/topstories/v2/home.json");
  url.searchParams.set("api-key", process.env.NYTIMES_API_KEY);
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    results?: Array<{
      title?: string;
      abstract?: string;
      url?: string;
      published_date?: string;
      multimedia?: Array<{ url?: string; format?: string }>;
    }>;
  };
  return (data.results ?? [])
    .filter((article) => article.title && article.url)
    .map((article) => ({
      title: article.title!,
      description: article.abstract ?? null,
      contentSnippet: article.abstract ?? null,
      imageUrl: article.multimedia?.find((image) => image.url)?.url ?? null,
      sourceName: "The New York Times",
      sourceUrl: "https://www.nytimes.com",
      originalUrl: article.url!,
      language: "en",
      publishedAt: article.published_date ? new Date(article.published_date) : new Date()
    }));
}
