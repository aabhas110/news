"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Moon, Search, Sun, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { categories } from "@/lib/categories";
import { useTheme } from "@/components/providers";

export function Nav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { dark, setDark } = useTheme();

  function onSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/92 backdrop-blur dark:border-white/10 dark:bg-ink/92">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-2xl font-bold tracking-normal text-ink dark:text-paper">
          NewsForge
        </Link>
        <form onSubmit={onSearch} className="hidden min-w-0 flex-1 items-center rounded-md border border-line bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 md:flex">
          <Search className="mr-2 h-4 w-4 text-ink/50 dark:text-paper/60" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search news, topics, sources"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/45 dark:placeholder:text-paper/45"
          />
        </form>
        <nav className="hidden items-center gap-1 lg:flex">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/75 hover:bg-white hover:text-ink dark:text-paper/75 dark:hover:bg-white/10 dark:hover:text-paper"
            >
              {category.name.replace(" News", "")}
            </Link>
          ))}
        </nav>
        <Link href="/bookmarks" className="rounded-md p-2 hover:bg-white dark:hover:bg-white/10" aria-label="Bookmarks">
          <Bookmark className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="rounded-md p-2 hover:bg-white dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link href="/profile" className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper hover:bg-accent dark:bg-paper dark:text-ink">
          <span className="hidden sm:inline">Login</span>
          <UserRound className="h-5 w-5 sm:hidden" />
        </Link>
      </div>
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="whitespace-nowrap rounded-full border border-line px-3 py-1 text-xs font-semibold dark:border-white/10"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
