/**
 * Convert a section slug like "quick-start" or "ai-chat" into a Title-Case
 * label matching Vercel's docs sidebar typography ("Quick Start", "AI Chat").
 *
 * Used by both server components (breadcrumb derivation) and the client-side
 * sidebar nav, so it lives here as a plain utility module — no "use client".
 */
export function formatSectionLabel(raw: string): string {
  const cleaned = raw.replace(/[-_]/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map((word) => {
      if (word.toLowerCase() === "ai") return "AI";
      if (word.length === 0) return word;
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
