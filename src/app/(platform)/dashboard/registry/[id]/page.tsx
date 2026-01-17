import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GiftForm } from "@/components/registry/GiftForm";

interface EditGiftPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGiftPage({ params }: EditGiftPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Fetch gift with tenant context
  const gift = await withTenantContext(session.user.tenantId, async () => {
    return prisma.giftItem.findFirst({
      where: { id },
    });
  });

  if (!gift) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header with back link */}
      <div className="mb-8">
        <Link
          href="/dashboard/registry"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registry
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Gift</h1>
        <p className="mt-2 text-gray-600">
          Update the details for &quot;{gift.name}&quot;.
        </p>
      </div>

      {/* Gift form with existing data */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <GiftForm gift={gift} />
      </div>
    </div>
  );
}
