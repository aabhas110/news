import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categories } from "@/lib/categories";
import { ProfileAuthControls } from "@/components/profile-auth-controls";
import { apiGet } from "@/lib/api/fetcher";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const preferences = session?.user?.id
    ? (await apiGet<{ preferences: Array<{ category: { slug: string } }> }>("/api/user/preferences")).preferences
    : [];
  const selected = new Set(preferences.map((preference) => preference.category.slug));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-serif text-4xl font-bold">Profile</h1>
      <section className="rounded-lg border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-bold">{session ? session.user.email : "Guest reader"}</h2>
        <p className="mt-2 text-ink/65 dark:text-paper/65">Choose topics to personalize your homepage ranking.</p>
        <ProfileAuthControls />
        <form action="/api/user/preferences" method="post" className="mt-5 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.slug} className="flex items-center gap-3 rounded-md border border-line p-3 dark:border-white/10">
              <input name="categories" value={category.slug} type="checkbox" defaultChecked={selected.has(category.slug)} />
              {category.name}
            </label>
          ))}
          <button className="rounded-md bg-ink px-4 py-3 font-semibold text-paper dark:bg-paper dark:text-ink">Save preferences</button>
        </form>
      </section>
    </div>
  );
}
