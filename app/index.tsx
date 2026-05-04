/**
 * app/index.tsx — Home Screen
 *
 * WHAT CHANGED IN STEP 9:
 *  - useSafeAreaInsets: FAB bottom position and list bottom padding now account
 *    for the device's home indicator / navigation bar height so content is
 *    never hidden behind system UI.
 *  - expo-haptics: added tactile feedback on long-press (medium impact) and
 *    on delete confirmation (heavy impact).
 *
 * KEY CONCEPT — Derived State
 * ────────────────────────────
 * filteredNotes is NOT stored in useState. It is computed FROM other state:
 *
 *   notes + searchQuery + selectedCategory  →  filteredNotes
 *
 * Storing a derived value in its own useState would create a "second source of
 * truth" — you'd have to keep them in sync manually, which leads to bugs.
 * Instead, compute it on the fly (optionally wrapped in useMemo for performance).
 *
 * KEY CONCEPT — useMemo
 * ──────────────────────
 * useMemo(fn, deps) caches the return value of fn.
 * It only reruns fn when one of the deps changes.
 * On renders where nothing changed (e.g. modal opens/closes), it returns
 * the cached value — no wasted filtering work.
 */

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "../src/components/EmptyState";
import FAB from "../src/components/FAB";
import NoteCard from "../src/components/NoteCard";
import NoteFormModal from "../src/components/NoteFormModal";
import SearchBar from "../src/components/SearchBar";
import { ALL_CATEGORIES, CATEGORY_COLORS, NoteCategory } from "../src/constants/categories";
import { Colors } from "../src/constants/colors";
import { useNotesContext } from "../src/context/NotesContext";
import { Note } from "../src/types/note";

export default function HomeScreen() {
  const router = useRouter();
  const { notes, isLoading, addNote, updateNote, deleteNote } = useNotesContext();

  /**
   * useSafeAreaInsets()
   * ────────────────────
   * Returns the safe area inset distances for the current device:
   *   { top, bottom, left, right }
   *
   * On iPhone with a home indicator: bottom ≈ 34 px
   * On Android with a navigation bar: bottom ≈ 24–48 px
   * On devices with no system UI intrusion: bottom = 0
   *
   * We use `insets.bottom` to push the FAB and list content above the
   * home indicator so they're never obscured by system UI.
   */
  const insets = useSafeAreaInsets();

  // ── Search & filter state ─────────────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState("");
  /**
   * selectedCategory: which category pill is active.
   * null = "All" (no category filter applied).
   */
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote,  setEditingNote]  = useState<Note | null>(null);

  // ── Derived state — filteredNotes ─────────────────────────────────────────
  /**
   * useMemo(computeFn, dependencies)
   * ─────────────────────────────────
   * computeFn runs only when one of the dependencies changes.
   * Between those renders it returns the last cached result.
   *
   * Dependencies here: notes, searchQuery, selectedCategory.
   * If the modal opens/closes (modalVisible changes), this does NOT rerun.
   */
  const filteredNotes = useMemo(() => {
    let result = notes;

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter((note) => note.category === selectedCategory);
    }

    return result;
  }, [notes, searchQuery, selectedCategory]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCreateNote(newNote: Note) {
    addNote(newNote);
    setModalVisible(false);
  }

  function handleUpdateNote(updatedNote: Note) {
    updateNote(updatedNote);
    setEditingNote(null);
    setModalVisible(false);
  }

  function handleLongPress(note: Note) {
    /**
     * Haptics.impactAsync(style)
     * ───────────────────────────
     * Triggers a haptic impact feedback vibration.
     * ImpactFeedbackStyle.Medium → a moderate tap vibration.
     *
     * This fires when the user long-presses a note, giving them
     * confirmation that the gesture was recognized before the Alert appears.
     */
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
          onPress: () => {
            /**
             * ImpactFeedbackStyle.Heavy → a strong, definitive thud.
             * Fires at the moment of deletion to reinforce that a
             * permanent destructive action has completed.
             */
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            deleteNote(note.id);
          },
        },
      ]
    );
  }

  function handleFABPress() {
    setEditingNote(null);
    setModalVisible(true);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading notes…</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isSearchActive = searchQuery.trim().length > 0 || selectedCategory !== null;

  /**
   * FAB bottom offset: always stays 32px above the safe area boundary.
   * Without this, on iPhone the FAB would sit behind the home indicator.
   */
  const fabBottom = 32 + insets.bottom;

  return (
    <View style={styles.container}>

      {/* ── Search & filter bar (fixed, does not scroll with the list) ── */}
      <View style={styles.filterArea}>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes…"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
          style={styles.pillScroll}
        >
          {/* "All" pill — clears the category filter */}
          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === null ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === null && styles.pillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {ALL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pill,
                  isActive
                    ? [styles.pillActive, { backgroundColor: CATEGORY_COLORS[cat] }]
                    : styles.pillInactive,
                ]}
                onPress={() => setSelectedCategory(isActive ? null : cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Notes list ──────────────────────────────────────────────────── */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() =>
              router.push({ pathname: "/detail", params: { id: item.id } })
            }
            onLongPress={() => handleLongPress(item)}
          />
        )}
        ListEmptyComponent={
          isSearchActive ? (
            <EmptyState
              message="No results found"
              subMessage="Try different keywords or clear the filter."
            />
          ) : (
            <EmptyState />
          )
        }
        /**
         * contentContainerStyle bottom padding accounts for the FAB height
         * (56px) + its bottom offset + the safe area inset, so the last
         * note is never hidden behind the FAB or the system home indicator.
         */
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 56 + fabBottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      />

      {/**
       * Pass the safe-area-aware bottom as a style override.
       * FAB renders its own `position: absolute` — we override `bottom`
       * by passing it as an inline style on the wrapper inside FAB.
       *
       * We pass fabBottom as a prop so FAB doesn't need to know about
       * safe areas — the parent handles layout, FAB handles appearance.
       */}
      <FAB onPress={handleFABPress} bottomOffset={fabBottom} />

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

  // ── Loading ───────────────────────────────────────────────────────────────
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

  // ── Filter area (search + pills) ──────────────────────────────────────────
  filterArea: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pillScroll: {
    marginTop: 10,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },

  // ── Category pills ────────────────────────────────────────────────────────
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    padding: 16,
  },
});
