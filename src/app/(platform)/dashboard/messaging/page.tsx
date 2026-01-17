import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Mail, Send, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { getBroadcastMessages } from "./actions";
import type { MessageStatus } from "@prisma/client";

const statusConfig: Record<MessageStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Scheduled", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  SENT: { label: "Sent", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600", icon: XCircle },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default async function MessagingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const messages = await getBroadcastMessages(session.user.tenantId);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Messaging</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" />
            Guest Messaging
          </h1>
          <p className="mt-2 text-gray-600">
            Send broadcast messages to all your guests with email addresses.
          </p>
        </div>

        <Link
          href="/dashboard/messaging/compose"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Send className="h-4 w-4" />
          Compose New Message
        </Link>
      </div>

      {/* Messages list */}
      {messages.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.map((message) => {
                const config = statusConfig[message.status];
                const StatusIcon = config.icon;
                const displayDate = message.status === "PENDING"
                  ? message.scheduledFor
                  : message.sentAt || message.createdAt;

                return (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/messaging/${message.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {message.subject}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {message.recipientCount} {message.recipientCount === 1 ? "guest" : "guests"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {displayDate ? new Date(displayDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No messages sent yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Compose your first broadcast to send updates, reminders, or announcements to all your guests.
          </p>
          <Link
            href="/dashboard/messaging/compose"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Send className="h-4 w-4" />
            Compose Your First Message
          </Link>
        </div>
      )}
    </div>
  );
}
