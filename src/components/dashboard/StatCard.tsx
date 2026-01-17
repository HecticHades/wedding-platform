import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: "primary" | "secondary" | "gold";
  className?: string;
}

const accentColors = {
  primary: {
    bg: "bg-[#c4a4a4]/10",
    text: "text-[#c4a4a4]",
    icon: "bg-[#c4a4a4]/20",
  },
  secondary: {
    bg: "bg-[#9caa9c]/10",
    text: "text-[#9caa9c]",
    icon: "bg-[#9caa9c]/20",
  },
  gold: {
    bg: "bg-[#c9a962]/10",
    text: "text-[#c9a962]",
    icon: "bg-[#c9a962]/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
  className = "",
}: StatCardProps) {
  const colors = accentColors[accent];

  return (
    <div
      className={`
        bg-white rounded-xl border border-[#e8e4e0] p-5
        shadow-bento hover:shadow-bento-hover transition-shadow
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#3d3936]/60">{title}</p>
          <p
            className={`mt-2 text-3xl font-semibold font-cormorant ${colors.text}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-[#3d3936]/60">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colors.icon}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
        )}
      </div>
    </div>
  );
}
