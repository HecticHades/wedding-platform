import { auth } from "@/lib/auth/auth"
import { removeDomain } from "@/lib/domains/domain-service"
import { NextResponse } from "next/server"

export async function DELETE() {
  const session = await auth()

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await removeDomain(session.user.tenantId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove domain error:", error)
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    )
  }
}
