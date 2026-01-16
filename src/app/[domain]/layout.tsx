import { Header, Footer } from '@/components/layout';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        navItems={[
          { href: '/', label: 'Home' },
          { href: '/story', label: 'Our Story' },
          { href: '/rsvp', label: 'RSVP' },
        ]}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
