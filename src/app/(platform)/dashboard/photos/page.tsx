import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Upload,
  Shield,
  Settings,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  ImageOff,
} from "lucide-react";
import { PhotoStatus } from "@prisma/client";
import { PhotoTabs } from "@/components/photos/PhotoTabs";
import { getRelativeTime } from "@/lib/photos/photo-utils";

export default async function PhotosPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch photo stats and recent photos
  const [photoStats, recentPhotos, wedding, tenant] = await withTenantContext(
    session.user.tenantId,
    async () => {
      return Promise.all([
        // Get counts by status
        Promise.all([
          prisma.guestPhoto.count({ where: { status: PhotoStatus.PENDING } }),
          prisma.guestPhoto.count({ where: { status: PhotoStatus.APPROVED } }),
          prisma.guestPhoto.count({ where: { status: PhotoStatus.REJECTED } }),
        ]),
        // Get 5 most recent pending photos
        prisma.guestPhoto.findMany({
          where: { status: PhotoStatus.PENDING },
          orderBy: { uploadedAt: "desc" },
          take: 5,
        }),
        // Get wedding settings
        prisma.wedding.findFirst({
          select: {
            photoSharingEnabled: true,
            contentSections: true,
          },
        }),
        // Get tenant for subdomain
        prisma.tenant.findFirst({
          select: { subdomain: true },
        }),
      ]);
    }
  );

  const [pendingCount, approvedCount, rejectedCount] = photoStats;
  const totalGuestPhotos = pendingCount + approvedCount + rejectedCount;

  // Get couple photos count from content sections gallery
  const contentSections = (wedding?.contentSections as PrismaJson.ContentSection[]) || [];
  const gallerySection = contentSections.find((s) => s.type === "gallery") as
    | PrismaJson.GalleryContent
    | undefined;
  const couplePhotosCount = gallerySection?.photos?.length || 0;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photo Sharing</h1>
          <p className="mt-2 text-gray-600">
            Manage your wedding photos and moderate guest submissions.
          </p>
        </div>

        <Link
          href="/dashboard/photos/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Photos
        </Link>
      </div>

      {/* Navigation tabs */}
      <PhotoTabs activeTab="overview" />

      {/* Photo sharing status */}
      <div className="mb-6">
        {wedding?.photoSharingEnabled ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            Photo sharing is enabled - guests can upload photos
          </div>
        ) : (
          <Link
            href="/dashboard/photos/settings"
            className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Clock className="h-4 w-4" />
            Photo sharing is disabled - click to enable
          </Link>
        )}
      </div>

      {/* Stats summary */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Couple photos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Photos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {couplePhotosCount}
              </p>
            </div>
          </div>
        </div>

        {/* Pending moderation */}
        <Link
          href="/dashboard/photos/moderation"
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Approved */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/photos/upload"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Upload Photos</h3>
            <p className="text-sm text-gray-500">Add your own wedding photos</p>
          </div>
        </Link>

        <Link
          href="/dashboard/photos/moderation"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Shield className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Moderate Photos</h3>
            <p className="text-sm text-gray-500">
              {pendingCount > 0
                ? `${pendingCount} photo${pendingCount > 1 ? "s" : ""} awaiting review`
                : "No pending photos"}
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/photos/settings"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="p-3 bg-gray-50 rounded-lg">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Settings & QR Code</h3>
            <p className="text-sm text-gray-500">Configure sharing options</p>
          </div>
        </Link>
      </div>

      {/* Recent pending photos preview */}
      {recentPhotos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Submissions
            </h2>
            <Link
              href="/dashboard/photos/moderation"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Guest photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {photo.uploadedBy || "Anonymous"}
                  </p>
                  <p className="text-xs text-white/70">
                    {getRelativeTime(photo.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalGuestPhotos === 0 && couplePhotosCount === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start by uploading your own photos or enable photo sharing so guests
            can contribute their favorite moments.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/photos/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </Link>
            <Link
              href="/dashboard/photos/settings"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              Get QR Code
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
