import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma, withTenantContext } from "@/lib/db/prisma";
import { DEFAULT_THEME } from "@/lib/content/theme-utils";
import type { ThemeSettings } from "@/lib/content/theme-utils";
import { ThemeEditor } from "./ThemeEditor";

export default async function ThemePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.tenantId) {
    redirect("/dashboard/no-tenant");
  }

  // Load wedding's current theme settings
  const data = await withTenantContext(session.user.tenantId, async () => {
    const wedding = await prisma.wedding.findFirst({
      select: {
        id: true,
        themeSettings: true,
      },
    });
    return { wedding };
  });

  if (!data.wedding) {
    redirect("/dashboard");
  }

  // Use stored theme or fall back to defaults
  const initialTheme: ThemeSettings =
    (data.wedding.themeSettings as ThemeSettings) || DEFAULT_THEME;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Theme Customization</h1>
        <p className="mt-1 text-gray-600">
          Customize the colors and fonts of your wedding website
        </p>
      </div>

      <ThemeEditor initialTheme={initialTheme} />
    </div>
  );
}
