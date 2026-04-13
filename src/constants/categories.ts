/**
 * src/constants/categories.ts — Note Categories
 *
 * Defines the available categories a note can belong to, along with the
 * colour used to represent each one in the UI.
 *
 * CONCEPTS:
 *
 * 1. Union type
 *    `"Personal" | "Work" | "Ideas" | "Learning"` means the value can be
 *    ONLY one of those exact strings — nothing else. TypeScript will show
 *    an error if you try to assign "Random" or "personal" (case-sensitive).
 *
 * 2. Record<K, V>
 *    A TypeScript utility type that describes an object whose keys are
 *    type K and whose values are type V.
 *    `Record<NoteCategory, string>` means every category MUST have a colour
 *    entry — if you add a new category but forget to add a colour, TypeScript
 *    will show an error immediately.
 *
 * 3. as const
 *    Freezes the array/object so TypeScript infers exact literal types
 *    instead of widening them to `string`.
 */

// ---------------------------------------------------------------------------
// TYPE — the allowed category values
// ---------------------------------------------------------------------------
/**
 * The set of categories a note can be tagged with.
 * Using a union type (instead of plain `string`) means:
 *  - Auto-complete suggests the four valid values
 *  - A typo like "Leraning" is caught at compile time, not at runtime
 */
export type NoteCategory = "Personal" | "Work" | "Ideas" | "Learning";

// ---------------------------------------------------------------------------
// COLOUR MAP — one background colour per category
// ---------------------------------------------------------------------------
/**
 * Maps every NoteCategory to a background colour for its badge.
 *
 * Record<NoteCategory, string> ensures this object always has an entry
 * for ALL categories — adding a new category without a colour is a TS error.
 */
export const CATEGORY_COLORS: Record<NoteCategory, string> = {
  Personal: "#9B59B6", // purple
  Work:     "#4A90E2", // blue  (same as our primary brand colour)
  Ideas:    "#27AE60", // green
  Learning: "#E67E22", // orange
};

// ---------------------------------------------------------------------------
// LIST — useful for rendering a category picker later (Step 3 / Step 5)
// ---------------------------------------------------------------------------
/**
 * All categories as an ordered array.
 * `as const` keeps the type as a readonly tuple of exact string literals
 * instead of `string[]`, which preserves auto-complete everywhere it's used.
 */
export const ALL_CATEGORIES = [
  "Personal",
  "Work",
  "Ideas",
  "Learning",
] as const satisfies NoteCategory[];
