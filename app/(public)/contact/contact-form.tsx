"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactSchema } from "@/validations/contact";
import { InputTypes } from "@/constants/enums";
import FormFields from "@/components/molecules/form-fields/form-fields";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactSchema) => {
    setLoading(true);
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "Success",
        description: "Your message has been sent successfully!",
      });

      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorForField = (fieldName: keyof ContactSchema) => {
    const fieldError = errors[fieldName];
    if (!fieldError?.message) return undefined;
    return {
      [fieldName]: [fieldError.message],
    };
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <FormFields
        label="First Name"
        name="firstName"
        type={InputTypes.TEXT}
        placeholder="John"
        control={control}
        error={getErrorForField("firstName")}
      />

      <FormFields
        label="Last Name"
        name="lastName"
        type={InputTypes.TEXT}
        placeholder="Doe"
        control={control}
        error={getErrorForField("lastName")}
      />

      <FormFields
        label="Email"
        name="email"
        type={InputTypes.EMAIL}
        placeholder="email@example.com"
        control={control}
        error={getErrorForField("email")}
      />

      <FormFields
        label="Phone Number"
        name="phone"
        type={InputTypes.TEXT}
        placeholder="+1 012 3456 789"
        control={control}
        error={getErrorForField("phone")}
      />

      {/* Subject */}
      <div className="md:col-span-2 space-y-3">
        <p className="text-foreground font-medium">Select Subject?</p>

        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-6">
              {["General Inquiry", "Support", "Feedback", "Other"].map(
                (item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={item}
                      checked={field.value === item}
                      onChange={() => field.onChange(item)}
                      onBlur={field.onBlur}
                    />
                    <span>{item}</span>
                  </label>
                )
              )}
            </div>
          )}
        />

        {errors.subject && (
          <p className="text-destructive text-sm">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <FormFields
        label="Message"
        name="message"
        type={InputTypes.TEXTAREA}
        placeholder="Write your message..."
        control={control}
        error={getErrorForField("message")}
        className="md:col-span-2"
      />

      {/* Submit */}
      <div className="md:col-span-2 flex justify-end mt-6">
        <button
          className="bg-primary text-primary-foreground px-10 py-3 rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
