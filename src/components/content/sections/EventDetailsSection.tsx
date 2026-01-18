/**
 * EventDetailsSection - DEPRECATED
 *
 * Events are now displayed from the Event database table via EventsDisplay
 * in the main public page ([domain]/page.tsx). This component is kept for
 * backwards compatibility but returns null.
 *
 * The "Event Details" content section in the dashboard content builder now
 * shows a read-only preview of database events with a link to manage them
 * in the Events tab.
 *
 * @see EventsDisplay in src/app/[domain]/page.tsx for the active event display
 * @see EventDetailsEditor for the dashboard content section
 */
export function EventDetailsSection() {
  // Events are now rendered by EventsDisplay in the main page
  // This component returns null to avoid duplicate event displays
  return null;
}
