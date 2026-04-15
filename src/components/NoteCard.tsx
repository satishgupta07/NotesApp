/**
 * src/components/NoteCard.tsx — Note List Item
 *
 * Renders a single note as a tappable card inside the FlatList on the Home Screen.
 *
 * NEW IN STEP 2:
 *  - Category badge in the top-right corner with a dynamic background colour
 *
 * NEW IN STEP 5:
 *  - onLongPress prop — secondary gesture that triggers Edit / Delete actions
 *
 * CONCEPTS:
 *  - Props interface        : TypeScript type describing what the component accepts
 *  - numberOfLines          : clamps Text to N lines, adds "…" automatically
 *  - TouchableOpacity       : pressable wrapper that dims on press
 *  - Array style syntax     : style={[styles.base, { backgroundColor: color }]}
 *  - Optional chaining (?.) : safely access a field that might be undefined
 *  - Nullish coalescing (??): provide a fallback when a value is null/undefined
 */

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, NoteCategory } from "../constants/categories";
import { Colors } from "../constants/colors";
import { Note } from "../types/note";
import { formatDate } from "../utils/date";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface NoteCardProps {
  /** The note data to display */
  note: Note;
  /** Called when the user taps the card (navigate to detail) */
  onPress: () => void;
  /**
   * Called when the user long-presses the card (edit / delete actions).
   * Optional — not every list context needs this gesture.
   */
  onLongPress?: () => void;
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT — CategoryBadge
// ---------------------------------------------------------------------------
/**
 * A small coloured pill that shows the note's category.
 *
 * WHY a separate inner component?
 * It has its own logic (colour lookup) and its own style block.
 * Keeping it separate makes NoteCard easier to read.
 *
 * @param category - The category string from the note (may be undefined)
 */
function CategoryBadge({ category }: { category?: NoteCategory }) {
  // If the note has no category, render nothing at all.
  // `null` in JSX means "render nothing" — it's the idiomatic React way.
  if (!category) return null;

  /**
   * DYNAMIC STYLING
   * ───────────────
   * React Native supports an *array* of styles on the `style` prop.
   * Styles are merged left-to-right — later entries override earlier ones.
   *
   *   style={[styles.badge, { backgroundColor: badgeColor }]}
   *            ^^^^^^^^^^ fixed layout   ^^^^^^^^^^^^^^^^^ dynamic colour
   *
   * This lets us keep the fixed layout in StyleSheet (efficient, validated)
   * while injecting a runtime value for the colour.
   */
  const badgeColor = CATEGORY_COLORS[category];

  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
      <Text style={styles.badgeText}>{category}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function NoteCard({ note, onPress, onLongPress }: NoteCardProps) {
  const preview =
    note.content.length > 80 ? note.content.slice(0, 80) + "…" : note.content;

  return (
    /*
     * onLongPress — fires after the user holds their finger down for ~500ms.
     * It's a secondary gesture, so it doesn't interfere with a normal tap.
     * We use it here to open the Edit / Delete action menu.
     */
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >

      {/*
        Header row: title on the left, category badge on the right.
        `flexDirection: "row"` lays children side-by-side (default is "column").
        `justifyContent: "space-between"` pushes them to opposite ends.
        `alignItems: "center"` aligns them vertically in the middle.
      */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <CategoryBadge category={note.category} />
      </View>

      {/* Content preview — clamped to 2 lines */}
      <Text style={styles.preview} numberOfLines={2}>
        {preview}
      </Text>

      {/* Date — formatted from ISO string via our util */}
      <Text style={styles.date}>{formatDate(note.createdAt)}</Text>

    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Shadow (Android)
    elevation: 3,
  },

  // ── Header row (title + badge side by side) ────────────────────────────
  headerRow: {
    flexDirection: "row",         // lay children horizontally
    justifyContent: "space-between", // push title left, badge right
    alignItems: "center",         // align them on the same vertical axis
    marginBottom: 6,
    gap: 8,                       // minimum gap so a long title never overlaps the badge
  },
  title: {
    flex: 1,                      // take all remaining width (badge sits after it)
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  // ── Category badge ─────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,             // fully rounded pill shape
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.white,
  },

  // ── Content & date ─────────────────────────────────────────────────────
  preview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
