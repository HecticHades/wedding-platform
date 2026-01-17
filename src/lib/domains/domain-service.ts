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

// ============================================
// Security: Domain blocklist
// Prevents DNS rebinding, subdomain takeover, and abuse
// ============================================

const BLOCKED_DOMAINS = [
  // Localhost and loopback
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  // Reserved TLDs (RFC 2606, RFC 6761)
  ".test",
  ".example",
  ".invalid",
  ".localhost",
  ".local",
  ".internal",
  ".onion",
  // Platform domains - prevent subdomain takeover
  ".vercel.app",
  ".vercel.dev",
  ".now.sh",
]

// Patterns for private IP ranges (DNS rebinding protection)
const PRIVATE_IP_PATTERNS = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^127\./,                   // 127.0.0.0/8 (loopback)
  /^169\.254\./,              // 169.254.0.0/16 (link-local)
  /^0\./,                     // 0.0.0.0/8
]

/**
 * Check if a domain is blocked for security reasons
 */
function isBlockedDomain(domain: string): { blocked: boolean; reason?: string } {
  const lowerDomain = domain.toLowerCase()

  // Check exact matches and suffix matches
  for (const blocked of BLOCKED_DOMAINS) {
    if (blocked.startsWith(".")) {
      // Suffix match (e.g., ".vercel.app")
      if (lowerDomain.endsWith(blocked) || lowerDomain === blocked.slice(1)) {
        return { blocked: true, reason: "This domain type is not allowed" }
      }
    } else {
      // Exact match
      if (lowerDomain === blocked || lowerDomain.endsWith(`.${blocked}`)) {
        return { blocked: true, reason: "This domain is not allowed" }
      }
    }
  }

  // Check if domain looks like an IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
    // Check private IP ranges
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(domain)) {
        return { blocked: true, reason: "Private IP addresses are not allowed" }
      }
    }
  }

  // Prevent adding platform subdomains dynamically
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ""
  if (rootDomain && (lowerDomain.endsWith(`.${rootDomain}`) || lowerDomain === rootDomain)) {
    return { blocked: true, reason: "Platform domains cannot be used as custom domains" }
  }

  return { blocked: false }
}

/**
 * Add a custom domain to a tenant
 * 1. Validate domain against blocklist
 * 2. Add domain to Vercel project
 * 3. Store in database with pending status (using transaction)
 * 4. Return DNS instructions for the couple
 */
export async function addCustomDomain(
  tenantId: string,
  domain: string
): Promise<AddDomainResult> {
  // Normalize domain (lowercase, no trailing dots)
  const normalizedDomain = domain.toLowerCase().replace(/\.$/, "")

  // Security: Check domain blocklist
  const blockCheck = isBlockedDomain(normalizedDomain)
  if (blockCheck.blocked) {
    return {
      success: false,
      verified: false,
      dnsInstructions: getDnsInstructions(normalizedDomain),
      txtVerification: null,
      error: blockCheck.reason,
    }
  }

  try {
    // Use transaction to prevent race condition when checking/adding domain
    const result = await prisma.$transaction(async (tx) => {
      // Check if domain already exists on another tenant
      const existingTenant = await tx.tenant.findUnique({
        where: { customDomain: normalizedDomain },
      })

      if (existingTenant && existingTenant.id !== tenantId) {
        return {
          success: false as const,
          error: "This domain is already in use by another wedding site.",
        }
      }

      // Add domain to Vercel project
      const vercelResult = await vercel.projects.addProjectDomain({
        idOrName: vercelConfig.projectId,
        teamId: vercelConfig.teamId,
        requestBody: {
          name: normalizedDomain,
        },
      })

      // Update tenant in database
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          customDomain: normalizedDomain,
          domainStatus: vercelResult.verified ? DomainStatus.VERIFIED : DomainStatus.PENDING,
          domainVerification: vercelResult.verification as object | null ?? null,
          domainAddedAt: new Date(),
          domainVerifiedAt: vercelResult.verified ? new Date() : null,
        },
      })

      return {
        success: true as const,
        verified: vercelResult.verified ?? false,
        verification: vercelResult.verification,
      }
    })

    if (!result.success) {
      return {
        success: false,
        verified: false,
        dnsInstructions: getDnsInstructions(normalizedDomain),
        txtVerification: null,
        error: result.error,
      }
    }

    return {
      success: true,
      verified: result.verified,
      dnsInstructions: getDnsInstructions(normalizedDomain),
      txtVerification: getTxtVerification(result.verification as Array<{ type: string; domain: string; value: string }> | undefined),
    }
  } catch (error) {
    // Log full error for debugging but return generic message to user
    console.error("Failed to add custom domain:", error)

    return {
      success: false,
      verified: false,
      dnsInstructions: getDnsInstructions(normalizedDomain),
      txtVerification: null,
      error: "Failed to add domain. Please try again later.",
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
    // Log full error for debugging but return generic message to user
    console.error("Failed to verify domain:", error)

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { domainStatus: DomainStatus.FAILED },
    })

    return {
      success: false,
      verified: false,
      error: "Domain verification failed. Please check your DNS settings and try again.",
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
    // Log full error for debugging but return generic message to user
    console.error("Failed to remove domain:", error)
    return {
      success: false,
      error: "Failed to remove domain. Please try again later.",
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
