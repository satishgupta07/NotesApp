/**
 * src/utils/date.ts — Date Formatting Utilities
 *
 * WHY a utils folder?
 * Pure helper functions that are not tied to any component go here.
 * Keeping them separate means:
 *  - Easy to test in isolation (no React, no UI, just logic)
 *  - Reusable across any screen or component
 *  - Easy to find when you need to change date formatting app-wide
 */

/**
 * Converts an ISO 8601 date string to a short human-readable label.
 *
 * Example:  "2024-04-11T09:30:00.000Z"  →  "Apr 11, 2024"
 *
 * @param isoString - The ISO 8601 date string stored on the Note (e.g. note.createdAt)
 * @returns A formatted date string
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns a relative time label for recent dates, falls back to formatDate.
 *
 * Examples:
 *  - within the last minute  →  "Just now"
 *  - within the last hour    →  "5 minutes ago"
 *  - today                   →  "Today"
 *  - yesterday               →  "Yesterday"
 *  - older                   →  "Apr 9, 2024"
 *
 * We'll use this in Step 9 (Polish) to make the note list feel more alive.
 *
 * @param isoString - The ISO 8601 date string stored on the Note
 */
export function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} minutes ago`;

  // Check if "today"
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (then >= todayStart.getTime()) return "Today";

  // Check if "yesterday"
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (then >= yesterdayStart.getTime()) return "Yesterday";

  // Older than yesterday — show full date
  return formatDate(isoString);
}
