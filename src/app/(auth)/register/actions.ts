"use server"

import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { redirect } from "next/navigation"
import { z } from "zod"

const registerSchema = z.object({
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(63, "Subdomain must be at most 63 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  partner1Name: z.string().min(1, "Your name is required"),
  partner2Name: z.string().min(1, "Partner's name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegisterState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function registerCouple(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    subdomain: formData.get("subdomain"),
    partner1Name: formData.get("partner1Name"),
    partner2Name: formData.get("partner2Name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const error of parsed.error.errors) {
      if (error.path[0]) {
        fieldErrors[error.path[0].toString()] = error.message
      }
    }
    return { success: false, fieldErrors }
  }

  const data = parsed.data

  // Check if subdomain is taken
  const existingTenant = await prisma.tenant.findUnique({
    where: { subdomain: data.subdomain },
  })

  if (existingTenant) {
    return {
      success: false,
      fieldErrors: { subdomain: "This subdomain is already taken" },
    }
  }

  // Check if email is taken
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return {
      success: false,
      fieldErrors: { email: "An account with this email already exists" },
    }
  }

  try {
    // Create tenant, wedding, and user in transaction
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          subdomain: data.subdomain,
          name: `${data.partner1Name} & ${data.partner2Name}`,
        },
      })

      await tx.wedding.create({
        data: {
          tenantId: tenant.id,
          partner1Name: data.partner1Name,
          partner2Name: data.partner2Name,
        },
      })

      await tx.user.create({
        data: {
          email: data.email,
          hashedPassword: await hashPassword(data.password),
          name: `${data.partner1Name} & ${data.partner2Name}`,
          role: "couple",
          tenantId: tenant.id,
        },
      })
    })
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }

  redirect("/login?registered=true")
}
