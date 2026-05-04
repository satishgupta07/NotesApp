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
│   ├── _layout.tsx             # Root layout — SafeAreaProvider + NotesProvider + Stack
│   ├── index.tsx               # Home Screen — notes list, search, filter
│   └── detail.tsx              # Detail Screen — full note view
│
├── src/
│   ├── components/             # Reusable UI pieces
│   │   ├── NoteCard.tsx        # Single note row with category badge
│   │   ├── EmptyState.tsx      # Shown when the list has no items
│   │   ├── FAB.tsx             # Floating Action Button — Ionicons + spring animation
│   │   ├── NoteFormModal.tsx   # Slide-up form — create OR edit a note
│   │   └── SearchBar.tsx       # Search input with Ionicons icons
│   │
│   ├── constants/
│   │   ├── colors.ts           # Central colour palette
│   │   └── categories.ts       # Note categories + their colours
│   │
│   ├── context/
│   │   └── NotesContext.tsx    # Context API — global notes state
│   │
│   ├── hooks/
│   │   └── useNotes.ts         # Custom hook — notes state + AsyncStorage
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
| 5 | Edit & Delete Notes | ✅ Done |
| 6 | Persist Data — AsyncStorage | ✅ Done |
| 7 | Global State — Context API | ✅ Done |
| 8 | Search & Filter — Derived State, `useMemo` | ✅ Done |
| 9 | Polish — Icons, Animations, Safe Area, Haptics | ✅ Done |

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
app/detail.tsx     →  "/detail"  (Detail Screen)
```

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
  params: { id: item.id },  // pass only the id — detail reads live data from context
});
```

> **All param values must be strings.** Numbers, booleans, and undefined must be
> converted before passing (`String(num)`, `flag ? "true" : "false"`, `val ?? ""`).

---

#### `useLocalSearchParams<T>()` — Reading Params
Read the params in the destination screen. The generic `<T>` types the result.

```tsx
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams<{ id: string }>();

// Look up the full note from context using the id
const note = notes.find((n) => n.id === id);
```

---

#### `<Stack.Screen>` Inside a Component — Dynamic Header
Render `<Stack.Screen>` anywhere inside a screen to set its header options at runtime.

```tsx
export default function DetailScreen() {
  const note = /* looked up from context */;

  return (
    <>
      <Stack.Screen options={{ title: note.title }} />
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
  <Stack.Screen name="index"  options={{ title: "My Notes" }} />
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

### Step 5 — Edit & Delete: `Alert`, `filter`, `map`

#### `Alert.alert()` — Native Dialog
Shows a native OS dialog with configurable buttons. Does not block JavaScript execution.

```tsx
Alert.alert(
  "Delete Note",                             // title
  "This cannot be undone.",                  // message
  [
    { text: "Cancel",  style: "cancel" },    // dismisses the dialog
    { text: "Delete",  style: "destructive", // red on iOS — signals danger
      onPress: () => deleteNote(id) },
  ]
);
```

| Button style | Behaviour |
|---|---|
| `"default"` | Standard button |
| `"cancel"` | Bold on iOS, handles Android Back press |
| `"destructive"` | Red text on iOS — use for irreversible actions |

---

#### `array.filter()` — Delete an Item
Returns a **new** array containing only the items where the predicate returns `true`.

```tsx
// Delete: keep every note EXCEPT the one being deleted
setNotes((prev) => prev.filter((n) => n.id !== deletedId));

// Before: [noteA, noteB, noteC]   (deleting noteB)
// After:  [noteA, noteC]
```

---

#### `array.map()` — Update an Item
Returns a **new** array where each item is transformed by the callback.

```tsx
// Update: swap the old version of a note for the new one
setNotes((prev) =>
  prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
);

// Before: [noteA, noteB,        noteC]
// After:  [noteA, updatedNoteB, noteC]
```

> Both `filter` and `map` return **new** arrays — they never mutate the original.
> That is why React detects the change and re-renders.

---

#### `onLongPress` — Secondary Gesture
`TouchableOpacity` (and `Pressable`) supports a long-press gesture in addition to tap.

```tsx
<TouchableOpacity
  onPress={handleTap}           // fires on a quick tap
  onLongPress={handleLongPress} // fires after ~500ms hold
>
  ...
</TouchableOpacity>
```

---

#### One Component, Two Modes (`NoteFormModal`)
Instead of a separate `CreateNoteModal` and `EditNoteModal`, one component
accepts an optional `initialNote` prop that switches its behaviour.

```tsx
// Create mode — blank form
<NoteFormModal visible={open} onSave={handleCreate} onClose={close} />

// Edit mode — pre-filled form
<NoteFormModal visible={open} initialNote={note} onSave={handleUpdate} onClose={close} />
```

Inside the component:
```tsx
const isEditMode = initialNote !== undefined;

// Spread preserves id and createdAt; only overwrites the edited fields
const saved = isEditMode
  ? { ...initialNote, title, content, category }
  : { id: Date.now().toString(), title, content, category, createdAt: new Date().toISOString() };
```

---

### Step 6 — Persist Data: Custom Hooks & AsyncStorage

#### Custom Hook
A custom hook is a function whose name starts with `use` and that can call
other hooks inside it. It extracts reusable stateful logic out of components.

```ts
// src/hooks/useNotes.ts
export function useNotes() {
  const [notes,     setNotes]     = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // load on mount, auto-save on change ...

  return { notes, setNotes, isLoading }; // only expose what callers need
}

// In any screen:
const { notes, setNotes, isLoading } = useNotes();
```

Benefits over raw `useState` in the component:
- Screen focuses on UI; hook owns the data concern
- Can be reused by multiple screens
- Logic is testable in isolation

---

#### `useEffect` Patterns

```ts
// Pattern 1 — run ONCE on mount (load initial data)
useEffect(() => {
  loadNotes();
}, []); // empty array = no dependencies = never re-runs

// Pattern 2 — run when a value changes (auto-save)
useEffect(() => {
  if (!isLoading) {     // guard: don't save before we've loaded
    saveNotes(notes);
  }
}, [notes, isLoading]); // re-runs whenever notes OR isLoading changes
```

| Dependency array | When it runs |
|---|---|
| Omitted | After **every** render |
| `[]` | Once — after the first render only |
| `[a, b]` | After any render where `a` or `b` changed |

---

#### `async` / `await`
Makes asynchronous code (I/O, network) read like synchronous code.

```ts
async function loadNotes() {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  // code here only runs AFTER getItem resolves
  // the UI stays responsive while waiting
}
```

- `async` before a function makes it return a `Promise`
- `await` pauses execution **inside** the function until the `Promise` resolves
- The rest of the app keeps running — only this function pauses

---

#### `try / catch / finally`

```ts
async function loadNotes() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY); // risky operation
    setNotes(json ? JSON.parse(json) : DEFAULTS);
  } catch (error) {
    console.error("Load failed:", error);  // handle the failure
    setNotes(DEFAULTS);                    // safe fallback
  } finally {
    setIsLoading(false); // ALWAYS runs — clears the spinner even on error
  }
}
```

---

#### `AsyncStorage` — Device Persistence
Key-value storage that survives the app being closed and reopened.

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// Write
await AsyncStorage.setItem("@app/notes", JSON.stringify(notes));

// Read (returns null if key doesn't exist)
const json = await AsyncStorage.getItem("@app/notes");
const notes = json ? JSON.parse(json) : [];

// Delete
await AsyncStorage.removeItem("@app/notes");
```

> Always namespace your keys (`@appname/keyname`) to avoid collisions with
> other libraries that also use AsyncStorage.

---

#### `JSON.stringify` / `JSON.parse`
AsyncStorage stores only **strings**. Use JSON to convert objects ↔ strings.

```ts
// Object → string (to store)
const json = JSON.stringify([{ id: "1", title: "Hello" }]);
// json = '[{"id":"1","title":"Hello"}]'

// String → object (after reading)
const notes = JSON.parse(json) as Note[];
// notes = [{ id: "1", title: "Hello" }]
```

---

#### `ActivityIndicator` — Loading Spinner
Built-in React Native component that shows a platform-native spinner.

```tsx
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
```

---

### Step 7 — Global State: Context API

#### The Problem — Prop Drilling
When state lives in a parent and a deeply nested child needs it, you must pass
it through every component in between — even ones that don't use it.

```
RootLayout
  └─ HomeScreen         ← owns notes state
       └─ NoteCard
            └─ (grandchild wants notes?)   ← must receive it as a prop all the way down
```

**Context eliminates this.** Any component anywhere in the tree can read from
the context directly — no intermediary props needed.

---

#### How Context Works

```
createContext()    ← creates the "channel" (a container for a value)
<Context.Provider> ← broadcasts a value DOWN the component tree
useContext()       ← any descendant reads that value
```

```
Provider
  ├─ Screen A  →  useContext() reads the value ✅
  ├─ Screen B  →  useContext() reads the value ✅
  └─ Screen C  →  useContext() reads the value ✅
```

---

#### `createContext` — Creating the Channel

```ts
// createContext<Type>(defaultValue)
// The default is used ONLY when called outside any Provider — almost always a bug.
const NotesContext = createContext<NotesContextValue | null>(null);
```

---

#### Provider Component — Broadcasting the Value

```tsx
export function NotesProvider({ children }: { children: ReactNode }) {
  const { notes, setNotes, isLoading } = useNotes(); // from our custom hook

  function addNote(note: Note) {
    setNotes((prev) => [note, ...prev]);
  }

  return (
    // Every component INSIDE this Provider can read `value` via useContext
    <NotesContext.Provider value={{ notes, isLoading, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}
```

Place the Provider at the root of your app (`_layout.tsx`) so every screen is
a descendant.

---

#### Consumer Hook — Reading the Value

```tsx
export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext);

  // Null-check gives a clear error if the Provider is missing
  if (!ctx) throw new Error("useNotesContext() must be called inside <NotesProvider>");

  return ctx;
}

// Usage in any screen — no prop passing required:
const { notes, addNote, deleteNote } = useNotesContext();
```

> **Why wrap `useContext` in a custom hook?**
> 1. The null-check gives a clear error if the Provider is missing.
> 2. Callers import one thing (`useNotesContext`) instead of two (`useContext` + `NotesContext`).
> 3. If the context shape changes, you update one function.

---

#### `array.find()` — Look Up One Item

```ts
// find(predicate) returns the FIRST item where predicate is true, or undefined
const note = notes.find((n) => n.id === id);

if (!note) {
  // guard clause — return early rather than crashing
  return <Text>Note not found</Text>;
}
```

---

### Step 8 — Search & Filter: Derived State & `useMemo`

#### Derived State
A value that can be **computed from existing state** should NOT be stored in its
own `useState`. Doing so creates a second source of truth that can go out of sync.

```tsx
// ❌ Two sources of truth — have to keep them in sync manually
const [notes, setNotes] = useState<Note[]>([]);
const [filtered, setFiltered] = useState<Note[]>([]); // stale if notes changes!

// ✅ Derived — computed from the real state
const filtered = notes.filter((n) => n.title.includes(query));
```

The rule: **if you can compute it, don't store it.**

```
notes + searchQuery + selectedCategory  →  filteredNotes (derived)
```

---

#### `useMemo` — Caching Expensive Computations

```tsx
// useMemo(computeFn, dependencies)
// computeFn only reruns when one of the dependencies changes.
// On other renders it returns the last cached result.

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
}, [notes, searchQuery, selectedCategory]); // ← recompute only when these change
```

If the modal opens/closes (`modalVisible` changes), the filter does **not** rerun
because `modalVisible` is not in the dependency array.

---

#### `useRef` — Mutable Value Without Re-renders

```tsx
// useRef stores a mutable value that persists across renders
// WITHOUT causing a re-render when it changes (unlike useState)

const inputRef = useRef<TextInput>(null);

// Later: call methods on the DOM/native node directly
inputRef.current?.focus();  // programmatically open the keyboard
```

Common uses:
- Holding a reference to a native element (`.focus()`, `.blur()`, `.measure()`)
- Storing values that shouldn't trigger renders (timers, previous values, animation values)

---

#### `String.prototype.includes()` — Substring Search

```ts
"Hello World".toLowerCase().includes("world") // → true
"Hello World".toLowerCase().includes("xyz")   // → false

// Search both title and content so results are comprehensive
note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)
```

---

#### Horizontal `ScrollView` — Pill Row

```tsx
<ScrollView
  horizontal                          // scroll left/right instead of up/down
  showsHorizontalScrollIndicator={false} // hide the scroll bar (implied by layout)
  contentContainerStyle={{ flexDirection: "row", gap: 8 }}
>
  {categories.map((cat) => <Pill key={cat} label={cat} />)}
</ScrollView>
```

---

### Step 9 — Polish: Icons, Animation, Safe Area, Haptics

#### `@expo/vector-icons` — Vector Icon Sets
A library of icon fonts bundled with Expo. Includes Ionicons, MaterialIcons,
FontAwesome, and more.

```tsx
import { Ionicons } from "@expo/vector-icons";

// name follows the Ionicons naming convention:
// "search-outline" = stroke variant   "search" = filled variant
<Ionicons name="search-outline" size={20} color={Colors.textMuted} />
<Ionicons name="close-circle"   size={18} color={Colors.textMuted} />
<Ionicons name="add"            size={30} color={Colors.white} />
```

> Icons render crisp at any resolution — unlike Unicode characters (⌕, ✕, ＋)
> which can look different across platforms and font sizes.

---

#### `Animated` API — Smooth Animations

React Native's built-in animation system. Animated values change over time and
drive style properties directly on the native thread — smooth 60fps motion.

```tsx
import { Animated } from "react-native";

// 1. Create an Animated.Value (store in useRef so it persists across renders)
const scaleAnim = useRef(new Animated.Value(1)).current;

// 2. Animate it with spring physics
Animated.spring(scaleAnim, {
  toValue: 0.88,           // target value
  useNativeDriver: true,   // runs on native thread — no JS bridge overhead
}).start();

// 3. Use it in a style via Animated.View
<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity ... />
</Animated.View>
```

| Animation type | Behaviour |
|---|---|
| `Animated.spring` | Physics-based — natural bounce |
| `Animated.timing` | Linear or eased — predictable duration |
| `Animated.decay` | Slows to a stop — useful for fling gestures |

`useNativeDriver: true` is critical for performance — it moves the animation
entirely off the JavaScript thread so it can't be blocked by heavy JS work.

---

#### `useSafeAreaInsets` — Respecting System UI

On modern devices, the screen extends behind the home indicator (iPhone) or
navigation bar (Android). Content placed at the very bottom can be hidden.

```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Returns: { top, bottom, left, right } in pixels
const insets = useSafeAreaInsets();

// Push FAB above the home indicator
const fabBottom = 32 + insets.bottom;

// Push list content above the FAB
contentContainerStyle={{ paddingBottom: 56 + fabBottom + 16 }}
```

`SafeAreaProvider` must wrap the tree (in `_layout.tsx`) for the hook to work:

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";

<SafeAreaProvider>
  <NotesProvider>
    <Stack>...</Stack>
  </NotesProvider>
</SafeAreaProvider>
```

---

#### `expo-haptics` — Tactile Feedback

Triggers vibration feedback that reinforces UI actions with physical sensation.

```tsx
import * as Haptics from "expo-haptics";

// On long-press — acknowledges the gesture before the dialog appears
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On destructive delete — definitive thud confirms the action completed
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
```

| Style | Feel | When to use |
|---|---|---|
| `Light` | Gentle tick | Selection changes, toggles |
| `Medium` | Moderate tap | Long press, confirmations |
| `Heavy` | Strong thud | Destructive or final actions |

> Haptics are silently ignored on devices that don't support them (simulators,
> older hardware) — no need to guard the call.
