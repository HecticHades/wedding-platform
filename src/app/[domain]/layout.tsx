import { prisma } from "@/lib/db/prisma";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { mergeWithDefaults, type ThemeSettings } from "@/lib/content/theme-utils";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

/**
 * TenantLayout - Layout for public wedding sites.
 *
 * Includes shared navigation header for all tenant pages.
 * Each wedding site gets its own customized look based on the couple's theme settings.
 * ThemeProvider wraps all pages to ensure consistent theming across the site.
 */
export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { domain } = await params;

  // Fetch theme settings for this tenant
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    select: {
      wedding: {
        select: {
          themeSettings: true,
        },
      },
    },
  });

  // Parse theme settings with fallback to defaults
  const themeSettings: ThemeSettings = mergeWithDefaults(
    (tenant?.wedding?.themeSettings as Partial<ThemeSettings>) || {}
  );

  return (
    <ThemeProvider theme={themeSettings}>
      <div className="min-h-screen">
        <TenantHeader domain={domain} />
        {children}
      </div>
    </ThemeProvider>
  );
}
