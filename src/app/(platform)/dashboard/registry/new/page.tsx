import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GiftForm } from "@/components/registry/GiftForm";

export default async function NewGiftPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
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
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Add Gift</h1>
        <p className="mt-2 text-gray-600">
          Add a new item to your gift registry.
        </p>
      </div>

      {/* Gift form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <GiftForm />
      </div>
    </div>
  );
}
