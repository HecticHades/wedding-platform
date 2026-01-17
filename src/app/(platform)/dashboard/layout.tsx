import { auth, signOut } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Palette,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Gift,
  Camera,
  Mail,
  Grid3X3,
  Globe
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/dashboard/theme", label: "Theme", icon: Palette },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/rsvp", label: "RSVPs", icon: CheckSquare },
  { href: "/dashboard/registry", label: "Registry", icon: Gift },
  { href: "/dashboard/photos", label: "Photos", icon: Camera },
  { href: "/dashboard/messaging", label: "Messaging", icon: Mail },
  { href: "/dashboard/seating", label: "Seating", icon: Grid3X3 },
  { href: "/dashboard/domain", label: "Domain", icon: Globe },
]

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
            <div className="flex space-x-6 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 text-sm whitespace-nowrap ${
                      item.href === "/dashboard"
                        ? "font-semibold text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{session.user.email}</span>
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
