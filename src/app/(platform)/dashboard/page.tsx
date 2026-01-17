import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma, withTenantContext } from "@/lib/db/prisma"
import { Users, Calendar, Heart } from "lucide-react"
import {
  StatCard,
  SitePreviewCard,
  ChecklistCard,
  QuickActionsCard,
} from "@/components/dashboard"

export default async function CoupleDashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant")
  }

  // Use tenant context to scope all queries to this couple's data
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      include: {
        tenant: true,
        guests: {
          select: {
            id: true,
            partySize: true,
          },
        },
        events: {
          orderBy: { dateTime: "asc" },
          select: {
            id: true,
            name: true,
            dateTime: true,
          },
        },
        guestPhotos: {
          select: { id: true },
        },
      },
    })
    return { wedding }
  })

  if (!data.wedding) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-[#3d3936]">No Wedding Found</h1>
        <p className="mt-2 text-[#3d3936]/60">Please contact support.</p>
      </div>
    )
  }

  const { wedding } = data

  // Calculate stats
  const totalGuests = wedding.guests.length
  const totalAttendees = wedding.guests.reduce((sum, g) => sum + g.partySize, 0)
  const daysUntil = wedding.weddingDate
    ? Math.ceil(
        (new Date(wedding.weddingDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  // Checklist items based on wedding data
  const checklistItems = [
    {
      id: "template",
      label: "Choose a template",
      completed: !!wedding.templateId,
      href: "/dashboard/templates",
    },
    {
      id: "content",
      label: "Add your story",
      completed: false, // Would check content data
      href: "/dashboard/content",
    },
    {
      id: "events",
      label: "Set up events",
      completed: wedding.events.length > 0,
      href: "/dashboard/events",
    },
    {
      id: "guests",
      label: "Add guests",
      completed: wedding.guests.length > 0,
      href: "/dashboard/guests",
    },
    {
      id: "photos",
      label: "Upload photos",
      completed: (wedding.guestPhotos?.length || 0) > 0,
      href: "/dashboard/photos",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold font-cormorant text-[#3d3936]">
          Welcome back, {wedding.partner1Name} & {wedding.partner2Name}
        </h1>
        <p className="text-[#3d3936]/60 mt-1">
          {daysUntil && daysUntil > 0
            ? `${daysUntil} days until your big day!`
            : "Let's make your wedding website beautiful"}
        </p>
      </div>

      {/* Bento grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Site preview - large card spanning 2 columns */}
        <div className="lg:col-span-2">
          <SitePreviewCard
            subdomain={wedding.tenant.subdomain}
            weddingDate={wedding.weddingDate}
          />
        </div>

        {/* Stats column */}
        <div className="space-y-4">
          <StatCard
            title="Guests Invited"
            value={totalGuests}
            subtitle={
              totalAttendees !== totalGuests
                ? `${totalAttendees} total attendees`
                : "parties added"
            }
            icon={Users}
            accent="primary"
          />
          <StatCard
            title="Events Planned"
            value={wedding.events.length}
            subtitle={
              wedding.events[0]
                ? `Next: ${wedding.events[0].name}`
                : "Add your first event"
            }
            icon={Calendar}
            accent="secondary"
          />
          {daysUntil && daysUntil > 0 && (
            <StatCard
              title="Days Until"
              value={daysUntil}
              subtitle={
                wedding.weddingDate
                  ? new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Your wedding day"
              }
              icon={Heart}
              accent="gold"
            />
          )}
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2">
          <ChecklistCard items={checklistItems} />
        </div>

        {/* Quick actions */}
        <QuickActionsCard />
      </div>
    </div>
  )
}
