/**
 * app/index.tsx — Home Screen
 *
 * WHAT CHANGED IN STEP 5:
 *  - Long-pressing a card opens an Alert with Edit / Delete options.
 *  - Delete shows a confirmation Alert then removes the note via filter().
 *  - Edit opens NoteFormModal pre-filled; saving updates the note via map().
 *  - CreateNoteModal replaced by NoteFormModal (handles both create + edit).
 *
 * KEY CONCEPTS:
 *
 *  Alert.alert(title, message, buttons)
 *    Native OS dialog. Each button is { text, style, onPress }.
 *    style: "destructive" → red button on iOS (signals a dangerous action).
 *    style: "cancel"      → bold/left-aligned on iOS, dismisses on Android back.
 *
 *  array.filter(predicate)
 *    Returns a NEW array containing only the items where predicate returns true.
 *    Used to DELETE a note: keep every note whose id is NOT the deleted one.
 *
 *  array.map(transform)
 *    Returns a NEW array where each item is replaced by transform(item).
 *    Used to UPDATE a note: swap the old version for the new one by matching id.
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";

import EmptyState from "../src/components/EmptyState";
import FAB from "../src/components/FAB";
import NoteCard from "../src/components/NoteCard";
import NoteFormModal from "../src/components/NoteFormModal";
import { Colors } from "../src/constants/colors";
import { Note } from "../src/types/note";

// ---------------------------------------------------------------------------
// INITIAL DATA
// ---------------------------------------------------------------------------
const SAMPLE_NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome to NotesApp!",
    content: "This is your first note. Tap a note to read it, or long-press to edit or delete.",
    createdAt: "2024-04-10T09:00:00.000Z",
    category: "Personal",
  },
  {
    id: "2",
    title: "React Native Basics",
    content:
      "In React Native, you cannot use HTML tags like <div> or <p>. " +
      "Instead you use View (like a div) and Text (like a <p> or <span>).",
    createdAt: "2024-04-10T10:15:00.000Z",
    category: "Learning",
  },
  {
    id: "3",
    title: "Expo Router",
    content:
      "Expo Router is a file-based router. Each file in the app/ folder is a screen. " +
      "Navigation works similar to Next.js on the web.",
    createdAt: "2024-04-11T08:00:00.000Z",
    category: "Learning",
  },
  {
    id: "4",
    title: "TypeScript Tips",
    content:
      "Using TypeScript helps catch bugs early. " +
      "Define interfaces for your data shapes (see src/types/note.ts).",
    createdAt: "2024-04-11T09:30:00.000Z",
    category: "Work",
  },
  {
    id: "5",
    title: "App Ideas",
    content: "1. Habit tracker  2. Budget splitter  3. Recipe box  4. Travel journal",
    createdAt: "2024-04-11T11:00:00.000Z",
    category: "Ideas",
  },
];

// ---------------------------------------------------------------------------
// SCREEN
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES);

  /** Controls the create/edit modal visibility */
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * The note currently being edited, or null when creating a new note.
   * `Note | null` — this state can be either a Note object or null.
   *
   * null    → modal is in CREATE mode
   * <Note>  → modal is in EDIT mode, pre-filled with this note
   */
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Create — save brand new note, prepend to list */
  function handleCreateNote(newNote: Note) {
    setNotes((prev) => [newNote, ...prev]);
    setModalVisible(false);
  }

  /** Edit — replace the matching note in the array */
  function handleUpdateNote(updatedNote: Note) {
    /**
     * array.map(fn) — returns a NEW array.
     * For each note: if the id matches, return the updated version;
     * otherwise return the note unchanged.
     *
     * Before: [noteA, noteB, noteC]
     * After:  [noteA, updatedNoteB, noteC]   (only the matching one changes)
     */
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setEditingNote(null);
    setModalVisible(false);
  }

  /** Long-press — show Edit / Delete action sheet */
  function handleLongPress(note: Note) {
    /**
     * Alert.alert(title, message, buttons)
     * ─────────────────────────────────────
     * `buttons` is an array of button configs:
     *   text    — the label
     *   style   — "default" | "cancel" | "destructive"
     *   onPress — called when the button is tapped
     *
     * "cancel" button is automatically placed correctly per platform.
     * "destructive" shows the text in red on iOS — signals danger.
     */
    Alert.alert(note.title, "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => {
          setEditingNote(note);  // put the note into edit state
          setModalVisible(true); // open the modal (NoteFormModal sees initialNote)
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteConfirm(note),
      },
    ]);
  }

  /** Delete — ask for confirmation before removing */
  function handleDeleteConfirm(note: Note) {
    Alert.alert(
      "Delete Note",
      `"${note.title}" will be permanently deleted. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            /**
             * array.filter(predicate) — returns a NEW array.
             * Keeps only the notes whose id does NOT match the deleted one.
             *
             * Before: [note1, note2, note3]  (note2 is being deleted)
             * After:  [note1, note3]
             */
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
          },
        },
      ]
    );
  }

  /** FAB tap — open modal in create mode */
  function handleFABPress() {
    setEditingNote(null);    // clear any previous edit target
    setModalVisible(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() =>
              router.push({
                pathname: "/detail",
                params: {
                  id:        item.id,
                  title:     item.title,
                  content:   item.content,
                  category:  item.category ?? "",
                  createdAt: item.createdAt,
                },
              })
            }
            // Long-press opens the Edit / Delete action Alert
            onLongPress={() => handleLongPress(item)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      <FAB onPress={handleFABPress} />

      {/**
       * NoteFormModal handles both create and edit:
       *   editingNote === null  → create mode (blank form)
       *   editingNote !== null  → edit mode (pre-filled form)
       *
       * We pass the right onSave handler for each mode.
       */}
      <NoteFormModal
        visible={modalVisible}
        initialNote={editingNote ?? undefined}
        onSave={editingNote ? handleUpdateNote : handleCreateNote}
        onClose={() => {
          setModalVisible(false);
          setEditingNote(null);
        }}
      />
    </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});
