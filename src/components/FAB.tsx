/**
 * src/components/FAB.tsx — Floating Action Button
 *
 * The circular button that floats over the list, used to trigger a primary action
 * (e.g. "Create new note"). The term FAB comes from Material Design.
 *
 * REUSABILITY:
 * The label and color are configurable via props so this same button can be
 * used on any screen — not just the home screen.
 *
 * CONCEPTS:
 *  - `position: "absolute"` — removes the element from normal layout flow
 *    so it floats on top of other content (like the list)
 *  - `borderRadius` set to half of width/height makes a perfect circle
 *  - Optional props with defaults
 */

import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface FABProps {
  /** Called when the button is pressed */
  onPress: () => void;

  /**
   * The label/icon displayed inside the button.
   * @default "＋"
   */
  label?: string;

  /**
   * Background color of the button.
   * @default Colors.primary
   */
  color?: string;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
/**
 * FAB (Floating Action Button) — a circular button fixed to the bottom-right
 * corner of the screen, floating above all other content.
 *
 * Usage:
 *   <FAB onPress={() => router.push("/create")} />
 *
 *   // Custom icon or color:
 *   <FAB onPress={handleSave} label="✓" color={Colors.primary} />
 */
export default function FAB({
  onPress,
  label = "＋",
  color = Colors.primary,
}: FABProps) {
  return (
    /*
     * position: "absolute" is key here — it lifts the button out of the
     * normal document flow so it overlaps the FlatList beneath it.
     * `bottom` and `right` then position it relative to its nearest
     * positioned ancestor (the screen container).
     */
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  button: {
    // ── Position ────────────────────────────────────────────────────────────
    position: "absolute",  // float on top of everything
    bottom: 32,
    right: 24,

    // ── Size & Shape ────────────────────────────────────────────────────────
    width: 56,
    height: 56,
    borderRadius: 28,      // exactly half of 56 → perfect circle

    // ── Content alignment ───────────────────────────────────────────────────
    alignItems: "center",
    justifyContent: "center",

    // ── Shadow (iOS) ────────────────────────────────────────────────────────
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,

    // ── Elevation (Android) ─────────────────────────────────────────────────
    elevation: 8,
  },
  label: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 32,
  },
});
