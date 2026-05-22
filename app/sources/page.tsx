import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const { sources } = await apiGet<{ sources: Array<any> }>("/api/sources");
  const visibleSources = sources.filter((source) => !source.isBlocked);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-bold">Sources</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-white p-5 hover:border-accent dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold">{source.name}</h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-paper/60">{source.url}</p>
            <p className="mt-4 text-sm font-semibold">Credibility {Math.round(source.credibilityScore * 100)}%</p>
          </a>
        ))}
      </div>
    </div>
  );
}
