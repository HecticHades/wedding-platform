"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

type DomainStatus = "NONE" | "PENDING" | "VERIFYING" | "VERIFIED" | "FAILED"

interface VerificationStatusProps {
  status: DomainStatus
  customDomain: string | null
  verifiedAt: string | null
  onVerify: () => Promise<{ verified: boolean; error?: string }>
  onRemove: () => Promise<{ success: boolean; error?: string }>
}

const statusConfig: Record<DomainStatus, {
  label: string
  icon: typeof CheckCircle
  color: string
  bgColor: string
}> = {
  NONE: {
    label: "No Domain",
    icon: AlertCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  PENDING: {
    label: "Pending DNS Setup",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  VERIFYING: {
    label: "Verifying",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  VERIFIED: {
    label: "Verified",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  FAILED: {
    label: "Verification Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
}

export function VerificationStatus({
  status,
  customDomain,
  verifiedAt,
  onVerify,
  onRemove,
}: VerificationStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = statusConfig[status]
  const Icon = config.icon

  const handleVerify = async () => {
    setIsVerifying(true)
    setError(null)
    try {
      const result = await onVerify()
      if (!result.verified && result.error) {
        setError(result.error)
      }
    } catch {
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this custom domain?")) {
      return
    }
    setIsRemoving(true)
    setError(null)
    try {
      const result = await onRemove()
      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch {
      setError("Failed to remove domain. Please try again.")
    } finally {
      setIsRemoving(false)
    }
  }

  if (!customDomain) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.color} ${status === "VERIFYING" ? "animate-spin" : ""}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{customDomain}</p>
            <p className={`text-sm ${config.color}`}>{config.label}</p>
          </div>
        </div>
        {status === "VERIFIED" && verifiedAt && (
          <p className="text-xs text-gray-500">
            Verified {new Date(verifiedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {status !== "VERIFIED" && (
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isVerifying ? "animate-spin" : ""}`} />
            {isVerifying ? "Checking..." : "Check Verification"}
          </button>
        )}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRemoving ? "Removing..." : "Remove Domain"}
        </button>
      </div>

      {/* SSL Note for Verified Domains */}
      {status === "VERIFIED" && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-800">
            <strong>SSL Active:</strong> Your custom domain is verified and has a valid SSL certificate.
            Guests can visit your wedding site at{" "}
            <a
              href={`https://${customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              https://{customDomain}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
