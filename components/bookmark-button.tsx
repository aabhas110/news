"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export function BookmarkButton({ articleId }: { articleId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const method = saved ? "DELETE" : "POST";
    const response = await fetch("/api/bookmark", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId })
    });
    if (response.ok) setSaved(!saved);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-50 dark:border-white/10"
    >
      <Bookmark className="h-4 w-4" />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
