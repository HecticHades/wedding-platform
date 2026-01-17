import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { GuestForm } from "@/components/guests/GuestForm";
import Link from "next/link";
import { ChevronRight, Home, Users } from "lucide-react";

export default async function NewGuestPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/guests" className="hover:text-gray-700 flex items-center gap-1">
          <Users className="h-4 w-4" />
          Guests
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Add Guest</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Guest</h1>
        <p className="mt-2 text-gray-600">
          Add a new guest to your wedding guest list.
        </p>
      </div>

      {/* Guest form */}
      <div className="max-w-2xl bg-white rounded-lg shadow border border-gray-200 p-6">
        <GuestForm />
      </div>
    </div>
  );
}
