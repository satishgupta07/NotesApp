/**
 * app/index.tsx — Home Screen
 *
 * WHAT CHANGED IN STEP 3:
 *  - Notes are now held in React state (useState) instead of a plain variable.
 *  - Tapping FAB opens a CreateNoteModal.
 *  - Saving a note prepends it to the list and closes the modal.
 *
 * KEY CONCEPT — useState:
 *  const [value, setValue] = useState(initial)
 *  - `value`    : the current state (read-only — never mutate directly)
 *  - `setValue` : the setter — calling it triggers a re-render with the new value
 *  - `initial`  : the value on the very first render only
 *
 * WHY NOT just do `notes.push(newNote)`?
 *  Mutating the array directly doesn't tell React anything changed,
 *  so the screen would NOT re-render. You must always call the setter.
 */

import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import CreateNoteModal from "../src/components/CreateNoteModal";
import EmptyState from "../src/components/EmptyState";
import FAB from "../src/components/FAB";
import NoteCard from "../src/components/NoteCard";
import { Colors } from "../src/constants/colors";
import { Note } from "../src/types/note";

// ---------------------------------------------------------------------------
// INITIAL DATA
// ---------------------------------------------------------------------------
// Still using sample notes as the starting data, but now they live inside
// state — the user can add to them at runtime.
const SAMPLE_NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome to NotesApp!",
    content: "This is your first note. Tap a note to read it, or press + to create one.",
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

  // ── State ─────────────────────────────────────────────────────────────────
  /**
   * notes — the source of truth for the list.
   *
   * useState<Note[]> tells TypeScript this state holds an array of Notes.
   * SAMPLE_NOTES is the initial value (used only on first render).
   *
   * Step 6: we'll load this from AsyncStorage instead of SAMPLE_NOTES.
   */
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES);

  /**
   * modalVisible — controls whether the Create Note modal is open or closed.
   *
   * Only two possible values (true / false), so no generic needed —
   * TypeScript infers `boolean` from the initial value `false`.
   */
  const [modalVisible, setModalVisible] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  /**
   * Called by CreateNoteModal when the user taps Save.
   *
   * FUNCTIONAL STATE UPDATE — setNotes(prev => ...)
   * ─────────────────────────────────────────────────
   * Instead of `setNotes([newNote, ...notes])` we pass a function to the setter.
   * React calls that function with the LATEST state as `prev`.
   *
   * Why? If two updates happen in the same render cycle,
   * using `notes` directly (closure value) could be stale.
   * Using the functional form always operates on the freshest value.
   *
   * [newNote, ...prev] — spread syntax:
   *   Puts newNote first so newest notes appear at the top of the list.
   *   `...prev` copies all existing notes after it.
   *   This creates a BRAND NEW array (never mutates the old one).
   */
  function handleSaveNote(newNote: Note) {
    setNotes((prev) => [newNote, ...prev]);
    setModalVisible(false);
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
            onPress={() => {
              // Step 4: navigate to detail screen
              console.log("Tapped note:", item.title);
            }}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB — opens the create modal */}
      <FAB onPress={() => setModalVisible(true)} />

      {/**
       * CreateNoteModal sits outside the FlatList so it can overlay the
       * entire screen. It is always in the tree but only visible when
       * modalVisible === true (the Modal component handles show/hide internally).
       */}
      <CreateNoteModal
        visible={modalVisible}
        onSave={handleSaveNote}
        onClose={() => setModalVisible(false)}
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
