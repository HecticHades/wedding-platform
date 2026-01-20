"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (role !== "admin" && role !== "couple") {
    throw new Error("Invalid role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Don't allow deleting yourself
  if (session.user.id === userId) {
    throw new Error("Cannot delete your own account");
  }

  // Delete the user (cascades will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}
