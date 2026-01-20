import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import Link from "next/link";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import type { Photo } from "@/components/photos/PhotoLightbox";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantPageLayout } from "@/components/tenant/TenantPageLayout";
import { TenantFooter } from "@/components/tenant/TenantFooter";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";

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
          weddingDate: true,
          photoSharingEnabled: true,
          contentSections: true,
          themeSettings: true,
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  const { wedding } = tenant;

  // Get theme settings
  const theme: ThemeSettings = mergeWithDefaults(
    (wedding.themeSettings as Partial<ThemeSettings>) || {}
  );

  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate)
    : null;

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
    <main className="min-h-screen bg-wedding-background">
      {/* Hero Section */}
      <TenantHero
        theme={theme}
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
        domain={domain}
        variant="subpage"
        pageTitle="Photos"
        ctaButton={
          wedding.photoSharingEnabled
            ? {
                label: "Upload Your Photos",
                href: `/${domain}/photos/upload`,
              }
            : undefined
        }
      />

      {/* Gallery */}
      <TenantPageLayout maxWidth="6xl">
        {hasPhotos ? (
          <>
            {/* Stats */}
            <div className="mb-6 text-sm text-wedding-text/60 font-wedding">
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
            <Camera className="mx-auto h-16 w-16 text-wedding-secondary" />
            <h2 className="mt-6 text-xl font-semibold font-wedding-heading text-wedding-primary">
              No Photos Yet
            </h2>
            <p className="mt-2 text-wedding-text font-wedding">
              Check back soon for photos from the celebration.
            </p>
            {wedding.photoSharingEnabled && (
              <Link
                href={`/${domain}/photos/upload`}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-wedding-primary text-white rounded-lg hover:bg-wedding-primary/90 transition-colors text-sm font-medium"
              >
                Be the first to upload!
              </Link>
            )}
          </div>
        )}
      </TenantPageLayout>

      {/* Footer */}
      <TenantFooter
        theme={theme}
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
      />
    </main>
  );
}
