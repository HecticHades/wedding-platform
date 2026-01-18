import { Mail, Phone, User } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";

interface ContactSectionProps {
  content: PrismaJson.ContactContent;
  theme: ThemeSettings;
}

/**
 * ContactSection displays contact information for the couple or wedding party.
 * Renders contact cards with clickable email and phone links.
 * Styling matches the Theme Studio preview for consistency.
 */
export function ContactSection({ content, theme }: ContactSectionProps) {
  // Don't render if no contacts
  if (content.contacts.length === 0) {
    return null;
  }

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold text-center mb-6"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          {content.title || "Contact Us"}
        </h2>

        {/* Optional message */}
        {content.message && (
          <p
            className="text-center mb-10 max-w-2xl mx-auto leading-relaxed opacity-80"
            style={{
              fontFamily: theme.fontFamily,
              color: theme.textColor,
            }}
          >
            {content.message}
          </p>
        )}

        {/* Contact cards grid */}
        <div
          className={`grid gap-6 ${
            content.contacts.length === 1
              ? "max-w-sm mx-auto"
              : content.contacts.length === 2
              ? "md:grid-cols-2 max-w-2xl mx-auto"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {content.contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-6 text-center"
              style={{ border: `1px solid ${theme.primaryColor}20` }}
            >
              {/* Avatar placeholder */}
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <User className="h-8 w-8" style={{ color: theme.secondaryColor }} />
              </div>

              {/* Name */}
              <h3
                className="font-medium text-lg mb-1"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.textColor,
                }}
              >
                {contact.name}
              </h3>

              {/* Role */}
              <p
                className="text-sm mb-4"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.secondaryColor,
                }}
              >
                {contact.role}
              </p>

              {/* Contact info */}
              <div className="space-y-2">
                {/* Email */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center gap-2 text-sm hover:underline"
                    style={{ color: theme.accentColor }}
                  >
                    <Mail className="h-4 w-4" />
                    <span style={{ fontFamily: theme.fontFamily }}>{contact.email}</span>
                  </a>
                )}

                {/* Phone */}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 text-sm hover:underline"
                    style={{ color: theme.accentColor }}
                  >
                    <Phone className="h-4 w-4" />
                    <span style={{ fontFamily: theme.fontFamily }}>{contact.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
