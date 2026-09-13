import { DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { login } from "./_actions/auth";
import { Pages, Routes, Environments } from "@/constants/enums";
import { User, UserRole } from "@/types";

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
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        const userData = user as User;
        token.id = userData.id;
        token.name = userData.name || "";
        token.email = userData.email || "";
        token.role = userData.role || (userData.isAdmin ? "ADMIN" : "USER");
        token.subscriptionPlan = userData.subscriptionPlan;
        token.isAdmin = userData.isAdmin;
        token.image = undefined;
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