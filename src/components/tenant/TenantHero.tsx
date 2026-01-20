import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import {
  getOverlayStyle,
  formatWeddingDate,
  getDaysUntilWedding,
} from "@/lib/content/theme-utils";

export interface TenantHeroProps {
  theme: ThemeSettings;
  partner1Name: string;
  partner2Name: string;
  weddingDate?: Date | null;
  domain: string;
  variant?: "home" | "subpage";
  pageTitle?: string;
  pageSubtitle?: string;
  showCountdown?: boolean;
  showNavLinks?: boolean;
  navLinks?: Array<{ href: string; label: string }>;
  ctaButton?: { label: string; href: string };
  showScrollIndicator?: boolean;
}

/**
 * Calculate time breakdown for countdown
 */
function getCountdownParts(weddingDate: Date): {
  months: number;
  days: number;
  totalDays: number;
} {
  const now = new Date();
  const diffTime = weddingDate.getTime() - now.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate months and remaining days
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  return { months, days, totalDays };
}

/**
 * Calculate text color based on background luminance
 */
function getTextColor(primaryColor: string, hasImage: boolean): string {
  if (hasImage) {
    // With images, we use overlay so white text is always readable
    return "#ffffff";
  }

  // Calculate luminance for gradient backgrounds
  const hex = primaryColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // For very light backgrounds, use dark text
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}

/**
 * Reusable hero section for tenant pages.
 * - home variant: 80vh height, full content with countdown
 * - subpage variant: 40vh height, page title above names
 */
export function TenantHero({
  theme,
  partner1Name,
  partner2Name,
  weddingDate,
  domain,
  variant = "home",
  pageTitle,
  pageSubtitle,
  showCountdown = variant === "home",
  showNavLinks = variant === "home",
  navLinks = [],
  ctaButton,
  showScrollIndicator = false,
}: TenantHeroProps) {
  const hasHeroImage = !!theme.heroImage?.url;
  const overlayStyle = hasHeroImage ? getOverlayStyle(theme) : null;
  const countdown = weddingDate ? getCountdownParts(weddingDate) : null;
  const textColor = getTextColor(theme.primaryColor, hasHeroImage);

  const isHome = variant === "home";
  const heightClass = isHome ? "min-h-[80vh]" : "min-h-[40vh]";

  return (
    <header
      className={`relative ${heightClass} flex flex-col items-center justify-center px-4 py-12 md:py-20`}
      style={
        hasHeroImage
          ? { backgroundColor: theme.primaryColor }
          : {
              backgroundColor: theme.primaryColor,
              backgroundImage: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
            }
      }
    >
      {/* Hero image background */}
      {hasHeroImage && theme.heroImage && (
        <Image
          src={theme.heroImage.url}
          alt={theme.heroImage.alt || "Wedding hero image"}
          fill
          priority
          className="object-cover"
          style={{
            objectPosition:
              theme.heroImage.position === "top"
                ? "top"
                : theme.heroImage.position === "bottom"
                ? "bottom"
                : "center",
          }}
        />
      )}

      {/* Hero image overlay */}
      {hasHeroImage && overlayStyle && (
        <div className="absolute inset-0" style={overlayStyle} aria-hidden="true" />
      )}

      {/* Decorative pattern overlay (only when no hero image) */}
      {!hasHeroImage && (
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Page title for subpages */}
        {!isHome && pageTitle && (
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ color: textColor }}
          >
            {pageTitle}
          </p>
        )}

        {/* Tagline for home */}
        {isHome && (
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ color: textColor }}
          >
            We&apos;re getting married!
          </p>
        )}

        {/* Partner names */}
        <h1
          className={`font-bold ${isHome ? "text-5xl md:text-7xl mb-6" : "text-4xl md:text-5xl mb-4"}`}
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: textColor,
          }}
        >
          {partner1Name}
          <span
            className={`block font-normal my-2 ${isHome ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
          >
            &
          </span>
          {partner2Name}
        </h1>

        {/* Page subtitle for subpages */}
        {!isHome && pageSubtitle && (
          <p style={{ color: textColor, opacity: 0.8 }} className="mt-2">
            {pageSubtitle}
          </p>
        )}

        {/* Wedding date with decorative lines */}
        {weddingDate && (
          <div className="flex items-center justify-center gap-4 my-6">
            <div
              className="h-px w-16"
              style={{ backgroundColor: `${textColor}40` }}
              aria-hidden="true"
            />
            <p
              className={`font-light ${isHome ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}
              style={{ color: textColor }}
            >
              {formatWeddingDate(weddingDate)}
            </p>
            <div
              className="h-px w-16"
              style={{ backgroundColor: `${textColor}40` }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Enhanced countdown with frosted glass containers (home only by default) */}
        {showCountdown && countdown && countdown.totalDays > 0 && (
          <div className="mt-8">
            <p
              className="text-sm uppercase tracking-wider opacity-70 mb-4"
              style={{ color: textColor }}
            >
              Days Until We Say &quot;I Do&quot;
            </p>

            {/* Frosted glass countdown containers */}
            <div className="flex items-center justify-center gap-4">
              {countdown.months > 0 && (
                <div className="frosted-glass px-6 py-4 min-w-[100px]">
                  <p
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: textColor }}
                  >
                    {countdown.months}
                  </p>
                  <p
                    className="text-xs uppercase tracking-wider mt-1 opacity-70"
                    style={{ color: textColor }}
                  >
                    {countdown.months === 1 ? "Month" : "Months"}
                  </p>
                </div>
              )}
              <div className="frosted-glass px-6 py-4 min-w-[100px]">
                <p
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: textColor }}
                >
                  {countdown.months > 0 ? countdown.days : countdown.totalDays}
                </p>
                <p
                  className="text-xs uppercase tracking-wider mt-1 opacity-70"
                  style={{ color: textColor }}
                >
                  {(countdown.months > 0 ? countdown.days : countdown.totalDays) === 1
                    ? "Day"
                    : "Days"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {ctaButton && (
          <Link
            href={ctaButton.href}
            className="inline-block mt-8 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: textColor,
              color: theme.primaryColor,
            }}
          >
            {ctaButton.label}
          </Link>
        )}

        {/* RSVP Button for home page */}
        {isHome && !ctaButton && (
          <Link
            href={`/${domain}/rsvp`}
            className="inline-block mt-10 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: textColor,
              color: theme.primaryColor,
            }}
          >
            RSVP Now
          </Link>
        )}
      </div>

      {/* Section navigation (home only) */}
      {showNavLinks && navLinks.length > 0 && (
        <nav className="relative z-10 mt-12" aria-label="Page sections">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm uppercase tracking-wider transition-colors hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1"
                  style={{
                    color: `${textColor}cc`,
                    fontFamily: "var(--wedding-font-body)",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          aria-hidden="true"
        >
          <ChevronDown
            className="w-6 h-6"
            style={{ color: `${textColor}66` }}
          />
        </div>
      )}
    </header>
  );
}
