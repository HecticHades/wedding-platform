import { auth, signOut } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Defense-in-depth: middleware checks, but verify here too (CVE-2025-29927)
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const handleSignOut = async () => {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <AdminShell
      userEmail={session.user.email || ""}
      signOutAction={handleSignOut}
    >
      {children}
    </AdminShell>
  )
}
