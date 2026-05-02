/**
 * app/detail.tsx — Note Detail Screen
 *
 * WHAT CHANGED IN STEP 7:
 *  - No longer reads title/content/category/createdAt from URL params.
 *  - Reads only the note `id` from params, then looks up the full note
 *    from NotesContext — so the detail view always shows LIVE data.
 *
 * WHY THIS IS BETTER:
 *  Before: params carried a snapshot of the note at navigation time.
 *          If you edited the note then navigated back and forward again,
 *          the detail screen would show stale data.
 *  Now:    params carry only the stable `id`. The note is looked up from
 *          context on every render, so edits are reflected immediately.
 *
 * CONCEPTS:
 *  - useLocalSearchParams — still used, but now only for the id
 *  - useNotesContext      — read the live notes array
 *  - array.find()         — locate one item by a condition
 *  - Guard clause         — handle "note not found" before the main render
 */

import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CATEGORY_COLORS, NoteCategory } from "../src/constants/categories";
import { Colors } from "../src/constants/colors";
import { useNotesContext } from "../src/context/NotesContext";
import { formatDate } from "../src/utils/date";

export default function DetailScreen() {

  // ── Read the note id from URL params ──────────────────────────────────────
  /**
   * We now pass ONLY the id when navigating here (see index.tsx).
   * The id is stable — it never changes for a given note — so it's
   * safe to use as the single URL param.
   */
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Look up the full note from context ────────────────────────────────────
  /**
   * array.find(predicate)
   * ──────────────────────
   * Returns the FIRST item where predicate returns true, or `undefined`
   * if no item matches.
   *
   * Because this reads directly from the context (which is kept in sync
   * with AsyncStorage), this always reflects the current state of the note.
   */
  const { notes } = useNotesContext();
  const note = notes.find((n) => n.id === id);

  // ── Guard clause — note not found ─────────────────────────────────────────
  /**
   * This can happen if:
   *   - The note was deleted while the user was on this screen
   *   - An invalid id was passed somehow
   *
   * We return early with a friendly message rather than crashing.
   * The Stack navigator's back arrow still works to go back home.
   */
  if (!note) {
    return (
      <>
        <Stack.Screen options={{ title: "Note" }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This note no longer exists.</Text>
        </View>
      </>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const noteCategory = note.category as NoteCategory | undefined;
  const badgeColor   = noteCategory ? CATEGORY_COLORS[noteCategory] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Set the header title to the note's actual title */}
      <Stack.Screen options={{ title: note.title }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Metadata row ───────────────────────────────────────────── */}
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(note.createdAt)}</Text>

          {badgeColor && noteCategory && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{noteCategory}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Full note content ──────────────────────────────────────── */}
        <Text style={styles.contentText} selectable>
          {note.content}
        </Text>
      </ScrollView>
    </>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  // ── Not-found state ───────────────────────────────────────────────────────
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },

  // ── Metadata ──────────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
});
