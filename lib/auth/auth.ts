import { DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { login } from "./_actions/auth";
import { Pages, Routes, Environments } from "@/constants/enums";
import { User, UserRole } from "@/types";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & {
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
    subscriptionPlan: "FREE" | "PRO";
    isAdmin: boolean;
  }
}

function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.subscriptionPlan = token.subscriptionPlan;
        session.user.isAdmin = token.isAdmin;

        if (token.email && (token.email.toLowerCase() === "ixonhosny@gmail.com" || process.env.ADMIN_EMAIL?.toLowerCase() === token.email.toLowerCase())) {
          session.user.isAdmin = true;
          session.user.role = "ADMIN";
        }
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        const userData = user as User;
        token.id = userData.id;
        token.name = userData.name || "";
        token.email = userData.email || "";
        token.role = userData.role || (userData.isAdmin ? "ADMIN" : "USER");
        token.subscriptionPlan = userData.subscriptionPlan || "FREE";
        token.isAdmin = userData.isAdmin || false;
        token.image = undefined;
      }

      if (token.email && (token.email.toLowerCase() === "ixonhosny@gmail.com" || process.env.ADMIN_EMAIL?.toLowerCase() === token.email.toLowerCase())) {
        token.isAdmin = true;
        token.role = "ADMIN";
      }

      // If token.id is not a valid UUID (e.g. OAuth provider ID like Google's "106446765328083223021")
      // or if signing in with an OAuth provider, resolve or sync the user in Neon DB so token.id is a valid UUID.
      if (token.email && (!isValidUUID(token.id) || (account && account.provider !== "credentials"))) {
        try {
          const db = getDb();
          const normalizedEmail = token.email.toLowerCase().trim();

          let dbUser = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
          });

          if (!dbUser) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            const [newUser] = await db
              .insert(users)
              .values({
                name: token.name || normalizedEmail.split("@")[0] || "User",
                email: normalizedEmail,
                password: randomPassword,
                subscriptionPlan: "FREE",
                isAdmin: false,
              })
              .returning();
            dbUser = newUser;
          } else {
            // Update last activity
            await db
              .update(users)
              .set({ lastActivity: new Date() })
              .where(eq(users.id, dbUser.id));
          }

          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.subscriptionPlan = (dbUser.subscriptionPlan as "FREE" | "PRO") || "FREE";
            token.isAdmin = dbUser.isAdmin ?? false;
            token.role = dbUser.isAdmin ? "ADMIN" : "USER";
          }
        } catch (err) {
          console.error("Neon DB OAuth sync error:", err);
        }
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === Environments.DEV,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error("Missing credentials");
        }
        const res = await login(credentials);
        
        if (res.status === 200 && res.user) {
          return {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            subscriptionPlan: res.user.subscriptionPlan,
            isAdmin: res.user.isAdmin,
            image: null,
          };
        } else {
          throw new Error(
            JSON.stringify({
              validationError: res.error,
              responseError: res.message,
            })
          );
        }
      },
    }),
  ],
  pages: {
    signIn: `/${Routes.AUTH}/${Pages.SIGNIN}`,
  },
};