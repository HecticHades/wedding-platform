"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Mail, Send, Clock, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { sendBroadcast, scheduleBroadcast } from "../actions";

export default function ComposeMessagePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isScheduled, setIsScheduled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Default scheduled time: tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultScheduledFor = tomorrow.toISOString().slice(0, 16);

  const [scheduledFor, setScheduledFor] = useState(defaultScheduledFor);

  // Calculate max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxScheduledFor = maxDate.toISOString().slice(0, 16);

  // Min date (now)
  const minScheduledFor = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        let result;

        if (isScheduled) {
          formData.append("scheduledFor", scheduledFor);
          result = await scheduleBroadcast(formData);
        } else {
          result = await sendBroadcast(formData);
        }

        if (result.success) {
          setSuccess(
            isScheduled
              ? `Message scheduled for ${result.recipientCount} guests`
              : `Message sent to ${result.recipientCount} guests`
          );
          // Redirect after short delay to show success message
          setTimeout(() => {
            router.push("/dashboard/messaging");
          }, 1500);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

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
        <span className="text-gray-900 font-medium">Compose</span>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="h-8 w-8 text-blue-600" />
          Compose Message
        </h1>
        <p className="mt-2 text-gray-600">
          Send a broadcast message to all guests with email addresses.
        </p>
      </div>

      {/* Form */}
      <form action={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Error/Success messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              maxLength={200}
              placeholder="e.g., Wedding Day Update"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 200 characters</p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              placeholder="Write your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Optional CTA */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Optional: Add a Call-to-Action Button
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ctaText" className="block text-sm text-gray-600 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  id="ctaText"
                  name="ctaText"
                  placeholder="e.g., View Details"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="ctaUrl" className="block text-sm text-gray-600 mb-1">
                  Button URL
                </label>
                <input
                  type="url"
                  id="ctaUrl"
                  name="ctaUrl"
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule toggle */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Delivery Time</h3>
                <p className="text-xs text-gray-500 mt-1">Choose when to send this message</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isScheduled
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Send Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isScheduled
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Schedule
                </button>
              </div>
            </div>

            {/* Scheduled datetime picker */}
            {isScheduled && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  id="scheduledFor"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={minScheduledFor}
                  max={maxScheduledFor}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Messages can be scheduled up to 30 days in advance
                </p>
              </div>
            )}
          </div>

          {/* Preview note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <Mail className="h-4 w-4 inline mr-1" />
              This message will be sent to all guests with email addresses in your guest list.
            </p>
          </div>

          {/* Submit button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isScheduled ? "Scheduling..." : "Sending..."}
                </>
              ) : (
                <>
                  {isScheduled ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Schedule Message
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Now
                    </>
                  )}
                </>
              )}
            </button>
            <Link
              href="/dashboard/messaging"
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
