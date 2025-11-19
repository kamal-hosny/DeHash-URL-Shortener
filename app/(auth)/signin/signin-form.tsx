"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth";
import FormFields from "@/components/molecules/form-fields/form-fields";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema()),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.validationError) {
            // Handle validation errors
            Object.entries(errorData.validationError).forEach(([field, messages]) => {
              setError(field as keyof LoginFormData, {
                type: "server",
                message: Array.isArray(messages) ? messages[0] : String(messages),
              });
            });
          } else if (errorData.responseError) {
            setError("root", {
              type: "server",
              message: errorData.responseError,
            });
          }
        } catch {
          // If error is not JSON, show it directly
          setError("root", {
            type: "server",
            message: result.error,
          });
        }
        return;
      }

      // Login successful - redirect to dashboard
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh(); // Refresh to update session
      }
      
    } catch (error: any) {
      setError("root", {
        type: "server",
        message: error.message || "Something went wrong",
      });
    }
  }, [router, setError]);

  const formFields = [
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "Enter your email",
      error: errors.email?.message ? { 
        email: [errors.email.message],
        password: [] 
      } : undefined,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "••••••••",
      error: errors.password?.message ? { 
        password: [errors.password.message],
        email: [] 
      } : undefined,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
      {formFields.map((field) => (
        <FormFields
          key={field.name}
          {...field}
          control={control}
        />
      ))}

      {errors.root && (
        <div className="text-red-500 text-sm text-center">
          {errors.root.message}
        </div>
      )}

      <div className="flex justify-end">
        <a 
          href="/forgot-password" 
          className="text-blue-500 hover:underline text-xs lg:text-sm"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
