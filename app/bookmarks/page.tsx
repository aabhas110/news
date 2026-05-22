import { getServerSession } from "next-auth";
import { ArticleCard } from "@/components/article-card";
import { authOptions } from "@/lib/auth";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  const bookmarks = session?.user?.id
    ? (await apiGet<{ bookmarks: Array<any> }>("/api/bookmark")).bookmarks
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-bold">Bookmarks</h1>
      {!session ? <p className="rounded-lg border border-line p-5 dark:border-white/10">Sign in to save and sync articles.</p> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <ArticleCard key={bookmark.id} article={bookmark.article} />
        ))}
      </div>
    </div>
  );
}
