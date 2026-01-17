export interface DnsInstructions {
  recordType: "A" | "CNAME"
  name: string
  value: string
  instructions: string
  isApex: boolean
}

export interface TxtVerification {
  type: "TXT"
  name: string
  value: string
  reason: string
}

/**
 * Generate DNS instructions based on domain type (apex vs subdomain)
 * Apex domains (example.com) need A record
 * Subdomains (www.example.com) need CNAME record
 */
export function getDnsInstructions(domain: string): DnsInstructions {
  const parts = domain.split(".")
  const isApex = parts.length === 2 || (parts.length === 3 && parts[0] === "www")

  if (isApex) {
    return {
      recordType: "A",
      name: "@",
      value: "76.76.21.21", // Vercel's IP address
      instructions: "Add an A record pointing your domain to Vercel's IP address. This allows your apex domain to work with Vercel.",
      isApex: true,
    }
  } else {
    // Subdomain - extract the subdomain part
    const subdomain = parts[0]
    return {
      recordType: "CNAME",
      name: subdomain,
      value: "cname.vercel-dns.com",
      instructions: `Add a CNAME record for "${subdomain}" pointing to Vercel's DNS. This allows your subdomain to work with Vercel.`,
      isApex: false,
    }
  }
}

/**
 * Parse TXT verification challenge from Vercel API response
 */
export function getTxtVerification(
  verification: Array<{ type: string; domain: string; value: string }> | null | undefined
): TxtVerification | null {
  if (!verification) return null

  const txtRecord = verification.find((v) => v.type === "TXT")
  if (!txtRecord) return null

  return {
    type: "TXT",
    name: "_vercel",
    value: txtRecord.value,
    reason: "This domain was previously used on Vercel. Add this TXT record to verify ownership.",
  }
}
