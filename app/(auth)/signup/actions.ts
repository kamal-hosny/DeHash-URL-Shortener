"use server";

import { signupSchema } from "@/validations/auth";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type SignupActionInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupActionResult = {
  success: boolean;
  message?: string;
  validationError?: Record<string, string[]>;
};

export async function signupAction(
  data: SignupActionInput
): Promise<SignupActionResult> {
  try {
    const parsed = signupSchema().safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid data",
        validationError: parsed.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const db = getDb();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
        validationError: {
          email: ["Email is already registered"],
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Signup server action error:", error);
    return {
      success: false,
      message: "Something went wrong while creating your account",
    };
  }
}

