// src/theme/colors.ts
export const COLOR_LIGHT = {
  brand: "#0078D4",
  brandAlt: "#005A9E",

  // --- Status colors ---
  success: "#2E7D32",
  successBg: "#E8F5E9",

  // === New: Aligned with Dashboard ===
  warn: "#DCAB00",
  warnBg: "#FFF2C8",
  red: "#BB2424",
  redBg: "#FFEBEB",
  subtleBlue: "#DEECF9",

  // --- Text colors ---
  ink: "#212121",
  text: "#212121", // For backward compatibility with old code using COLOR.text (= ink)

  // --- Others ---
  label: "#8FA7BF",
  bg: "#FFFFFF",
  card: "#F7FAFF",
  divider: "#E6E6E6",
  line: "#F0F0F0",

  //
  skeleton: "#ebe8e8ff",
};

// Default to light theme for backward compatibility
export const COLOR = COLOR_LIGHT;
