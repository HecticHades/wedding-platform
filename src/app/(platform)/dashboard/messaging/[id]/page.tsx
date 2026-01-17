import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Mail, ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, Users, Calendar } from "lucide-react";
import { getBroadcastMessage } from "../actions";
import type { MessageStatus } from "@prisma/client";
import { CancelMessageButton } from "./CancelMessageButton";

const statusConfig: Record<MessageStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Scheduled", color: "text-yellow-800", bgColor: "bg-yellow-100", icon: Clock },
  SENT: { label: "Sent", color: "text-green-800", bgColor: "bg-green-100", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-gray-600", bgColor: "bg-gray-100", icon: XCircle },
  FAILED: { label: "Failed", color: "text-red-800", bgColor: "bg-red-100", icon: AlertCircle },
};

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const { id } = await params;
  const message = await getBroadcastMessage(session.user.tenantId, id);

  if (!message) {
    notFound();
  }

  const config = statusConfig[message.status];
  const StatusIcon = config.icon;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/messaging" className="hover:text-gray-700">
          Messaging
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {message.subject}
        </span>
      </nav>

      {/* Back link */}
      <Link
        href="/dashboard/messaging"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Messaging
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" />
            {message.subject}
          </h1>
          <div className="mt-3 flex items-center gap-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
              <StatusIcon className="h-4 w-4" />
              {config.label}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {message.recipientCount} {message.recipientCount === 1 ? "recipient" : "recipients"}
            </span>
          </div>
        </div>

        {/* Cancel button for pending messages */}
        {message.status === "PENDING" && (
          <CancelMessageButton messageId={message.id} />
        )}
      </div>

      {/* Message details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Metadata */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created
              </span>
              <p className="font-medium text-gray-900 mt-1">
                {new Date(message.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.scheduledFor && (
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Scheduled For
                </span>
                <p className="font-medium text-gray-900 mt-1">
                  {new Date(message.scheduledFor).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {message.sentAt && (
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Sent At
                </span>
                <p className="font-medium text-gray-900 mt-1">
                  {new Date(message.sentAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message content */}
        <div className="px-6 py-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Message Content</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
