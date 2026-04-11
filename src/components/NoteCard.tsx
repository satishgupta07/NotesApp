/**
 * src/components/NoteCard.tsx — Note List Item
 *
 * Renders a single note as a tappable card inside the FlatList on the Home Screen.
 *
 * REUSABILITY:
 * Because this component only receives data via props and knows nothing about
 * where the notes come from, it can be dropped into any screen — search results,
 * a pinned-notes section, etc. — without changes.
 *
 * CONCEPTS:
 *  - Props interface   : TypeScript type that describes what a component accepts
 *  - numberOfLines     : truncates Text to N lines and adds "…"
 *  - TouchableOpacity  : pressable wrapper; dims on press for visual feedback
 */

import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";
import { Note } from "../types/note";
import { formatDate } from "../utils/date";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
/**
 * Props for NoteCard.
 *
 * WHY define a separate Props interface (not inline)?
 * - It shows up in auto-complete when you use <NoteCard ... />
 * - JSDoc comments on each prop appear as tooltips in VS Code
 * - Easier to read than a long inline type
 */
interface NoteCardProps {
  /** The note data to display */
  note: Note;
  /** Called when the user taps the card */
  onPress: () => void;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function NoteCard({ note, onPress }: NoteCardProps) {
  /**
   * Show only a short preview of the content so every card has a consistent
   * height in the list. The full content is shown on the Detail Screen (Step 4).
   */
  const preview =
    note.content.length > 80 ? note.content.slice(0, 80) + "…" : note.content;

  return (
    /*
     * TouchableOpacity
     * ─ wraps any children and makes them tappable
     * ─ `activeOpacity={0.7}` means the card becomes 70% opaque while pressed
     *   (the default is 0.2 which is very dim; 0.7 is a subtle fade)
     */
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Title — clamped to 1 line so long titles don't break layout */}
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>

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
    // ── Shadow (iOS) ───────────────────────────────────────────────────────
    // On iOS, shadow is controlled by four separate properties.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // direction of shadow
    shadowOpacity: 0.08,                   // how dark (0–1)
    shadowRadius: 4,                        // blur radius
    // ── Elevation (Android) ────────────────────────────────────────────────
    // On Android, a single `elevation` number controls the drop shadow.
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
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
