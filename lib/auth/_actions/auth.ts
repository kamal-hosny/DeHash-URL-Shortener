import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { User, UserRole } from "@/types";

type LoginCredentials = {
  email?: string;
  password?: string;
};

type LoginResponse = {
  status: number;
  user?: User;
  error?: Record<string, string[]>;
  message?: string;
};

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    if (!credentials?.email || !credentials?.password) {
      return {
        status: 400,
        error: {
          email: ["Email is required"],
          password: ["Password is required"],
        },
        message: "Missing email or password",
      };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, credentials.email),
    });

    if (!user) {
      return {
        status: 401,
        error: {
          email: ["No user found with this email"],
        },
        message: "Invalid credentials",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        status: 401,
        error: {
          password: ["Invalid password"],
        },
        message: "Invalid credentials",
      };
    }

    // Update last activity
    await db
      .update(users)
      .set({ lastActivity: new Date() })
      .where(eq(users.id, user.id));

    const userRole: UserRole = user.isAdmin ? "ADMIN" : "USER";

    return {
      status: 200,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan as "FREE" | "PRO",
        isAdmin: user.isAdmin ?? false,
        createdAt: user.createdAt,
        lastActivity: user.lastActivity,
        role: userRole,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: 500,
      message: "An error occurred during login",
    };
  }
}