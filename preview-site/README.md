# RootLink Preview Site (clone)

A visual clone of RootLink's real public frontend — **marketing pages only, no
backend/database** — used as the live-preview render target for Content Studio.
This is explicitly prototype/throwaway scaffolding (see the repo root README's
"Integration with RootLink" section): it exists so Content Studio's editors can
preview against something that actually looks like the real site, instead of a
hand-built approximation.

## What's here vs. what's real

- **Copied close to verbatim** from `rootlink/frontend` (the real platform repo):
  `tailwind.config.ts`, `app/globals.css`, `messages/{en,pt}.json`,
  `components/ui/{Button,Badge,Card,StatCounter,HeroParticleCanvas,LoadingSkeleton}.tsx`,
  `components/nav/{NavConfig,DesktopDropdown}.tsx`.
- **Simplified clones** (same visual output for a logged-out visitor, real
  backend/auth machinery removed): `app/layout.tsx`, `app/page.tsx` (homepage),
  `components/nav/{NavBar,MobileNav,MobileBottomBar}.tsx`, `components/Footer.tsx`,
  `lib/locale-context.tsx`. Removed: `AuthProvider`, `ToastProvider`,
  `EditorModeProvider`, notification SSE/polling, moon-phase widget, create menu,
  profile dropdown, `/api/copy` override fetch -- all of these only do anything for
  a logged-in user or a super_admin in RootLink's own (separate) inline editor, and
  this clone is logged-out-only by design.
- **Static sample data** in `app/page.tsx` (`SAMPLE_STATS`, `SAMPLE_FAMILIES`,
  `SAMPLE_RECENT`) stands in for the real API calls (`api.content.recent()`,
  `api.content.publicStats()`, `api.taxonomy.families()`). Chosen to match what's
  live on rootlink.ruisilvastudio.com today for visual comparison, not because
  they're meaningful data.

## Why Next.js 14, not 16

Deliberately pinned to match `rootlink/frontend`'s real version (`next@^14.2.0`)
for maximum fidelity, even though Content Studio's own Payload app runs Next 16.
Running two major Next versions side by side in one repo is unusual but
intentional here -- if the version numbers ever cause a real problem, revisit,
but don't casually "upgrade to match" without checking `rootlink/frontend`'s
actual version first.

## Running it

```bash
npm install
npm run dev   # http://localhost:3011
```

No database, no env vars, no other services required -- it's fully static.

## Verified fidelity

Compared side-by-side against the real production homepage
(`rootlink.ruisilvastudio.com`) in light mode, dark mode, and mobile (drawer +
bottom bar) via Playwright screenshots during development. Matches closely;
the only intentional difference is placeholder images instead of real photos
(no media backend here).

## What happens to this later

Per the repo root README: this clone is a means to an end, not a permanent
artifact. Once Content Studio's editing UX is proven out against it, a
separate decision gets made about how (or whether) real integration with
`rootlink/` happens -- this folder may be discarded, replaced by real API
wiring, or kept as a design-review sandbox. Don't assume it needs to be
maintained in lockstep with `rootlink/frontend` beyond that point.
