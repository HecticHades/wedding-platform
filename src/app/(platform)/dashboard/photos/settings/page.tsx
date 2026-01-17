import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { PhotoTabs } from "@/components/photos/PhotoTabs";
import { PhotoSharingToggle } from "@/components/photos/PhotoSharingToggle";
import { PhotoUploadQRCode } from "@/components/photos/PhotoUploadQRCode";
import { getPhotoUploadUrl } from "@/lib/photos/photo-utils";
import {
  Info,
  Shield,
  Camera,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function PhotoSettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Get base URL from headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Fetch wedding settings and tenant
  const [wedding, tenant] = await withTenantContext(
    session.user.tenantId,
    async () => {
      return Promise.all([
        prisma.wedding.findFirst({
          select: { photoSharingEnabled: true },
        }),
        prisma.tenant.findFirst({
          select: { subdomain: true },
        }),
      ]);
    }
  );

  const isEnabled = wedding?.photoSharingEnabled || false;
  const subdomain = tenant?.subdomain || "";
  const uploadUrl = getPhotoUploadUrl(subdomain, baseUrl);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Photo Sharing</h1>
        <p className="mt-2 text-gray-600">
          Configure photo sharing settings and get your QR code.
        </p>
      </div>

      {/* Navigation tabs */}
      <PhotoTabs activeTab="settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings section */}
        <div className="space-y-6">
          {/* Enable/disable toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Photo Sharing Settings
            </h2>
            <PhotoSharingToggle initialEnabled={isEnabled} />
          </div>

          {/* How it works */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              How It Works
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Enable Sharing</p>
                  <p className="text-sm text-gray-600">
                    Turn on photo sharing to allow guests to upload
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Share the QR Code</p>
                  <p className="text-sm text-gray-600">
                    Display at your venue or send to guests
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Guests Upload Photos</p>
                  <p className="text-sm text-gray-600">
                    Guests scan and upload directly from their phones
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">You Review & Approve</p>
                  <p className="text-sm text-gray-600">
                    Approve or reject photos before they appear in your gallery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Moderation info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Moderation Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  All guest photos require your approval before appearing in your
                  public gallery. This ensures you have full control over what&apos;s
                  shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Guest Upload QR Code
          </h2>

          {isEnabled ? (
            <PhotoUploadQRCode subdomain={subdomain} baseUrl={baseUrl} />
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Enable photo sharing to generate QR code
              </p>
              <p className="text-sm text-gray-500">
                The QR code will appear here once sharing is enabled
              </p>
            </div>
          )}

          {/* Upload URL display */}
          {isEnabled && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Upload Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uploadUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(uploadUrl);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Share this link with guests who can&apos;t scan the QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
