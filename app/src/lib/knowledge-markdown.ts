// Utilities shared by knowledge markdown rendering.

// Stable checklist item key from chapter slug + line index + text.
export function checklistKey(chapterSlug: string, index: number, text: string): string {
  const clean = text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
  return `${chapterSlug}:${index}:${clean}`;
}

// Extract preview text (first N chars, no markdown syntax).
export function stripMarkdown(md: string, maxLen = 320): string {
  const cleaned = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/:::[a-z]+[\s\S]*?:::/g, " ")
    .replace(/[#>*_`~[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen)}…` : cleaned;
}
