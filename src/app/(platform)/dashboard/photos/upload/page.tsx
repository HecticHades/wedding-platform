import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { PhotoTabs } from "@/components/photos/PhotoTabs";
import { CouplePhotoUploader } from "@/components/photos/CouplePhotoUploader";

export default async function PhotoUploadPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch current gallery content
  const wedding = await withTenantContext(session.user.tenantId, async () => {
    return prisma.wedding.findFirst({
      select: {
        contentSections: true,
      },
    });
  });

  // Get gallery section from content
  const contentSections = (wedding?.contentSections as PrismaJson.ContentSection[]) || [];
  const gallerySection = contentSections.find((s) => s.type === "gallery") as
    | PrismaJson.GalleryContent
    | undefined;

  const initialPhotos = gallerySection?.photos || [];
  const galleryTitle = gallerySection?.title || "Photo Gallery";

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Photo Sharing</h1>
        <p className="mt-2 text-gray-600">
          Upload your wedding photos to share with guests.
        </p>
      </div>

      {/* Navigation tabs */}
      <PhotoTabs activeTab="upload" />

      {/* Upload interface */}
      <CouplePhotoUploader
        initialPhotos={initialPhotos}
        galleryTitle={galleryTitle}
      />
    </div>
  );
}
