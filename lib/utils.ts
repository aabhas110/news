import slugify from "slugify";

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function makeSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true }).slice(0, 90);
}

export function truncate(input: string | null | undefined, max = 180) {
  if (!input) return "";
  return input.length > max ? `${input.slice(0, max - 1).trim()}...` : input;
}

export function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function dateScore(date: Date) {
  const ageHours = Math.max(1, (Date.now() - date.getTime()) / 36e5);
  return Math.max(0, 1 / Math.sqrt(ageHours));
}
