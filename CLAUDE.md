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

**No `expo-blur`.** The tab bar is an opaque translucent fill plus a hairline, not a blur (see 8.1). Real backdrop blur on Android needs `dimezisBlurView` — a per-frame backdrop resample — for a marginal gain on a ~64px strip, and nobody's picked that up.

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

### Messages — an infinite query

- `useInfiniteQuery` against `/api/posts?userId=<id>&limit=10&offset=<n>`, key `messages.byContact(id)` (exported from `useMessages.js` as `messagesByContactKey`). Same offset/`total` arithmetic as contacts: `getNextPageParam` returns `offset + limit` while under `total`, `undefined` once it isn't. `initialPageParam: 0`.
- **In practice `hasNextPage` is almost always `false` after page one** — the seed gives each user 1–4 posts, under one page of 10. This was originally built as a plain `useQuery` for exactly that reason (an infinite query here can't demonstrate real multi-page fetching the way contacts does). Switched to `useInfiniteQuery` anyway for interface consistency with a real chat app, where a conversation *can* run past one page — the mock's shallow seed data is the limiting factor, not the query shape. Say this in the README so it reads as a considered call, not a miss: the pattern is correct for the domain even though this particular dataset rarely exercises page two.
- Flatten `pages.flatMap(p => p.results)` inside `select`, same as contacts.
- Older messages load at the **top** of the list (`onStartReached`, not `onEndReached`) — the opposite edge from contacts, because this list renders ascending and isn't inverted (see section 8).
- **Scroll-to-latest on open.** `ChatScreen` holds a `FlashList` ref (via `List`'s `forwardRef`) and, once the first page has loaded, calls `scrollToEnd({ animated: false })` once per mount. This is what actually makes "reopen a conversation and see the latest message" true in practice — it doesn't fix the fetch-direction issue above (page one is still the *oldest* chunk for a hypothetical contact with >10 posts), but since every contact's `total` fits in that one page, page one already contains the newest message too, so scrolling to the end of what's loaded is scrolling to the true latest message. Re-mount-only (a `scrolledToEnd` ref guards it), not on every render or every sent message.
- The optimistic-send mutation writes directly into this cache (see below), so its cache shape is `{ pages, pageParams }`, not a flat envelope — a pending/reconciled message is written into the **last** page, matching where the mock API appends a pushed post.
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

**Spec:** absolutely positioned, `bottom = insets.bottom + 12`, `marginHorizontal: 16`, fully rounded (9999), ~64px tall. Built directly in `TabBar.js` (see 8.1, there's no shared surface component) as an opaque translucent fill plus a hairline border, not a hard solid card. It reads as floating because it's a distinct rounded shape and the list scrolls under it — no blur. Two items: Chats, Settings.

**Gotchas — all four of these will bite:**

- **Content padding.** Every scrollable must add bottom padding equal to the bar height plus its offset, or the last row sits under the bar. Export a single `FLOATING_TAB_BAR_TOTAL_HEIGHT` constant and use it everywhere. Do not hardcode a magic number per screen.
- **Keyboard.** Set `tabBarHideOnKeyboard: true`, and hide the bar entirely on the Chat screen — a floating tab bar above a message composer is a broken layout.
- **Nested hiding.** In React Navigation v7, hide the bar per-screen from the stack's `screenOptions`, not by reaching for `navigation.getParent()` inside a `useEffect`. The effect-based approach flickers on transition.
- **Elevation.** Android `elevation` clips at rounded corners — wrap the bar rather than applying elevation to a bordered view directly. Lift here is surface + hairline, not shadow (see 8.1).

Press feedback: scale to ~0.96 with Reanimated. No haptics. Screen switch uses `@react-navigation/bottom-tabs` v7's built-in `animation: 'fade'` (screenOptions on the tab navigator). No custom gesture-driven pager, no new dependency: it's a prop the installed navigator already has. That's the whole animation budget for the tab bar.

---

## 8. Floating header — gradient scrim

Not a card. The header is a vertical gradient that fades scrolled content out toward the top, with the controls sitting directly on it.

**Spec:** `headerTransparent: true` with a custom `header` component (`HeaderScrim.js`). A full-width `expo-linear-gradient` running `mocha300 → mocha100 → mocha100 @ 0%` at stops `[0, 0.8, 1]` — the `mocha300` sliver at the very top gives the status-bar area a touch more contrast before settling into the background color, then fading to transparent; height = `insets.top + APP_BAR_HEIGHT (56)`. The gradient layer is `pointerEvents="none"`. Over it: on the Chat screen — back button, avatar, and name, the whole cluster one pressable that navigates to Profile; on the Chats/Profile/Settings screens — a title and/or back button.

**Gotchas:**

- **Top padding.** Use `useHeaderHeight()` and pad scroll content by it. Do not guess.
- **Gradient must not eat touches.** `pointerEvents="none"` on the gradient layer, or list rows under the fade become untappable.
- **Not an inverted list.** The Chat screen renders messages ascending, top-to-bottom, with `paddingTop` covering the header and the composer pinned below the list in normal flex flow — no `inverted` prop. An inverted list (padding roles swapped, scroll-to-bottom-by-default) was considered but never built; if it is later, remember `paddingTop` and `paddingBottom` swap visual roles.

## 8.1 Glass surface — inline on the tab bar, not a shared component

There's no `ui/GlassSurface.js`. Only the tab bar (`navigation/tab/TabBar.js`) gets the treatment, built directly where it's used: a wrapper with `overflow: 'hidden'` and `borderRadius: 9999` containing two absolutely-filled layers — a `barFill` view using `glass.tint` and a `barBorder` view using `glass.border` — with the tab items rendered on top. The Chat composer (`features/chat/components/Sender.js`) does **not** reuse this; it's a separate plain bordered pill (`mocha300` border, `mocha100` fill, `elevation: 1`). If the two ever need to look identical, pulling the tab-bar treatment out into a shared component is the move — right now they're two independent implementations that happen to rhyme.

**This app is Android-only.** No iOS path, no `Platform` fork.

**What's actually built:** an opaque translucent fill (`glass.tint`, `rgba(245, 245, 245, 0.8)` — warmWhite @ 80%) plus a 1px hairline border (`glass.border`, `rgba(207, 176, 160, 0.6)` — mocha300 @ 60%), with the contacts list scrolling underneath. No `BlurView`, no `expo-blur` dependency.

**Non-negotiables:**

- **`overflow: 'hidden'` on the wrapper, always.** The rounded corners must clip the fill and the border cleanly.
- **No `elevation` on the fill/border views themselves.** It clips at rounded corners on Android.
- **Content must scroll under the bar.** `contentContainerStyle` padding on the list (`FLOATING_TAB_BAR_TOTAL_HEIGHT`), never a wrapper that clips the list short.

`glass.blur` and `glass.blurIntensity` exist as tokens in `theme/tokens.js` but nothing reads them — there is no blur experiment wired up, gated or otherwise. If real backdrop blur (`dimezisBlurView`) is ever worth trying, it's tab-bar-only, measured on-device against the perf monitor, behind that `blur` flag — but that's a speculative future, not planned work.

---

## 9. Design tokens — warm mocha (light)

A light, warm cream-and-brown palette, single accent. Tokens live in `theme/tokens.js`; no raw hex or magic numbers in components. This app is **light only** — no dark variant, no theme toggle. (An earlier draft of this spec called for dark Catppuccin Mocha; that was superseded during implementation and never built — the palette below is what's actually in `tokens.js`.)

**Colour**

| Role                                                                | Token       | Value                |
| -------------------------------------------------------------------- | ----------- | -------------------- |
| App background; text/icon sitting on the accent                     | `mocha100`  | `#f2e9e3`             |
| Hairline, divider, muted/secondary text, disabled, glass border base | `mocha300`  | `#cfb0a0`             |
| Accent — outgoing bubble, send button, active tab, avatar placeholders, cursor | `mocha500` | `#a47864`      |
| Secondary heading/label text                                         | `mocha700`  | `#69493c`             |
| Primary text                                                         | `mocha900`  | `#2e1e18`             |
| Card / grouped-row fill, switch thumb                                | `warmWhite` | `rgb(245, 245, 245)` |
| Incoming bubble fill, skeleton base                                  | `gray`      | `#E5E5E5`             |
| Success — sent tick                                                  | `green`     | `#5b8c5a`             |
| Error — failed send, retry                                           | `red`       | `#B5533E`             |

`white` is used only for the send-icon glyph and the profile-card avatar initials. `yellow`, `lightYellow`, and `black` also exist in `theme/tokens.js` but aren't consumed anywhere yet.

**Two things that follow from a light, low-contrast-background theme:**

1. **Elevation is mostly translucency + hairline, not shadow.** The tab bar lifts off the page with a translucent fill (`glass.tint`) over a hairline (`glass.border`, see 8.1); the header lifts by scrolled content fading into the gradient. A couple of spots (the header's back-button chip, the composer pill) do use a bare `elevation: 1` — kept low deliberately, since anything higher clips at rounded corners on Android.
2. **Text on the accent must be light.** `mocha500` is a mid-tone brown, so content sitting on it (outgoing bubble text, the send icon) uses `mocha100`/`white`, not `mocha900` — dark-on-dark-ish accent fails contrast.

**Type** — Inter, loaded at three weights only (`Inter_400Regular`, `Inter_600SemiBold`, `Inter_700Bold`, deep-imported in `App.js` so Metro doesn't bundle all 18 faces). Screen title 22/700, row name 16/600, message body 15/400, timestamps and meta 12–14/400 in `mocha500`.

**Radius** — 14 cards and grouped rows · 16 message bubbles · 32 composer pill · 9999 avatars and tab bar.

**Spacing** — 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48.

**Message bubbles** — outgoing: `mocha500` fill, `mocha100` text. Incoming: `gray` fill, `mocha900` text. Max width 78%, uniform 16px radius on both — the per-corner "tightened corner" treatment from an earlier draft was never implemented. Timestamp sits inside the bubble, dimming to `mocha300` while `status: 'sending'`.

**Message status** — sending: timestamp dims to `mocha300`. Sent: `green` check-all icon. Failed: `red` bubble border plus a tappable "Failed to send · Tap to retry" in `red`.

**Skeletons** — shimmer runs `gray` → `mocha300`.

**System chrome** — `StatusBar` style `dark` (dark icons/text read on the light background), Android nav bar and the Expo splash/`app.json` `backgroundColor` both `mocha100` (`#f2e9e3`), set once in `App.js`. A background-color mismatch at cold start undoes the whole theme, and it shows up in screen recordings.

Accent discipline: `mocha500` is the one recurring accent — send action, outgoing bubbles, active tab, avatar placeholders. Everything else is the mocha neutral ramp plus `green`/`red` for status.

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
