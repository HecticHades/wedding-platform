import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getWeddingByDomain } from "./actions";
import { RsvpPageClient } from "./RsvpPageClient";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantPageLayout } from "@/components/tenant/TenantPageLayout";
import { TenantFooter } from "@/components/tenant/TenantFooter";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { mergeWithDefaults } from "@/lib/content/theme-utils";

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function RsvpPage({ params }: PageProps) {
  const { domain } = await params;

  const wedding = await getWeddingByDomain(domain);

  if (!wedding) {
    notFound();
  }

  // Get theme settings
  const theme: ThemeSettings = mergeWithDefaults(
    (wedding.themeSettings as Partial<ThemeSettings>) || {}
  );

  // Check for existing RSVP auth cookie
  let isAuthenticated = false;
  if (wedding.rsvpCode) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`rsvp_auth_${wedding.id}`);
    isAuthenticated = authCookie?.value === wedding.rsvpCode;
  } else {
    // No code required - guest is automatically "authenticated"
    isAuthenticated = true;
  }

  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate)
    : null;

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
        pageTitle="RSVP"
      />

      {/* RSVP Flow */}
      <TenantPageLayout maxWidth="2xl">
        <RsvpPageClient
          weddingId={wedding.id}
          hasRsvpCode={!!wedding.rsvpCode}
          initialAuthenticated={isAuthenticated}
          domain={domain}
        />
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
