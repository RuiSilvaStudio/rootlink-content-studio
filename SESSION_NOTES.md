# Session handoff — 2026-07-06

> **To the next agent:** this was a long, high-context session. Read this first.
> The user is Rui, a non-technical product owner building "Content Studio" — a
> standalone headless content management tool that will eventually manage
> RootLink's live frontend. Currently it manages a visual clone of RootLink
> (`preview-site/`) as a development stand-in. Nothing touches the real
> `rootlink/` repo yet — that's a deliberate, deferred decision.

---

## Quick start (get both apps running)

```bash
# Content Studio (Payload CMS admin)
cd /home/rui/projects/rootlink-content-studio
docker compose -f docker-compose.dev.yml up -d    # Postgres on :5432
npm run dev                                        # :3010
npm run sync                                       # populates DB from clone

# Preview site (RootLink clone)
cd preview-site
npm run dev                                        # :3011
```

User must create a first account at `http://localhost:3010/admin` (the
bootstrap hook forces `role=owner` — verified working).
Clone with edit mode: `http://localhost:3011/?edit=1`.
Unified dashboard: log into Content Studio, the default admin homepage is
now the `ContentStudioDashboard` (left tree + center iframe + right tools).

---

## Architecture (what got built and why)

### 1. Unified dashboard (`src/views/ContentStudioDashboard.tsx`)

Replaces Payload's default admin homepage via
`admin.components.views.dashboard` in `payload.config.ts`.

Layout:
- **Left sidebar (~260px):** page tree. Fetches all pages from
  `/api/pages`, builds a tree, click to navigate the center iframe.
  Collapsible.
- **Center:** an iframe loading the preview-site clone with `?edit=1`
  query param to activate the click-to-edit overlay.
- **Right sidebar (~260px):** switches between two modes:
  - **Default:** tool panels (QuickThemePanel, QuickFontsPanel,
    QuickMediaPanel, QuickTemplatesPanel) — tabs at the top.
  - **Field editor:** when the user clicks an element in the iframe,
    the dashboard receives a `postMessage` and shows an
    `InlineFieldEditor` component with a textarea + Save button.
    Collapsible.

Import map entry is at `/views/ContentStudioDashboard#ContentStudioDashboard`
in `src/app/(payload)/admin/importMap.js`.

### 2. postMessage save architecture (the important decision)

**Problem:** the iframe (preview-site on :3011) cannot save directly to
Content Studio's API on :3010 — different origins, different auth cookies.
`fetch(url, { credentials: 'include' })` doesn't work cross-origin.

**Chosen solution (production-grade, not a quick hack):**
1. Iframe is **preview-only**. It never saves directly.
2. When the user clicks an editable element, the iframe sends a
   `postMessage` with field info (`collection`, `key`, `currentValue`,
   `label`, etc.) to the parent Content Studio window.
3. The dashboard component receives the message and opens an
   `InlineFieldEditor` in the right sidebar.
4. The editor is in Content Studio's own origin — same auth cookies —
   so it can `fetch('/api/marketing-copy')` directly with full auth.
5. On save, the iframe is refreshed (`iframeRef.current.src = ...`)
   to reflect the change.

This works across any domain boundaries, in production, without API keys
or cookie hacks. It's the same pattern headless CMSes use for preview.

The iframe-side code is in
`preview-site/components/EditableOverlay.tsx` (see the
`window.parent !== window` check around line 109). In standalone mode
(directly at `localhost:3011/?edit=1`, not inside the dashboard iframe),
it falls back to the old in-page `EditPanel`.

### 3. Auto-discovery sync (`scripts/sync-from-clone.ts`)

Replaces manual seed data. Reads from preview-site source files:
- `messages/en.json` → creates **134 MarketingCopy entries** for all
  `home.*`, `nav.*`, `create.*` i18n keys
- `app/globals.css` → reads `--rl-*` CSS variables from `:root`,
  populates Theme palette (primary/earth/rust scales + cream), font
  families, radii defaults
- Hardcoded page route list (matching `rootlink/frontend/app/` structure)
  → creates 20 Pages entries

Run as `npm run sync` (standalone) or via `npm run seed` (which calls
sync + creates 1 example Template). Safe to re-run — everything upserts.

### 4. Click-to-edit overlay (preview-site)

35+ HTML elements tagged with `data-cs-field="marketing-copy:home.hero_title"`
attributes across the homepage, nav, and footer. See:
- `preview-site/app/page.tsx`
- `preview-site/components/nav/NavBar.tsx`
- `preview-site/components/nav/DesktopDropdown.tsx`
- `preview-site/components/Footer.tsx`

The overlay (`preview-site/components/EditableOverlay.tsx`):
- Hover: amber outline on any `[data-cs-field]` element
- Click: sends postMessage to parent (if inside iframe) or opens
  local EditPanel (standalone mode)
- Edit mode indicator pill in top-right when `?edit=1` is active

### 5. Theme/Tailwind v4

preview-site was upgraded from Tailwind v3.4.19 to v4.3.x via the
official `@tailwindcss/upgrade` tool, then hand-fixed for a critical bug:

**The `--rl-*` naming collision:** `@theme` creates real global CSS custom
properties from its tokens. If a `@theme` token references a variable with
the SAME name (e.g., `--color-primary-50: var(--color-primary-50)`), it
becomes a silent self-reference that resolves to nothing — every color on
the page breaks. Fix: all runtime-overridable source variables use the
`--rl-*` prefix (distinct from Tailwind's `--color-*` namespace), and
`@theme` tokens alias them: `--color-primary-50: var(--rl-primary-50)`.

This is documented in the big comment on `@theme` in
`preview-site/app/globals.css`. **Do not casually rename these variables
or collapse them into the same namespace — it will silently break every
color on the clone.** This already bit us once from the auto-migration
tool's naive handling.

Runtime color override flow:
1. `globals.css` `:root` defines `--rl-*` defaults (RootLink's exact hex)
2. `@theme` aliases Tailwind tokens to those `--rl-*` variables
3. `ThemeVarsInjector` fetches active theme from Content Studio on load
   and overrides `--rl-*` on `<html>`
4. Canvas animation (`HeroParticleCanvas`) listens for
   `rootlink:theme-vars-updated` event and re-reads colors

### 6. Font library (`src/collections/Fonts.ts`)

Fonts collection with `family`, `sourceUrl` (Google Fonts URL), `fallback`
(relationship to self). Theme's font fields (`fontBody`, `fontDisplay`,
`fontMono`) are relationship dropdowns pointing to Fonts — no free-text
typos. `ThemeVarsInjector` injects `<link>` elements for all fonts
referenced by the active theme.

### 7. Block system

Four block types in Content Studio: Hero, TextSection, ImageWithText,
CallToAction (`src/blocks/`). `preview-site/components/blocks/BlockRenderer.tsx`
renders them with RootLink's actual Tailwind styling.

Homepage rendering logic in `preview-site/app/page.tsx`:
- Fetches published homepage page from Content Studio on load
- If blocks exist: renders them at the top
- If a hero block exists → suppresses hardcoded hero section
- If a CTA block exists → suppresses hardcoded CTA section
- Everything else (categories, tools, community, recently indexed) always
  renders because blocks don't cover those yet
- If no Content Studio or no blocks → full hardcoded clone renders

---

## ⚠️ Known bugs (fix these first)

All three are in `src/views/ContentStudioDashboard.tsx`:

### Bug 1: Right sidebar editor doesn't populate text value
When clicking an element in the iframe, the editor's title and key
update correctly, but the `<textarea>` doesn't show `field.currentValue`.
The `InlineFieldEditor` receives `currentValue` via the `selectedField`
state (set from postMessage), and initializes `useState` with it — but
the state isn't resetting when `selectedField` changes. Probable fix:
add a `key={field.key}` to the `InlineFieldEditor` component so React
unmounts/remounts it when the selected field changes.

### Bug 2: Save button turns white
Same root cause as Bug 1 — the editor state doesn't reset properly
when selecting a different element. The `value === field.currentValue`
comparison produces wrong results because the `value` state is stale.

### Bug 3: Right sidebar tabs don't work when editor is active
The Theme/Fonts/Media/Templates tabs only work when `selectedField` is
null. When the field editor is showing, the tabs are hidden (correctly) —
but when the user closes the editor (clicks ×), the tabs should return
to their last active state. Check the conditional logic around line 220
in ContentStudioDashboard.tsx.

---

## Where everything lives

| What | Path |
|---|---|
| Content Studio root | `/home/rui/projects/rootlink-content-studio/` |
| Payload config | `src/payload.config.ts` |
| Dashboard view | `src/views/ContentStudioDashboard.tsx` |
| Collections | `src/collections/` (Users, Fonts, Media, MarketingCopy, Pages, Themes, Templates) |
| Custom fields | `src/fields/` (ColorPickerField, GenerateScaleButton, PaletteImportExport, I18nKeyPicker) |
| Block definitions | `src/blocks/` |
| Color scale util | `src/lib/color-scale.ts` |
| Theme tokens util | `src/lib/theme-tokens.ts` |
| Sync engine | `scripts/sync-from-clone.ts` |
| Seed script | `scripts/seed.ts` |
| Import map | `src/app/(payload)/admin/importMap.js` |
| ESLint config | `eslint.config.mjs` (excludes preview-site, user-template) |
| Preview site | `preview-site/` (separate Next.js 14 app, Tailwind v4) |
| Clone homepage | `preview-site/app/page.tsx` |
| Block renderer | `preview-site/components/blocks/BlockRenderer.tsx` |
| Edit overlay | `preview-site/components/EditableOverlay.tsx` |
| Edit panel | `preview-site/components/EditPanel.tsx` |
| Theme vars | `preview-site/lib/theme-vars.ts` |
| Font injector | `preview-site/components/ThemeVarsInjector.tsx` |
| Locale context | `preview-site/lib/locale-context.tsx` |
| Messages | `preview-site/messages/en.json` |
| Page blocks fetcher | `preview-site/lib/page-blocks.ts` |
| User's template | `user-template/saasable-ui/` (MUI + Tailwind v4 UI kit) |
| DB compose file | `docker-compose.dev.yml` |
| Env vars | `.env` (DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL, NEXT_PUBLIC_CLONE_URL) |
| GitHub | `github.com/RuiSilvaStudio/rootlink-content-studio` (branch: `main`) |

---

## Dev workflow

1. **Start both servers** — Content Studio (:3010) + preview-site (:3011)
2. **Run sync** if DB was reset: `npm run sync` or `npm run seed`
3. **Create first user** at `localhost:3010/admin`
4. **Dashboard** is the default homepage after login
5. **Edit mode** standalone: `localhost:3011/?edit=1`
6. **Schema changes** require DB reset: `docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up -d`, then re-run sync/seed
7. **Typecheck both projects**: `npx tsc --noEmit` in root, then `cd preview-site && npx tsc --noEmit`
8. **Lint**: `npm run lint` in root (preview-site excluded from root lint)
9. **importMap.js** needs manual updates for new custom views — `generate:importmap` doesn't always pick up views. If a component fails with "X is not defined", check the import map's import names match the map entries.

## Gotchas (from README + today)

- **Schema changes hang dev server:** adding required fields to existing
  collections prompts `Accept warnings? (y/N)` on the server terminal.
  Fix: wipe DB (`docker compose down -v + up`), re-sync.
- **`payload run <script>` doesn't await:** scripts need top-level
  `await` (see `scripts/seed.ts`).
- **`--rl-*` naming collision:** don't rename runtime-themeable CSS
  variables to match Tailwind's `--color-*` namespace (see globals.css
  comment).
- **`user-template/` is excluded from lint** — it's a downloaded
  third-party UI kit, not our code.
- **DB was reset at end of session** — `npm run sync` was run, data is
  populated, but no admin user exists. First login needs
  `create-first-user`.
- **The dev servers were left running** — expect them to need restart
  after the machine sleep/reboot.
