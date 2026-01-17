"use client";

import { useState, useTransition, useRef } from "react";
import {
  Trash2,
  Check,
  AlertCircle,
  Upload,
  ChevronUp,
  ChevronDown,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { updateSectionContent } from "@/app/(platform)/dashboard/content/[section]/actions";

interface Photo {
  url: string;
  caption?: string;
  order: number;
}

interface CouplePhotoUploaderProps {
  initialPhotos: Photo[];
  galleryTitle: string;
}

/**
 * Photo uploader for couple's own photos
 * Saves to wedding contentSections gallery
 */
export function CouplePhotoUploader({
  initialPhotos,
  galleryTitle: initialTitle,
}: CouplePhotoUploaderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setStatus("idle");
    setErrorMessage("");

    const newPhotos: Photo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        newPhotos.push({
          url: data.url,
          caption: "",
          order: photos.length + newPhotos.length,
        });
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to upload image"
        );
        break;
      }
    }

    if (newPhotos.length > 0) {
      setPhotos([...photos, ...newPhotos]);
    }

    setIsUploading(false);
    setUploadProgress(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    // Re-number remaining photos
    setPhotos(updated.map((p, i) => ({ ...p, order: i })));
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], caption };
    setPhotos(updated);
  };

  const movePhoto = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === photos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...photos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Re-number after swap
    setPhotos(updated.map((p, i) => ({ ...p, order: i })));
  };

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Please enter a gallery title.");
      return;
    }

    startTransition(async () => {
      const content: PrismaJson.GalleryContent = {
        type: "gallery",
        title: title.trim(),
        photos: photos.map((p, i) => ({
          url: p.url,
          caption: p.caption,
          order: i,
        })),
      };

      const result = await updateSectionContent("gallery", content);

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to save");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="h-5 w-5" />
          Photos saved successfully!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gallery Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Our Engagement Photos, Memories Together"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Upload section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Photos</h2>

        {/* Upload button */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="couple-photo-upload"
          />
          <label
            htmlFor="couple-photo-upload"
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isUploading
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-500 hover:text-blue-600"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadProgress}
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Click to upload photos (max 4MB each)
              </>
            )}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: JPEG, PNG, WebP, GIF
          </p>
        </div>

        {/* Photo grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={`${photo.url}-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              >
                {/* Image thumbnail */}
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Photo controls */}
                <div className="p-3 space-y-2">
                  {/* Caption input */}
                  <input
                    type="text"
                    value={photo.caption || ""}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, "down")}
                        disabled={index === photos.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No photos uploaded yet.</p>
            <p className="text-sm mt-1">
              Upload your favorite photos to share with your guests.
            </p>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isUploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
