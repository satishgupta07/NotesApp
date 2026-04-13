/**
 * app/_layout.tsx — Root Layout
 *
 * Configures the Stack navigator that wraps every screen in the app.
 *
 * WHAT CHANGED IN STEP 4:
 *  - Moved shared header styles into `screenOptions` so every screen
 *    automatically inherits the blue header without repeating the style.
 *  - Registered the new "detail" screen with a back-button label.
 *
 * KEY CONCEPT — screenOptions vs per-screen options:
 *
 *   <Stack screenOptions={{ ... }}>          ← applies to ALL screens
 *     <Stack.Screen name="index" options={{ title: "My Notes" }} />
 *     <Stack.Screen name="detail" options={{ headerBackTitle: "Notes" }} />
 *
 *  Per-screen `options` MERGE with (and override) `screenOptions`.
 *  So `index` keeps the blue background from screenOptions but adds its own title.
 *
 * NOTE — dynamic header title:
 *  The detail screen sets its own title at runtime using
 *  <Stack.Screen options={{ title: noteTitle }} /> inside the component.
 *  That runtime value overrides whatever we set here.
 */

import { Stack } from "expo-router";
import { Colors } from "../src/constants/colors";

export default function RootLayout() {
  return (
    <Stack
      /**
       * screenOptions — shared defaults for every screen in this Stack.
       * Any screen can override individual properties in its own `options`.
       */
      screenOptions={{
        // Header background colour
        headerStyle: { backgroundColor: Colors.primary },
        // Colour of the title text AND the back-arrow icon
        headerTintColor: Colors.white,
        // Title font
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      }}
    >
      {/* Home Screen ─ static title */}
      <Stack.Screen
        name="index"
        options={{ title: "My Notes" }}
      />

      {/**
       * Detail Screen
       *
       * We intentionally leave `title` blank here because the screen sets
       * it dynamically to the note's own title using <Stack.Screen> inside
       * the component (see app/detail.tsx).
       *
       * headerBackTitle (iOS only) — the label next to the back arrow.
       * Without this it defaults to the previous screen's title ("My Notes"),
       * which is fine, but "Notes" is shorter and looks cleaner.
       */}
      <Stack.Screen
        name="detail"
        options={{ headerBackTitle: "Notes" }}
      />
    </Stack>
  );
}
