import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { ContentManager } from "./content-manager";

export default async function ContentPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch wedding content sections with tenant context
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: {
        id: true,
        contentSections: true,
      },
    });
    return { wedding };
  });

  if (!data.wedding) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">No Wedding Found</h1>
        <p className="mt-2 text-gray-600">Please contact support.</p>
      </div>
    );
  }

  // Parse and sort content sections by order
  const sections = (data.wedding.contentSections ?? []) as PrismaJson.ContentSection[];
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Sections</h1>
        <p className="mt-2 text-gray-600">
          Manage your wedding website content. Drag sections to reorder, toggle visibility, or add new sections.
        </p>
      </div>

      <ContentManager initialSections={sortedSections} />
    </div>
  );
}
