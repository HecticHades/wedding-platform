"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface HeroImageSettings {
  url: string;
  alt?: string;
  overlay: "none" | "light" | "dark" | "gradient";
  overlayOpacity: number;
  position: "top" | "center" | "bottom";
}

interface HeroImageUploaderProps {
  value: HeroImageSettings | undefined;
  onChange: (settings: HeroImageSettings | undefined) => void;
}

const OVERLAY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "gradient", label: "Gradient" },
] as const;

const POSITION_OPTIONS = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
] as const;

export function HeroImageUploader({ value, onChange }: HeroImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/hero", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadProgress(100);

      // Set default settings for new image
      onChange({
        url: result.url,
        alt: "",
        overlay: "dark",
        overlayOpacity: 40,
        position: "center",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      } else {
        setError("Please drop an image file (JPEG, PNG, or WebP)");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = async () => {
    if (!value?.url) return;

    try {
      await fetch("/api/upload/hero", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value.url }),
      });
    } catch {
      // Continue even if delete fails
    }

    onChange(undefined);
  };

  const updateSettings = (updates: Partial<HeroImageSettings>) => {
    if (!value) return;
    onChange({ ...value, ...updates });
  };

  const getOverlayStyle = () => {
    if (!value || value.overlay === "none") return {};

    const opacity = value.overlayOpacity / 100;

    switch (value.overlay) {
      case "light":
        return { backgroundColor: `rgba(255, 255, 255, ${opacity})` };
      case "dark":
        return { backgroundColor: `rgba(0, 0, 0, ${opacity})` };
      case "gradient":
        return {
          background: `linear-gradient(to bottom, rgba(0,0,0,${opacity * 0.3}) 0%, rgba(0,0,0,${opacity}) 100%)`,
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload zone or preview */}
      {!value?.url ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? "border-violet-500 bg-violet-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="h-10 w-10 mx-auto text-violet-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drop your hero image here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, or WebP up to 4MB
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Recommended: 1920x1080 or wider (21:9 aspect ratio)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview with overlay */}
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={value.url}
              alt={value.alt || "Hero image preview"}
              className="w-full h-full object-cover"
              style={{
                objectPosition: value.position === "top"
                  ? "top"
                  : value.position === "bottom"
                  ? "bottom"
                  : "center",
              }}
            />
            {/* Overlay preview */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={getOverlayStyle()}
            />

            {/* Preview text to show contrast */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-white text-xl font-medium drop-shadow-lg">
                  Preview Text
                </p>
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Settings panel */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            {/* Alt text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={value.alt || ""}
                onChange={(e) => updateSettings({ alt: e.target.value })}
                placeholder="Describe the image..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            {/* Overlay type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Overlay Type
              </label>
              <div className="flex gap-2">
                {OVERLAY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateSettings({ overlay: option.value as HeroImageSettings["overlay"] })
                    }
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${value.overlay === option.value
                        ? "bg-violet-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay opacity - only show if overlay is not "none" */}
            {value.overlay !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Overlay Opacity: {value.overlayOpacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={value.overlayOpacity}
                  onChange={(e) =>
                    updateSettings({ overlayOpacity: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Light (10%)</span>
                  <span>Heavy (80%)</span>
                </div>
              </div>
            )}

            {/* Image position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Image Position
              </label>
              <div className="flex gap-2">
                {POSITION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateSettings({ position: option.value as HeroImageSettings["position"] })
                    }
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${value.position === option.value
                        ? "bg-violet-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Empty state hint */}
      {!value?.url && !isUploading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ImageIcon className="h-4 w-4" />
          <span>A hero image makes your wedding site feel personal and memorable</span>
        </div>
      )}
    </div>
  );
}
