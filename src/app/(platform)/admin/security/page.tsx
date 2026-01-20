import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Shield, Key, User, Clock, Monitor } from "lucide-react";
import { MetricCard } from "@/components/admin";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function AdminSecurityPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch security data
  const [activeSessions, adminUsers, recentSessions] = await Promise.all([
    prisma.session.count({
      where: {
        expires: { gt: new Date() },
      },
    }),
    prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        sessions: {
          take: 1,
          orderBy: { expires: "desc" },
          where: { expires: { gt: new Date() } },
          select: { expires: true },
        },
      },
    }),
    prisma.session.findMany({
      take: 10,
      orderBy: { expires: "desc" },
      where: {
        expires: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-500 mt-1">Active sessions and admin access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Sessions"
          value={activeSessions}
          icon={Key}
          iconColor="green"
        />
        <MetricCard
          title="Admin Users"
          value={adminUsers.length}
          icon={Shield}
          iconColor="purple"
        />
        <MetricCard
          title="Recent Logins"
          value={recentSessions.length}
          icon={Monitor}
          iconColor="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No active sessions</p>
              </div>
            ) : (
              recentSessions.map((sessionRecord) => (
                <div
                  key={sessionRecord.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {sessionRecord.user.name || sessionRecord.user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {sessionRecord.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        sessionRecord.user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sessionRecord.user.role}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Expires {formatRelativeTime(sessionRecord.expires)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Admin Users</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {adminUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No admin users</p>
              </div>
            ) : (
              adminUsers.map((admin) => {
                const hasActiveSession = admin.sessions.length > 0;
                return (
                  <div
                    key={admin.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {admin.name || admin.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                    </div>
                    <div className="text-right">
                      {hasActiveSession ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Offline</span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Joined {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Security Note:</strong> Sessions automatically expire after their configured
          duration. For enhanced security, users should sign out when finished and use strong,
          unique passwords.
        </p>
      </div>
    </div>
  );
}
