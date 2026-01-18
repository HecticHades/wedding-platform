"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getTenantUrl, getTenantUrlDisplay } from "@/lib/url-utils";

interface SitePreviewCardProps {
  subdomain: string;
  weddingDate?: Date | null;
}

export function SitePreviewCard({
  subdomain,
  weddingDate,
}: SitePreviewCardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const siteUrl = getTenantUrl(subdomain);
  const siteUrlDisplay = getTenantUrlDisplay(subdomain);

  const daysUntil = weddingDate
    ? Math.ceil(
        (new Date(weddingDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="bg-white rounded-xl border border-[#e8e4e0] overflow-hidden shadow-bento">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4e0]">
        <div>
          <h3 className="font-semibold text-[#3d3936]">Your Wedding Website</h3>
          <p className="text-sm text-[#3d3936]/60">{siteUrlDisplay}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-lg hover:bg-[#e8e4e0] text-[#3d3936]/60 hover:text-[#3d3936] transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c4a4a4] text-white text-sm font-medium hover:bg-[#b39393] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Visit Site
          </a>
        </div>
      </div>

      {/* Preview iframe container */}
      <div className="relative bg-gray-100 aspect-[16/10]">
        {/* Countdown overlay */}
        {daysUntil !== null && daysUntil > 0 && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-[#e8e4e0]">
            <p className="text-xs text-[#3d3936]/60 uppercase tracking-wider">
              Days Until
            </p>
            <p className="text-2xl font-bold font-cormorant text-[#c9a962]">
              {daysUntil}
            </p>
          </div>
        )}

        {/* Scaled iframe preview */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="origin-top-left"
            style={{
              width: "1280px",
              height: "800px",
              transform: "scale(0.5)",
              transformOrigin: "top left",
            }}
          >
            <iframe
              key={refreshKey}
              src={siteUrl}
              className="w-full h-full border-0"
              title="Wedding site preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        {/* Clickable overlay to open site */}
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-20 cursor-pointer group"
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-lg text-sm font-medium text-[#3d3936] shadow-lg transition-opacity">
              Click to open in new tab
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
