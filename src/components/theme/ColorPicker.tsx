"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

/**
 * ColorPicker component using react-colorful with popover pattern.
 * Shows a color swatch that opens a picker on click with debounced updates.
 */
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const popoverRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Debounced onChange handler
  const handleColorChange = useCallback(
    (color: string) => {
      setInputValue(color);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(color);
      }, 100);
    },
    [onChange]
  );

  // Handle direct hex input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Ensure it starts with #
    if (!newValue.startsWith("#")) {
      newValue = "#" + newValue;
    }

    setInputValue(newValue);

    // Only call onChange if valid hex color
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newValue)) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
            style={{ backgroundColor: value }}
            aria-label={`Select ${label}`}
          />
          {isOpen && (
            <div className="absolute z-50 top-12 left-0 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
              <HexColorPicker color={value} onChange={handleColorChange} />
            </div>
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}
