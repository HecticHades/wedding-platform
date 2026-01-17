import Link from "next/link";
import { Camera, Upload, Shield, Settings } from "lucide-react";

type TabId = "overview" | "upload" | "moderation" | "settings";

interface PhotoTabsProps {
  activeTab: TabId;
}

const tabs: { id: TabId; label: string; href: string; icon: typeof Camera }[] = [
  { id: "overview", label: "Overview", href: "/dashboard/photos", icon: Camera },
  { id: "upload", label: "Upload", href: "/dashboard/photos/upload", icon: Upload },
  {
    id: "moderation",
    label: "Moderation",
    href: "/dashboard/photos/moderation",
    icon: Shield,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/photos/settings",
    icon: Settings,
  },
];

/**
 * Navigation tabs for photo dashboard pages
 */
export function PhotoTabs({ activeTab }: PhotoTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex gap-x-8" aria-label="Photo navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium
                ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
