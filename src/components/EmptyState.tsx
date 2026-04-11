/**
 * src/components/EmptyState.tsx — Empty List Placeholder
 *
 * Shown inside FlatList's `ListEmptyComponent` prop when there are no notes.
 *
 * REUSABILITY:
 * The message and sub-message are props with sensible defaults, so this
 * component can be reused on a search results screen ("No results for …")
 * or any other screen that can have an empty list.
 *
 * CONCEPTS:
 *  - Optional props with default values  (message = "No notes yet.")
 *  - Centering content with alignItems + justifyContent
 */

import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface EmptyStateProps {
  /**
   * The main heading shown when the list is empty.
   * @default "No notes yet."
   */
  message?: string;

  /**
   * A smaller hint shown below the main heading.
   * @default "Tap the + button to create your first note!"
   */
  subMessage?: string;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
/**
 * EmptyState renders a centred message when a list has no items.
 *
 * Usage:
 *   <FlatList
 *     ...
 *     ListEmptyComponent={<EmptyState />}
 *   />
 *
 *   // Or with custom messages:
 *   <EmptyState message="Nothing found" subMessage="Try a different search term" />
 */
export default function EmptyState({
  message = "No notes yet.",
  subMessage = "Tap the + button to create your first note!",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>{subMessage}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    // Center the text both horizontally and vertically within the list area
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,   // push it down a bit from the top of an empty list
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 8,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    color: Colors.textFaint,
    textAlign: "center",
    lineHeight: 20,
  },
});
