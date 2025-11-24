import { contactSchema } from "@/validations/contact";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactFormEmail } from "@/components/email/ContactFormEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validationResult = contactSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validationResult.error.format(),
      },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, subject, message } =
    validationResult.data;

  // Construct JSX outside try/catch to avoid React rendering errors being uncaught
  const emailElement = (
    <ContactFormEmail
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={phone}
      subject={subject}
      message={message}
    />
  );

  try {
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      replyTo: email,
      subject: `New Contact: ${subject}`,
      react: emailElement,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
