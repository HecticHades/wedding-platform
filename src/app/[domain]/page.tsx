import { prisma, withTenantContext } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function TenantHomePage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain (no tenant context needed for this lookup)
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: true,
    },
  });

  if (!tenant) {
    notFound();
  }

  // If tenant exists but no wedding configured yet
  if (!tenant.wedding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold md:text-4xl mb-4">
          {tenant.name}
        </h1>
        <p className="text-gray-600">
          This wedding site is being set up. Check back soon!
        </p>
      </main>
    );
  }

  // Use tenant context for any further tenant-scoped operations
  return withTenantContext(tenant.id, () => (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold md:text-4xl mb-4">
        {tenant.wedding!.partner1Name} & {tenant.wedding!.partner2Name}
      </h1>
      {tenant.wedding!.weddingDate && (
        <p className="text-xl text-gray-600">
          {new Date(tenant.wedding!.weddingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
      <p className="text-sm text-gray-400 mt-8">
        (Full wedding site will be built in Phase 3)
      </p>
    </main>
  ));
}
