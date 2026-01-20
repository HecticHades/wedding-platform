import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { GuestUploader } from "@/components/photos/GuestUploader";
import { ThemedCard } from "@/components/theme/ThemedCard";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantPageLayout } from "@/components/tenant/TenantPageLayout";
import { TenantFooter } from "@/components/tenant/TenantFooter";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Guest photo upload page - QR code destination.
 * Mobile-optimized for quick photo sharing from event.
 */
export default async function GuestUploadPage({ params }: PageProps) {
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

  // Photo sharing disabled
  if (!wedding.photoSharingEnabled) {
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
          pageTitle="Photo Uploads"
        />

        {/* Disabled message */}
        <TenantPageLayout maxWidth="md">
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-wedding-text/40" />
            <h2 className="mt-6 text-2xl font-wedding-heading text-wedding-primary">
              Photo Uploads Not Available
            </h2>
            <p className="mt-4 font-wedding text-wedding-text/70">
              Photo sharing is not currently enabled for this wedding.
            </p>
            <Link
              href={`/${domain}`}
              className="mt-8 inline-flex items-center text-wedding-primary hover:text-wedding-primary/80 font-wedding"
            >
              &larr; Back to wedding site
            </Link>
          </div>
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
        pageTitle="Share Your Photos"
      />

      {/* Upload form */}
      <TenantPageLayout maxWidth="md">
        <ThemedCard variant="glass" className="p-6">
          <p className="text-sm font-wedding text-wedding-text/70 mb-6">
            Upload your photos from the celebration! The couple will review and
            add them to the wedding gallery.
          </p>

          <GuestUploader weddingId={wedding.id} />
        </ThemedCard>

        {/* Gallery link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${domain}/photos`}
            className="text-wedding-primary hover:text-wedding-primary/80 text-sm font-wedding"
          >
            View the photo gallery &rarr;
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            href={`/${domain}`}
            className="text-wedding-text/50 hover:text-wedding-text/70 text-sm font-wedding"
          >
            &larr; Back to wedding site
          </Link>
        </div>
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
