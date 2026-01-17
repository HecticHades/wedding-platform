import Link from "next/link";
import { Plus } from "lucide-react";

interface QuickAction {
  label: string;
  href?: string;
  icon: typeof Plus;
  variant: "primary" | "secondary";
  onClick?: () => void;
}

const defaultActions: QuickAction[] = [
  {
    label: "Create Wedding",
    href: "/admin/weddings/new",
    icon: Plus,
    variant: "primary",
  },
];

interface QuickActionsPanelProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsPanel({
  actions = defaultActions,
  className = "",
}: QuickActionsPanelProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const baseClasses =
            "flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors";
          const variantClasses =
            action.variant === "primary"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200";

          if (action.href) {
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`${baseClasses} ${variantClasses}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          }

          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`${baseClasses} ${variantClasses}`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
