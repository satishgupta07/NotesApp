/**
 * src/components/CreateNoteModal.tsx — Create Note Form
 *
 * A modal sheet that slides up when the user taps the FAB.
 * Contains a form to fill in a note's title, content, and category.
 *
 * CONCEPTS COVERED:
 *  1. useState          — local state for each form field
 *  2. Controlled input  — TextInput whose value is driven by state
 *  3. Modal             — a native overlay that sits above the current screen
 *  4. KeyboardAvoidingView — adjusts layout so the keyboard never covers inputs
 *  5. Platform.OS       — write different behaviour for iOS vs Android
 *  6. ScrollView        — lets the form scroll on small screens
 *  7. Form validation   — check inputs before saving
 *  8. State reset       — clear the form after saving
 */

import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ALL_CATEGORIES, CATEGORY_COLORS, NoteCategory } from "../constants/categories";
import { Colors } from "../constants/colors";
import { Note } from "../types/note";

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------
interface CreateNoteModalProps {
  /** Whether the modal is currently visible */
  visible: boolean;
  /** Called when the user taps Save — receives the fully formed Note object */
  onSave: (note: Note) => void;
  /** Called when the user taps Cancel or presses the device Back button */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function CreateNoteModal({ visible, onSave, onClose }: CreateNoteModalProps) {

  // ── Form state ────────────────────────────────────────────────────────────
  /**
   * useState<T>(initialValue)
   * ─────────────────────────
   * Returns a tuple: [currentValue, setterFunction]
   * React re-renders the component every time the setter is called.
   *
   * The <T> generic tells TypeScript what type the state holds.
   * For strings it's inferred automatically; for NoteCategory we specify it
   * so TypeScript knows setCategory only accepts valid category strings.
   */
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [category, setCategory] = useState<NoteCategory>("Personal");
  const [error, setError]       = useState("");   // validation error message

  // ── Handlers ──────────────────────────────────────────────────────────────
  /**
   * Called when the user taps Save.
   * Validates the form, builds a Note object, calls onSave, then resets.
   */
  function handleSave() {
    // Basic validation — title must not be blank
    if (!title.trim()) {
      setError("Please add a title before saving.");
      return;
    }

    /**
     * Build the new Note.
     *
     * ID strategy: Date.now() returns milliseconds since epoch (e.g. 1712930400000).
     * Converting to string gives us a unique-enough ID for local data.
     * In a real app backed by a server you'd use a UUID library instead.
     */
    const newNote: Note = {
      id:        Date.now().toString(),
      title:     title.trim(),
      content:   content.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    onSave(newNote);
    resetForm();
  }

  /** Reset all form fields back to their initial values */
  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("Personal");
    setError("");
  }

  /** Cancel — close without saving and clear any half-filled form */
  function handleClose() {
    resetForm();
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /**
     * Modal
     * ─────
     * Renders its children in a native overlay that sits above the current screen.
     *
     * Key props:
     *   visible          — controls whether the modal is shown
     *   animationType    — "slide" animates up from the bottom (sheet-like feel)
     *   presentationStyle— "pageSheet" on iOS gives the card-with-rounded-corners look
     *   onRequestClose   — called when Android's hardware Back button is pressed
     *                      (required on Android to dismiss the modal gracefully)
     */
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {/**
       * KeyboardAvoidingView
       * ────────────────────
       * When the software keyboard appears it normally slides up and can
       * cover the TextInput the user is trying to type in.
       * KeyboardAvoidingView listens for the keyboard and adjusts its own
       * height/padding so its children stay visible.
       *
       * behavior prop:
       *   "padding"  — adds paddingBottom equal to keyboard height (works on iOS)
       *   "height"   — shrinks the view's height (works on Android)
       *
       * Platform.OS — a string that is "ios" | "android" | "web"
       * Use it whenever iOS and Android need different behaviour.
       */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Note</Text>

          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/**
         * ScrollView — makes the form scrollable on smaller screens so the
         * category picker is always reachable even with the keyboard open.
         * `keyboardShouldPersistTaps="handled"` ensures tapping a category
         * pill dismisses the keyboard only when the tap is handled by a child.
         */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Title input ─────────────────────────────────────────── */}
          {/**
           * Controlled TextInput
           * ────────────────────
           * A "controlled" input means React owns the value.
           *
           *   value={title}          ← display whatever is in state
           *   onChangeText={setTitle} ← update state on every keystroke
           *
           * This creates a loop:
           *   user types → onChangeText fires → setTitle(newValue)
           *   → React re-renders → TextInput shows new value
           *
           * The alternative ("uncontrolled") lets the native input manage its
           * own value — fine for simple cases but harder to validate or reset.
           */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Note title…"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError(""); // clear error as soon as user starts typing
            }}
            returnKeyType="next"         // shows "Next" on the keyboard instead of "Return"
            maxLength={100}
          />

          {/* Inline validation error — only shown when error is non-empty */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* ── Content input ───────────────────────────────────────── */}
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here…"
            placeholderTextColor={Colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline               // allows multiple lines
            textAlignVertical="top" // Android: keep cursor at the top (not middle)
            returnKeyType="default"
          />

          {/* ── Category picker ─────────────────────────────────────── */}
          <Text style={styles.label}>Category</Text>
          {/**
           * We map over ALL_CATEGORIES to render one pill per category.
           * The selected pill gets its category colour as background;
           * unselected pills show just a border.
           *
           * Dynamic style array:
           *   style={[styles.pill, isSelected && { backgroundColor, borderColor }]}
           *
           * The second element is either a style object (when selected)
           * or `false` (when not selected). React Native ignores falsy values
           * in a style array, so this is safe.
           */}
          <View style={styles.pillRow}>
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const catColor   = CATEGORY_COLORS[cat];

              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pill,
                    isSelected
                      ? { backgroundColor: catColor, borderColor: catColor }
                      : { borderColor: Colors.border },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  // ── Header bar ────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerBtn: {
    minWidth: 60,   // equal tap target on both sides keeps the title centred
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "right",
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  formContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  titleInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  contentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 140,   // tall enough to feel like a notepad
    lineHeight: 22,
  },

  // ── Validation error ──────────────────────────────────────────────────────
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 6,
  },

  // ── Category pills ────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",   // wrap to next line if they don't all fit on one row
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  pillTextSelected: {
    color: Colors.white,
    fontWeight: "600",
  },
});
