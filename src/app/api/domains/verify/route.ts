import { auth } from "@/lib/auth/auth"
import { verifyDomain } from "@/lib/domains/domain-service"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await verifyDomain(session.user.tenantId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      verified: result.verified,
    })
  } catch (error) {
    console.error("Verify domain error:", error)
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    )
  }
}
