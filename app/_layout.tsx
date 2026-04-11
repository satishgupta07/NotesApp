/**
 * app/_layout.tsx — Root Layout
 *
 * WHY does this file exist?
 * In Expo Router, every folder can have a `_layout.tsx` file.
 * The layout wraps all screens in that folder — similar to a "template"
 * that stays on screen while the inner route changes.
 *
 * The root layout (this file) is the top-most wrapper.
 * Here we configure the Stack navigator that handles screen transitions.
 *
 * STACK NAVIGATOR:
 * A Stack works like a stack of cards — when you navigate to a new screen
 * it gets "pushed" on top. Pressing Back "pops" it off and reveals the
 * previous screen. This is the most common navigation pattern on mobile.
 */

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    /**
     * <Stack> sets up the Stack navigator for all screens inside app/.
     *
     * <Stack.Screen> lets you configure how a specific route looks.
     *   name="index"  →  targets app/index.tsx  (our Home Screen)
     *
     * screenOptions inside <Stack.Screen> override the default header style
     * for THAT specific screen only.
     *
     * In Step 4, when we add a detail screen, we'll add another
     * <Stack.Screen name="detail"> entry here to configure its header.
     */
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // The title shown in the top navigation bar
          title: "My Notes",
          // Style the header bar itself
          headerStyle: {
            backgroundColor: "#4A90E2",
          },
          // Colour of the title text and back-arrow icon
          headerTintColor: "#FFFFFF",
          // Style the title text
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
        }}
      />
    </Stack>
  );
}
