import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
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
    <Body style={main}>
      <Container style={container}>
        {/* Header with gradient background */}
        <Section style={header}>
          <Heading style={siteName}>DeHash</Heading>
          <Text style={headerSubtitle}>Contact Form Submission</Text>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h1}>✉️ New Message Received</Heading>
          
          <Text style={introText}>
            You have received a new contact form submission with the following details:
          </Text>

          {/* Contact Information Card */}
          <Section style={infoCard}>
            <Section style={infoRow}>
              <Text style={infoLabel}>👤 Full Name</Text>
              <Text style={infoValue}>{firstName} {lastName}</Text>
            </Section>
            
            <Hr style={divider} />
            
            <Section style={infoRow}>
              <Text style={infoLabel}>📧 Email Address</Text>
              <Text style={infoValue}>{email}</Text>
            </Section>
            
            {phone && (
              <>
                <Hr style={divider} />
                <Section style={infoRow}>
                  <Text style={infoLabel}>📱 Phone Number</Text>
                  <Text style={infoValue}>{phone}</Text>
                </Section>
              </>
            )}
            
            <Hr style={divider} />
            
            <Section style={infoRow}>
              <Text style={infoLabel}>📋 Subject</Text>
              <Text style={infoValue}>{subject}</Text>
            </Section>
          </Section>

          {/* Message Section */}
          <Section style={messageContainer}>
            <Text style={messageLabel}>💬 Message Content</Text>
            <Section style={messageBox}>
              <Text style={messageContent}>{message}</Text>
            </Section>
          </Section>

          {/* Call to action */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Please respond to this inquiry at your earliest convenience.
            </Text>
          </Section>
        </Section>

        {/* Footer */}
        <Hr style={footerDivider} />
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} DeHash. All rights reserved.
          </Text>
          <Text style={footerSubtext}>
            This email was sent from your website contact form
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f4f7fa",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  borderRadius: "8px",
  overflow: "hidden",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
};

const header = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "40px 48px",
  textAlign: "center" as const,
};

const siteName = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0 0 8px 0",
  letterSpacing: "1px",
};

const headerSubtitle = {
  fontSize: "14px",
  color: "#e0e7ff",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const content = {
  padding: "40px 48px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 8px 0",
};

const introText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 24px 0",
};

const infoCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
  border: "1px solid #e5e7eb",
};

const infoRow = {
  marginBottom: "0",
};

const infoLabel = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const infoValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0",
  lineHeight: "24px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const messageContainer = {
  marginTop: "24px",
};

const messageLabel = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const messageBox = {
  backgroundColor: "#fff",
  border: "2px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  borderLeft: "4px solid #667eea",
};

const messageContent = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const ctaSection = {
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  borderLeft: "4px solid #f59e0b",
};

const ctaText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
  fontWeight: "500",
};

const footerDivider = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer = {
  padding: "32px 48px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
};

const footerText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 4px 0",
  fontWeight: "500",
};

const footerSubtext = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
};