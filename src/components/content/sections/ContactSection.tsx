import { Mail, Phone, User } from "lucide-react";

interface ContactSectionProps {
  content: PrismaJson.ContactContent;
}

/**
 * ContactSection displays contact information for the couple or wedding party.
 * Renders contact cards with clickable email and phone links.
 */
export function ContactSection({ content }: ContactSectionProps) {
  // Don't render if no contacts
  if (content.contacts.length === 0) {
    return null;
  }

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-background">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          id="contact-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-6"
        >
          {content.title || "Contact Us"}
        </h2>

        {/* Optional message */}
        {content.message && (
          <p className="font-wedding text-wedding-text/80 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
            {content.message}
          </p>
        )}

        {/* Contact cards grid */}
        <div
          className={`grid gap-4 ${
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
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-wedding-primary/10 p-5 text-center"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wedding-secondary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-wedding-secondary" />
              </div>

              {/* Name */}
              <h3 className="font-wedding font-medium text-lg text-wedding-text mb-1">
                {contact.name}
              </h3>

              {/* Role */}
              <p className="font-wedding text-sm text-wedding-secondary mb-4">
                {contact.role}
              </p>

              {/* Contact info */}
              <div className="space-y-2">
                {/* Email */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center gap-2 text-sm text-wedding-accent hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="font-wedding">{contact.email}</span>
                  </a>
                )}

                {/* Phone */}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 text-sm text-wedding-accent hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-wedding">{contact.phone}</span>
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
