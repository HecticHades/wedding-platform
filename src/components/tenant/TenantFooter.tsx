import type { ThemeSettings } from "@/lib/content/theme-utils";
import { formatWeddingDate } from "@/lib/content/theme-utils";

interface TenantFooterProps {
  theme: ThemeSettings;
  partner1Name: string;
  partner2Name: string;
  weddingDate?: Date | null;
}

/**
 * Consistent footer for tenant pages.
 * Primary color background with couple names and wedding date.
 */
export function TenantFooter({
  theme,
  partner1Name,
  partner2Name,
  weddingDate,
}: TenantFooterProps) {
  return (
    <footer
      className="py-12 px-4 text-center"
      style={{ backgroundColor: theme.primaryColor }}
    >
      <div className="max-w-2xl mx-auto">
        <h3
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{
            fontFamily: "var(--wedding-font-heading)",
            color: "#ffffff",
          }}
        >
          {partner1Name} & {partner2Name}
        </h3>

        {weddingDate && (
          <p className="text-white/80 mb-6">{formatWeddingDate(weddingDate)}</p>
        )}

        <p className="text-white/60 text-sm">
          We can&apos;t wait to celebrate with you!
        </p>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/50 text-xs">
            Made with love using Wedding Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
