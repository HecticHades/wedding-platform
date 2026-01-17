"use client";

import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { createGuestPhotoRecord } from "@/app/[domain]/photos/upload/actions";

interface GuestUploaderProps {
  weddingId: string;
}

/**
 * Client-side photo uploader for guests.
 * Uses Vercel Blob client upload to support large files (>4.5MB).
 * Mobile-optimized for QR code access.
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
          className="block text-sm font-medium text-gray-700 mb-2"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
        />
      </div>

      {/* Upload area */}
      <div>
        <label
          htmlFor="photos"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-gray-600">
                  Uploading {uploadedCount} of {totalFiles}...
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full mt-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  Tap to select photos
                </p>
                <p className="text-xs text-gray-500 mt-1">
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
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success message */}
      {successCount > 0 && !isUploading && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-700">
              {successCount} photo{successCount !== 1 ? "s" : ""} uploaded
              successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">
              The couple will review your photos before they appear in the
              gallery.
            </p>
          </div>
        </div>
      )}

      {/* Upload another button */}
      {successCount > 0 && !isUploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Upload className="w-5 h-5" />
          Upload More Photos
        </button>
      )}
    </div>
  );
}
