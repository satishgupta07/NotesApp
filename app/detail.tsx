/**
 * app/detail.tsx — Note Detail Screen
 *
 * Shows the full content of a single note.
 * Reached by tapping a NoteCard on the Home Screen.
 *
 * EXPO ROUTER — this file maps to the route "/detail".
 * The Stack navigator automatically adds a back arrow that
 * returns the user to the Home Screen.
 *
 * CONCEPTS COVERED:
 *  1. useLocalSearchParams — read URL params passed by the previous screen
 *  2. <Stack.Screen>       — set header options dynamically from inside a screen
 *  3. ScrollView           — scrollable container for long content
 *  4. Params are always strings — you may need to cast or parse them
 *
 * WHY PARAMS INSTEAD OF GLOBAL STATE?
 *  Right now we pass each note field individually as a URL param.
 *  This works fine for reading, but it has a limitation: if you edit
 *  the note here, you can't easily update the list on the Home Screen.
 *  Step 7 (Context API) will solve this by giving every screen access
 *  to the same shared notes array.
 */

import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CATEGORY_COLORS, NoteCategory } from "../src/constants/categories";
import { Colors } from "../src/constants/colors";
import { formatDate } from "../src/utils/date";

// ---------------------------------------------------------------------------
// SCREEN
// ---------------------------------------------------------------------------
export default function DetailScreen() {

  /**
   * useLocalSearchParams<T>()
   * ─────────────────────────
   * Reads the URL params that were passed via router.push({ params: { ... } }).
   *
   * The generic <T> describes the shape of the params object so TypeScript
   * knows exactly what fields to expect and that they are all strings.
   *
   * IMPORTANT — params are ALWAYS strings (URL query params can only be strings).
   * If you passed a number or boolean, you must convert it back yourself:
   *   const count = Number(params.count);
   *   const flag  = params.flag === "true";
   */
  const { title, content, category, createdAt } = useLocalSearchParams<{
    id:        string;
    title:     string;
    content:   string;
    category:  string;
    createdAt: string;
  }>();

  /**
   * Cast `category` from `string` to `NoteCategory | undefined`.
   *
   * useLocalSearchParams always returns strings, but our NoteCategory type
   * is a union of specific string literals. The cast tells TypeScript
   * "trust me, this string is one of the valid categories".
   *
   * We check `|| undefined` so that an empty string ("") becomes undefined
   * (happens when a note has no category and we passed category: "").
   */
  const noteCategory = (category || undefined) as NoteCategory | undefined;

  // The badge colour for this category (undefined-safe)
  const badgeColor = noteCategory ? CATEGORY_COLORS[noteCategory] : null;

  return (
    <>
      {/**
       * <Stack.Screen> inside a component
       * ───────────────────────────────────
       * You can render <Stack.Screen> anywhere inside a screen component
       * to imperatively set that screen's header options at render time.
       *
       * Here we set `title` to the actual note title so the header shows
       * "React Native Basics" instead of a generic "Detail".
       *
       * This overrides whatever title was set in _layout.tsx for this route.
       */}
      <Stack.Screen
        options={{
          title: title ?? "Note",   // fallback to "Note" if title param is missing
        }}
      />

      {/**
       * ScrollView — unlike View, ScrollView lets its content exceed the
       * screen height and become scrollable. Use it whenever content might
       * be longer than the visible area (e.g. a long note).
       *
       * `contentContainerStyle` styles the inner content box (the scrollable
       * area), while `style` styles the outer container itself.
       */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Metadata row — date on the left, badge on the right ───── */}
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>

          {/* Only render the badge if this note has a category */}
          {badgeColor && noteCategory && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{noteCategory}</Text>
            </View>
          )}
        </View>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Full note content ──────────────────────────────────────── */}
        {/**
         * No `numberOfLines` here — we want the full text to be visible.
         * `selectable` lets the user long-press to copy the text (iOS & Android).
         */}
        <Text style={styles.contentText} selectable>
          {content}
        </Text>

        {/* Step 5: Edit and Delete buttons will go here */}
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

  // ── Metadata row ──────────────────────────────────────────────────────────
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

  // ── Category badge (same pill style as NoteCard) ──────────────────────────
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

  // ── Divider line ──────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },

  // ── Note body ─────────────────────────────────────────────────────────────
  contentText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,       // generous line-height makes long text comfortable to read
  },
});
