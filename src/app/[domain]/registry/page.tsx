import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Gift, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PublicGiftList } from "@/components/registry/PublicGiftList";

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function PublicRegistryPage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        include: {
          giftItems: {
            orderBy: [{ isClaimed: "asc" }, { order: "asc" }],
          },
          externalRegistries: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  const { wedding } = tenant;
  const paymentSettings =
    (wedding.paymentSettings as PrismaJson.PaymentSettings) || {
      enabled: false,
      method: null,
    };

  // Check if registry has any content
  const hasGifts = wedding.giftItems.length > 0;
  const hasExternalRegistries = wedding.externalRegistries.length > 0;
  const hasPaymentConfigured = paymentSettings.enabled && paymentSettings.method;

  // Empty registry state
  if (!hasGifts && !hasExternalRegistries) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Gift className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Gift Registry</h1>
          <p className="mt-4 text-lg text-gray-600">
            {wedding.partner1Name} & {wedding.partner2Name}&apos;s gift registry is
            coming soon.
          </p>
          <Link
            href={`/`}
            className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            Back to wedding site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Gift Registry
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {wedding.partner1Name} & {wedding.partner2Name}
          </p>
          {hasGifts && !hasPaymentConfigured && (
            <p className="mt-2 text-sm text-amber-600">
              Payment details coming soon
            </p>
          )}
        </div>

        {/* Gift Items Section */}
        {hasGifts && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Gift Ideas
            </h2>
            <PublicGiftList
              gifts={wedding.giftItems}
              paymentSettings={paymentSettings}
            />
          </section>
        )}

        {/* External Registries Section */}
        {hasExternalRegistries && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Other Registries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wedding.externalRegistries.map((registry) => (
                <a
                  key={registry.id}
                  href={registry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {registry.name}
                    </h3>
                    {registry.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {registry.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-blue-600 hover:underline">
                      View registry
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href={`/`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            &larr; Back to wedding site
          </Link>
        </div>
      </div>
    </div>
  );
}
