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

export interface RsvpReminderEmailProps {
  guestName: string;
  coupleNames: string;
  weddingDate: string | null;
  rsvpUrl: string;
  eventNames: string[];
}

export function RsvpReminderEmail({
  guestName,
  coupleNames,
  weddingDate,
  rsvpUrl,
  eventNames,
}: RsvpReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Please RSVP for {coupleNames}&apos;s wedding</Preview>
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
            RSVP Reminder
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

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            We noticed you haven&apos;t yet responded to the wedding invitation
            from {coupleNames}
            {weddingDate ? ` on ${weddingDate}` : ""}.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              marginBottom: "8px",
            }}
          >
            You&apos;re invited to:
          </Text>

          <ul
            style={{
              paddingLeft: "20px",
              marginBottom: "24px",
            }}
          >
            {eventNames.map((name) => (
              <li
                key={name}
                style={{
                  fontSize: "16px",
                  color: "#374151",
                  lineHeight: "1.8",
                }}
              >
                {name}
              </li>
            ))}
          </ul>

          <Text
            style={{
              fontSize: "16px",
              color: "#374151",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            Please take a moment to let them know if you can attend:
          </Text>

          <Section
            style={{
              textAlign: "center" as const,
              margin: "32px 0",
            }}
          >
            <Button
              href={rsvpUrl}
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
              RSVP Now
            </Button>
          </Section>

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
            If you have any questions, please contact the couple directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
