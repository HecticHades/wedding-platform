"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TenantStickyNavProps {
  partner1Name: string;
  partner2Name: string;
  primaryColor: string;
  domain: string;
  navLinks?: Array<{ href: string; label: string }>;
}

/**
 * Sticky navigation bar that appears after scrolling past 60% viewport.
 * Shows couple names and navigation links using the wedding theme colors.
 */
export function TenantStickyNav({
  partner1Name,
  partner2Name,
  primaryColor,
  domain,
  navLinks = [],
}: TenantStickyNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past 60% of viewport height
      const threshold = window.innerHeight * 0.6;
      setIsVisible(window.scrollY > threshold);
    };

    // Intersection Observer for scroll spy
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    // Observe all sections
    navLinks.forEach((link) => {
      const section = document.querySelector(link.href);
      if (section) {
        observer.observe(section);
      }
    });

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [navLinks]);

  // Calculate contrasting text color
  const textColor = getContrastColor(primaryColor);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
      style={{ backgroundColor: primaryColor }}
      aria-label="Wedding site navigation"
      aria-hidden={!isVisible}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Couple names */}
          <Link
            href={`/${domain}`}
            className="font-semibold text-sm"
            style={{
              color: textColor,
              fontFamily: "var(--wedding-font-heading)",
            }}
          >
            {partner1Name} & {partner2Name}
          </Link>

          {/* Nav links */}
          {navLinks.length > 0 && (
            <ul className="hidden sm:flex items-center gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`
                      text-xs uppercase tracking-wider transition-opacity
                      ${activeSection === link.href ? "opacity-100" : "opacity-70 hover:opacity-100"}
                    `}
                    style={{
                      color: textColor,
                      fontFamily: "var(--wedding-font-body)",
                    }}
                    aria-current={activeSection === link.href ? "true" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* RSVP Button */}
          <Link
            href={`/${domain}/rsvp`}
            className="text-xs font-medium px-4 py-1.5 rounded-full transition-transform hover:scale-105"
            style={{
              backgroundColor: textColor,
              color: primaryColor,
            }}
          >
            RSVP
          </Link>
        </div>
      </div>
    </nav>
  );
}

/**
 * Calculate whether to use white or dark text based on background luminance.
 * Returns white for dark backgrounds, dark text for light backgrounds.
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance (formula from WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
