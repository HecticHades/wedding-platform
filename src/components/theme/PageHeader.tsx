"use client";

import { Heart, Camera, MapPin, Mail } from "lucide-react";
import { ReactNode } from "react";

type IconType = "heart" | "camera" | "location" | "mail";

interface PageHeaderProps {
  partner1Name: string;
  partner2Name: string;
  weddingDate?: string | null;
  icon?: IconType;
  subtitle?: string;
  children?: ReactNode;
}

const iconMap: Record<IconType, ReactNode> = {
  heart: (
    <Heart className="w-10 h-10 text-wedding-secondary fill-wedding-secondary/30" />
  ),
  camera: (
    <div className="flex items-center gap-2">
      <Heart className="w-6 h-6 text-wedding-secondary fill-wedding-secondary/30" />
      <Camera className="w-8 h-8 text-wedding-primary" />
      <Heart className="w-6 h-6 text-wedding-secondary fill-wedding-secondary/30" />
    </div>
  ),
  location: <MapPin className="w-10 h-10 text-wedding-secondary" />,
  mail: <Mail className="w-10 h-10 text-wedding-secondary" />,
};

/**
 * Consistent page header component for tenant pages.
 * Shows couple names, optional date, icon, and subtitle.
 */
export function PageHeader({
  partner1Name,
  partner2Name,
  weddingDate,
  icon = "heart",
  subtitle,
  children,
}: PageHeaderProps) {
  return (
    <header className="text-center mb-12">
      {/* Icon */}
      <div className="mb-6 flex justify-center">{iconMap[icon]}</div>

      {/* Couple names */}
      <h1 className="font-wedding-heading text-3xl sm:text-4xl md:text-5xl text-wedding-primary mb-3">
        {partner1Name}
        <span className="block text-lg sm:text-xl md:text-2xl my-2 text-wedding-secondary font-wedding">
          &amp;
        </span>
        {partner2Name}
      </h1>

      {/* Wedding date */}
      {weddingDate && (
        <p className="font-wedding text-wedding-text/70 mt-4">{weddingDate}</p>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="mt-8">
          <p className="font-wedding text-sm uppercase tracking-widest text-wedding-secondary/80">
            {subtitle}
          </p>
        </div>
      )}

      {/* Additional content */}
      {children}
    </header>
  );
}
