/**
 * src/components/SearchBar.tsx — Text Search Input
 *
 * A styled search field with a clear button.
 * Reusable anywhere a text-search input is needed.
 *
 * CONCEPTS:
 *  - useRef          : hold a reference to the TextInput DOM node so we can
 *                      call .focus() / .blur() programmatically
 *  - Conditional JSX : only render the clear button when there is text to clear
 *  - forwardRef      : not needed here since we own the ref internally
 */

import { useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
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
   * useRef stores a mutable value that persists across renders WITHOUT
   * causing a re-render when it changes (unlike useState).
   *
   * Here we use it to hold a reference to the native TextInput element.
   * `inputRef.current` is the actual TextInput node — we call `.focus()`
   * on it when the user taps the search icon (so the keyboard opens).
   *
   * Common useRef uses:
   *   - DOM/native node references (focus, scroll, measure)
   *   - Storing a value that shouldn't trigger re-renders (timers, previous values)
   */
  const inputRef = useRef<TextInput>(null);

  function handleClear() {
    onChangeText("");           // clear the text in parent state
    inputRef.current?.focus();  // keep keyboard open after clearing
  }

  return (
    <View style={styles.container}>
      {/* Search icon — tapping it focuses the input */}
      <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.iconWrap}>
        <Text style={styles.icon}>⌕</Text>
      </TouchableOpacity>

      {/**
       * TextInput — controlled by the parent via value + onChangeText.
       * `ref={inputRef}` attaches the ref so we can call .focus() on it.
       *
       * clearButtonMode="never" — we draw our own clear button so it looks
       * the same on Android and iOS (the native one only shows on iOS).
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
          <Text style={styles.clearIcon}>✕</Text>
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
    // subtle shadow so it lifts slightly off the background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrap: {
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,          // take all remaining width between icon and clear button
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0, // remove default vertical padding on Android
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,       // extra tap area
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
