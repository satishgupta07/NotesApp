/**
 * src/components/NoteFormModal.tsx — Create & Edit Note Form
 *
 * A single modal that handles BOTH creating a new note and editing an existing one.
 *
 * HOW IT DECIDES WHICH MODE IT'S IN:
 *   initialNote === undefined  →  Create mode ("New Note")
 *   initialNote === <a Note>   →  Edit mode   ("Edit Note")
 *
 * This is a common React pattern: instead of two near-identical components,
 * one component accepts an optional prop that switches its behaviour.
 *
 * NEW IN STEP 5:
 *  - `initialNote?` prop — pre-fills the form when editing
 *  - `useEffect`         — syncs form fields whenever the modal opens
 *                          with a (different) note
 *
 * CONCEPTS:
 *  1. useEffect     — run side-effects after render (here: sync props → state)
 *  2. Dependency array — controls WHEN the effect re-runs
 *  3. Spread operator  — { ...initialNote, title, content } preserves id/createdAt
 */

import { useEffect, useState } from "react";
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
interface NoteFormModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /**
   * If provided the modal opens in EDIT mode, pre-filled with this note's data.
   * If undefined the modal opens in CREATE mode with blank fields.
   */
  initialNote?: Note;
  /** Called with the finished Note when the user taps Save */
  onSave: (note: Note) => void;
  /** Called when the user taps Cancel or presses the device Back button */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function NoteFormModal({
  visible,
  initialNote,
  onSave,
  onClose,
}: NoteFormModalProps) {

  const isEditMode = initialNote !== undefined;

  // ── Form state ────────────────────────────────────────────────────────────
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState<NoteCategory>("Personal");
  const [error,    setError]    = useState("");

  // ── Sync form fields when the modal opens ─────────────────────────────────
  /**
   * useEffect(() => { ... }, [dependencies])
   * ─────────────────────────────────────────
   * Runs the function AFTER the component renders, but only when one of the
   * values in the dependency array has changed since the last render.
   *
   * Here we want to sync form fields whenever:
   *   - `visible` flips to true   (the modal just opened)
   *   - `initialNote` changes     (user long-pressed a different note)
   *
   * WITHOUT useEffect:
   *   useState only uses its initial value on the very first render.
   *   If `initialNote` changes after mount, the form would still show
   *   the old (stale) values.
   *
   * WITH useEffect:
   *   Every time `visible` or `initialNote` changes, we re-sync the state.
   */
  useEffect(() => {
    if (visible) {
      // Opening in edit mode — pre-fill with the note's current values
      if (initialNote) {
        setTitle(initialNote.title);
        setContent(initialNote.content);
        setCategory(initialNote.category ?? "Personal");
      } else {
        // Opening in create mode — always start with a blank form
        resetForm();
      }
    }
  }, [visible, initialNote]); // ← dependency array: effect runs when these change

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSave() {
    if (!title.trim()) {
      setError("Please add a title before saving.");
      return;
    }

    /**
     * Spread operator to build the saved Note:
     *
     * EDIT mode:   { ...initialNote, title, content, category }
     *   Copies all fields from the original note (preserving `id` and `createdAt`)
     *   then overwrites title, content, category with the new form values.
     *
     * CREATE mode: fresh object with a new id and createdAt timestamp.
     */
    const savedNote: Note = isEditMode
      ? { ...initialNote, title: title.trim(), content: content.trim(), category }
      : {
          id:        Date.now().toString(),
          title:     title.trim(),
          content:   content.trim(),
          category,
          createdAt: new Date().toISOString(),
        };

    onSave(savedNote);
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("Personal");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Title changes based on mode */}
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Note" : "New Note"}
          </Text>

          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* ── Form ────────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title input */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Note title…"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={(text) => { setTitle(text); if (error) setError(""); }}
            returnKeyType="next"
            maxLength={100}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Content input */}
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here…"
            placeholderTextColor={Colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Category picker */}
          <Text style={styles.label}>Category</Text>
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
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
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
  flex: { flex: 1 },

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
  headerBtn:    { minWidth: 60 },
  headerTitle:  { fontSize: 17, fontWeight: "600", color: Colors.textPrimary },
  cancelText:   { fontSize: 16, color: Colors.textSecondary },
  saveText:     { fontSize: 16, fontWeight: "600", color: Colors.primary, textAlign: "right" },

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
    minHeight: 140,
    lineHeight: 22,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 6,
  },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText:         { fontSize: 14, fontWeight: "500", color: Colors.textSecondary },
  pillTextSelected: { color: Colors.white, fontWeight: "600" },
});
