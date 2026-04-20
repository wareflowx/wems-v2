import { useCallback, useEffect, useState } from "react";
import type * as React from "react";

import { cn } from "@/utils/tailwind";
import { Plus } from "lucide-react";

import { DEFAULT_COLOR, getColorHexFromClass, isPresetColor, PRESET_COLORS, type ColorOption } from "@/lib/colors";

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: ColorOption[];
  className?: string;
}

/**
 * ColorPicker - A reusable color selection component.
 *
 * Supports preset colors (Tailwind bg-{color}-500 classes) and custom HEX colors.
 * - Preset click: sets Tailwind class (e.g., "bg-emerald-500")
 * - Custom input: sets HEX value (e.g., "#10b981")
 */
function ColorPicker({ value, onChange, presets = PRESET_COLORS, className }: ColorPickerProps) {
  const [customHex, setCustomHex] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Determine if current value is a preset or custom
  const isCustomColor = value && !isPresetColor(value);

  // Sync custom hex input with external value changes
  useEffect(() => {
    if (isCustomColor) {
      setCustomHex(value);
    } else if (value && isPresetColor(value)) {
      // Extract hex from preset class for display
      const hex = getColorHexFromClass(value);
      setCustomHex(hex);
    }
  }, [value, isCustomColor]);

  // Handle preset color selection
  const handlePresetClick = useCallback(
    (preset: ColorOption) => {
      onChange(preset.value);
      setShowCustomInput(false);
    },
    [onChange]
  );

  // Handle custom hex input change
  const handleCustomHexChange = useCallback(
    (hex: string) => {
      setCustomHex(hex);
      // Validate and update on valid hex
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        onChange(hex);
      }
    },
    [onChange]
  );

  // Handle HTML5 color input change
  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value.toUpperCase();
      setCustomHex(hex);
      onChange(hex);
    },
    [onChange]
  );

  // Check if a preset is currently selected
  const isPresetSelected = useCallback(
    (preset: ColorOption) => {
      return value === preset.value;
    },
    [value]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Preset color swatches */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            className={cn(
              "h-8 w-8 rounded-md transition-all hover:scale-110",
              preset.value,
              isPresetSelected(preset)
                ? "ring-2 ring-gray-900 ring-offset-2 dark:ring-gray-50"
                : "ring-0"
            )}
            onClick={() => handlePresetClick(preset)}
            title={preset.name}
            type="button"
            aria-label={`Select ${preset.name} color`}
            aria-pressed={isPresetSelected(preset)}
          />
        ))}

        {/* Custom color toggle button */}
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/50 transition-all hover:scale-110",
            isCustomColor && !showCustomInput ? "ring-2 ring-gray-900 ring-offset-2 dark:ring-gray-50" : ""
          )}
          onClick={() => setShowCustomInput(!showCustomInput)}
          title="Custom color"
          type="button"
          aria-label="Toggle custom color picker"
          aria-pressed={showCustomInput || isCustomColor}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Custom color input section */}
      {(showCustomInput || isCustomColor) && (
        <div className="flex items-center gap-2">
          {/* HTML5 color input */}
          <div className="relative">
            <input
              type="color"
              value={customHex || "#000000"}
              onChange={handleColorInputChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Color picker"
            />
            <div
              className="h-8 w-8 rounded-md border border-border cursor-pointer"
              style={{ backgroundColor: customHex || "#000000" }}
            />
          </div>

          {/* Hex text input */}
          <input
            type="text"
            value={customHex}
            onChange={(e) => handleCustomHexChange(e.target.value)}
            placeholder="#000000"
            maxLength={7}
            className="h-8 w-24 rounded-md border border-input bg-background px-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* Quick preset label */}
          {isCustomColor && (
            <span className="text-xs text-muted-foreground">Custom</span>
          )}
        </div>
      )}
    </div>
  );
}

export { ColorPicker };
