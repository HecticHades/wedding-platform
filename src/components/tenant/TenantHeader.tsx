import { prisma } from "@/lib/db/prisma";
import { TenantNavigation } from "./TenantNavigation";

interface TenantHeaderProps {
  domain: string;
}

export async function TenantHeader({ domain }: TenantHeaderProps) {
  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        select: {
          partner1Name: true,
          partner2Name: true,
          photoSharingEnabled: true,
          giftItems: { select: { id: true }, take: 1 },
          externalRegistries: { select: { id: true }, take: 1 },
          tables: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    return null;
  }

  const { wedding } = tenant;
  const weddingName = `${wedding.partner1Name} & ${wedding.partner2Name}`;
  const hasRegistry = wedding.giftItems.length > 0 || wedding.externalRegistries.length > 0;
  const hasSeating = wedding.tables.length > 0;

  return (
    <TenantNavigation
      domain={domain}
      weddingName={weddingName}
      showRsvp={true}
      showPhotos={wedding.photoSharingEnabled || true}
      showRegistry={hasRegistry}
      showSeating={hasSeating}
    />
  );
}
