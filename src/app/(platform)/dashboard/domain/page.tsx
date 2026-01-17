"use client"

import { useEffect, useState, useCallback } from "react"
import { DomainConfigForm } from "@/components/domains/DomainConfigForm"
import { DnsInstructions } from "@/components/domains/DnsInstructions"
import { VerificationStatus } from "@/components/domains/VerificationStatus"
import { Globe } from "lucide-react"

type DomainStatus = "NONE" | "PENDING" | "VERIFYING" | "VERIFIED" | "FAILED"

interface DnsRecord {
  recordType: "A" | "CNAME"
  name: string
  value: string
  instructions: string
  isApex: boolean
}

interface TxtVerification {
  type: "TXT"
  name: string
  value: string
  reason: string
}

interface DomainStatusData {
  status: DomainStatus
  customDomain: string | null
  verified: boolean
  dnsInstructions: DnsRecord | null
  txtVerification: TxtVerification | null
  addedAt: string | null
  verifiedAt: string | null
}

export default function DomainSettingsPage() {
  const [statusData, setStatusData] = useState<DomainStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/domains/status")
      if (!response.ok) {
        throw new Error("Failed to fetch domain status")
      }
      const data = await response.json()
      setStatusData(data)
      setError(null)
    } catch (err) {
      setError("Failed to load domain settings")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleAddDomain = async (domain: string) => {
    const response = await fetch("/api/domains/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error }
    }

    // Refresh status after adding
    await fetchStatus()
    return { success: true }
  }

  const handleVerify = async () => {
    const response = await fetch("/api/domains/verify", {
      method: "POST",
    })

    const data = await response.json()

    // Refresh status after verification attempt
    await fetchStatus()

    return {
      verified: data.verified ?? false,
      error: data.error,
    }
  }

  const handleRemove = async () => {
    const response = await fetch("/api/domains/remove", {
      method: "DELETE",
    })

    const data = await response.json()

    if (response.ok) {
      // Refresh status after removal
      await fetchStatus()
    }

    return {
      success: response.ok,
      error: data.error,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  const hasDomain = statusData?.customDomain && statusData.status !== "NONE"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Custom Domain</h1>
        <p className="text-gray-600 mt-1">
          Use your own domain for your wedding website (e.g., aliceandbobwedding.com)
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {!hasDomain ? (
          /* No domain configured - show form */
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Add Your Domain</h2>
                <p className="text-sm text-gray-500">
                  Connect a domain you own to your wedding site
                </p>
              </div>
            </div>
            <DomainConfigForm onAdd={handleAddDomain} />
          </div>
        ) : (
          /* Domain configured - show status and instructions */
          <div className="space-y-6">
            {/* Verification Status */}
            <VerificationStatus
              status={statusData!.status}
              customDomain={statusData!.customDomain}
              verifiedAt={statusData!.verifiedAt}
              onVerify={handleVerify}
              onRemove={handleRemove}
            />

            {/* DNS Instructions (show when pending or failed) */}
            {statusData!.status !== "VERIFIED" &&
              statusData!.dnsInstructions && (
                <div className="border-t border-gray-200 pt-6">
                  <DnsInstructions
                    dnsInstructions={statusData!.dnsInstructions}
                    txtVerification={statusData!.txtVerification}
                  />
                </div>
              )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Enter the domain you own (you must have access to its DNS settings)</li>
          <li>Add the DNS records shown to your domain registrar</li>
          <li>Click "Check Verification" once you've configured DNS</li>
          <li>Once verified, your wedding site will be available at your custom domain with HTTPS</li>
        </ol>
      </div>
    </div>
  )
}
