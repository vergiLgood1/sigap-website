/**
 * This utility generates unique colors for crime categories
 * and ensures that they remain consistent across renders.
 */

// Color cache to ensure consistent colors for the same category
const colorCache: Record<string, string> = {};

// HSL to hex conversion utility
const hslToHex = (h: number, s: number, l: number): string => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Golden ratio approximation for color spacing
const GOLDEN_RATIO = 0.618033988749895;

/**
 * Generates a visually distinct color for a category.
 * Uses the HSL color space to ensure good distribution and saturation.
 *
 * @param category The name of the category to generate color for
 * @param seed Optional random seed for deterministic results
 * @returns Hex color code
 */
export const getCategoryColor = (category: string, seed = 0.5): string => {
  // Return cached color if exists
  if (colorCache[category]) {
    return colorCache[category];
  }

  // Generate a hash from the string
  const hash = category.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Use the hash to deterministically generate a hue value
  let hue = (hash * GOLDEN_RATIO + seed) % 1;
  hue = Math.floor(hue * 360);

  // Use high saturation and medium lightness for vibrant but not too bright colors
  const saturation = 0.7 + (hash % 30) / 100; // 0.7-0.99
  const lightness = 0.5 + (hash % 20) / 100; // 0.5-0.69

  // Convert to hex and cache
  const color = hslToHex(hue, saturation, lightness);
  colorCache[category] = color;

  return color;
};

/**
 * Pre-generates colors for a list of categories.
 * Useful for ensuring colors are as distinct as possible across many categories.
 *
 * @param categories List of category names
 * @returns Object mapping category names to colors
 */
export const generateCategoryColorMap = (
  categories: string[]
): Record<string, string> => {
  const colorMap: Record<string, string> = {};

  // For maximum distinctiveness, space the hues evenly around the color wheel
  const increment = 1 / categories.length;

  categories.forEach((category, index) => {
    const hue = (index * increment) % 1;
    const saturation = 0.7 + ((index * 13) % 30) / 100;
    const lightness = 0.5 + ((index * 11) % 20) / 100;

    const color = hslToHex(hue * 360, saturation, lightness);
    colorMap[category] = color;
    colorCache[category] = color; // Also cache it
  });

  return colorMap;
};
