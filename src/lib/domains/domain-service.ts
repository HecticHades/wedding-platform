import { vercel, vercelConfig } from "./vercel-client"
import { getDnsInstructions, getTxtVerification, DnsInstructions, TxtVerification } from "./dns-instructions"
import { prisma } from "@/lib/db/prisma"
import { DomainStatus } from "@prisma/client"

export interface AddDomainResult {
  success: boolean
  verified: boolean
  dnsInstructions: DnsInstructions
  txtVerification: TxtVerification | null
  error?: string
}

export interface DomainStatusResult {
  status: DomainStatus
  customDomain: string | null
  verified: boolean
  dnsInstructions: DnsInstructions | null
  txtVerification: TxtVerification | null
  addedAt: Date | null
  verifiedAt: Date | null
}

/**
 * Add a custom domain to a tenant
 * 1. Add domain to Vercel project
 * 2. Store in database with pending status
 * 3. Return DNS instructions for the couple
 */
export async function addCustomDomain(
  tenantId: string,
  domain: string
): Promise<AddDomainResult> {
  // Normalize domain (lowercase, no trailing dots)
  const normalizedDomain = domain.toLowerCase().replace(/\.$/, "")

  try {
    // Check if domain already exists on another tenant
    const existingTenant = await prisma.tenant.findUnique({
      where: { customDomain: normalizedDomain },
    })

    if (existingTenant && existingTenant.id !== tenantId) {
      return {
        success: false,
        verified: false,
        dnsInstructions: getDnsInstructions(normalizedDomain),
        txtVerification: null,
        error: "This domain is already in use by another wedding site.",
      }
    }

    // Add domain to Vercel project
    const result = await vercel.projects.addProjectDomain({
      idOrName: vercelConfig.projectId,
      teamId: vercelConfig.teamId,
      requestBody: {
        name: normalizedDomain,
      },
    })

    // Update tenant in database
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: normalizedDomain,
        domainStatus: result.verified ? DomainStatus.VERIFIED : DomainStatus.PENDING,
        domainVerification: result.verification as unknown as object ?? null,
        domainAddedAt: new Date(),
        domainVerifiedAt: result.verified ? new Date() : null,
      },
    })

    return {
      success: true,
      verified: result.verified ?? false,
      dnsInstructions: getDnsInstructions(normalizedDomain),
      txtVerification: getTxtVerification(result.verification as Array<{ type: string; domain: string; value: string }> | undefined),
    }
  } catch (error) {
    console.error("Failed to add custom domain:", error)

    // Handle specific Vercel API errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return {
      success: false,
      verified: false,
      dnsInstructions: getDnsInstructions(normalizedDomain),
      txtVerification: null,
      error: `Failed to add domain: ${errorMessage}`,
    }
  }
}

/**
 * Verify a custom domain
 * Triggers Vercel to check DNS configuration
 */
export async function verifyDomain(tenantId: string): Promise<{
  success: boolean
  verified: boolean
  error?: string
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!tenant?.customDomain) {
    return { success: false, verified: false, error: "No custom domain configured" }
  }

  try {
    const result = await vercel.projects.verifyProjectDomain({
      idOrName: vercelConfig.projectId,
      domain: tenant.customDomain,
      teamId: vercelConfig.teamId,
    })

    const newStatus = result.verified
      ? DomainStatus.VERIFIED
      : DomainStatus.VERIFYING

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        domainStatus: newStatus,
        domainVerifiedAt: result.verified ? new Date() : null,
      },
    })

    return {
      success: true,
      verified: result.verified ?? false,
    }
  } catch (error) {
    console.error("Failed to verify domain:", error)

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { domainStatus: DomainStatus.FAILED },
    })

    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}

/**
 * Remove a custom domain from a tenant
 */
export async function removeDomain(tenantId: string): Promise<{
  success: boolean
  error?: string
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!tenant?.customDomain) {
    return { success: false, error: "No custom domain configured" }
  }

  try {
    await vercel.projects.removeProjectDomain({
      idOrName: vercelConfig.projectId,
      domain: tenant.customDomain,
      teamId: vercelConfig.teamId,
    })

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: null,
        domainStatus: DomainStatus.NONE,
        domainVerification: null,
        domainAddedAt: null,
        domainVerifiedAt: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to remove domain:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove domain",
    }
  }
}

/**
 * Get current domain status for a tenant
 */
export async function getDomainStatus(tenantId: string): Promise<DomainStatusResult> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!tenant) {
    return {
      status: DomainStatus.NONE,
      customDomain: null,
      verified: false,
      dnsInstructions: null,
      txtVerification: null,
      addedAt: null,
      verifiedAt: null,
    }
  }

  return {
    status: tenant.domainStatus,
    customDomain: tenant.customDomain,
    verified: tenant.domainStatus === DomainStatus.VERIFIED,
    dnsInstructions: tenant.customDomain
      ? getDnsInstructions(tenant.customDomain)
      : null,
    txtVerification: tenant.domainVerification
      ? getTxtVerification(tenant.domainVerification as Array<{ type: string; domain: string; value: string }>)
      : null,
    addedAt: tenant.domainAddedAt,
    verifiedAt: tenant.domainVerifiedAt,
  }
}
