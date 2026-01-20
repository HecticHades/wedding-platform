import type { ThemeSettings } from "@/lib/content/theme-utils";

interface TimelineSectionProps {
  content: PrismaJson.TimelineContent;
  theme: ThemeSettings;
}

/**
 * TimelineSection displays the wedding day schedule in a vertical timeline layout.
 * Shows time on the left/top with event details on the right.
 * Styling matches the Theme Studio preview for consistency.
 */
export function TimelineSection({ content, theme }: TimelineSectionProps) {
  // Don't render if no events
  if (content.events.length === 0) {
    return null;
  }

  return (
    <div
      className="py-16 md:py-20 px-4"
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          id="timeline-heading"
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: theme.headingFont,
            color: theme.primaryColor,
          }}
        >
          {content.title || "Wedding Day Timeline"}
        </h2>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical line - hidden on mobile, visible on larger screens */}
          <div
            className="hidden md:block absolute left-[120px] top-0 bottom-0 w-0.5"
            style={{ backgroundColor: `${theme.secondaryColor}40` }}
          />

          {/* Timeline events */}
          <div className="space-y-6 md:space-y-8">
            {content.events.map((event, index) => (
              <div
                key={index}
                className="relative flex flex-col md:flex-row gap-3 md:gap-0"
              >
                {/* Time - stacked on mobile, side by side on desktop */}
                <div className="md:w-[120px] flex-shrink-0 md:pr-6 md:text-right">
                  {/* Mobile time - pill style */}
                  <span
                    className="md:hidden inline-block font-medium px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: "#ffffff",
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {event.time}
                  </span>
                  {/* Desktop time - plain text */}
                  <span
                    className="hidden md:inline-block font-medium text-sm"
                    style={{
                      color: theme.primaryColor,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {event.time}
                  </span>
                </div>

                {/* Dot - hidden on mobile */}
                <div className="hidden md:flex items-start justify-center relative z-10">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm mt-1"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>

                {/* Event content */}
                <div
                  className="flex-1 md:pl-6 rounded-lg p-4 shadow-sm md:bg-transparent md:p-0 md:shadow-none md:border-0"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.8)",
                    border: `1px solid ${theme.primaryColor}10`,
                  }}
                >
                  <h3
                    className="font-medium text-lg"
                    style={{
                      fontFamily: theme.fontFamily,
                      color: theme.textColor,
                    }}
                  >
                    {event.title}
                  </h3>
                  {event.description && (
                    <p
                      className="mt-1 text-sm leading-relaxed opacity-70"
                      style={{
                        fontFamily: theme.fontFamily,
                        color: theme.textColor,
                      }}
                    >
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
