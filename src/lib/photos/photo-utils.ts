import { PhotoStatus } from "@prisma/client";

/**
 * Photo status configuration for UI display
 */
export const photoStatusConfig: Record<
  PhotoStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

/**
 * Generate the photo upload URL for guests based on the wedding subdomain
 * Used for QR code generation and display
 *
 * @param subdomain - The wedding's subdomain
 * @param baseUrl - The base URL (e.g., http://localhost:3000 or https://app.domain.com)
 * @returns The full URL for guest photo uploads
 */
export function getPhotoUploadUrl(subdomain: string, baseUrl: string): string {
  // Handle localhost development
  if (baseUrl.includes("localhost")) {
    return `http://${subdomain}.localhost:3000/photos/upload`;
  }

  // Production: extract domain from baseUrl and construct tenant URL
  try {
    const url = new URL(baseUrl);
    return `https://${subdomain}.${url.host}/photos/upload`;
  } catch {
    // Fallback if URL parsing fails
    return `https://${subdomain}.weddingplatform.com/photos/upload`;
  }
}

/**
 * Format upload timestamp for display
 */
export function formatUploadDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatUploadDate(date);
}
