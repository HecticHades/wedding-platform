import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CreateWeddingForm } from "./CreateWeddingForm"

export default async function CreateWeddingPage() {
  const session = await auth()

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/weddings"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          &larr; Back to Weddings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Create New Wedding
        </h1>
      </div>

      <CreateWeddingForm />
    </div>
  )
}
