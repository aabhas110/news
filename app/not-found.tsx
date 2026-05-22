import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-8 text-center dark:border-white/10 dark:bg-white/5">
      <h1 className="font-serif text-3xl font-bold">Nothing here yet</h1>
      <p className="mt-3 text-ink/65 dark:text-paper/65">That page or story could not be found.</p>
      <Link href="/" className="mt-5 inline-block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper dark:bg-paper dark:text-ink">
        Back home
      </Link>
    </div>
  );
}
