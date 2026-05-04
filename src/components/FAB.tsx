/**
 * src/components/FAB.tsx — Floating Action Button
 *
 * WHAT CHANGED IN STEP 9:
 *  - Replaced the Unicode ＋ text with an Ionicons vector icon.
 *  - Added an Animated spring scale effect on press so the button
 *    "bounces" when tapped — tactile feedback through motion.
 *
 * CONCEPTS:
 *  - Animated API   : React Native's built-in animation system. Values
 *                     change over time and drive style properties directly,
 *                     bypassing the JS→Native bridge for smooth 60fps motion.
 *  - Animated.Value : a special numeric value that Animated tracks.
 *  - Animated.spring: animates a value toward a target using spring physics
 *                     (tension + friction) — produces a natural bounce.
 *  - useRef         : we store the Animated.Value in a ref so it persists
 *                     across renders without triggering extra re-renders.
 *  - Animated.View  : a View that can accept Animated-driven style props.
 *  - transform      : CSS-like transform array; `scale` grows/shrinks the element.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface FABProps {
  /** Called when the button is pressed */
  onPress: () => void;
  /**
   * Background color of the button.
   * @default Colors.primary
   */
  color?: string;
  /**
   * Distance from the bottom of the screen in pixels.
   * Pass `insets.bottom + 32` from useSafeAreaInsets so the button
   * clears the home indicator on notched devices.
   * @default 32
   */
  bottomOffset?: number;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function FAB({ onPress, color = Colors.primary, bottomOffset = 32 }: FABProps) {

  /**
   * scaleAnim — an Animated.Value starting at 1 (normal size).
   *
   * useRef keeps the same Animated.Value instance across renders.
   * If we used useState or created a plain `new Animated.Value(1)` at the
   * module level, either we'd cause extra renders or share state between
   * multiple FAB instances.
   */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * handlePressIn — shrinks the button to 0.88× when the finger touches down.
   *
   * Animated.spring(value, config)
   * ──────────────────────────────
   * Animates `value` toward `toValue` using spring physics.
   * `useNativeDriver: true` moves the animation entirely onto the native
   * thread — smoother and doesn't block JS work.
   *
   * `toValue: 0.88`  → shrink to 88% of original size on press-in
   * `toValue: 1`     → bounce back to full size on press-out
   */
  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    /**
     * Animated.View — a View that understands Animated-driven styles.
     * We wrap TouchableOpacity with it so the entire button (including
     * its shadow) scales together.
     *
     * `transform: [{ scale: scaleAnim }]`
     * ─────────────────────────────────────
     * transform accepts an array of transform objects.
     * { scale: 1 } = normal. { scale: 0.88 } = 12% smaller.
     * As scaleAnim moves from 1 → 0.88 → 1, the button shrinks and
     * springs back with the configured spring physics.
     */
    <Animated.View style={[styles.wrapper, { bottom: bottomOffset, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}   // disable TouchableOpacity's own opacity fade
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    // ── Position ──────────────────────────────────────────────────────────────
    position: "absolute",
    // bottom is set dynamically via the bottomOffset prop
    right: 24,
  },
  button: {
    // ── Size & Shape ──────────────────────────────────────────────────────────
    width: 56,
    height: 56,
    borderRadius: 28,       // exactly half of 56 → perfect circle

    // ── Content alignment ─────────────────────────────────────────────────────
    alignItems: "center",
    justifyContent: "center",

    // ── Shadow (iOS) ──────────────────────────────────────────────────────────
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,

    // ── Elevation (Android) ───────────────────────────────────────────────────
    elevation: 8,
  },
});
