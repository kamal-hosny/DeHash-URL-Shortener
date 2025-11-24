import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const ContactFormEmail: React.FC<Readonly<ContactFormEmailProps>> = ({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}) => (
  <Html>
    <Head />
    <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f4" }}>
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          margin: "40px auto",
        }}
      >
        <Heading style={{ color: "#000", marginBottom: "20px" }}>
          New Contact Form Submission
        </Heading>

        <Section style={{ marginBottom: "20px" }}>
          <Text style={{ margin: "5px 0", color: "#333" }}>
            <strong>Name:</strong> {firstName} {lastName}
          </Text>
          <Text style={{ margin: "5px 0", color: "#333" }}>
            <strong>Email:</strong> {email}
          </Text>
          {phone && (
            <Text style={{ margin: "5px 0", color: "#333" }}>
              <strong>Phone:</strong> {phone}
            </Text>
          )}
          <Text style={{ margin: "5px 0", color: "#333" }}>
            <strong>Subject:</strong> {subject}
          </Text>
        </Section>

        <Section
          style={{
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <Text style={{ color: "#333" }}>
            <strong>Message:</strong>
          </Text>
          <Text style={{ whiteSpace: "pre-wrap", color: "#333" }}>
            {message}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
