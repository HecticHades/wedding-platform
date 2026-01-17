import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { PhotoTabs } from "@/components/photos/PhotoTabs";
import { PhotoModerationList } from "@/components/photos/PhotoModerationList";
import { PhotoStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function PhotoModerationPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  const resolvedParams = await searchParams;
  const statusFilter = (resolvedParams.status || "pending").toUpperCase() as
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  // Validate status filter
  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
  const finalStatus = validStatuses.includes(statusFilter) ? statusFilter : "PENDING";

  // Fetch photos based on filter
  const [photos, counts] = await withTenantContext(
    session.user.tenantId,
    async () => {
      return Promise.all([
        prisma.guestPhoto.findMany({
          where: { status: finalStatus as PhotoStatus },
          orderBy: { uploadedAt: "desc" },
        }),
        // Get counts for all tabs
        Promise.all([
          prisma.guestPhoto.count({ where: { status: PhotoStatus.PENDING } }),
          prisma.guestPhoto.count({ where: { status: PhotoStatus.APPROVED } }),
          prisma.guestPhoto.count({ where: { status: PhotoStatus.REJECTED } }),
        ]),
      ]);
    }
  );

  const [pendingCount, approvedCount, rejectedCount] = counts;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Photo Sharing</h1>
        <p className="mt-2 text-gray-600">
          Review and moderate photos uploaded by your guests.
        </p>
      </div>

      {/* Navigation tabs */}
      <PhotoTabs activeTab="moderation" />

      {/* Status filter tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-x-6" aria-label="Photo status filter">
          <a
            href="/dashboard/photos/moderation?status=pending"
            className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium ${
              finalStatus === "PENDING"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {pendingCount}
              </span>
            )}
          </a>
          <a
            href="/dashboard/photos/moderation?status=approved"
            className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium ${
              finalStatus === "APPROVED"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Approved
            {approvedCount > 0 && (
              <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {approvedCount}
              </span>
            )}
          </a>
          <a
            href="/dashboard/photos/moderation?status=rejected"
            className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium ${
              finalStatus === "REJECTED"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Rejected
            {rejectedCount > 0 && (
              <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                {rejectedCount}
              </span>
            )}
          </a>
        </nav>
      </div>

      {/* Photo list */}
      <PhotoModerationList photos={photos} currentStatus={finalStatus} />
    </div>
  );
}
