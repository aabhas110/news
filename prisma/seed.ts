import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  ["Top Headlines", "top-headlines"],
  ["Current Affairs", "current-affairs"],
  ["Sports", "sports"],
  ["International News", "international-news"],
  ["Politics", "politics"],
  ["Business", "business"],
  ["Technology", "technology"],
  ["Entertainment", "entertainment"],
  ["Health", "health"],
  ["Science", "science"],
  ["Education", "education"],
  ["India News", "india-news"],
  ["World News", "world-news"],
  ["Trending News", "trending-news"]
];

const sources = [
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
    name: "The New York Times",
    url: "https://www.nytimes.com",
    feedUrl: null,
    credibilityScore: 0.9
  },
  {
    name: "ESPN",
    url: "https://www.espn.com",
    feedUrl: "https://www.espn.com/espn/rss/news",
    credibilityScore: 0.82
  }
];

async function main() {
  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
  }

  for (const source of sources) {
    await prisma.source.upsert({
      where: { name: source.name },
      update: source,
      create: source
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
