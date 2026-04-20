/**
 * Centralized color palette for the WEMS application.
 * Preset colors are Tailwind CSS classes stored in the database,
 * while custom colors are stored as HEX values.
 */

export interface ColorOption {
  name: string;
  value: string; // Tailwind class like "bg-red-500" or HEX like "#ef4444"
  hex: string; // Actual hex value for rendering
}

/**
 * 17 preset colors following the rainbow spectrum from Red to Rose.
 * Each color maps to a Tailwind bg-{color}-500 class.
 */
export const PRESET_COLORS: ColorOption[] = [
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
  { name: "Amber", value: "bg-amber-500", hex: "#f59e0b" },
  { name: "Yellow", value: "bg-yellow-500", hex: "#eab308" },
  { name: "Lime", value: "bg-lime-500", hex: "#84cc16" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Emerald", value: "bg-emerald-500", hex: "#10b981" },
  { name: "Teal", value: "bg-teal-500", hex: "#14b8a6" },
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Sky", value: "bg-sky-500", hex: "#0ea5e9" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Violet", value: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Purple", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Fuchsia", value: "bg-fuchsia-500", hex: "#d946ef" },
  { name: "Pink", value: "bg-pink-500", hex: "#ec4899" },
  { name: "Rose", value: "bg-rose-500", hex: "#f43f5e" },
];

/** Default color used when creating new items */
export const DEFAULT_COLOR = PRESET_COLORS[0].value;

/**
 * Check if a color value is a preset (Tailwind class) or custom (HEX)
 */
export function isPresetColor(color: string): boolean {
  return color.startsWith("bg-");
}

/**
 * Get the CSS properties for rendering a color.
 * Works with both preset Tailwind classes and custom HEX values.
 */
export function getColorStyle(color: string): React.CSSProperties {
  if (isPresetColor(color)) {
    // For preset colors, we return the class name in a way that can be applied
    // The actual styling is done via className in components
    return { backgroundColor: getColorHexFromClass(color) };
  }
  // For custom colors (HEX values)
  return { backgroundColor: color };
}

/**
 * Extract HEX value from a Tailwind bg class
 */
export function getColorHexFromClass(className: string): string {
  const preset = PRESET_COLORS.find((c) => c.value === className);
  return preset?.hex || "#6b7280"; // Default to gray if not found
}

/**
 * Get the preset color option from a color value
 */
export function getPresetColor(color: string): ColorOption | undefined {
  return PRESET_COLORS.find((c) => c.value === color);
}
