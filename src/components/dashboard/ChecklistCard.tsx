"use client";

import { Check, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

interface ChecklistCardProps {
  items: ChecklistItem[];
  className?: string;
}

export function ChecklistCard({ items, className = "" }: ChecklistCardProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div
      className={`
        bg-white rounded-xl border border-[#e8e4e0] p-5
        shadow-bento
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3d3936]">Setup Checklist</h3>
        <span className="text-sm text-[#3d3936]/60">
          {completedCount} of {items.length} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#e8e4e0] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#9caa9c] to-[#c9a962] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`
                flex items-center justify-between p-3 rounded-lg
                transition-colors group
                ${
                  item.completed
                    ? "bg-[#9caa9c]/10"
                    : "hover:bg-[#e8e4e0]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <div className="w-5 h-5 rounded-full bg-[#9caa9c] flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-[#e8e4e0]" />
                )}
                <span
                  className={`text-sm ${
                    item.completed
                      ? "text-[#3d3936]/60 line-through"
                      : "text-[#3d3936]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <ArrowRight className="h-4 w-4 text-[#3d3936]/40 group-hover:text-[#c4a4a4] transition-colors" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
