import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { EMAIL_VERIFICATION_REQUIRED } from "@/lib/email-verification";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (!user?.password) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
          return null;
        }

        if (EMAIL_VERIFICATION_REQUIRED && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const { password: _password, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { username: true },
        });
        token.username = dbUser?.username ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      return session;
    },
  },
});
