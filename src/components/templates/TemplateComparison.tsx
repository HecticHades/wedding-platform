"use client";

import { useState, useRef, useEffect } from "react";
import { X, Monitor, Tablet, Smartphone, Link2, Link2Off, ChevronLeft, ChevronRight } from "lucide-react";
import type { Template } from "@/lib/content/templates";
import { TemplateFullPreview } from "./TemplateFullPreview";

interface TemplateComparisonProps {
  templates: [Template, Template];
  allTemplates: Template[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  onSwap: (index: 0 | 1, templateId: string) => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceConfig = {
  desktop: { width: "100%", maxWidth: "none", icon: Monitor },
  tablet: { width: "768px", maxWidth: "768px", icon: Tablet },
  mobile: { width: "375px", maxWidth: "375px", icon: Smartphone },
};

export function TemplateComparison({
  templates,
  allTemplates,
  isOpen,
  onClose,
  onSelect,
  onSwap,
}: TemplateComparisonProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [syncScroll, setSyncScroll] = useState(true);
  const [mobileIndex, setMobileIndex] = useState(0);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Sync scroll between panels
  useEffect(() => {
    if (!syncScroll) return;

    const handleScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
      if (!source || !target) return;
      const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
      target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
    };

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;

    let isScrolling = false;

    const onLeftScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      handleScroll(leftEl, rightEl);
      requestAnimationFrame(() => { isScrolling = false; });
    };

    const onRightScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      handleScroll(rightEl, leftEl);
      requestAnimationFrame(() => { isScrolling = false; });
    };

    leftEl?.addEventListener("scroll", onLeftScroll);
    rightEl?.addEventListener("scroll", onRightScroll);

    return () => {
      leftEl?.removeEventListener("scroll", onLeftScroll);
      rightEl?.removeEventListener("scroll", onRightScroll);
    };
  }, [syncScroll]);

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

  const [template1, template2] = templates;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Compare Templates</h2>

        {/* Device switcher */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-lg">
            {(Object.keys(deviceConfig) as DeviceType[]).map((d) => {
              const config = deviceConfig[d];
              const Icon = config.icon;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`
                    p-2 rounded-md transition-colors
                    ${device === d
                      ? "bg-violet-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-600"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Sync scroll toggle */}
          <button
            onClick={() => setSyncScroll(!syncScroll)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${syncScroll
                ? "bg-violet-600 text-white"
                : "bg-slate-700 text-slate-300 hover:text-white"
              }
            `}
          >
            {syncScroll ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
            Sync Scroll
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop/Tablet: Split view */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
            <h3 className="font-medium text-white">{template1.name}</h3>
            <button
              onClick={() => onSelect(template1.id)}
              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Select This One
            </button>
          </div>
          <div
            ref={leftRef}
            className="flex-1 overflow-auto bg-white flex justify-center"
          >
            <div
              style={{
                width: deviceConfig[device].width,
                maxWidth: deviceConfig[device].maxWidth,
              }}
            >
              <TemplateFullPreview theme={template1.theme} />
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="w-12 bg-slate-800 flex items-center justify-center">
          <span className="text-slate-400 text-xs font-bold -rotate-90">VS</span>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
            <h3 className="font-medium text-white">{template2.name}</h3>
            <button
              onClick={() => onSelect(template2.id)}
              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Select This One
            </button>
          </div>
          <div
            ref={rightRef}
            className="flex-1 overflow-auto bg-white flex justify-center"
          >
            <div
              style={{
                width: deviceConfig[device].width,
                maxWidth: deviceConfig[device].maxWidth,
              }}
            >
              <TemplateFullPreview theme={template2.theme} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Swipeable cards */}
      <div className="md:hidden flex-1 flex flex-col">
        {/* Template name header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
          <button
            onClick={() => setMobileIndex(0)}
            disabled={mobileIndex === 0}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h3 className="font-medium text-white">
              {mobileIndex === 0 ? template1.name : template2.name}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${mobileIndex === 0 ? "bg-violet-500" : "bg-slate-600"}`} />
              <div className={`w-2 h-2 rounded-full ${mobileIndex === 1 ? "bg-violet-500" : "bg-slate-600"}`} />
            </div>
          </div>
          <button
            onClick={() => setMobileIndex(1)}
            disabled={mobileIndex === 1}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-white">
          <TemplateFullPreview theme={mobileIndex === 0 ? template1.theme : template2.theme} />
        </div>

        {/* Select button */}
        <div className="p-4 bg-slate-800">
          <button
            onClick={() => onSelect(mobileIndex === 0 ? template1.id : template2.id)}
            className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            Select {mobileIndex === 0 ? template1.name : template2.name}
          </button>
        </div>
      </div>
    </div>
  );
}
