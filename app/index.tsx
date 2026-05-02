/**
 * app/index.tsx — Home Screen
 *
 * WHAT CHANGED IN STEP 8:
 *  - Search bar at the top lets the user filter notes by title or content.
 *  - Category pills let the user narrow results to one category.
 *  - filteredNotes is DERIVED STATE — computed from notes + search inputs.
 *  - useMemo caches the result so the filter only reruns when inputs change.
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

    // ── Step 1: filter by search text ───────────────────────────────────────
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      /**
       * String.prototype.includes(substr) — returns true if substr appears
       * anywhere in the string. Case-insensitive because we lowercase both.
       *
       * We check BOTH title and content so the search is comprehensive.
       */
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // ── Step 2: filter by selected category ─────────────────────────────────
    if (selectedCategory) {
      result = result.filter((note) => note.category === selectedCategory);
    }

    return result;
  }, [notes, searchQuery, selectedCategory]); // ← recompute only when these change

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
          onPress: () => deleteNote(note.id),
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

  return (
    <View style={styles.container}>

      {/* ── Search & filter bar (fixed, does not scroll with the list) ── */}
      <View style={styles.filterArea}>

        {/* Search input */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes…"
        />

        {/**
         * Category filter pills — horizontal ScrollView so they scroll
         * if there are more pills than fit on screen.
         *
         * showsHorizontalScrollIndicator={false} hides the scroll bar
         * (common UX for pill rows — the scroll is implied by the layout).
         */}
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
              selectedCategory === null
                ? styles.pillActive           // highlight when no category selected
                : styles.pillInactive,
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

          {/**
           * One pill per category — mapped from ALL_CATEGORIES.
           * Tapping selects that category; tapping again deselects (toggle).
           */}
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
                onPress={() =>
                  // Toggle: if already selected → clear; else → select
                  setSelectedCategory(isActive ? null : cat)
                }
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
        /**
         * Show a different empty message depending on whether a search is
         * active or the notes list itself is simply empty.
         */
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
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled" // tapping a card closes the keyboard
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
    paddingBottom: 100,
  },
});
