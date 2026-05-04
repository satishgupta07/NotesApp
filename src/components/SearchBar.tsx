/**
 * src/components/SearchBar.tsx — Text Search Input
 *
 * WHAT CHANGED IN STEP 9:
 *  - Replaced Unicode text characters (⌕ / ✕) with Ionicons vector icons.
 *    Vector icons render crisp at any size/density and look native on both platforms.
 *
 * CONCEPTS:
 *  - @expo/vector-icons  : icon font library bundled with Expo. Ionicons is one
 *                          of the included sets (from Ionic Framework).
 *  - useRef              : hold a reference to the TextInput node so we can
 *                          call .focus() / .blur() programmatically
 *  - Conditional JSX     : only render the clear button when there is text to clear
 */

import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface SearchBarProps {
  /** Current search text (controlled — parent owns the value) */
  value: string;
  /** Called on every keystroke with the new string */
  onChangeText: (text: string) => void;
  /** Placeholder shown when the field is empty */
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search notes…",
}: SearchBarProps) {

  /**
   * useRef<TextInput>(null)
   * ────────────────────────
   * Stores a reference to the native TextInput node.
   * `inputRef.current` is the actual element — we call `.focus()` on it
   * when the user taps the search icon so the keyboard opens.
   *
   * Unlike useState, changing a ref does NOT trigger a re-render.
   */
  const inputRef = useRef<TextInput>(null);

  function handleClear() {
    onChangeText("");           // clear the text in parent state
    inputRef.current?.focus();  // keep keyboard open after clearing
  }

  return (
    <View style={styles.container}>
      {/**
       * Search icon — tapping it focuses the input.
       *
       * Ionicons.name follows the Ionicons naming convention:
       *   "search-outline"  → the stroke/outline variant
       *   "search"          → the filled variant
       * Full list: https://ionic.io/ionicons
       */}
      <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.iconWrap}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      {/**
       * TextInput — controlled by the parent via value + onChangeText.
       * `ref={inputRef}` attaches the ref so we can call .focus() on it.
       */}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/**
       * Clear button — only rendered when there is text to clear.
       * Conditional rendering: {condition && <Component />}
       * When condition is false, React renders nothing.
       */}
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrap: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
