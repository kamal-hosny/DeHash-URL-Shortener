"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/validations/auth";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import FormFields from "@/components/molecules/form-fields/form-fields";
import { signupAction, type SignupActionInput } from "./actions";

type SignupFormData = SignupActionInput;

export default function SignupForm() {
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
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
      clearErrors();
      try {
        const result = await signupAction(data);

        if (!result.success) {
          if (result.validationError) {
            Object.entries(result.validationError).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                setError(field as keyof SignupFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }

          setError("root", {
            type: "server",
            message:
              result.message ||
              "We couldn't create your account. Please try again.",
          });
          return;
        }

        router.push("/signin?success=account-created");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";

        setError("root", {
          type: "server",
          message,
        });
      }
    },
    [clearErrors, router, setError]
  );

  const getFieldError = (field: keyof SignupFormData) => {
    const message = errors[field]?.message;

    if (!message) return undefined;

    return {
      [field]: [message],
    };
  };

  const formFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text" as const,
      placeholder: "Enter your name",
      error: getFieldError("name"),
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "Enter your email",
      error: getFieldError("email"),
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "••••••••",
      error: getFieldError("password"),
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "••••••••",
      error: getFieldError("confirmPassword"),
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
