/**
 * src/context/NotesContext.tsx — Global Notes State
 *
 * Provides the notes array (and operations on it) to EVERY screen in the app
 * without passing props through intermediate components.
 *
 * THE PROBLEM CONTEXT SOLVES — "Prop Drilling"
 * ─────────────────────────────────────────────
 * Before Context, data flows down the component tree via props:
 *
 *   RootLayout
 *     └─ HomeScreen  ← owns notes state
 *          └─ NoteCard  ← needs onLongPress to trigger delete
 *               └─ (imaginary grandchild) ← also needs notes somehow?
 *
 * To get `notes` into a grandchild you'd pass it through every level
 * ("prop drilling"). Context eliminates this — any component anywhere in
 * the tree can read from the context directly.
 *
 * HOW CONTEXT WORKS
 * ─────────────────
 *   1. createContext()    — creates the "channel" (a container for a value)
 *   2. <Context.Provider> — broadcasts a value DOWN the component tree
 *   3. useContext()       — any descendant can read that value
 *
 *   Provider
 *     ├─ Screen A  →  useContext() reads the value ✅
 *     ├─ Screen B  →  useContext() reads the value ✅
 *     └─ Screen C  →  useContext() reads the value ✅
 *
 * WHAT THIS FILE EXPORTS
 * ──────────────────────
 *   NotesProvider      — wrap your app (or _layout.tsx) with this
 *   useNotesContext    — call this in any component to read/update notes
 */

import { createContext, ReactNode, useContext } from "react";
import { useNotes } from "../hooks/useNotes";
import { Note } from "../types/note";

// ---------------------------------------------------------------------------
// 1. CONTEXT VALUE TYPE
// ---------------------------------------------------------------------------
/**
 * Describes everything the context exposes to consumers.
 *
 * WHY named operations (addNote, updateNote, deleteNote) instead of setNotes?
 * Exposing raw `setNotes` forces every caller to know HOW to manipulate arrays.
 * Named operations are self-documenting and hide the implementation detail.
 * If we ever change the storage backend, callers don't need to change.
 */
interface NotesContextValue {
  /** The current list of notes — read this in your UI */
  notes: Note[];
  /** True while notes are being loaded from AsyncStorage on first mount */
  isLoading: boolean;
  /** Add a new note to the top of the list */
  addNote: (note: Note) => void;
  /** Replace an existing note (matched by id) with an updated version */
  updateNote: (note: Note) => void;
  /** Remove the note with the given id */
  deleteNote: (id: string) => void;
}

// ---------------------------------------------------------------------------
// 2. CREATE THE CONTEXT
// ---------------------------------------------------------------------------
/**
 * createContext<T>(defaultValue)
 * ───────────────────────────────
 * Creates the "channel". The default value is used ONLY when a component
 * calls useContext() outside of any Provider — which is almost always a bug.
 * We use `null` as the default and check for it in useNotesContext() below.
 */
const NotesContext = createContext<NotesContextValue | null>(null);

// ---------------------------------------------------------------------------
// 3. PROVIDER COMPONENT
// ---------------------------------------------------------------------------
/**
 * NotesProvider — wraps the component tree and makes notes available everywhere.
 *
 * It uses the `useNotes` hook internally (which handles AsyncStorage),
 * then exposes clean named operations via the context value.
 *
 * Place this high in the tree — typically in _layout.tsx — so every screen
 * is a descendant and can call useNotesContext().
 *
 * Props:
 *   children — ReactNode: anything that can be rendered (screens, components, etc.)
 */
export function NotesProvider({ children }: { children: ReactNode }) {
  /**
   * useNotes() gives us the raw state + setter.
   * We wrap the setter with named operations before broadcasting via context.
   */
  const { notes, setNotes, isLoading } = useNotes();

  // ── Named operations ─────────────────────────────────────────────────────
  // Each operation calls setNotes with the functional form (always uses freshest state).

  function addNote(note: Note) {
    setNotes((prev) => [note, ...prev]); // prepend so newest appears at top
  }

  function updateNote(updated: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n)) // swap matching note
    );
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id)); // remove matching note
  }

  // ── Broadcast the value ───────────────────────────────────────────────────
  return (
    /**
     * <NotesContext.Provider value={...}>
     * ─────────────────────────────────────
     * Every component INSIDE this Provider can call useContext(NotesContext)
     * and receive the `value` object.
     *
     * When `value` changes (e.g. a note is added), React re-renders only the
     * components that are actually consuming the context — not every component.
     */
    <NotesContext.Provider value={{ notes, isLoading, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// 4. CONSUMER HOOK
// ---------------------------------------------------------------------------
/**
 * useNotesContext — the only way screens should access the notes context.
 *
 * WHY wrap useContext in a custom hook?
 * 1. The null-check gives a clear error if someone forgets to add NotesProvider.
 *    Without it, the error would be a confusing "cannot read property of null".
 * 2. Consumers import one thing (`useNotesContext`) instead of two
 *    (`useContext` + `NotesContext`).
 * 3. If the context shape ever changes, you update this one function.
 *
 * Usage in any screen:
 *   const { notes, addNote, deleteNote } = useNotesContext();
 */
export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext);

  /**
   * If ctx is null, this hook was called outside of <NotesProvider>.
   * Throwing here gives a clear error message pointing to the root cause.
   */
  if (!ctx) {
    throw new Error(
      "useNotesContext() must be called inside a <NotesProvider>. " +
      "Make sure NotesProvider wraps your root layout."
    );
  }

  return ctx;
}
