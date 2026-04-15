/**
 * app/index.tsx — Home Screen
 *
 * WHAT CHANGED IN STEP 6:
 *  - Notes are now loaded from / saved to AsyncStorage via the useNotes hook.
 *  - A loading spinner is shown while data is being read from storage.
 *  - SAMPLE_NOTES removed from here — the hook handles first-launch defaults.
 *
 * The screen itself barely changed — all the storage logic lives in
 * src/hooks/useNotes.ts. This is exactly the benefit of custom hooks:
 * the screen stays focused on UI while the hook owns the data concern.
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";

import EmptyState from "../src/components/EmptyState";
import FAB from "../src/components/FAB";
import NoteCard from "../src/components/NoteCard";
import NoteFormModal from "../src/components/NoteFormModal";
import { Colors } from "../src/constants/colors";
import { useNotes } from "../src/hooks/useNotes";
import { Note } from "../src/types/note";

export default function HomeScreen() {
  const router = useRouter();

  // ── Data (from hook) ───────────────────────────────────────────────────────
  /**
   * useNotes() replaces `useState<Note[]>(SAMPLE_NOTES)`.
   *
   * It returns the same `notes` and `setNotes` we used before, PLUS
   * `isLoading` which is true while AsyncStorage is being read.
   *
   * Because setNotes is still just a useState setter, all our existing
   * handlers (create, update, delete) work unchanged — they just call
   * setNotes as before, and the hook's useEffect auto-saves the new value.
   */
  const { notes, setNotes, isLoading } = useNotes();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote,  setEditingNote]  = useState<Note | null>(null);

  // ── Handlers (unchanged from Step 5) ──────────────────────────────────────
  function handleCreateNote(newNote: Note) {
    setNotes((prev) => [newNote, ...prev]);
    setModalVisible(false);
  }

  function handleUpdateNote(updatedNote: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setEditingNote(null);
    setModalVisible(false);
  }

  function handleLongPress(note: Note) {
    Alert.alert(note.title, "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => { setEditingNote(note); setModalVisible(true); },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteConfirm(note),
      },
    ]);
  }

  function handleDeleteConfirm(note: Note) {
    Alert.alert(
      "Delete Note",
      `"${note.title}" will be permanently deleted. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setNotes((prev) => prev.filter((n) => n.id !== note.id)),
        },
      ]
    );
  }

  function handleFABPress() {
    setEditingNote(null);
    setModalVisible(true);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  /**
   * While AsyncStorage is being read, show a centred spinner.
   *
   * ActivityIndicator — React Native's built-in loading spinner.
   *   size="large"          → bigger spinner
   *   color={Colors.primary} → matches the app's brand colour
   *
   * We return early here so the rest of the render doesn't run yet.
   * This is called an "early return" pattern — common for loading/error states.
   */
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading notes…</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
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
            onLongPress={() => handleLongPress(item)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      <FAB onPress={handleFABPress} />

      <NoteFormModal
        visible={modalVisible}
        initialNote={editingNote ?? undefined}
        onSave={editingNote ? handleUpdateNote : handleCreateNote}
        onClose={() => { setModalVisible(false); setEditingNote(null); }}
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

  // ── Loading screen ─────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
