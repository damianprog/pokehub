# Auth Setup — NextAuth v5 + GitHub Provider (PokeHub)

## Overview

Set up NextAuth v5 with the Prisma adapter and GitHub OAuth for PokeHub. Use **database sessions** (an explicit PokeHub decision — not JWT). Test against NextAuth's default sign-in page; the existing Zustand login modal is wired in a later spec. Username onboarding and the username gate are **out of scope here** (next spec).

## Requirements

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Configure a single `auth.ts` with the Prisma adapter and the GitHub provider (no split-config / no forced JWT — see Gotchas)
- Use **database session strategy** (the adapter default — do not set `session.strategy`)
- Expose `user.id` and `user.username` on the session object
- Protect `/settings/*` and `/packs/*` using the Next.js 16 proxy
- Redirect unauthenticated users hitting protected routes to sign-in

## Files to Create

1. `src/auth.ts` — Full config: `PrismaAdapter(prisma)`, GitHub provider, and a `session` callback that copies `user.id` and `user.username` onto the session. No `session.strategy` (defaults to `"database"` because an adapter is present).
2. `src/app/api/auth/[...nextauth]/route.ts` — Re-export the route handlers: `export const { GET, POST } = handlers`.
3. `src/proxy.ts` — Route protection. Wrap `auth` from `@/auth`; if the path starts with `/settings` or `/packs` and there is no session, redirect to sign-in. Named export `proxy` + a `config.matcher`.
4. `src/types/next-auth.d.ts` — Extend the `Session["user"]` type with `id: string` and `username: string | null`.

> Reuse the existing Prisma singleton (`src/lib/db.ts` / wherever the project already exports it). Do not create a second `PrismaClient`.
> The NextAuth models (`Account`, `Session`, `VerificationToken`, `User`) already exist in the schema and match the adapter contract — no migration needed for this spec.

## Key Gotchas

Use Context7 to verify the newest config and conventions before implementing.

- Use `next-auth@beta` — `@latest` still installs v4 (4.24.x). Confirmed as of 2026.
- Use `@auth/prisma-adapter` (the `@auth/*` scope), **not** the old `@next-auth/*` package.
- **Do NOT set `session: { strategy: "jwt" }`.** PokeHub uses database sessions on purpose (instant server-side logout, per-device session listing). Setting JWT silently reverts that architectural decision. Leave `session` unset so the adapter defaults to `"database"`.
- **No split-config / edge workaround needed.** Most v5 tutorials split into `auth.config.ts` + `auth.ts` and force JWT so the proxy can check auth at the edge without a DB call. In Next.js 16 the proxy runs on the **Node.js runtime**, so a database-session lookup inside `proxy.ts` is fine. Keep a single `auth.ts`.
- The `session` callback receives **`user`** (the DB row), **not** `token`, under the database strategy. Populate `session.user.id` / `session.user.username` from `user`. (Under JWT it would be `token` — that's the wrong branch here.)
- The `user` passed to the `session` callback is typed as `AdapterUser`, which doesn't know about the custom `username` field. At runtime it's the Prisma row and has it — for TypeScript, augment `AdapterUser` in `next-auth.d.ts` or cast when reading `user.username`.
- `proxy.ts` lives at `src/proxy.ts` (same level as `app/`), must use a **named export** `proxy` (or a default) — Next.js 16 rejects the old `export { auth as middleware }` pattern.
- Do **not** set a custom `pages.signIn` in this spec. Use NextAuth's default sign-in page for testing; the custom modal is a later spec.
- Protected routes here are `/settings/*` and `/packs/*` (PokeHub routing), not `/dashboard`. Public routes (`/`, `/p/[slug]`, `/u/[username]`, `/discover`, `/search`) stay open.

## Environment Variables

```
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

- `AUTH_*` prefix (v5) — supersedes the `NEXTAUTH_*` names in the older project-overview draft.
- With `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`, the GitHub provider auto-infers credentials — no `clientId`/`clientSecret` wiring in config.
- `DATABASE_URL` (pooled) and `DIRECT_URL` (migrations) already exist — unchanged.
- GitHub OAuth App callback URL: `http://localhost:3000/api/auth/callback/github` (use a separate OAuth App for prod).

## Testing

1. Visit `/settings` while logged out → should redirect to the sign-in page.
2. Click "Sign in with GitHub" → complete OAuth.
3. Verify redirect back and an authenticated state.
4. Inspect Neon: exactly one `User`, one `Account`, and one `Session` row created for the new login.
5. In any Server Component, `await auth()` returns `session.user.id` (and `session.user.username`, which is `null` until onboarding exists).
6. Sign out → the `Session` row is deleted (confirms database sessions, not JWT).

## Out of Scope (next specs)

- **Username onboarding**: `/signup/username` page, format validation (3–20, `^[a-z0-9_-]+$`, reserved list), `setUsername` server action, and the proxy gate redirecting `username === null` users. Extends `src/proxy.ts`.
- **Wiring the Zustand login modal** to `signIn("github")` via a server action.
- **Google provider / email magic link.**

## References

- Migrating to v5: https://authjs.dev/getting-started/migrating-to-v5
- Prisma adapter: https://authjs.dev/getting-started/adapters/prisma
- Edge compatibility (Next.js 16 proxy runtime note): https://authjs.dev/guides/edge-compatibility
