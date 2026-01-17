import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Preview,
  Hr,
} from "@react-email/components";

export interface BroadcastEmailProps {
  guestName: string;
  coupleNames: string;
  subject: string;
  content: string; // Plain text content (newlines converted to paragraphs)
  ctaText?: string;
  ctaUrl?: string;
}

export function BroadcastEmail({
  guestName,
  coupleNames,
  subject,
  content,
  ctaText,
  ctaUrl,
}: BroadcastEmailProps) {
  // Split content by newlines and render as paragraphs
  const paragraphs = content.split("\n").filter((p) => p.trim());

  return (
    <Html>
      <Head />
      <Preview>
        {subject} - A message from {coupleNames}
      </Preview>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f4f4",
          padding: "20px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "8px",
          }}
        >
          <Heading
            as="h1"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "24px",
            }}
          >
            {subject}
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Dear {guestName},
          </Text>

          {paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={{
                fontSize: "16px",
                color: "#374151",
                lineHeight: "1.6",
                marginBottom: "16px",
              }}
            >
              {paragraph}
            </Text>
          ))}

          {ctaText && ctaUrl && (
            <Section
              style={{
                textAlign: "center" as const,
                margin: "32px 0",
              }}
            >
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: "#22c55e",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                {ctaText}
              </Button>
            </Section>
          )}

          <Hr
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text
            style={{
              fontSize: "12px",
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >
            This message was sent by {coupleNames}. If you have any questions,
            please contact them directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
