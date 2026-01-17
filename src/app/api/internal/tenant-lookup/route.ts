import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { DomainStatus } from "@prisma/client"

// Internal API secret for middleware-to-API communication
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "default-internal-secret-change-in-production"

/**
 * Internal API for tenant lookup by custom domain
 * Called from middleware (Edge runtime) which cannot access Prisma directly
 *
 * Security: Requires internal API secret header to prevent external abuse
 * Only returns tenant if domain is verified
 */
export async function GET(request: NextRequest) {
  // Verify internal API secret
  const providedSecret = request.headers.get("x-internal-secret")
  if (providedSecret !== INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const domain = request.nextUrl.searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 })
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: domain.toLowerCase() },
      select: {
        id: true,
        subdomain: true,
        customDomain: true,
        domainStatus: true,
      },
    })

    // Only return tenant if domain is verified
    if (!tenant || tenant.domainStatus !== DomainStatus.VERIFIED) {
      return NextResponse.json({ tenant: null })
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
      },
    })
  } catch (error) {
    console.error("Tenant lookup error:", error)
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
  }
}
