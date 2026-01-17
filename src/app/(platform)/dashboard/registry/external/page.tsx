import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { ExternalRegistryList } from "./ExternalRegistryList";

// Common registry suggestions
const REGISTRY_SUGGESTIONS = [
  { name: "Amazon", url: "https://www.amazon.com/wedding/registry" },
  { name: "Target", url: "https://www.target.com/gift-registry/wedding" },
  { name: "Williams Sonoma", url: "https://www.williams-sonoma.com/registry" },
  { name: "Crate & Barrel", url: "https://www.crateandbarrel.com/gift-registry" },
  { name: "Bed Bath & Beyond", url: "https://www.bedbathandbeyond.com/store/registry" },
  { name: "Zola", url: "https://www.zola.com/registry" },
];

export default async function ExternalRegistriesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch external registries with tenant context
  const registries = await withTenantContext(session.user.tenantId, async () => {
    return prisma.externalRegistry.findMany({
      orderBy: { order: "asc" },
    });
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">External Registries</h1>
        <p className="mt-2 text-gray-600">
          Add links to your registries on other platforms like Amazon, Target, or
          Williams Sonoma. Guests will see these links on your public gift page.
        </p>
      </div>

      {/* Registry list with add functionality */}
      <ExternalRegistryList
        registries={registries}
        suggestions={REGISTRY_SUGGESTIONS}
      />
    </div>
  );
}
