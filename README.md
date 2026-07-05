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

## Roles

- **owner** — full access, including creating/editing other users and changing roles.
- **editor** — can access the admin panel and manage content, but cannot manage user
  accounts or change their own role (prevents self-escalation).

The very first user created via `/admin` is exempt from these rules (Payload's
built-in "create first user" bootstrap) and becomes an owner.

## Deployment

Not yet deployed. Planned: an isolated Docker container + Postgres on the same
home server RootLink's backend runs on (`192.168.1.228`), under its own subdomain,
fully separate compose stack/network/volumes from `rootlink/docker-compose.prod.yml`.
This will be documented here once set up (see `rootlink/DEPLOY.md` for the pattern
used on the platform side).

## Integration with RootLink (future, not started)

Deliberately deferred until this tool is built and used for real. Options on the table
at that point: RootLink's frontend fetches copy/tokens/templates from this tool's API,
a one-way sync into RootLink's existing `copy_override`/`content_ui_override` tables, or
this tool and the platform's existing lightweight inline editor simply coexist for
different purposes.
