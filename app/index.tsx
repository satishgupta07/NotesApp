/**
 * app/index.tsx — Home Screen
 *
 * This is the first screen the user sees: a scrollable list of notes.
 *
 * NOW THAT WE HAVE REUSABLE COMPONENTS:
 * This file only needs to worry about:
 *   1. What data to show  (the notes array)
 *   2. What to do when the user interacts  (onPress, FAB press)
 *   3. The overall layout (FlatList + FAB on top)
 *
 * The HOW of rendering a card, an empty state, or a button is handled
 * entirely by the components in src/components/.
 *
 * This separation is called the "smart vs dumb component" pattern:
 *   - Smart (this file) : knows about data & navigation
 *   - Dumb (components) : only knows about props & rendering
 */

import { FlatList, StyleSheet, View } from "react-native";

import EmptyState from "../src/components/EmptyState";
import FAB from "../src/components/FAB";
import NoteCard from "../src/components/NoteCard";
import { Colors } from "../src/constants/colors";
import { Note } from "../src/types/note";

// ---------------------------------------------------------------------------
// STATIC DATA (replaced with useState in Step 3)
// ---------------------------------------------------------------------------
const SAMPLE_NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome to NotesApp!",
    content: "This is your first note. Tap a note to read it, or press + to create one.",
    createdAt: "2024-04-10T09:00:00.000Z",
  },
  {
    id: "2",
    title: "React Native Basics",
    content:
      "In React Native, you cannot use HTML tags like <div> or <p>. " +
      "Instead you use View (like a div) and Text (like a <p> or <span>).",
    createdAt: "2024-04-10T10:15:00.000Z",
  },
  {
    id: "3",
    title: "Expo Router",
    content:
      "Expo Router is a file-based router. Each file in the app/ folder is a screen. " +
      "Navigation works similar to Next.js on the web.",
    createdAt: "2024-04-11T08:00:00.000Z",
  },
  {
    id: "4",
    title: "TypeScript Tips",
    content:
      "Using TypeScript helps catch bugs early. " +
      "Define interfaces for your data shapes (see src/types/note.ts).",
    createdAt: "2024-04-11T09:30:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// SCREEN
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  // Step 3: replace this line with → const [notes, setNotes] = useState(SAMPLE_NOTES);
  const notes = SAMPLE_NOTES;

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => {
              // Step 4: router.push({ pathname: "/detail", params: { id: item.id } })
              console.log("Tapped note:", item.title);
            }}
          />
        )}
        // EmptyState is shown automatically by FlatList when `data` is empty
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        onPress={() => {
          // Step 3: router.push("/create")
          console.log("Create new note");
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
    paddingBottom: 100, // leave room so FAB doesn't cover the last card
  },
});
