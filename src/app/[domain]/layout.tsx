/**
 * TenantLayout - Layout for public wedding sites.
 *
 * This layout is intentionally minimal as the page component
 * handles theme application via ThemeProvider. Each wedding site
 * gets its own customized look based on the couple's theme settings.
 */
export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
