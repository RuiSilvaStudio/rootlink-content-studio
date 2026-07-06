# RootLink Preview Site (clone)

A visual clone of RootLink's real public frontend — **marketing pages only, no
backend/database** — used as the live-preview render target for Content Studio.
This is explicitly prototype/throwaway scaffolding (see the repo root README's
"Integration with RootLink" section): it exists so Content Studio's editors can
preview against something that actually looks like the real site, instead of a
hand-built approximation.

## Tailwind version: v4, intentionally different from the real site

RootLink's real frontend (`rootlink/frontend`) runs **Tailwind v3.4.19**. This clone
was upgraded to **v4** on purpose (`npx @tailwindcss/upgrade`, then hand-fixed --
see the big comment on `@theme` in `globals.css`) because v4's native CSS-variable
theming is a meaningfully better fit for Content Studio's runtime color overrides
than v3's manual pattern, and this clone is low-risk/disposable enough to not need
to match the real site's *build system*, only its *visual output*. Verified via
Playwright screenshots (light, dark, mobile) that the output is still pixel-faithful
after the upgrade, and confirmed the Payload -> live color override loop still
works end to end. The real `rootlink/frontend`'s own v3->v4 upgrade is a separate,
bigger, not-yet-made decision (like Next 14->15 in that repo's own TECH_DEBT.md).

If you touch `globals.css`'s color setup, read the comment on `@theme` first --
there's a specific reason the runtime-overridable source variables are named
`--rl-*` and not `--color-*` (naming them the same causes a silent self-reference
that breaks every color on the page; this bit us once already, from the
auto-migration tool's naive handling of the v3 setup it replaced).

## What's here vs. what's real

- **Copied close to verbatim** from `rootlink/frontend` (the real platform repo):
  `app/globals.css` (fonts, non-color utility classes, keyframes -- colors were
  reworked for v4, see above), `messages/{en,pt}.json`,
  `components/ui/{Button,Badge,Card,StatCounter,HeroParticleCanvas,LoadingSkeleton}.tsx`,
  `components/nav/{NavConfig,DesktopDropdown}.tsx`. (There's no `tailwind.config.ts`
  anymore -- v4 configures via CSS, not a JS file.)
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

No database required directly -- it's static content-wise, but it does fetch two
things from Content Studio at runtime (`http://localhost:3010` by default, override
via `NEXT_PUBLIC_CONTENT_STUDIO_URL`): marketing copy overrides
(`lib/locale-context.tsx`) and the active theme's color palette
(`lib/theme-vars.ts` + `components/ThemeVarsInjector.tsx`). If Content Studio isn't
running, both fail silently and you just get RootLink's real bundled
defaults -- this never hard-depends on Content Studio being up.

## Runtime color theming (the actual point of this clone)

`globals.css`'s `@theme` block maps `primary`/`earth`/`rust`/`cream` to `--rl-*`
source variables (also defined in `globals.css`, defaulted to RootLink's exact real
hex values). Tailwind v4 exposes every `@theme` color as a real native CSS variable
and natively supports opacity-modifier classes (`bg-primary-100/60`) on any color
format via `color-mix()`, so there's no manual RGB-triplet/`<alpha-value>` wrapper
needed anymore (that was a v3-only requirement). `ThemeVarsInjector` fetches the
active Theme from Content Studio on page load and overrides the `--rl-*` variables
directly. Change a color in Payload's Theme editor, refresh this app, and every real
`primary-*`/`earth-*`/`rust-*` class site-wide actually changes -- no rebuild. This
is "refresh to see the latest *saved* theme," not keystroke-level live preview (that
would need a cross-origin postMessage bridge, not built yet).

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
