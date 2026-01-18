import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { DEFAULT_THEME } from "@/lib/content/theme-utils";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { ThemeStudio } from "@/components/theme/ThemeStudio";
import { getTenantUrl } from "@/lib/url-utils";

export default async function ThemePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Load wedding's current theme settings
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: {
        id: true,
        themeSettings: true,
        partner1Name: true,
        partner2Name: true,
      },
    });
    const tenant = await prisma.tenant.findFirst({
      select: { subdomain: true },
    });
    return { wedding, tenant };
  });

  if (!data.wedding || !data.tenant) {
    redirect("/dashboard");
  }

  // Use stored theme or fall back to defaults
  const initialTheme: ThemeSettings =
    (data.wedding.themeSettings as ThemeSettings) || DEFAULT_THEME;

  const siteUrl = getTenantUrl(data.tenant.subdomain);

  return (
    <ThemeStudio
      initialTheme={initialTheme}
      siteUrl={siteUrl}
      partner1Name={data.wedding.partner1Name || undefined}
      partner2Name={data.wedding.partner2Name || undefined}
    />
  );
}
