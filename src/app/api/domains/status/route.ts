import { auth } from "@/lib/auth/auth"
import { getDomainStatus } from "@/lib/domains/domain-service"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const status = await getDomainStatus(session.user.tenantId)

    return NextResponse.json(status)
  } catch (error) {
    console.error("Get domain status error:", error)
    return NextResponse.json(
      { error: "Failed to get domain status" },
      { status: 500 }
    )
  }
}
