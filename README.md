# RootLink Content Studio

A standalone content/design management tool — separate codebase, separate database,
separate deployment from the main RootLink platform (`rootlink/`). Built with
[Payload CMS](https://payloadcms.com) (self-hosted, MIT license) on Next.js.

## Why this exists

RootLink's frontend has a small, deliberately lightweight inline "Content UI Editor"
(text/curated icons only, no CSS/theming, no templates — see
`rootlink/discovery/mockups/content-ui-editor/` in the platform repo). It doesn't cover
enough ground for non-technical content management: marketing copy *and* images, CSS
design tokens/theming, and reusable page templates.

This project builds that broader tool **fully decoupled** from the platform first. Once
it's real and in use by the team, a gap assessment will decide how (or whether) it
connects to the live RootLink frontend/backend — see "Integration" below.

## Scope

- Marketing copy & images
- Design tokens (color, type scale, spacing, radii, etc.)
- Reusable page templates/blocks
- Small-team roles: `owner` (full control, incl. managing other users) and `editor`
  (content access, no user management)

Explicitly out of scope for now: a full drag-and-drop page builder, and DB-backed
articles/events/listings (RootLink's own content platform already owns that — see
`docs/content-platform/CONTENT_PLATFORM.md` in the platform repo).

## Local development

Requires Docker (for Postgres) and Node 20+.

```bash
npm install
npm run db:up      # starts an isolated local Postgres in Docker (port 5432)
cp .env.example .env  # already pre-filled to match db:up
npm run dev         # http://localhost:3010/admin
```

First run will show a "create first user" screen in `/admin` — that account is
automatically an `owner`.

Stop the local database with `npm run db:down` (data persists in a Docker volume;
delete the `content_studio_pgdata` volume to fully reset).

### Example content

`npm run seed` adds one example theme, template, and marketing copy entry, so the
admin panel isn't empty on first look. Safe to re-run (skips anything that already
exists) and safe to delete afterwards.

## Content model (Phase 1)

- **Marketing Copy** (`marketing-copy`) — key/value text entries (e.g.
  `homepage.hero.title`), with a `page` and free-text `notes` field for context.
- **Media** (`media`) — image uploads with alt text (required), a usage tag
  (hero/icon/background/etc.), and optional usage notes.
- **Themes** (`themes`) — design tokens. The **Palette** tab controls RootLink's real
  Tailwind color families (`primary`/`earth`/`rust`, each a full 50-900 scale, plus
  `cream`) -- pick a seed color and generate a scale, hand-edit any shade afterwards,
  or import/export a palette as JSON. Typography scale, spacing scale, and corner
  radii are also here (still a generic model, not yet reconciled with RootLink's real
  fonts -- see "Next up"). Multiple themes can exist; one is marked `isActive`
  (owner-only to change — it's the "what's actually live" switch).
- **Templates** (`templates`) — reusable page layouts built from an ordered list of
  blocks (Hero, Text Section, Image with Text, Call to Action — see `src/blocks/`).
  This is intentionally a structured, reorderable list, not a freeform drag-and-drop
  canvas.

Everything above requires an authenticated `owner` or `editor` account; only `owner`
can delete records or flip which theme is active.

## Roles

- **owner** — full access, including creating/editing other users and changing roles.
- **editor** — can access the admin panel and manage content, but cannot manage user
  accounts or change their own role (prevents self-escalation).

The very first user created via `/admin` is exempt from these rules (Payload's
built-in "create first user" bootstrap) and becomes an owner.

## Live preview

Themes and Templates have a "Live Preview" pane (the eye icon next to Save in their
edit views): the form on the left, a real rendered view on the right, updating as you
type -- no save required. Templates render using whichever Theme has `isActive`
checked; Themes render their own style guide (colors, type scale, spacing, radii).
Color fields use an actual color-picker swatch, not raw hex text.

## Local dev gotchas

- **Adding/changing a required field on a collection with existing rows will hang
  `npm run dev`.** Payload's Postgres adapter auto-syncs schema in dev by prompting
  `Accept warnings and push schema to database? (y/N)` on the *server* terminal --
  since nothing is there to answer it, requests just hang forever with no error. If a
  request seems stuck after a schema change, check the dev server's terminal output
  first. Easiest fix in local dev (disposable data): `npm run db:down -- -v && npm run
  db:up`, then re-run `npm run seed`. This also deletes any admin users you'd created,
  so you'll need to go through "create first user" again.
- `payload run <script>.ts` does **not** wait for async work in the script -- it exits
  right after the dynamic `import()` resolves. Any script doing async work needs a
  top-level `await` (see `scripts/seed.ts`), otherwise it silently does nothing.
- The blank template's generated `eslint.config.mjs` (`FlatCompat` +
  `next/core-web-vitals`) throws `Converting circular structure to JSON` under this
  version of eslint-config-next. Fixed by importing `eslint-config-next/core-web-vitals`
  and `eslint-config-next/typescript` directly instead of going through the compat shim.

## Preview site (RootLink clone)

`preview-site/` is a separate Next.js app (own `package.json`, own port `3011`,
own `npm run dev`) -- a visual clone of RootLink's real public frontend
(marketing pages only, no backend/database), copied from `rootlink/frontend`
and adapted to run with no backend. It exists so Content Studio's live preview
shows an authentically-RootLink page instead of a hand-built approximation.
See `preview-site/README.md` for exactly what was copied vs. adapted, and why.
Explicitly disposable prototype scaffolding -- see "Integration" below.

## Deployment

Not yet deployed. Planned: an isolated Docker container + Postgres on the same
home server RootLink's backend runs on (`192.168.1.228`), under its own subdomain,
fully separate compose stack/network/volumes from `rootlink/docker-compose.prod.yml`.
This will be documented here once set up (see `rootlink/DEPLOY.md` for the pattern
used on the platform side).

## Theme colors <-> real Tailwind palette (resolved)

RootLink's real frontend is on **Tailwind v3.4.x**. `preview-site` was upgraded to
**Tailwind v4** (official `@tailwindcss/upgrade` tool, then hand-fixed -- see
`preview-site/README.md` and the `@theme` comment in its `globals.css`), because v4
exposes every design token as a native CSS variable and handles opacity modifiers
on any color natively, which is a much better fit for runtime theming than v3's
manual pattern. This is deliberately *not* the same version the real `rootlink/`
frontend runs (that stays v3 for now -- its own v4 upgrade is a separate, bigger,
not-yet-made decision), but `preview-site` only needs to match the real site
*visually*, not match its build system.

- `preview-site/app/globals.css`'s `@theme` block maps `primary`/`earth`/`rust`/
  `cream` to `--rl-*` source variables (also in `globals.css`, defaulted to
  RootLink's exact real hex values) -- so nothing looks different with no theme
  applied.
- `ThemeVarsInjector` fetches the active Theme's palette from Content Studio on load
  and overrides those `--rl-*` variables at runtime -- **no rebuild**. Verified end
  to end under both Tailwind v3 (before the upgrade) and v4 (after): changing the
  primary color in Payload and refreshing actually re-colors every real `primary-*`
  class site-wide (buttons, wordmark, icons, footer, opacity-modifier backgrounds
  like `bg-primary-50/40` -- everything), then correctly reverts.
- Themes' color model was rebuilt to match: a **Palette** tab with real 50-900 scales
  per family, a seed-color + "generate scale" button (`src/lib/color-scale.ts`,
  reverse-engineered from RootLink's actual lightness curve), every shade still
  hand-editable after generating, plus import/export as JSON.

Not done yet: this same CSS-variable pattern hasn't been applied to the real
`rootlink/frontend` (deliberately -- see "Integration" below), and Typography/Spacing
tabs are still a generic model, not reconciled with RootLink's real fonts (Fraunces /
Source Serif 4, loaded via a fixed Google Fonts `@import`, not swappable yet).

## Next up (pick up here)

Real Pages collection + sitemap-tree sidebar, then click-to-select directly in the
live preview (see chat history for the full "Piece 1" framing). Typography/font
theming reconciliation (similar shape of problem to the color one above, smaller)
is a reasonable candidate to fold in alongside Pages, but hasn't been scoped yet.

## Integration with RootLink (future, not started)

Deliberately deferred until this tool is built and used for real. Options on the table
at that point: RootLink's frontend fetches copy/tokens/templates from this tool's API,
a one-way sync into RootLink's existing `copy_override`/`content_ui_override` tables, or
this tool and the platform's existing lightweight inline editor simply coexist for
different purposes. The `preview-site/` clone is a stand-in for this decision, not a
pre-commitment to any one of these paths -- see its own README.
