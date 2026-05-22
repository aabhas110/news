import { normalizeText } from "@/lib/utils";

function tokens(text: string) {
  return new Set(normalizeText(text).split(" ").filter((token) => token.length > 2));
}

export function similarity(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
}

export function duplicateKey(title: string) {
  return normalizeText(title)
    .split(" ")
    .filter((word) => word.length > 3)
    .slice(0, 10)
    .join("-");
}
