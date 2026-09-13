"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth";
import FormFields from "@/components/molecules/form-fields/form-fields";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuthDispatch, useAuthError, useAuthStatus } from "@/store/authStore";
import type { User as SessionUser } from "@/types";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAuthDispatch();
  const status = useAuthStatus();
  const authError = useAuthError();
  const isAuthLoading = status === "loading";
  
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
    dispatch({ type: "START_AUTH" });
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        let message = result.error;
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.validationError) {
            Object.entries(errorData.validationError).forEach(([field, messages]) => {
              setError(field as keyof LoginFormData, {
                type: "server",
                message: Array.isArray(messages) ? messages[0] : String(messages),
              });
            });
          }
          if (errorData.responseError) {
            message = errorData.responseError;
            setError("root", {
              type: "server",
              message,
            });
          }
        } catch {
          setError("root", {
            type: "server",
            message,
          });
        }
        dispatch({ type: "FAIL_AUTH", payload: message });
        return;
      }

      if (result?.ok) {
        const sessionResponse = await fetch("/api/auth/session");
        const sessionData = sessionResponse.ok ? await sessionResponse.json() : null;
        const sessionUser = (sessionData?.user || null) as SessionUser | null;

        if (sessionUser) {
          dispatch({ type: "RESOLVE_AUTH", payload: sessionUser });
        } else {
          dispatch({ type: "HYDRATE", payload: null });
        }

        router.push("/dashboard");
      }
      
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      dispatch({ type: "FAIL_AUTH", payload: message });
      setError("root", {
        type: "server",
        message,
      });
    }
  }, [dispatch, router, setError]);

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

      {(errors.root || authError) && (
        <div className="text-red-500 text-sm text-center">
          {errors.root?.message || authError}
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
        disabled={isSubmitting || isAuthLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting || isAuthLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
