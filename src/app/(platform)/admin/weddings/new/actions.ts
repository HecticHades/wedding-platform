"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { redirect } from "next/navigation"
import { z } from "zod"

const createWeddingSchema = z.object({
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(63, "Subdomain must be at most 63 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  partner1Name: z.string().min(1, "Partner 1 name is required"),
  partner2Name: z.string().min(1, "Partner 2 name is required"),
  coupleEmail: z.string().email("Valid email required"),
  couplePassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function createWeddingSite(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const parsed = createWeddingSchema.safeParse({
    subdomain: formData.get("subdomain"),
    partner1Name: formData.get("partner1Name"),
    partner2Name: formData.get("partner2Name"),
    coupleEmail: formData.get("coupleEmail"),
    couplePassword: formData.get("couplePassword"),
  })

  if (!parsed.success) {
    // In production, would return error state. For now, throw.
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "))
  }

  const data = parsed.data

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
        email: data.coupleEmail,
        hashedPassword: await hashPassword(data.couplePassword),
        name: `${data.partner1Name} & ${data.partner2Name}`,
        role: "couple",
        tenantId: tenant.id,
      },
    })
  })

  redirect("/admin/weddings")
}
