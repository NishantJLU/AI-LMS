import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
    ...((process.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.AUTH_GOOGLE_CLIENT_SECRET)
      ? [
          Google({
            clientId:
              process.env.AUTH_GOOGLE_ID ?? process.env.AUTH_GOOGLE_CLIENT_ID!,
            clientSecret:
              process.env.AUTH_GOOGLE_SECRET ?? process.env.AUTH_GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...((process.env.AUTH_GITHUB_ID || process.env.AUTH_GITHUB_CLIENT_ID) &&
    (process.env.AUTH_GITHUB_SECRET || process.env.AUTH_GITHUB_CLIENT_SECRET)
      ? [
          GitHub({
            clientId:
              process.env.AUTH_GITHUB_ID ?? process.env.AUTH_GITHUB_CLIENT_ID!,
            clientSecret:
              process.env.AUTH_GITHUB_SECRET ?? process.env.AUTH_GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const u = await db.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true },
        });
        if (u) {
          token.id = u.id;
          token.role = u.role;
        }
      } else if (token?.id && !token.role) {
        const u = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (u) token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "STUDENT";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

