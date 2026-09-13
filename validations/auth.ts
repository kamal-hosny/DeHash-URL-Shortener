import * as z from "zod";

export const loginSchema = () => {
  return z.object({
    email: z.string().trim().email({
      message: "Invalid email address",
    }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(40, { message: "Password must be at most 40 characters long" }),
  });
};


export type ValidationErrors =
  | {
      [key: string]: string[];
    }
  | undefined;



  
export const signupSchema = () =>
  z
    .object({
      name: z.string().min(2, "Name is too short"),
      email: z.string().email("Invalid email"),
     password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(40, { message: "Password must be at most 40 characters long" }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });