"use client";

import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { createGuestPhotoRecord } from "@/app/[domain]/photos/upload/actions";
import { ThemedButton } from "@/components/theme/ThemedButton";

interface GuestUploaderProps {
  weddingId: string;
}

/**
 * Client-side photo uploader for guests.
 * Uses Vercel Blob client upload to support large files (>4.5MB).
 * Mobile-optimized for QR code access.
 * Fully themed to match tenant's wedding theme.
 */
export function GuestUploader({ weddingId }: GuestUploaderProps) {
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setTotalFiles(files.length);
    setUploadedCount(0);

    let successfulUploads = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));

      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/photos/upload",
          clientPayload: JSON.stringify({
            weddingId,
            guestName: guestName.trim() || "Anonymous",
          }),
        });

        // For local dev: call fallback action to ensure record is created
        // In production, onUploadCompleted webhook handles this
        await createGuestPhotoRecord(
          weddingId,
          blob.url,
          guestName.trim() || undefined
        );

        successfulUploads++;
        setUploadedCount(i + 1);
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        setError(`Failed to upload ${file.name}. Please try again.`);
      }
    }

    setSuccessCount((prev) => prev + successfulUploads);
    setUploadProgress(100);
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Name input */}
      <div>
        <label
          htmlFor="guestName"
          className="block text-sm font-wedding font-medium text-wedding-text mb-2"
        >
          Your Name (optional)
        </label>
        <input
          type="text"
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Enter your name"
          disabled={isUploading}
          className="w-full px-4 py-3 font-wedding border border-wedding-primary/20 bg-white text-wedding-text placeholder:text-wedding-text/40 focus:outline-none focus:ring-2 focus:ring-wedding-primary/30 focus:border-wedding-primary/40 disabled:bg-wedding-background disabled:cursor-not-allowed text-base"
          style={{ borderRadius: "var(--wedding-radius)" }}
        />
      </div>

      {/* Upload area */}
      <div>
        <label
          htmlFor="photos"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed cursor-pointer transition-colors ${
            isUploading
              ? "border-wedding-primary/20 bg-wedding-background cursor-not-allowed"
              : "border-wedding-primary/30 bg-wedding-background hover:bg-wedding-primary/5 hover:border-wedding-primary/50"
          }`}
          style={{ borderRadius: "var(--wedding-radius-lg)" }}
        >
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-wedding-primary animate-spin mb-3" />
                <p className="text-sm font-wedding text-wedding-text/70">
                  Uploading {uploadedCount} of {totalFiles}...
                </p>
                <div
                  className="w-48 h-2 bg-wedding-primary/20 mt-3"
                  style={{ borderRadius: "var(--wedding-radius)" }}
                >
                  <div
                    className="h-full bg-wedding-primary transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      borderRadius: "var(--wedding-radius)",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-wedding-text/40 mb-3" />
                <p className="text-sm font-wedding font-medium text-wedding-text/70">
                  Tap to select photos
                </p>
                <p className="text-xs font-wedding text-wedding-text/50 mt-1">
                  JPG, PNG, WebP, or HEIC (up to 20MB each)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            id="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200"
          style={{ borderRadius: "var(--wedding-radius)" }}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-wedding text-red-700">{error}</p>
        </div>
      )}

      {/* Success message */}
      {successCount > 0 && !isUploading && (
        <div
          className="flex items-start gap-3 p-4 bg-green-50 border border-green-200"
          style={{ borderRadius: "var(--wedding-radius)" }}
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-wedding font-medium text-green-700">
              {successCount} photo{successCount !== 1 ? "s" : ""} uploaded
              successfully!
            </p>
            <p className="text-xs font-wedding text-green-600 mt-1">
              The couple will review your photos before they appear in the
              gallery.
            </p>
          </div>
        </div>
      )}

      {/* Upload another button */}
      {successCount > 0 && !isUploading && (
        <ThemedButton
          variant="primary"
          fullWidth
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-5 h-5" />
          Upload More Photos
        </ThemedButton>
      )}
    </div>
  );
}
