import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Client upload handler for guest photos.
 * Uses Vercel Blob client upload pattern to bypass serverless size limits.
 * Allows uploads up to 20MB for high-resolution photos.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Parse client payload (weddingId, guestName)
        const payload = clientPayload ? JSON.parse(clientPayload) : {};

        if (!payload.weddingId) {
          throw new Error("Missing wedding ID");
        }

        // Validate wedding exists and photo sharing is enabled
        const wedding = await prisma.wedding.findUnique({
          where: { id: payload.weddingId },
          select: { photoSharingEnabled: true },
        });

        if (!wedding) {
          throw new Error("Wedding not found");
        }

        if (!wedding.photoSharingEnabled) {
          throw new Error("Photo sharing is not enabled for this wedding");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
          ],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB for high-res photos
          addRandomSuffix: true,
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Create GuestPhoto record after successful upload
        // Note: This callback requires public URL accessibility (won't fire in local dev without ngrok)
        const payload = tokenPayload ? JSON.parse(tokenPayload) : {};

        await prisma.guestPhoto.create({
          data: {
            weddingId: payload.weddingId,
            url: blob.url,
            uploadedBy: payload.guestName || "Anonymous",
            status: "PENDING",
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
