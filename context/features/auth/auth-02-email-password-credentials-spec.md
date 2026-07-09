# Auth Credentials - Email/Password Provider

## Overview
Add Credentials provider for email/password authentication with registration.

## Requirements
- Use bcryptjs for hashing (already installed)
- `User.password` already exists in the schema and is already migrated in — no migration needed
- Add a Credentials provider to the existing single `auth.ts` with bcrypt validation logic
- Switch `session.strategy` to `"jwt"` for the whole app (see Session Strategy Change below)
- Create registration API route at `/api/auth/register`

## Registration API Route
`POST /api/auth/register`
- Accept: name, email, password, confirmPassword
- Validate passwords match
- Check if user already exists
- Hash password with bcryptjs
- Create user in database
- Return success/error response

## Session Strategy Change: Database → JWT
Auth.js does not support the Credentials provider under database sessions — with a Prisma adapter present and no explicit `session.strategy`, session strategy defaults to `"database"`, and credentials sign-ins then silently fail to set a session (no error, no cookie, user appears to sign in but isn't authenticated). This is a hard restriction, not a config oversight.

Resolution: set `session: { strategy: "jwt" }` explicitly in `auth.ts`. This applies to the entire app, not just credentials sign-ins — GitHub OAuth sessions become JWT-based too, since Auth.js has one session strategy per app, not per provider.

This reverses the explicit database-session decision from auth-01 / project-overview §14. Consequences, accepted knowingly:
- The `Session` table stays empty. The Prisma adapter still persists `User`, `Account`, and `VerificationToken` rows; the session itself now lives in a signed, encrypted, HttpOnly JWT cookie.
- Instant server-side logout and per-device session listing — the original reason for choosing database sessions — are no longer available without extra work (e.g. a server-side token blocklist).
- Add a `jwt` callback in `auth.ts` to carry `id`/`username` onto the token (population happens once, on sign-in, from the `user` param), and update the `session` callback to read from `token` instead of `user`.
- `src/types/next-auth.d.ts` needs a `next-auth/jwt` module augmentation for `token.id` / `token.username`, in addition to the existing `Session` and `AdapterUser` augmentations.

## Notes
### Credentials Provider — Single-File Pattern
- Keep the single `auth.ts` established in auth-01 (no `auth.config.ts` split) — the Next.js 16 proxy runs on the Node.js runtime, so there's no edge-runtime reason to split config.
- Add the Credentials provider directly to `auth.ts` with its real bcrypt `authorize` logic

## Testing
1. Test registration via curl:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","confirmPassword":"password123"}'
```
2. Go to `/api/auth/signin`
3. Sign in with email/password
4. Verify redirect to `/` with an authenticated state — check the `authjs.session-token` cookie and `GET /api/auth/session`, not the `Session` table (it stays empty under JWT strategy; see Session Strategy Change above)
5. Verify GitHub OAuth still works (also produces a JWT session now, not a `Session` row)

## References
- Credentials provider: https://authjs.dev/getting-started/authentication/credentials