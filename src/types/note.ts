/**
 * types/note.ts
 *
 * This file defines the TypeScript "shape" (interface) of a Note object.
 *
 * WHY use TypeScript interfaces?
 * - They act like a contract: any object claiming to be a Note MUST have these fields.
 * - Your editor will auto-complete and warn you if you mistype a property name.
 * - Makes the code self-documenting — you can see exactly what a Note contains.
 */

export interface Note {
  /** Unique identifier for each note (we'll use a timestamp string like "1712345678901") */
  id: string;

  /** The main heading of the note */
  title: string;

  /** The full body/content of the note */
  content: string;

  /**
   * ISO 8601 date string (e.g. "2024-04-11T10:30:00.000Z")
   * We store as a string so it survives JSON serialization (e.g. AsyncStorage).
   * Use `new Date(note.createdAt)` whenever you need to format/compare it.
   */
  createdAt: string;
}
