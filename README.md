# NotesApp — React Native Learning Project

A step-by-step mobile notes app built with **React Native** and **Expo**, designed as a
hands-on way to learn core mobile development concepts from scratch.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React Native](https://reactnative.dev) | Mobile UI framework |
| [Expo](https://expo.dev) | Toolchain & native APIs |
| [Expo Router](https://expo.github.io/router) | File-based navigation |
| [TypeScript](https://www.typescriptlang.org) | Type safety |

---

## Running the App

```bash
# Install dependencies
npm install

# Start dev server
npx expo start
```

Then either:
- Scan the QR code with **Expo Go** (Android / iOS) — phone must be on the same Wi-Fi
- Press `a` for Android emulator, `i` for iOS simulator

---

## Project Structure

```
NotesApp/
├── app/                        # Expo Router screens (each file = one route)
│   ├── _layout.tsx             # Root Stack navigator + shared header config
│   ├── index.tsx               # Home Screen — notes list
│   └── detail.tsx              # Detail Screen — full note view  (Step 4)
│
├── src/
│   ├── components/             # Reusable UI pieces
│   │   ├── NoteCard.tsx        # Single note row with category badge
│   │   ├── EmptyState.tsx      # Shown when the list has no items
│   │   ├── FAB.tsx             # Floating Action Button (the + button)
│   │   └── CreateNoteModal.tsx # Slide-up form to create a new note  (Step 3)
│   │
│   ├── constants/
│   │   ├── colors.ts           # Central colour palette
│   │   └── categories.ts       # Note categories + their colours
│   │
│   ├── types/
│   │   └── note.ts             # TypeScript Note interface
│   │
│   └── utils/
│       └── date.ts             # formatDate / timeAgo helpers
│
└── assets/                     # Images, icons, fonts
```

---

## Build Roadmap

| Step | Topic | Status |
|------|-------|--------|
| 1 | Home Screen — Static List | ✅ Done |
| 2 | NoteCard Component — Categories & Dynamic Styling | ✅ Done |
| 3 | Add Note — `useState` + `TextInput` + `Modal` | ✅ Done |
| 4 | Navigation — Note Detail Screen | ✅ Done |
| 5 | Edit & Delete Notes | ⬜ Next |
| 6 | Persist Data — AsyncStorage | ⬜ |
| 7 | Global State — Context API | ⬜ |
| 8 | Search & Filter | ⬜ |
| 9 | Polish — UI, icons, animations | ⬜ |

---

## Concepts Covered

### Step 1 — Home Screen & Project Setup

#### `View` and `Text`
The two most fundamental React Native components.

```tsx
// View = a box/container (like <div> in HTML)
// Text = the ONLY way to render text (unlike web where any element can hold text)
<View style={{ padding: 16 }}>
  <Text>Hello world</Text>
</View>
```

> In React Native there are **no HTML tags**. Everything is a component.

---

#### `FlatList` — Efficient Scrollable Lists
Renders only the items currently visible on screen. For large lists, this saves
a lot of memory compared to `ScrollView` (which renders everything at once).

```tsx
<FlatList
  data={notes}                          // the array to iterate over
  keyExtractor={(item) => item.id}      // unique key per item (avoids re-render bugs)
  renderItem={({ item }) => (           // return JSX for ONE item
    <NoteCard note={item} onPress={() => {}} />
  )}
  ListEmptyComponent={<EmptyState />}   // shown when data=[] 
  contentContainerStyle={{ padding: 16 }}
/>
```

| Prop | Purpose |
|------|---------|
| `data` | The array to display |
| `keyExtractor` | Unique ID per row (React uses this to track changes) |
| `renderItem` | Function that returns JSX for a single row |
| `ListEmptyComponent` | JSX shown when the list is empty |
| `contentContainerStyle` | Padding/spacing for the inner scroll container |

---

#### `StyleSheet` — Styling in React Native
Similar to CSS but written as JavaScript objects. No class selectors, no cascading.

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",   // camelCase, not background-color
    borderRadius: 12,           // numbers = density-independent pixels
    padding: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
});

// Apply: <View style={styles.card} />
```

Key differences from CSS:
- Properties are **camelCase** (`backgroundColor` not `background-color`)
- Values are **numbers** (not `"16px"`) — React Native treats them as dp (density-independent pixels)
- **No inheritance** — styles don't flow from parent to child (except `Text` → `Text`)
- **No class selectors** — styles are passed directly as props

---

#### `TouchableOpacity` — Pressable Elements
Wraps any children and makes them tappable. Dims the content on press.

```tsx
<TouchableOpacity
  onPress={() => console.log("tapped!")}
  activeOpacity={0.7}   // 0 = invisible on press, 1 = no change; 0.7 is subtle
>
  <Text>Tap me</Text>
</TouchableOpacity>
```

---

#### `position: "absolute"` — Floating Elements
Removes an element from the normal layout flow so it floats on top.
Used for the FAB (Floating Action Button).

```tsx
const styles = StyleSheet.create({
  fab: {
    position: "absolute",  // float above other content
    bottom: 32,            // distance from bottom of parent
    right: 24,             // distance from right of parent
    width: 56,
    height: 56,
    borderRadius: 28,      // half of 56 = perfect circle
  },
});
```

---

#### Expo Router — File-Based Routing
Every file inside `app/` automatically becomes a screen. No manual route registration.

```
app/index.tsx      →  "/"        (Home Screen)
app/detail.tsx     →  "/detail"  (Detail Screen — Step 4)
```

> Note creation (Step 3) uses a `Modal` overlay rather than a separate route,
> so there is no `create.tsx` file. Step 7 (Context API) will revisit this.

`app/_layout.tsx` wraps all sibling screens — like a template that stays on screen
while the inner route changes.

---

#### TypeScript Interface
Defines the shape (structure) of a data object. Acts as a contract.

```ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;       // required — every note must have this
  category?: NoteCategory; // optional (?) — a note may or may not have a category
}
```

Benefits:
- Auto-complete when typing `note.` in your editor
- Compile-time error if you access a property that doesn't exist
- Self-documenting — the interface tells you exactly what a Note contains

---

### Step 2 — NoteCard Component, Categories & Dynamic Styling

#### Union Types
Restrict a value to a specific set of allowed strings.

```ts
// Only these four strings are valid — anything else is a compile-time error
type NoteCategory = "Personal" | "Work" | "Ideas" | "Learning";

const cat: NoteCategory = "Work";    // ✅ valid
const bad: NoteCategory = "Random";  // ❌ TypeScript error
```

---

#### `Record<K, V>` — Type-Safe Maps
A TypeScript utility type for objects where every key of type `K` must have a value of type `V`.
Useful when you want TypeScript to enforce that no key is missing.

```ts
// Every NoteCategory MUST have a colour — forgetting one is a TS error
const CATEGORY_COLORS: Record<NoteCategory, string> = {
  Personal: "#9B59B6",
  Work:     "#4A90E2",
  Ideas:    "#27AE60",
  Learning: "#E67E22",
  // If you add a new NoteCategory and forget it here → TypeScript error ✅
};
```

---

#### Optional Fields (`?`) and Nullish Coalescing (`??`)
```ts
interface Note {
  category?: NoteCategory;  // the ? means this field may be undefined
}

// Safely reading an optional field:
const label = note.category ?? "Uncategorised"; // use fallback if undefined
const lower = note.category?.toLowerCase();     // optional chaining — safe if undefined
```

---

#### Dynamic Styles — Array Syntax
React Native's `style` prop accepts an **array of styles**. They are merged
left-to-right, with later values overriding earlier ones.

```tsx
// Fixed layout from StyleSheet + runtime colour = no problem
<View style={[styles.badge, { backgroundColor: badgeColor }]}>
  <Text style={styles.badgeText}>{category}</Text>
</View>
```

This pattern is used whenever a style property depends on data (user input,
category, status, etc.).

---

#### `flexDirection: "row"` — Horizontal Layouts
React Native uses **Flexbox** for all layout. The default `flexDirection` is
`"column"` (children stack vertically). Switch to `"row"` to lay them out
side-by-side.

```tsx
// Title on the left, badge on the right
<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
  <Text style={{ flex: 1 }}>{note.title}</Text>  {/* flex:1 = take all remaining space */}
  <CategoryBadge category={note.category} />
</View>
```

| Property | Effect |
|----------|--------|
| `flexDirection: "row"` | Children sit side-by-side |
| `justifyContent: "space-between"` | First child far-left, last child far-right |
| `alignItems: "center"` | Children aligned on the same vertical midline |
| `flex: 1` on a child | That child expands to fill remaining space |

---

#### `null` in JSX — Rendering Nothing
Returning `null` from a component renders nothing. This is the idiomatic way to
conditionally show or hide a component.

```tsx
function CategoryBadge({ category }: { category?: NoteCategory }) {
  if (!category) return null;  // renders nothing — no empty box, no placeholder
  return <View>...</View>;
}
```

---

#### `as const` — Freezing Literal Types
Prevents TypeScript from widening string literals to the generic `string` type.

```ts
// Without `as const` → type is string[]
const cats = ["Personal", "Work"];

// With `as const` → type is readonly ["Personal", "Work"]
const cats = ["Personal", "Work"] as const;
```

---

#### Smart vs Dumb Component Pattern
| | Smart Component | Dumb Component |
|--|----------------|----------------|
| **Knows about** | Data source, navigation, state | Only its own props |
| **Example** | `app/index.tsx` | `NoteCard`, `FAB`, `EmptyState` |
| **Contains** | `useState`, `router.push()`, data arrays | JSX + StyleSheet only |
| **Benefit** | One place to change logic | Reusable anywhere |

---

### Step 3 — Add Note: `useState`, `TextInput`, `Modal`

#### `useState<T>()` — Local State
Gives a component its own memory. Every time the setter is called, React
re-renders the component with the new value.

```tsx
// Syntax: const [value, setValue] = useState<Type>(initialValue)

const [notes, setNotes]         = useState<Note[]>(SAMPLE_NOTES); // typed array
const [modalVisible, setVisible] = useState(false);               // boolean inferred
const [title, setTitle]          = useState("");                   // string inferred
```

> **Never mutate state directly.**
> `notes.push(x)` — React doesn't see the change, no re-render.
> `setNotes([x, ...notes])` — React sees a new array, re-renders. ✅

---

#### Functional State Update
When the new state depends on the previous state, pass a function to the setter.
React guarantees the function receives the **latest** value.

```tsx
// ❌ May use a stale closure value of `notes`
setNotes([newNote, ...notes]);

// ✅ `prev` is always the freshest value
setNotes((prev) => [newNote, ...prev]);
```

---

#### Controlled `TextInput`
A "controlled" input means React owns the displayed value via state.
The flow is: user types → `onChangeText` → `setState` → React re-renders → input shows new value.

```tsx
const [title, setTitle] = useState("");

<TextInput
  value={title}            // React controls what is displayed
  onChangeText={setTitle}  // called on every keystroke with the new string
  placeholder="Note title…"
/>
```

| Prop | Purpose |
|------|---------|
| `value` | The text to display — driven by state |
| `onChangeText` | Callback receiving the full new string on each keystroke |
| `multiline` | Allows multiple lines (like a `<textarea>`) |
| `textAlignVertical` | Android: `"top"` keeps cursor at the top of a multiline input |
| `returnKeyType` | Changes the keyboard's return key label (`"next"`, `"done"`, `"search"`) |
| `maxLength` | Hard cap on character count |

---

#### `Modal` — Native Overlay
Renders its children above the current screen without navigating to a new route.

```tsx
<Modal
  visible={isOpen}           // show/hide
  animationType="slide"      // "none" | "slide" | "fade"
  presentationStyle="pageSheet" // iOS: card with rounded corners
  onRequestClose={handleClose}  // Android: called when hardware Back is pressed
>
  {/* form content */}
</Modal>
```

---

#### `KeyboardAvoidingView` + `Platform.OS`
Adjusts layout height/padding so the software keyboard never hides an input.

```tsx
import { KeyboardAvoidingView, Platform } from "react-native";

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
  <TextInput ... />
</KeyboardAvoidingView>
```

`Platform.OS` returns `"ios"` | `"android"` | `"web"`.
Use it to write platform-specific logic without separate files.

---

#### Form Validation & State Reset

```tsx
function handleSave() {
  if (!title.trim()) {          // .trim() removes leading/trailing whitespace
    setError("Title required");
    return;                     // stop early — don't save
  }

  const newNote: Note = {
    id: Date.now().toString(),  // milliseconds since epoch = unique-enough local ID
    title: title.trim(),
    content: content.trim(),
    category,
    createdAt: new Date().toISOString(),
  };

  onSave(newNote);
  // Reset every field so the form is clean next time it opens
  setTitle(""); setContent(""); setCategory("Personal"); setError("");
}
```

---

### Step 4 — Navigation: Detail Screen & URL Params

#### `useRouter` — Programmatic Navigation
The hook that gives you the router object inside any component.

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

router.push("/detail");          // navigate forward (adds to stack)
router.back();                   // go back one screen
router.replace("/home");         // navigate without adding to stack (no back button)
```

---

#### `router.push()` with Params
Pass data to the next screen as URL query params.

```tsx
router.push({
  pathname: "/detail",
  params: {
    id:        item.id,
    title:     item.title,
    content:   item.content,
    category:  item.category ?? "", // undefined is not a valid param value
    createdAt: item.createdAt,
  },
});
```

> **All param values must be strings.** Numbers, booleans, and undefined must be
> converted before passing (`String(num)`, `flag ? "true" : "false"`, `val ?? ""`).

---

#### `useLocalSearchParams<T>()` — Reading Params
Read the params in the destination screen. The generic `<T>` types the result.

```tsx
import { useLocalSearchParams } from "expo-router";

const { id, title, content, category, createdAt } = useLocalSearchParams<{
  id:        string;
  title:     string;
  content:   string;
  category:  string;
  createdAt: string;
}>();

// Params arrive as strings — cast/parse as needed
const noteCategory = (category || undefined) as NoteCategory | undefined;
```

---

#### `<Stack.Screen>` Inside a Component — Dynamic Header
Render `<Stack.Screen>` anywhere inside a screen to set its header options at runtime.

```tsx
export default function DetailScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();

  return (
    <>
      {/* Sets the header title to the actual note title */}
      <Stack.Screen options={{ title: title ?? "Note" }} />
      <ScrollView>...</ScrollView>
    </>
  );
}
```

---

#### `screenOptions` — Shared Header Styles
Apply styles to **all** screens in a Stack at once. Per-screen `options` merge on top.

```tsx
<Stack
  screenOptions={{                                   // ← applies to every screen
    headerStyle: { backgroundColor: Colors.primary },
    headerTintColor: Colors.white,
    headerTitleStyle: { fontWeight: "bold" },
  }}
>
  <Stack.Screen name="index"  options={{ title: "My Notes" }} />   // overrides title only
  <Stack.Screen name="detail" options={{ headerBackTitle: "Notes" }} />
</Stack>
```

---

#### `ScrollView` — Scrollable Container
Unlike `View`, `ScrollView` lets its content exceed the screen height.
Use it for detail screens, forms, or any content that might be long.

```tsx
<ScrollView
  style={styles.container}            // styles the outer scroll container
  contentContainerStyle={styles.body} // styles the inner scrollable content box
>
  <Text>{longContent}</Text>
</ScrollView>
```

> Use `FlatList` for **lists** (virtualised, memory-efficient).
> Use `ScrollView` for **static content** that can be long (forms, detail views).

---

## Coming Up

| Step | What you'll learn |
|------|------------------|
| **Step 5** | Mutating state arrays, `Alert` dialog, edit & delete notes |
| **Step 6** | `useEffect`, `async/await`, `AsyncStorage` — persist data on device |
| **Step 7** | `createContext`, `useContext`, Provider pattern — global state |
| **Step 8** | Derived state, filtering arrays, search bar |
| **Step 9** | Safe area, icons (`@expo/vector-icons`), animated feedback |
