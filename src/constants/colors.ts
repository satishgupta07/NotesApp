/**
 * src/constants/colors.ts — App Color Palette
 *
 * WHY centralise colors?
 * If you scatter hex strings like "#4A90E2" across 20 files and later
 * want to change the brand blue, you'd have to do a global find-and-replace
 * and hope you got them all. With a single source of truth here, you change
 * one line and every component updates automatically.
 *
 * HOW to use:
 *   import { Colors } from "../constants/colors";
 *   style={{ backgroundColor: Colors.primary }}
 */

export const Colors = {
  // ── Brand ───────────────────────────────────────────────────────────────
  /** Main brand blue — used for headers, FAB, links */
  primary: "#4A90E2",
  /** Lighter tint of primary — good for selected states or backgrounds */
  primaryLight: "#E6F4FE",

  // ── Backgrounds ─────────────────────────────────────────────────────────
  /** Screen / page background */
  background: "#F5F5F5",
  /** Card / surface background */
  surface: "#FFFFFF",

  // ── Text ────────────────────────────────────────────────────────────────
  /** Primary text — headings, important labels */
  textPrimary: "#1A1A1A",
  /** Secondary text — body copy, descriptions */
  textSecondary: "#666666",
  /** Muted text — dates, placeholders, hints */
  textMuted: "#AAAAAA",
  /** Even lighter muted — sub-hints */
  textFaint: "#BBBBBB",

  // ── UI ──────────────────────────────────────────────────────────────────
  /** Border / divider lines */
  border: "#E0E0E0",
  /** Danger / destructive actions (e.g. delete) */
  danger: "#E74C3C",
  /** White — for text on dark backgrounds */
  white: "#FFFFFF",
} as const;

/**
 * `as const` freezes the object so TypeScript infers the exact string
 * literal types (e.g. "#4A90E2") instead of just `string`.
 * This means typos like Colors.primray give you a compile-time error.
 */
