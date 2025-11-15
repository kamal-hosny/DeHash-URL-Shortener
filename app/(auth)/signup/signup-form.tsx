"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/validations/auth";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import FormFields from "@/components/molecules/form-fields/form-fields";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema()),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      try {
        console.log("Signup data:", data);

        // TODO: send to API
        // router.push("/dashboard");

      } catch (error: any) {
        setError("root", {
          type: "server",
          message: error.message || "Something went wrong",
        });
      }
    },
    [router, setError]
  );

  const formFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text" as const,
      placeholder: "Enter your name",
      error: errors.name?.message
        ? { name: [errors.name.message] }
        : undefined,
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "Enter your email",
      error: errors.email?.message
        ? { email: [errors.email.message] }
        : undefined,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "••••••••",
      error: errors.password?.message
        ? { password: [errors.password.message] }
        : undefined,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "••••••••",
      error: errors.confirmPassword?.message
        ? { confirmPassword: [errors.confirmPassword.message] }
        : undefined,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
      {formFields.map((field) => (
        <FormFields key={field.name} {...field} control={control} />
      ))}

      {errors.root && (
        <div className="text-red-500 text-sm text-center">
          {errors.root.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
