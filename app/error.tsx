"use client";

import { RotateCw } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-8 text-center dark:border-white/10 dark:bg-white/5">
      <h1 className="font-serif text-3xl font-bold">Something failed to load</h1>
      <p className="mt-3 text-ink/65 dark:text-paper/65">The backend request did not complete. Try again in a moment.</p>
      <button
        onClick={reset}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper dark:bg-paper dark:text-ink"
      >
        <RotateCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}
