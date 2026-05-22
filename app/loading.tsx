import { ArticleSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ArticleSkeleton key={index} />
      ))}
    </div>
  );
}
