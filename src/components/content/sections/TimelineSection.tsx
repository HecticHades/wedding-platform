interface TimelineSectionProps {
  content: PrismaJson.TimelineContent;
}

/**
 * TimelineSection displays the wedding day schedule in a vertical timeline layout.
 * Shows time on the left/top with event details on the right.
 */
export function TimelineSection({ content }: TimelineSectionProps) {
  // Don't render if no events
  if (content.events.length === 0) {
    return null;
  }

  return (
    <div className="py-12 px-4 md:py-16 md:px-6 bg-wedding-primary/5">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          id="timeline-heading"
          className="font-wedding-heading text-3xl md:text-4xl text-wedding-primary text-center mb-10"
        >
          {content.title || "Wedding Day Timeline"}
        </h2>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical line - hidden on mobile, visible on larger screens */}
          <div className="hidden md:block absolute left-[120px] top-0 bottom-0 w-0.5 bg-wedding-secondary/30" />

          {/* Timeline events */}
          <div className="space-y-6 md:space-y-8">
            {content.events.map((event, index) => (
              <div
                key={index}
                className="relative flex flex-col md:flex-row gap-3 md:gap-0"
              >
                {/* Time - stacked on mobile, side by side on desktop */}
                <div className="md:w-[120px] flex-shrink-0 md:pr-6 md:text-right">
                  <span className="inline-block bg-wedding-primary text-white font-wedding font-medium px-3 py-1 rounded-full text-sm md:bg-transparent md:text-wedding-primary md:px-0 md:py-0 md:rounded-none">
                    {event.time}
                  </span>
                </div>

                {/* Dot - hidden on mobile */}
                <div className="hidden md:flex items-start justify-center relative z-10">
                  <div className="w-4 h-4 rounded-full bg-wedding-secondary border-2 border-white shadow-sm mt-1" />
                </div>

                {/* Event content */}
                <div className="flex-1 md:pl-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-wedding-primary/10 md:bg-transparent md:p-0 md:shadow-none md:border-0">
                  <h3 className="font-wedding font-medium text-lg text-wedding-text">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="mt-1 font-wedding text-wedding-text/70 text-sm leading-relaxed">
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
