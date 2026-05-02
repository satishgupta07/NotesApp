/**
 * app/_layout.tsx — Root Layout
 *
 * WHAT CHANGED IN STEP 7:
 *  - Wrapped the Stack with <NotesProvider> so every screen in the app
 *    can access the shared notes state via useNotesContext().
 *
 * WHY wrap here (not inside a screen)?
 *  _layout.tsx is the top-most component that wraps ALL routes.
 *  Placing the Provider here means the context is available the moment
 *  any screen mounts — there's no risk of a screen rendering before
 *  the Provider is in the tree.
 *
 *  The hierarchy is:
 *    <NotesProvider>          ← owns notes state + AsyncStorage
 *      <Stack>                ← handles navigation
 *        <HomeScreen />       ← can call useNotesContext() ✅
 *        <DetailScreen />     ← can call useNotesContext() ✅
 *      </Stack>
 *    </NotesProvider>
 */

import { Stack } from "expo-router";
import { Colors } from "../src/constants/colors";
import { NotesProvider } from "../src/context/NotesContext";

export default function RootLayout() {
  return (
    /**
     * NotesProvider broadcasts the notes array (and operations) to every
     * descendant. Any component inside can call useNotesContext() to read
     * or update notes — no prop passing required.
     */
    <NotesProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        }}
      >
        <Stack.Screen name="index"  options={{ title: "My Notes" }} />
        <Stack.Screen name="detail" options={{ headerBackTitle: "Notes" }} />
      </Stack>
    </NotesProvider>
  );
}
