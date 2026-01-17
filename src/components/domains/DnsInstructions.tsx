"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

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

interface DnsInstructionsProps {
  dnsInstructions: DnsRecord
  txtVerification?: TxtVerification | null
}

export function DnsInstructions({
  dnsInstructions,
  txtVerification,
}: DnsInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          DNS Configuration Required
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add the following DNS record at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
        </p>
      </div>

      {/* Primary DNS Record */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Type</span>
            <span className="font-mono font-medium">{dnsInstructions.recordType}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Name</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{dnsInstructions.name}</span>
              <button
                onClick={() => copyToClipboard(dnsInstructions.name, "name")}
                className="text-gray-400 hover:text-gray-600"
                title="Copy"
              >
                {copiedField === "name" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Value</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-xs break-all">
                {dnsInstructions.value}
              </span>
              <button
                onClick={() => copyToClipboard(dnsInstructions.value, "value")}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                title="Copy"
              >
                {copiedField === "value" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">{dnsInstructions.instructions}</p>
      </div>

      {/* TXT Verification (if required) */}
      {txtVerification && (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Additional Verification Required
          </h4>
          <p className="text-xs text-yellow-700 mb-3">{txtVerification.reason}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-yellow-600 block mb-1">Type</span>
              <span className="font-mono font-medium text-yellow-900">TXT</span>
            </div>
            <div>
              <span className="text-yellow-600 block mb-1">Name</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-yellow-900">
                  {txtVerification.name}
                </span>
                <button
                  onClick={() => copyToClipboard(txtVerification.name, "txt-name")}
                  className="text-yellow-500 hover:text-yellow-700"
                  title="Copy"
                >
                  {copiedField === "txt-name" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <span className="text-yellow-600 block mb-1">Value</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-yellow-900 text-xs break-all">
                  {txtVerification.value}
                </span>
                <button
                  onClick={() => copyToClipboard(txtVerification.value, "txt-value")}
                  className="text-yellow-500 hover:text-yellow-700 flex-shrink-0"
                  title="Copy"
                >
                  {copiedField === "txt-value" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DNS Propagation Note */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> DNS changes can take up to 48 hours to propagate globally,
          though most changes appear within 1-2 hours. You can click "Check Verification"
          to see if your domain is ready.
        </p>
      </div>
    </div>
  )
}
