import Link from "next/link";
import { LucideIcon, UserPlus, Send, Camera, ClipboardList } from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "gold" | "neutral";
}

const defaultActions: QuickAction[] = [
  {
    label: "Add Guests",
    href: "/dashboard/guests",
    icon: UserPlus,
    color: "primary",
  },
  {
    label: "Send Invites",
    href: "/dashboard/messaging",
    icon: Send,
    color: "secondary",
  },
  {
    label: "Add Photos",
    href: "/dashboard/photos",
    icon: Camera,
    color: "gold",
  },
  {
    label: "View RSVPs",
    href: "/dashboard/rsvp",
    icon: ClipboardList,
    color: "neutral",
  },
];

const colorClasses = {
  primary: {
    bg: "bg-[#c4a4a4]/10 hover:bg-[#c4a4a4]/20",
    icon: "text-[#c4a4a4]",
  },
  secondary: {
    bg: "bg-[#9caa9c]/10 hover:bg-[#9caa9c]/20",
    icon: "text-[#9caa9c]",
  },
  gold: {
    bg: "bg-[#c9a962]/10 hover:bg-[#c9a962]/20",
    icon: "text-[#c9a962]",
  },
  neutral: {
    bg: "bg-[#e8e4e0]/50 hover:bg-[#e8e4e0]",
    icon: "text-[#3d3936]/70",
  },
};

interface QuickActionsCardProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsCard({
  actions = defaultActions,
  className = "",
}: QuickActionsCardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-[#e8e4e0] p-5
        shadow-bento
        ${className}
      `}
    >
      <h3 className="font-semibold text-[#3d3936] mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color];

          return (
            <Link
              key={action.href}
              href={action.href}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg
                transition-colors
                ${colors.bg}
              `}
            >
              <Icon className={`h-5 w-5 ${colors.icon}`} />
              <span className="text-sm font-medium text-[#3d3936]">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
