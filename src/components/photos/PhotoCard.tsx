import Image from "next/image";
import { User } from "lucide-react";

interface PhotoCardProps {
  url: string;
  caption?: string | null;
  uploadedBy?: string | null;
  isGuestPhoto?: boolean;
  index: number;
  onClick: () => void;
}

/**
 * Photo card for gallery grid.
 * Shows thumbnail with caption and guest photo badge.
 */
export function PhotoCard({
  url,
  caption,
  uploadedBy,
  isGuestPhoto,
  onClick,
}: PhotoCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <Image
        src={url}
        alt={caption || "Wedding photo"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      {/* Guest photo badge */}
      {isGuestPhoto && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          <User className="w-3 h-3" />
          <span>Guest</span>
        </div>
      )}

      {/* Caption overlay */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium truncate">{caption}</p>
          {uploadedBy && (
            <p className="text-white/80 text-xs mt-0.5">by {uploadedBy}</p>
          )}
        </div>
      )}
    </button>
  );
}
