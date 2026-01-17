import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Camera, Upload } from "lucide-react";
import Link from "next/link";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import type { Photo } from "@/components/photos/PhotoLightbox";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Public photo gallery page.
 * Shows couple photos from gallery content + approved guest photos.
 */
export default async function PublicPhotosPage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
          photoSharingEnabled: true,
          contentSections: true,
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  const { wedding } = tenant;

  // Extract gallery photos from contentSections
  const contentSections =
    (wedding.contentSections as PrismaJson.ContentSection[]) || [];
  const gallerySection = contentSections.find(
    (section) => section.type === "gallery"
  );

  const couplePhotos: Photo[] =
    gallerySection?.type === "gallery"
      ? (gallerySection.content as PrismaJson.GalleryContent).photos
          .sort((a, b) => a.order - b.order)
          .map((photo) => ({
            url: photo.url,
            caption: photo.caption || null,
            uploadedBy: null,
            isGuestPhoto: false,
          }))
      : [];

  // Fetch approved guest photos
  const guestPhotos = await prisma.guestPhoto.findMany({
    where: {
      weddingId: wedding.id,
      status: "APPROVED",
    },
    orderBy: { uploadedAt: "desc" },
  });

  const guestPhotoItems: Photo[] = guestPhotos.map((photo) => ({
    url: photo.url,
    caption: photo.caption,
    uploadedBy: photo.uploadedBy,
    isGuestPhoto: true,
  }));

  // Combine photos: couple photos first, then guest photos
  const allPhotos = [...couplePhotos, ...guestPhotoItems];

  // Check if there are any photos
  const hasPhotos = allPhotos.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Photos
              </h1>
              <p className="text-gray-600 mt-1">
                {wedding.partner1Name} & {wedding.partner2Name}
              </p>
            </div>

            {/* Upload link if sharing enabled */}
            {wedding.photoSharingEnabled && (
              <Link
                href={`/${domain}/photos/upload`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Your Photos
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="px-4 py-8 max-w-6xl mx-auto">
        {hasPhotos ? (
          <>
            {/* Stats */}
            <div className="mb-6 text-sm text-gray-600">
              {couplePhotos.length > 0 && (
                <span>
                  {couplePhotos.length} photo
                  {couplePhotos.length !== 1 ? "s" : ""}
                </span>
              )}
              {couplePhotos.length > 0 && guestPhotoItems.length > 0 && (
                <span className="mx-2">+</span>
              )}
              {guestPhotoItems.length > 0 && (
                <span>
                  {guestPhotoItems.length} guest photo
                  {guestPhotoItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <PhotoGallery photos={allPhotos} />
          </>
        ) : (
          <div className="text-center py-16">
            <Camera className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              No Photos Yet
            </h2>
            <p className="mt-2 text-gray-600">
              Check back soon for photos from the celebration.
            </p>
            {wedding.photoSharingEnabled && (
              <Link
                href={`/${domain}/photos/upload`}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Be the first to upload!
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Back link */}
      <footer className="px-4 py-8 text-center">
        <Link
          href={`/${domain}`}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          &larr; Back to wedding site
        </Link>
      </footer>
    </div>
  );
}
