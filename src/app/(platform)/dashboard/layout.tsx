import { auth, signOut } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma, withTenantContext } from "@/lib/db/prisma"
import { DashboardShell } from "@/components/dashboard"

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

  // Get subdomain for the sidebar
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      include: { tenant: { select: { subdomain: true } } },
    })
    return { wedding }
  })

  const subdomain = data.wedding?.tenant.subdomain || "your-site"

  const handleSignOut = async () => {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <DashboardShell
      subdomain={subdomain}
      userEmail={session.user.email || ""}
      signOutAction={handleSignOut}
    >
      {children}
    </DashboardShell>
  )
}
