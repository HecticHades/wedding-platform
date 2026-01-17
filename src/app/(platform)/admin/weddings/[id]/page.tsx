import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { EditWeddingForm } from "./EditWeddingForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminWeddingDetailPage({ params }: Props) {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  const { id } = await params

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      tenant: true,
    },
  })

  if (!wedding) {
    notFound()
  }

  // Find the couple user for this wedding
  const coupleUser = await prisma.user.findFirst({
    where: { tenantId: wedding.tenantId, role: "couple" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/weddings"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            &larr; Back to Weddings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>
          <p className="text-gray-600">Subdomain: {wedding.tenant.subdomain}</p>
        </div>
      </div>

      <EditWeddingForm
        wedding={wedding}
        coupleEmail={coupleUser?.email || null}
      />
    </div>
  )
}
