import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Camera, Heart, XCircle } from "lucide-react";
import Link from "next/link";
import { GuestUploader } from "@/components/photos/GuestUploader";

interface PageProps {
  params: Promise<{ domain: string }>;
}

/**
 * Guest photo upload page - QR code destination.
 * Mobile-optimized for quick photo sharing from event.
 */
export default async function GuestUploadPage({ params }: PageProps) {
  const { domain } = await params;

  // Look up tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: domain },
    include: {
      wedding: {
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
          photoSharingEnabled: true,
        },
      },
    },
  });

  if (!tenant || !tenant.wedding) {
    notFound();
  }

  const { wedding } = tenant;

  // Photo sharing disabled
  if (!wedding.photoSharingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <XCircle className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Photo Uploads Not Available
          </h1>
          <p className="mt-4 text-gray-600">
            Photo sharing is not currently enabled for this wedding.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            &larr; Back to wedding site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500/30" />
          <Camera className="w-8 h-8 text-blue-600" />
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500/30" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Share Your Photos
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {wedding.partner1Name} & {wedding.partner2Name}&apos;s Wedding
        </p>
      </header>

      {/* Upload form */}
      <main className="px-4 pb-12 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-6">
            Upload your photos from the celebration! The couple will review and
            add them to the wedding gallery.
          </p>

          <GuestUploader weddingId={wedding.id} />
        </div>

        {/* Gallery link */}
        <div className="mt-8 text-center">
          <Link
            href="/photos"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View the photo gallery &rarr;
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            &larr; Back to wedding site
          </Link>
        </div>
      </main>
    </div>
  );
}
