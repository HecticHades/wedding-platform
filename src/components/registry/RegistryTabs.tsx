import Link from "next/link";
import { Gift, ExternalLink, Settings } from "lucide-react";

type TabId = "gifts" | "external" | "settings";

interface RegistryTabsProps {
  activeTab: TabId;
}

const tabs: { id: TabId; label: string; href: string; icon: typeof Gift }[] = [
  { id: "gifts", label: "Gifts", href: "/dashboard/registry", icon: Gift },
  {
    id: "external",
    label: "External Registries",
    href: "/dashboard/registry/external",
    icon: ExternalLink,
  },
  {
    id: "settings",
    label: "Payment Settings",
    href: "/dashboard/registry/settings",
    icon: Settings,
  },
];

/**
 * Navigation tabs for registry pages
 */
export function RegistryTabs({ activeTab }: RegistryTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex gap-x-8" aria-label="Registry navigation">
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
