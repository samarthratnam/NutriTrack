/**
 * Theme constants shared across the full frontend.
 *
 * What this file provides:
 * - A single source of truth for the required color palette.
 * - Reusable inline-style objects for common UI elements.
 * - Chart color arrays to keep visualization styling consistent.
 *
 * Why this exists:
 * - Centralizing design tokens avoids drift across many components.
 * - It makes future brand updates safer and faster.
 * - It supports the "all inline styles" requirement without duplication.
 */
export const C = {
  orange: "#FF4D1A",
  peach: "#EDAC6A",
  peachMid: "#F2C48D",
  peachFaint: "#F9E4C4",
  cream: "#F5EDD0",
  creamLight: "#FFFBF0",
  sage: "#A8C9A0",
  sageDark: "#6FA96A",
  sageFaint: "#D6EBCF",
  ink: "#2C1505",
  inkMid: "#7A4520",
  inkLight: "#B07040",
  border: "#EDAC6A66",
};

/**
 * Fixed palette order for nutrient donut charts.
 * The order intentionally starts with orange/peach to emphasize energy-heavy nutrients first.
 */
export const NUTRIENT_COLORS = [
  C.orange,
  C.peach,
  C.sage,
  C.sageDark,
  C.peachMid,
  "#c0785a",
  "#8FC985",
];

/**
 * Shared input field style.
 * Kept as a base object so components can spread and override size/alignment as needed.
 */
export const inputStyle = {
  background: C.creamLight,
  border: `1.5px solid ${C.peachMid}`,
  color: C.ink,
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color .2s, box-shadow .2s",
};

/**
 * Shared content card style used for result panels.
 * Works for both dashboard cards and section cards.
 */
export const cardStyle = {
  background: C.creamLight,
  border: `1.5px solid ${C.border}`,
  borderRadius: 20,
  padding: "clamp(1.2rem, 2.5vw, 2rem)",
  boxShadow: `0 6px 32px #EDAC6A18`,
};

/**
 * Shared card title style for major card headers.
 */
export const cardTitle = {
  fontFamily: "'Playfair Display', serif",
  color: C.ink,
  fontSize: 20,
  fontWeight: 800,
  margin: 0,
};

/**
 * Simple utility helper to clamp progress-bar percentages safely.
 */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
