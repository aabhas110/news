# NewsForge

NewsForge is a production-oriented news aggregation platform built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, RSS/API news ingestion, and optional OpenAI enrichment.

It uses official APIs and RSS feeds only. Article pages show metadata, snippets, AI summaries, source attribution, credibility/risk signals, and a link to the original publisher instead of copying full copyrighted content.

## Features

- Homepage with latest, featured, trending, and personalized news.
- Category pages for top headlines, politics, business, technology, sports, health, science, education, India, world, and entertainment.
- Search, trending, article detail, bookmarks, profile, sources, and admin pages.
- API routes for news, category news, search, trending, bookmarks, preferences, admin source blocking, article featuring, and scheduled ingestion.
- PostgreSQL schema for users, articles, categories, sources, bookmarks, preferences, and trending topics.
- AI pipeline for categorization, three-line summaries, keyword extraction, sentiment, credibility/risk labels, ranking, and duplicate detection.
- Responsive light/dark news-magazine interface.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/newsforge?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-secret"
CRON_SECRET="a-secret-for-cron"
```

Optional API keys:

```bash
OPENAI_API_KEY=""
NEWS_API_KEY=""
GNEWS_API_KEY=""
GUARDIAN_API_KEY=""
NYTIMES_API_KEY=""
```

3. Create and seed the database:

```bash
npm run prisma:migrate
npx prisma db seed
```

4. Fetch news:

```bash
npm run news:fetch
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Verification Commands

Run these before opening a pull request:

```bash
npm install
npm run lint
npm run type-check
npm run test
npm run build
docker build -t newsforge:local .
docker compose up --build
```

The application is dynamic: pages request data from backend API routes, API routes read from PostgreSQL through Prisma, and news ingestion stores normalized articles in the database.

## Admin Access

Create a user in the database and set `role` to `ADMIN`. For the included credentials provider, set `DEMO_ADMIN_PASSWORD_HASH` to a bcrypt hash. In production, replace or extend the provider configuration with Google, GitHub, or your organization identity provider.

## Ingestion Pipeline

The scheduled job at `/api/cron/fetch-news`:

1. Reads unblocked RSS/API sources.
2. Normalizes metadata and snippets.
3. Skips duplicate URLs and similar-title duplicate keys.
4. Runs OpenAI enrichment when `OPENAI_API_KEY` is present; otherwise uses deterministic fallbacks.
5. Assigns category, summary, keywords, sentiment, credibility score, risk label, and trending score.
6. Stores articles and updates trending topics.

Vercel cron is configured in `vercel.json` to run every 30 minutes. Call it with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/fetch-news
```

## Deployment

1. Create a PostgreSQL database on Supabase or Neon.
2. Add environment variables in Vercel.
3. Deploy the repository to Vercel.
4. Run Prisma migration against production:

```bash
npx prisma migrate deploy
```

5. Seed categories and trusted sources:

```bash
npx prisma db seed
```

6. Trigger `/api/cron/fetch-news` once to populate articles.

## API Routes

- `GET /api/health`
- `GET /api/articles`
- `POST /api/articles`
- `GET /api/articles/[id-or-slug]`
- `PATCH /api/articles/[id]`
- `DELETE /api/articles/[id]`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/[id-or-slug]`
- `PATCH /api/categories/[id]`
- `DELETE /api/categories/[id]`
- `GET /api/sources`
- `POST /api/sources`
- `GET /api/sources/[id-or-name]`
- `PATCH /api/sources/[id]`
- `DELETE /api/sources/[id]`
- `GET /api/news`
- `GET /api/news/category/[category]`
- `GET /api/news/search?q=term`
- `GET /api/news/trending`
- `GET /api/news/fetch`
- `POST /api/news/fetch`
- `GET /api/bookmark`
- `POST /api/bookmark`
- `DELETE /api/bookmark`
- `GET /api/user/preferences`
- `POST /api/user/preferences`
- `DELETE /api/user/preferences`
- `POST /api/admin/source/block`
- `POST /api/admin/article/feature`
- `POST /api/admin/category`
- `POST /api/admin/trending-topic`
- `GET /api/cron/fetch-news`

## Jenkins CI/CD

The root `Jenkinsfile` includes:

- Checkout
- Install Dependencies
- Environment Check
- Prisma Generate
- Lint
- Type Check
- Unit Tests
- Build
- Docker Build
- Smoke Test
- Archive Artifacts
- Cleanup

CI sets `AI_DISABLED=true`, so Jenkins never calls paid AI APIs. Add Docker access to the Jenkins agent and ensure Node.js 20+ is available.

## GitHub Push

```bash
git add .
git commit -m "Build dynamic news aggregation platform"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## Notes

- Do not add unofficial scraping. Add new publishers through official APIs or RSS feeds.
- Always retain `sourceName`, `sourceUrl`, and `originalUrl`.
- Keep article pages summary-first and link out to the original publisher for the full report.
