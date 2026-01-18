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
  Img,
} from "@react-email/components";

export interface InvitationEmailProps {
  guestName: string;
  coupleNames: string;
  eventName: string;
  eventDate: string | null;
  eventLocation: string | null;
  rsvpUrl: string;
  personalMessage?: string;
}

export function InvitationEmail({
  guestName,
  coupleNames,
  eventName,
  eventDate,
  eventLocation,
  rsvpUrl,
  personalMessage,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re invited to {coupleNames}&apos;s {eventName}</Preview>
      <Body
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          backgroundColor: "#faf9f7",
          padding: "40px 20px",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Decorative Header */}
          <Section
            style={{
              backgroundColor: "#c9a962",
              padding: "32px 40px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                letterSpacing: "4px",
                color: "#ffffff",
                margin: "0",
                textTransform: "uppercase" as const,
              }}
            >
              You&apos;re Invited
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ padding: "48px 40px" }}>
            <Heading
              as="h1"
              style={{
                fontSize: "32px",
                fontWeight: "normal",
                color: "#3d3936",
                marginBottom: "8px",
                textAlign: "center" as const,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              {coupleNames}
            </Heading>

            <Text
              style={{
                fontSize: "14px",
                letterSpacing: "2px",
                color: "#c9a962",
                margin: "0 0 32px",
                textAlign: "center" as const,
                textTransform: "uppercase" as const,
              }}
            >
              {eventName}
            </Text>

            <Text
              style={{
                fontSize: "18px",
                color: "#5a5550",
                lineHeight: "1.8",
                marginBottom: "24px",
                textAlign: "center" as const,
              }}
            >
              Dear {guestName},
            </Text>

            <Text
              style={{
                fontSize: "16px",
                color: "#5a5550",
                lineHeight: "1.8",
                marginBottom: "24px",
                textAlign: "center" as const,
              }}
            >
              We joyfully invite you to celebrate our special day with us.
              Your presence would make our celebration complete.
            </Text>

            {/* Event Details */}
            {(eventDate || eventLocation) && (
              <Section
                style={{
                  backgroundColor: "#faf9f7",
                  borderRadius: "8px",
                  padding: "24px",
                  margin: "32px 0",
                  textAlign: "center" as const,
                }}
              >
                {eventDate && (
                  <Text
                    style={{
                      fontSize: "18px",
                      color: "#3d3936",
                      margin: "0 0 8px",
                      fontWeight: "500",
                    }}
                  >
                    {eventDate}
                  </Text>
                )}
                {eventLocation && (
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#5a5550",
                      margin: "0",
                    }}
                  >
                    {eventLocation}
                  </Text>
                )}
              </Section>
            )}

            {/* Personal Message */}
            {personalMessage && (
              <Text
                style={{
                  fontSize: "15px",
                  color: "#5a5550",
                  lineHeight: "1.8",
                  marginBottom: "32px",
                  textAlign: "center" as const,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{personalMessage}&rdquo;
              </Text>
            )}

            {/* RSVP Button */}
            <Section
              style={{
                textAlign: "center" as const,
                margin: "40px 0",
              }}
            >
              <Button
                href={rsvpUrl}
                style={{
                  backgroundColor: "#c9a962",
                  color: "#ffffff",
                  padding: "16px 48px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px",
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                }}
              >
                RSVP Now
              </Button>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#8a8580",
                lineHeight: "1.6",
                textAlign: "center" as const,
              }}
            >
              Please let us know if you can attend by clicking the button above.
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: "#e8e4e0",
              margin: "0",
            }}
          />

          {/* Footer */}
          <Section
            style={{
              padding: "24px 40px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                color: "#8a8580",
                lineHeight: "1.5",
                margin: "0",
              }}
            >
              If you have any questions, please contact us directly.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
