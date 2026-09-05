# CLAUDE.md

Project instructions for Claude Code. Read this before writing any code.

This file is gitignored (see `.gitignore`). The committed `CLAUDE.md` is only `@AGENTS.md`; this is the full living brief.

---

## 1. What this is

A React Native chat app built as a take-home assessment for **Respond.io** (mobile developer role). Four-day deadline. It is a portfolio piece, not a product — every decision should be legible to a reviewer skimming the repo for fifteen minutes.

**What is actually being graded:**

1. React Query usage — caching, infinite queries, mutations, optimistic updates
2. State management boundaries — server state vs client state
3. Performance and RN best practices
4. App architecture
5. UI/UX polish
6. `README.md` quality, including honest AI-tool disclosure

Anything that doesn't serve one of those six is out of scope. When in doubt, cut it.

**Deliverables:** public GitHub repo, `README.md` with architecture + AI usage + screenshots, and a **working APK committed directly into the repo**. The APK is a hard requirement — a submission without it fails regardless of code quality.

**Cut order when the deadline runs out** — a smaller surface done completely beats a larger one with rough edges. Drop in this order: (1) debounced contact search; (2) prefetch-on-row-press; (3) the real last-message preview index, falling back to the deterministic placeholder described in section 12. **Never cut:** the four-phase optimistic send + retry affordance, the loading/empty/error trio on every list and screen, and the `onlineManager`/`focusManager` wiring.

---

## 2. Stack

| Concern      | Choice                                           | Why                                                                                                                                                                                           |
| ------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework    | Expo (managed)                                   | EAS Build produces the required APK without touching Gradle                                                                                                                                   |
| Navigation   | React Navigation v7 (bottom tabs + native stack) | Custom `tabBar` prop is needed for the floating bar                                                                                                                                           |
| Server state | TanStack Query v5                                | Explicitly required                                                                                                                                                                           |
| HTTP client  | `axios`                                          | One instance in `api/client.js` — `baseURL`, an interceptor that unwraps the envelope and normalises errors to one shape. Interceptors keep that off every call site; `fetch` would repeat it |
| Client state | Zustand + `expo-sqlite/kv-store` persistence     | One tiny slice (blocked IDs). No MMKV — a set read once on mount doesn't need sync high-frequency storage, and it keeps the dep list and dev-build config shorter                             |
| Lists        | FlashList v2                                     | Better recycling than FlatList; v2 auto-measures, no size estimates                                                                                                                           |
| Images       | `expo-image`                                     | Built-in caching, no layout thrash                                                                                                                                                            |
| Keyboard     | `react-native-keyboard-controller`               | `KeyboardAvoidingView` is unreliable with a floating composer                                                                                                                                 |
| Animation    | `react-native-reanimated` v4                     | Scroll-linked header, tab press feedback (SDK 57 is New Arch, so v4)                                                                                                                          |
| Gradient     | `expo-linear-gradient`                           | The header scrim — opaque → transparent fade, see section 8                                                                                                                                   |
| Connectivity | `@react-native-community/netinfo`                | `onlineManager` wiring — see section 6                                                                                                                                                        |
| Insets       | `react-native-safe-area-context`                 | Every floating element depends on this                                                                                                                                                        |
| Dates        | `dayjs`                                          | Row/bubble timestamps today, but the app is growing more date surfaces (calendar-style "Today"/"Yesterday" grouping, profile "member since") — 2KB core, no reinventing DST/month-boundary edge cases as those land. `lib/time.js` is the only file that imports it |

**Target: Android only.** The APK is the deliverable; there is no iOS build. No `Platform.OS` forks for iOS, no iOS-only styling branches.

**No `expo-blur`.** Floating surfaces are opaque (see 8.1). Real backdrop blur on Android needs `dimezisBlurView` — a per-frame backdrop resample — for a marginal gain on ~64px strips. If it's ever wanted it goes on the tab bar only, measured, behind a `glassBlur` flag.

**Do not add** a component library, a form library, i18n, an analytics SDK, or a navigation state persister. Each one is dead weight a reviewer has to read past.

---

## 3. Commands

```
npx expo start --dev-client            # dev
npx expo start --dev-client --clear    # when Metro caches something stale
npx eslint .                           # lint — run before every commit
eas build -p android --profile development   # dev client (needed once)
eas build -p android --profile preview       # APK deliverable
```

This app needs a **custom dev client** — `react-native-keyboard-controller` is not in Expo Go. Build the dev client **and** a throwaway `preview` APK on **day 1**. Do not discover a broken build pipeline on day 4.

**Also on day 1: verify the POST contract by hand before writing the mutation.** The published docs and the deployed handler disagree (see section 12). One curl settles it:

```
curl -i -X POST https://responserift.dev/api/posts \
  -H 'Content-Type: application/json' \
  -d '{"userId":5,"title":"probe","body":"probe"}'

curl -s 'https://responserift.dev/api/posts?userId=5&limit=10' | head -40
```

Confirm three things: the 201 body's exact field set, whether the created post shows up in the immediately following GET, and what `id` it was assigned. Note the answers in the README — the second one is nondeterministic and that is itself the finding.

---

## 4. Structure

Feature-first, not type-first.

```
src/
  api/
    client.js            # axios instance, baseURL, envelope-unwrap + error-normalise interceptors
    contacts.js          # raw endpoint fns, no React
    messages.js
  features/
    chats/               # list screen
    chat/                # conversation screen
    profile/
    settings/
      components/
      hooks/             # useContacts, useMessages, useSendMessage
      screens/
  store/
    blockStore.js
  navigation/
    RootNavigator.js
    TabNavigator.js
    TabBar.js            # the floating tab bar (see section 7)
    AppBar.js            # the floating header / gradient scrim (see section 8)
  ui/                    # Avatar, Bubble, Card, EmptyState, Skeleton, Pressable
  lib/
    queryClient.js
    mappers.js           # API shape -> domain shape
    time.js
  theme/
    tokens.js
```

**Rule:** raw API shapes never reach a component. `api/` returns raw, `lib/mappers.js` converts to domain types, hooks return domain types. If a component references `post.body`, that's a bug.

**Why `api/` is shared and not colocated per feature.** The endpoints are resource-shaped, the screens are feature-shaped, and the two don't line up: `/api/users` serves both Chats and Profile. Colocating would force one feature to import from a sibling, which is worse than a shared folder.

The split to hold: `api/` is thin, resource-shaped, and contains no React — the axios instance, endpoint calls, raw types, the envelope type, error normalisation. Feature folders own the hooks — query key usage, `select`, optimistic logic, mapping to domain shapes.

The test for anything new: if this feature folder were deleted, would the file go with it? Hooks die with the feature and belong inside it. Endpoint functions describe the backend, outlive any screen, and belong in `api/`. Genuinely single-screen logic should be colocated without hesitation — that just isn't the case for users or posts here.

---

## 5. State boundaries — non-negotiable

- **TanStack Query owns all server state.** Contacts, messages, profiles. It is a cache, not a store.
- **Zustand owns client state only.** Currently that means exactly one thing: the set of blocked contact IDs, persisted via `expo-sqlite/kv-store` (Zustand `persist` adapter). Zustand earns its place because "state boundaries" is graded and a store that visibly never touches server data is the artifact; MMKV does not, because this slice is read once on mount.
- **Never copy fetched data into Zustand.** No `setContacts`, no `messages: []` in a store. This is the single most common failure in this assessment and it will be looked for.
- Local UI state (composer text, modal open) stays in `useState` in the component that owns it.

---

## 5.1 Domain model — there is no conversation resource

The API has thirteen resources and none of them is a conversation. No thread, no participant pair, no `lastMessageAt`, no unread count. So the model this app builds is derived, and the README should say so in one line:

- **Contact** = a `/api/users` record.
- **Conversation** = the _derived_ set of posts where `post.userId === contact.id`. It has no identity of its own; it is a filter over a flat collection.
- **Message** = a post. `body` → text, `createdAt` → timestamp, `userId` → contact ID.

Two consequences that shape screens:

1. **The Chats tab is a contacts list that renders a message preview.** Every contact appears whether or not any posts exist for them. There is no "conversations" query key because there is nothing to key.
2. **Every seeded post belongs to the contact, so the raw data is one-sided.** Nothing in the API represents _your_ outgoing messages. See section 12, "Message direction."

Say this explicitly in the README. A reviewer expecting a conversations endpoint will otherwise read the derivation as a missing abstraction rather than a constraint.

---

## 6. TanStack Query conventions

### Query keys

Each hook declares and exports its own key factory next to the query it owns — e.g. `export const contactsListKey = (params = {}) => ['contacts', 'list', params]` in `useUsers.js`, `previewIndexKey` in `usePreviewIndex.js`. No shared `lib/queryKeys.js`. Any other hook or mutation that needs to target that key (invalidation, optimistic writes) imports the factory from the owning hook's file rather than re-typing the array — that's what keeps invalidation from failing silently, not centralization.

### Contacts — infinite query

- `useInfiniteQuery` against `/api/users?limit=10&offset=<n>`. **Page size is 10.** 60 users seeded, so six pages — real pagination, not a single-page fake.
- `pageParam` is the **offset**, starting at 0 and stepping by 10.
- The API returns a `{ total, limit, offset, results }` envelope, so the stop condition is arithmetic, not a length guess: `getNextPageParam` returns `offset + limit` while that value is under `total`, and `undefined` once it isn't. Do not fall back to checking `results.length` — `total` is authoritative and clearer to read.
- `initialPageParam: 0`.
- Flatten `pages.flatMap(p => p.results)` inside `select`, not in the component, so flattening is cached rather than recomputed each render.
- `/api/users` also supports `q` (case-insensitive across id, username, name, email — verified in the handler). A debounced search field on the Chats tab is cheap — the query key becomes `contacts.list({ q })` and the infinite query resets naturally. Worth doing if day 4 has room.

### Messages — a plain query, deliberately not infinite

- `useQuery` against `/api/posts?userId=<id>&limit=10`, key `messages.byContact(id)`.
- **Not `useInfiniteQuery`.** The seed gives each user 1–4 posts, so a conversation can never exceed one page. An infinite query here would be structurally incapable of fetching a second page — scaffolding that exists to look impressive. The infinite query lives on contacts, where it actually paginates. State this in the README; deliberately _not_ using a pattern is a stronger signal than using it everywhere.
- Server-side filtering by `userId` is supported, so **never filter client-side**.
- Use the top-level `/api/posts?userId=` route, not the nested `/api/users/:id/posts` route. Confirmed from source: the nested route builds its own separate module-scoped array and normalises extra fields (`slug`, `updatedAt`). They are two different arrays with two different write histories — mixing them produces inconsistent shapes and inconsistent contents.
- Sort ascending by `createdAt` in the mapper and render inverted (newest at the visual bottom). The seed happens to be ascending already, but do not rely on file order — sort explicitly, because a POST that lands in memory is appended, not inserted in date order.

### Sending a message — optimistic, four phases

This is the centrepiece of the assessment. All four phases are required.

**The POST contract, verified from the handler** — build to this, not to the docs:

- Required fields are `userId`, `title`, `body`. **`title` is required and a chat message has no title**, so synthesise one (`body.slice(0, 40)`) and leave a comment saying why. Omit it and you get a 400.
- `userId` must exist in the seeded users or you get `400 Invalid userId`.
- The 201 response is **not** the same shape as a GET item: it adds `slug` and defaults `category` to `'General'`. The mapper must tolerate both, or accept the response into a separate raw type.
- The server id is `Math.max(...posts.map(p => p.id)) + 1` over module memory, which on a cold instance is always `101`. **Server ids are not unique across sends.**

**The four phases:**

1. **`onMutate`** — `cancelQueries` on `messages.byContact(id)`, snapshot previous cache, insert a temp message with a client-generated ID and `status: 'sending'`.
2. **`onError`** — restore the snapshot, or flip the temp message to `status: 'failed'` and render a tappable retry. The retry affordance is worth building.
3. **`onSuccess`** — locate the temp message by client ID and update it in place to `status: 'sent'`, keeping **the client ID as the message's identity**. Store the server id in a separate field if it's wanted for display. Do not append the response, and do not promote the server id to the key — ids collide across sends, and swapping a list key mid-render forces a remount.
4. **`onSettled`** — on **error**, invalidate `messages.byContact(id)` to resync. On **success, do nothing.** See below.

**Why success does not invalidate.** The published docs claim `POST /api/posts` does not store the created post. The handler actually does `posts.push(newPost)` into the same module-level array the GET reads. Same route file means the same serverless function, so a warm instance _will_ return the message on the next GET and a cold one won't. Persistence is therefore **nondeterministic**, which is worse to build against than "never," because a strategy that's correct for "never" is wrong half the time:

- Invalidate on a cold instance → the sent message vanishes.
- Invalidate on a warm instance → a refetched post arrives whose id may collide with one already reconciled → duplicate bubble, or a key clash.

Treating the `onSuccess` cache write as authoritative is correct under both branches. Keying by client ID means a colliding server id can never produce a duplicate.

**README line:** "The mock API's POST handler pushes into a module-scoped array, so a sent message persists only for the lifetime of that serverless instance — sometimes visible on the next GET, sometimes not. Rather than let refetches nondeterministically drop or duplicate sent messages, the mutation treats its cache write as authoritative and skips post-success invalidation on the messages key; messages are reconciled by client-generated ID, not server ID, because the mock assigns colliding IDs. A real backend would invalidate here. Sent messages are lost on app restart — a property of the mock backend, not the client."

### Global config

Set `staleTime` (30–60s for contacts), a sane `retry`, and wire `onlineManager` and `focusManager` to RN `AppState` and NetInfo. TanStack Query does not do this automatically on native, and doing it signals you read the RN section of the docs.

---

## 7. Floating tab bar

Custom component passed to `tabBar`, not `tabBarStyle` overrides.

**Spec:** absolutely positioned, `bottom = insets.bottom + 12`, `marginHorizontal: 16`, fully rounded (9999), ~64px tall. Rendered with the shared `<GlassSurface>` (see 8.1) — an opaque `Base @ 92%` pill with a hairline, not a hard solid card. It reads as floating because it's a distinct rounded shape with an edge lighter than the `Base` behind it and the list scrolls under it — no blur. Two items: Chats, Settings.

**Gotchas — all four of these will bite:**

- **Content padding.** Every scrollable must add bottom padding equal to the bar height plus its offset, or the last row sits under the bar. Export a single `FLOATING_TAB_BAR_TOTAL_HEIGHT` constant and use it everywhere. Do not hardcode a magic number per screen.
- **Keyboard.** Set `tabBarHideOnKeyboard: true`, and hide the bar entirely on the Chat screen — a floating tab bar above a message composer is a broken layout.
- **Nested hiding.** In React Navigation v7, hide the bar per-screen from the stack's `screenOptions`, not by reaching for `navigation.getParent()` inside a `useEffect`. The effect-based approach flickers on transition.
- **Elevation.** Android `elevation` clips at rounded corners — wrap the bar rather than applying elevation to a bordered view directly. Lift here is surface + hairline, not shadow (see 8.1).

Press feedback: scale to ~0.96 with Reanimated. No haptics. Screen switch uses `@react-navigation/bottom-tabs` v7's built-in `animation: 'fade'` (screenOptions on the tab navigator). No custom gesture-driven pager, no new dependency: it's a prop the installed navigator already has. That's the whole animation budget for the tab bar.

---

## 8. Floating header — gradient scrim

Not a card. The header is a vertical gradient that fades scrolled content out toward the top, with the controls sitting directly on it.

**Spec:** `headerTransparent: true` with a custom `header` component. A full-width `expo-linear-gradient`: `Base` at full opacity across the top (through the status-bar area) fading to `Base` at 0 alpha at its bottom edge; height ≈ `useHeaderHeight()` + ~24. The gradient layer is `pointerEvents="none"`. Over it: on the Chat screen — back button, avatar, name, and a subtitle line, the whole cluster one pressable that navigates to Profile; on the Chats screen — the title and (later) the search field.

**Gotchas:**

- **Top padding.** Use `useHeaderHeight()` and pad scroll content by it. Do not guess.
- **Gradient must not eat touches.** `pointerEvents="none"` on the gradient layer, or list rows under the fade become untappable.
- **Inverted lists invert padding.** On the Chat screen's inverted list, `paddingTop` renders at the visual bottom and `paddingBottom` at the visual top. Get this wrong and messages hide under the header while a gap opens above the composer. Verify visually before moving on.

## 8.1 Glass surface — shared

One component, `ui/GlassSurface.js`, used by the floating tab bar and the Chat composer. The header is the gradient scrim in section 8, not this. Implement the treatment once.

**This app is Android-only.** No iOS path, no `Platform` fork.

**Committed design: an opaque translucent fill.** What sells "floating glass" here is, in order: (1) content genuinely scrolling _under_ the surface, (2) a 1px hairline edge lighter than the fill, (3) the surface being a distinct rounded shape a touch lighter than the `Base` behind it. No `BlurView`.

**Composition** — two layers inside a wrapper with `overflow: 'hidden'` and the target radius:

1. A fill: `Base` at ~92% opacity (`glassTint`). Opaque enough to guarantee text and input contrast over anything scrolling under it, translucent enough to read as a surface and not a hard card.
2. A 1px `Surface1` hairline border at ~60% opacity (`glassBorder`).

Content sits above both.

**Non-negotiables:**

- **`overflow: 'hidden'` on the wrapper, always.** The rounded corners must clip the fill and the border cleanly.
- **No `elevation`.** It clips at rounded corners on Android. Lift comes from the fill being lighter than what passes under it, plus the hairline (see section 9).
- **Content must scroll under the bar.** Transparent header/footer plus `contentContainerStyle` padding — never a wrapper that clips the list short. The surface reads as floating only if content passes beneath it.

**Optional blur — later, measured, tab bar only.** If there's slack: put an `expo-blur` `BlurView` behind the fill on the tab bar with `experimentalBlurMethod="dimezisBlurView"`, `intensity: 45` (`blurIntensity`), and drop the fill to ~55%. Gate it with the `glassBlur` boolean token so reverting is one line. `dimezisBlurView` re-samples the backdrop every frame and the APK is the graded deliverable, so measure on the target device: scroll the contacts list hard with the perf monitor on. Holds 60 → keep. Drops frames → `glassBlur` off. `expo-blur` needs the dev client, which `keyboard-controller` already forces.

**README sentence:** "Floating surfaces are opaque translucent fills, not `BlurView`: the header dissolves scrolled content behind a `Base` → transparent gradient, and the tab bar and composer are rounded `Base @ 92%` pills with a hairline. Real `dimezisBlurView` blur was considered and skipped — a per-frame backdrop resample for a marginal effect on ~64px strips." The reasoned choice is worth more to a reviewer than the effect.

**Composer.** The message input at the bottom of the Chat screen uses the same `<GlassSurface>` so it matches the tab bar. It replaces the tab bar in that screen's visual slot.

---

## 9. Design tokens — Catppuccin Mocha

Dark, low-contrast-background, single-accent. Tokens live in `theme/tokens.js`; no raw hex or magic numbers in components. This app is **dark only** — do not build a light variant.

**Colour**

| Role                                        | Token    | Hex       |
| ------------------------------------------- | -------- | --------- |
| App background                              | Base     | `#1e1e2e` |
| Recessed / behind floating bars             | Mantle   | `#181825` |
| Card, tab bar, header, incoming bubble      | Surface0 | `#313244` |
| Hairline, pressed state, skeleton highlight | Surface1 | `#45475a` |
| Disabled / dividers                         | Surface2 | `#585b70` |
| Muted text, timestamps                      | Overlay2 | `#9399b2` |
| Secondary text                              | Subtext1 | `#bac2de` |
| Primary text                                | Text     | `#cdd6f4` |
| Accent — outgoing bubble, send, active tab  | Mauve    | `#cba6f7` |
| Success — delivered tick                    | Green    | `#a6e3a1` |
| Error — failed send, retry                  | Red      | `#f38ba8` |

Verify these against the official Catppuccin palette before committing — copy from source rather than trusting a transcription.

**Two rules that follow from going dark, and both are easy to get wrong:**

1. **Elevation is surface and translucency, not shadow.** Drop shadows are nearly invisible on `#1e1e2e`. The tab bar and composer lift off the page by being a distinct rounded fill lighter than what passes under them, plus a 1px `Surface1` hairline; the header lifts by scrolled content fading into it. Delete the single-shadow-tier rule — it does not apply here. Skip `elevation` entirely: it clips at rounded corners on Android.

**Glass tokens** — `glassTint: Base @ 92%` (the shipped opaque fill) · `glassBorder: Surface1 @ 60%` · `glassBlur: false` + `blurIntensity: 45` (read only by the optional tab-bar blur experiment, see 8.1). **Header scrim tokens** — `scrimFrom: Base @ 100%` · `scrimTo: Base @ 0%`. `<GlassSurface>` consumes the glass tokens; the header gradient consumes the scrim tokens.

2. **Text on the accent must be dark.** Catppuccin accents are pastel. White text on Mauve fails contrast badly. Outgoing bubble text is `Base #1e1e2e` on `Mauve`, which passes comfortably and looks correct. The same applies to the send button icon.

**Type** — Inter. Screen title 22/500, row name 16/600, body 16/400, timestamps and meta 14/400 in Overlay2, badge 11/600. On dark backgrounds, avoid weights below 400 — thin type on dark reads as blurry on Android.

**Radius** — 8 inputs and buttons · 14 cards · 20 sheets and floating header · 9999 pills, avatars, tab bar.

**Spacing** — 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48.

**Message bubbles** — outgoing: `Mauve` fill, `Base` text, radius 20 with the bottom-right corner tightened to 6. Incoming: `Surface0` fill, `Text`, bottom-left tightened to 6. Max width 78%. Timestamp in `Overlay2`, outside the bubble. No tails, no gradients, no shadows.

**Message status** — sending: timestamp dims to `Surface2`. Delivered: `Green` tick. Failed: `Red` bubble border plus a tappable retry in `Red`.

**Skeletons** — shimmer runs `Surface0` → `Surface1`. Never white or grey.

**System chrome** — set `StatusBar` style to light, set the Android navigation bar to `Base`, and set the Expo splash and `backgroundColor` in `app.json` to `Base`. A white flash on cold start undoes the whole theme, and it shows up in screen recordings.

Accent discipline: `Mauve` appears once or twice per screen. Everything else is Base, Surface, and Text. Do not add a second accent for variety.

---

## 10. Performance rules

- Memoise every list row; hoist `renderItem` — no inline arrows or object literals in the render path.
- Stable `keyExtractor`; `getItemType` when a list mixes row shapes. FlashList v2 (SDK 57) auto-measures — `estimatedItemSize` / `estimatedListSize` are removed, don't pass them.
- Derive in `select`, not in render.
- The composer is its own component with local state, so keystrokes never re-render the message list.
- `expo-image` with fixed dimensions.
- Avatars come from the API's `avatar` URL — load through `expo-image` with a fixed size and a placeholder, never a bare `Image`.
- **No `useQuery` inside a recycled list row.** Recycling means mount/unmount churn and a request waterfall on scroll. Anything a row needs beyond its own record comes from a single indexed query resolved in `select` (see section 12).
- Any value not backed by the API must be deterministic from the contact ID. Random placeholders reshuffle on re-render and read as a bug.
- Reanimated worklets for anything scroll-linked; never animate through React state.

---

## 11. Required states

Every list and screen needs loading, empty, and error-with-retry. The brief calls these optional, which is exactly why they separate candidates.

- Loading: skeleton rows matching the real row layout, not a centred spinner.
- Empty: one line of direction, in the interface's voice. "No conversations yet," not "Oops!"
- Error: what failed and a retry button. Errors don't apologise and are never vague.

**The empty conversation state is real, not hypothetical.** Nine seeded contacts have zero posts — ids **47, 49, 51, 53, 54, 57, 58, 59, 60**. Use one of them for the empty-state screenshot in the README.

---

## 12. API

Base URL: `https://responserift.dev/api`.

**Source of truth: the handlers, not the docs.** These facts were read from `github.com/amritkarma/responserift` (`app/api/**/route.ts`, `app/data/*.json`), not from the published documentation, because the documentation is wrong in two places that matter — write persistence and the top-level post filters. That repo is `main` and the deployed instance may be a different commit, so run the day-1 probe in section 3 before building the mutation.

### Verified ground truths

| Fact                  | Value                                                                           |
| --------------------- | ------------------------------------------------------------------------------- |
| Seeded users          | 60 → six pages at `limit=10`                                                    |
| Seeded posts          | 100 total                                                                       |
| Posts per user        | 1–4                                                                             |
| Users with zero posts | 9 (ids 47, 49, 51, 53, 54, 57, 58, 59, 60)                                      |
| `createdAt` coverage  | 100/100 present, ISO 8601                                                       |
| Seed ordering         | ascending by both `id` and `createdAt`                                          |
| Sort parameter        | **none exists** on any route                                                    |
| `post.tags`           | array of tag **ID strings** (`["1","16","15"]`), not labels — never render them |
| Auth / rate limiting  | none; CORS is open                                                              |

Two documentation errors to ignore:

- The docs list `tagId` and `categoryId` as `/api/posts` filters. The handler reads only `userId`, `tag`, `category`, `limit`, `offset`. The other two are unimplemented.
- The docs say `POST /api/posts` "does not store it in the top-level collection." It does `posts.push(...)` into the array the GET reads. See "Write behaviour."

### Envelope

Every collection route returns the same wrapper. Reuse one generic type for it.

```
{ total: number, limit: number, offset: number, results: T[] }
```

`total` is the count _after_ filtering (`filtered.length`), which is what makes the `getNextPageParam` arithmetic in section 6 correct.

### Pagination

`limit` and `offset` on all collection routes. Top-level defaults are `limit=100`, `offset=0` — **always pass `limit` explicitly**, or you'll pull 100 records and the infinite scroll will have nothing left to load. (The nested `/api/users/:id/posts` route defaults to 10 instead of 100. Another reason not to mix route families.)

Pagination is `filtered.slice(offset, offset + limit)` over file order. There is no stable sort key applied server-side, so ordering is seed order — ascending — and a pushed post lands at the end regardless of its `createdAt`.

### `/api/users` — contacts

Fields: `id`, `name`, `username`, `email`, `avatar`, `phone`, `website`, `address { street, city, zipcode }`.

`avatar` is a real image URL (pravatar). `phone` is real. Row avatar/name and the whole Profile screen use live data.

`q` filters case-insensitively across `id`, `username`, `name`, `email` — verified in the handler.

### `/api/users/:id` — profile

Everything Profile needs: name, avatar, phone. Prefetch this on row press so the screen opens warm.

### `/api/posts` — messages

Fields: `id`, `userId`, `title`, `body`, `tags[]`, `category`, `createdAt`.

Map to the domain shape: `body` → message text, `createdAt` → real timestamp, `userId` → contact ID. Ignore `title`, `tags`, `category` — do not surface them in a chat UI.

Implemented filters: `userId`, `tag`, `category`, plus `limit` / `offset`.

### Chats-row "last message" and timestamp

Real data, from **one request**, not per-row queries and not a fake string.

**Why not `?userId=<id>&limit=1`:** the seed is ascending and there is no sort parameter, so `limit=1` returns the _oldest_ post, not the newest. Getting the newest per contact that way needs `total` first, so two round trips per row.

**Committed approach — a preview index.** One query, key `messages.previewIndex()`, hitting `/api/posts?limit=100&offset=0`. In `select`, reduce to a `Map<userId, Post>` holding the last post per user. The Chats row reads its preview from that map by contact ID. One network request covers all 60 rows, the reduction is cached by `select` rather than recomputed per render, and no `useQuery` ever mounts inside a recycled row.

This is the right call _for this API_ and not a general one, so name the limit in the README: "The Chats list shows real last messages via a single indexed fetch of the 100-post collection, reduced to a per-contact map in `select`. This works because the mock's entire post collection is smaller than one page of a real feed; a production backend would expose `lastMessage` on the conversation resource. Per-row queries were rejected — a `useQuery` inside a recycled FlashList row causes a request waterfall and mount churn on scroll."

**Fallback, if the index query is cut on day 4** (see section 1): a deterministic placeholder — hash the contact ID to pick from a fixed phrase list, plus a stable relative timestamp. Never `Math.random()`; a placeholder that reshuffles across re-renders reads as a bug.

### Message direction

Every seeded post belongs to the contact, so the raw data is entirely incoming.

**Committed approach:** every fetched post is `incoming`, full stop — no per-post fabrication in the mapper. `direction: 'outgoing'` is set only on messages this device actually sent through the optimistic mutation (see section 6), keyed by the presence of a client-generated ID. A conversation you haven't replied to is therefore a column of incoming bubbles; the outgoing style, accent colour, and status ticks only appear once you send something.

An earlier draft assigned direction by even/odd position in the mapper so both bubble styles would appear on a freshly opened, unmessaged conversation. That was reverted: fabricating a contact's post as something the device sent muddies the one honest signal the mock gives us — every post really did come from the contact. Take the screenshot for the README after sending at least one message in the demo conversation, not on first open.

**README line:** "The API has no concept of message direction — every post belongs to the contact, so every fetched message renders as incoming. Outgoing is only ever set on messages this device actually sent, reconciled by client-generated ID; it is never inferred from a fetched post."

### Write behaviour — read this before building the mutation

`POST /api/posts`, from the handler:

```js
requiredFields = ['userId', 'title', 'body']        // 400 if any is missing
if (!usersData.find(u => u.id === Number(body.userId))) → 400 'Invalid userId'

newPost = {
  id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
  userId, title, slug: generateSlug(title), body,
  tags: Array.isArray(body.tags) ? body.tags : [],
  category: body.category || 'General',
  createdAt: new Date().toISOString(),
}
posts.push(newPost)                                  // same array the GET reads
return 201 newPost
```

Four consequences:

- **`title` is required.** Synthesise it from the body and comment the line.
- **The 201 shape ≠ the GET shape.** It carries `slug`, which no seeded post has, and a defaulted `category`. Type it separately or make the mapper tolerant.
- **Server ids collide.** `max(id) + 1` on a cold instance is always `101`. Reconcile and key by the client-generated temp ID, permanently. The server id is a field, never the identity.
- **Persistence is nondeterministic, not absent.** The push targets the same module-scoped array the GET reads, so a warm serverless instance returns the message on the next GET and a cold one doesn't. This is why success does not invalidate — see section 6, phase 4, for the full reasoning and the README wording.

Do not use `POST /api/users/:id/posts`. It exists, it also pushes, and it pushes into a _different_ array with a different id sequence.

This constraint is useful for the demo — it makes the failure path easy to show. Record a message sending, landing, and a forced-error case rolling back with the retry affordance.

---

## 13. Out of scope

Automated tests are **descoped** — a deliberate tradeoff, stated in the README, with a note on what would be tested first (the optimistic reconciliation logic). Do not add a test runner, an empty `__tests__` directory, or a `test` script that errors. Half-configured tooling reads worse than none.

Also out: auth, real-time sockets, dark mode, i18n, a design-system package, over-abstracted generic components with more props than use sites.

---

## 14. Working agreement

- Plain JavaScript, no TypeScript. `jsconfig.json` gives path aliases (`@/*`) only — no type checking. Keep raw API shapes and domain shapes distinguishable by convention (`api/` returns raw, `lib/mappers.js` returns domain) since there's no type layer to enforce it.
- Commit in meaningful increments with real messages. A single "initial commit" containing the whole app is a signal, and not a good one.
- Never add `Co-Authored-By` or "Generated with Claude Code" trailers to commits or PRs.
- Prefer deleting code over commenting it out.
- Ask before adding a dependency that isn't in section 2.
- When something is a limitation of the mock API rather than a bug, say so in the README instead of hiding it.
- When the API docs and the handler disagree, the handler wins — and the disagreement goes in the README, because catching it is the finding.
