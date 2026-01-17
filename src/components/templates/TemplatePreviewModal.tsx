"use client";

import { useState, useEffect } from "react";
import { X, Monitor, Tablet, Smartphone, ChevronDown } from "lucide-react";
import type { Template } from "@/lib/content/templates";
import { TemplateFullPreview } from "./TemplateFullPreview";

interface TemplatePreviewModalProps {
  template: Template;
  templates: Template[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  onTemplateChange: (templateId: string) => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceConfig = {
  desktop: { width: "100%", height: "100%", icon: Monitor, label: "Desktop" },
  tablet: { width: "768px", height: "1024px", icon: Tablet, label: "Tablet" },
  mobile: { width: "375px", height: "812px", icon: Smartphone, label: "Mobile" },
};

export function TemplatePreviewModal({
  template,
  templates,
  isOpen,
  onClose,
  onSelect,
  onTemplateChange,
}: TemplatePreviewModalProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [partner1, setPartner1] = useState("Emma");
  const [partner2, setPartner2] = useState("James");
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          {/* Template selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              {template.name}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onTemplateChange(t.id);
                        setShowDropdown(false);
                      }}
                      className={`
                        w-full px-4 py-2 text-left text-sm transition-colors
                        ${t.id === template.id
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Personalization inputs */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
            <input
              type="text"
              value={partner1}
              onChange={(e) => setPartner1(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Partner 1"
            />
            <span className="text-slate-400">&</span>
            <input
              type="text"
              value={partner2}
              onChange={(e) => setPartner2(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Partner 2"
            />
          </div>
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-lg">
          {(Object.keys(deviceConfig) as DeviceType[]).map((d) => {
            const config = deviceConfig[d];
            const Icon = config.icon;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${device === d
                    ? "bg-violet-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-600"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelect(template.id)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Use This Template
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          className={`
            bg-white overflow-auto shadow-2xl transition-all duration-300
            ${device === "desktop" ? "w-full h-full" : "rounded-3xl"}
          `}
          style={{
            width: device === "desktop" ? "100%" : deviceConfig[device].width,
            height: device === "desktop" ? "100%" : deviceConfig[device].height,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Device frame for non-desktop */}
          {device !== "desktop" && (
            <div className="h-6 bg-slate-100 flex items-center justify-center">
              <div className="w-20 h-1 bg-slate-300 rounded-full" />
            </div>
          )}

          {/* Content */}
          <div className={device !== "desktop" ? "h-[calc(100%-1.5rem)] overflow-auto" : "h-full overflow-auto"}>
            <TemplateFullPreview
              theme={template.theme}
              partner1Name={partner1}
              partner2Name={partner2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
