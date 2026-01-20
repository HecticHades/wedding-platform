import Link from "next/link";
import { Heart, UserPlus, Mail, Edit, Settings } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "wedding_created" | "user_registered" | "rsvp_received" | "content_updated" | "settings_changed";
  description: string;
  timestamp: Date;
  metadata?: {
    weddingName?: string;
    userName?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons = {
  wedding_created: { icon: Heart, color: "bg-pink-100 text-pink-600" },
  user_registered: { icon: UserPlus, color: "bg-blue-100 text-blue-600" },
  rsvp_received: { icon: Mail, color: "bg-green-100 text-green-600" },
  content_updated: { icon: Edit, color: "bg-purple-100 text-purple-600" },
  settings_changed: { icon: Settings, color: "bg-gray-100 text-gray-600" },
};

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

export function ActivityFeed({ activities, className = "" }: ActivityFeedProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const config = activityIcons[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Link
            href="/admin/analytics#activity"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all activity
          </Link>
        </div>
      )}
    </div>
  );
}
