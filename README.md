# PackagePro

Customisable tour packages with live repricing, local guide selection, and
language-aware recommendations — built for **Kognivera Hackathon 2026, PS-04
(Dynamic Tour Packages)**, against the `PS-04.db` dataset.

This is a working prototype: built, tested, and deployed live at
`https://packagepro.onrender.com` against the real data — not a mock-up.

---

## Quickstart

```bash
npm install
cp .env.local.example .env.local   # then edit GROQ_API_KEY if you want the AI builder
npm run db:init                    # sanity-checks data/PS-04.db and creates data/app.db
npm run dev                        # http://localhost:3000
```

Requires Node 18.18+. `data/PS-04.db` is already included (copied from the
provided zip, untouched). `data/app.db` is created automatically — it's
gitignored, delete it any time to reset all saved customizations/bookings.

No signup: the login page lets you pick any seeded `users` row to act as.

---

## What's implemented

**Must-have (1–5):**
1. Package listing by theme, with day-by-day itinerary and transparent price
   breakdown (`/packages`, `/packages/[id]`).
2. Fully customisable packages: hotel room tier, transfer, guide
   (add/remove/swap), optional extras, and trip length all reprice live.
3. Guide search/filter by city, language, and specialisation, with real
   `guide_availability`-driven pricing.
4. A traveller's preferred languages (interface + guide language) are set on
   `/preferences` and immediately change package ranking, guide ranking, and
   UI copy.
5. Every price shown is Decimal-computed from real catalog rows — see
   `src/lib/money.ts` and `src/lib/pricing.ts`.

**Stretch (6–9), all present in some form:**
6. `/api/ai-builder` — free-tier Groq call, RAG-grounded (candidates are
   retrieved from the DB first; the model can only pick from ids we actually
   retrieved, and the response is re-validated against that set). Degrades to
   a rule-based keyword match if `GROQ_API_KEY` isn't set or the call fails.
7. `/api/addons/[packageId]` — rule-based cross-sell (same city, sorted by
   rating), not ML.
8. Save / share (public read-only link) / book, with server-side idempotency
   on booking.
9. Full multilingual content in en/hi/ta: interface copy, catalog content
   (package/component names, inclusions, cities, hotels, guides) and live
   pricing labels all localize deterministically offline with English
   fallback. UI follows the traveller's saved preference (`src/lib/i18n.ts`),
   the reprice API accepts `uiLang`, and share pages open in any of the three
   languages via `?lang=`. Content overlays are built at deploy time from the
   catalog by `scripts/content-build.mjs` (see `src/lib/content-i18n.ts`).

---

## Data model decisions

The dataset (`data/PS-04.db`, contract v1.1.0-rc1) doesn't specify some
things this feature needs, so these are our stated assumptions — flag them
in review if you disagree with any:

- **Itinerary source.** `itineraries`/`itinerary_items` belong to `trips`,
  not `tour_packages` — there's no FK connecting them, and `itinerary_items`
  only ever uses `hotel`/`poi` entity types. The itinerary shown on a
  package page is synthesized from that package's `package_components`
  (grouped by `day_index`, ordered by `slot`) — see `src/lib/itinerary.ts`.
- **Default total.** `tour_packages.base_price` + the sum of every
  `package_components.price_delta` for that package = what a traveller sees
  on load. Unchecking an optional component subtracts its delta; swapping a
  component replaces its delta with one computed from real catalog data.
  Full reasoning is in the header comment of `src/lib/pricing.ts`.
- **Hotel tier swap** = swapping `hotel_room_types` within the package's
  already-chosen hotel (real `base_rate`s), not swapping to a different
  hotel property. There's no data linking a package's generic hotel choice
  to a "tier" concept beyond the room type, so this was the cleanest
  real-data-backed interpretation.
- **No `activities_poi` table is shipped**, so POI lines have no browsable
  alternates — they're include/exclude toggles, not swaps.
- **Guide selection lives entirely in `app.db`.** The `guide` line in
  `package_components` is a generic, unassigned placeholder (`entity_id` is
  null) — assigning a real `tour_guides` row is customization state we own,
  matching rule R1 (never modify the catalog).
- **Extra days are estimated**, priced at the package's own average
  mandatory-component cost per day — there's no catalog data for what an
  (n+1)th day would actually contain.

### Rule compliance (R1–R8, as given in the handoff)
- **R1 (additive only)** — `app.db` is a wholly separate file; `PS-04.db` is
  opened `readonly: true` (`src/lib/db/catalog.ts`) so a write is a hard
  error, not just a convention.
- **R2 (opaque prefixed ids)** — `src/lib/ids.ts` generates ids in the same
  shape as the seeded data for everything the app creates.
- **R3 (decimal money)** — `src/lib/money.ts`; no `Number()`/`parseFloat()`
  is used on a money field anywhere in the codebase.
- **R5 (enums)** — `src/lib/enums.ts` loads `data/enums.json` as the source
  of truth; nothing hardcodes a guessed enum value.
- **R6 (BCP-47)** — `src/lib/lang.ts` matches on BCP-47 tags (with base-tag
  fallback, e.g. `en` matches `en-IN`), never language names.

---

## Architecture

```
Next.js 14 (App Router)
├─ src/app/            pages (server components) + API routes
├─ src/components/      shared UI (Header, PackageCard, ThemeTabs)
├─ src/lib/
│   ├─ db/
│   │   ├─ catalog.ts   READ-ONLY connection to data/PS-04.db
│   │   ├─ app.ts       read-write connection to data/app.db (own schema)
│   │   └─ queries.ts   all catalog reads, in one place
│   ├─ money.ts         Decimal engine (R3) + largest-remainder split
│   ├─ pricing.ts        live repricing engine
│   ├─ enums.ts          R5 enum validation
│   ├─ lang.ts / i18n.ts language matching + UI copy dictionary
│   ├─ preferences.ts    catalog prefs + app.db override overlay
│   ├─ session.ts        cookie-based "pick a seeded user" auth
│   └─ ids.ts            R2 id generation
```

Both databases are SQLite, accessed via `better-sqlite3` (synchronous,
no connection pool needed for a single-process demo). All money math runs
through `Decimal` (`decimal.js`); every API boundary passes money as
`{ amount: string, currency: string }`, never a float.

**AI builder** (`/api/ai-builder`): retrieval happens against the DB first
(candidate packages filtered by budget/currency, candidate guides filtered
by city/language), *then* the LLM call — the model is only allowed to pick
ids from what was actually retrieved, and the response is re-validated
server-side against that set before being returned. This is what "grounded"
means here: the model can't invent a package or guide that doesn't exist.

---

## Known gaps / what's next

- No automated tests yet — verification so far is build + lint + a manual
  smoke test over every page and API route.
- The AI builder's fallback rule-based matcher is intentionally simple
  (keyword overlap) — it's there so the feature always returns *something*
  useful, not to be the final word on relevance.

## Deploying this for free

**Why it can't be a static/Pages site:** this app has real API routes and a
native module (`better-sqlite3`), so it needs an actual running Node.js
process — GitHub Pages, Cloudflare Pages, and similar static hosts can't run
it. It needs a host that runs `next start` as a long-lived server.

**Recommended: Render, free Web Service, connected to a *private* GitHub repo.**

- Render can build and deploy directly from a private repository — you never
  need to make the repo public. That alone satisfies "don't let random users
  browse my source": the only routes anyone outside your team can reach are
  the ones this app deliberately serves.
- This repo includes `render.yaml`, so in the Render dashboard you can use
  **New → Blueprint Instance**, point it at your repo, and Render reads the
  service config from that file instead of you clicking through settings by
  hand. Set `GROQ_API_KEY` (optional) and `NEXT_PUBLIC_BASE_URL` (your
  `https://<your-service>.onrender.com` URL, once you know it) in the
  Render dashboard's environment variables — never commit them.
- `/api/health` is wired up as the health check path already.

**The one real limitation to know about:** Render's free web services have
an *ephemeral filesystem* — every time the service spins down from
inactivity (15 minutes) and a new request wakes it back up, or whenever you
redeploy, the container starts fresh from the built image. `data/PS-04.db`
is fine (it's bundled in the repo and read-only), but `data/app.db` —
sessions, saved customizations, share links, bookings — resets to empty each
time that happens. For a hackathon demo this is usually fine (a visitor gets
a clean slate), but it does mean a share link or booking reference you
generate today won't reliably still work after the service has slept and
woken up again. If you need that data to actually persist, the smallest
change is swapping `src/lib/db/app.ts` from a local `better-sqlite3` file to
a hosted SQLite-compatible database (e.g. Turso's free tier) — it's a
genuinely free, persistent option, but the client is async where
`better-sqlite3` is sync, so every call site that touches `app.db` needs
`await` added. Left undone here since it touches most of the API routes and
needs your own Turso account to test against; happy to do it if you want to
go that route.

**Frontend/backend split, for the "can people see my code" question:** this
app is mostly React Server Components — `src/lib/pricing.ts`,
`src/lib/db/*`, the AI-builder grounding logic, and every `route.ts` file
run only on the server and are never sent to the browser at all, regardless
of hosting choice. The handful of Client Components (`PackageCustomizer`,
`PreferencesForm`, `LoginPicker`) do ship as JS to the browser, minified,
with production source maps off (`productionBrowserSourceMaps: false` in
`next.config.mjs`) — inspectable in a devtools sense like any website's JS,
but not your actual source files or the pricing/AI logic.

## A note on how this was built

This was built iteratively: schema-first (every assumption above was checked
against the real `PS-04.db` columns), then implemented and verified with
`npm run build`, `npm run lint`, a full local smoke test across every page
and API route, and a live deployment on Render.
