/**
 * app/_layout.tsx — Root Layout
 *
 * WHAT CHANGED IN STEP 9:
 *  - Wrapped the tree with <SafeAreaProvider> so any screen can call
 *    useSafeAreaInsets() to read the device's safe area boundaries.
 *
 * Provider hierarchy (outermost → innermost):
 *   <SafeAreaProvider>   ← measures and broadcasts safe area insets
 *     <NotesProvider>    ← owns notes state + AsyncStorage
 *       <Stack>          ← handles navigation
 *         <HomeScreen /> ← can call useSafeAreaInsets() ✅ & useNotesContext() ✅
 *         <DetailScreen />
 *       </Stack>
 *     </NotesProvider>
 *   </SafeAreaProvider>
 *
 * WHY SafeAreaProvider at the root?
 *  It measures the device's notch/home-indicator insets ONCE and broadcasts
 *  them down. Putting it here means every screen in the app has access —
 *  no need to re-measure per screen.
 */

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../src/constants/colors";
import { NotesProvider } from "../src/context/NotesContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
