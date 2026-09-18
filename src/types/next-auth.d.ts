import type { DefaultSession } from "next-auth";
import type { AdapterUser as DefaultAdapterUser } from "next-auth/adapters";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /**
       * Non-null by invariant, not by schema: `proxy.ts` redirects (or 403s)
       * every signed-in request without a username to `/signup/username`
       * before any app code runs. Only the gate-exempt surfaces can observe
       * `null` here at runtime — `/signup/username` (the page, and the
       * root-layout `Nav` rendered on it) and `/api/auth/*` — and those must
       * keep treating the value as possibly-null.
       */
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultAdapterUser {
    username: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string | null;
  }
}
