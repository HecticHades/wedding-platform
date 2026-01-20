import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Heart, Users, Mail, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { MetricCard, ActivityFeed } from "@/components/admin";

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch analytics data
  const [
    weddingCount,
    userCount,
    rsvpStats,
    recentWeddings,
    recentUsers,
  ] = await Promise.all([
    prisma.wedding.count(),
    prisma.user.count(),
    prisma.eventGuest.groupBy({
      by: ["rsvpStatus"],
      _count: true,
    }),
    prisma.wedding.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { subdomain: true } },
      },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  // Calculate active weddings this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const activeThisWeek = await prisma.wedding.count({
    where: {
      updatedAt: { gte: oneWeekAgo },
    },
  });

  // Process RSVP stats
  const rsvpData = {
    attending: rsvpStats.find((s) => s.rsvpStatus === "ATTENDING")?._count || 0,
    declined: rsvpStats.find((s) => s.rsvpStatus === "DECLINED")?._count || 0,
    pending: rsvpStats.find((s) => s.rsvpStatus === "PENDING")?._count || 0,
    maybe: rsvpStats.find((s) => s.rsvpStatus === "MAYBE")?._count || 0,
  };
  const totalRsvps = rsvpData.attending + rsvpData.declined + rsvpData.pending + rsvpData.maybe;

  // Build activity feed from recent data
  const recentActivity = [
    ...recentWeddings.map((w) => ({
      id: `wedding-${w.id}`,
      type: "wedding_created" as const,
      description: `New wedding: ${w.partner1Name} & ${w.partner2Name} (${w.tenant.subdomain})`,
      timestamp: w.createdAt,
    })),
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "user_registered" as const,
      description: `New user: ${u.name || u.email} (${u.role})`,
      timestamp: u.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform metrics and activity overview</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Weddings"
          value={weddingCount}
          icon={Heart}
          iconColor="purple"
        />
        <MetricCard
          title="Total Users"
          value={userCount}
          icon={Users}
          iconColor="blue"
        />
        <MetricCard
          title="Total RSVPs"
          value={totalRsvps}
          icon={Mail}
          iconColor="green"
        />
        <MetricCard
          title="Active This Week"
          value={activeThisWeek}
          icon={TrendingUp}
          iconColor="amber"
        />
      </div>

      {/* RSVP Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RSVP Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{rsvpData.attending}</p>
              <p className="text-sm text-green-600">Attending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{rsvpData.declined}</p>
              <p className="text-sm text-red-600">Declined</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{rsvpData.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{rsvpData.maybe}</p>
              <p className="text-sm text-gray-600">Maybe</p>
            </div>
          </div>
        </div>

        {/* RSVP Progress Bar */}
        {totalRsvps > 0 && (
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(rsvpData.attending / totalRsvps) * 100}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(rsvpData.declined / totalRsvps) * 100}%` }}
              />
              <div
                className="bg-yellow-500 transition-all"
                style={{ width: `${(rsvpData.pending / totalRsvps) * 100}%` }}
              />
              <div
                className="bg-gray-400 transition-all"
                style={{ width: `${(rsvpData.maybe / totalRsvps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>
                {Math.round((rsvpData.attending / totalRsvps) * 100)}% Attending
              </span>
              <span>
                {Math.round((rsvpData.declined / totalRsvps) * 100)}% Declined
              </span>
              <span>
                {Math.round((rsvpData.pending / totalRsvps) * 100)}% Pending
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div id="activity">
        <ActivityFeed activities={recentActivity} className="lg:max-w-none" />
      </div>
    </div>
  );
}
