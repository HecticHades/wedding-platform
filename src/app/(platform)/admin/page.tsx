import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { Heart, Users, Mail, TrendingUp } from "lucide-react"
import {
  MetricCard,
  WeddingsTable,
  ActivityFeed,
  QuickActionsPanel,
} from "@/components/admin"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  // Admin operations - no tenant context, see all data
  const [weddingCount, userCount, recentWeddings, rsvpCount] = await Promise.all([
    prisma.wedding.count(),
    prisma.user.count(),
    prisma.wedding.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { subdomain: true } },
        guests: { select: { id: true } },
      },
    }),
    prisma.eventGuest.count({ where: { rsvpStatus: { not: null } } }),
  ])

  // Transform weddings for the table
  const weddingsForTable = recentWeddings.map((wedding) => ({
    id: wedding.id,
    partner1Name: wedding.partner1Name,
    partner2Name: wedding.partner2Name,
    subdomain: wedding.tenant.subdomain,
    weddingDate: wedding.weddingDate,
    guestCount: wedding.guests.length,
    status: "active" as const,
    createdAt: wedding.createdAt,
  }))

  // Mock activity data (would come from an actual activity log)
  const recentActivity = [
    {
      id: "1",
      type: "wedding_created" as const,
      description: "New wedding site created for Emma & James",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      type: "rsvp_received" as const,
      description: "RSVP received for Smith-Johnson wedding",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "3",
      type: "user_registered" as const,
      description: "New couple registered: Alex & Jordan",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ]

  // Mock sparkline data
  const weddingSparkline = [4, 6, 5, 8, 12, 10, 15]
  const userSparkline = [10, 12, 15, 14, 18, 22, 25]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Weddings"
          value={weddingCount}
          change={12}
          icon={Heart}
          iconColor="purple"
          sparklineData={weddingSparkline}
        />
        <MetricCard
          title="Total Users"
          value={userCount}
          change={8}
          icon={Users}
          iconColor="blue"
          sparklineData={userSparkline}
        />
        <MetricCard
          title="Total RSVPs"
          value={rsvpCount}
          change={24}
          icon={Mail}
          iconColor="green"
        />
        <MetricCard
          title="Active This Week"
          value={Math.floor(weddingCount * 0.7)}
          change={5}
          icon={TrendingUp}
          iconColor="amber"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weddings table - spans 2 columns */}
        <div className="lg:col-span-2">
          <WeddingsTable
            weddings={weddingsForTable}
            totalCount={weddingCount}
            currentPage={1}
            pageSize={5}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActionsPanel />
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  )
}
