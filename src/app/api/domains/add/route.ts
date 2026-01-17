import { auth } from "@/lib/auth/auth"
import { addCustomDomain } from "@/lib/domains/domain-service"
import { NextResponse } from "next/server"
import { z } from "zod"

const addDomainSchema = z.object({
  domain: z
    .string()
    .min(4)
    .max(253)
    .regex(
      /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid domain format"
    ),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { domain } = addDomainSchema.parse(body)

    const result = await addCustomDomain(session.user.tenantId, domain)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      verified: result.verified,
      dnsInstructions: result.dnsInstructions,
      txtVerification: result.txtVerification,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Add domain error:", error)
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    )
  }
}
