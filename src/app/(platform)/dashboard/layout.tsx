import { auth, signOut } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // If admin tries to access /dashboard, redirect to /admin
  if (session.user.role === "admin") {
    redirect("/admin")
  }

  // Couples must have a tenantId
  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <Link href="/dashboard" className="font-semibold text-gray-900">Dashboard</Link>
              <Link href="/dashboard/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
              <Link href="/dashboard/theme" className="text-gray-600 hover:text-gray-900">Theme</Link>
              <Link href="/dashboard/content" className="text-gray-600 hover:text-gray-900">Content</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}>
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
