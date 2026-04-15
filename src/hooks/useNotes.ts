/**
 * src/hooks/useNotes.ts — Custom Hook for Notes with Persistence
 *
 * Manages the notes array AND keeps it in sync with AsyncStorage so data
 * survives the app being closed and reopened.
 *
 * WHAT IS A CUSTOM HOOK?
 * ──────────────────────
 * A custom hook is a plain TypeScript function whose name starts with "use"
 * and that can call other hooks (useState, useEffect, etc.) inside it.
 *
 * WHY extract logic into a hook?
 *  - Keeps the screen component focused on UI — not storage details
 *  - The same hook can be used by multiple screens (Step 7 replaces this
 *    with Context so ALL screens share one instance)
 *  - Easy to test the logic in isolation
 *
 * CONCEPTS COVERED:
 *  1. Custom hooks              — reusable stateful logic
 *  2. useEffect with []         — run once on mount (load saved data)
 *  3. useEffect with [notes]    — run every time notes changes (auto-save)
 *  4. async / await             — asynchronous code that reads linearly
 *  5. try / catch / finally     — error handling
 *  6. AsyncStorage              — persistent key-value storage on the device
 *  7. JSON.stringify / parse    — convert objects ↔ strings for storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Note } from "../types/note";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
/**
 * The key under which we store notes in AsyncStorage.
 *
 * Namespacing with "@notesapp/" is a convention that avoids accidental key
 * collisions if other libraries also use AsyncStorage in the same app.
 */
const STORAGE_KEY = "@notesapp/notes";

/**
 * Default notes shown on the very first launch (before the user has any data).
 * After that, notes always come from AsyncStorage.
 */
const FIRST_LAUNCH_NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome to NotesApp!",
    content:
      "Your notes are saved automatically and will be here when you come back. " +
      "Tap the + button to create a note, or long-press any note to edit or delete it.",
    createdAt: "2024-04-10T09:00:00.000Z",
    category: "Personal",
  },
  {
    id: "2",
    title: "React Native Basics",
    content:
      "In React Native there are no HTML tags. " +
      "Use View (like <div>) and Text (like <p>) instead.",
    createdAt: "2024-04-10T10:15:00.000Z",
    category: "Learning",
  },
  {
    id: "3",
    title: "App Ideas",
    content: "1. Habit tracker  2. Budget splitter  3. Recipe box  4. Travel journal",
    createdAt: "2024-04-11T11:00:00.000Z",
    category: "Ideas",
  },
];

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------
/**
 * useNotes — manages the notes array with automatic AsyncStorage persistence.
 *
 * Returns:
 *   notes     — the current array of notes (read this in your UI)
 *   setNotes  — update the notes array (AsyncStorage auto-saves after every change)
 *   isLoading — true while the initial load from storage is in progress
 *
 * Usage:
 *   const { notes, setNotes, isLoading } = useNotes();
 */
export function useNotes() {
  const [notes,     setNotes]     = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true); // start true — we haven't loaded yet

  // ── Effect 1: Load from storage once when the hook first mounts ────────────
  /**
   * useEffect(() => { ... }, [])
   * ─────────────────────────────
   * The empty array `[]` is the DEPENDENCY ARRAY.
   * An empty array means: "run this effect exactly once — after the very
   * first render." It never re-runs because there are no dependencies to change.
   *
   * This is the standard way to fetch/load data when a screen first appears.
   */
  useEffect(() => {
    loadNotes();
  }, []); // ← [] = run once on mount

  // ── Effect 2: Save to storage whenever notes changes ──────────────────────
  /**
   * useEffect(() => { ... }, [notes, isLoading])
   * ─────────────────────────────────────────────
   * Runs after every render where `notes` or `isLoading` changed.
   *
   * The `isLoading` guard is important:
   *   - On first render: isLoading=true, notes=[]  → DO NOT save (would wipe storage)
   *   - After loadNotes: isLoading=false, notes=loaded data → DO save
   *   - After user edits: isLoading=false, notes=new data   → DO save ✅
   *
   * Without this guard, the initial empty [] would immediately overwrite
   * whatever was in AsyncStorage before we got a chance to load it.
   */
  useEffect(() => {
    if (!isLoading) {
      saveNotes(notes);
    }
  }, [notes, isLoading]); // ← re-run when either of these values changes

  // ── Async functions ────────────────────────────────────────────────────────
  /**
   * loadNotes — reads the notes array from AsyncStorage.
   *
   * async / await
   * ─────────────
   * `async` marks a function as asynchronous — it always returns a Promise.
   * `await` pauses execution inside the function until the Promise resolves,
   * but does NOT block the rest of the app (the UI stays responsive).
   *
   * This lets async code look like synchronous code:
   *
   *   const json = await AsyncStorage.getItem(key);  // wait for storage read
   *   // json is now the actual string value (or null if nothing was saved)
   */
  async function loadNotes() {
    /**
     * try / catch / finally
     * ──────────────────────
     * try     — run the risky code (network call, file read, etc.)
     * catch   — if anything inside `try` throws, handle the error here
     * finally — always runs, whether there was an error or not
     *           Perfect for cleanup like setIsLoading(false)
     */
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);

      if (json !== null) {
        /**
         * JSON.parse(json) converts the stored string back into a JS object.
         * We cast it to `Note[]` because TypeScript can't know the stored shape.
         *
         * Example:
         *   stored string: '[{"id":"1","title":"Hello",...}]'
         *   parsed result: [{ id: "1", title: "Hello", ... }]
         */
        const saved = JSON.parse(json) as Note[];
        setNotes(saved);
      } else {
        // First launch — nothing in storage yet, use the default notes
        setNotes(FIRST_LAUNCH_NOTES);
      }
    } catch (error) {
      // Storage read failed (e.g. corrupted data) — fall back to defaults
      console.error("[useNotes] Failed to load notes:", error);
      setNotes(FIRST_LAUNCH_NOTES);
    } finally {
      // Always exit the loading state, even if something went wrong
      setIsLoading(false);
    }
  }

  /**
   * saveNotes — writes the notes array to AsyncStorage.
   *
   * JSON.stringify(notes) converts the array to a string:
   *   [{ id: "1", title: "Hello", ... }]  →  '[{"id":"1","title":"Hello",...}]'
   *
   * AsyncStorage can only store strings — JSON is the standard way to
   * serialize JavaScript objects into a string for storage.
   */
  async function saveNotes(notesToSave: Note[]) {
    try {
      const json = JSON.stringify(notesToSave);
      await AsyncStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
      // Save failed — log it but don't crash the app
      // In a production app you might show a toast: "Failed to save"
      console.error("[useNotes] Failed to save notes:", error);
    }
  }

  // Return only what screens need — the internal async functions stay private
  return { notes, setNotes, isLoading };
}
