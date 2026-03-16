/**
 * Formats a Date object into a human-readable string.
 * Output: "Jan 15, 2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
