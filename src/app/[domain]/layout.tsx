import { TenantHeader } from "@/components/tenant/TenantHeader";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

/**
 * TenantLayout - Layout for public wedding sites.
 *
 * Includes shared navigation header for all tenant pages.
 * Each wedding site gets its own customized look based on the couple's theme settings.
 */
export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { domain } = await params;

  return (
    <div className="min-h-screen">
      <TenantHeader domain={domain} />
      {children}
    </div>
  );
}
