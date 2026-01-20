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
  const daysUntil = weddingDate ? getDaysUntilWedding(weddingDate) : 0;

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
        <div className="absolute inset-0" style={overlayStyle} />
      )}

      {/* Decorative pattern overlay (only when no hero image) */}
      {!hasHeroImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Content - white text on colored/image background */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Page title for subpages */}
        {!isHome && pageTitle && (
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ color: "#ffffff" }}
          >
            {pageTitle}
          </p>
        )}

        {/* Tagline for home */}
        {isHome && (
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ color: "#ffffff" }}
          >
            We&apos;re getting married!
          </p>
        )}

        {/* Partner names */}
        <h1
          className={`font-bold ${isHome ? "text-5xl md:text-7xl mb-6" : "text-4xl md:text-5xl mb-4"}`}
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "#ffffff",
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
          <p className="text-white/80 mt-2">{pageSubtitle}</p>
        )}

        {/* Wedding date with decorative lines */}
        {weddingDate && (
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px w-16 bg-white/40" />
            <p
              className={`font-light ${isHome ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}
              style={{ color: "#ffffff" }}
            >
              {formatWeddingDate(weddingDate)}
            </p>
            <div className="h-px w-16 bg-white/40" />
          </div>
        )}

        {/* Countdown (home only by default) */}
        {showCountdown && daysUntil > 0 && (
          <div className="mt-8">
            <p
              className="text-sm uppercase tracking-wider opacity-70 mb-2"
              style={{ color: "#ffffff" }}
            >
              Days Until We Say &quot;I Do&quot;
            </p>
            <p className="text-6xl font-bold" style={{ color: "#ffffff" }}>
              {daysUntil}
            </p>
          </div>
        )}

        {/* CTA Button */}
        {ctaButton && (
          <Link
            href={ctaButton.href}
            className="inline-block mt-8 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              backgroundColor: "#ffffff",
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
            className="inline-block mt-10 px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              backgroundColor: "#ffffff",
              color: theme.primaryColor,
            }}
          >
            RSVP Now
          </Link>
        )}
      </div>

      {/* Section navigation (home only) */}
      {showNavLinks && navLinks.length > 0 && (
        <nav className="relative z-10 mt-12">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm uppercase tracking-wider transition-colors hover:opacity-100"
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/40" />
        </div>
      )}
    </header>
  );
}
