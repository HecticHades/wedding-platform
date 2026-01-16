"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateWeddingSchema = z.object({
  weddingId: z.string().min(1),
  partner1Name: z.string().min(1, "Partner 1 name is required"),
  partner2Name: z.string().min(1, "Partner 2 name is required"),
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  weddingDate: z.string().optional(),
})

export async function updateWeddingDetails(formData: FormData) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const parsed = updateWeddingSchema.safeParse({
    weddingId: formData.get("weddingId"),
    partner1Name: formData.get("partner1Name"),
    partner2Name: formData.get("partner2Name"),
    subdomain: formData.get("subdomain"),
    weddingDate: formData.get("weddingDate") || undefined,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "))
  }

  const data = parsed.data

  // Get wedding to find tenantId
  const wedding = await prisma.wedding.findUnique({
    where: { id: data.weddingId },
  })

  if (!wedding) {
    throw new Error("Wedding not found")
  }

  // Update wedding and tenant in transaction
  await prisma.$transaction(async (tx) => {
    await tx.wedding.update({
      where: { id: data.weddingId },
      data: {
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
      },
    })

    await tx.tenant.update({
      where: { id: wedding.tenantId },
      data: {
        subdomain: data.subdomain,
        name: `${data.partner1Name} & ${data.partner2Name}`,
      },
    })
  })

  revalidatePath(`/admin/weddings/${data.weddingId}`)
  revalidatePath("/admin/weddings")
}
