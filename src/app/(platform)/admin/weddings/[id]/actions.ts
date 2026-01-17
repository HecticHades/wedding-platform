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

export type UpdateWeddingState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function updateWeddingDetails(
  _prevState: UpdateWeddingState,
  formData: FormData
): Promise<UpdateWeddingState> {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" }
  }

  const parsed = updateWeddingSchema.safeParse({
    weddingId: formData.get("weddingId"),
    partner1Name: formData.get("partner1Name"),
    partner2Name: formData.get("partner2Name"),
    subdomain: formData.get("subdomain"),
    weddingDate: formData.get("weddingDate") || undefined,
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

  // Get wedding to find tenantId
  const wedding = await prisma.wedding.findUnique({
    where: { id: data.weddingId },
    select: { tenantId: true },
  })

  if (!wedding) {
    return { success: false, error: "Wedding not found" }
  }

  // Check if subdomain is taken by another tenant
  const existingTenant = await prisma.tenant.findFirst({
    where: {
      subdomain: data.subdomain,
      id: { not: wedding.tenantId },
    },
  })

  if (existingTenant) {
    return { success: false, fieldErrors: { subdomain: "This subdomain is already taken" } }
  }

  try {
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
  } catch {
    return { success: false, error: "Failed to update wedding. Please try again." }
  }

  revalidatePath(`/admin/weddings/${data.weddingId}`)
  revalidatePath("/admin/weddings")

  return { success: true }
}

export async function deleteWedding(weddingId: string) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" }
  }

  // Get wedding to find tenantId
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { tenantId: true },
  })

  if (!wedding) {
    return { success: false, error: "Wedding not found" }
  }

  try {
    // Delete tenant (cascade deletes wedding) and associated user
    await prisma.$transaction(async (tx) => {
      // Delete user associated with this tenant first
      await tx.user.deleteMany({
        where: { tenantId: wedding.tenantId },
      })

      // Delete tenant (which cascades to delete wedding and all related data)
      await tx.tenant.delete({
        where: { id: wedding.tenantId },
      })
    })

    revalidatePath("/admin/weddings")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete wedding" }
  }
}
